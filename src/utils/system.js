import readline from 'node:readline';
import util from 'node:util';

/**
 * Get user input from the console.
 *
 * This function is used to get user input from the console. It stops the thread until the user has pressed enter, then
 * returns the input.
 *
 * The result must be awaited.
 *
 * ---
 * 
 * **Example:**
 * ```js
 * const answer = await system.input('What is your name?');
 * console.log(`The user's name is ${answer}`);
 * ```
 *
 * ---
 *
 * @param {string} prompt - The question to ask the user.
 * @returns {Promise<string>} The user's input.
 */
async function input(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Convert the readline question to a Promise to make it awaitable, more readable.
  const question = util.promisify(rl.question).bind(rl);
  const answer = await question(`${prompt} `);
  rl.close();

  return answer;
}

export const system = {
  input,
};
