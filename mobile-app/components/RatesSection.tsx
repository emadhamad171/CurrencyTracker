// app/(tabs)/components/RatesSection.tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { CurrencyRateCard } from '../components/currency/CurrencyRateCard';

interface Rate {
  source: string;
  currency: string;
  baseCurrency: string;
  buy: number;
  sell: number;
  date: string;
}

interface Props {
  title: string;
  rates: Rate[];
  keyPrefix: string;
  isDark: boolean;
}

export const RatesSection: React.FC<Props> = ({ title, rates, keyPrefix, isDark }) => {
  if (rates.length === 0) {
    return null;
  }

  return (
    <>
      <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>{title}</Text>
      {rates.map((rate, index) => (
        <CurrencyRateCard
          key={`${keyPrefix}-${index}`}
          source={rate.source}
          currency={rate.currency}
          baseCurrency={rate.baseCurrency}
          buy={rate.buy}
          sell={rate.sell}
          date={new Date(rate.date)}
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
  },
});
