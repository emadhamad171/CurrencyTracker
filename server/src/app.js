const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

// Инициализация Express
const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  logger.info(`REQUEST: ${req.method} ${req.url}`);
  next();
});

if (config.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    }),
  );
}

// Проверка работоспособности сервера
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Маршруты API - используем новый файл routes/index.js
app.use('/api', require('./routes/index'));

// Обработка 404
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
    },
  });
});

// Обработка ошибок
app.use(errorHandler);

module.exports = app;
