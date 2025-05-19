// app/(tabs)/alerts.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '../../hooks/useColorScheme';
import { auth, firestore } from '../../firebase'; // Прямой импорт
import { collection, query, where, onSnapshot, doc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { DEFAULT_CURRENCIES } from '../../constants/config';
import { api, Currency } from '../../services/api';

export default function AlertsScreen() {
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

    // Состояние для нового оповещения
    const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCIES.SELECTED[0]);
    const [threshold, setThreshold] = useState('');
    const [direction, setDirection] = useState('above'); // 'above' или 'below'

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Загрузка доступных валют
    const fetchCurrencies = async () => {
        try {
            const data = await api.getAvailableCurrencies();
            setCurrencies(data.filter(c => c.code !== DEFAULT_CURRENCIES.BASE));
        } catch (error) {
            console.error('Error fetching currencies:', error);
        }
    };

    // Инициализация и загрузка оповещений
    useEffect(() => {
        fetchCurrencies();

        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        const alertsRef = collection(firestore, 'alerts');
        const userAlertsQuery = query(alertsRef, where('userId', '==', user.uid));

        const unsubscribe = onSnapshot(userAlertsQuery, (snapshot) => {
            const alertsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAlerts(alertsList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching alerts:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Добавление нового оповещения
    const handleAddAlert = async () => {
        if (!selectedCurrency || !threshold) {
            Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
            return;
        }

        const thresholdValue = parseFloat(threshold);
        if (isNaN(thresholdValue)) {
            Alert.alert('Ошибка', 'Пороговое значение должно быть числом');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            await addDoc(collection(firestore, 'alerts'), {
                userId: user.uid,
                currency: selectedCurrency,
                baseCurrency: DEFAULT_CURRENCIES.BASE,
                threshold: thresholdValue,
                direction: direction,
                active: true,
                createdAt: new Date()
            });

            setModalVisible(false);
            setSelectedCurrency(DEFAULT_CURRENCIES.SELECTED[0]);
            setThreshold('');
            setDirection('above');
        } catch (error) {
            console.error('Error adding alert:', error);
            Alert.alert('Ошибка', 'Не удалось создать оповещение');
        }
    };

    // Удаление оповещения
    const handleDeleteAlert = async (alertId) => {
        try {
            await deleteDoc(doc(firestore, 'alerts', alertId));
        } catch (error) {
            console.error('Error deleting alert:', error);
            Alert.alert('Ошибка', 'Не удалось удалить оповещение');
        }
    };

    // Переключение активности оповещения
    const toggleAlertActive = async (alert) => {
        try {
            const alertRef = doc(firestore, 'alerts', alert.id);
            await updateDoc(alertRef, {
                active: !alert.active
            });
        } catch (error) {
            console.error('Error toggling alert:', error);
            Alert.alert('Ошибка', 'Не удалось изменить статус оповещения');
        }
    };

    // Рендер элемента оповещения
    const renderAlertItem = ({ item }) => (
        <View style={[styles.alertItem, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
            <View style={styles.alertInfo}>
                <Text style={[styles.currencyText, { color: isDark ? '#ffffff' : '#000000' }]}>
                    {item.currency}/{item.baseCurrency}
                </Text>
                <Text style={[styles.thresholdText, {
                    color: item.direction === 'above' ?
                        (isDark ? '#4cd964' : '#28a745') :
                        (isDark ? '#ff3b30' : '#dc3545')
                }]}>
                    {item.direction === 'above' ? '↑' : '↓'} {item.threshold.toFixed(2)}
                </Text>
                <Text style={[styles.directionText, { color: isDark ? '#a9a9a9' : '#666666' }]}>
                    {item.direction === 'above' ? 'Выше' : 'Ниже'}
                </Text>
            </View>

            <View style={styles.alertActions}>
                <TouchableOpacity
                    style={[styles.toggleButton, { backgroundColor: item.active ? (isDark ? '#4cd964' : '#28a745') : '#999' }]}
                    onPress={() => toggleAlertActive(item)}
                >
                    <Text style={styles.toggleButtonText}>
                        {item.active ? 'Активно' : 'Неактивно'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAlert(item.id)}
                >
                    <MaterialCommunityIcons name="delete-outline" size={24} color={isDark ? '#ff3b30' : '#dc3545'} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
            <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
                Оповещения по курсам валют
            </Text>

            {loading ? (
                <ActivityIndicator
                    size="large"
                    color={isDark ? '#ffffff' : '#000000'}
                    style={styles.loader}
                />
            ) : alerts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: isDark ? '#ffffff' : '#000000' }]}>
                        У вас пока нет оповещений
                    </Text>
                    <Text style={[styles.emptySubText, { color: isDark ? '#a9a9a9' : '#666666' }]}>
                        Добавьте оповещение, чтобы получать уведомления при достижении определенного курса
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={alerts}
                    renderItem={renderAlertItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: isDark ? '#3498db' : '#2980b9' }]}
                onPress={() => setModalVisible(true)}
            >
                <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
            </TouchableOpacity>

            {/* Модальное окно добавления оповещения */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
                        <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                            Новое оповещение
                        </Text>

                        <Text style={[styles.inputLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                            Валюта:
                        </Text>
                        <TouchableOpacity
                            style={[styles.currencySelector, { backgroundColor: isDark ? '#444444' : '#f1f1f1' }]}
                            onPress={() => setCurrencyModalVisible(true)}
                        >
                            <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>
                                {selectedCurrency}
                            </Text>
                        </TouchableOpacity>

                        <Text style={[styles.inputLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                            Пороговое значение:
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? '#444444' : '#f1f1f1', color: isDark ? '#ffffff' : '#000000' }]}
                            placeholder="Например: 40.50"
                            placeholderTextColor={isDark ? '#a9a9a9' : '#666666'}
                            value={threshold}
                            onChangeText={setThreshold}
                            keyboardType="numeric"
                        />

                        <Text style={[styles.inputLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                            Направление:
                        </Text>
                        <View style={styles.directionContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.directionButton,
                                    direction === 'above' && styles.directionButtonActive,
                                    { backgroundColor: isDark ? '#444444' : '#f1f1f1' }
                                ]}
                                onPress={() => setDirection('above')}
                            >
                                <Text style={[
                                    { color: isDark ? '#ffffff' : '#000000' },
                                    direction === 'above' && { color: '#ffffff' }
                                ]}>
                                    Выше
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.directionButton,
                                    direction === 'below' && styles.directionButtonActive,
                                    { backgroundColor: isDark ? '#444444' : '#f1f1f1' }
                                ]}
                                onPress={() => setDirection('below')}
                            >
                                <Text style={[
                                    { color: isDark ? '#ffffff' : '#000000' },
                                    direction === 'below' && { color: '#ffffff' }
                                ]}>
                                    Ниже
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { backgroundColor: isDark ? '#444444' : '#f1f1f1' }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>
                                    Отмена
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton, { backgroundColor: '#3498db' }]}
                                onPress={handleAddAlert}
                            >
                                <Text style={{ color: '#ffffff' }}>
                                    Сохранить
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Модальное окно выбора валюты */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={currencyModalVisible}
                onRequestClose={() => setCurrencyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
                        <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                            Выберите валюту
                        </Text>

                        <FlatList
                            data={currencies}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.currencyItem,
                                        selectedCurrency === item.code && { backgroundColor: isDark ? '#444444' : '#e6f7ff' }
                                    ]}
                                    onPress={() => {
                                        setSelectedCurrency(item.code);
                                        setCurrencyModalVisible(false);
                                    }}
                                >
                                    <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>
                                        {item.code} - {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={item => item.code}
                            style={styles.currencyList}
                        />

                        <TouchableOpacity
                            style={[styles.modalCloseButton, { backgroundColor: isDark ? '#444444' : '#eeeeee' }]}
                            onPress={() => setCurrencyModalVisible(false)}
                        >
                            <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>
                                Закрыть
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    loader: {
        marginTop: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: 80,
    },
    alertItem: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    alertInfo: {
        marginBottom: 12,
    },
    currencyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    thresholdText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    directionText: {
        fontSize: 14,
    },
    alertActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    toggleButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    deleteButton: {
        padding: 6,
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        height: 50,
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
    },
    currencySelector: {
        height: 50,
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
        justifyContent: 'center',
    },
    directionContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    directionButton: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        borderRadius: 8,
    },
    directionButtonActive: {
        backgroundColor: '#3498db',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        marginRight: 8,
    },
    saveButton: {
        marginLeft: 8,
    },
    currencyList: {
        maxHeight: 300,
        marginBottom: 16,
    },
    currencyItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalCloseButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
});
