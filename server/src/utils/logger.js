const winston = require('winston');
const config = require('../config/env');
const path = require('path');

// Определение уровней логирования
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Определение цветов для уровней логирования в консоли
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

// Добавление цветов
winston.addColors(colors);

// Определение формата
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Определение транспортов
const transports = [
    // Вывод в консоль
    new winston.transports.Console(),

    // Запись всех уровней логов в файл
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/all.log'),
    }),

    // Запись только ошибок в отдельный файл
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
    }),
];

// Создание логгера
const logger = winston.createLogger({
    level: config.NODE_ENV === 'development' ? 'debug' : 'info',
    levels,
    format,
    transports,
});

module.exports = logger;
