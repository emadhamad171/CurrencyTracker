import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { CurrencyForecast } from '../app/types/ForecastTypes';
import {
  getDirectionColor,
  getDirectionIcon,
  getDirectionText,
  getConfidenceLevel,
} from '../utils/forecastUtils';

import { ForecastDetails } from './ForecastDetails';

interface Props {
  pair: string;
  title: string;
  icon: string;
  forecast: CurrencyForecast;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const CurrencyForecastCard: React.FC<Props> = ({
  title,
  icon,
  forecast,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onToggleExpand} activeOpacity={0.95}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </View>

      {/* Main forecast */}
      <View style={styles.forecastMain}>
        <View style={styles.directionContainer}>
          <Text
            style={[
              styles.directionIcon,
              {
                color: getDirectionColor(forecast.direction),
              },
            ]}
          >
            {getDirectionIcon(forecast.direction)}
          </Text>
          <Text
            style={[
              styles.directionText,
              {
                color: getDirectionColor(forecast.direction),
              },
            ]}
          >
            {getDirectionText(forecast.direction)}
          </Text>
        </View>

        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceNumber}>{forecast.confidence}%</Text>
          <Text
            style={[
              styles.confidenceLevel,
              {
                color: getConfidenceLevel(forecast.confidence).color,
              },
            ]}
          >
            {getConfidenceLevel(forecast.confidence).text}
          </Text>
        </View>
      </View>

      {/* Current price */}
      <View style={styles.currentPriceContainer}>
        <Text style={styles.currentPriceLabel}>Current rate:</Text>
        <Text style={styles.currentPriceValue}>{forecast.currentPrice?.toFixed(2) || 'N/A'}₴</Text>
      </View>

      {/* Expanded details */}
      {isExpanded && <ForecastDetails forecast={forecast} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  expandIcon: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  forecastMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  directionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  directionIcon: {
    fontSize: 32,
    marginRight: 12,
    fontWeight: 'bold',
  },
  directionText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  confidenceLevel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  currentPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  currentPriceLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  currentPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});
