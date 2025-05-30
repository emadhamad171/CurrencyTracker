import { useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export const useNotifications = () => {
  const [pushToken, setPushToken] = useState<string>('');

  const setupNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Push Notifications',
          'To receive price alerts, please enable notifications in settings'
        );
        return;
      }

      await Notifications.setNotificationCategoryAsync('price-alerts', [
        {
          identifier: 'view',
          buttonTitle: 'View',
          options: { foreground: true },
        },
      ]);

      try {
        const expoPushToken = await Notifications.getExpoPushTokenAsync();
        setPushToken(expoPushToken.data);
      } catch (tokenError) {
        console.warn('⚠️ Push token failed:', tokenError.message);
        setPushToken(`fallback_${Date.now()}`);
      }
    } catch (error) {
      console.error('❌ Notification setup error:', error);
    }
  };

  const getPushToken = async (userId: string): Promise<string> => {
    if (pushToken && pushToken.includes('ExponentPushToken')) {
      return pushToken;
    }

    try {
      const expoPushToken = await Notifications.getExpoPushTokenAsync();
      return expoPushToken.data;
    } catch  {
      return `fallback_${userId}_${Date.now()}`;
    }
  };

  return {
    setupNotifications,
    getPushToken,
    pushToken,
  };
};
