// Типы для работы с валютами в мобильном приложении

// Тип для информации о валюте
export interface Currency {
    code: string;       // Код валюты (например, USD, EUR)
    name: string;       // Полное название валюты
    symbol: string;     // Символ валюты ($, €, etc.)
    flag?: string;      // Эмодзи флага страны (опционально)
}

// Тип для курса валюты
export interface ExchangeRate {
    from: string;       // Исходная валюта (базовая)
    to: string;         // Целевая валюта
    rate: number;       // Курс обмена
    timestamp: number;  // Время обновления курса (UNIX timestamp)
}

// Тип для данных о курсе с предыдущим значением (для отображения изменений)
export interface RateWithChange {
    code: string;            // Код валюты
    name: string;            // Название валюты
    rate: number;            // Текущий курс
    previousRate?: number;   // Предыдущий курс
    change?: number;         // Изменение в абсолютных значениях
    changePercent?: number;  // Изменение в процентах
    timestamp: number;       // Время обновления курса
}

// Тип для ответа API с курсами валют
export interface RatesResponse {
    base: string;                   // Базовая валюта
    timestamp: number;              // Время обновления данных
    rates: Record<string, number>;  // Курсы валют (ключ - код валюты, значение - курс)
    source: string;                 // Источник данных
}

// Тип для исторических данных
export interface HistoricalRates {
    base: string;                   // Базовая валюта
    target: string;                 // Целевая валюта
    data: Array<{                   // Массив с историческими данными
        date: string;                 // Дата в формате 'YYYY-MM-DD'
        rate: number;                 // Курс на указанную дату
    }>;
    source: string;                 // Источник данных
}

// Тип для прогноза курса валюты
export interface ForecastData {
    base: string;                   // Базовая валюта
    target: string;                 // Целевая валюта
    forecast: Array<{               // Массив с прогнозными данными
        date: string;                 // Дата в формате 'YYYY-MM-DD'
        value: number;                // Прогнозное значение курса
        confidence: number;           // Уровень уверенности в прогнозе (0-1)
    }>;
    method: string;                 // Метод прогнозирования
}

// Тип для источника данных
export interface DataSource {
    id: string;                     // Идентификатор источника
    name: string;                   // Название источника
    description?: string;           // Описание источника
    url?: string;                   // URL источника данных
    logo?: string;                  // URL логотипа источника
}

// Тип для настроек приложения по работе с валютами
export interface CurrencySettings {
    baseCurrency: string;           // Базовая валюта
    favoriteCurrencies: string[];   // Список избранных валют
    defaultSource: string;          // Источник данных по умолчанию
    updateInterval: number;         // Интервал обновления данных (мс)
    decimalPlaces: number;          // Количество знаков после запятой
}

// Перечисление периодов для исторических данных
export enum HistoricalPeriod {
    WEEK = '7days',
    MONTH = '30days',
    THREE_MONTHS = '90days',
    YEAR = '365days'
}
