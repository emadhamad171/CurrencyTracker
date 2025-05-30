import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

import { useAuth } from '../../contexts/AuthContext';
import { DataSourceIndicator } from '../../components/DataSourceIndicator';
import { AlertsStatsSection } from '../../components/AlertsStatsSection';
import { CreateAlertButton } from '../../components/CreateAlertButton';
import { AlertsList } from '../../components/AlertsList';
import { EmptyAlertsState } from '../../components/EmptyAlertsState';
import { AuthRequiredState } from '../../components/AuthRequiredState';
import { CreateAlertModal } from '../../components/CreateAlertModal';
import { useNotifications } from '../../hooks/useNotification';
import { useAlerts } from '../../hooks/useAlerts';

import { NewAlertForm } from '@/app/types/AlertTypes';

// Настройка уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PriceAlertsScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Custom hooks
  const { setupNotifications } = useNotifications();
  const { alerts, stats, loadAlerts, loadStats, createAlert, deleteAlert, loadCurrentPrices } =
    useAlerts(user);

  useEffect(() => {
    if (user) {
      initializeScreen();
    }
  }, [user]);

  const initializeScreen = async () => {
    await Promise.all([loadAlerts(), loadStats(), setupNotifications(), loadCurrentPrices()]);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadAlerts(), loadStats(), loadCurrentPrices()]);
    setRefreshing(false);
  }, [user]);

  const handleCreateAlert = async (alertData: NewAlertForm) => {
    try {
      await createAlert(alertData);
      setCreateModalVisible(false);
      Alert.alert('Success! 🎉', 'Alert created successfully');
      await Promise.all([loadAlerts(), loadStats()]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create alert');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    Alert.alert('Delete alert?', 'This action cannot be undone', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAlert(alertId);
            Alert.alert('Success', 'Alert deleted');
            await Promise.all([loadAlerts(), loadStats()]);
          } catch {
            Alert.alert('Error', 'Failed to delete alert');
          }
        },
      },
    ]);
  };

  // Loading state
  if (!user) {
    return <AuthRequiredState />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2C3E50" />
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
          dataSourceInfo={{ isOffline: false, lastUpdated: new Date().toISOString() }}
          isLoading={loading}
          onRefresh={onRefresh}
          refreshing={refreshing}
          isDark={false}
        />

        <AlertsStatsSection stats={stats} />

        <CreateAlertButton onPress={() => setCreateModalVisible(true)} />

        {alerts.length > 0 ? (
          <AlertsList alerts={alerts} onDeleteAlert={handleDeleteAlert} />
        ) : (
          <EmptyAlertsState />
        )}
      </ScrollView>

      <CreateAlertModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreateAlert={handleCreateAlert}
      />
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
  },
});

export default PriceAlertsScreen;
