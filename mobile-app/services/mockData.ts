import { RatesResponse, HistoricalRates, ForecastData, DataSource } from '../types/currency.types';

// Массив доступных валют
export const availableCurrencies = [
    { code: 'USD', name: 'Доллар США', symbol: '$' },
    { code: 'EUR', name: 'Евро', symbol: '€' },
    { code: 'GBP', name: 'Британский фунт', symbol: '£' },
    { code: 'JPY', name: 'Японская йена', symbol: '¥' },
    { code: 'UAH', name: 'Украинская гривна', symbol: '₴' },
    { code: 'PLN', name: 'Польский злотый', symbol: 'zł' },
    { code: 'CZK', name: 'Чешская крона', symbol: 'Kč' },
    { code: 'CAD', name: 'Канадский доллар', symbol: 'C$' },
    { code: 'AUD', name: 'Австралийский доллар', symbol: 'A$' },
    { code: 'CHF', name: 'Швейцарский франк', symbol: 'CHF' },
    { code: 'CNY', name: 'Китайский юань', symbol: '¥' },
    { code: 'SEK', name: 'Шведская крона', symbol: 'kr' },
    { code: 'NOK', name: 'Норвежская крона', symbol: 'kr' },
    { code: 'DKK', name: 'Датская крона', symbol: 'kr' },
    { code: 'TRY', name: 'Турецкая лира', symbol: '₺' },
];

// Доступные источники данных
export const dataSources: DataSource[] = [
    {
        id: 'national_bank',
        name: 'Национальный банк',
        description: 'Официальные курсы национального банка'
    },
    {
        id: 'interbank',
        name: 'Межбанковский рынок',
        description: 'Курсы на межбанковском рынке'
    },
    {
        id: 'exchange_offices',
        name: 'Обменные пункты',
        description: 'Средние курсы в обменных пунктах'
    }
];

// Функция для генерации случайных курсов валют
export const generateMockRates = (baseCurrency: string): RatesResponse => {
    // Базовые курсы к доллару
    const baseRates = {
        USD: 1,
        EUR: 0.91,
        GBP: 0.77,
        JPY: 151.25,
        UAH: 39.45,
        PLN: 3.95,
        CZK: 22.65,
        CAD: 1.36,
        AUD: 1.49,
        CHF: 0.89,
        CNY: 7.23,
        SEK: 10.25,
        NOK: 10.47,
        DKK: 6.79,
        TRY: 32.18
    };

    // Создаем случайные вариации (±5%)
    const rates: Record<string, number> = {};

    // Находим базовый курс в долларах
    const baseToUSD = baseRates[baseCurrency as keyof typeof baseRates] || 1;

    // Пересчитываем курсы относительно базовой валюты
    Object.keys(baseRates).forEach(currency => {
        const baseRate = baseRates[currency as keyof typeof baseRates];
        const variation = 1 + (Math.random() * 0.1 - 0.05); // Вариация ±5%
        rates[currency] = (baseRate / baseToUSD) * variation;
    });

    // Курс к самой себе всегда 1
    rates[baseCurrency] = 1;

    return {
        base: baseCurrency,
        timestamp: Date.now(),
        rates: rates,
        source: 'national_bank'
    };
};

// Функция для генерации случайных исторических данных
export const generateMockHistoricalRates = (
    baseCurrency: string,
    targetCurrency: string,
    period: string
): HistoricalRates => {
    const days = period === '7days' ? 7 :
        period === '30days' ? 30 :
            period === '90days' ? 90 : 365;

    const data = [];
    const baseRate = generateMockRates(baseCurrency).rates[targetCurrency];
    const date = new Date();

    for (let i = 0; i < days; i++) {
        date.setDate(date.getDate() - 1);
        const variation = 1 + (Math.random() * 0.04 - 0.02); // Вариация ±2%
        data.push({
            date: date.toISOString().split('T')[0],
            rate: baseRate * variation
        });
    }

    // Сортируем по возрастанию даты
    data.sort((a, b) => a.date.localeCompare(b.date));

    return {
        base: baseCurrency,
        target: targetCurrency,
        data: data,
        source: 'national_bank'
    };
};

// Функция для генерации случайных прогнозных данных
export const generateMockForecast = (
    baseCurrency: string,
    targetCurrency: string,
    days: number
): ForecastData => {
    const forecast = [];
    const currentRate = generateMockRates(baseCurrency).rates[targetCurrency];
    const date = new Date();

    // Генерируем тренд (рост или падение)
    const trendDirection = Math.random() > 0.5 ? 1 : -1;
    const trendStrength = Math.random() * 0.01; // Сила тренда (до 1% в день)

    for (let i = 0; i < days; i++) {
        date.setDate(date.getDate() + 1);

        // Базовый тренд
        const trend = trendDirection * trendStrength * i;

        // Случайные флуктуации
        const fluctuation = (Math.random() * 0.04 - 0.02); // Флуктуация ±2%

        // Итоговый прогноз
        const predictedRate = currentRate * (1 + trend + fluctuation);

        // Уверенность в прогнозе (уменьшается с увеличением горизонта прогноза)
        const confidence = Math.max(0.3, 1 - (i * 0.05));

        forecast.push({
            date: date.toISOString().split('T')[0],
            value: parseFloat(predictedRate.toFixed(4)),
            confidence: parseFloat(confidence.toFixed(2))
        });
    }

    return {
        base: baseCurrency,
        target: targetCurrency,
        forecast: forecast,
        method: 'linear_regression'
    };
};
