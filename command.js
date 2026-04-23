// command.js
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

const [command] = process.argv.slice(2);

if (!command) {
  console.error('Usage: node command.js <command> [subcommand] [args]');
  process.exit(1);
}

// Resolve absolute path and convert to File URL for Windows compatibility with dynamic imports
const commandPath = path.resolve('./commands', `${command}.js`);

if (!existsSync(commandPath)) {
  console.error(`Error: Command "${command}" not found at ${commandPath}`);
  process.exit(1);
}

async function runScript(filePath) {
  try {
    // pathToFileURL fixes "ERR_UNSUPPORTED_ESM_URL_SCHEME" on Windows
    const module = await import(pathToFileURL(filePath));

    if (typeof module.default === 'function') {
      await module.default();
    } else {
      console.error('Error: Command file must export a default function.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Runtime Error:', err.message);
    process.exit(1);
  }
}

runScript(commandPath);