import { useState } from 'react';
import { Alert } from 'react-native';

import { api, FundamentalDashboard } from '../services/api';

export const useForecastData = () => {
  const [data, setData] = useState<FundamentalDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const result = await api.getFundamentalDashboard();
      setData(result);
    } catch (error) {
      console.error('📱 CLIENT API error:', error);
      setError('Failed to load analysis');
      Alert.alert('Error', 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const freshData = await api.refreshFundamentalData();
      setData(freshData);
      setError(null);
    } catch (error) {
      console.error('📱 Refresh error:', error);
      setError('Failed to refresh data');
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  return {
    data,
    loading,
    refreshing,
    error,
    loadData,
    refreshData,
  };
};
