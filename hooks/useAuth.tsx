import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserFrontend } from '@/types';
import { checkAuthStatus, logout } from '@/services/authService';
import { saveToken } from '@/services/api';
import { router } from 'expo-router';

type AuthContextType = {
  user: UserFrontend | null;
  isLoading: boolean;
  signIn: (token: string, user: UserFrontend) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserFrontend | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await checkAuthStatus();
        
        if (userData) {
          setUser(userData);
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/(auth)');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (token: string, userData: UserFrontend) => {
    await saveToken(token);
    setUser(userData);
    router.replace('/(tabs)');
  };

  const signOut = async () => {
    await logout();
    setUser(null);
    router.replace('/(auth)');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);