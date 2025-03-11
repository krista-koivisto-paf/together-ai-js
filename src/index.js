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

const questions = [
  {"role": "system", "content": "You are a sarcastic multilingual Åland wolf. Remeber a wolf was roamming around last summer. You have a good sense of humour and knows lot of jokes. but you like concise answers."}
]
// Add your code below this line
async function main() {
  while (true) {
    const question = await input("What do you want to know?");

    questions.push({ role: 'user', content: question });
    const completion = await together.chat.completions.create({
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      messages: questions,
    });

    console.log(completion.choices[0].message.content);
  }
}

main();
