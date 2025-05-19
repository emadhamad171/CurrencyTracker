// mobile-app/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, CACHE_TTL } from '../constants/config';

// Базовая конфигурация axios
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
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

// Кеширование данных в AsyncStorage
const cacheData = async (key: string, data: any, ttl: number) => {
    try {
        const item = {
            data,
            expiry: Date.now() + ttl
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
        if (!value) return null;

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

// API запросы
export const api = {
    // Получение списка доступных валют
    getAvailableCurrencies: async (): Promise<Currency[]> => {
        try {
            const response = await axiosInstance.get('/currencies');
            return  response.data;

        } catch (error) {
            console.error('Error fetching currencies:', error);
            throw error;
        }
    },

    // Получение текущих курсов валют
    getCurrentRates: async (baseCurrency = 'UAH', currencies = ['USD', 'EUR']): Promise<RatesResponse> => {
        try {
            const response = await axiosInstance.get('/rates', {
                params: {
                    base: baseCurrency,
                    currencies: currencies.join(',')
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching current rates:', error);
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
            return  response.data;
        } catch (error) {
            console.error('Error fetching historical rates:', error);
            throw error;
        }
    },

    getForecast: async (params: {
        currency?: string;
        method?: 'linear' | 'advanced' | 'ml';
    }): Promise<ForecastData[]> => {
        try {
            const response = await axiosInstance.get('/forecast', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw error;
        }
    }
};
