const logger = require('../config/logger');

const validate = (schema) => (req, res, next) => {
  try {
    req.validatedBody = schema.parse(req.body);
    return next();
  } catch (error) {
    logger.warn({ error }, 'Request validation failed');
    return res.status(400).json({
      error: 'Validation failed',
      details: error.errors
    });
  }
};

module.exports = validate;
