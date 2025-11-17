const express = require('express');
const { handleChat } = require('../controllers/chat.controller');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { chatSchema } = require('../validation/chat.schema');
const { chatRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/chat', chatRateLimiter, auth, validate(chatSchema), handleChat);

module.exports = router;
