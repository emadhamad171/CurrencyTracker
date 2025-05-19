// firebase.ts
import { initializeApp } from 'firebase/app';
import {
    initializeAuth,
    getReactNativePersistence,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBGEOa9BM8ROgf42LsUT_5K2h0iWcARVao",
    authDomain: "exchangecurrencyapp-4af24.firebaseapp.com",
    projectId: "exchangecurrencyapp-4af24",
    storageBucket: "exchangecurrencyapp-4af24.appspot.com",
    messagingSenderId: "122087503032",
    appId: "1:122087503032:ios:be16d03472f49f8cecb04d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const firestore = getFirestore(app);

// Export both the auth instance and the auth functions so they're used consistently
export {
    app,
    auth,
    firestore,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
};
