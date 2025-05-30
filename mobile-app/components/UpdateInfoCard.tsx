import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  lastUpdate: string;
}

export const UpdateInfoCard: React.FC<Props> = ({ lastUpdate }) => (
  <View style={styles.container}>
    <Text style={styles.updateTime}>
      🕐 Updated: {new Date(lastUpdate).toLocaleTimeString('en-US')}
    </Text>
    <Text style={styles.dataSource}>Real Market Data</Text>
    <Text style={styles.dataQuality}>✅ Live Analysis</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  updateTime: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  dataSource: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 4,
  },
  dataQuality: {
    fontSize: 12,
    color: '#16A085',
    fontWeight: '500',
  },
});
