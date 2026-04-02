// src/lib/server/utils/mongodb.ts
import { MongoClient, Db } from 'mongodb';
import { MONGODB_URI, DB_NAME } from '$env/static/private';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Global caching for development hot-reloading
// Prevents multiple connections during Vite HMR
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connects to MongoDB and returns the database instance.
 * Implements a singleton pattern to reuse the connection.
 */
export async function connectDB(): Promise<Db> {
  // If we already have a connection, return the cached DB
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  // Set up connection options (tuning for production)
  const options = {
    connectTimeoutMS: 10000,
  };

  try {
    const client = new MongoClient(MONGODB_URI, options);
    await client.connect();

    const db = client.db(DB_NAME);

    // Cache the instances
    cachedClient = client;
    cachedDb = db;

    console.log('✅ MongoDB connection established');
    return cachedDb;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw new Error('Could not connect to database', { cause: error });
  }
}

/**
 * Helper to get the DB instance immediately.
 * Useful in API routes where you assume the connection is already alive.
 */
export function getDB(): Db {
  if (!cachedDb) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return cachedDb;
}

/**
 * Cleanly close the connection.
 * Note: In serverless environments (Vercel/Netlify),
 * process listeners may not always behave as expected.
 */
async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('MongoDB connection closed');
  }
}

process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});
