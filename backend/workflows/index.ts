// workflows are a way to define a sequence of steps that can be executed in a specific order. They can be used to automate tasks, or to create a new workflow.

import { ChatMessage, LLMProvider } from "../src/llms";

// There are 5 steps any workflow can have:
// Chat with the LLM
// Make function calls with the integrations
// Use guardrails to performs checks
// Evaluate the result of the step using LLM to reduce hallucinations

abstract class WorkflowStep {
    abstract execute(previousResult: any): Promise<any>;
}

class Workflow {
    private steps: WorkflowStep[] = [];
    private schema: any[] = [];
    addStep(step: WorkflowStep) {
        this.steps.push(step);
    }

    async execute(initialInput?: any) {
        let result = initialInput || null;
        for (let i = 0; i < this.steps.length; i++) {
            const nextStepSchema = this.schema[i + 1];  // Get schema for next step
            const currentStep = this.steps[i];

            if (currentStep instanceof ChatStep && nextStepSchema) {
                const schemaMessage: ChatMessage = {
                    role: 'system',
                    content: `Your response must conform to this schema: ${JSON.stringify(nextStepSchema)}`
                };
                currentStep.addSystemMessage(schemaMessage);
            }

            result = await currentStep.execute({
                input: result,
                nextStepSchema: nextStepSchema
            });
        }
        return result;
    }

    setSchema(schema: any) {
        this.schema = schema;
    }
}

class ChatStep extends WorkflowStep {
    constructor(
        private messages: ChatMessage[],
        private llm: LLMProvider<any>,
        private model: string
    ) {
        super();
    }

    async execute(previousResult: any): Promise<any> {
        return await this.llm.chat(this.messages, this.model, previousResult);
    }

    addSystemMessage(message: ChatMessage) {
        this.messages.unshift(message);
    }
}

class FunctionCallStep extends WorkflowStep {
    constructor(private fn: (...args: any[]) => Promise<any>) {
        super();
    }

    async execute(previousResult: any): Promise<any> {
        return await this.fn(previousResult);
    }
}

class GuardrailStep extends WorkflowStep {
    constructor(private validationFn: (result: any) => Promise<boolean>) {
        super();
    }

    async execute(previousResult: any): Promise<any> {
        const isValid = await this.validationFn(previousResult);
        if (!isValid) {
            throw new Error('Guardrail validation failed');
        }
        return previousResult;
    }
}

export { Workflow, ChatStep, FunctionCallStep, GuardrailStep };
