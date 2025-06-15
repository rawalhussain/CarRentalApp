import React, { createContext, useContext, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { getUserData } from './firebase';
import useAuthStore from '../store/useAuthStore';
import useUserStore from '../store/useUserStore';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { setUser, setLoading, clearAuth } = useAuthStore();
  const { setUserData, clearUserData } = useUserStore();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      setUser(user);

      if (user) {
        try {
          // Get additional user data from database
          const data = await getUserData(user.uid);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        clearAuth();
        clearUserData();
      }

      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ useAuthStore, useUserStore }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
