// server/src/server.js - ДОБАВЬТЕ ЭТИ СТРОКИ

const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');

// ✅ ДОБАВЬТЕ ЭТУ СТРОКУ ДЛЯ PRICE ALERTS
const cronService = require('./services/cronService');

// Порт, на котором будет работать сервер
const PORT = config.PORT || 5001;

// ✅ ДОБАВЬТЕ ПРОВЕРКУ FIREBASE КОНФИГУРАЦИИ
console.log('🔥 Firebase configuration check:');
console.log(
  '- PROJECT_ID:',
  config.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
);
console.log(
  '- CLIENT_EMAIL:',
  config.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing',
);
console.log(
  '- PRIVATE_KEY:',
  config.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing',
);

// Обработка необработанных исключений
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

// Обработка необработанных обещаний
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
  // Приложение продолжит работу
});

// Запуск сервера
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${config.NODE_ENV}`);
  if (config.MONGODB_URI) {
    logger.info('MongoDB URI configured');
  }

  // ✅ ОБНОВЛЕННЫЙ ЗАПУСК PRICE ALERTS
  if (
    config.FIREBASE_PROJECT_ID &&
    config.FIREBASE_CLIENT_EMAIL &&
    config.FIREBASE_PRIVATE_KEY
  ) {
    try {
      cronService.start();
      logger.info('✅ Price alerts cron service started successfully');
    } catch (cronError) {
      logger.error(
        '❌ Price alerts cron service failed to start:',
        cronError.message,
      );
    }
  } else {
    logger.warn(
      '⚠️ Firebase configuration incomplete, price alerts service not started',
    );
    logger.warn(
      'Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY',
    );
  }
});

// Корректное завершение работы при получении сигнала
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Graceful shutdown...');
  cronService.stop();
  server.close(() => {
    logger.info('Server stopped');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Graceful shutdown...');
  cronService.stop();
  server.close(() => {
    logger.info('Server stopped');
    process.exit(0);
  });
});

module.exports = server;
