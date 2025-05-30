import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  currencies: string[];
  selectedCurrencies: string[];
  onToggle: (currency: string) => void;
  isDark: boolean;
}

export const CurrencySelectionModal: React.FC<Props> = ({
  visible,
  onClose,
  currencies,
  selectedCurrencies,
  onToggle,
  isDark,
}) => (
  <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={[styles.content, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
          Choose currencies
        </Text>

        <FlatList
          data={currencies}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <SelectionItem
              text={item}
              isSelected={selectedCurrencies.includes(item)}
              onPress={() => onToggle(item)}
              isDark={isDark}
            />
          )}
        />

        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: isDark ? '#3498db' : '#2980b9' }]}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// app/(tabs)/components/BankSelectionModal.tsx
interface BankProps {
  visible: boolean;
  onClose: () => void;
  banks: string[];
  selectedBanks: string[];
  onToggle: (bank: string) => void;
  isDark: boolean;
}

export const BankSelectionModal: React.FC<BankProps> = ({
  visible,
  onClose,
  banks,
  selectedBanks,
  onToggle,
  isDark,
}) => (
  <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={[styles.content, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>Choose banks</Text>

        <FlatList
          data={banks}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <SelectionItem
              text={item}
              isSelected={selectedBanks.includes(item)}
              onPress={() => onToggle(item)}
              isDark={isDark}
            />
          )}
        />

        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: isDark ? '#3498db' : '#2980b9' }]}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// Общий компонент для элементов списка
const SelectionItem: React.FC<{
  text: string;
  isSelected: boolean;
  onPress: () => void;
  isDark: boolean;
}> = ({ text, isSelected, onPress, isDark }) => (
  <TouchableOpacity
    style={[styles.item, isSelected && { backgroundColor: isDark ? '#444444' : '#e6f7ff' }]}
    onPress={onPress}
  >
    <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>{text}</Text>
    {isSelected && (
      <MaterialCommunityIcons name="check" size={20} color={isDark ? '#3498db' : '#2980b9'} />
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
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  closeButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
