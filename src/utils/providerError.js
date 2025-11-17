const createError = require('http-errors');

const mapProviderError = (err, provider) => {
  const message =
    err?.response?.data?.error?.message || err?.message || 'Unknown provider error';

  if (err.name === 'AbortError' || message.includes('timed out')) {
    return createError(504, `${provider} request timed out`);
  }

  if (err.response && err.response.status) {
    return createError(err.response.status, `${provider} error: ${message}`);
  }

  if (err.status || err.statusCode) {
    return createError(err.status || err.statusCode, `${provider} error: ${message}`);
  }

  return createError(502, `${provider} error: ${message}`);
};

module.exports = { mapProviderError };
