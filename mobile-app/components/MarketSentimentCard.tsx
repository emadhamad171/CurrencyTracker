import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { ForecastIndicators } from '../app/types/ForecastTypes';

interface Props {
  indicators: ForecastIndicators;
}

export const MarketSentimentCard: React.FC<Props> = ({ indicators }) => {
  const usdStrength = indicators.dxy.changePercent;
  const economicGrowth = (indicators.gdp.usa.value + indicators.gdp.eu.value) / 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌍 MARKET SENTIMENT</Text>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.label}>US Dollar</Text>
          <Text
            style={[
              styles.value,
              {
                color: usdStrength > 0 ? '#16A085' : '#E74C3C',
              },
            ]}
          >
            {usdStrength > 0 ? '💪 STRONG' : '😔 WEAK'}
          </Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Global Growth</Text>
          <Text
            style={[
              styles.value,
              {
                color: economicGrowth > 2 ? '#16A085' : '#E74C3C',
              },
            ]}
          >
            {economicGrowth > 2 ? '🚀 GROWING' : '📉 SLOWING'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
