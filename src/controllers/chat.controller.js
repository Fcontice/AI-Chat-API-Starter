const createError = require('http-errors');
const { runChat } = require('../config/aiProviders');
const config = require('../config/config');
const logger = require('../config/logger');

const buildMessageList = (messages, systemPrompt) => {
  if (!systemPrompt) return messages;
  return [{ role: 'system', content: systemPrompt }, ...messages];
};

const handleChat = async (req, res, next) => {
  try {
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

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw createError(400, 'messages must contain at least one item');
    }

    const messageList = buildMessageList(messages, systemPrompt);
    const result = await runChat({
      provider,
      model,
      messages: messageList,
      systemPrompt,
      stream,
      temperature,
      max_tokens,
      metadata
    });

    if (stream && result.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      result.stream.pipe(res);
      return;
    }

    res.status(200).json({
      provider,
      model: model || null,
      message: result.message,
      raw: result.raw
    });
  } catch (err) {
    logger.error({ provider: req.body?.provider || config.defaultProvider, err: err.message }, 'Chat error');
    next(err);
  }
};

module.exports = { handleChat };
