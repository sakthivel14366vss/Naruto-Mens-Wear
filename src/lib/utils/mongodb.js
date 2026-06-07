import { MongoClient } from 'mongodb';
// Using $env/static/private for validated, server-side only variables
import { MONGODB_URI, DB_NAME } from '$env/static/private';

if (!MONGODB_URI || !DB_NAME) throw Error('Databse env variable not set');

let client = null;
let dbInstance = null;

export async function connectToDatabase() {
	if (dbInstance) return { client, db: dbInstance };

	try {
		client = new MongoClient(MONGODB_URI, {
			maxPoolSize: 10,
			minPoolSize: 2
		});

		await client.connect();
		dbInstance = client.db(DB_NAME || 'my_database');

		console.log('Connected to MongoDB');
		return { client, db: dbInstance };
	} catch (error) {
		console.error('MongoDB Connection Error:', error);
		throw error;
	}
}

// Fixed async getDb
export async function getDb() {
	if (!dbInstance) {
		await connectToDatabase();
	}
	return dbInstance;
}
