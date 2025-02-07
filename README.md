# Xume AI

![Xume AI](https://res.cloudinary.com/dor5uewzz/image/upload/v1736236211/xume-og-image_cyafxf.png)

Xume AI is a framework for building AI agents with no-code/low-code. You can quickstart with the SaaS version here: https://xume.ai

## Example Agent Flow

1. Chat with LLM to generate greeting message for a new user in Slack Channel
2. Send the message to the new user in Slack Channel
3. Generate a SQL query to save the new user in the database along with slack message id and created at timestamp
4. Execute the SQL query to save the new user in the database

![Example Xume AI Agent Setup](https://res.cloudinary.com/dor5uewzz/image/upload/v1736236211/xume-ai-example_1_eqnznv.png)

## How to run

```bash
npm run dev
```

## How to build

```bash
npm run build
```

## Framework

backend/src/
├── llms // LLM providers
├── integrations // External services
├── workflows // Agent workflows and steps
├── knowledge // Vectorized knowledge base
├── personas // Agent personas
├── guardrails // Agent guardrails


## Supported LLMs
We are using OpenAI SDK which supports `OPEN_AI_URL`, `OPENAI_MODEL`, `OPENAI_API_KEY` and `OPEN_AI_DEFAULT_HEADERS` to be passed as environment variables.

| LLM Provider | Status |
|--------------|--------|
| OpenAI       | ✅     |
| Anthropic    | ✅     |
| Groq         | ✅     |

## Supported External Services

| External Service | Status |
|------------------|--------|
| Slack            | ✅     |
| Github           | ❌     |
| Postgres         | ❌     |
| MongoDB          | ❌     |
| Linear           | ❌     |


## Supported Guardrails

- TBD

## Supported Vector Databases

- TBD
