// app/(tabs)/components/CurrencyModal.tsx
import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface Currency {
  code: string;
  name: string;
  rate: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  currencies: Currency[];
  selectedCurrency: string;
  onSelect: (currencyCode: string) => void;
  isDark: boolean;
}

export const CurrencyModal: React.FC<Props> = ({
  visible,
  onClose,
  title,
  currencies,
  selectedCurrency,
  onSelect,
  isDark,
}) => (
  <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={[styles.content, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>{title}</Text>
        <ScrollView style={styles.scrollView}>
          {currencies.map(currency => (
            <CurrencyItem
              key={currency.code}
              currency={currency}
              isSelected={selectedCurrency === currency.code}
              onSelect={onSelect}
              isDark={isDark}
            />
          ))}
        </ScrollView>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: isDark ? '#444444' : '#eeeeee' }]}
          onPress={onClose}
        >
          <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const CurrencyItem: React.FC<{
  currency: Currency;
  isSelected: boolean;
  onSelect: (code: string) => void;
  isDark: boolean;
}> = ({ currency, isSelected, onSelect, isDark }) => (
  <TouchableOpacity
    style={[styles.item, isSelected && { backgroundColor: isDark ? '#444444' : '#e6f7ff' }]}
    onPress={() => onSelect(currency.code)}
  >
    <View style={styles.itemContent}>
      <Text style={[styles.itemCode, { color: isDark ? '#ffffff' : '#000000' }]}>
        {currency.code}
      </Text>
      <Text style={[styles.itemName, { color: isDark ? '#a9a9a9' : '#666666' }]}>
        {currency.name}
      </Text>
    </View>
    {currency.code !== 'UAH' && (
      <Text style={[styles.itemRate, { color: isDark ? '#a9a9a9' : '#666666' }]}>
        {currency.rate.toFixed(4)}
      </Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '70%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollView: {
    marginBottom: 16,
    maxHeight: 300,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  itemContent: {
    flex: 1,
  },
  itemCode: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemName: {
    fontSize: 12,
    marginTop: 2,
  },
  itemRate: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
});
