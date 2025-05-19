import React, {useState, useEffect, useMemo} from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Modal, FlatList } from 'react-native';
import { CurrencyLineChart } from '../../components/charts/LineChart';
import { Currency } from '../../services/api';
import { DEFAULT_CURRENCIES } from '../../constants/config';
import { useColorScheme } from '../../hooks/useColorScheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchHistoricalRates } from '../../store/slices/historySlice';
import {fetchRates} from "@/store/slices/currencySlice";

// Периоды для исторических данных
const PERIODS = {
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter',
    YEAR: 'year'
};
const AVAILABLE_CURRENCIES: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' }
];
export default function HistoryScreen() {
    const dispatch = useAppDispatch();
    const {
        historicalData,
        isLoading,
        error,
        lastUpdated
    } = useAppSelector(state => state.history);

    // Получаем состояние сети из централизованного хранилища
    const { isOffline } = useAppSelector(state => state.app);

    const [refreshing, setRefreshing] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(AVAILABLE_CURRENCIES[0]?.code);
    const [selectedPeriod, setSelectedPeriod] = useState(PERIODS.MONTH); // Дефолтный период - месяц

    // Modal visibility states
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
    const [periodModalVisible, setPeriodModalVisible] = useState(false);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Создаем ключ кэша для текущих параметров

    // Индикатор состояния данных
    const dataSourceInfo = useMemo(() => {
        if (!(historicalData?.length > 0)) return null;
        return {
            isOffline: isOffline,
            lastUpdated: lastUpdated,
        };
    }, [historicalData, isOffline, lastUpdated]);

    // Загрузка списка валют


    // Загрузка исторических данных

    // Обработчик обновления
    const handleRefresh = () => {
        setRefreshing(true);
        dispatch(fetchHistoricalRates({
            currency: selectedCurrency.toLowerCase(),
            period: selectedPeriod
        })).finally(() => setRefreshing(false));

    };

    // Helper function to get period name
    const getPeriodName = (periodCode: string) => {
        switch (periodCode) {
            case PERIODS.WEEK:
                return 'Weekly';
            case PERIODS.MONTH:
                return 'Monthly';
            case PERIODS.QUARTER:
                return 'Quarterly';
            case PERIODS.YEAR:
                return 'Yearly';
            default:
                return periodCode;
        }
    };


    // Загрузка данных при изменении параметров
    useEffect(() => {
        dispatch(fetchHistoricalRates({
            currency: selectedCurrency.toLowerCase(),
            period: selectedPeriod
        }));
    }, [dispatch, selectedCurrency, selectedPeriod]);


    return (
        <ScrollView
            style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
        >
            <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
                Historical Exchange Rates
            </Text>

            {/* Индикатор оффлайн/онлайн данных */}
            {dataSourceInfo && (
                <View style={[
                    styles.dataSourceIndicator,
                    {
                        backgroundColor: dataSourceInfo.isOffline
                            ? (isDark ? '#2c2c2e' : '#fff3e0')
                            : (isDark ? '#2a3a2a' : '#e8f5e9')
                    }
                ]}>
                    <MaterialCommunityIcons
                        name={dataSourceInfo.isOffline ? "wifi-off" : "wifi-check"}
                        size={20}
                        color={dataSourceInfo.isOffline ? (isDark ? '#ff9800' : '#ff6d00') : (isDark ? '#4caf50' : '#388e3c')}
                    />
                    <Text style={{
                        color: dataSourceInfo.isOffline ? (isDark ? '#ff9800' : '#ff6d00') : (isDark ? '#4caf50' : '#388e3c'),
                        marginLeft: 8
                    }}>
                        {dataSourceInfo.isOffline
                            ? `Offline mode: Using data from ${new Date(dataSourceInfo.lastUpdated).toLocaleString()}`
                            : 'Online: Using latest data'
                        }
                    </Text>
                </View>
            )}

            <View style={[styles.filterContainer, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
                {/* Currency Selector */}
                <View style={styles.selectorContainer}>
                    <Text style={[styles.selectorLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Currency:
                    </Text>
                    <TouchableOpacity
                        style={[styles.selectorButton, { backgroundColor: isDark ? '#444444' : '#f1f1f1' }]}
                        onPress={() => setCurrencyModalVisible(true)}
                    >
                        <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>
                            {selectedCurrency}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Period Selector */}
                <View style={styles.selectorContainer}>
                    <Text style={[styles.selectorLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Period:
                    </Text>
                    <TouchableOpacity
                        style={[styles.selectorButton, { backgroundColor: isDark ? '#444444' : '#f1f1f1' }]}
                        onPress={() => setPeriodModalVisible(true)}
                    >
                        <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>
                            {getPeriodName(selectedPeriod)}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading && !refreshing ? (
                <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#000000'} style={styles.loader} />
            ) :
                error && !historicalData ? (
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: isDark ? '#ff6b6b' : '#dc3545' }]}>
                        {error}
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: isDark ? '#444444' : '#eeeeee' }]}
                        onPress={() => dispatch(fetchHistoricalRates({
                            currency: selectedCurrency.toLowerCase(),
                            period: selectedPeriod
                        }))}
                    >
                        <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : historicalData?.length > 0? (
                <View style={styles.chartWrapper}>
                    <CurrencyLineChart
                        data={{ data: historicalData}}
                        title={`${selectedCurrency} to ${DEFAULT_CURRENCIES.BASE} Exchange Rate`}
                        currency={selectedCurrency}
                        baseCurrency={DEFAULT_CURRENCIES.BASE}
                        showSellRate={true}
                    />
                </View>
            )
            : (
                <Text style={[styles.noDataText, { color: isDark ? '#ffffff' : '#000000' }]}>
                    No historical data available for the selected parameters.
                </Text>
            )}

            {/* Отображение последнего обновления */}
            {lastUpdated&& (
                <Text style={[styles.updatedText, { color: isDark ? '#aaaaaa' : '#666666' }]}>
                    Last updated: {new Date(lastUpdated).toLocaleString()}
                    {isOffline ? ' (offline data)' : ''}
                </Text>
            )}

            <View style={styles.footer} />

            {/* Currency Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={currencyModalVisible}
                onRequestClose={() => setCurrencyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
                        <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                            Select Currency
                        </Text>
                        <ScrollView style={styles.modalScrollView}>
                            {AVAILABLE_CURRENCIES.filter(c => c.code !== DEFAULT_CURRENCIES.BASE).map(currency => (
                                <TouchableOpacity
                                    key={currency.code}
                                    style={[
                                        styles.modalItem,
                                        selectedCurrency === currency.code && { backgroundColor: isDark ? '#444444' : '#e6f7ff' }
                                    ]}
                                    onPress={() => {
                                        setSelectedCurrency(currency.code);
                                        setCurrencyModalVisible(false);
                                    }}
                                >
                                    <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>
                                        {currency.code} - {currency.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={[styles.modalCloseButton, { backgroundColor: isDark ? '#444444' : '#eeeeee' }]}
                            onPress={() => setCurrencyModalVisible(false)}
                        >
                            <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={periodModalVisible}
                onRequestClose={() => setPeriodModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
                        <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                            Select Period
                        </Text>
                        <ScrollView style={styles.modalScrollView}>
                            {[
                                { label: 'Weekly', value: PERIODS.WEEK },
                                { label: 'Monthly', value: PERIODS.MONTH },
                                { label: 'Quarterly', value: PERIODS.QUARTER },
                                { label: 'Yearly', value: PERIODS.YEAR }
                            ].map(period => (
                                <TouchableOpacity
                                    key={period.value}
                                    style={[
                                        styles.modalItem,
                                        selectedPeriod === period.value && { backgroundColor: isDark ? '#444444' : '#e6f7ff' }
                                    ]}
                                    onPress={() => {
                                        setSelectedPeriod(period.value);
                                        setPeriodModalVisible(false);
                                    }}
                                >
                                    <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>
                                        {period.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={[styles.modalCloseButton, { backgroundColor: isDark ? '#444444' : '#eeeeee' }]}
                            onPress={() => setPeriodModalVisible(false)}
                        >
                            <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    dataSourceIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        margin: 16,
        borderRadius: 8,
        justifyContent: 'center',
    },
    filterContainer: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    loader: {
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartWrapper: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        padding: 12,
        overflow: 'hidden',
    },
    selectorContainer: {
        marginBottom: 16,
    },
    selectorLabel: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
    },
    selectorButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    errorContainer: {
        margin: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        padding: 10,
        borderRadius: 5,
    },
    noDataText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 100,
    },
    updatedText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    footer: {
        height: 40,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalScrollView: {
        marginBottom: 16,
        maxHeight: 300,
    },
    modalItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 4,
    },
    modalCloseButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
});
