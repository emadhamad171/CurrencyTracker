import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  selectedCurrency: string;
  selectedPeriod: string;
  onCurrencyPress: () => void;
  onPeriodPress: () => void;
  isDark: boolean;
}

export const HistoryFilterPanel: React.FC<Props> = ({
  selectedCurrency,
  selectedPeriod,
  onCurrencyPress,
  onPeriodPress,
  isDark,
}) => (
  <View style={[styles.container, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
    <View style={styles.selectorContainer}>
      <Text style={[styles.label, { color: isDark ? '#ffffff' : '#000000' }]}>Currency:</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isDark ? '#444444' : '#f1f1f1' }]}
        onPress={onCurrencyPress}
      >
        <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>{selectedCurrency}</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.selectorContainer}>
      <Text style={[styles.label, { color: isDark ? '#ffffff' : '#000000' }]}>Period:</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isDark ? '#444444' : '#f1f1f1' }]}
        onPress={onPeriodPress}
      >
        <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>{selectedPeriod}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectorContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
