import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userAPI, coinsAPI } from '../services/api';

interface UserState {
  id: string;
  username: string;
  coinBalance: number;
  level: string;
  levelPoints: number;
  tapsRemaining: number;
  tapRefreshTime: string | null;
  friends: Array<{
    id: string;
    username: string;
    level: string;
    joinedDate: string;
    balance: number;
  }>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: Partial<UserState>) => void;
  updateCoinBalance: (amount: number) => Promise<void>;
  updateLevel: (points: number) => Promise<void>;
  resetTaps: () => void;
  initTelegramWebApp: () => void;
  fetchUserData: () => Promise<void>;
  tapCoin: () => Promise<void>;
}

export const useStore = create<UserState>()(
  persist(
    (set, get) => ({
      id: '',
      username: '',
      coinBalance: 0,
      level: 'Alpha Pup',
      levelPoints: 0,
      tapsRemaining: 100,
      tapRefreshTime: null,
      friends: [],
      isLoading: false,
      error: null,

      setUser: (user) => set((state) => ({ ...state, ...user })),

      updateCoinBalance: async (amount) => {
        try {
          set({ isLoading: true, error: null });
          // Update locally first for immediate feedback
          set((state) => ({ coinBalance: state.coinBalance + amount }));
          
          // Sync with backend (if there's an endpoint for adding coins)
          // await coinsAPI.addCoins(amount);
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          // Revert local change on error
          set((state) => ({ coinBalance: state.coinBalance - amount }));
        }
      },

      updateLevel: async (points) => {
        try {
          set({ isLoading: true, error: null });
          // Update locally first
          set((state) => ({ levelPoints: state.levelPoints + points }));
          
          // Sync with backend progress API
          // await progressAPI.addExperience(points);
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          // Revert local change on error
          set((state) => ({ levelPoints: state.levelPoints - points }));
        }
      },

      resetTaps: () => {
        const refreshTime = new Date();
        refreshTime.setHours(refreshTime.getHours() + 1); // 1 hour refresh
        set({ 
          tapsRemaining: 100, 
          tapRefreshTime: refreshTime.toISOString() 
        });
      },

      initTelegramWebApp: () => {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.ready();
          if (window.Telegram.WebApp.expand) {
            window.Telegram.WebApp.expand();
          }
        }
      },

      fetchUserData: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await userAPI.getProfile();
          const userData = response.data;
          
          set({
            id: userData.id,
            username: userData.username || '',
            coinBalance: userData.balance || 0,
            level: userData.level || 'Alpha Pup',
            levelPoints: userData.level_points || 0,
            friends: userData.friends || [],
            isLoading: false
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      tapCoin: async () => {
        const state = get();
        if (state.tapsRemaining <= 0) return;

        try {
          // Update locally first for immediate feedback
          set((state) => ({ 
            tapsRemaining: state.tapsRemaining - 1,
            coinBalance: state.coinBalance + 5,
            levelPoints: state.levelPoints + 5
          }));

          // Sync with backend
          await get().updateCoinBalance(5);
          await get().updateLevel(5);

          // Check if taps are exhausted and set refresh time
          if (state.tapsRemaining - 1 <= 0) {
            get().resetTaps();
          }
        } catch (error: any) {
          // Revert changes on error
          set((state) => ({ 
            tapsRemaining: state.tapsRemaining + 1,
            coinBalance: state.coinBalance - 5,
            levelPoints: state.levelPoints - 5
          }));
          set({ error: error.message });
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        tapsRemaining: state.tapsRemaining,
        tapRefreshTime: state.tapRefreshTime,
      }),
    }
  )
); 