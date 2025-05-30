import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  currencies: Currency[];
  selectedCurrency: string;
  onSelect: (currencyCode: string) => void;
  isDark: boolean;
}

export const CurrencyModal: React.FC<Props> = ({
  visible,
  onClose,
  currencies,
  selectedCurrency,
  onSelect,
  isDark,
}) => (
  <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={[styles.content, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
          Select Currency
        </Text>
        <ScrollView style={styles.scrollView}>
          {currencies.map(currency => (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.item,
                selectedCurrency === currency.code && {
                  backgroundColor: isDark ? '#444444' : '#e6f7ff',
                },
              ]}
              onPress={() => onSelect(currency.code)}
            >
              <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>
                {currency.code} - {currency.name}
              </Text>
            </TouchableOpacity>
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

interface PeriodOption {
  label: string;
  value: string;
}

interface PeriodModalProps {
  visible: boolean;
  onClose: () => void;
  periods: PeriodOption[];
  selectedPeriod: string;
  onSelect: (period: string) => void;
  isDark: boolean;
}

export const PeriodModal: React.FC<PeriodModalProps> = ({
  visible,
  onClose,
  periods,
  selectedPeriod,
  onSelect,
  isDark,
}) => (
  <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={[styles.content, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>Select Period</Text>
        <ScrollView style={styles.scrollView}>
          {periods.map(period => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.item,
                selectedPeriod === period.value && {
                  backgroundColor: isDark ? '#444444' : '#e6f7ff',
                },
              ]}
              onPress={() => onSelect(period.value)}
            >
              <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>{period.label}</Text>
            </TouchableOpacity>
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

// Общие стили для модальных окон
const modalStyles = StyleSheet.create({
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
});

const styles = modalStyles;
