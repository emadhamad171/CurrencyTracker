// app/(tabs)/components/CurrencyButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CurrencyInfo {
  code: string;
  name: string;
  rate: number;
}

interface Props {
  currency: string;
  currencyInfo: CurrencyInfo;
  onPress: () => void;
  isDark: boolean;
}

export const CurrencyButton: React.FC<Props> = ({ currency, currencyInfo, onPress, isDark }) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: isDark ? '#444444' : '#f8f9fa' }]}
    onPress={onPress}
  >
    <Text style={[styles.code, { color: isDark ? '#ffffff' : '#000000' }]}>{currency}</Text>
    <Text style={[styles.name, { color: isDark ? '#a9a9a9' : '#666666' }]}>
      {currencyInfo.name}
    </Text>
    <MaterialCommunityIcons name="chevron-down" size={24} color={isDark ? '#a9a9a9' : '#666666'} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  code: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  name: {
    flex: 1,
    fontSize: 14,
  },
});
