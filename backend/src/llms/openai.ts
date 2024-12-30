import { LLMFactory, ChatMessage, LLMProvider, LLMResponse } from "./index";

import { OpenAI } from "openai";

class OpenAIProvider implements LLMProvider<OpenAI> {
    constructor(public llm: OpenAI) { }

    async chat(messages: ChatMessage[], model: string, previousResult: any): Promise<LLMResponse> {
        const response = await this.llm.chat.completions.create({
            model: model,
            messages: previousResult ? [...messages, { role: "assistant", content: JSON.stringify(previousResult) }] : messages,
        });
        return {
            content: response.choices[0].message.content ?? "",
            model: model,
        };
    }

    async complete(prompt: string, model: string, previousResult: any): Promise<LLMResponse> {
        const response = await this.llm.completions.create({
            model: model,
            prompt: previousResult ? `${prompt}\n\n${previousResult}` : prompt,
        });
        return {
            content: response.choices[0].text ?? "",
            model: model,
        };
    }
}

const initOpenAI = async () => {
    // Register a provider with an LLM instance
    console.log("Initializing OpenAI provider: ", process.env.OPENAI_API_KEY)
    const openAIInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string });
    LLMFactory.registerProvider('openai', new OpenAIProvider(openAIInstance));
}

export default initOpenAI;