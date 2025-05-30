// app/(tabs)/index.tsx - Рефакторированный HomeScreen
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import { DEFAULT_CURRENCIES } from '../../constants/config';
import { useColorScheme } from '../../hooks/useColorScheme';
import { fetchRates } from '../../store/slices/currencySlice';
import { DataSourceIndicator } from '../../components/DataSourceIndicator';
import { FilterPanel } from '../../components/FilterPanel';
import { CurrencySelectionModal, BankSelectionModal } from '../../components/CurrencySelectionModal';
import { RatesSection } from '../../components/RatesSection';

import { useAppDispatch, useAppSelector } from '@/store/hook';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Redux state
  const { rates, isLoading, error, lastUpdated } = useAppSelector(state => state.currency);
  const { isOffline } = useAppSelector(state => state.app);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(
    DEFAULT_CURRENCIES.SELECTED
  );
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [availableBanks, setAvailableBanks] = useState<string[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(
    DEFAULT_CURRENCIES.SELECTED
  );

  // Computed values
  const dataSourceInfo = useMemo(() => {
    if (!rates) {
      return null;
    }
    return { isOffline, lastUpdated };
  }, [rates, isOffline, lastUpdated]);

  const filteredData = useMemo(() => {
    if (!rates) {
      return { nbu: [], banks: [], black: [] };
    }

    return {
      nbu: rates.nbu?.filter(rate => selectedCurrencies.includes(rate.currency)) || [],
      banks:
        rates.banks?.filter(
          rate => selectedCurrencies.includes(rate.currency) && selectedBanks.includes(rate.source)
        ) || [],
      black: rates.black?.filter(rate => selectedCurrencies.includes(rate.currency)) || [],
    };
  }, [rates, selectedCurrencies, selectedBanks]);

  const hasFilteredData =
    filteredData.nbu.length > 0 || filteredData.banks.length > 0 || filteredData.black.length > 0;

  // Effects
  useEffect(() => {
    dispatch(fetchRates(selectedCurrencies));
  }, [dispatch, selectedCurrencies]);

  useEffect(() => {
    if (rates) {
      updateAvailableOptions();
    }
  }, [rates]);

  // Handlers
  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchRates(selectedCurrencies)).finally(() => setRefreshing(false));
  };

  const updateAvailableOptions = () => {
    if (!rates) {
      return;
    }

    // Extract currencies
    const currencies: string[] = [];
    ['nbu', 'banks', 'black'].forEach(sourceType => {
      if (rates[sourceType]) {
        rates[sourceType].forEach(rate => {
          if (rate.currency && !currencies.includes(rate.currency)) {
            currencies.push(rate.currency);
          }
        });
      }
    });

    if (currencies.length > 0) {
      setAvailableCurrencies(currencies);
    }

    // Extract banks
    const banks: string[] = [];
    if (rates.banks) {
      rates.banks.forEach(rate => {
        if (rate.source && !banks.includes(rate.source)) {
          banks.push(rate.source);
        }
      });

      setAvailableBanks(banks);

      if (selectedBanks.length === 0 && banks.length > 0) {
        setSelectedBanks(banks);
      }
    }
  };

  const toggleCurrencySelection = (currency: string) => {
    if (selectedCurrencies.includes(currency)) {
      if (selectedCurrencies.length > 1) {
        setSelectedCurrencies(selectedCurrencies.filter(c => c !== currency));
      }
    } else {
      setSelectedCurrencies([...selectedCurrencies, currency]);
    }
  };

  const toggleBankSelection = (bank: string) => {
    if (selectedBanks.includes(bank)) {
      if (selectedBanks.length > 1) {
        setSelectedBanks(selectedBanks.filter(b => b !== bank));
      }
    } else {
      setSelectedBanks([...selectedBanks, bank]);
    }
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
  if (error && !rates) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDark ? '#ff6b6b' : '#dc3545' }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: isDark ? '#444444' : '#eeeeee' }]}
            onPress={() => dispatch(fetchRates(selectedCurrencies))}
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

        <FilterPanel
          selectedCurrencies={selectedCurrencies}
          selectedBanks={selectedBanks}
          onCurrencyPress={() => setCurrencyModalVisible(true)}
          onBankPress={() => setBankModalVisible(true)}
          isDark={isDark}
        />

        {!hasFilteredData ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: isDark ? '#ffffff' : '#000000' }]}>
              Нет данных по выбранным фильтрам
            </Text>
          </View>
        ) : (
          <>
            <RatesSection
              title="Official (NBU) Rates"
              rates={filteredData.nbu}
              keyPrefix="nbu"
              isDark={isDark}
            />

            <RatesSection
              title="Commercial Banks"
              rates={filteredData.banks}
              keyPrefix="bank"
              isDark={isDark}
            />

            <RatesSection
              title="Black Market"
              rates={filteredData.black}
              keyPrefix="black"
              isDark={isDark}
            />
          </>
        )}

        {lastUpdated && (
          <Text style={[styles.updatedText, { color: isDark ? '#aaaaaa' : '#666666' }]}>
            Last updated: {new Date(lastUpdated).toLocaleString()}
            {isOffline ? ' (offline data)' : ''}
          </Text>
        )}

        <View style={styles.footer} />
      </ScrollView>

      <CurrencySelectionModal
        visible={currencyModalVisible}
        onClose={() => setCurrencyModalVisible(false)}
        currencies={availableCurrencies}
        selectedCurrencies={selectedCurrencies}
        onToggle={toggleCurrencySelection}
        isDark={isDark}
      />

      <BankSelectionModal
        visible={bankModalVisible}
        onClose={() => setBankModalVisible(false)}
        banks={availableBanks}
        selectedBanks={selectedBanks}
        onToggle={toggleBankSelection}
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
  emptyContainer: {
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
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
