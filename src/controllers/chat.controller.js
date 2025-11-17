const { createProvider } = require('../config/aiProviders');
const config = require('../config/config');
const logger = require('../config/logger');

const buildMessageList = (messages, systemPrompt) => {
  if (!systemPrompt) return messages;
  return [{ role: 'system', content: systemPrompt }, ...messages];
};

const handleChat = async (req, res) => {
  const body = req.validatedBody || req.body;
  const {
    provider = config.defaultProvider,
    model,
    messages,
    systemPrompt,
    stream = false,
    temperature,
    max_tokens,
    metadata
  } = body;

  const providerClient = createProvider(provider);
  if (!providerClient) {
    return res.status(400).json({ error: `Unsupported provider: ${provider}` });
  }

  try {
    const messageList = buildMessageList(messages, systemPrompt);
    const result = await providerClient.sendChat({
      messages: messageList,
      stream,
      model,
      temperature,
      max_tokens,
      metadata,
      system: systemPrompt
    });

    if (stream && result.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      result.stream.pipe(res);
      return;
    }

    return res.json({
      provider,
      model: model || null,
      message: result.message,
      raw: result.raw
    });
  } catch (error) {
    logger.error({ err: error }, 'Chat request failed');
    const status = error.response?.status || 500;
    const details = error.response?.data || error.message;
    return res.status(status).json({ error: 'Chat request failed', details });
  }
};

module.exports = { handleChat };
