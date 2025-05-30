const logger = require('../utils/logger');
const config = require('../config/env');

/**
 * Централизованный обработчик ошибок
 */
const errorHandler = (err, req, res) => {
  // Логирование ошибки
  logger.error(`${err.name}: ${err.message}\nStack: ${err.stack}`);

  // Определяем статус ошибки или используем 500 по умолчанию
  const statusCode = err.statusCode || 500;

  // Формируем сообщение об ошибке
  const errorMessage = err.message || 'Internal server error';

  // В режиме разработки возвращаем больше информации об ошибке
  const responseData = {
    error: {
      message: errorMessage,
      status: statusCode,
    },
  };

  // В режиме разработки добавляем стек ошибки
  if (config.NODE_ENV === 'development') {
    responseData.error.stack = err.stack;
  }

  // Отправка ответа клиенту
  res.status(statusCode).json(responseData);
};

module.exports = errorHandler;
