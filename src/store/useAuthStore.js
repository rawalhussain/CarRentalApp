import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../../App';
import { onAuthStateChanged, getCurrentUser } from '../Config/firebase';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      credentials: null,
      setUser: (user) => {
        set({ user });
      },
      setCredentials: (credentials) => {
        set({ credentials });
      },
      initializeAuth: () => {
        // Set up auth state listener
        return onAuthStateChanged((user) => {
          if (user) {
            set({ user });
          } else {
            set({ user: null });
          }
        });
      },
      clearAuth: async () => {
        try {
          set({ user: null });
        } catch (error) {
          console.error('Error signing out:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = storage.getString(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          storage.set(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          storage.delete(name);
        },
      })),
      partialize: (state) => ({
        user: state.user,
        credentials: state.credentials,
      }),
    }
  )
);

export default useAuthStore;
