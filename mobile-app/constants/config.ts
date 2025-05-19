// mobile-app/constants/config.ts
// API настройки
export const API_URL = 'http://192.168.110.27:5001/api';  // Для iOS симулятора

// Для реального устройства используйте IP-адрес вашего компьютера
// export const API_URL = 'http://192.168.1.100:5001/api';

// Настройки кеширования
export const CACHE_TTL = {
    RATES: 30 * 60 * 1000, // 30 минут для курсов валют
    HISTORICAL: 24 * 60 * 60 * 1000, // 24 часа для исторических данных
    FORECAST: 12 * 60 * 60 * 1000, // 12 часов для прогнозов
    CURRENCIES: 7 * 24 * 60 * 60 * 1000 // 7 дней для списка валют
};

// Настройки отображения
export const CHART_COLORS = {
    BUY: '#28a745',
    SELL: '#dc3545',
    GRID: '#e9e9e9',
    AXIS: '#666666',
    FORECAST: '#007bff',
    FORECAST_AREA: 'rgba(0, 123, 255, 0.1)'
};

// Источники данных
export const SOURCES = {
    NBU: 'nbu',
    PRIVATBANK: 'PrivatBank',
    INTERBANK: 'Interbank'
};

// Интервалы для исторических данных
export const INTERVALS = {
    DAY: 'day',
    MONTH: 'month'
};

export const DEFAULT_CURRENCIES = {
    BASE: 'UAH',
    SELECTED: ['USD', 'EUR', 'GBP', 'PLN', 'CHF'] // Топ-5 валют
};
