// app/(tabs)/forecast.tsx - Рефакторированный ForecastScreen
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DataSourceIndicator } from '../../components/DataSourceIndicator';
import { MarketSentimentCard } from '../../components/MarketSentimentCard';
import { CurrencyForecastCard } from '../../components/CurrencyForecastCard';
import { EconomicIndicatorsCard } from '../../components/EconomicIndicatorsCard';
import { UpcomingEventsCard } from '../../components/UpcomingEventsCard';
import { UpdateInfoCard } from '../../components/UpdateInfoCard';
import { useForecastData } from '../../hooks/useForecastData';

const ForecastScreen: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const { data, loading, refreshing, error, loadData, refreshData } = useForecastData();

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    await refreshData();
  };

  const handleCardExpand = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2C3E50" />
          <Text style={styles.loadingText}>Analyzing markets...</Text>
          <Text style={styles.loadingSubtext}>Loading real data</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😞</Text>
          <Text style={styles.errorText}>Failed to load data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2C3E50"
            colors={['#2C3E50']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <DataSourceIndicator
          dataSourceInfo={{
            isOffline: false,
            lastUpdated: data.lastUpdate,
            source: 'Real Market Data',
          }}
          isLoading={loading}
          onRefresh={onRefresh}
          refreshing={refreshing}
          isDark={false}
        />

        <MarketSentimentCard indicators={data.indicators} />

        <CurrencyForecastCard
          pair="USDUAH"
          title="USD/UAH"
          icon="💵🇺🇦"
          forecast={data.forecasts.USDUAH}
          isExpanded={expandedCard === 'USDUAH'}
          onToggleExpand={() => handleCardExpand('USDUAH')}
        />

        <CurrencyForecastCard
          pair="EURUAH"
          title="EUR/UAH"
          icon="💶🇺🇦"
          forecast={data.forecasts.EURUAH}
          isExpanded={expandedCard === 'EURUAH'}
          onToggleExpand={() => handleCardExpand('EURUAH')}
        />

        <EconomicIndicatorsCard indicators={data.indicators} />

        <UpcomingEventsCard events={data.upcomingEvents} />

        <UpdateInfoCard lastUpdate={data.lastUpdate} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2C3E50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ForecastScreen;
