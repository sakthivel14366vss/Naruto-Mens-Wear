import formatter from '$lib/utils/formatter.js';
import { getDb } from '$lib/utils/mongodb';
import parser from '$lib/utils/parser.js';
import { responseInvalid } from '$lib/utils/response.js';
import {
	getAmountSummary,
	getOutStanding,
	getStockSummary,
	reCalculateItem
} from './calculation.js';

export async function load({ depends }) {
	depends('bill');
	const db = await getDb();
	const stockCollection = db.collection('stock');
	const billCollection = db.collection('bill');
	const outStandingCollection = db.collection('outstanding');

	const stocks = await stockCollection.find({}).toArray();
	const bills = await billCollection.find({}).toArray();
	const outstandings = await outStandingCollection.find({}).toArray();
	const response = { stocks, bills, outstandings };
	return JSON.parse(JSON.stringify(response));
}

export const actions = {
	save: async function ({ request }) {
		// 1. Preparing DB
		const db = await getDb();
		const stockCollection = db.collection('stock');
		const billCollection = db.collection('bill');
		const paymentCollection = db.collection('payment');
		const outStandingCollection = db.collection('outstanding');

		// 2. Preparing Data
		const formData = await request.formData();
		const _id = parser.id(formData.get('_id'));
		let data = JSON.parse(formData.get('data') || '{}');
		data = reCalculateItem(data);
		data = formatter.normalizeNumbers(data);
		const stockSummary = getStockSummary(data.purchaseCart, data.returnCart);
		const outStanding = getOutStanding(
			data.ledger.advanceAmount,
			data.ledger.balanceAmount,
			data.ledger.payments
		);

		// 3. Validating Data
		if (data.metadata.customer.name && !/^\d{10}$/.test(data.metadata.customer.phone))
			return responseInvalid('Phone number is wrong OR missing');
		if (data.ledger.pendingAmount !== 0) return responseInvalid('Pending Amount must be 0');
		let isCreditExist = data.ledger.payments.find((p) => p.paymentMode === 'Credit');
		if (isCreditExist && !data.metadata.customer.name)
			return responseInvalid('Credit payment need Customer name');

		// 4. DB Operations
		// Save bill
		await billCollection.insertOne({ ...data, createdAt: new Date() });
		// 4.1 Updating Stock Details
		const bulkOps = Object.entries(stockSummary).map(([barcode, qtyChange]) => ({
			updateOne: {
				filter: { barcode: barcode },
				update: { $inc: { count: qtyChange } }
			}
		}));
		await stockCollection.bulkWrite(bulkOps, { ordered: false });

		// 4.2 Updating Outstanding against customer name
		await outStandingCollection.updateOne(
			{ name: data.metadata.customer.name },
			{
				$set: {
					name: data.metadata.customer.name,
					phone: data.metadata.customer.phone,
					savedAt: new Date()
				},
				$inc: {
					amount: outStanding
				}
			},
			{ upsert: true }
		);

		// 4.3 Updating payment Details
		if (_id) {
			await paymentCollection.deleteMany({ referenceBillId: _id });
		}
		if (Array.isArray(data.ledger.payments) && data.ledger.payments.length > 0) {
			const paymentsToInsert = data.ledger.payments.map((p) => ({
				...p,
				referenceBillId: _id,
				savedAt: new Date()
			}));
			await paymentCollection.insertMany(paymentsToInsert);
		}
	}
};
