// app/(tabs)/components/ForecastDetails.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { CurrencyForecast } from '../app/types/ForecastTypes';
import { getSpreadStatusColor } from '../utils/forecastUtils';

interface Props {
  forecast: CurrencyForecast;
}

export const ForecastDetails: React.FC<Props> = ({ forecast }) => (
  <View style={styles.container}>
    <KeyFactorsSection reasons={forecast?.factors} />

    {forecast.targets && <TargetsSection targets={forecast.targets} />}

    {forecast.technicalLevels && <TechnicalLevelsSection levels={forecast.technicalLevels} />}

    {forecast.spreadAnalysis && <SpreadAnalysisSection analysis={forecast.spreadAnalysis} />}
  </View>
);

const KeyFactorsSection: React.FC<{ reasons: string[] }> = ({ reasons }) => (
  <>
    <Text style={styles.sectionTitle}>📊 KEY FACTORS:</Text>
    {reasons.map((reason, index) => (
      <View key={index} style={styles.reasonItem}>
        <Text style={styles.reasonBullet}>•</Text>
        <Text style={styles.reasonText}>{reason}</Text>
      </View>
    ))}
  </>
);

const TargetsSection: React.FC<{ targets: any }> = ({ targets }) => (
  <>
    <Text style={styles.sectionTitle}>🎯 TARGETS & RISKS:</Text>
    <View style={styles.targetsContainer}>
      <View style={styles.targetItem}>
        <Text style={styles.targetLabel}>Target 📈</Text>
        <Text style={[styles.targetValue, { color: '#16A085' }]}>
          {targets.bullish?.target?.toFixed(2) || 'N/A'}₴
        </Text>
      </View>
      <View style={styles.targetItem}>
        <Text style={styles.targetLabel}>Stop 🛑</Text>
        <Text style={[styles.targetValue, { color: '#E74C3C' }]}>
          {targets.bullish?.stop?.toFixed(2) || 'N/A'}₴
        </Text>
      </View>
    </View>
  </>
);

const TechnicalLevelsSection: React.FC<{ levels: any }> = ({ levels }) => (
  <>
    <Text style={styles.sectionTitle}>📈 TECHNICAL LEVELS:</Text>
    <View style={styles.levelsContainer}>
      <View style={styles.levelItem}>
        <Text style={styles.levelLabel}>Support</Text>
        <Text style={[styles.levelValue, { color: '#16A085' }]}>{levels.support}₴</Text>
      </View>
      <View style={styles.levelItem}>
        <Text style={styles.levelLabel}>Resistance</Text>
        <Text style={[styles.levelValue, { color: '#E74C3C' }]}>{levels.resistance}₴</Text>
      </View>
    </View>
  </>
);

const SpreadAnalysisSection: React.FC<{ analysis: any }> = ({ analysis }) => (
  <>
    <Text style={styles.sectionTitle}>💱 SPREAD ANALYSIS:</Text>
    <View style={styles.spreadContainer}>
      <Text style={styles.spreadText}>Spread: {analysis.percent.toFixed(2)}%</Text>
      <View
        style={[
          styles.spreadBadge,
          {
            backgroundColor: getSpreadStatusColor(analysis.status),
          },
        ]}
      >
        <Text style={styles.spreadBadgeText}>{analysis.status}</Text>
      </View>
    </View>
  </>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    marginTop: 16,
  },
  reasonItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reasonBullet: {
    color: '#2C3E50',
    marginRight: 8,
    fontSize: 16,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
  },
  targetsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  targetItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  targetLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  targetValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  levelLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  levelValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  spreadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  spreadText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  spreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  spreadBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
