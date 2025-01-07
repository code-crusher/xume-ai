import postgres from '../integrations/postgres';
import slack from '../integrations/slack';
import { LLMFactory } from '../llms/index';
import Persona from '../personas';
import { ChatStep, FunctionCallStep, Workflow } from './index';


// TODO: Generate next step function and it's inputs via the LLM

// workflow.addStep(new GuardrailStep(async (result) => {
//     return result === "World";
// }));

export const initExampleWorkflow = () => {

    const exampleWorkflow = new Workflow();

    exampleWorkflow.setSchema(
        [
            {
                n: "ChatStep",
            },
            {
                n: "FunctionCallStep",
                fn: "slack.sendMessage",
                s: slack.sendMessage.schema
            }
        ]
    )

    const inputs = {
        userName: "John Doe",
        slackChannelId: "C062GDF1JH5"
    }

    const llm = LLMFactory.getProvider("openai");

    const model = process.env.OPENAI_MODEL || "gpt-4o";

    const persona = new Persona({
        name: "John Doe",
        description: "A friendly and welcoming HR",
        systemPrompt: "You are a friendly and welcoming HR and people ops person",
        traits: ["friendly", "welcoming", "empathetic"],
        constraints: ["You should never be rude or mean to anyone", "Always prefer brevity over verbosity"]
    });

    exampleWorkflow.addStep(new ChatStep([{ role: "user", content: `Generate a welcome message for the user ${inputs.userName} in Slack channel with id ${inputs.slackChannelId}. Make it fun, welcoming and short.` }], persona, llm, model));
    exampleWorkflow.addStep(new FunctionCallStep(async (result) => {
        console.log("Result from Open AI: ", result);
        const response = await slack.sendMessage(JSON.parse(result?.input?.content));
        console.log("Response from Slack: ", response);
        return response;
    }));
    exampleWorkflow.addStep(new ChatStep([{ role: "user", content: "Generate INSERT SQL statement to save the following data in Users table with columns name, slack_message_id, created_at" }], persona, llm, model));
    exampleWorkflow.addStep(new FunctionCallStep(async (result) => {
        console.log("Result from Open AI 2: ", result);
        const response = await postgres.saveDataInPostgres(result);
        console.log("Response from Postgres: ", response);
        return response;
    }));

    exampleWorkflow.execute();
}