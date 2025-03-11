import Together from "together-ai";
import { z } from "zod";

import { system } from "../utils/system.js";
import { agents } from "./utils/agents.js";

/**
 * Agent Example
 * 
 * This example demonstrates how to use the Together API to create an agent. The agent can run commands and use tools.
 * 
 * This example also showcases "JSON Mode". It ensures the agent responds in a structured format.
 * 
 * ====================================================================================================================
 *                                                  ⚠️ WARNING ⚠️
 * ====================================================================================================================
 * Allowing agents to run commands and use tools is a powerful feature, but it can also be very dangerous!
 * 
 * LLMs are prone to hallucinations and may make silly mistakes. Always be sure to carefully review the commands the
 * agent wants to run.
 * ====================================================================================================================
 * 
 * Example tasks:
 * - I have a README.md file in the current directory, I want a list of lines that contain the word "you". Please save the output to a file called output.txt. Then I would also like another copy of that file with line numbers, call it whatever you like.
 * - How many JavaScript files are there in this folder and all subfolders, excluding the "node_modules" directory?
 */

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

const MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo";
const MODEL_COST_PER_1M_TOKENS = 0.88;

if (process.env.MONEY_IS_NO_OBJECT !== "true") {
  console.log("==============");
  console.log("⚠️  WARNING ⚠️");
  console.log("==============");
  console.log("This example will consume credits!\n");
  console.log("It costs approximately $0.0001 per command the model comes up with when using the 70B model.\n");
  console.log("If you want to completely ignore credit warnings, you can add the following line to your .env file:\n\n\tMONEY_IS_NO_OBJECT=true\n");
  console.log("==============\n");
  console.log("Press ENTER to continue or CTRL+C to exit...");
  await new Promise((resolve) => process.stdin.once("data", resolve));
  console.log("==============\n");
}

function printUsage(usage) {
  console.log(`\n\n💰  Consumed ${usage.total_tokens} tokens ($${(usage.total_tokens * MODEL_COST_PER_1M_TOKENS / 1_000_000).toFixed(4)})`);
}

/**
 * The planner agent.
 * 
 * This agent will respond with a plan for which set of commands you can run to complete the task.
 */
const planner = agents.createAgent({
  together,
  model: MODEL,
  systemPrompt: "You are a planner who works for an organization that requires utmost care and attention. Your job is to take human input and produce an overview of human-readable (non-code) actions that allows the IT expert to complete the task. Only answer in JSON.",
  schema: z.object({
    actions: z.array(z.string()).describe("A list of vague actions that must be taken to complete the task. Avoid being too specific. The actions should be human-readable and easy to understand. Avoid writing code."),
  }),
});

/**
 * The Bash specialist agent.
 * 
 * This agent will respond with a list of Bash commands you can run to complete the task.
 */
const bashNerd = agents.createAgent({
  together,
  model: MODEL,
  systemPrompt: "You are a Bash expert who works for an organization that requires utmost care and attention. Only answer in JSON.",
  schema: z.object({
    // The `plan` and `reason` fields serve no other purpose than to let the model think out loud first to improve the quality of the response.
    plan: z.string().describe("A plan for which set of Bash commands you can run to complete the task."),
    commands: z.array(
      z.object({
        reason: z.string().describe("The reasoning behind why the command should be run."),
        command: z.string().describe("The command without arguments. No free-form text."),
        // args: z.string().describe("The arguments for the command. Only include the arguments that are to be passed to the command, do not include the command name. No free-form text."),
        pipe_to_next: z.boolean().describe("Whether the command should be piped to the next command."),
      }),
    ).describe("A list of commands to run to complete the task. The commands should be piped to the next command if the `pipe_to_next` field is true."),
  }),
});

/**
 * Gets a plan for a task.
 * 
 * @returns {Promise<Array>} - The plan.
 */
async function getPlan() {
  const task = await system.input("Hi! What do you need me to do for you today?");

  const plannerOutput = await planner.run(`Ensure a minimal number of actions is used to complete the task. Remember that the task is completed by a computer expert, so avoid being too specific. ${task}`);

  printUsage(plannerOutput.usage);
  console.log(plannerOutput.result.actions);

  const { result, usage } = await bashNerd.run(`
  A user has asked for the following:
  """
  ${task}
  """

  Internal IT thinks this is the way to complete the task:
  """
  ${plannerOutput.result.actions.join("\n")}
  """

  Please produce a list of Bash commands that can be used to complete the task. Ensure a minimal number of actions is used to complete the task.
  `);

  printUsage(usage);
  console.log(result.commands);

  return result.commands;
};

/**
 * Runs a plan of commands.
 * 
 * @param {Array} plan - The plan to run.
 * @returns {Promise<string>} - The output of the commands.
 */
async function runPlan(plan) {
  let output = "";
  let shouldPipe = false;
  for await (const command of plan) {
    let commandString = `${command.command}`;
    if (shouldPipe) {
      // Escape single quotes in the output to avoid breaking the command.
      commandString = `echo '${output.replace("'", "\\'")}' | ${commandString}`;
    }
    
    console.log(`\n\n💻  The Bash nerd wants to run the following command: '${commandString}'\n\nReasoning: ${command.reason}`);
    await system.input("Press ENTER to execute the command ⚠️  ON YOUR COMPUTER ⚠️  or CTRL+C to reject it...");
    output = await system.execute(commandString);
    console.log(output);

    shouldPipe = command.pipe_to_next;
  }

  return output;
}

async function main() {
  const plan = await getPlan();
  await runPlan(plan);
}

await main();
