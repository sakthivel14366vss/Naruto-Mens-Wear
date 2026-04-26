import { MongoClient } from 'mongodb';
import { loadEnv } from 'vite';
import path from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const env = loadEnv('development', process.cwd(), '');
const { MONGODB_URI, DB_NAME } = env;

if (!MONGODB_URI) {
  console.error('❌ Critical Error: MONGODB_URI missing in .env');
  process.exit(1);
}

/**
 * Encapsulates DB connection logic with modern error handling
 */
async function withDatabase(callback) {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.log(`🔌 Connected to [${db.databaseName}]`);
    await callback(db);
  } catch (error) {
    console.error('💥 Database Error:', error.message);
    throw error;
  } finally {
    await client.close();
  }
}

const actions = {
  /**
   * Run: Automatically imports and upserts data from /seeds/*.js
   */
  run: async (args, db) => {
    const seedDir = path.resolve(process.cwd(), 'seeds');

    if (!existsSync(seedDir)) {
      throw new Error(`Directory not found: ${seedDir}`);
    }

    const files = readdirSync(seedDir).filter((f) => f.endsWith('.js'));

    for (const file of files) {
      const collectionName = path.parse(file).name; // e.g., 'users'
      const filePath = pathToFileURL(path.join(seedDir, file)).href;

      // Dynamic import of the data array
      const { default: data } = await import(filePath);

      if (!Array.isArray(data)) {
        console.warn(`⚠️  Skipping ${file}: Export must be an array.`);
        continue;
      }

      console.log(`🚀 Seeding collection: [${collectionName}] (${data.length} records)`);

      // 1. Wipe existing data in this specific collection first
      await db.collection(collectionName).deleteMany({});

      // 2. Simple Insert
      if (data.length > 0) {
        await db.collection(collectionName).insertMany(data);
      }

      console.log(`✅ ${collectionName} freshly seeded.`);
    }
  },

  /**
   * Reset: Wipes all data. Use with caution.
   */
  reset: async (args, db) => {
    const collections = await db.listCollections().toArray();
    console.log('🗑  Resetting database...');

    for (const { name } of collections) {
      if (name.startsWith('system.')) continue;
      await db.collection(name).deleteMany({});
      console.log(`   - Cleared ${name}`);
    }
  },
};

/**
 * Main Entry Point
 */
export default async function main() {
  const subcommand = process.argv.slice(3)[0] || 'run';

  if (!actions[subcommand]) {
    console.error(`❌ Unknown command: "${subcommand}"`);
    console.log(`Available: ${Object.keys(actions).join(', ')}`);
    return;
  }

  try {
    await withDatabase(async (db) => {
      await actions[subcommand](process.argv.slice(3), db);
    });
    console.log('✨ Database operation successful.');
  } catch (err) {
    console.error('❌ Operation failed.');
    process.exit(1);
  }
}
