
import { create } from 'zustand';
import { login as loginApi, logout as logoutApi, getMe, changePassword as changePasswordApi } from '../services/api';

type User = {
  id: string;
  name: string;
  role: 'admin' | 'employee';
  isInitialPassword: boolean;
  token: string;
};

type AuthState = {
  user: User | null;
  isLoggedIn: boolean;
  hasHydrated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  changePassword: (data: { oldPassword: string; newPassword: string }) => Promise<void>;
  setHasHydrated: (state: boolean) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  hasHydrated: false,
  loading: false,
  error: null,

  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const response = await loginApi({ email, password });
      const { user, token } = response.data.data;
      set({
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          isInitialPassword: user.isInitialPassword ?? false,
          token,
        },
        isLoggedIn: true,
        loading: false
      });
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentUser', JSON.stringify({ user, token }));
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await logoutApi();
    } catch (error) {
      // Ignore API error, always clear local state
    }
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentUser');
    }
    set({ user: null, isLoggedIn: false, loading: false });
  },

  checkSession: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getMe();
      const user = response.data.data;
      // Get token from sessionStorage
      let token = '';
      if (typeof window !== 'undefined') {
        const sessionRaw = sessionStorage.getItem('currentUser');
        if (sessionRaw) {
          const sessionData = JSON.parse(sessionRaw);
          token = sessionData.token;
        }
      }
      set({
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          isInitialPassword: user.isInitialPassword ?? false,
          token,
        },
        isLoggedIn: true,
        loading: false,
        hasHydrated: true
      });
    } catch (error: any) {
      set({ user: null, isLoggedIn: false, loading: false, hasHydrated: true });
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('currentUser');
      }
    }
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    set({ loading: true, error: null });
    try {
      await changePasswordApi({ currentPassword: oldPassword, newPassword });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  setHasHydrated: (state: boolean) => {
    set({ hasHydrated: state });
  },
}));