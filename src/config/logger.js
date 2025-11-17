const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  redact: [
    'req.headers.authorization',
    'req.body.messages',
    'req.body.systemPrompt',
    'req.body.prompt',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GROQ_API_KEY'
  ]
});

module.exports = logger;
