const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Middleware для ограничения количества запросов от одного IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов с одного IP за 15 минут
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: {
            message: 'Слишком много запросов с этого IP, пожалуйста, попробуйте позже',
            status: 429
        }
    },
    // Логирование превышения лимита
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    }
});

module.exports = apiLimiter;
