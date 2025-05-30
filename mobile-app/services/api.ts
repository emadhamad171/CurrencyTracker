// mobile-app/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../constants/config';

// Базовая конфигурация axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Типы данных
export interface CurrencyRate {
  source: string;
  currency: string;
  baseCurrency: string;
  buy: number;
  sell: number;
  date: string;
  timestamp: number;
  type?: string;
}

export interface RatesResponse {
  nbu: CurrencyRate[];
  banks: CurrencyRate[];
  black: CurrencyRate[];
  timestamp: number;
}

export interface HistoricalRateData {
  date: string;
  source: string;
  buy: {
    avg: number;
    min: number;
    max: number;
  };
  sell: {
    avg: number;
    min: number;
    max: number;
  };
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ForecastData {
  date: string;
  currency: string;
  baseCurrency: string;
  buy: number;
  sell: number;
  confidence: number;
  trend?: string;
  volatility?: number;
  rsi?: number;
}

// Типы для NBU конвертера
export interface NBURate {
  r030: number; // Код валюты
  txt: string; // Название валюты на украинском
  rate: number; // Курс к гривне
  cc: string; // Код валюты (USD, EUR, etc.)
  exchangedate: string; // Дата курса
}

export interface CurrencyForConverter {
  code: string;
  name: string;
  rate: number; // Курс к UAH
  symbol?: string;
}

// ============ ТИПЫ ДЛЯ ФУНДАМЕНТАЛЬНОГО АНАЛИЗА ============
export interface FundamentalDashboard {
  indicators: {
    dxy: {
      value: number;
      change: number;
      changePercent: number;
      trend: 'up' | 'down' | 'sideways';
    };
    rates: {
      fed: number;
      ecb: number;
      nbu: number;
      difference: number;
    };
    gdp: {
      usa: { value: number; trend: string };
      eu: { value: number; trend: string };
      ukraine: { value: number; trend: string };
    };
  };
  forecasts: {
    USDUAH: {
      direction: 'bullish' | 'bearish' | 'sideways';
      confidence: number;
      reasons: string[];
    };
    EURUAH: {
      direction: 'bullish' | 'bearish' | 'sideways';
      confidence: number;
      reasons: string[];
    };
  };
  upcomingEvents: Array<{
    date: string;
    event: string;
    currency: string;
    impact: string;
    description: string;
  }>;
  lastUpdate: string;
}

export interface DXYData {
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'sideways';
}

export interface InterestRatesData {
  fed: number;
  ecb: number;
  nbu: number;
  difference: number;
}

export interface GDPData {
  usa: { value: number; trend: string };
  eu: { value: number; trend: string };
  ukraine: { value: number; trend: string };
}

export interface EconomicEvent {
  date: string;
  event: string;
  currency: string;
  impact: string;
  description: string;
}

// Кеширование данных в AsyncStorage
const cacheData = async (key: string, data: any, ttl: number) => {
  try {
    const item = {
      data,
      expiry: Date.now() + ttl,
    };
    await AsyncStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

// Получение кешированных данных
const getCachedData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (!value) {
      return null;
    }

    const item = JSON.parse(value);
    if (Date.now() > item.expiry) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
};

export const api = {
  getAvailableCurrencies: async (): Promise<Currency[]> => {
    try {
      const response = await axiosInstance.get('/currencies');
      return response.data;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }
  },

  // Получение текущих курсов валют
  getCurrentRates: async (
    baseCurrency = 'UAH',
    currencies = ['USD', 'EUR']
  ): Promise<RatesResponse> => {
    try {
      const response = await axiosInstance.get('/rates', {
        params: {
          base: baseCurrency,
          currencies: currencies.join(','),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching historical rates:', error);
      throw error;
    }
  },

  // Получение исторических данных
  getHistoricalRates: async (params: {
    currency?: string;
    period?: string;
  }): Promise<HistoricalRateData[]> => {
    try {
      const response = await axiosInstance.get('/history', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching historical rates:', error);
      throw error;
    }
  },

  // ============ КОНВЕРТЕР ВАЛЮТ ============

  // Получение курсов НБУ для конвертера (через ваш бэкенд)
  getRatesForConverter: async (): Promise<NBURate[]> => {
    try {
      const response = await axiosInstance.get('/converter');
      return response.data;
    } catch (error) {
      console.error('Error fetching converter rates:', error);
      throw error;
    }
  },

  // ============ ФУНДАМЕНТАЛЬНЫЙ АНАЛИЗ ============

  // Получение полного фундаментального анализа (ГЛАВНЫЙ МЕТОД)
  getFundamentalDashboard: async (): Promise<FundamentalDashboard> => {
    const cacheKey = 'fundamental_dashboard';
    const cached = await getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await axiosInstance.get('/fundamental-analysis');
      const data = response.data;

      // Кешируем на 15 минут (фундаментальные данные меняются медленно)
      await cacheData(cacheKey, data, 15 * 60 * 1000);
      return data;
    } catch (error) {
      console.error('Error fetching fundamental dashboard:', error);
      throw new Error('Не удалось получить фундаментальный анализ');
    }
  },

  // ============ PRICE ALERTS ============

  // Создание алерта
  createPriceAlert: async (alertData: {
    userId: string;
    currencyPair: 'USDUAH' | 'EURUAH';
    alertType: 'above' | 'below';
    targetPrice: number;
    pushToken: string;
  }) => {
    try {
      const response = await axiosInstance.post('/alerts', alertData);
      return response.data;
    } catch (error) {
      console.error('Error creating price alert:', error);
      throw error;
    }
  },

  // Получение алертов пользователя
  getUserPriceAlerts: async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/alerts/user/${userId}`);
      return response.data.alerts || [];
    } catch (error) {
      console.error('Error fetching user alerts:', error);
      throw error;
    }
  },

  // Удаление алерта
  deletePriceAlert: async (alertId: string, userId: string) => {
    try {
      const response = await axiosInstance.delete(`/alerts/${alertId}`, {
        data: { userId },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  },

  // Статистика алертов
  getPriceAlertsStats: async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/alerts/user/${userId}/stats`);
      return response.data.stats;
    } catch (error) {
      console.error('Error fetching alerts stats:', error);
      return { active: 0, triggered: 0, total: 0 };
    }
  },
  getCurrentRatesForAlerts: async (currencies = ['USD', 'EUR']) => {
    try {
      // Можем передать конкретные валюты в параметрах
      const currenciesParam = currencies.join(',');
      const response = await axiosInstance.get('/alerts/rates', {
        params: { currencies: currenciesParam },
      });

      return response.data;
    } catch (error) {
      // Fallback значения
      const fallbackRates = {};
      currencies.forEach(currency => {
        const pairKey = `${currency}UAH`;
        fallbackRates[pairKey] = {
          market: currency === 'USD' ? 41.8 : 44.6,
          currency,
          name: `${currency} (fallback)`,
        };
      });

      return fallbackRates;
    }
  },
  // ============ УТИЛИТЫ ============

  // Очистить кеш фундаментального анализа
  clearFundamentalCache: async (): Promise<void> => {
    try {
      const fundamentalKeys = [
        'fundamental_dashboard',
        'dxy_data',
        'fundamental_rates',
        'fundamental_gdp',
        'economic_events',
      ];

      await Promise.all(fundamentalKeys.map(key => AsyncStorage.removeItem(key)));
    } catch (error) {
      console.error('Error clearing fundamental cache:', error);
    }
  },

  // Принудительное обновление всех фундаментальных данных
  refreshFundamentalData: async (): Promise<FundamentalDashboard> => {
    try {
      // Очищаем кеш
      await api.clearFundamentalCache();

      // Получаем свежие данные
      return await api.getFundamentalDashboard();
    } catch (error) {
      console.error('Error refreshing fundamental data:', error);
      throw new Error('Не удалось обновить фундаментальные данные');
    }
  },
};
