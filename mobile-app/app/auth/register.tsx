import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, firestore } from '../../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
            return;
        }

        setLoading(true);
        try {
            // Create user with email/password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile
            await updateProfile(user, { displayName: name });

            // Create user document in Firestore
            await setDoc(doc(firestore, 'users', user.uid), {
                name,
                email,
                createdAt: new Date(),
                alerts: []
            });

            // Navigate to main screen
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Ошибка регистрации', 'Не удалось создать аккаунт. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    // Return JSX - keep the same
    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
            <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>Регистрация</Text>

            <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }]}
                placeholder="Имя"
                placeholderTextColor={isDark ? '#a9a9a9' : '#666666'}
                value={name}
                onChangeText={setName}
            />

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
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>Зарегистрироваться</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={[styles.linkText, { color: isDark ? '#4cd964' : '#28a745' }]}>
                    Уже есть аккаунт? Войти
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
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
