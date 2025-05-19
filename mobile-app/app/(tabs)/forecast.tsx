// mobile-app/app/(tabs)/forecast.tsx
import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Modal
} from 'react-native';
import {ForecastChart} from '../../components/charts/ForecastChart';
import {api, ForecastData, HistoricalRateData, Currency} from '../../services/api';
import {DEFAULT_CURRENCIES} from '../../constants/config';
import {useColorScheme} from '../../hooks/useColorScheme';

// Enum for forecast methods to improve type safety
enum ForecastMethod {
    LINEAR = 'linear',
    ADVANCED = 'advanced',
    MACHINE_LEARNING = 'ml'
}

// Fixed forecast days by method
const FORECAST_DAYS = {
    [ForecastMethod.LINEAR]: 7,
    [ForecastMethod.ADVANCED]: 14,
    [ForecastMethod.MACHINE_LEARNING]: 30
};

export default function ForecastScreen() {
    // State management with more explicit types
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [forecastData, setForecastData] = useState<ForecastData[]>([]);
    const [historicalData, setHistoricalData] = useState<HistoricalRateData[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState<string>(DEFAULT_CURRENCIES.SELECTED[0]);
    const [forecastMethod, setForecastMethod] = useState<ForecastMethod>(ForecastMethod.ADVANCED);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
    const [methodModalVisible, setMethodModalVisible] = useState(false);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Get current forecast days based on selected method
    const forecastDays = FORECAST_DAYS[forecastMethod];

    // Memoized currencies list to prevent unnecessary re-renders
    const availableCurrencies = useMemo(() =>
            currencies.filter(c => c.code !== DEFAULT_CURRENCIES.BASE),
        [currencies]
    );

    // Fetch available currencies
    const fetchCurrencies = useCallback(async () => {
        try {
            const data = await api.getAvailableCurrencies();
            setCurrencies(data);
        } catch (error) {
            console.error('Error fetching currencies:', error);
            setError('Failed to load available currencies');
        }
    }, []);

    // Comprehensive forecast data fetching with improved error handling
    const fetchForecastData = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);

            // Fetch forecast with simplified parameters (only currency and method)
            const forecastResult = await api.getForecast({
                currency: selectedCurrency.toLowerCase(),
                method: forecastMethod
            }).catch(err => {
                throw new Error(`Failed to generate forecast: ${err.message}`);
            });

            // Validate forecast data
            if (!forecastResult || forecastResult.length === 0) {
                throw new Error('No forecast data could be generated');
            }

            // Set dummy historical data if needed for chart
            // This is a temporary solution until we implement historical data fetching
            const dummyHistorical: HistoricalRateData[] = [
                {
                    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    source: 'NBU',
                    buy: {
                        avg: forecastResult[0].buy * 0.97,
                        min: forecastResult[0].buy * 0.95,
                        max: forecastResult[0].buy * 0.99
                    },
                    sell: {
                        avg: forecastResult[0].sell * 0.97,
                        min: forecastResult[0].sell * 0.95,
                        max: forecastResult[0].sell * 0.99
                    }
                }
            ];

            // Update state with fetched data
            setHistoricalData(dummyHistorical);
            setForecastData(forecastResult);
        } catch (error) {
            console.error('Forecast data error:', error);
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedCurrency, forecastMethod]);

    // Refresh handler
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchForecastData();
    }, [fetchForecastData]);

    // Initial data fetch
    useEffect(() => {
        fetchCurrencies();
    }, [fetchCurrencies]);

    // Forecast data fetch on parameter changes
    useEffect(() => {
        fetchForecastData();
    }, [fetchForecastData]);

    // Helper function to get method name and description
    const getMethodInfo = (method) => {
        switch (method) {
            case ForecastMethod.LINEAR:
                return {
                    name: 'Simple Linear',
                    description: 'Basic linear regression (7 days)',
                    days: FORECAST_DAYS[ForecastMethod.LINEAR]
                };
            case ForecastMethod.ADVANCED:
                return {
                    name: 'Advanced Algorithm',
                    description: 'Triple exponential smoothing (14 days)',
                    days: FORECAST_DAYS[ForecastMethod.ADVANCED]
                };
            case ForecastMethod.MACHINE_LEARNING:
                return {
                    name: 'Machine Learning',
                    description: 'ML-based prediction model (30 days)',
                    days: FORECAST_DAYS[ForecastMethod.MACHINE_LEARNING]
                };
            default:
                return { name: method, description: '', days: 7 };
        }
    };

    const renderForecastDetails = () => (
        <View
            style={[
                styles.forecastDetailsContainer,
                {backgroundColor: isDark ? '#2c2c2e' : '#ffffff'}
            ]}
        >
            <Text
                style={[
                    styles.forecastDetailsTitle,
                    {color: isDark ? '#ffffff' : '#000000'}
                ]}
            >
                Forecast Details
            </Text>

            {forecastData.map((item, index) => (
                <View
                    key={index}
                    style={[
                        styles.forecastDetailItem,
                        {borderBottomColor: isDark ? '#444444' : '#eeeeee'}
                    ]}
                >
                    <Text
                        style={[
                            styles.forecastDetailDate,
                            {color: isDark ? '#ffffff' : '#000000'}
                        ]}
                    >
                        {new Date(item.date).toLocaleDateString()}
                    </Text>
                    <View style={styles.forecastDetailValues}>
                        <Text
                            style={[
                                styles.forecastDetailValue,
                                {color: isDark ? '#4cd964' : '#28a745'}
                            ]}
                        >
                            Buy: {item.buy.toFixed(2)}
                        </Text>
                        <Text
                            style={[
                                styles.forecastDetailValue,
                                {color: isDark ? '#ff3b30' : '#dc3545'}
                            ]}
                        >
                            Sell: {item.sell.toFixed(2)}
                        </Text>
                        <Text
                            style={[
                                styles.forecastDetailConfidence,
                                {color: isDark ? '#a9a9a9' : '#666666'}
                            ]}
                        >
                            Confidence: {Math.round(item.confidence * 100)}%
                        </Text>
                        {item.trend && (
                            <Text
                                style={{
                                    color:
                                        item.trend === 'positive' ? (isDark ? '#4cd964' : '#28a745') :
                                            item.trend === 'negative' ? (isDark ? '#ff3b30' : '#dc3545') : '#888888',
                                    fontWeight: 'bold',
                                    textAlign: 'right'
                                }}
                            >
                                Trend: {item.trend.charAt(0).toUpperCase() + item.trend.slice(1)}
                            </Text>
                        )}
                        {item.volatility !== undefined && (
                            <Text
                                style={{
                                    color: isDark ? '#a9a9a9' : '#666666',
                                    fontSize: 12,
                                    textAlign: 'right',
                                    marginTop: 2
                                }}
                            >
                                Volatility: {(item as any).volatility.toFixed(2)}%
                            </Text>
                        )}
                        {(item as any).rsi !== undefined && forecastMethod === ForecastMethod.MACHINE_LEARNING && (
                            <Text
                                style={{
                                    color:
                                        (item as any).rsi > 70 ? (isDark ? '#ff3b30' : '#dc3545') :
                                            (item as any).rsi < 30 ? (isDark ? '#4cd964' : '#28a745') :
                                                isDark ? '#a9a9a9' : '#666666',
                                    fontSize: 12,
                                    textAlign: 'right',
                                    marginTop: 2
                                }}
                            >
                                RSI: {(item as any).rsi.toFixed(1)}
                            </Text>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );

    const methodInfo = getMethodInfo(forecastMethod);

    return (
        <View style={[styles.mainContainer, {backgroundColor: isDark ? '#121212' : '#f8f9fa'}]}>
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
                }
            >
                <View>
                    <Text style={[styles.screenTitle, {color: isDark ? '#ffffff' : '#000000'}]}>
                        Прогноз
                    </Text>

                    <Text style={[styles.title, {color: isDark ? '#ffffff' : '#000000'}]}>
                        Currency Rate Forecast
                    </Text>

                    <View
                        style={[
                            styles.filterContainer,
                            {backgroundColor: isDark ? '#2c2c2e' : '#ffffff'}
                        ]}
                    >
                        {/* Currency Selector */}
                        <View style={styles.selectorContainer}>
                            <Text style={[styles.selectorLabel, {color: isDark ? '#ffffff' : '#000000'}]}>
                                Currency:
                            </Text>
                            <TouchableOpacity
                                style={[styles.selectorButton, {backgroundColor: isDark ? '#444444' : '#f1f1f1'}]}
                                onPress={() => setCurrencyModalVisible(true)}
                            >
                                <Text style={{color: isDark ? '#ffffff' : '#000000'}}>
                                    {selectedCurrency}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Method Selector */}
                        <View style={styles.selectorContainer}>
                            <Text style={[styles.selectorLabel, {color: isDark ? '#ffffff' : '#000000'}]}>
                                Forecast Method:
                            </Text>
                            <TouchableOpacity
                                style={[styles.selectorButton, {backgroundColor: isDark ? '#444444' : '#f1f1f1'}]}
                                onPress={() => setMethodModalVisible(true)}
                            >
                                <Text style={{color: isDark ? '#ffffff' : '#000000'}}>
                                    {methodInfo.name}
                                </Text>
                            </TouchableOpacity>
                            <Text style={[styles.methodDescription, {color: isDark ? '#a9a9a9' : '#666666'}]}>
                                {methodInfo.description}
                            </Text>
                        </View>
                    </View>

                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator
                                size="large"
                                color={isDark ? '#ffffff' : '#000000'}
                            />
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Text
                                style={[
                                    styles.errorText,
                                    {color: isDark ? '#ff6b6b' : '#dc3545'}
                                ]}
                            >
                                {error}
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.retryButton,
                                    {backgroundColor: isDark ? '#444444' : '#eeeeee'}
                                ]}
                                onPress={fetchForecastData}
                            >
                                <Text style={{color: isDark ? '#ffffff' : '#000000'}}>
                                    Retry
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : forecastData.length > 0 ? (
                        <>
                            <View style={[
                                styles.chartOuterContainer,
                                {backgroundColor: isDark ? '#2c2c2e' : '#ffffff'}
                            ]}>
                                <View style={styles.chartTitleContainer}>
                                    <Text style={[styles.chartTitle, {color: isDark ? '#ffffff' : '#000000'}]}>
                                        {selectedCurrency} to {DEFAULT_CURRENCIES.BASE} Forecast
                                    </Text>
                                    <Text style={[styles.chartSubtitle, {color: isDark ? '#a9a9a9' : '#666666'}]}>
                                        {`${selectedCurrency}/${DEFAULT_CURRENCIES.BASE} Rate Forecast for ${forecastData.length} days`}
                                    </Text>
                                </View>
                                <View style={styles.chartWrapper}>
                                    <ForecastChart
                                        historicalData={historicalData}
                                        forecastData={forecastData}
                                        currency={selectedCurrency}
                                        baseCurrency={DEFAULT_CURRENCIES.BASE}
                                        containerStyle={{
                                            width: '100%',
                                            height: '100%',
                                            padding: 0
                                        }}
                                    />
                                </View>
                            </View>

                            {renderForecastDetails()}

                            <View style={styles.methodInfoContainer}>
                                <Text style={[styles.methodInfoTitle, {color: isDark ? '#ffffff' : '#000000'}]}>
                                    About {methodInfo.name} Method
                                </Text>
                                <Text style={[styles.methodInfoText, {color: isDark ? '#a9a9a9' : '#666666'}]}>
                                    {forecastMethod === ForecastMethod.LINEAR &&
                                        "The Simple Linear method uses basic linear regression to project future exchange rates based on historical trends. It works best for short-term forecasts with stable markets."}
                                    {forecastMethod === ForecastMethod.ADVANCED &&
                                        "The Advanced Algorithm uses triple exponential smoothing with seasonal adjustments and volatility analysis to provide more accurate medium-term forecasts that account for weekly patterns."}
                                    {forecastMethod === ForecastMethod.MACHINE_LEARNING &&
                                        "The Machine Learning forecast combines multiple indicators including moving averages, RSI, momentum analysis, and seasonality patterns to predict longer-term currency movements."}
                                </Text>
                            </View>

                            <Text
                                style={[
                                    styles.disclaimerText,
                                    {color: isDark ? '#a9a9a9' : '#666666'}
                                ]}
                            >
                                * This forecast is based on historical data analysis and should not be used as the sole
                                basis for financial decisions.
                            </Text>
                        </>
                    ) : (
                        <View style={styles.noDataContainer}>
                            <Text
                                style={[
                                    styles.noDataText,
                                    {color: isDark ? '#ffffff' : '#000000'}
                                ]}
                            >
                                Unable to generate forecast with the selected parameters.
                            </Text>
                        </View>
                    )}

                    <View style={styles.footer}/>
                </View>
            </ScrollView>

            {/* Currency Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={currencyModalVisible}
                onRequestClose={() => setCurrencyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, {backgroundColor: isDark ? '#2c2c2e' : '#ffffff'}]}>
                        <Text style={[styles.modalTitle, {color: isDark ? '#ffffff' : '#000000'}]}>
                            Select Currency
                        </Text>
                        <ScrollView style={styles.modalScrollView}>
                            {availableCurrencies.map(currency => (
                                <TouchableOpacity
                                    key={currency.code}
                                    style={[
                                        styles.modalItem,
                                        selectedCurrency === currency.code && {backgroundColor: isDark ? '#444444' : '#e6f7ff'}
                                    ]}
                                    onPress={() => {
                                        setSelectedCurrency(currency.code);
                                        setCurrencyModalVisible(false);
                                    }}
                                >
                                    <Text style={{color: isDark ? '#ffffff' : '#000000'}}>
                                        {currency.code} - {currency.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={[styles.modalCloseButton, {backgroundColor: isDark ? '#444444' : '#eeeeee'}]}
                            onPress={() => setCurrencyModalVisible(false)}
                        >
                            <Text style={{color: isDark ? '#ffffff' : '#000000'}}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Method Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={methodModalVisible}
                onRequestClose={() => setMethodModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, {backgroundColor: isDark ? '#2c2c2e' : '#ffffff'}]}>
                        <Text style={[styles.modalTitle, {color: isDark ? '#ffffff' : '#000000'}]}>
                            Select Forecast Method
                        </Text>
                        <ScrollView style={styles.modalScrollView}>
                            {[
                                {
                                    label: 'Simple Linear',
                                    value: ForecastMethod.LINEAR,
                                    description: `7-day forecast using linear regression`
                                },
                                {
                                    label: 'Advanced Algorithm',
                                    value: ForecastMethod.ADVANCED,
                                    description: `14-day forecast with seasonal adjustments`
                                },
                                {
                                    label: 'Machine Learning',
                                    value: ForecastMethod.MACHINE_LEARNING,
                                    description: `30-day forecast using ML techniques`
                                }
                            ].map(method => (
                                <TouchableOpacity
                                    key={method.value}
                                    style={[
                                        styles.modalItem,
                                        forecastMethod === method.value && {backgroundColor: isDark ? '#444444' : '#e6f7ff'}
                                    ]}
                                    onPress={() => {
                                        setForecastMethod(method.value);
                                        setMethodModalVisible(false);
                                    }}
                                >
                                    <Text style={{color: isDark ? '#ffffff' : '#000000', fontWeight: 'bold'}}>
                                        {method.label}
                                    </Text>
                                    <Text style={{color: isDark ? '#a9a9a9' : '#666666', fontSize: 12, marginTop: 4}}>
                                        {method.description}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={[styles.modalCloseButton, {backgroundColor: isDark ? '#444444' : '#eeeeee'}]}
                            onPress={() => setMethodModalVisible(false)}
                        >
                            <Text style={{color: isDark ? '#ffffff' : '#000000'}}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        width: '100%'
    },
    container: {
        flex: 1,
    },
    screenTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        textAlign: 'center',
        width: '100%',
        overflow: 'hidden'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    filterContainer: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
    methodDescription: {
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    },
    chartContainer: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        overflow: 'hidden',
    },
    loaderContainer: {
        marginTop: 100,
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
    noDataContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 16,
        textAlign: 'center',
    },
    forecastDetailsContainer: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    forecastDetailsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    forecastDetailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    forecastDetailDate: {
        flex: 1,
        fontSize: 14,
    },
    forecastDetailValues: {
        flex: 2,
    },
    forecastDetailValue: {
        fontSize: 14,
        textAlign: 'right',
    },
    forecastDetailConfidence: {
        fontSize: 12,
        textAlign: 'right',
        fontStyle: 'italic',
    },
    methodInfoContainer: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    methodInfoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    methodInfoText: {
        fontSize: 14,
        lineHeight: 20,
    },
    disclaimerText: {
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        margin: 16,
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
        marginBottom: 8,
    },
    modalCloseButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    chartOuterContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        padding: 12,
        overflow: 'hidden',
    },
    chartWrapper: {
        width: '100%',
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        marginHorizontal: 0,
    },
    chartTitleContainer: {
        marginBottom: 8,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    chartSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
    },
    chartContainerStyle: {
        width: '100%',
        height: '100%',
    },
});
