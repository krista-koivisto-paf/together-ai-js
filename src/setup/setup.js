import fs from 'node:fs';
import { getUserInput } from '../utils/input.js';
/**
 * Setup script for the project.
 *
 * This script sets up the project by asking for your together.ai API key and saving it to the .env file.
 *
 * If the API key is already set in the .env file, the script will exit with a success code.
 */

const ENV_FILE = '.env';

// Exit with a success code if the API key is already set in the .env file.
if (fs.existsSync(ENV_FILE)) {
  const content = fs.readFileSync(ENV_FILE, 'utf8');
  if (/^TOGETHER_API_KEY=.+$/m.test(content)) {
    process.exit(0);
  }
}

function saveApiKey(apiKey) {
  fs.writeFileSync(ENV_FILE, `TOGETHER_API_KEY=${apiKey}`);
  console.log(`\nThe API key has been saved to '${ENV_FILE}'.`);
}

async function getApiKey() {
  const apiKey = await getUserInput('\n\n 🖥️  Please enter your Together API key: ');
  return apiKey;
}

const apiKey = await getApiKey();
saveApiKey(apiKey);
