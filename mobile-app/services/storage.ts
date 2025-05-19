import AsyncStorage from '@react-native-async-storage/async-storage';
import { RatesResponse, HistoricalRates, CurrencySettings } from '../types/currency.types';

// Ключи для AsyncStorage
const STORAGE_KEYS = {
    CURRENT_RATES: 'currency_tracker:current_rates',
    HISTORICAL_RATES: 'currency_tracker:historical_rates',
    SETTINGS: 'currency_tracker:settings',
    FAVORITES: 'currency_tracker:favorites',
    LAST_UPDATED: 'currency_tracker:last_updated',
    DATA_SOURCES: 'currency_tracker:data_sources'
};

// Сохранение текущих курсов валют
export const saveCurrentRates = async (data: RatesResponse): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_RATES, jsonValue);
        // Обновляем время последнего обновления
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_UPDATED, Date.now().toString());
    } catch (error) {
        console.error('Error saving current rates:', error);
    }
};

// Получение текущих курсов валют из хранилища
export const getStoredCurrentRates = async (): Promise<RatesResponse | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_RATES);
        return jsonValue !== null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error('Error getting stored rates:', error);
        return null;
    }
};

// Сохранение исторических данных
export const saveHistoricalRates = async (
    baseCurrency: string,
    targetCurrency: string,
    period: string,
    data: HistoricalRates
): Promise<void> => {
    try {
        // Создаем ключ, включающий параметры запроса
        const key = `${STORAGE_KEYS.HISTORICAL_RATES}:${baseCurrency}:${targetCurrency}:${period}`;
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
        console.error('Error saving historical rates:', error);
    }
};

// Получение исторических данных из хранилища
export const getStoredHistoricalRates = async (
    baseCurrency: string,
    targetCurrency: string,
    period: string
): Promise<HistoricalRates | null> => {
    try {
        // Создаем ключ, включающий параметры запроса
        const key = `${STORAGE_KEYS.HISTORICAL_RATES}:${baseCurrency}:${targetCurrency}:${period}`;
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue !== null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error('Error getting stored historical rates:', error);
        return null;
    }
};

// Сохранение настроек приложения
export const saveSettings = async (settings: CurrencySettings): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(settings);
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, jsonValue);
    } catch (error) {
        console.error('Error saving settings:', error);
    }
};

// Получение настроек приложения
export const getSettings = async (): Promise<CurrencySettings | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);

        if (jsonValue !== null) {
            return JSON.parse(jsonValue);
        }

        // Возвращаем настройки по умолчанию, если они не найдены
        return {
            baseCurrency: 'USD',
            favoriteCurrencies: ['EUR', 'GBP', 'JPY', 'UAH', 'PLN'],
            defaultSource: 'national_bank',
            updateInterval: 3600000, // 1 час в миллисекундах
            decimalPlaces: 4
        };
    } catch (error) {
        console.error('Error getting settings:', error);
        return null;
    }
};

// Сохранение списка избранных валют
export const saveFavoriteCurrencies = async (currencies: string[]): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(currencies);
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, jsonValue);
    } catch (error) {
        console.error('Error saving favorite currencies:', error);
    }
};

// Получение списка избранных валют
export const getFavoriteCurrencies = async (): Promise<string[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
        return jsonValue !== null ? JSON.parse(jsonValue) : ['EUR', 'GBP', 'JPY', 'UAH', 'PLN'];
    } catch (error) {
        console.error('Error getting favorite currencies:', error);
        return ['EUR', 'GBP', 'JPY', 'UAH', 'PLN'];
    }
};

// Получение времени последнего обновления данных
export const getLastUpdated = async (): Promise<number | null> => {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
        return value !== null ? parseInt(value, 10) : null;
    } catch (error) {
        console.error('Error getting last updated timestamp:', error);
        return null;
    }
};

// Очистка всех сохраненных данных (для отладки или при выходе из аккаунта)
export const clearAllData = async (): Promise<void> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const currencyKeys = keys.filter(key => key.startsWith('currency_tracker:'));
        await AsyncStorage.multiRemove(currencyKeys);
    } catch (error) {
        console.error('Error clearing all data:', error);
    }
};
