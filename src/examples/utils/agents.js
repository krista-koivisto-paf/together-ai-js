import { Together } from "together-ai";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Run the agent.
 * 
 * The agent will respond with a list of commands you can run to complete the task.
 * 
 * The result must be awaited.
 * 
 * @param {Object} options - The options for the agent.
 * @param {Together} options.together - The Together instance.
 * @param {string} options.systemPrompt - The system prompt for the agent.
 * @param {string} options.prompt - The prompt to run the agent with.
 * @param {ZodSchema} options.schema - The JSON schema for the agent.
 * @param {string} options.model - The model to use for the agent.
 * @returns {Promise<string>} - The response from the agent.
 */
async function runAgent ({ together, systemPrompt, prompt, schema, model = "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo" }) {
  if (schema == null) {
    throw new Error("Schema is required");
  }

  console.log()

  const completion = await together.chat.completions.create({
    model,
    response_format: {
      type: "json_object",
      schema: zodToJsonSchema(schema, { target: "openAi" }),
    },
    messages: [
      { role: "system", content: systemPrompt.trim() },
      { role: "user", content: prompt.trim() }
    ],
  });

  return {
    result: JSON.parse(completion.choices[0].message.content),
    usage: completion.usage ?? {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  }
};

/**
 * Create an agent that responds in a structured format.
 * 
 * The agent will respond with a JSON object that matches the schema.
 * 
 * ---
 * 
 * @example
 * ```js
 * const agent = agents.createAgent({
 *   together,
 *   systemPrompt: "You are a helpful assistant.",
 *   schema: z.object({ name: z.string() }),
 * });
 * 
 * const result = await agent.run("My name is Jane Doe. What is the name of the person you are talking to?");
 * console.log(result); // { name: "Jane Doe" }
 * ```
 * 
 * @param {Object} options - The options for the agent.
 * @param {Together} options.together - The Together instance.
 * @param {string} options.systemPrompt - The system prompt for the agent.
 * @param {string} options.model - The model to use for the agent.
 * @param {string} options.schema - The schema for the agent.
 * @returns {Object} - The agent.
 */
const createAgent = ({ together, systemPrompt, model = "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", schema }) => {
  return {
    run: async (prompt) => runAgent({ together, systemPrompt, prompt, schema, model }),
  }
};

export const agents = {
  createAgent
};
