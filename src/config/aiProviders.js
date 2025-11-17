const axios = require('axios');
const createError = require('http-errors');
const config = require('./config');
const { withTimeout } = require('../utils/withTimeout');
const { mapProviderError } = require('../utils/providerError');

const buildAxiosClient = (baseURL, headers = {}) => axios.create({ baseURL, headers });
const safeCall = (promise) => withTimeout(promise, 15000);

const openaiClient = buildAxiosClient(config.openai.baseUrl, {
  Authorization: `Bearer ${config.openai.apiKey}`
});

const anthropicClient = buildAxiosClient(config.anthropic.baseUrl, {
  'x-api-key': config.anthropic.apiKey,
  'anthropic-version': '2023-06-01'
});

const groqClient = buildAxiosClient(config.groq.baseUrl, {
  Authorization: `Bearer ${config.groq.apiKey}`
});

const ollamaClient = buildAxiosClient(config.ollama.baseUrl);

const runOpenAI = async ({ messages, stream, model, temperature, max_tokens, metadata }) => {
  const payload = {
    model: model || config.openai.model,
    messages,
    stream: Boolean(stream),
    temperature,
    max_tokens,
    metadata
  };

  const response = await safeCall(
    openaiClient.post('/chat/completions', payload, {
      responseType: payload.stream ? 'stream' : 'json'
    })
  );

  return payload.stream
    ? { stream: response.data }
    : {
        message: response.data?.choices?.[0]?.message,
        raw: response.data
      };
};

const runAnthropic = async ({ messages, stream, model, temperature, max_tokens, systemPrompt }) => {
  const payload = {
    model: model || config.anthropic.model,
    messages,
    stream: Boolean(stream),
    max_tokens: max_tokens || 1024,
    temperature,
    system: systemPrompt
  };

  const response = await safeCall(
    anthropicClient.post('/v1/messages', payload, {
      responseType: payload.stream ? 'stream' : 'json'
    })
  );

  return payload.stream
    ? { stream: response.data }
    : {
        message: response.data?.content,
        raw: response.data
      };
};

const runGroq = async ({ messages, stream, model, temperature, max_tokens, metadata }) => {
  const payload = {
    model: model || config.groq.model,
    messages,
    stream: Boolean(stream),
    temperature,
    max_tokens,
    metadata
  };

  const response = await safeCall(
    groqClient.post('/chat/completions', payload, {
      responseType: payload.stream ? 'stream' : 'json'
    })
  );

  return payload.stream
    ? { stream: response.data }
    : {
        message: response.data?.choices?.[0]?.message,
        raw: response.data
      };
};

const runOllama = async ({ messages, stream, model, temperature, metadata }) => {
  const payload = {
    model: model || config.ollama.model,
    messages,
    stream: Boolean(stream),
    options: {
      temperature,
      metadata
    }
  };

  const response = await safeCall(
    ollamaClient.post('/api/chat', payload, {
      responseType: payload.stream ? 'stream' : 'json'
    })
  );

  return payload.stream
    ? { stream: response.data }
    : {
        message: response.data?.message,
        raw: response.data
      };
};

const runChat = async (args) => {
  const provider = (args.provider || config.defaultProvider || '').toLowerCase();

  if (!['openai', 'anthropic', 'groq', 'ollama'].includes(provider)) {
    throw createError(400, `Unsupported provider: ${provider}`);
  }

  try {
    switch (provider) {
      case 'openai':
        return await runOpenAI(args);
      case 'anthropic':
        return await runAnthropic(args);
      case 'groq':
        return await runGroq(args);
      case 'ollama':
        return await runOllama(args);
      default:
        throw createError(400, `Unsupported provider: ${provider}`);
    }
  } catch (err) {
    throw mapProviderError(err, provider);
  }
};

module.exports = { runChat };
