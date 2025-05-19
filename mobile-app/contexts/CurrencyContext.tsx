import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { api, Currency, CurrencyRate } from '../services/api';
import { DEFAULT_CURRENCIES } from '../constants/config';

interface CurrencyContextType {
    currencies: Currency[];
    selectedCurrency: string;
    baseCurrency: string;
    availableCurrencies: string[];
    currentRates: {
        nbu: CurrencyRate[];
        privatbank: CurrencyRate[];
        interbank: CurrencyRate[];
    };
    loading: boolean;
    error: string | null;
    setSelectedCurrency: (currency: string) => void;
    setBaseCurrency: (currency: string) => void;
    refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCIES.SELECTED[0]);
    const [baseCurrency, setBaseCurrency] = useState(DEFAULT_CURRENCIES.BASE);
    const [currentRates, setCurrentRates] = useState<{
        nbu: CurrencyRate[];
        privatbank: CurrencyRate[];
        interbank: CurrencyRate[];
    }>({ nbu: [], privatbank: [], interbank: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Получение списка доступных валют
    const fetchCurrencies = async () => {
        try {
            const currenciesData = await api.getAvailableCurrencies();
            setCurrencies(currenciesData);
        } catch (err) {
            setError('Failed to fetch available currencies');
            console.error('Error fetching currencies:', err);
        }
    };

    // Получение текущих курсов валют
    const fetchRates = async () => {
        try {
            setLoading(true);
            setError(null);

            const ratesData = await api.getCurrentRates(
                baseCurrency,
                DEFAULT_CURRENCIES.SELECTED
            );

            setCurrentRates(ratesData);
        } catch (err) {
            setError('Failed to fetch current rates');
            console.error('Error fetching rates:', err);
        } finally {
            setLoading(false);
        }
    };

    // Обновление данных
    const refreshRates = async () => {
        await fetchRates();
    };

    // Получаем уникальные доступные валюты
    const availableCurrencies = [...new Set(currencies?.map(c => c.code))];

    // Инициализация данных
    useEffect(() => {
        fetchCurrencies();
        fetchRates();

        // Периодическое обновление курсов
        const intervalId = setInterval(() => {
            fetchRates();
        }, 30 * 60 * 1000); // 30 минут

        return () => clearInterval(intervalId);
    }, []);

    // Обновление при изменении базовой валюты
    useEffect(() => {
        fetchRates();
    }, [baseCurrency]);

    const value: CurrencyContextType = {
        currencies,
        selectedCurrency,
        baseCurrency,
        availableCurrencies,
        currentRates,
        loading,
        error,
        setSelectedCurrency,
        setBaseCurrency,
        refreshRates
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
