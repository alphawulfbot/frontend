import { create } from 'zustand';
import { coinsAPI, userAPI } from '../services/api'; // Assuming userAPI is exported correctly now
import type { UserProfile } from '../services/api'; // Import UserProfile type

// Define Transaction type based on expected data
interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
  // Add other relevant fields
}

// Define CoinsState based on available API and desired state
interface CoinsState {
  // Store relevant parts of UserProfile, not the whole object if not needed
  balance: number | null;
  level: string | null; // Assuming level is string like 'Alpha Pup'
  tapsRemaining: number | null;
  // Add other relevant fields from UserProfile if needed
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchBalanceAndProfile: () => Promise<void>; // Renamed from getBalance for clarity
  // tap: () => Promise<void>; // Removed as API doesn't exist
  // completeTask: (taskId: string) => Promise<void>; // Removed as API doesn't exist
  getTransactions: (page?: number, limit?: number) => Promise<void>;
}

export const useCoinsStore = create<CoinsState>((set) => ({
  balance: null,
  level: null,
  tapsRemaining: null,
  transactions: [],
  isLoading: false,
  error: null,

  fetchBalanceAndProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      // Fetch the full user profile which includes balance etc.
      const response = await userAPI.getProfile(); 
      const userProfile = response.data; // Type is UserProfile
      set({
        balance: userProfile.balance,
        level: userProfile.level,
        tapsRemaining: userProfile.taps_remaining ?? null, // Use nullish coalescing for optional fields
        // Set other relevant state parts from userProfile
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch balance and profile',
        isLoading: false
      });
      console.error("fetchBalanceAndProfile error:", error);
    }
  },

  // tap: async () => { ... }, // Removed
  // completeTask: async (taskId: string) => { ... }, // Removed

  getTransactions: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      // Call the API - response.data should match TransactionsResponse { transactions: any[] }
      const response = await coinsAPI.getTransactions(page, limit);
      // Assuming response.data is { transactions: Transaction[] }
      // Perform type checking if necessary
      const transactions = response.data.transactions as Transaction[]; 
      set({ transactions: transactions || [], isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to get transactions',
        isLoading: false
      });
      console.error("getTransactions error:", error);
    }
  },
}));

