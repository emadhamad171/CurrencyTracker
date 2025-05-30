import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { UpcomingEvent } from '../app/types/ForecastTypes';
import { getImpactColor } from '../utils/forecastUtils';

interface Props {
  events: UpcomingEvent[];
}

export const UpcomingEventsCard: React.FC<Props> = ({ events }) => (
  <View style={styles.container}>
    <Text style={styles.title}>📅 IMPORTANT EVENTS THIS WEEK</Text>

    {events.slice(0, 5).map((event, index) => (
      <EventItem key={index} event={event} isLast={index === Math.min(events.length - 1, 4)} />
    ))}
  </View>
);

const EventItem: React.FC<{
  event: UpcomingEvent;
  isLast: boolean;
}> = ({ event, isLast }) => (
  <View style={[styles.eventItem, isLast && styles.eventItemLast]}>
    <View style={styles.eventDate}>
      <Text style={styles.eventDayMonth}>
        {new Date(event.date).toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
        })}
      </Text>
      <Text style={styles.eventWeekday}>
        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}
      </Text>
    </View>

    <View style={styles.eventContent}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventName}>{event.event}</Text>
        <View
          style={[
            styles.impactBadge,
            {
              backgroundColor: getImpactColor(event.impact),
            },
          ]}
        >
          <Text style={styles.impactText}>{event.impact.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.eventDescription} numberOfLines={2}>
        {event.description}
      </Text>
    </View>
  </View>
);

const eventStyles = StyleSheet.create({
  container: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  eventItemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  eventDate: {
    width: 60,
    alignItems: 'center',
    marginRight: 16,
  },
  eventDayMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  eventWeekday: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
    marginRight: 12,
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  impactText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 18,
  },
});
const styles = { ...eventStyles };
