import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { persistor, store } from '@/store';

export default function TabsLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#3498db',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopColor: '#e0e0e0',
              paddingBottom: 5,
              paddingTop: 5,
            },
            headerStyle: {
              backgroundColor: '#2c3e50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Currency rates',
              tabBarLabel: 'Rates',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="currency-usd" color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="history"
            options={{
              title: 'History of rates',
              tabBarLabel: 'History',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="chart-line" color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="forecast"
            options={{
              title: 'Forecast',
              tabBarLabel: 'Forecast',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="chart-timeline-variant" color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="alerts"
            options={{
              title: 'Оповещения',
              tabBarLabel: 'Оповещения',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="bell-outline" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="converter"
            options={{
              title: 'Converter',
              tabBarLabel: 'Converter',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="swap-vertical" color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarLabel: 'Settings',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cog" color={color} size={size} />
              ),
            }}
          />
        </Tabs>
      </PersistGate>
    </Provider>
  );
}
