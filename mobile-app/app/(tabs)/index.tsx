// mobile-app/app/(tabs)/index.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  FlatList
} from 'react-native';
import { CurrencyRateCard } from '../../components/currency/CurrencyRateCard';
import { DEFAULT_CURRENCIES } from '../../constants/config';
import { useColorScheme } from '../../hooks/useColorScheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchRates } from '../../store/slices/currencySlice';
import { useAppDispatch, useAppSelector } from '@/store/hook';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const {
    rates,
    isLoading,
    error,
    lastUpdated
  } = useAppSelector(state => state.currency);
  const { isOffline } = useAppSelector(state => state.app);

  const [refreshing, setRefreshing] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);

  // Локальное состояние для всех ранее Redux-управляемых данных
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(DEFAULT_CURRENCIES.SELECTED);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [availableBanks, setAvailableBanks] = useState<string[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(DEFAULT_CURRENCIES.SELECTED);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Создаем индикатор состояния сети и источника данных
  const dataSourceInfo = useMemo(() => {
    if (!rates) return null;

    return {
      isOffline: isOffline,
      lastUpdated: lastUpdated,
    };
  }, [rates, isOffline, lastUpdated]);
  console.log(isOffline, '--------');
  // Extract available currencies and banks from rates data when it changes
  useEffect(() => {
    if (rates) {
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

        // If no banks selected yet, select all available
        if (selectedBanks.length === 0 && banks.length > 0) {
          setSelectedBanks(banks);
        }
      }
    }
  }, [rates]);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    // Передаем выбранные валюты в fetchRates
    dispatch(fetchRates(selectedCurrencies));
  }, [dispatch, selectedCurrencies]);

  // Обработчик обновления (pull-to-refresh)
  const handleRefresh = () => {
    setRefreshing(true);
    // Передаем выбранные валюты в fetchRates
    dispatch(fetchRates(selectedCurrencies))
        .finally(() => setRefreshing(false));
  };

  // Функция для обработки выбора валюты - теперь использует локальное состояние
  const toggleCurrencySelection = (currency: string) => {
    if (selectedCurrencies.includes(currency)) {
      // Не допускаем отмены выбора всех валют
      if (selectedCurrencies.length > 1) {
        setSelectedCurrencies(
            selectedCurrencies.filter(c => c !== currency)
        );
      }
    } else {
      setSelectedCurrencies([...selectedCurrencies, currency]);
    }
  };

  // Функция для обработки выбора банка
  const toggleBankSelection = (bank: string) => {
    if (selectedBanks.includes(bank)) {
      // Не допускаем отмены выбора всех банков
      if (selectedBanks.length > 1) {
        setSelectedBanks(selectedBanks.filter(b => b !== bank));
      }
    } else {
      setSelectedBanks([...selectedBanks, bank]);
    }
  };

  // Фильтрация данных
  const filteredNbu = useMemo(() => {
    if (!rates?.nbu) return [];
    return rates.nbu.filter(rate => selectedCurrencies.includes(rate.currency));
  }, [rates?.nbu, selectedCurrencies]);

  const filteredBanks = useMemo(() => {
    if (!rates?.banks) return [];
    return rates.banks.filter(rate =>
        selectedCurrencies.includes(rate.currency) &&
        selectedBanks.includes(rate.source)
    );
  }, [rates?.banks, selectedCurrencies, selectedBanks]);

  const filteredBlack = useMemo(() => {
    if (!rates?.black) return [];
    return rates.black.filter(rate => selectedCurrencies.includes(rate.currency));
  }, [rates?.black, selectedCurrencies]);

  // Проверка наличия отфильтрованных данных
  const hasFilteredData = filteredNbu.length > 0 || filteredBanks.length > 0 || filteredBlack.length > 0;

  return (
      <>
        <ScrollView
            style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
        >
          <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
            Currency Tracker
          </Text>

          {/* Unified offline/online data source indicator */}
          {dataSourceInfo && (
              <View style={[
                styles.dataSourceIndicator,
                {
                  backgroundColor: dataSourceInfo.isOffline
                      ? (isDark ? '#2c2c2e' : '#fff3e0')
                      : (isDark ? '#2a3a2a' : '#e8f5e9')
                }
              ]}>
                <MaterialCommunityIcons
                    name={dataSourceInfo.isOffline ? "wifi-off" : "wifi-check"}
                    size={20}
                    color={dataSourceInfo.isOffline ? (isDark ? '#ff9800' : '#ff6d00') : (isDark ? '#4caf50' : '#388e3c')}
                />
                <Text style={{
                  color: dataSourceInfo.isOffline ? (isDark ? '#ff9800' : '#ff6d00') : (isDark ? '#4caf50' : '#388e3c'),
                  marginLeft: 8
                }}>
                  {dataSourceInfo.isOffline
                      ? `Offline mode: Using data from ${new Date(dataSourceInfo.lastUpdated).toLocaleString()}`
                      : 'Online: Using latest data'
                  }
                </Text>
              </View>
          )}

          {/* Панель фильтров */}
          <View style={[styles.filterContainer, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setCurrencyModalVisible(true)}
            >
              <MaterialCommunityIcons
                  name="currency-usd"
                  size={20}
                  color={isDark ? '#3498db' : '#2980b9'}
              />
              <Text style={[styles.filterButtonText, { color: isDark ? '#ffffff' : '#000000' }]}>
                {selectedCurrencies.length > 0
                    ? `Валюты (${selectedCurrencies.length})`
                    : 'Выбрать валюты'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setBankModalVisible(true)}
            >
              <MaterialCommunityIcons
                  name="bank"
                  size={20}
                  color={isDark ? '#3498db' : '#2980b9'}
              />
              <Text style={[styles.filterButtonText, { color: isDark ? '#ffffff' : '#000000' }]}>
                {selectedBanks.length > 0
                    ? `Банки (${selectedBanks.length})`
                    : 'Выбрать банки'}
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading && !refreshing ? (
              <ActivityIndicator
                  size="large"
                  color={isDark ? '#ffffff' : '#000000'}
                  style={styles.loader}
              />
          ) : error && !rates ? ( // Показываем ошибку только если нет данных
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: isDark ? '#ff6b6b' : '#dc3545' }]}>
                  {error}
                </Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: isDark ? '#444444' : '#eeeeee' }]}
                    onPress={() => dispatch(fetchRates(selectedCurrencies))}
                >
                  <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>Retry</Text>
                </TouchableOpacity>
              </View>
          ) : !hasFilteredData ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: isDark ? '#ffffff' : '#000000' }]}>
                  Нет данных по выбранным фильтрам
                </Text>
              </View>
          ) : (
              <>
                {/* Отображение курсов НБУ */}
                {filteredNbu.length > 0 && (
                    <>
                      <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Official (NBU) Rates
                      </Text>
                      {filteredNbu.map((rate, index) => (
                          <CurrencyRateCard
                              key={`nbu-${index}`}
                              source={rate.source}
                              currency={rate.currency}
                              baseCurrency={rate.baseCurrency}
                              buy={rate.buy}
                              sell={rate.sell}
                              date={new Date(rate.date)}
                          />
                      ))}
                    </>
                )}

                {/* Отображение курсов банков (с фильтрацией) */}
                {filteredBanks.length > 0 && (
                    <>
                      <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Commercial Banks
                      </Text>
                      {filteredBanks.map((rate, index) => (
                          <CurrencyRateCard
                              key={`bank-${index}`}
                              source={rate.source}
                              currency={rate.currency}
                              baseCurrency={rate.baseCurrency}
                              buy={rate.buy}
                              sell={rate.sell}
                              date={new Date(rate.date)}
                          />
                      ))}
                    </>
                )}

                {/* Отображение черного рынка */}
                {filteredBlack.length > 0 && (
                    <>
                      <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Black Market
                      </Text>
                      {filteredBlack.map((rate, index) => (
                          <CurrencyRateCard
                              key={`black-${index}`}
                              source={rate.source}
                              currency={rate.currency}
                              baseCurrency={rate.baseCurrency}
                              buy={rate.buy}
                              sell={rate.sell}
                              date={new Date(rate.date)}
                          />
                      ))}
                    </>
                )}
              </>
          )}

          {/* Отображение последнего обновления */}
          {lastUpdated && (
              <Text style={[styles.updatedText, { color: isDark ? '#aaaaaa' : '#666666' }]}>
                Last updated: {new Date(lastUpdated).toLocaleString()}
                {isOffline ? ' (offline data)' : ''}
              </Text>
          )}

          <View style={styles.footer} />
        </ScrollView>

        {/* Модальное окно выбора валюты */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={currencyModalVisible}
            onRequestClose={() => setCurrencyModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
              <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                Выберите валюты
              </Text>

              <FlatList
                  data={availableCurrencies}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                      <TouchableOpacity
                          style={[
                            styles.modalItem,
                            selectedCurrencies.includes(item) &&
                            { backgroundColor: isDark ? '#444444' : '#e6f7ff' }
                          ]}
                          onPress={() => toggleCurrencySelection(item)}
                      >
                        <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>
                          {item}
                        </Text>
                        {selectedCurrencies.includes(item) && (
                            <MaterialCommunityIcons
                                name="check"
                                size={20}
                                color={isDark ? '#3498db' : '#2980b9'}
                            />
                        )}
                      </TouchableOpacity>
                  )}
              />

              <TouchableOpacity
                  style={[styles.modalCloseButton, { backgroundColor: isDark ? '#3498db' : '#2980b9' }]}
                  onPress={() => setCurrencyModalVisible(false)}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>
                  Применить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Модальное окно выбора банка */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={bankModalVisible}
            onRequestClose={() => setBankModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
              <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                Выберите банки
              </Text>

              <FlatList
                  data={availableBanks}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                      <TouchableOpacity
                          style={[
                            styles.modalItem,
                            selectedBanks.includes(item) &&
                            { backgroundColor: isDark ? '#444444' : '#e6f7ff' }
                          ]}
                          onPress={() => toggleBankSelection(item)}
                      >
                        <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>
                          {item}
                        </Text>
                        {selectedBanks.includes(item) && (
                            <MaterialCommunityIcons
                                name="check"
                                size={20}
                                color={isDark ? '#3498db' : '#2980b9'}
                            />
                        )}
                      </TouchableOpacity>
                  )}
              />

              <TouchableOpacity
                  style={[styles.modalCloseButton, { backgroundColor: isDark ? '#3498db' : '#2980b9' }]}
                  onPress={() => setBankModalVisible(false)}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>
                  Применить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
  );
}

const styles = StyleSheet.create({
  // Стили не изменяются
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  connectionAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  dataSourceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  debugView: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalCloseButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
});
