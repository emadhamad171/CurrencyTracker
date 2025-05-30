import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { AlertsStats } from '../app/types/AlertTypes';

interface Props {
  stats: AlertsStats | null;
}

export const AlertsStatsSection: React.FC<Props> = ({ stats }) => {
  if (!stats) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Alert Statistics</Text>
      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.number}>{stats.active}</Text>
          <Text style={styles.label}>Active</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.number}>{stats.triggered}</Text>
          <Text style={styles.label}>Triggered</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.number}>{stats.total}</Text>
          <Text style={styles.label}>Total</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  number: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  label: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
});
