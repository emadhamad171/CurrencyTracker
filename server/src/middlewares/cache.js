const cache = require('../utils/cache');
const logger = require('../utils/logger');

/**
 * Middleware для кэширования ответов API
 * @param {number} duration - Продолжительность кэширования в секундах
 * @returns {Function} - Middleware функция
 */
const cacheMiddleware = (duration = 3600) => {
  return (req, res, next) => {
    // Не кэшируем запросы не-GET
    if (req.method !== 'GET') {
      return next();
    }

    // Создаем ключ для кэша на основе URL и параметров запроса
    const cacheKey = `__express__${req.originalUrl || req.url}`;

    // Пытаемся получить данные из кэша
    const cachedBody = cache.get(cacheKey);

    if (cachedBody) {
      logger.debug(`Cache hit for: ${cacheKey}`);

      // Отправляем закэшированные данные и заголовок, указывающий на кэш
      res.set('X-Cache', 'HIT');
      return res.json(cachedBody);
    }

    logger.debug(`Cache miss for: ${cacheKey}`);

    // Сохраняем оригинальный метод res.json()
    const originalJson = res.json;

    // Переопределяем метод res.json() для перехвата данных
    res.json = function (body) {
      // Сохраняем ответ в кэш
      cache.set(cacheKey, body, duration);

      // Устанавливаем заголовок, указывающий на отсутствие кэша
      res.set('X-Cache', 'MISS');

      // Вызываем оригинальный метод
      return originalJson.call(this, body);
    };

    next();
  };
};

module.exports = cacheMiddleware;
