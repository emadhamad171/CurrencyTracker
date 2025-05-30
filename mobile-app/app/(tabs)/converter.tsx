// app/(tabs)/converter.tsx - Главный файл
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useColorScheme } from '../../hooks/useColorScheme';
import {
  fetchConverterRates,
  setFromCurrency,
  setToCurrency,
  setAmount,
  swapCurrencies,
  selectConverterRates,
  selectConverterCurrencies,
  selectConverterLoading,
  selectConverterError,
  selectConverterLastUpdated,
  selectFromCurrency,
  selectToCurrency,
  selectAmount,
  selectConvertedAmount,
  selectConverterDataFreshness,
} from '../../store/slices/converterSlice';
import { DataSourceIndicator } from '../../components/DataSourceIndicator';
import { CurrencyButton } from '../../components/CurrencyButton';
import { CurrencyModal } from '../../components/CurrencyModal';

import { useAppDispatch, useAppSelector } from '@/store/hook';

export default function ConverterScreen() {
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Селекторы
  const rates = useAppSelector(selectConverterRates);
  const availableCurrencies = useAppSelector(selectConverterCurrencies);
  const isLoading = useAppSelector(selectConverterLoading);
  const error = useAppSelector(selectConverterError);
  const lastUpdated = useAppSelector(selectConverterLastUpdated);
  const fromCurrency = useAppSelector(selectFromCurrency);
  const toCurrency = useAppSelector(selectToCurrency);
  const amount = useAppSelector(selectAmount);
  const convertedAmount = useAppSelector(selectConvertedAmount);
  const dataFreshness = useAppSelector(selectConverterDataFreshness);
  const { isOffline } = useAppSelector(state => state.app);

  // Локальное состояние
  const [refreshing, setRefreshing] = useState(false);
  const [fromCurrencyModalVisible, setFromCurrencyModalVisible] = useState(false);
  const [toCurrencyModalVisible, setToCurrencyModalVisible] = useState(false);

  // Вычисляемые значения
  const dataSourceInfo = useMemo(() => {
    if (!rates || rates.length === 0) {
      return null;
    }
    return { isOffline, lastUpdated, freshness: dataFreshness };
  }, [rates, isOffline, lastUpdated, dataFreshness]);

  const formattedResult = useMemo(() => {
    if (!convertedAmount) {
      return '';
    }
    const num = Number(convertedAmount);
    return isNaN(num) ? '' : num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }, [convertedAmount]);

  const exchangeRateString = useMemo(() => {
    if (!rates || rates.length === 0 || fromCurrency === toCurrency) {
      return fromCurrency === toCurrency ? '1 : 1' : '';
    }

    const getRateToUAH = (cc: string) => {
      if (cc === 'UAH') {
        return 1;
      }
      const found = rates.find(r => r.cc === cc);
      return found ? found.rate : null;
    };

    const fromRate = getRateToUAH(fromCurrency);
    const toRate = getRateToUAH(toCurrency);

    if (!fromRate || !toRate) {
      return '';
    }

    const rate = fromRate / toRate;
    return `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
  }, [rates, fromCurrency, toCurrency]);

  // Эффекты
  useEffect(() => {
    dispatch(fetchConverterRates());
  }, [dispatch]);

  // Обработчики
  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchConverterRates()).finally(() => setRefreshing(false));
  };

  const handleAmountChange = (text: string) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    const parts = cleanText.split('.');
    if (parts.length > 2) {
      return;
    }
    dispatch(setAmount(cleanText));
  };

  const handleSwapCurrencies = () => {
    dispatch(swapCurrencies());
  };

  const getCurrencyInfo = code => {
    return availableCurrencies.find(c => c.code === code) || { code, name: code, rate: 0 };
  };

  const handleFromCurrencySelect = currencyCode => {
    dispatch(setFromCurrency(currencyCode));
    setFromCurrencyModalVisible(false);
  };

  const handleToCurrencySelect = currencyCode => {
    dispatch(setToCurrency(currencyCode));
    setToCurrencyModalVisible(false);
  };

  // Рендер состояний загрузки и ошибок
  if (isLoading && !refreshing) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#000000'} />
          <Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#000000' }]}>
            Loading exchange rates...
          </Text>
        </View>
      </View>
    );
  }

  if (error && rates.length === 0) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDark ? '#ff6b6b' : '#dc3545' }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: isDark ? '#444444' : '#eeeeee' }]}
            onPress={() => dispatch(fetchConverterRates())}
          >
            <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Основной рендер
  return (
    <View style={[styles.mainContainer, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <DataSourceIndicator
          dataSourceInfo={dataSourceInfo}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          isDark={isDark}
        />

        <View
          style={[styles.converterContainer, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}
        >
          {/* From Currency Section */}
          <View style={styles.currencySection}>
            <Text style={[styles.sectionLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
              From
            </Text>
            <CurrencyButton
              currency={fromCurrency}
              currencyInfo={getCurrencyInfo(fromCurrency)}
              onPress={() => setFromCurrencyModalVisible(true)}
              isDark={isDark}
            />
            <TextInput
              style={[
                styles.amountInput,
                {
                  backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                  color: isDark ? '#ffffff' : '#000000',
                  borderColor: isDark ? '#444444' : '#dddddd',
                },
              ]}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="Enter amount"
              placeholderTextColor={isDark ? '#666666' : '#999999'}
              keyboardType="numeric"
              textAlign="center"
            />
          </View>

          {/* Swap Button */}
          <TouchableOpacity
            style={[styles.swapButton, { backgroundColor: '#007AFF' }]}
            onPress={handleSwapCurrencies}
          >
            <MaterialCommunityIcons name="swap-vertical" size={24} color="#ffffff" />
          </TouchableOpacity>

          {/* To Currency Section */}
          <View style={styles.currencySection}>
            <Text style={[styles.sectionLabel, { color: isDark ? '#ffffff' : '#000000' }]}>To</Text>
            <CurrencyButton
              currency={toCurrency}
              currencyInfo={getCurrencyInfo(toCurrency)}
              onPress={() => setToCurrencyModalVisible(true)}
              isDark={isDark}
            />
            <View
              style={[
                styles.resultContainer,
                {
                  backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                  borderColor: isDark ? '#444444' : '#dddddd',
                },
              ]}
            >
              <Text style={[styles.resultAmount, { color: isDark ? '#4cd964' : '#28a745' }]}>
                {formattedResult}
              </Text>
            </View>
          </View>
        </View>

        {/* Exchange Rate Info */}
        {exchangeRateString && (
          <View
            style={[styles.rateInfoContainer, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={isDark ? '#a9a9a9' : '#666666'}
            />
            <Text style={[styles.rateInfoText, { color: isDark ? '#a9a9a9' : '#666666' }]}>
              {exchangeRateString}
            </Text>
          </View>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <Text style={[styles.updatedText, { color: isDark ? '#aaaaaa' : '#666666' }]}>
            Last updated: {new Date(lastUpdated).toLocaleString()}
            {isOffline ? ' (offline data)' : ''}
          </Text>
        )}

        <View style={styles.footer} />
      </ScrollView>

      {/* Modals */}
      <CurrencyModal
        visible={fromCurrencyModalVisible}
        onClose={() => setFromCurrencyModalVisible(false)}
        title="Select Source Currency"
        currencies={availableCurrencies}
        selectedCurrency={fromCurrency}
        onSelect={handleFromCurrencySelect}
        isDark={isDark}
      />

      <CurrencyModal
        visible={toCurrencyModalVisible}
        onClose={() => setToCurrencyModalVisible(false)}
        title="Select Target Currency"
        currencies={availableCurrencies}
        selectedCurrency={toCurrency}
        onSelect={handleToCurrencySelect}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, width: '100%' },
  container: { flex: 1 },
  loaderContainer: { marginTop: 100, alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },
  errorContainer: { margin: 16, padding: 16, borderRadius: 8, alignItems: 'center' },
  errorText: { textAlign: 'center', marginBottom: 16 },
  retryButton: { padding: 10, borderRadius: 5 },
  converterContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currencySection: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
  },
  swapButton: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  resultContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resultAmount: { fontSize: 28, fontWeight: 'bold' },
  rateInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rateInfoText: { marginLeft: 8, fontSize: 14, fontStyle: 'italic' },
  updatedText: { fontSize: 12, textAlign: 'center', marginTop: 16, marginBottom: 8 },
  footer: { height: 40 },
});
