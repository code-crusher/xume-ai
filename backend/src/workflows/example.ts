import postgres from '../integrations/postgres';
import slack from '../integrations/slack';
import { LLMFactory } from '../llms/index';
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

    exampleWorkflow.addStep(new ChatStep([{ role: "user", content: `Generate a welcome message for the user ${inputs.userName} in Slack channel with id ${inputs.slackChannelId}` }], llm, model));
    exampleWorkflow.addStep(new FunctionCallStep(async (result) => {
        console.log("Result from Open AI: ", result);
        const response = await slack.sendMessage(JSON.parse(result?.input?.content));
        console.log("Response from Slack: ", response);
        return response;
    }));
    exampleWorkflow.addStep(new ChatStep([{ role: "user", content: "Generate INSERT SQL statement to save the following data in Users table with columns name, slack_message_id, created_at" }], llm, model));
    exampleWorkflow.addStep(new FunctionCallStep(async (result) => {
        console.log("Result from Open AI 2: ", result);
        const response = await postgres.saveDataInPostgres(result);
        console.log("Response from Postgres: ", response);
        return response;
    }));

    exampleWorkflow.execute();
}