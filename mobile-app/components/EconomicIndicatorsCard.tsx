import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { ForecastIndicators } from '../app/types/ForecastTypes';

interface Props {
  indicators: ForecastIndicators;
}

export const EconomicIndicatorsCard: React.FC<Props> = ({ indicators }) => (
  <View style={styles.container}>
    <Text style={styles.title}>📈 ECONOMIC INDICATORS</Text>

    <View style={styles.indicatorsList}>
      <DXYIndicator dxy={indicators.dxy} />
      <CentralBankRates rates={indicators.rates} />
      <GDPIndicators gdp={indicators.gdp} />
    </View>
  </View>
);

const DXYIndicator: React.FC<{ dxy: any }> = ({ dxy }) => (
  <View style={styles.indicatorItem}>
    <View style={styles.indicatorHeader}>
      <Text style={styles.indicatorName}>💵 Dollar Index (DXY)</Text>
      <Text
        style={[
          styles.indicatorValue,
          {
            color: dxy.changePercent > 0 ? '#16A085' : '#E74C3C',
          },
        ]}
      >
        {dxy.value}
      </Text>
    </View>
    <Text style={styles.indicatorChange}>
      {dxy.changePercent > 0 ? '+' : ''}
      {dxy.changePercent}% today
    </Text>
    <View style={styles.indicatorBar}>
      <View
        style={[
          styles.indicatorProgress,
          {
            width: `${Math.min(Math.abs(dxy.changePercent) * 50, 100)}%`,
            backgroundColor: dxy.changePercent > 0 ? '#16A085' : '#E74C3C',
          },
        ]}
      />
    </View>
  </View>
);

const CentralBankRates: React.FC<{ rates: any }> = ({ rates }) => (
  <View style={styles.indicatorItem}>
    <View style={styles.indicatorHeader}>
      <Text style={styles.indicatorName}>🏦 Central Bank Rates</Text>
    </View>
    <View style={styles.ratesGrid}>
      <View style={styles.rateItem}>
        <Text style={styles.rateLabel}>FED</Text>
        <Text style={styles.rateValue}>{rates.fed}%</Text>
      </View>
      <View style={styles.rateItem}>
        <Text style={styles.rateLabel}>ECB</Text>
        <Text style={styles.rateValue}>{rates.ecb}%</Text>
      </View>
      <View style={styles.rateItem}>
        <Text style={styles.rateLabel}>NBU</Text>
        <Text style={styles.rateValue}>{rates.nbu}%</Text>
      </View>
    </View>
  </View>
);

const GDPIndicators: React.FC<{ gdp: any }> = ({ gdp }) => (
  <View style={styles.indicatorItem}>
    <View style={styles.indicatorHeader}>
      <Text style={styles.indicatorName}>🏭 GDP Growth (annual)</Text>
    </View>
    <View style={styles.gdpGrid}>
      <View style={styles.gdpItem}>
        <Text style={styles.gdpCountry}>🇺🇸 USA</Text>
        <Text
          style={[
            styles.gdpValue,
            {
              color: gdp.usa.trend === 'up' ? '#16A085' : '#E74C3C',
            },
          ]}
        >
          {gdp.usa.value}%
        </Text>
      </View>
      <View style={styles.gdpItem}>
        <Text style={styles.gdpCountry}>🇪🇺 EU</Text>
        <Text
          style={[
            styles.gdpValue,
            {
              color: gdp.eu.trend === 'up' ? '#16A085' : '#E74C3C',
            },
          ]}
        >
          {gdp.eu.value}%
        </Text>
      </View>
      <View style={styles.gdpItem}>
        <Text style={styles.gdpCountry}>🇺🇦 Ukraine</Text>
        <Text
          style={[
            styles.gdpValue,
            {
              color: gdp.ukraine.trend === 'up' ? '#16A085' : '#E74C3C',
            },
          ]}
        >
          {gdp.ukraine.value}%
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    margin: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  indicatorsList: {
    gap: 20,
  },
  indicatorItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  indicatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  indicatorValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  indicatorChange: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  indicatorBar: {
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    overflow: 'hidden',
  },
  indicatorProgress: {
    height: '100%',
    borderRadius: 2,
  },
  ratesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rateItem: {
    alignItems: 'center',
    flex: 1,
  },
  rateLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  rateValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  gdpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gdpItem: {
    alignItems: 'center',
    flex: 1,
  },
  gdpCountry: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  gdpValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
