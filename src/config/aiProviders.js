const axios = require('axios');
const config = require('./config');
const logger = require('./logger');

const buildAxiosClient = (baseURL, headers = {}) =>
  axios.create({
    baseURL,
    headers,
    timeout: 30000
  });

const openaiProvider = () => {
  const client = buildAxiosClient(config.openai.baseUrl, {
    Authorization: `Bearer ${config.openai.apiKey}`
  });

  const sendChat = async ({ messages, stream, model, temperature, max_tokens, metadata }) => {
    const payload = {
      model: model || config.openai.model,
      messages,
      stream: Boolean(stream),
      temperature,
      max_tokens,
      metadata
    };

    const response = await client.post('/chat/completions', payload, {
      responseType: payload.stream ? 'stream' : 'json'
    });

    return payload.stream
      ? { stream: response.data }
      : {
          message: response.data?.choices?.[0]?.message,
          raw: response.data
        };
  };

  return { sendChat };
};

const anthropicProvider = () => {
  const client = buildAxiosClient(config.anthropic.baseUrl, {
    'x-api-key': config.anthropic.apiKey,
    'anthropic-version': '2023-06-01'
  });

  const sendChat = async ({ messages, stream, model, temperature, max_tokens, system }) => {
    const payload = {
      model: model || config.anthropic.model,
      messages,
      stream: Boolean(stream),
      max_tokens: max_tokens || 1024,
      temperature,
      system
    };

    const response = await client.post('/v1/messages', payload, {
      responseType: payload.stream ? 'stream' : 'json'
    });

    return payload.stream
      ? { stream: response.data }
      : {
          message: response.data?.content,
          raw: response.data
        };
  };

  return { sendChat };
};

const groqProvider = () => {
  const client = buildAxiosClient(config.groq.baseUrl, {
    Authorization: `Bearer ${config.groq.apiKey}`
  });

  const sendChat = async ({ messages, stream, model, temperature, max_tokens, metadata }) => {
    const payload = {
      model: model || config.groq.model,
      messages,
      stream: Boolean(stream),
      temperature,
      max_tokens,
      metadata
    };

    const response = await client.post('/chat/completions', payload, {
      responseType: payload.stream ? 'stream' : 'json'
    });

    return payload.stream
      ? { stream: response.data }
      : {
          message: response.data?.choices?.[0]?.message,
          raw: response.data
        };
  };

  return { sendChat };
};

const ollamaProvider = () => {
  const client = buildAxiosClient(config.ollama.baseUrl);

  const sendChat = async ({ messages, stream, model, temperature, metadata }) => {
    const payload = {
      model: model || config.ollama.model,
      messages,
      stream: Boolean(stream),
      options: {
        temperature,
        metadata
      }
    };

    const response = await client.post('/api/chat', payload, {
      responseType: payload.stream ? 'stream' : 'json'
    });

    return payload.stream
      ? { stream: response.data }
      : {
          message: response.data?.message,
          raw: response.data
        };
  };

  return { sendChat };
};

const createProvider = (providerName) => {
  const provider = providerName?.toLowerCase();

  switch (provider) {
    case 'openai':
      return openaiProvider();
    case 'anthropic':
      return anthropicProvider();
    case 'groq':
      return groqProvider();
    case 'ollama':
      return ollamaProvider();
    default:
      logger.warn({ provider }, 'Unsupported provider requested');
      return null;
  }
};

module.exports = { createProvider };
