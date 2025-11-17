const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat.routes');
const logger = require('./config/logger');
const config = require('./config/config');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', chatRoutes);

app.use((err, req, res, next) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(config.port, () => {
  logger.info(`AI Chat API Starter running on port ${config.port}`);
});

module.exports = server;
