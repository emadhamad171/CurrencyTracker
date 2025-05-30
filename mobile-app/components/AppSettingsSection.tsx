import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { SettingItem } from './SettingItem';

interface Props {
  isDark: boolean;
  colorScheme: string;
}

export const AppSettingsSection: React.FC<Props> = ({ isDark, colorScheme }) => {
  const getThemeText = () => {
    switch (colorScheme) {
      case 'dark':
        return 'Темная';
      case 'light':
        return 'Светлая';
      default:
        return 'Системная';
    }
  };

  return (
    <View style={[styles.section, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
        Настройки приложения
      </Text>

      <SettingItem
        icon="theme-light-dark"
        text="Тема"
        value={getThemeText()}
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
