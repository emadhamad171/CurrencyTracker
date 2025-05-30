import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  isDark: boolean;
}

export const FooterSection: React.FC<Props> = ({ isDark }) => {
  return (
    <View style={styles.footer}>
      <Text style={[styles.footerText, { color: isDark ? '#888888' : '#666666' }]}>
        © 2025 Currency Tracker
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});
