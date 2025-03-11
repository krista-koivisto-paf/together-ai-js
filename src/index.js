

import Together from 'together-ai';
import axios from 'axios'; // To fetch trivia questions

import { input } from './utils/system.js';

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

// Fetch trivia questions from the Open Trivia Database API
async function fetchTriviaQuestions() {
  try {
    const response = await axios.get('https://opentdb.com/api.php?amount=5&type=multiple'); // Fetch 5 trivia questions
    return response.data.results; // Return the questions
  } catch (error) {
    console.error('Error fetching trivia questions:', error);
    return []; // Return an empty array in case of error
  }
}

// Function to get hints from AI
async function getHint(question) {
  // Ask the AI for 1 hint for the current question
  const completion = await together.chat.completions.create({
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
    messages: [
      { role: 'user', content: `Here is a trivia question: ${question.question}. Provide a hint for this question.` },
    ],
  });

  return completion.choices[0].message.content; // Return the hint
}


// Function to quiz the user, track score, and show one question at a time
async function quizUser(triviaQuestions) {
  let score = 0;

  // Go through each trivia question
  for (let index = 0; index < triviaQuestions.length; index++) {
    const question = triviaQuestions[index];
    let userAnswer = '';
    let attempts = 0;

    console.log(`Question ${index + 1}: ${question.question}`);
    console.log(`Options: ${[...question.incorrect_answers, question.correct_answer].join(", ")}`);

    // Allow user to attempt the question multiple times
    while (userAnswer.toLowerCase() !== question.correct_answer.toLowerCase()) {
      // Get the user's answer
      userAnswer = await input('Your answer: ');

      // Check if the answer is correct
      if (userAnswer.toLowerCase() === question.correct_answer.toLowerCase()) {
        console.log('Correct!\n');
        score += 3 - attempts; // Increment score for correct answer
      } else {
        console.log('Incorrect!');
        const hint = await getHint(question); // Provide a hint if the answer is incorrect
        console.log(`Hint: ${hint}`);
        console.log(); // Add space for clarity

        // Increment attempts counter
        attempts++;

        // Optionally, limit the number of attempts (e.g., 3 attempts max)
        if (attempts >= 3) {
          console.log(`The correct answer was: ${question.correct_answer}`);
          break; // Break out of the loop if the user reaches the maximum attempts
        }
      }

      // Show score so far
      console.log(`Your score: ${score}\n`);
    }

    // After getting the correct answer or reaching max attempts, move to the next question
    console.log(`Moving to next question...\n`);
  }

  // Final score after all questions
  console.log(`Game over! Your final score is: ${score} out of ${triviaQuestions.length}`);
}


async function main() {
  const triviaQuestions = await fetchTriviaQuestions(); // Get trivia questions
  if (triviaQuestions.length === 0) {
    console.log('No trivia questions found!');
    return;
  }

  // Start the quiz
  await quizUser(triviaQuestions);
}

main();
