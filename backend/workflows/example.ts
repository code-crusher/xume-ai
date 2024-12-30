import { LLMFactory } from '../src/llms';
import { ChatStep, FunctionCallStep, GuardrailStep, Workflow } from './index';
import slack from '../src/integrations/slack';
import postgres from '../src/integrations/postgres';

const exampleWorkflow = new Workflow();

const llm = LLMFactory.getProvider("openai");

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

exampleWorkflow.addStep(new ChatStep([{ role: "user", content: `Generate a welcome message for the user ${inputs.userName} in Slack channel with id ${inputs.slackChannelId}` }], llm, "gpt-4o"));
exampleWorkflow.addStep(new FunctionCallStep(async (result) => {
    console.log(result);
    const response = await slack.sendMessage(result);
    console.log(response);
    return response;
}));
exampleWorkflow.addStep(new ChatStep([{ role: "user", content: "Generate INSERT SQL statement to save the following data in Users table with columns name, slack_message_id, created_at" }], llm, "gpt-4o"));
exampleWorkflow.addStep(new FunctionCallStep(async (result) => {
    console.log(result);
    const response = await postgres.saveDataInPostgres(result);
    console.log(response);
    return response;
}));

// TODO: Generate next step function and it's inputs via the LLM

// workflow.addStep(new GuardrailStep(async (result) => {
//     return result === "World";
// }));

export default exampleWorkflow;