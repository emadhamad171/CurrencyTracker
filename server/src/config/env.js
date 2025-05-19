require('dotenv').config();

module.exports = {
    // Базовые настройки
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5001,

    // API ключи для внешних сервисов
    MINFIN_API_KEY: process.env.MINFIN_API_KEY, // Ключ MinFin API

    // Настройки приложения
    RATES_UPDATE_INTERVAL: parseInt(process.env.RATES_UPDATE_INTERVAL || '3600000', 10), // 1 час в мс
    CACHE_TTL: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 час в секундах

    // Firebase конфигурация
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,

    // Firebase Cloud Messaging
    FCM_SERVER_KEY: process.env.FCM_SERVER_KEY,

    // Настройки оповещений
    ALERTS_CHECK_INTERVAL: parseInt(process.env.ALERTS_CHECK_INTERVAL || '900000', 10), // 15 минут в мс

    // MongoDB (если используется)
    MONGODB_URI: process.env.MONGODB_URI,

    // Настройки безопасности
    JWT_SECRET: process.env.JWT_SECRET || 'your-default-secret-key-for-dev',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // Настройки CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

};
