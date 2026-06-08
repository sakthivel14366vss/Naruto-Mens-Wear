import formatter from '$lib/utils/formatter.js';
import { getDb } from '$lib/utils/mongodb';
import parser from '$lib/utils/parser.js';
import { responseInvalid, responseSuccess } from '$lib/utils/response.js';

export async function load({ depends }) {
	depends('stock');
	const db = await getDb();
	const collection = db.collection('stock');

	const result = await collection.find({}).toArray();
	return { stocks: JSON.parse(JSON.stringify(result)) };
}

export const actions = {
	save: async ({ request }) => {
		const db = await getDb();
		const collection = db.collection('stock');

		const formData = await request.formData();
		const _id = parser.id(formData.get('_id'));
		const data = {
			barcode: formData.get('barcode')?.toString().trim() || '',
			name: formData.get('name')?.toString().trim() || '',
			description: formData.get('description')?.toString().trim() || '',
			purchasePrice: formatter.number(formData.get('purchasePrice')),
			salesPrice: formatter.number(formData.get('salesPrice')),
			count: formatter.number(formData.get('count'))
		};

		// Standardize returning specific field-level errors
		if (!data.barcode) return responseInvalid('Barcode is required');
		if (!data.name) return responseInvalid('Name is required');
		// 1. Build the uniqueness query
		const uniqueQuery = {
			$or: [{ barcode: data.barcode }, { name: data.name }]
		};
		// 2. If updating, exclude the current document from the search
		if (_id) {
			uniqueQuery._id = { $ne: _id };
		}
		const exist = await collection.findOne(uniqueQuery);
		if (exist) {
			const field = exist.barcode === data.barcode ? 'barcode' : 'name';
			return responseInvalid(`${field.toUpperCase()} already exists in the system.`);
		}

		// 3. Perform the Database Operation
		if (_id) {
			await collection.updateOne({ _id }, { $set: { ...data, updatedAt: new Date() } });
			return responseSuccess('Stock updated');
		} else {
			await collection.insertOne({ ...data, createdAt: new Date() });
			return responseSuccess('Stock created');
		}
	},

	delete: async ({ request }) => {
		const db = await getDb();
		const collection = db.collection('stock');

		const formData = await request.formData();
		const _id = parser.id(formData.get('_id'));

		const result = await collection.deleteOne({ _id });
		return responseSuccess('Stock deleted');
	}
};
