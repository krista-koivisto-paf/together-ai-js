import Together from 'together-ai';

import {input} from './utils/system.js';

// Documentation:
// https://docs.together.ai/docs/introduction
//
// (Switch from Python to TypeScript to get more useful example code.)
//
// Need ideas? How about some public APIs?
// https://github.com/public-apis/public-apis

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

// Add your code below this line
async function main() {
  const question = await input("What do you want to know?");

  const completion = await together.chat.completions.create({
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
    messages: [{ role: 'user', content: question }],
  });

  console.log(completion.choices[0].message.content);
}

main();
