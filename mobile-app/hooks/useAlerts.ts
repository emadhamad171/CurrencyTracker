import { useState } from 'react';

import { api } from '../services/api';
import { PriceAlert, AlertsStats, NewAlertForm } from '../app/types/AlertTypes';

import { useNotifications } from './useNotification';

export const useAlerts = (user: any) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [stats, setStats] = useState<AlertsStats | null>(null);
  const [currentPrices, setCurrentPrices] = useState<Record<string, any>>({});
  const { getPushToken } = useNotifications();

  const loadAlerts = async () => {
    if (!user) {
      return;
    }

    try {
      const userAlerts = await api.getUserPriceAlerts(user.uid);
      setAlerts(userAlerts);
    } catch (error) {
      console.error('❌ Load alerts error:', error);
      throw new Error('Failed to load alerts');
    }
  };

  const loadStats = async () => {
    if (!user) {
      return;
    }

    try {
      const userStats = await api.getPriceAlertsStats(user.uid);
      setStats(userStats);
    } catch (error) {
      console.error('❌ Load stats error:', error);
    }
  };

  const loadCurrentPrices = async () => {
    try {
      const rates = await api.getCurrentRatesForAlerts();
      setCurrentPrices(rates);
    } catch (error) {
      console.error('❌ Load current prices error:', error);
    }
  };

  const createAlert = async (formData: NewAlertForm) => {
    if (!user) {
      throw new Error('Please sign in to your account');
    }

    if (!formData.targetPrice || parseFloat(formData.targetPrice) <= 0) {
      throw new Error('Please enter a valid price');
    }

    try {
      const pushToken = await getPushToken(user.uid);

      const alertData = {
        userId: user.uid,
        currencyPair: formData.currencyPair,
        alertType: formData.alertType,
        targetPrice: parseFloat(formData.targetPrice),
        pushToken,
      };

      return await api.createPriceAlert(alertData);
    } catch (error) {
      console.error('❌ Create alert error:', error);
      throw error;
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await api.deletePriceAlert(alertId, user.uid);
    } catch (error) {
      console.error('❌ Delete alert error:', error);
      throw error;
    }
  };

  return {
    alerts,
    stats,
    currentPrices,
    loadAlerts,
    loadStats,
    loadCurrentPrices,
    createAlert,
    deleteAlert,
  };
};
