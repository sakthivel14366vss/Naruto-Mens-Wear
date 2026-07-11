import { getDateFilter } from '$lib/utils/dateFilter';
import { formatDateTime } from '$lib/utils/dateTime';
import formatter from '$lib/utils/formatter.js';
import { getDb } from '$lib/utils/mongodb';
import parser from '$lib/utils/parser.js';
import { responseInvalid, responseSuccess } from '$lib/utils/response.js';

function generateAdvanceBarcode(countOfDay) {
	return `AD${formatDateTime('YYMMDD')}${(countOfDay + 1).toString().padStart(2, '0')}`;
}

export async function load({ depends }) {
	depends('advance');
	const db = await getDb();
	const collection = db.collection('advance');

	const result = await collection.find({}).toArray();
	return { advances: JSON.parse(JSON.stringify(result)) };
}

export const actions = {
	save: async ({ request }) => {
		const db = await getDb();
		const collection = db.collection('advance');
		const now = new Date();

		const formData = await request.formData();
		const _id = parser.id(formData.get('_id'));
		const data = {
			description: formData.get('description')?.toString().trim() || '',
			amount: formatter.number(formData.get('amount')),
			phone: formData.get('phone')
		};

		// Standardize returning specific field-level errors
		if (!data.description) return responseInvalid('Description is required');
		if (data.description.length >= 30)
			return responseInvalid('Description is very long only 30 characters allowed');
		if (!data.amount) return responseInvalid('Amount is required');

		// 3. Perform the Database Operation
		let targetId = _id;
		if (_id) {
			await collection.updateOne({ _id }, { $set: { ...data, updatedAt: now } });
		} else {
			const dateFilter = getDateFilter(now, now);
			const countOfDay = await collection.countDocuments(dateFilter);
			data.barcode = generateAdvanceBarcode(countOfDay);
			const result = await collection.insertOne({ ...data, createdAt: now });
			targetId = result.insertedId;
		}
		const savedAdvance = await collection.findOne({ _id: targetId });
		return responseSuccess('Advance saved', JSON.parse(JSON.stringify(savedAdvance)));
	},

	delete: async ({ request }) => {
		const db = await getDb();
		const collection = db.collection('advance');

		const formData = await request.formData();
		const _id = parser.id(formData.get('_id'));

		const result = await collection.deleteOne({ _id });
		return responseSuccess('Advance deleted');
	}
};
