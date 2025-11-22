import { create } from 'zustand';
import { User } from '@/types/auth';

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean; // <-- NEW

  setAuth: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false, // <-- NEW default

  setAuth: (access, refresh) => {
    set({
      accessToken: access,
      refreshToken: refresh,
      isAuthenticated: true,
    });
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    set({ user });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isHydrated: true, // <-- avoid infinite loading on logout
    });
  },

  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const access = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');
      const userData = localStorage.getItem('user_data');

      let parsedUser: User | null = null;

      try {
        parsedUser = userData && userData !== 'undefined' ? JSON.parse(userData) : null;
      } catch {
        parsedUser = null;
        localStorage.removeItem('user_data');
      }

      set({
        accessToken: access,
        refreshToken: refresh,
        user: parsedUser,
        isAuthenticated: !!access && !!refresh,
        isHydrated: true, // <-- IMPORTANT
      });
    }
  },
}));
