import path from 'path';
import { initChroma } from '../integrations/chroma';
import { loadToVectorDBWithLLM } from '../integrations/pdf';
import postgres from '../integrations/postgres';
import slack from '../integrations/slack';
import { VectorDBFactory, VectorDBProvider } from '../knowledge';
import { LLMFactory, LLMProvider } from '../llms/index';
import initOpenAI from '../llms/openai';
import Persona from '../personas';
import { ChatStep, FunctionCallStep, Workflow } from './index';

initOpenAI();
initChroma();

export const loadSlackDocsVector = async (llm: LLMProvider<any>, model: string): Promise<VectorDBProvider<any>> => {
    try {
        // Get the existing Chroma provider
        const vectorDB = VectorDBFactory.getProvider('chroma');

        // Initialize with collection name
        await vectorDB.initialize({
            collectionName: 'slack_docs'
        });

        // Load and vectorize the PDF
        // await loadToVectorDBWithLLM(
        //     path.join(__dirname, 'slack_working.pdf'),
        //     vectorDB,
        //     async (text: string) => {
        //         const response = await llm.embedding(text, model, null, null);
        //         console.log("EMBEDDING", response);
        //         return response.content;
        //     },
        //     1000,  // chunkSize
        //     200    // overlap
        // );

        return vectorDB;

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export const initExampleWorkflow = async () => {
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
            },
            {
                n: "ChatStep",
            },
            {
                n: "FunctionCallStep",
                fn: "postgres.executeQuery",
                s: postgres.executeQuery.schema
            }
        ]
    )

    const inputs = {
        userName: "John Doe",
        slackChannelId: "C062GDF1JH5"
    }

    const llm = LLMFactory.getProvider("openai");

    const model = process.env.OPENAI_MODEL || "gpt-4o";

    const embeddingModel = "text-embedding-3-small";

    const vectorDB = await loadSlackDocsVector(llm, embeddingModel);

    const hrPersona = new Persona({
        name: "John Doe",
        description: "A friendly and welcoming HR",
        systemPrompt: "You are a friendly and welcoming HR and people ops person",
        traits: ["friendly", "welcoming", "empathetic"],
        constraints: ["You should never be rude or mean to anyone", "Always prefer brevity over verbosity"]
    });

    const dbPersona = new Persona({
        name: "John Doe",
        description: "A profient database admin",
        systemPrompt: "You are a profient database admin who writes SQL queries for Postgres",
        traits: ["proficient", "efficient", "meticulous"],
        constraints: ["You should never make mistakes in SQL queries", "You should never delete data from the database"]
    });


    // exampleWorkflow.addStep(new ChatStep([{ role: "user", content: `Generate a welcome message for the user ${inputs.userName} in Slack channel with id ${inputs.slackChannelId}. Make it fun, welcoming and short.` }], hrPersona, llm, model));
    // exampleWorkflow.addStep(new FunctionCallStep(async (result) => {
    //     const response = await slack.sendMessage(result?.input?.content);
    //     return response;
    // }));
    // exampleWorkflow.addStep(new ChatStep([{ role: "user", content: "Generate INSERT SQL statement to save the following data in Users table with columns name, slack_message_id, created_at" }], dbPersona, llm, model));
    // exampleWorkflow.addStep(new FunctionCallStep(async (result) => {
    //     console.log("result", result);
    //     const response = await postgres.executeQuery(result?.input?.content);
    //     return response;
    // }));
    exampleWorkflow.addStep(new ChatStep([{ role: "user", content: `Generate a brief on how to use Slack message for the user ${inputs.userName} in Slack channel with id ${inputs.slackChannelId}.` }], hrPersona, llm, embeddingModel, {
        vectorDB: vectorDB,
        collectionName: 'slack_docs',
        topK: 5
    }));
    exampleWorkflow.addStep(new FunctionCallStep(async (result) => {
        const response = await slack.sendMessage(result?.input?.content);
        return response;
    }));

    exampleWorkflow.execute();
}