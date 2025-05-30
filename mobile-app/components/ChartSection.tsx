import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { CurrencyLineChart } from '../components/charts/LineChart';

interface Props {
  historicalData: any[];
  selectedCurrency: string;
  baseCurrency: string;
  isDark: boolean;
}

export const ChartSection: React.FC<Props> = ({
  historicalData,
  selectedCurrency,
  baseCurrency,
  isDark,
}) => {
  if (!historicalData?.length) {
    return (
      <Text style={[styles.noDataText, { color: isDark ? '#ffffff' : '#000000' }]}>
        No historical data available for the selected parameters.
      </Text>
    );
  }

  return (
    <View style={[styles.chartWrapper, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
      <CurrencyLineChart
        data={{ data: historicalData }}
        title={`${selectedCurrency} to ${baseCurrency} Exchange Rate`}
        currency={selectedCurrency}
        baseCurrency={baseCurrency}
        showSellRate={true}
      />
    </View>
  );
};

const chartStyles = StyleSheet.create({
  chartWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 12,
    overflow: 'hidden',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});

const styles = chartStyles;
