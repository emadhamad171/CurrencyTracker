import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { PriceAlert } from '../app/types/AlertTypes';
import { CURRENCY_PAIRS } from '../constants/config';

interface Props {
  alert: PriceAlert;
  onDelete: () => void;
}

const getCurrencyPairInfo = (code: string) => {
  return (
    CURRENCY_PAIRS.find(pair => pair.code === code) || {
      code,
      label: code,
      flag: '💱',
      name: 'Unknown Currency',
    }
  );
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'triggered':
      return '#E74C3C';
    case 'ready_to_trigger':
      return '#F39C12';
    case 'close':
      return '#F39C12';
    case 'waiting':
      return '#16A085';
    case 'inactive':
      return '#95A5A6';
    default:
      return '#7F8C8D';
  }
};

const getStatusText = (status?: string) => {
  switch (status) {
    case 'triggered':
      return 'TRIGGERED';
    case 'ready_to_trigger':
      return 'READY';
    case 'close':
      return 'CLOSE';
    case 'waiting':
      return 'WAITING';
    case 'inactive':
      return 'INACTIVE';
    default:
      return 'UNKNOWN';
  }
};

export const AlertCard: React.FC<Props> = ({ alert, onDelete }) => {
  const currencyInfo = getCurrencyPairInfo(alert.currencyPair);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.currency}>
            {currencyInfo.flag} {alert.currencyPair}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(alert.status) }]}>
            <Text style={styles.statusText}>{getStatusText(alert.status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <AlertRow
          label="Condition:"
          value={`${alert.alertType === 'above' ? '↗ Higher' : '↘ Lower'} ${alert.targetPrice}₴`}
        />
        <AlertRow
          label="Current price:"
          value={`${alert.currentPrice?.toFixed(2) || 'N/A'}₴`}
          valueColor={
            alert.currentPrice && alert.currentPrice > alert.targetPrice ? '#16A085' : '#E74C3C'
          }
        />
        <AlertRow label="Currency:" value={currencyInfo.name} />
        <AlertRow label="Created:" value={new Date(alert.createdAt).toLocaleDateString('en-US')} />
        {alert.triggeredAt && (
          <AlertRow
            label="Triggered:"
            value={new Date(alert.triggeredAt).toLocaleString('en-US')}
            valueColor="#E74C3C"
          />
        )}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const AlertRow: React.FC<{
  label: string;
  value: string;
  valueColor?: string;
}> = ({ label, value, valueColor }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, valueColor && { color: valueColor }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currency: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  info: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E74C3C',
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
