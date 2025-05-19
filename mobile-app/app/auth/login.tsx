// auth/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, signInWithEmailAndPassword } from '../../firebase';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Ошибка', 'Пожалуйста, введите email и пароль');
            return;
        }

        setLoading(true);
        try {
            // Using the modular API with the auth instance
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful');

            // Navigate to the main screen
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Ошибка входа', 'Неверный email или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
            <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>Вход в аккаунт</Text>

            <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }]}
                placeholder="Email"
                placeholderTextColor={isDark ? '#a9a9a9' : '#666666'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }]}
                placeholder="Пароль"
                placeholderTextColor={isDark ? '#a9a9a9' : '#666666'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={[styles.button, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>Войти</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={[styles.linkText, { color: isDark ? '#4cd964' : '#28a745' }]}>
                    Нет аккаунта? Зарегистрироваться
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    // Styles remain the same
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        height: 50,
        marginBottom: 15,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    button: {
        backgroundColor: '#3498db',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkText: {
        marginTop: 20,
        textAlign: 'center',
    },
});
