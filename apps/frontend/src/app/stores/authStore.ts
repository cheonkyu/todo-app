// stores/authStore.ts
import { create } from 'zustand';
import { User } from '@todo-app/libs';
import { getAccessToken, getRefreshToken, getUser as getUserFromStorage, setTokens, setUser as saveUser, clearAuth } from '../utils/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  restore: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (user, accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken);
    saveUser(user);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    clearAuth();
    set({ user: null, isAuthenticated: false });
  },

  restore: () => {
    const user = getUserFromStorage();
    const token = getAccessToken();
    set({
      user: user,
      isAuthenticated: !!user && !!token,
    });
  },
}));
