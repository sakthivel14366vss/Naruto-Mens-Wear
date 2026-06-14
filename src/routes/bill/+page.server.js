import { getDb } from '$lib/utils/mongodb';

export async function load({ depends }) {
	depends('bill');
	const db = await getDb();
	const stockCollection = db.collection('stock');
	const billCollection = db.collection('bill');

	const stocks = await stockCollection.find({}).toArray();
	const bills = await billCollection.find({}).toArray();
	const response = { stocks, bills };
	return JSON.parse(JSON.stringify(response));
}
