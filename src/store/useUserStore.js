import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../../App';

const useUserStore = create(
  persist(
    (set) => ({
      userData: null,
      setUserData: (userData) => set({ userData }),
      clearUserData: () => set({ userData: null }),
    }),
    {
      name: 'user-storage',
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
      skipHydration: true,
    }
  )
);

export default useUserStore;
