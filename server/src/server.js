const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
// const alertService = require('./services/alertService');

// Порт, на котором будет работать сервер
const PORT = config.PORT || 5001;

// Обработка необработанных исключений
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught exception: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
});

// Обработка необработанных обещаний
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection:', reason);
    // Приложение продолжит работу
});

// Запуск сервера
const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server started on port ${PORT}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
    if (config.MONGODB_URI) {
        logger.info(`MongoDB URI configured`);
    }

    // Запускаем сервис оповещений
    // if (config.FIREBASE_PROJECT_ID) {
    //     alertService.startAlertScheduler();
    //     logger.info('Alert service initialized');
    // } else {
    //     logger.warn('Firebase configuration missing, alert service not started');
    // }
});

// Корректное завершение работы при получении сигнала
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Graceful shutdown...');
    server.close(() => {
        logger.info('Server stopped');
        process.exit(0);
    });
});

module.exports = server;
