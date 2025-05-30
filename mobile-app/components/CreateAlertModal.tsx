// app/(tabs)/components/CreateAlertModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

import { CURRENCY_PAIRS } from '../constants/config';
import { api } from '../services/api';
import { NewAlertForm } from '../app/types/AlertTypes';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreateAlert: (alertData: NewAlertForm) => void;
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

export const CreateAlertModal: React.FC<Props> = ({ visible, onClose, onCreateAlert }) => {
  const [formData, setFormData] = useState<NewAlertForm>({
    currencyPair: 'USDUAH',
    alertType: 'above',
    targetPrice: '',
    currentPrice: 0,
  });

  useEffect(() => {
    if (visible) {
      loadCurrentPrice();
    }
  }, [visible, formData.currencyPair]);

  const loadCurrentPrice = async () => {
    try {
      const rates = await api.getCurrentRatesForAlerts();
      setFormData(prev => ({
        ...prev,
        currentPrice: rates[prev.currencyPair]?.market || 0,
      }));
    } catch (error) {
      console.error('Error loading current price:', error);
    }
  };

  const handleSubmit = () => {
    onCreateAlert(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      currencyPair: 'USDUAH',
      alertType: 'above',
      targetPrice: '',
      currentPrice: 0,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <ModalHeader onCancel={handleClose} onSave={handleSubmit} />

        <ScrollView style={styles.content}>
          <CurrencyPairSelector
            selectedValue={formData.currencyPair}
            onValueChange={value => {
              setFormData({ ...formData, currencyPair: value });
            }}
          />

          <AlertTypeSelector
            selectedType={formData.alertType}
            onTypeChange={type => setFormData({ ...formData, alertType: type })}
          />

          <PriceInput
            value={formData.targetPrice}
            onChangeText={text => setFormData({ ...formData, targetPrice: text })}
          />

          <CurrentPriceInfo
            currencyInfo={getCurrencyPairInfo(formData.currencyPair)}
            currentPrice={formData.currentPrice}
          />

          <NotificationPreview
            currencyInfo={getCurrencyPairInfo(formData.currencyPair)}
            targetPrice={formData.targetPrice}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const ModalHeader: React.FC<{
  onCancel: () => void;
  onSave: () => void;
}> = ({ onCancel, onSave }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onCancel}>
      <Text style={styles.cancelButton}>Cancel</Text>
    </TouchableOpacity>
    <Text style={styles.title}>New Alert</Text>
    <TouchableOpacity onPress={onSave}>
      <Text style={styles.saveButton}>Create</Text>
    </TouchableOpacity>
  </View>
);

const CurrencyPairSelector: React.FC<{
  selectedValue: string;
  onValueChange: (value: string) => void;
}> = ({ selectedValue, onValueChange }) => (
  <View style={styles.formGroup}>
    <Text style={styles.formLabel}>Currency Pair</Text>
    <View style={styles.pickerContainer}>
      <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker}>
        {CURRENCY_PAIRS.map(pair => (
          <Picker.Item key={pair.code} label={pair.label} value={pair.code} />
        ))}
      </Picker>
    </View>
  </View>
);

const AlertTypeSelector: React.FC<{
  selectedType: 'above' | 'below';
  onTypeChange: (type: 'above' | 'below') => void;
}> = ({ selectedType, onTypeChange }) => (
  <View style={styles.formGroup}>
    <Text style={styles.formLabel}>Condition</Text>
    <View style={styles.alertTypeContainer}>
      <TouchableOpacity
        style={[styles.alertTypeButton, selectedType === 'above' && styles.alertTypeButtonActive]}
        onPress={() => onTypeChange('above')}
      >
        <Text
          style={[styles.alertTypeText, selectedType === 'above' && styles.alertTypeTextActive]}
        >
          ↗ Higher
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.alertTypeButton, selectedType === 'below' && styles.alertTypeButtonActive]}
        onPress={() => onTypeChange('below')}
      >
        <Text
          style={[styles.alertTypeText, selectedType === 'below' && styles.alertTypeTextActive]}
        >
          ↘ Lower
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const PriceInput: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
}> = ({ value, onChangeText }) => (
  <View style={styles.formGroup}>
    <Text style={styles.formLabel}>Target Price (₴)</Text>
    <TextInput
      style={styles.priceInput}
      value={value}
      onChangeText={onChangeText}
      placeholder="For example: 42.50"
      keyboardType="decimal-pad"
      autoFocus
    />
  </View>
);

const CurrentPriceInfo: React.FC<{
  currencyInfo: any;
  currentPrice: number;
}> = ({ currencyInfo, currentPrice }) => (
  <View style={styles.currentPriceInfo}>
    <Text style={styles.currentPriceLabel}>Current Rate {currencyInfo.name}:</Text>
    <Text style={styles.currentPriceValue}>
      {currentPrice ? `${currentPrice.toFixed(2)}₴` : 'Loading...'}
    </Text>
    <Text style={styles.currentPriceSubtext}>
      {currencyInfo.flag} {currencyInfo.code}
    </Text>
  </View>
);

const NotificationPreview: React.FC<{
  currencyInfo: any;
  targetPrice: string;
}> = ({ currencyInfo, targetPrice }) => (
  <View style={styles.notificationPreview}>
    <Text style={styles.previewTitle}>Example Notification:</Text>
    <View style={styles.notificationCard}>
      <Text style={styles.notificationTitle}>💰 Currency Rate Alert!</Text>
      <Text style={styles.notificationBody}>
        {currencyInfo.name}: {targetPrice || 'XX.XX'}₴{'\n'}Target: {targetPrice || 'XX.XX'}₴
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  cancelButton: {
    fontSize: 16,
    color: '#E74C3C',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A085',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  picker: {
    height: Platform.OS === 'ios' ? 200 : 50,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  alertTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  alertTypeButtonActive: {
    borderColor: '#16A085',
    backgroundColor: '#16A085',
  },
  alertTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  alertTypeTextActive: {
    color: '#FFFFFF',
  },
  priceInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  currentPriceInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  currentPriceLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  currentPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  currentPriceSubtext: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  notificationPreview: {
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  notificationCard: {
    backgroundColor: '#34495E',
    borderRadius: 8,
    padding: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});
