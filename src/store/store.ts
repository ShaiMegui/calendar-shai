import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  expiresAt: number | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setExpiresAt: (expiresAt: number | null) => void;
  clearUser: () => void;
  clearAccessToken: () => void;
  clearExpiresAt: () => void;
}

export const useStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      expiresAt: null,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setExpiresAt: (expiresAt) => set({ expiresAt }),
      clearUser: () => set({ user: null }),
      clearAccessToken: () => set({ accessToken: null }),
      clearExpiresAt: () => set({ expiresAt: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);