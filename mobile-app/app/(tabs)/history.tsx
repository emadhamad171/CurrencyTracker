import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import { Currency } from '../../services/api';
import { DEFAULT_CURRENCIES } from '../../constants/config';
import { useColorScheme } from '../../hooks/useColorScheme';
import { fetchHistoricalRates } from '../../store/slices/historySlice';
import { DataSourceIndicator } from '../../components/DataSourceIndicator';
import { HistoryFilterPanel } from '../../components/HistoryFilterPanel';
import { CurrencyModal, PeriodModal } from '../../components/HistoryModals';
import { ChartSection } from '../../components/ChartSection';

import { useAppDispatch, useAppSelector } from '@/store/hook';

const PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
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
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
];

const PERIOD_OPTIONS = [
  { label: 'Weekly', value: PERIODS.WEEK },
  { label: 'Monthly', value: PERIODS.MONTH },
  { label: 'Quarterly', value: PERIODS.QUARTER },
  { label: 'Yearly', value: PERIODS.YEAR },
];

export default function HistoryScreen() {
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Redux state
  const { historicalData, isLoading, error, lastUpdated } = useAppSelector(state => state.history);
  const { isOffline } = useAppSelector(state => state.app);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(AVAILABLE_CURRENCIES[0]?.code);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS.MONTH);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [periodModalVisible, setPeriodModalVisible] = useState(false);

  // Computed values
  const dataSourceInfo = useMemo(() => {
    if (!(historicalData?.length > 0)) {
      return null;
    }
    return { isOffline, lastUpdated };
  }, [historicalData, isOffline, lastUpdated]);

  const availableCurrencies = useMemo(
    () => AVAILABLE_CURRENCIES.filter(c => c.code !== DEFAULT_CURRENCIES.BASE),
    []
  );

  // Effects
  useEffect(() => {
    dispatch(
      fetchHistoricalRates({
        currency: selectedCurrency.toLowerCase(),
        period: selectedPeriod,
      })
    );
  }, [dispatch, selectedCurrency, selectedPeriod]);

  // Handlers
  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(
      fetchHistoricalRates({
        currency: selectedCurrency.toLowerCase(),
        period: selectedPeriod,
      })
    ).finally(() => setRefreshing(false));
  };

  const handleCurrencySelect = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    setCurrencyModalVisible(false);
  };

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    setPeriodModalVisible(false);
  };

  const getPeriodName = (periodCode: string) => {
    const period = PERIOD_OPTIONS.find(p => p.value === periodCode);
    return period?.label || periodCode;
  };

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
        <ActivityIndicator
          size="large"
          color={isDark ? '#ffffff' : '#000000'}
          style={styles.loader}
        />
      </View>
    );
  }

  // Error state (only if no data)
  if (error && !historicalData) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDark ? '#ff6b6b' : '#dc3545' }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: isDark ? '#444444' : '#eeeeee' }]}
            onPress={() =>
              dispatch(
                fetchHistoricalRates({
                  currency: selectedCurrency.toLowerCase(),
                  period: selectedPeriod,
                })
              )
            }
          >
            <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main render
  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <DataSourceIndicator
          dataSourceInfo={dataSourceInfo}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          isDark={isDark}
        />

        <HistoryFilterPanel
          selectedCurrency={selectedCurrency}
          selectedPeriod={getPeriodName(selectedPeriod)}
          onCurrencyPress={() => setCurrencyModalVisible(true)}
          onPeriodPress={() => setPeriodModalVisible(true)}
          isDark={isDark}
        />

        <ChartSection
          historicalData={historicalData}
          selectedCurrency={selectedCurrency}
          baseCurrency={DEFAULT_CURRENCIES.BASE}
          isDark={isDark}
        />

        {lastUpdated && (
          <Text style={[styles.updatedText, { color: isDark ? '#aaaaaa' : '#666666' }]}>
            Last updated: {new Date(lastUpdated).toLocaleString()}
            {isOffline ? ' (offline data)' : ''}
          </Text>
        )}

        <View style={styles.footer} />
      </ScrollView>

      <CurrencyModal
        visible={currencyModalVisible}
        onClose={() => setCurrencyModalVisible(false)}
        currencies={availableCurrencies}
        selectedCurrency={selectedCurrency}
        onSelect={handleCurrencySelect}
        isDark={isDark}
      />

      <PeriodModal
        visible={periodModalVisible}
        onClose={() => setPeriodModalVisible(false)}
        periods={PERIOD_OPTIONS}
        selectedPeriod={selectedPeriod}
        onSelect={handlePeriodSelect}
        isDark={isDark}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
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
  updatedText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  footer: {
    height: 40,
  },
});
