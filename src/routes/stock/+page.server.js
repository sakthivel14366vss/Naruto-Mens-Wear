import { getDb } from '$lib/utils/mongodb';

const parseNumber = (val) => {
	const num = Number(val);
	return isNaN(num) ? 0 : num;
};

export const actions = {
	async save({ request }) {
		// 1. Establish DB Connection
		const db = await getDb();
		const collection = db.collection('stock');

		// 2. Extract Data
		const formData = await request.formData();
		const data = {
			barcode: formData.get('barcode'),
			name: formData.get('name'),
			description: formData.get('description'),
			purchasePrice: parseNumber(formData.get('purchasePrice')),
			salesPrice: parseNumber(formData.get('salesPrice')),
			count: parseNumber(formData.get('count'))
		};

		// 3. (Optional) Insert data into MongoDB
		// await collection.insertOne(data);

		// 4. Debug: Log the actual array of documents
		const allStock = await collection.find({}).toArray();
		console.log(allStock);

		// 5. Return success to the SvelteKit frontend
		return { success: true };
	}
};
