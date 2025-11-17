const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat.routes');
const logger = require('./config/logger');
const config = require('./config/config');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', chatRoutes);

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  logger.error({ err: message, status }, 'Unhandled error');
  res.status(status).json({ error: message });
});

const server = app.listen(config.port, () => {
  logger.info(`AI Chat API Starter running on port ${config.port}`);
});

module.exports = server;
