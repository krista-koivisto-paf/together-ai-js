import readline from 'node:readline';
import util from 'node:util';

import { exec } from 'child_process';

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
export async function input(prompt) {
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

/**
 * Execute a command on the system and return the output.
 *
 * This function is used to execute a command on the system and return the output. It stops the thread until the
 * command has finished executing.
 *
 * The result must be awaited.
 *
 * ---
 * 
 * **Example:**
 * ```js
 * const output = await system.execute('ls -la');
 * console.log(output);
 * ```
 *
 * ---
 *
 * @param {string} command - The command to execute.
 * @returns {Promise<string>} The output of the command.
 */
async function execute(command) {
  return new Promise((resolve, reject) => {
    exec(command, function (error, stdout, stderr) {
      if (stderr) {
        console.error(stderr);
      }
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

export const system = {
  input,
  execute,
};
