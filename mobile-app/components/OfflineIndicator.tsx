// components/OfflineIndicator.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface OfflineIndicatorProps {
    timestamp: string;
    isDark: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ timestamp, isDark }) => {
    const date = new Date(timestamp);
    const timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: ru });

    return (
        <View style={[
            styles.container,
            { backgroundColor: isDark ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.1)' }
        ]}>
            <MaterialCommunityIcons
                name="cloud-off-outline"
                size={16}
                color={isDark ? '#ff9800' : '#ff6d00'}
            />
            <Text style={[
                styles.text,
                { color: isDark ? '#ff9800' : '#ff6d00' }
            ]}>
                Офлайн-данные (обновлено {timeAgo})
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 4,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    text: {
        fontSize: 12,
        marginLeft: 6,
    }
});

export default OfflineIndicator;
