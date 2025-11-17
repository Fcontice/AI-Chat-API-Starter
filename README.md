# AI Chat API Starter

A provider-agnostic Express starter that exposes a single `/api/chat` endpoint and forwards requests to OpenAI, Anthropic, Groq, or Ollama without leaking provider keys to the frontend.

## What you're selling
- **One endpoint**: `/api/chat` with chat history, system prompts, metadata, streaming flag, and model override.
- **Multiple providers**: swap with `provider=openai|anthropic|groq|ollama` via request body.
- **Safe by default**: optional API key gate for paid tiers; environment-driven provider credentials.
- **Frontend-friendly**: simple JSON contract ready for Next.js, React Native, or any HTTP client.

## Folder structure
```
ai-chat-api-starter/
  src/
    server.js
    config/
      config.js         # env parsing (OPENAI_API_KEY, etc.)
      logger.js         # pino logger
      aiProviders.js    # provider clients & factory
    controllers/
      chat.controller.js
    routes/
      chat.routes.js
    validation/
      chat.schema.js
    middleware/
      validate.js
      auth.js           # optional API-key guard
  package.json
  .env.example
  README.md
```

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` (below) to `.env` and fill in your provider keys.
3. Run the server:
   ```bash
   npm run dev
   ```

### Environment variables
```
PORT=3000
LOG_LEVEL=info
DEFAULT_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_API_KEY=your-anthropic-key
ANTHROPIC_MODEL=claude-3-haiku-20240307
GROQ_API_KEY=your-groq-key
GROQ_MODEL=llama3-8b-8192
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
REQUIRE_API_KEY=true
SERVICE_API_KEY=your-service-key
```

## API usage
`POST /api/chat`

**Request body**
```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "systemPrompt": "You are a helpful assistant",
  "stream": false,
  "metadata": {"tenantId": "acme"},
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

**Response (non-streaming)**
```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "message": {"role": "assistant", "content": "Hi there!"},
  "raw": {}
}
```

To stream responses, set `"stream": true` and consume the `text/event-stream` response.

## Plugging into an existing Express starter
1. Drop the `src` folder into your repo.
2. Mount the routes in your existing Express app:
   ```js
   const chatRoutes = require('./src/routes/chat.routes');
   app.use('/api', chatRoutes);
   ```
3. Make sure your env vars are available to the process (dotenv or your hosting provider).

## Notes
- Each provider client lives in `src/config/aiProviders.js` and implements a `sendChat` method with consistent options.
- Validation is powered by Zod (`src/validation/chat.schema.js`); errors return 400 with details.
- Enable header-based auth with `REQUIRE_API_KEY=true` and `SERVICE_API_KEY`.
