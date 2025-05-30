import React from 'react';
import { View, StyleSheet } from 'react-native';

import { PriceAlert } from '../app/types/AlertTypes';

import { AlertCard } from './AlertCard';

interface Props {
  alerts: PriceAlert[];
  onDeleteAlert: (alertId: string) => void;
}

export const AlertsList: React.FC<Props> = ({ alerts, onDeleteAlert }) => (
  <View style={styles.container}>
    {alerts.map(alert => (
      <AlertCard key={alert.id} alert={alert} onDelete={() => onDeleteAlert(alert.id)} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 8,
  },
});
