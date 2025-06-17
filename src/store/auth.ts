import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Import using relative paths
import { axiosInstance, authAPI, UserProfile } from '../services/api'; 
// Import using direct relative path for the new test export
import { directRelativeTest } from '../services/testService';

// Log the imported test value to ensure it's accessible
console.log('Direct Relative Test Import Value:', directRelativeTest);

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (initData: string) => Promise<void>;
  logout: () => Promise<void>;
  me: () => Promise<void>;
  refreshToken: (refreshToken: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('token'), // Load initial token from storage
      isLoading: false,
      error: null,
      isAuthenticated: !!localStorage.getItem('token'), // Initial auth state based on token

      login: async (initData: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authAPI.login(initData);
          const { user, token } = response.data;
          
          localStorage.setItem('token', token);
          // Use the directly imported 'axiosInstance' to set default header
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
          set({ user, token, isAuthenticated: true, isLoading: false });
          
        } catch (error: any) {
          localStorage.removeItem('token'); // Clear token on login failure
          // Use the directly imported 'axiosInstance' to delete default header
          delete axiosInstance.defaults.headers.common['Authorization'];
          set({ error: error.message || 'Failed to login', isLoading: false, isAuthenticated: false, user: null, token: null });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          // await authAPI.logout(); // Uncomment if backend endpoint exists
          
          localStorage.removeItem('token');
          // Use the directly imported 'axiosInstance' to delete default header
          delete axiosInstance.defaults.headers.common['Authorization'];
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        } catch (error: any) {
          // Even if logout API fails, clear local state
          localStorage.removeItem('token');
          // Use the directly imported 'axiosInstance' to delete default header
          delete axiosInstance.defaults.headers.common['Authorization'];
          set({ error: error.message || 'Failed to logout', isLoading: false, user: null, token: null, isAuthenticated: false });
        }
      },

      me: async () => {
        if (!get().isAuthenticated || !get().token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        try {
          set({ isLoading: true, error: null });
          const response = await authAPI.me();
          set({ user: response.data.user, isLoading: false, isAuthenticated: true });
        } catch (error: any) {
          localStorage.removeItem('token');
          // Use the directly imported 'axiosInstance' to delete default header
          delete axiosInstance.defaults.headers.common['Authorization'];
          set({ error: error.message || 'Failed to fetch user data', isLoading: false, user: null, token: null, isAuthenticated: false });
        }
      },

      refreshToken: async (refreshTokenValue: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authAPI.refreshToken(refreshTokenValue);
          const { token } = response.data;
          
          localStorage.setItem('token', token);
          // Use the directly imported 'axiosInstance' to set default header
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ token, isLoading: false, isAuthenticated: true });
          
        } catch (error: any) {
          localStorage.removeItem('token');
          // Use the directly imported 'axiosInstance' to delete default header
          delete axiosInstance.defaults.headers.common['Authorization'];
          set({ error: error.message || 'Failed to refresh token', isLoading: false, user: null, token: null, isAuthenticated: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token;
          if (state.token) {
             // Use the directly imported 'axiosInstance' to set default header
             axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
          } else {
             // Use the directly imported 'axiosInstance' to delete default header
             delete axiosInstance.defaults.headers.common['Authorization'];
          }
        }
      }
    }
  )
);
