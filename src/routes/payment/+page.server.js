import { getDateFilter } from '$lib/utils/dateFilter';
import formatter from '$lib/utils/formatter.js';
import { getDb } from '$lib/utils/mongodb';
import parser from '$lib/utils/parser.js';
import { responseInvalid, responseSuccess } from '$lib/utils/response.js';

export async function load({ depends, url }) {
	depends('payment');
	let fromDate = url.searchParams.get('fromDate');
	let toDate = url.searchParams.get('toDate');

	const db = await getDb();
	const collection = db.collection('payment');

	const result = await collection
		.find({ paymentMode: { $ne: 'Credit' }, ...getDateFilter(fromDate, toDate, 'savedAt') })
		.toArray();
	return { payments: JSON.parse(JSON.stringify(result)) };
}
