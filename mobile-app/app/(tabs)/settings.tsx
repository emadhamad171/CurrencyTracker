import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { useColorScheme } from '../../hooks/useColorScheme';
import { UserProfileSection } from '../../components/UserProfileSection';
import { AppSettingsSection } from '../../components/AppSettingsSection';
import { NotificationSettingsSection } from '../../components/NotificationSettingsSection';
import { FooterSection } from '../../components/FooterSection';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
      <UserProfileSection isDark={isDark} />
      <AppSettingsSection isDark={isDark} colorScheme={colorScheme} />
      <NotificationSettingsSection isDark={isDark} />
      <FooterSection isDark={isDark} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
