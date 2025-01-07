import Persona from "../personas";

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMProvider<T> {
  llm: T;
  chat(messages: ChatMessage[], model: string, previousResult: any, persona: Persona): Promise<LLMResponse>;
  complete(prompt: string, model: string, previousResult: any, persona: Persona): Promise<LLMResponse>;
}

class LLMFactory {
  private static providers: Map<string, LLMProvider<any>> = new Map();

  static registerProvider<T>(name: string, provider: LLMProvider<T>) {
    this.providers.set(name.toLowerCase(), provider);
  }

  static getProvider<T>(name: string): LLMProvider<T> {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new Error(`LLM provider '${name}' not found`);
    }
    return provider;
  }
}

// Export factory and types
export { LLMFactory };
