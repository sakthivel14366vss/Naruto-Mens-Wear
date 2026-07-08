// src/routes/bill/+page.server.js
import { getDateFilter } from '$lib/utils/dateFilter.js';
import { formatDateTime } from '$lib/utils/dateTime.js';
import formatter from '$lib/utils/formatter.js';
import { getDb } from '$lib/utils/mongodb';
import parser from '$lib/utils/parser.js';
import { responseInvalid, responseSuccess } from '$lib/utils/response.js';
import { reCalculateItem, getStockDeltaSummary, getBillCreditContribution } from './calculation.js';

function generateBillNo(countOfDay) {
	return `BL${formatDateTime('YYMMDD')}${(countOfDay + 1).toString().padStart(2, '0')}`;
}

export async function load({ depends, url }) {
	depends('bill');
	let fromDate = url.searchParams.get('fromDate');
	let toDate = url.searchParams.get('toDate');

	const db = await getDb();
	const stockCollection = db.collection('stock');
	const billCollection = db.collection('bill');
	const outStandingCollection = db.collection('outstanding');

	const stocks = await stockCollection.find({}).toArray();
	const bills = await billCollection.find({ ...getDateFilter(fromDate, toDate) }).toArray();
	const outstandings = await outStandingCollection.find({}).toArray();

	return JSON.parse(JSON.stringify({ stocks, bills, outstandings }));
}

export const actions = {
	findBill: async function ({ request }) {
		const db = await getDb();
		const billCollection = db.collection('bill');
		const formData = await request.formData();
		const billNo = formData.get('barcode');

		const bill = await billCollection.findOne({ 'metadata.billNo': billNo });
		return JSON.parse(JSON.stringify(bill));
	},
	save: async function ({ request }) {
		const db = await getDb();
		const billCollection = db.collection('bill');

		const formData = await request.formData();
		const _id = parser.id(formData.get('_id'));
		let data = JSON.parse(formData.get('data') || '{}');

		// 1. Recalculate financial mechanics safely
		data = reCalculateItem(data);
		data = formatter.normalizeNumbers(data);

		// 2. Resolve Sequence Identifiers for NEW bills
		if (!_id) {
			const todayStr = formatDateTime('YYYY-MM-DD'); // Match your system's date function footprint
			const countOfDay = await billCollection.countDocuments({ 'metadata.createdDate': todayStr });
			data.metadata.dailySequenceCount = countOfDay + 1;
			data.metadata.billNo = generateBillNo(countOfDay);
			data.metadata.createdDate = todayStr;
		}

		// 3. Validation Validations
		if (data.metadata.customer?.name && !/^\d{10}$/.test(data.metadata.customer.phone)) {
			return responseInvalid('Phone number must be a valid 10-digit string');
		}
		if (data.ledger.pendingAmount !== 0) {
			return responseInvalid('Pending Amount must balance to 0');
		}
		const hasCreditPayment = data.ledger.payments?.some((p) => p.paymentMode === 'Credit');
		if (hasCreditPayment && !data.metadata.customer?.name) {
			return responseInvalid('Customer Name is required for Credit Line payments');
		}

		// 4. Track Delta Changes safely by grabbing Snapshot before modifying database
		let oldBill = null;
		let targetId = _id;

		if (_id) {
			oldBill = await billCollection.findOne({ _id });
			const { _id: _, ...dataWithoutId } = data;
			await billCollection.updateOne(
				{ _id },
				{ $set: { ...dataWithoutId, createdAt: new Date(data.createdAt), updatedAt: new Date() } }
			);
		} else {
			const result = await billCollection.insertOne({ ...data, createdAt: new Date() });
			targetId = result.insertedId;
		}

		const newBill = await billCollection.findOne({ _id: targetId });

		// 5. Execute downstream inventory and balance registers
		await processBillInventoryAndLedgers(db, oldBill, newBill);

		// 6. Update Referer bill
		if (data.metadata?.referenceBill) {
			await updateReferByBill({
				currentBilNo: data.metadata.billNo,
				refererBillNo: data.metadata.referenceBill
			});
		}

		return responseSuccess('Bill Saved', JSON.parse(JSON.stringify(newBill)));
	}
};

async function processBillInventoryAndLedgers(db, oldBill, newBill) {
	const stockCollection = db.collection('stock');
	const outStandingCollection = db.collection('outstanding');
	const paymentCollection = db.collection('payment');

	// --- 1. STOCK INVENTORY DELTA PROCESSING ---
	const stockDelta = getStockDeltaSummary(oldBill, newBill);
	const bulkOps = Object.entries(stockDelta)
		.map(([barcode, qtyChange]) => {
			if (qtyChange === 0) return null;
			return {
				updateOne: {
					filter: { barcode: barcode },
					update: { $inc: { count: qtyChange } }
				}
			};
		})
		.filter(Boolean);

	if (bulkOps.length > 0) {
		await stockCollection.bulkWrite(bulkOps, { ordered: false });
	}

	// --- 2. CUSTOMER OUTSTANDING DELTA PROCESSING ---
	const oldCreditImpact = getBillCreditContribution(oldBill);
	const newCreditImpact = getBillCreditContribution(newBill);
	const outstandingDelta = newCreditImpact - oldCreditImpact;

	const targetedCustomerName = newBill.metadata.customer?.name || oldBill?.metadata.customer?.name;
	const targetedCustomerPhone =
		newBill.metadata.customer?.phone || oldBill?.metadata.customer?.phone;

	if (targetedCustomerName) {
		await outStandingCollection.updateOne(
			{ name: targetedCustomerName },
			{
				$set: {
					name: targetedCustomerName,
					phone: targetedCustomerPhone,
					savedAt: new Date()
				},
				$inc: {
					amount: outstandingDelta
				}
			},
			{ upsert: true }
		);
	}

	// --- 3. AUDIT PAYMENTS MANAGEMENT ---
	// Delete any old transactions entries linked to this bill ID
	await paymentCollection.deleteMany({ referenceBillId: newBill._id });

	// Populate fresh transactional references
	if (Array.isArray(newBill.ledger?.payments) && newBill.ledger.payments.length > 0) {
		const paymentsToInsert = newBill.ledger.payments.map((p) => ({
			referenceBillId: newBill._id,
			referenceBillNo: newBill.metadata.billNo,
			...p,
			savedAt: new Date()
		}));
		await paymentCollection.insertMany(paymentsToInsert);
	}
}

async function updateReferByBill({ currentBilNo, refererBillNo }) {
	const db = await getDb();
	const billCollection = db.collection('bill');
	await billCollection.updateOne(
		// 1. Find the original bill by its actual bill number field
		{ 'metadata.billNo': refererBillNo },
		// 2. Set the new bill number that was generated from it
		{ $set: { 'metadata.referByBill': currentBilNo } }
	);
}
