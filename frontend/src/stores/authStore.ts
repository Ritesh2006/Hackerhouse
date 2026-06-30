import { create } from 'zustand';
import { authApi } from '../lib/api';

interface AuthState {
  token: string | null;
  userId: string | null;
  user: any | null;
  loading: boolean;
  initialized: boolean;
  setToken: (token: string | null) => void;
  setUserId: (id: string | null) => void;
  setUser: (user: any) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  userId: (() => {
    const id = localStorage.getItem('user_id');
    return (id === 'undefined' || id === 'null') ? null : id;
  })(),
  user: null,
  loading: false,
  initialized: false,

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  setUserId: (id) => {
    if (id) {
      localStorage.setItem('user_id', id);
    } else {
      localStorage.removeItem('user_id');
    }
    set({ userId: id });
  },

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await authApi.login({ email, password });
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      
      const userRes = await authApi.getMe();
      const user = userRes.data;
      const userId = user.id || user._id;
      
      if (userId) {
        localStorage.setItem('user_id', userId);
        localStorage.setItem('chat_user_id', userId);
      }
      
      set({ token, userId, user, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('chat_user_id');
    localStorage.removeItem('hackerhouse_trial_active');
    set({ token: null, userId: null, user: null });
    window.dispatchEvent(new Event('hackerhouse_trial_changed'));
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ initialized: true });
      return;
    }
    try {
      const res = await authApi.getMe();
      const user = res.data;
      const userId = user.id || user._id;
      if (userId) {
        localStorage.setItem('user_id', userId);
      }
      set({ user, userId, initialized: true });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('chat_user_id');
      set({ token: null, userId: null, user: null, initialized: true });
    }
  },
}));
