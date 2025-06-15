import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../../App';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      loading: false,
      credentials: null,
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setCredentials: (credentials) => set({ credentials }),
      clearAuth: () => set({ user: null, loading: false, credentials: null }),
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
    }
  )
);

export default useAuthStore; 