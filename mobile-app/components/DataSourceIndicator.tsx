// app/(tabs)/components/DataSourceIndicator.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DataSourceInfo {
  isOffline: boolean;
  lastUpdated: string;
  freshness?: {
    isStale: boolean;
    hoursAgo: number;
  };
}

interface Props {
  dataSourceInfo: DataSourceInfo | null;
  isLoading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
  isDark: boolean;
}

export const DataSourceIndicator: React.FC<Props> = ({
  dataSourceInfo,
  isLoading,
  onRefresh,
  refreshing,
  isDark,
}) => {
  if (!dataSourceInfo) {
    return null;
  }

  const getStatusColor = () => {
    if (dataSourceInfo.isOffline) {
      return isDark ? '#ff9800' : '#ff6d00';
    }
    if (dataSourceInfo.freshness?.isStale) {
      return isDark ? '#ffa726' : '#f57c00';
    }
    return isDark ? '#4caf50' : '#388e3c';
  };

  const getBackgroundColor = () => {
    if (dataSourceInfo.isOffline) {
      return isDark ? '#2c2c2e' : '#fff3e0';
    }
    if (dataSourceInfo.freshness?.isStale) {
      return isDark ? '#2c2c2e' : '#fff8e1';
    }
    return isDark ? '#2a3a2a' : '#e8f5e9';
  };

  const getStatusText = () => {
    if (dataSourceInfo.isOffline) {
      return `Offline mode: Using cached data${dataSourceInfo.freshness ? ` (${dataSourceInfo.freshness.hoursAgo}h ago)` : ''}`;
    }
    if (dataSourceInfo.freshness?.isStale) {
      return `Online: Data may be outdated (${dataSourceInfo.freshness.hoursAgo}h ago)`;
    }
    return 'Online: Using fresh NBU rates';
  };

  const getIconName = () => {
    if (dataSourceInfo.isOffline) {
      return 'wifi-off';
    }
    if (dataSourceInfo.freshness?.isStale) {
      return 'clock-alert-outline';
    }
    return 'wifi-check';
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <MaterialCommunityIcons name={getIconName()} size={20} color={getStatusColor()} />
      <Text style={[styles.text, { color: getStatusColor() }]}>{getStatusText()}</Text>
      {!isLoading && (
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton} disabled={refreshing}>
          <MaterialCommunityIcons name="refresh" size={20} color={isDark ? '#ffffff' : '#666666'} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  text: {
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    padding: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
});
