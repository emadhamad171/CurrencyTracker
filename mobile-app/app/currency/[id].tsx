import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api, CurrencyRate, HistoricalRateData } from '../../services/api';
import { CurrencyRateCard } from '../../components/currency/CurrencyRateCard';
import { CurrencyLineChart } from '../../components/charts/LineChart';
import { DEFAULT_CURRENCIES } from '../../constants/config';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function CurrencyDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [rates, setRates] = useState<CurrencyRate[]>([]);
    const [historicalData, setHistoricalData] = useState<HistoricalRateData[]>([]);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Функция для загрузки данных о конкретной валюте
    const fetchCurrencyData = async () => {
        try {
            setLoading(true);

            // Получаем текущие курсы валюты
            const currencyData = await api.getCurrentRates(
                DEFAULT_CURRENCIES.BASE,
                [id as string]
            );

            // Объединяем курсы из всех источников
            const allRates = [
                ...currencyData.nbu,
                ...currencyData.privatbank,
                ...currencyData.interbank
            ].filter(rate => rate.currency === id);

            setRates(allRates);

            // Загружаем исторические данные
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30); // Последние 30 дней

            const historical = await api.getHistoricalRates({
                currency: id as string,
                base: DEFAULT_CURRENCIES.BASE,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                interval: 'day'
            });

            setHistoricalData(historical);
        } catch (error) {
            console.error(`Error fetching data for currency ${id}:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCurrencyData();
        }
    }, [id]);

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f8f9fa' }]}>
            <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
                {id} / {DEFAULT_CURRENCIES.BASE}
            </Text>

            {loading ? (
                <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#000000'} style={styles.loader} />
            ) : (
                <>
                    <Text style={[styles.subtitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Current Rates
                    </Text>

                    {rates.map((rate, index) => (
                        <CurrencyRateCard
                            key={index}
                            source={rate.source}
                            currency={rate.currency}
                            baseCurrency={rate.baseCurrency}
                            buy={rate.buy}
                            sell={rate.sell}
                            date={new Date(rate.date)}
                        />
                    ))}

                    {historicalData.length > 0 && (
                        <>
                            <Text style={[styles.subtitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                                Historical Trend (30 days)
                            </Text>

                            <CurrencyLineChart
                                data={historicalData}
                                currency={id as string}
                                baseCurrency={DEFAULT_CURRENCIES.BASE}
                                showSellRate={true}
                            />
                        </>
                    )}
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    loader: {
        marginTop: 100,
    },
});
