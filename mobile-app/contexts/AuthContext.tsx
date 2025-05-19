// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged } from '../firebase';

interface AuthContextType {
    user: any | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('Setting up auth state listener...');

        // Setup Firebase auth state listener using modular API
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');

            if (firebaseUser) {
                const userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                };
                setUser(userData);
            } else {
                setUser(null);
            }

            setIsLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const value = {
        user,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
