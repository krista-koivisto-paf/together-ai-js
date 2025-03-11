import Together from 'together-ai';

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

const completion = await together.chat.completions.create({
  model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
  messages: [{ role: 'user', content: 'Top 3 things to do in New York?' }],
});

console.log(completion.choices[0].message.content);
