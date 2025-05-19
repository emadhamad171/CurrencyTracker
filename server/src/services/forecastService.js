// server/src/services/forecastService.js
const logger = require('../utils/logger');
const { cacheData, getCachedData } = require('../utils/cache');
const axios = require('axios');

// Cache TTL (in milliseconds)
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

// Константы для алгоритмов и прогнозов
const FORECAST_PERIODS = {
    LINEAR: 7,       // 7 дней для линейного прогноза
    ADVANCED: 14,    // 14 дней для продвинутого прогноза
    ML: 30           // 30 дней для ML-прогноза
};

// Константы для исторических данных
const HISTORICAL_PERIODS = {
    LINEAR: 60,      // 60 дней истории для линейного прогноза
    ADVANCED: 90,    // 90 дней истории для продвинутого прогноза
    ML: 180          // 180 дней истории для ML-прогноза
};

// Константа для спреда между курсами покупки и продажи
const SPREAD_PERCENTAGE = 0.01; // 1% spread between buy and sell rates

class ForecastService {
    // Форматирование даты для API НБУ (YYYYMMDD)
    formatDateForNbu(date) {
        if (typeof date === 'string') {
            // Убедимся, что строка даты в правильном формате
            const parts = date.split('-');
            if (parts.length === 3) {
                const year = parts[0];
                const month = parts[1];
                const day = parts[2];
                return `${year}${month}${day}`;
            }

            // Если дата в формате DD.MM.YYYY
            const dotParts = date.split('.');
            if (dotParts.length === 3) {
                const day = dotParts[0];
                const month = dotParts[1];
                const year = dotParts[2];
                return `${year}${month}${day}`;
            }

            // Если дата в неправильном формате, создаем новый объект Date
            date = new Date(date);
        }

        // Защита от некорректной даты
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            date = new Date();
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}${month}${day}`;
    }

    // Безопасное создание даты
    createSafeDate(dateString) {
        try {
            if (!dateString) {
                return new Date();
            }

            // Проверяем, если дата в формате DD.MM.YYYY
            if (typeof dateString === 'string' && dateString.includes('.')) {
                const parts = dateString.split('.');
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1; // Месяцы в JS начинаются с 0
                    const year = parseInt(parts[2], 10);

                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        return new Date(year, month, day);
                    }
                }
            }

            // Проверяем, если дата в формате YYYY-MM-DD
            if (typeof dateString === 'string' && dateString.includes('-')) {
                const parts = dateString.split('-');
                if (parts.length === 3) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1; // Месяцы в JS начинаются с 0
                    const day = parseInt(parts[2], 10);

                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        return new Date(year, month, day);
                    }
                }
            }

            // Пробуем стандартный парсинг даты
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date;
            }

            logger.warn(`Invalid date string format: ${dateString}, using current date`);
            return new Date(); // Возвращаем текущую дату в случае проблем
        } catch (error) {
            logger.error(`Error parsing date: ${dateString}, ${error.message}`);
            return new Date(); // Возвращаем текущую дату в случае ошибки
        }
    }

    // Форматирование даты в строку YYYY-MM-DD
    formatDateToString(date) {
        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            logger.error(`Error formatting date: ${error.message}`);
            return new Date().toISOString().split('T')[0];
        }
    }

    // Получение исторических данных напрямую из NBU API
    async fetchHistoricalData(currency, historicalDays) {
        try {
            currency = currency.toLowerCase();

            // Рассчитываем даты для запроса
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - historicalDays);

            // Форматируем даты для API
            const formattedStartDate = this.formatDateForNbu(startDate);
            const formattedEndDate = this.formatDateForNbu(endDate);

            // Строим URL для запроса
            const url = `https://bank.gov.ua/NBU_Exchange/exchange_site?start=${formattedStartDate}&end=${formattedEndDate}&valcode=${currency}&sort=exchangedate&order=asc&json`;

