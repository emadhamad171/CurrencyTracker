// app/(tabs)/components/EmptyAlertsState.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const EmptyAlertsState: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.icon}>📱</Text>
    <Text style={styles.title}>No Active Alerts</Text>
    <Text style={styles.text}>Create your first alert to get notified about rate changes</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
});
