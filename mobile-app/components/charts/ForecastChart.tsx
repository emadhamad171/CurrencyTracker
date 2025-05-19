// mobile-app/components/charts/ForecastChart.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ForecastData, HistoricalRateData } from '../../services/api';
import { CHART_COLORS } from '../../constants/config';
import { useColorScheme } from '../../hooks/useColorScheme';

interface ForecastChartProps {
    historicalData: HistoricalRateData[];
    forecastData: ForecastData[];
    currency: string;
    baseCurrency: string;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
                                                                historicalData,
                                                                forecastData,
                                                                currency,
                                                                baseCurrency
                                                            }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Use only the last 7 days of historical data for chart clarity
    const recentHistoricalData = historicalData.slice(-7);

    // Create and format dates for X-axis
    const allDates = [
        ...recentHistoricalData.map(item => new Date(item.date)),
        ...forecastData.map(item => new Date(item.date))
    ];

    // Reduce the number of labels to prevent overcrowding
    // Only show every other date to make the chart more readable
    const labels = [];
    allDates.forEach((date, index) => {
        if (index % 2 === 0 || index === allDates.length - 1) {
            labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
        } else {
            labels.push(''); // Empty label for in-between dates
        }
    });

    // Chart data preparation
    const chartData = {
        labels,
        datasets: [
            {
                data: [
                    ...recentHistoricalData.map(item => item.buy.avg),
                    ...forecastData.map(item => item.buy)
                ],
                color: (opacity = 1) => {
                    return opacity < 0.5 ?
                        CHART_COLORS.FORECAST_AREA :
                        CHART_COLORS.FORECAST;
                },
                strokeWidth: 2
            }
        ],
        legend: [`${currency}/${baseCurrency} Rate & Forecast`]
    };

    // Calculate Y-axis range with padding
    const allValues = [
        ...recentHistoricalData.map(item => item.buy.avg),
        ...forecastData.map(item => item.buy)
    ];
    const minValue = Math.min(...allValues) * 0.99;
    const maxValue = Math.max(...allValues) * 1.01;

    // Index where forecast data starts
    const forecastStartIndex = recentHistoricalData.length;

    // Calculate chart width properly based on screen width
    // Subtract total horizontal padding/margin from all parent containers
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 64; // Account for container padding

    return (
        <View style={[
            styles.container,
            { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }
        ]}>
            <LineChart
                data={chartData}
                width={chartWidth}
                height={220}
                chartConfig={{
                    backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                    backgroundGradientFrom: isDark ? '#1c1c1e' : '#ffffff',
                    backgroundGradientTo: isDark ? '#1c1c1e' : '#ffffff',
                    decimalPlaces: 2,
                    color: (opacity = 1) => isDark ?
                        `rgba(255, 255, 255, ${opacity})` :
                        `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => isDark ?
                        `rgba(255, 255, 255, ${opacity})` :
                        `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: '4',
                        strokeWidth: '1',
                        stroke: isDark ? '#1c1c1e' : '#ffffff'
                    },
                    propsForGrid: {
                        strokeDasharray: '',
                        stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    // Adjust space between X-axis labels
                    xLabelsOffset: -10,
                    // Fewer horizontal lines
                    horizontalLabelRotation: 0
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
                yAxisInterval={5}
                yAxisSuffix=""
                yAxisMinValue={minValue}
                yAxisMaxValue={maxValue}
                renderDotContent={({ x, y, index }) => {
                    if (index === forecastStartIndex) {
                        return (
                            <View
                                key={index}
                                style={{
                                    position: 'absolute',
                                    left: x,
                                    top: 0,
                                    bottom: 0,
                                    width: 1,
                                    backgroundColor: isDark ?
                                        'rgba(255, 255, 255, 0.3)' :
                                        'rgba(0, 0, 0, 0.3)',
                                    borderStyle: 'dashed'
                                }}
                            />
                        );
                    }
                    return null;
                }}
            />

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.colorBox, { backgroundColor: CHART_COLORS.BUY }]} />
                    <Text style={[styles.legendText, { color: isDark ? '#e4e4e4' : '#333333' }]}>
                        Historical Data
                    </Text>
                </View>

                <View style={styles.legendItem}>
                    <View style={[styles.colorBox, { backgroundColor: CHART_COLORS.FORECAST }]} />
                    <Text style={[styles.legendText, { color: isDark ? '#e4e4e4' : '#333333' }]}>
                        Forecast
                    </Text>
                </View>
            </View>

            <Text style={[styles.disclaimer, { color: isDark ? '#a9a9a9' : '#666666' }]}>
                * Forecast accuracy decreases with longer time periods
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        padding: 8, // Reduced padding
        borderRadius: 16
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
        alignSelf: 'center' // Center the chart
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
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
    disclaimer: {
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
    }
});
