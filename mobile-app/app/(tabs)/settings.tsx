// app/(tabs)/settings.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useColorScheme } from '../../hooks/useColorScheme';
import { auth, signOut } from '../../firebase';

export default function SettingsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleLogout = async () => {
        Alert.alert(
            "Выход из аккаунта",
            "Вы уверены, что хотите выйти?",
            [
                {
                    text: "Отмена",
                    style: "cancel"
                },
                {
                    text: "Выйти",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            console.log('Logging out user...');

                            // Sign out using modular API
                            await signOut(auth);

                            console.log('Logout successful');

                            // Navigate to login screen
                            router.replace('/auth/login');
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
            <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
                Настройки
            </Text>

            <View style={[styles.section, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                    Аккаунт
                </Text>

                {/* Отображаем информацию о текущем пользователе */}
                <View style={styles.profileContainer}>
                    <View style={[styles.profileAvatar, { backgroundColor: isDark ? '#444444' : '#e0e0e0' }]}>
                        <Text style={[styles.profileInitial, { color: isDark ? '#ffffff' : '#000000' }]}>
                            {user?.displayName ? user.displayName[0].toUpperCase() :
                                user?.email ? user.email[0].toUpperCase() : 'U'}
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

                <TouchableOpacity style={styles.settingItem}>
                    <MaterialCommunityIcons name="account-edit-outline" size={24} color={isDark ? '#888888' : '#666666'} />
                    <Text style={[styles.settingText, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Редактировать профиль
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? '#888888' : '#666666'} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={handleLogout}
                >
                    <MaterialCommunityIcons name="logout" size={24} color="#dc3545" />
                    <Text style={[styles.settingText, { color: '#dc3545' }]}>
                        Выйти из аккаунта
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.section, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                    Настройки приложения
                </Text>

                <TouchableOpacity style={styles.settingItem}>
                    <MaterialCommunityIcons name="theme-light-dark" size={24} color={isDark ? '#888888' : '#666666'} />
                    <Text style={[styles.settingText, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Тема
                    </Text>
                    <Text style={[styles.settingValue, { color: isDark ? '#888888' : '#666666' }]}>
                        {colorScheme === 'dark' ? 'Темная' : colorScheme === 'light' ? 'Светлая' : 'Системная'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <MaterialCommunityIcons name="currency-usd" size={24} color={isDark ? '#888888' : '#666666'} />
                    <Text style={[styles.settingText, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Базовая валюта
                    </Text>
                    <Text style={[styles.settingValue, { color: isDark ? '#888888' : '#666666' }]}>
                        UAH
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.section, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                    Уведомления
                </Text>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => router.push('/(tabs)/alerts')}
                >
                    <MaterialCommunityIcons name="bell-outline" size={24} color={isDark ? '#888888' : '#666666'} />
                    <Text style={[styles.settingText, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Оповещения о курсах
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? '#888888' : '#666666'} />
                </TouchableOpacity>
            </View>

            <View style={[styles.section, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                    О приложении
                </Text>

                <TouchableOpacity style={styles.settingItem}>
                    <MaterialCommunityIcons name="information-outline" size={24} color={isDark ? '#888888' : '#666666'} />
                    <Text style={[styles.settingText, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Версия
                    </Text>
                    <Text style={[styles.settingValue, { color: isDark ? '#888888' : '#666666' }]}>
                        1.0.0
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <MaterialCommunityIcons name="headset" size={24} color={isDark ? '#888888' : '#666666'} />
                    <Text style={[styles.settingText, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Техническая поддержка
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? '#888888' : '#666666'} />
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: isDark ? '#888888' : '#666666' }]}>
                    © 2024 Currency Tracker
                </Text>
            </View>
        </ScrollView>
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
        marginBottom: 16,
        textAlign: 'center',
    },
    section: {
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    // Профиль пользователя
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
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    settingText: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
    },
    settingValue: {
        fontSize: 14,
        marginRight: 8,
    },
    footer: {
        marginTop: 16,
        marginBottom: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
    }
});
