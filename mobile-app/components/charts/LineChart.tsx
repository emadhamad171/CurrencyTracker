// mobile-app/components/charts/LineChart.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { CHART_COLORS } from '../../constants/config';
import { useColorScheme } from '../../hooks/useColorScheme';

// Обновленный интерфейс для новой структуры данных
interface CourseData {
    data: Array<{
        date: string;
        course: {
            banks?: {
                ask: number;
                bid: number;
            };
            nbu?: {
                rate: number;
                date: string;
            };
        };
    }>;
}

interface CurrencyLineChartProps {
    data: CourseData;
    title?: string;
    currency: string;
    baseCurrency: string;
    showSellRate?: boolean;
}

export const CurrencyLineChart: React.FC<CurrencyLineChartProps> = ({
                                                                        data,
                                                                        title,
                                                                        currency,
                                                                        baseCurrency,
                                                                        showSellRate = true
                                                                    }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    // Подготовка данных для графика
    const { processedData, chartData, minValue, maxValue } = useMemo(() => {
        if (!data || !data.data || data.data.length === 0) {
            return { processedData: [], chartData: { labels: [], datasets: [] }, minValue: 0, maxValue: 0 };
        }

        // Отсортируем данные по дате в хронологическом порядке (от старых к новым)
        const sortedData = [...data.data].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Формируем метки для оси X (даты)
        const formattedLabels = sortedData.map((item, index) => {
            const date = new Date(item.date);
            // Показываем только каждую 2-ю метку, чтобы избежать скученности
            return index % 2 === 0 ? `${date.getDate()}/${date.getMonth() + 1}` : '';
        });

        // Извлекаем значения курсов для обоих источников
        const nbuRates = sortedData.map(item => {
            if (item.course && item.course.nbu && item.course.nbu.rate) {
                return item.course.nbu.rate;
            }
            return 0;
        });

        const bankBuyRates = sortedData.map(item => {
            if (item.course && item.course.banks && item.course.banks.bid) {
                return item.course.banks.bid;
            }
            return 0;
        });

        const bankSellRates = sortedData.map(item => {
            if (item.course && item.course.banks && item.course.banks.ask) {
                return item.course.banks.ask;
            }
            return 0;
        });

        // Удаляем нулевые значения для расчета min/max
        const validNbuRates = nbuRates.filter(val => val > 0);
        const validBankBuyRates = bankBuyRates.filter(val => val > 0);
        const validBankSellRates = bankSellRates.filter(val => val > 0);

        // Формируем данные для графика с тремя линиями
        const chartDataObj = {
            labels: formattedLabels,
            datasets: [
                {
                    data: nbuRates,
                    color: () => CHART_COLORS.BUY, // Зеленый для НБУ
                    strokeWidth: 2
                },
                {
                    data: bankBuyRates,
                    color: () => '#3498db', // Синий для курса покупки банка
                    strokeWidth: 2
                },
                ...(showSellRate ? [{
                    data: bankSellRates,
                    color: () => CHART_COLORS.SELL, // Красный для курса продажи банка
                    strokeWidth: 2
                }] : [])
            ],
            legend: []
        };

        // Рассчитываем минимальное и максимальное значения для оси Y с отступом
        // Собираем все значения в один массив
        const allValues = [
            ...validNbuRates,
            ...validBankBuyRates,
            ...validBankSellRates
        ].filter(val => val > 0);

        if (allValues.length === 0) {
            return {
                processedData: sortedData,
                chartData: chartDataObj,
                minValue: 0,
                maxValue: 0
            };
        }

        const min = Math.min(...allValues) * 0.99;
        const max = Math.max(...allValues) * 1.01;

        return {
            processedData: sortedData,
            chartData: chartDataObj,
            minValue: min,
            maxValue: max
        };
    }, [data, showSellRate]);

    // Рассчитываем размеры графика
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 48; // Учитываем поля и отступы контейнера

    // Если нет данных, показываем соответствующее сообщение
    if (!data || !data.data || data.data.length === 0 || processedData.length === 0) {
        return (
            <View style={[styles.chartOuterContainer, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
                <Text style={[styles.noDataText, { color: isDark ? '#ffffff' : '#000000' }]}>
                    No historical data available
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.chartOuterContainer, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
            <View style={styles.chartTitleContainer}>
                <Text style={[styles.chartTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                    {title || `${currency} to ${baseCurrency} Exchange Rate`}
                </Text>
                <Text style={[styles.chartSubtitle, { color: isDark ? '#a9a9a9' : '#666666' }]}>
                    {`${currency}/${baseCurrency} - Comparison`}
                </Text>
            </View>

            <View style={styles.chartWrapper}>
                <LineChart
                    data={chartData}
                    width={chartWidth}
                    height={220}
                    chartConfig={{
                        backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                        backgroundGradientFrom: isDark ? '#1c1c1e' : '#ffffff',
                        backgroundGradientTo: isDark ? '#1c1c1e' : '#ffffff',
                        decimalPlaces: 2,
                        color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                        labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                        style: {
                            borderRadius: 12
                        },
                        propsForDots: {
                            r: '3',
                            strokeWidth: '1',
                            stroke: isDark ? '#1c1c1e' : '#ffffff'
                        },
                        propsForGrid: {
                            strokeDasharray: '',
                            stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        formatYLabel: (value) => parseFloat(value).toFixed(2),
                        xAxisLabel: '',
                        yAxisSuffix: ''
                    }}
                    bezier
                    style={styles.chart}
                    withInnerLines={true}
                    withOuterLines={true}
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    fromZero={false}
                    yAxisMinValue={minValue}
                    yAxisMaxValue={maxValue}
                    withShadow={false}
                    horizontalLabelRotation={0}
                    xLabelsOffset={-10}
                    yLabelsOffset={6}
                />
            </View>

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.colorBox, { backgroundColor: CHART_COLORS.BUY }]} />
                    <Text style={[styles.legendText, { color: isDark ? '#e4e4e4' : '#333333' }]}>
                        NBU Rate
                    </Text>
                </View>

                <View style={styles.legendItem}>
                    <View style={[styles.colorBox, { backgroundColor: '#3498db' }]} />
                    <Text style={[styles.legendText, { color: isDark ? '#e4e4e4' : '#333333' }]}>
                        Bank Buy
                    </Text>
                </View>

                {showSellRate && (
                    <View style={styles.legendItem}>
                        <View style={[styles.colorBox, { backgroundColor: CHART_COLORS.SELL }]} />
                        <Text style={[styles.legendText, { color: isDark ? '#e4e4e4' : '#333333' }]}>
                            Bank Sell
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    chartOuterContainer: {
        // marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        padding: 16,
        overflow: 'hidden',
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
    chartWrapper: {
        width: '100%',
        height: 240,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginVertical: 4,
    },
    colorBox: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
    },
    noDataText: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 100,
    },
});
