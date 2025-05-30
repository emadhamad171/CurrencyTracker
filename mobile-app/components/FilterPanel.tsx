// app/(tabs)/components/FilterPanel.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  selectedCurrencies: string[];
  selectedBanks: string[];
  onCurrencyPress: () => void;
  onBankPress: () => void;
  isDark: boolean;
}

export const FilterPanel: React.FC<Props> = ({
  selectedCurrencies,
  selectedBanks,
  onCurrencyPress,
  onBankPress,
  isDark,
}) => (
  <View style={[styles.container, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
    <TouchableOpacity style={styles.button} onPress={onCurrencyPress}>
      <MaterialCommunityIcons
        name="currency-usd"
        size={20}
        color={isDark ? '#3498db' : '#2980b9'}
      />
      <Text style={[styles.buttonText, { color: isDark ? '#ffffff' : '#000000' }]}>
        {selectedCurrencies.length > 0
          ? `Currencies (${selectedCurrencies.length})`
          : 'Choose currencies'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.button} onPress={onBankPress}>
      <MaterialCommunityIcons name="bank" size={20} color={isDark ? '#3498db' : '#2980b9'} />
      <Text style={[styles.buttonText, { color: isDark ? '#ffffff' : '#000000' }]}>
        {selectedBanks.length > 0 ? `Banks (${selectedBanks.length})` : 'Choose banks'}
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  buttonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
});
