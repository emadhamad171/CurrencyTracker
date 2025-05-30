import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  user: any;
  isDark: boolean;
}

export const UserAvatar: React.FC<Props> = ({ user, isDark }) => {
  const getInitial = () => {
    if (user?.displayName) {
      return user.displayName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <View style={styles.profileContainer}>
      <View style={[styles.profileAvatar, { backgroundColor: isDark ? '#444444' : '#e0e0e0' }]}>
        <Text style={[styles.profileInitial, { color: isDark ? '#ffffff' : '#000000' }]}>
          {getInitial()}
        </Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={[styles.profileName, { color: isDark ? '#ffffff' : '#000000' }]}>
          {user?.displayName || 'Пользователь'}
        </Text>
        <Text style={[styles.profileEmail, { color: isDark ? '#aaaaaa' : '#666666' }]}>
          {user?.email || ''}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
});
