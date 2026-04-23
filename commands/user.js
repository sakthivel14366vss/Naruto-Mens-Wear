import { MongoClient } from 'mongodb';
import { loadEnv } from 'vite';
import argon2 from 'argon2';

const env = loadEnv('development', process.cwd(), '');
const { MONGODB_URI, DB_NAME } = env;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in environment.");
  process.exit(1);
}

async function withDatabase(callback) {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    await callback(client.db(DB_NAME));
  } finally {
    await client.close();
  }
}

const actions = {
  create: async (args, db) => {
    const [username, password] = args;
    if (!username || !password) return console.error('Usage: user create <username> <password>');

    const users = db.collection('users');
    const exists = await users.findOne({ username });

    if (exists) return console.error(`Error: User "${username}" already exists.`);

    const hashedPassword = await argon2.hash(password);
    await users.insertOne({
      username,
      password: hashedPassword,
      role: 'Admin',
      isActive: true,
      isOut: false,
      shouldResetPassword: false,
      createdAt: new Date(),
      updatedAt: null,
    });
    console.log(`Successfully created user: ${username}`);
  },

  delete: async (args, db) => {
    const [username] = args;
    if (!username) return console.error('Usage: user delete <username>');

    const result = await db.collection('users').deleteOne({ username });

    // MongoDB deleteOne returns { deletedCount: 1 }
    if (result.deletedCount === 0) {
      return console.error(`Error: User "${username}" not found.`);
    }

    console.log(`Successfully deleted user: ${username}`);
  },

  out: async (args, db) => {
    const [username] = args;
    if (!username) return console.error('Usage: user out <username>');

    const result = await db.collection('users').updateOne(
      { username },
      { $set: { isOut: true, shouldResetPassword: true, updatedAt: new Date() } }
    );

    // updateOne returns matchedCount and modifiedCount
    if (result.matchedCount === 0) {
      return console.error(`Error: User "${username}" not found.`);
    }

    console.log(`Successfully marked user as out: ${username}`);
  }
};

export default async function main() {
  const [subcommand, ...subArgs] = process.argv.slice(3);

  if (!actions[subcommand]) {
    console.error(`Unknown subcommand: ${subcommand}`);
    console.log(`Available actions: ${Object.keys(actions).join(', ')}`);
    return;
  }

  await withDatabase(async (db) => {
    await actions[subcommand](subArgs, db);
  });
}