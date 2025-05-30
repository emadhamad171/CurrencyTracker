// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import { ActivityIndicator, View, Text } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import NetInfo from '@react-native-community/netinfo';

import { persistor, store } from '../store/index';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

import { setNetworkStatus } from '@/store/slices/appSlice';

const NetworkListener = () => {
  useEffect(() => {
    // Устанавливаем слушателя изменений сети
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOffline = !state.isConnected || !state.isInternetReachable;
      store.dispatch(setNetworkStatus(isOffline));
    });

    // Делаем начальную проверку
    NetInfo.fetch().then(state => {
      const isOffline = !state.isConnected || !state.isInternetReachable;
      store.dispatch(setNetworkStatus(isOffline));
    });

    return () => unsubscribe();
  }, []);

  return null;
};
// Навигация с учётом аутентификации
function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={{ marginTop: 10, color: '#666' }}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} redirect={!user} />
      <Stack.Screen
        name="auth/login"
        options={{ title: 'Вход', headerShown: false }}
        redirect={!!user}
      />
      <Stack.Screen
        name="auth/register"
        options={{ title: 'Register', headerShown: false }}
        redirect={!!user}
      />
      {/* Обработка корневого маршрута */}
      <Stack.Screen
        name="index"
        // Не используем redirect prop, а вместо этого возвращаем компонент редиректа
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

// Компонент для корневого маршрута - экспортируется отдельно
export function Index() {
  const { user } = useAuth();
  // Перенаправление на основе аутентификации
  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/auth/login" />;
}

// Корневой Layout
export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <NetworkListener />
          <RootLayoutNav />
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}
