import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { SettingItem } from './SettingItem';

interface Props {
  isDark: boolean;
}

export const NotificationSettingsSection: React.FC<Props> = ({ isDark }) => {
  const router = useRouter();

  const handleAlertsPress = () => {
    router.push('/(tabs)/alerts');
  };

  return (
    <View style={[styles.section, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
        Уведомления
      </Text>

      <SettingItem
        icon="bell-outline"
        text="Оповещения о курсах"
        onPress={handleAlertsPress}
        showChevron={true}
        iconColor={isDark ? '#888888' : '#666666'}
        textColor={isDark ? '#ffffff' : '#000000'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});
