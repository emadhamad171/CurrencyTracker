import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '../contexts/AuthContext';
import { auth, signOut } from '../firebase';

import { SettingItem } from './SettingItem';
import { UserAvatar } from './UserAvatar';

interface Props {
  isDark: boolean;
}

export const UserProfileSection: React.FC<Props> = ({ isDark }) => {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    Alert.alert('Выход из аккаунта', 'Вы уверены, что хотите выйти?', [
      {
        text: 'Отмена',
        style: 'cancel',
      },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace('/auth/login');
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'We were not able to log out');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.section, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>Account</Text>

      <UserAvatar user={user} isDark={isDark} />

      <SettingItem
        icon="logout"
        text="Logout"
        onPress={handleLogout}
        textColor="#dc3545"
        iconColor="#dc3545"
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
