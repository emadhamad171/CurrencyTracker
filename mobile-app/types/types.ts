// Тип для ответа API с курсами валют
export interface RatesResponse {
  base: string; // Базовая валюта
  timestamp: number; // Время обновления данных
  rates: Record<string, number>; // Курсы валют (ключ - код валюты, значение - курс)
  source: string; // Источник данных
}

// Тип для исторических данных
export interface HistoricalRates {
  base: string; // Базовая валюта
  target: string; // Целевая валюта
  data: Array<{
    // Массив с историческими данными
    date: string; // Дата в формате 'YYYY-MM-DD'
    rate: number; // Курс на указанную дату
  }>;
  source: string; // Источник данных
}

// Тип для прогноза курса валюты
export interface ForecastData {
  base: string; // Базовая валюта
  target: string; // Целевая валюта
  forecast: Array<{
    // Массив с прогнозными данными
    date: string; // Дата в формате 'YYYY-MM-DD'
    value: number; // Прогнозное значение курса
    confidence: number; // Уровень уверенности в прогнозе (0-1)
  }>;
  method: string; // Метод прогнозирования
}

// Тип для источника данных
export interface DataSource {
  id: string; // Идентификатор источника
  name: string; // Название источника
  description?: string; // Описание источника
  url?: string; // URL источника данных
  logo?: string; // URL логотипа источника
}

// Тип для настроек приложения по работе с валютами
export interface CurrencySettings {
  baseCurrency: string; // Базовая валюта
  favoriteCurrencies: string[]; // Список избранных валют
  defaultSource: string; // Источник данных по умолчанию
  updateInterval: number; // Интервал обновления данных (мс)
  decimalPlaces: number; // Количество знаков после запятой
}
// types/fundamentalAnalysis.ts

// Экономические индикаторы
export interface EconomicIndicator {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

// DXY (Индекс доллара)
export interface DXYData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'bullish' | 'bearish' | 'sideways';
  lastUpdate: string;
}

// Процентные ставки центробанков
export interface InterestRates {
  fed: {
    current: number;
    previous: number;
    nextMeeting: string;
    expectedChange: number;
  };
  ecb: {
    current: number;
    previous: number;
    nextMeeting: string;
    expectedChange: number;
  };
  nbu: {
    current: number;
    previous: number;
    nextMeeting: string;
  };
}

// ВВП данные
export interface GDPData {
  country: string;
  currency: string;
  current: number;
  previous: number;
  forecast: number;
  quarter: string;
  nextRelease: string;
  impact: 'high' | 'medium' | 'low';
}

// Экономический календарь
export interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  currency: string;
  event: string;
  importance: 'high' | 'medium' | 'low';
  forecast?: number;
  previous?: number;
  actual?: number;
  description: string;
  impact: string;
}

// Прогноз на основе фундаментального анализа
export interface FundamentalForecast {
  currency: string;
  baseCurrency: string;
  direction: 'bullish' | 'bearish' | 'sideways';
  confidence: number; // 0-100
  timeframe: '1week' | '1month' | '3months';
  reasoning: string[];
  keyFactors: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  targetLevels?: {
    support: number;
    resistance: number;
  };
  lastAnalysis: string;
}

// Общий dashboard данных
export interface FundamentalDashboard {
  dxy: DXYData;
  interestRates: InterestRates;
  gdp: {
    usa: GDPData;
    eurozone: GDPData;
    ukraine: GDPData;
  };
  upcomingEvents: EconomicEvent[];
  forecasts: {
    usdUah: FundamentalForecast;
    eurUah: FundamentalForecast;
    eurUsd: FundamentalForecast;
  };
  lastUpdate: string;
}

// API методы для фундаментального анализа
export interface FundamentalAnalysisAPI {
  // Получить DXY данные
  getDXYData(): Promise<DXYData>;

  // Получить процентные ставки
  getInterestRates(): Promise<InterestRates>;

  // Получить ВВП данные
  getGDPData(countries: string[]): Promise<GDPData[]>;

  // Получить экономический календарь
  getEconomicCalendar(days?: number): Promise<EconomicEvent[]>;

  // Получить фундаментальный прогноз
  getFundamentalForecast(currencyPair: string): Promise<FundamentalForecast>;

  // Получить полный dashboard
  getFundamentalDashboard(): Promise<FundamentalDashboard>;

  // Получить анализ конкретного индикатора
  getIndicatorAnalysis(indicator: string): Promise<EconomicIndicator>;
}
