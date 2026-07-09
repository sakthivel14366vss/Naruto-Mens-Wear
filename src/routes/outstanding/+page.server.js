import formatter from '$lib/utils/formatter.js';
import { getDb } from '$lib/utils/mongodb';
import parser from '$lib/utils/parser.js';
import { responseInvalid, responseSuccess } from '$lib/utils/response.js';

export async function load({ depends }) {
	depends('outstanding');
	const db = await getDb();
	const collection = db.collection('outstanding');

	const result = await collection.find({}).toArray();
	return { outstandings: JSON.parse(JSON.stringify(result)) };
}

export const actions = {
	save: async ({ request }) => {
		const db = await getDb();
		const collection = db.collection('outstanding');

		const formData = await request.formData();
		const _id = parser.id(formData.get('_id'));
		const data = {
			name: formData.get('name')?.toString().trim() || '',
			phone: formatter.number(formData.get('phone')),
			amount: formatter.number(formData.get('amount')),
			description: formData.get('description') || '',
			savedAt: new Date()
		};

		// Standardize returning specific field-level errors
		if (!data.name) return responseInvalid('Name is required');
		if (!data.phone) return responseInvalid('Phone is required');
		if (!/^\d{10}$/.test(data.phone)) return responseInvalid('Phone number is wrong');
		// 1. Build the uniqueness query
		const uniqueQuery = {
			$or: [{ phone: data.phone }, { name: data.name }]
		};
		// 2. If updating, exclude the current document from the search
		if (_id) {
			uniqueQuery._id = { $ne: _id };
		}
		const exist = await collection.findOne(uniqueQuery);
		if (exist) {
			const field = exist.phone === data.phone ? 'phone' : 'name';
			return responseInvalid(`${field.toUpperCase()} already exists in the system.`);
		}

		// 3. Perform the Database Operation
		if (_id) {
			await collection.updateOne({ _id }, { $set: { ...data, updatedAt: new Date() } });
			return responseSuccess('Outstanding updated');
		} else {
			await collection.insertOne({ ...data, createdAt: new Date() });
			return responseSuccess('Outstanding created');
		}
	},

	delete: async ({ request }) => {
		const db = await getDb();
		const collection = db.collection('outstanding');

		const formData = await request.formData();
		const _id = parser.id(formData.get('_id'));

		const result = await collection.deleteOne({ _id });
		return responseSuccess('Outstanding deleted');
	}
};
