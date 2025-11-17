const config = require('../config/config');
const logger = require('../config/logger');

const auth = (req, res, next) => {
  if (!config.requireApiKey) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.headers.authorization?.replace('Bearer ', '');

  if (!apiKey || apiKey !== config.serviceApiKey) {
    logger.warn('Unauthorized request blocked');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
};

module.exports = auth;
