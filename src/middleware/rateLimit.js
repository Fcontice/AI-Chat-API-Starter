const rateLimit = require('express-rate-limit');

const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many chat requests, please try again later.' }
});

module.exports = { chatRateLimiter };
