// mobile-app/components/currency/CurrencyRateCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useColorScheme } from '../../hooks/useColorScheme';

interface CurrencyRateCardProps {
  source: string;
  currency: string;
  baseCurrency: string;
  buy: number;
  sell: number;
  date: Date;
  onPress?: () => void;
}

export const CurrencyRateCard: React.FC<CurrencyRateCardProps> = ({
  source,
  currency,
  baseCurrency,
  buy,
  sell,
  date,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Получаем символы валют
  const getCurrencySymbol = (code: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      UAH: '₴',
      PLN: 'zł',
      JPY: '¥',
      CHF: 'CHF',
    };
    return symbols[code] || code;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.source, { color: isDark ? '#e4e4e4' : '#333333' }]}>{source}</Text>
        <Text style={[styles.date, { color: isDark ? '#a9a9a9' : '#666666' }]}>
          {date.toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.currencyContainer}>
        <Text style={[styles.currency, { color: isDark ? '#e4e4e4' : '#333333' }]}>
          {getCurrencySymbol(currency)} {currency}
        </Text>
        <Text style={[styles.baseCurrency, { color: isDark ? '#a9a9a9' : '#666666' }]}>
          / {baseCurrency}
        </Text>
      </View>

      <View style={styles.ratesContainer}>
        <View style={styles.rateItem}>
          <Text style={[styles.rateLabel, { color: isDark ? '#a9a9a9' : '#666666' }]}>Buy</Text>
          <Text style={[styles.rateValue, { color: isDark ? '#4cd964' : '#28a745' }]}>
            {buy.toFixed(2)}
          </Text>
        </View>

        <View style={styles.rateItem}>
          <Text style={[styles.rateLabel, { color: isDark ? '#a9a9a9' : '#666666' }]}>Sell</Text>
          <Text style={[styles.rateValue, { color: isDark ? '#ff3b30' : '#dc3545' }]}>
            {sell?.toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  source: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  currency: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  baseCurrency: {
    fontSize: 16,
    marginLeft: 4,
  },
  ratesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rateItem: {
    alignItems: 'center',
    flex: 1,
  },
  rateLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  rateValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
