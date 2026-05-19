import { create } from 'zustand';
import { getStoredToken, getStoredUser } from '../services/apiClient.js';

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  initialized: false,
  setAuth: ({ user, token }) => set({ user, token: token ?? getStoredToken(), initialized: true }),
  setUser: (user) => set({ user, initialized: true }),
  setInitialized: (initialized) => set({ initialized }),
  clearAuth: () => set({ user: null, token: null, initialized: true }),
}));
