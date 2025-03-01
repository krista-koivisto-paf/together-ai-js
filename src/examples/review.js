import Together from "together-ai";

import { git } from "./utils/git.js";

/**
 * Code Review Example
 *
 * This example demonstrates how to use the Together API to automatically review code before committing.
 *
 * It uses the `git diff` command to get the changes in the current branch and then uses the Together API to review the code.
 */

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

const { files, changes } = await git.getDiffSummary();

console.log(`Reviewing files:\n\t${files.join("\n\t")}\n`);

const completion = await together.chat.completions.create({
  model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
  messages: [
    { role: "system", content: "You are a senior JavaScript and Node.js developer who has a knack for reviewing code." },
    { role: "user", content: `Please review the following code changes:

\`\`\`js
${changes}
\`\`\`

Assume deleted files are no longer needed. Avoid speculation and nitpicking. Focus on errors and potentially significant improvements.

Please ensure the code is clean and ready to commit. Commented out code and \`console.log\` statements must not be committed.

If you don't see any issues, you can simply respond with "LGTM!". Otherwise, respond with the issues you see.
`}],
});

console.log(completion.choices[0].message.content);
