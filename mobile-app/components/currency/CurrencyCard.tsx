import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CurrencyCardProps {
    currencyCode: string;     // Код валюты (например, USD, EUR)
    currencyName: string;     // Полное название валюты
    rate: number;             // Текущий курс
    previousRate?: number;    // Предыдущий курс для отображения изменений
    onPress?: () => void;     // Обработчик нажатия на карточку
    isFavorite?: boolean;     // Флаг для отображения избранной валюты
    onToggleFavorite?: () => void; // Обработчик добавления/удаления из избранного
}

const CurrencyCard: React.FC<CurrencyCardProps> = ({
                                                       currencyCode,
                                                       currencyName,
                                                       rate,
                                                       previousRate,
                                                       onPress,
                                                       isFavorite = false,
                                                       onToggleFavorite
                                                   }) => {
    // Расчет изменения курса
    const calculateChange = () => {
        if (!previousRate) return { direction: 'neutral', percentage: 0 };

        const change = rate - previousRate;
        const percentage = (change / previousRate) * 100;

        return {
            direction: change === 0 ? 'neutral' : change > 0 ? 'up' : 'down',
            percentage: Math.abs(percentage)
        };
    };

    const { direction, percentage } = calculateChange();

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                <View style={styles.currencyInfo}>
                    <Text style={styles.currencyCode}>{currencyCode}</Text>
                    <Text style={styles.currencyName}>{currencyName}</Text>
                </View>

                <View style={styles.rateInfo}>
                    <Text style={styles.rate}>{rate.toFixed(4)}</Text>

                    <View style={styles.changeContainer}>
                        {direction !== 'neutral' && (
                            <MaterialCommunityIcons
                                name={direction === 'up' ? 'arrow-up' : 'arrow-down'}
                                size={16}
                                color={direction === 'up' ? '#4CAF50' : '#F44336'}
                                style={styles.changeIcon}
                            />
                        )}

                        <Text
                            style={[
                                styles.changePercentage,
                                direction === 'up' ? styles.positiveChange :
                                    direction === 'down' ? styles.negativeChange :
                                        styles.neutralChange
                            ]}
                        >
                            {percentage.toFixed(2)}%
                        </Text>
                    </View>
                </View>

                {onToggleFavorite && (
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={onToggleFavorite}
                    >
                        <MaterialCommunityIcons
                            name={isFavorite ? 'star' : 'star-outline'}
                            size={24}
                            color={isFavorite ? '#FFC107' : '#757575'}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginVertical: 8,
        marginHorizontal: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardContent: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    currencyInfo: {
        flex: 1,
    },
    currencyCode: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    currencyName: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 4,
    },
    rateInfo: {
        alignItems: 'flex-end',
        flex: 1,
    },
    rate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    changeIcon: {
        marginRight: 4,
    },
    changePercentage: {
        fontSize: 14,
    },
    positiveChange: {
        color: '#4CAF50',
    },
    negativeChange: {
        color: '#F44336',
    },
    neutralChange: {
        color: '#7f8c8d',
    },
    favoriteButton: {
        marginLeft: 16,
    },
});

export default CurrencyCard;
