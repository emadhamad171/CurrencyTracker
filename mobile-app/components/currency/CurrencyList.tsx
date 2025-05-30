import React from 'react';
import { FlatList, StyleSheet, RefreshControl, View, Text } from 'react-native';
import { router } from 'expo-router';

import CurrencyCard from './CurrencyCard';

// Тип для данных о валюте
export interface CurrencyData {
  code: string; // Код валюты (например, USD, EUR)
  name: string; // Полное название валюты
  rate: number; // Текущий курс
  previousRate?: number; // Предыдущий курс для отображения изменений
}

interface CurrencyListProps {
  currencies: CurrencyData[];
  baseCurrency: string;
  favoriteCurrencies?: string[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onToggleFavorite?: (currencyCode: string) => void;
  showOnlyFavorites?: boolean;
}

const CurrencyList: React.FC<CurrencyListProps> = ({
  currencies,
  baseCurrency,
  favoriteCurrencies = [],
  isLoading = false,
  onRefresh,
  onToggleFavorite,
  showOnlyFavorites = false,
}) => {
  // Фильтрация валют
  const displayCurrencies = showOnlyFavorites
    ? currencies.filter(currency => favoriteCurrencies.includes(currency.code))
    : currencies;

  // Обработчик нажатия на карточку валюты
  const handleCurrencyPress = (currency: CurrencyData) => {
    router.push({
      pathname: `/currency/${currency.code}`,
      params: {
        name: currency.name,
        baseCurrency,
      },
    });
  };

  // Если нет данных
  if (displayCurrencies.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {showOnlyFavorites ? 'У вас нет избранных валют' : 'Нет доступных валют'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={displayCurrencies}
      keyExtractor={item => item.code}
      renderItem={({ item }) => (
        <CurrencyCard
          currencyCode={item.code}
          currencyName={item.name}
          rate={item.rate}
          previousRate={item.previousRate}
          isFavorite={favoriteCurrencies.includes(item.code)}
          onPress={() => handleCurrencyPress(item)}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item.code) : undefined}
        />
      )}
      contentContainerStyle={styles.listContent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default CurrencyList;