            logger.info(`Fetching historical rates from NBU API: ${url}`);
            const response = await axios.get(url);

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response format from NBU API');
            }

            // Проверяем данные на валидность
            if (response.data.length === 0) {
                throw new Error(`No historical data available for ${currency}`);
            }

            // Трансформируем в формат, ожидаемый приложением
            return response.data.map(item => ({
                date: item.exchangedate, // Формат уже YYYY-MM-DD
                source: 'NBU',
                currency: currency.toUpperCase(),
                baseCurrency: 'UAH', // Всегда UAH для НБУ
                buy: {
                    avg: item.rate,
                    min: item.rate * 0.99, // Примерная оценка
                    max: item.rate * 1.01  // Примерная оценка
                },
                sell: {
                    avg: item.rate * (1 + SPREAD_PERCENTAGE), // Применяем константу спреда
                    min: item.rate * 0.99 * (1 + SPREAD_PERCENTAGE),
                    max: item.rate * 1.01 * (1 + SPREAD_PERCENTAGE)
                }
            }));
        } catch (error) {
            logger.error(`Error fetching historical data from NBU: ${error.message}`);
            throw error;
        }
    }

    // Упрощенный прогноз курса валют
    async getForecast(currency, method = 'linear') {
        try {
            // Базовая валюта всегда UAH для Украины
            const baseCurrency = 'UAH';

            // Определяем количество дней для прогноза в зависимости от метода
            const days = method === 'linear' ? FORECAST_PERIODS.LINEAR :
                method === 'advanced' ? FORECAST_PERIODS.ADVANCED :
                    method === 'ml' ? FORECAST_PERIODS.ML : FORECAST_PERIODS.ADVANCED;

            logger.info(`Getting ${method} forecast for ${currency}/${baseCurrency} for ${days} days`);

            // Проверяем кеш
            const cacheKey = `forecast_${currency}_${days}_${method}`;
            const cachedData = await getCachedData(cacheKey);

            if (cachedData) {
                logger.info('Returning cached forecast');
                return cachedData;
            }

            // Определяем количество дней исторических данных в зависимости от метода
            const historicalDays = method === 'linear' ? HISTORICAL_PERIODS.LINEAR :
                method === 'advanced' ? HISTORICAL_PERIODS.ADVANCED :
                    method === 'ml' ? HISTORICAL_PERIODS.ML : HISTORICAL_PERIODS.ADVANCED;

            // Получаем данные напрямую из NBU API
            const historicalData = await this.fetchHistoricalData(currency, historicalDays);

            if (historicalData.length === 0) {
                throw new Error('No historical data available for forecast');
            }

            let forecastData;

            switch (method) {
                case 'linear':
                    forecastData = this.linearForecast(historicalData, currency, days);
                    break;
                case 'advanced':
                    forecastData = this.advancedForecast(historicalData, currency, days);
                    break;
                case 'ml':
                    forecastData = this.mlForecast(historicalData, currency, days);
                    break;
                default:
                    forecastData = this.advancedForecast(historicalData, currency, days);
            }

            // Кешируем результат
            await cacheData(cacheKey, forecastData, CACHE_TTL);

            return forecastData;
        } catch (error) {
            logger.error(`Error in getForecast: ${error.message}`);
            throw error;
        }
    }

    // Линейный прогноз на основе исторических данных
    linearForecast(historicalData, currency, days) {
        try {
            // Извлекаем курсы покупки
            const rates = historicalData
                .filter(item => item && item.date && item.buy && item.buy.avg) // Проверяем наличие необходимых полей
                .map(item => ({
                    date: this.createSafeDate(item.date),
                    value: item.buy.avg
                }))
                .filter(item => !isNaN(item.date.getTime())) // Отфильтровываем некорректные даты
                .sort((a, b) => a.date.getTime() - b.date.getTime());

            if (rates.length === 0) {
                throw new Error('No valid historical data available for forecast');
            }

            // Вычисляем линейный тренд, используя метод наименьших квадратов
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            const n = rates.length;

            rates.forEach((rate, i) => {
                sumX += i;
                sumY += rate.value;
                sumXY += i * rate.value;
                sumX2 += i * i;
            });

            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            // Создаем прогноз
            const lastDate = new Date(rates[rates.length - 1].date);
            const result = [];

            for (let i = 1; i <= days; i++) {
                // Создаем новую дату через конструктор, а не через setDate
                const forecastDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + i);

                // Форматируем дату в YYYY-MM-DD
                const forecastDateString = this.formatDateToString(forecastDate);

                const predictedBuy = intercept + slope * (n + i - 1);
                // Защита от отрицательных значений
                const safePredictedBuy = Math.max(predictedBuy, 0.01);

                // Используем константу спреда для расчета курса продажи
                const predictedSell = safePredictedBuy * (1 + SPREAD_PERCENTAGE);

                // Уверенность уменьшается с каждым днем прогноза
                const confidence = Math.max(0.95 - (i * 0.03), 0.6);

                result.push({
                    date: forecastDateString,
                    currency,
                    baseCurrency: 'UAH', // Всегда UAH
                    buy: parseFloat(safePredictedBuy.toFixed(4)),
                    sell: parseFloat(predictedSell.toFixed(4)),
                    confidence: parseFloat(confidence.toFixed(2)),
                    trend: slope > 0 ? 'positive' : slope < 0 ? 'negative' : 'stable'
                });
            }

            return result;
        } catch (error) {
            logger.error(`Error in linearForecast: ${error.message}`);
            throw error;
        }
    }

    // Продвинутый прогноз с экспоненциальным сглаживанием и анализом волатильности
    advancedForecast(historicalData, currency, days) {
        try {
            // Извлекаем курсы покупки и продажи
            const rates = historicalData
                .filter(item => item && item.date && item.buy && item.buy.avg) // Проверяем наличие необходимых полей
                .map(item => ({
                    date: this.createSafeDate(item.date),
                    buy: item.buy.avg,
                    sell: item.sell.avg,
                    volatility: Math.abs(item.buy.max - item.buy.min) / item.buy.avg
                }))
                .filter(item => !isNaN(item.date.getTime())) // Отфильтровываем некорректные даты
                .sort((a, b) => a.date.getTime() - b.date.getTime());

            if (rates.length < 7) {
                throw new Error('Insufficient historical data for advanced forecast');
            }

            // Рассчитываем волатильность (стандартное отклонение ежедневных изменений в %)
            const dailyChanges = [];
            for (let i = 1; i < rates.length; i++) {
                const percentChange = (rates[i].buy - rates[i-1].buy) / rates[i-1].buy;
                dailyChanges.push(percentChange);
            }

            // Расчет стандартного отклонения
            const avgChange = dailyChanges.reduce((sum, val) => sum + val, 0) / dailyChanges.length;
            const squaredDiffs = dailyChanges.map(val => Math.pow(val - avgChange, 2));
            const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
            const volatility = Math.sqrt(avgSquaredDiff);

            // Параметры экспоненциального сглаживания
            const alpha = 0.3; // Фактор сглаживания для уровня
            const beta = 0.1;  // Фактор сглаживания для тренда
            const gamma = 0.3; // Фактор сглаживания для сезонности
            const period = Math.min(7, rates.length - 1);  // Предполагаем недельную сезонность, но не больше чем доступно данных

            // Инициализируем уровень, тренд и сезонность
            let level = rates[0].buy;
            let trend = (rates[rates.length-1].buy - rates[0].buy) / Math.max(1, rates.length - 1);

            // Инициализируем сезонность
            const seasonalIndices = Array(period).fill(0);
            for (let i = 0; i < Math.min(rates.length, period * 2); i++) {
                const seasonIndex = i % period;
                seasonalIndices[seasonIndex] += rates[i].buy / Math.max(0.001, level); // Избегаем деления на 0
            }

            // Нормализуем сезонные индексы
            const seasonSum = seasonalIndices.reduce((sum, val) => sum + val, 0);
            const seasonalComponents = seasonalIndices.map(val =>
                val * period / Math.max(0.001, seasonSum) // Избегаем деления на 0
            );

            // Применяем экспоненциальное сглаживание к недавним данным для улучшения начальных оценок
            for (let i = period; i < rates.length; i++) {
                const seasonIndex = i % period;
                const oldLevel = level;

                // Обновляем уровень, тренд и сезонность
                level = alpha * (rates[i].buy / seasonalComponents[seasonIndex]) + (1 - alpha) * (oldLevel + trend);
                trend = beta * (level - oldLevel) + (1 - beta) * trend;
                seasonalComponents[seasonIndex] = gamma * (rates[i].buy / Math.max(0.001, level)) + (1 - gamma) * seasonalComponents[seasonIndex];
            }

            // Генерируем прогноз
            const lastDate = new Date(rates[rates.length - 1].date);
            const result = [];

            for (let i = 1; i <= days; i++) {
                // Создаем новую дату через конструктор
                const forecastDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + i);

                // Форматируем дату в YYYY-MM-DD
                const forecastDateString = this.formatDateToString(forecastDate);

                const seasonIndex = (rates.length + i - 1) % period;
                const forecastBuy = (level + i * trend) * seasonalComponents[seasonIndex];

                // Защита от отрицательных или очень маленьких значений
                const safeForecastBuy = Math.max(forecastBuy, 0.01);

                // Добавляем некоторую случайность на основе исторической волатильности
                const randomFactor = 1 + (Math.random() * 2 - 1) * Math.min(0.1, volatility / 2);
                const adjustedBuy = safeForecastBuy * randomFactor;

                // Используем константу спреда для расчета курса продажи
                const forecastSell = adjustedBuy * (1 + SPREAD_PERCENTAGE);

                // Рассчитываем уверенность (уменьшается со временем и с большей волатильностью)
                const confidence = Math.max(0.9 - (i * 0.02) - (volatility * 2), 0.4);

                // Определяем тренд
                const trendValue = trend * seasonalComponents[seasonIndex];
                const trendDirection = trendValue > 0.0005 ? 'positive' : trendValue < -0.0005 ? 'negative' : 'stable';

                result.push({
                    date: forecastDateString,
                    currency,
                    baseCurrency: 'UAH', // Всегда UAH
                    buy: parseFloat(adjustedBuy.toFixed(4)),
                    sell: parseFloat(forecastSell.toFixed(4)),
                    confidence: parseFloat(confidence.toFixed(2)),
                    trend: trendDirection,
                    volatility: parseFloat((volatility * 100).toFixed(2))
                });
            }

            return result;
        } catch (error) {
            logger.error(`Error in advancedForecast: ${error.message}`);
            throw error;
        }
    }

    // Прогноз на основе ML-подхода
    mlForecast(historicalData, currency, days) {
        try {
            // Извлекаем курсы с признаками
            const rates = historicalData
                .filter(item => item && item.date && item.buy && item.buy.avg) // Проверяем наличие необходимых полей
                .map(item => ({
                    date: this.createSafeDate(item.date),
                    buy: item.buy.avg,
                    sell: item.sell.avg,
                    spread: item.sell.avg - item.buy.avg,
                    volatility: Math.abs(item.buy.max - item.buy.min) / item.buy.avg,
                    dayOfWeek: this.createSafeDate(item.date).getDay()
                }))
                .filter(item => !isNaN(item.date.getTime())) // Отфильтровываем некорректные даты
                .sort((a, b) => a.date.getTime() - b.date.getTime());

            if (rates.length < 14) {
                throw new Error('Insufficient historical data for ML forecast');
            }

            // Рассчитываем скользящие средние для разных периодов
            const buyRates = rates.map(r => r.buy);
            const ma5 = this.calculateMovingAverage(buyRates, 5);
            const ma10 = this.calculateMovingAverage(buyRates, 10);
            const ma20 = this.calculateMovingAverage(buyRates, 20);

            // Рассчитываем RSI (Relative Strength Index)
            const rsi = this.calculateRSI(buyRates, 14);

            // Рассчитываем волатильность
            const volatility = this.calculateVolatility(buyRates, 14);

            // Рассчитываем импульс рынка
            const momentum = this.calculateMomentum(buyRates, 5);

            // Выявляем сезонные паттерны (влияние дня недели)
            const dayOfWeekEffect = this.calculateDayOfWeekEffect(rates);

            // Генерируем прогноз
            const lastDate = new Date(rates[rates.length - 1].date);
            const result = [];

            // Получаем последние значения
            const latestBuy = rates[rates.length - 1].buy;
            const latestSell = rates[rates.length - 1].sell;
            const latestMA5 = ma5[ma5.length - 1] || latestBuy;
            const latestMA10 = ma10[ma10.length - 1] || latestBuy;
            const latestMA20 = ma20[ma20.length - 1] || latestBuy;
            const latestRSI = rsi[rsi.length - 1] || 50;
            const latestMomentum = momentum[momentum.length - 1] || 0;

            // Рассчитываем тренд
            const shortTermTrend = (latestMA5 / Math.max(0.001, latestMA10)) - 1;
            const longTermTrend = (latestMA10 / Math.max(0.001, latestMA20)) - 1;

            for (let i = 1; i <= days; i++) {
                // Создаем новую дату через конструктор
                const forecastDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + i);

                // Форматируем дату в YYYY-MM-DD
                const forecastDateString = this.formatDateToString(forecastDate);

                const dayOfWeek = forecastDate.getDay();
                const seasonalFactor = dayOfWeekEffect[dayOfWeek] || 1;

                // Прогнозируем изменение цены на основе признаков
                let predictedChange = 0;

                // Эффект краткосрочного импульса (уменьшается со временем)
                const momentumEffect = latestMomentum * Math.exp(-i/10);

                // Эффект RSI (возврат к среднему)
                const rsiEffect = (latestRSI > 70) ? -0.002 * (latestRSI - 70) :
                    (latestRSI < 30) ? 0.002 * (30 - latestRSI) : 0;

                // Эффекты тренда
                const trendEffect = (shortTermTrend * 0.7 + longTermTrend * 0.3) * Math.min(1, 7/i);

                // Объединяем эффекты
                predictedChange = momentumEffect + rsiEffect + trendEffect;

                // Применяем сезонность дня недели
                predictedChange *= seasonalFactor;

                // Добавляем некоторую случайность на основе исторической волатильности (уменьшается с уверенностью)
                const confidenceFactor = Math.max(0.9 - (i * 0.04), 0.5);
                const randomFactor = 1 + (Math.random() * 2 - 1) * Math.min(0.1, volatility) * (1 - confidenceFactor);

                // Рассчитываем окончательный прогноз
                const cumulativeEffect = Math.pow(1 + predictedChange, i);
                const forecastBuy = latestBuy * cumulativeEffect * randomFactor;

                // Защита от отрицательных значений
                const safeForecastBuy = Math.max(forecastBuy, 0.01);

                // Используем константу спреда для расчета курса продажи
                const forecastSell = safeForecastBuy * (1 + SPREAD_PERCENTAGE);

                // Определяем направление тренда
                const effectiveChange = (safeForecastBuy / latestBuy) - 1;
                const trendDirection = effectiveChange > 0.001 ? 'positive' :
                    effectiveChange < -0.001 ? 'negative' : 'stable';

                result.push({
                    date: forecastDateString,
                    currency,
                    baseCurrency: 'UAH', // Всегда UAH
                    buy: parseFloat(safeForecastBuy.toFixed(4)),
                    sell: parseFloat(forecastSell.toFixed(4)),
                    confidence: parseFloat(confidenceFactor.toFixed(2)),
                    trend: trendDirection,
                    volatility: parseFloat((volatility * 100).toFixed(2)),
                    rsi: parseFloat(latestRSI.toFixed(2))
                });
            }

            return result;
        } catch (error) {
            logger.error(`Error in mlForecast: ${error.message}`);
            throw error;
        }
    }

    // Вспомогательные методы для ML-прогноза
    calculateMovingAverage(values, period) {
        if (!values || values.length === 0) {
            return [];
        }

        // Ограничиваем период размером массива
        period = Math.min(period, values.length);

        const result = [];
        for (let i = period - 1; i < values.length; i++) {
            const windowValues = values.slice(Math.max(0, i - period + 1), i + 1);
            const sum = windowValues.reduce((a, b) => a + b, 0);
            result.push(sum / windowValues.length);
        }
        return result;
    }

    calculateRSI(values, period) {
        if (!values || values.length <= period) {
            return [50]; // Возвращаем нейтральный RSI, если недостаточно данных
        }

        // Ограничиваем период размером массива
        period = Math.min(period, values.length - 1);

        const result = [];
        const changes = [];

        for (let i = 1; i < values.length; i++) {
            changes.push(values[i] - values[i-1]);
        }

        for (let i = period; i < changes.length + 1; i++) {
            const window = changes.slice(Math.max(0, i - period), i);
            const gains = window.filter(c => c > 0).reduce((sum, c) => sum + c, 0) / period;
            const losses = Math.abs(window.filter(c => c < 0).reduce((sum, c) => sum + c, 0)) / period;

            const relativeStrength = gains / (losses || 0.001); // Избегаем деления на ноль
            const rsi = 100 - (100 / (1 + relativeStrength));

            result.push(rsi);
        }

        return result;
    }

    calculateVolatility(values, period) {
        if (!values || values.length < period) {
            return 0.01; // Возвращаем минимальную волатильность, если недостаточно данных
        }

        // Ограничиваем период размером массива
        period = Math.min(period, values.length - 1);

        const returns = [];
        for (let i = 1; i < values.length; i++) {
            // Защита от деления на ноль
            returns.push((values[i] / Math.max(0.001, values[i-1])) - 1);
        }

        // Берем последние period элементов для расчета текущей волатильности
        const recentReturns = returns.slice(-period);

        const mean = recentReturns.reduce((sum, r) => sum + r, 0) / recentReturns.length;
        const variance = recentReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / recentReturns.length;

        return Math.sqrt(variance);
    }

    calculateMomentum(values, period) {
        if (!values || values.length <= period) {
            return [0]; // Возвращаем нулевой импульс, если недостаточно данных
        }

        // Ограничиваем период размером массива
        period = Math.min(period, values.length - 1);

        const result = [];

        for (let i = period; i < values.length; i++) {
            // Защита от деления на ноль
            result.push((values[i] / Math.max(0.001, values[i - period])) - 1);
        }

        return result;
    }

    calculateDayOfWeekEffect(rates) {
        if (!rates || rates.length === 0) {
            // Возвращаем нейтральные значения, если нет данных
            return {0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1};
        }

        // Группируем курсы по дням недели
        const dayGroups = [[], [], [], [], [], [], []];

        rates.forEach(rate => {
            if (rate && rate.date instanceof Date && !isNaN(rate.date.getTime())) {
                const day = rate.date.getDay();
                dayGroups[day].push(rate);
            }
        });

        // Рассчитываем среднее % изменение для каждого дня
        const dayEffects = {};

        for (let day = 0; day < 7; day++) {
            const dayRates = dayGroups[day];
            if (dayRates.length < 2) {
                dayEffects[day] = 1; // Нейтрально, если недостаточно данных
                continue;
            }

            // Сортируем по дате, чтобы обеспечить правильный порядок
            dayRates.sort((a, b) => a.date.getTime() - b.date.getTime());

            // Рассчитываем среднее дневное изменение
            let sumChanges = 0;
            let count = 0;

            for (let i = 1; i < dayRates.length; i++) {
                // Защита от деления на ноль
                sumChanges += (dayRates[i].buy / Math.max(0.001, dayRates[i-1].buy)) - 1;
                count++;
            }

            dayEffects[day] = count > 0 ? 1 + (sumChanges / count) : 1;
        }

        return dayEffects;
    }
}

module.exports = new ForecastService();
