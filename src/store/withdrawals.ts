import { create } from 'zustand';
import { withdrawalsAPI } from '../services/api';
// Import the exported HistoryResponse type
import type { HistoryResponse } from '../services/api'; 

// Define Withdrawal type based on expected data
interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  amountInr?: number; // Optional based on backend
  upiId?: string; // Optional based on backend
  method: string; // Added method
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Define state structure
interface WithdrawalsState {
  withdrawals: Withdrawal[];
  isLoading: boolean;
  error: string | null;
  // Add pagination state if API supports it
  // currentPage: number;
  // totalPages: number;
  // totalWithdrawals: number;
  getHistory: (page?: number, limit?: number) => Promise<void>;
  create: (amount: number, upiId: string, method?: string) => Promise<boolean>; // Added optional method
}

export const useWithdrawalsStore = create<WithdrawalsState>((set, get) => ({
  withdrawals: [],
  isLoading: false,
  error: null,
  // Initialize pagination state if used
  // currentPage: 1,
  // totalPages: 1,
  // totalWithdrawals: 0,

  getHistory: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      // Call API, expecting HistoryResponse { history: Withdrawal[] }
      const response = await withdrawalsAPI.getHistory(page, limit);
      // Access only the 'history' property defined in HistoryResponse
      const historyData = response.data.history || []; 
      // const paginationData = response.data.pagination; // Uncomment and use if API returns pagination

      set({
        withdrawals: historyData as Withdrawal[],
        // Update pagination state if applicable
        // currentPage: paginationData?.page || 1,
        // totalPages: paginationData?.pages || 1,
        // totalWithdrawals: paginationData?.total || 0,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to get withdrawal history',
        isLoading: false
      });
      console.error("getHistory error:", error);
    }
  },

  create: async (amount: number, upiId: string, method: string = 'upi') => {
    try {
      set({ isLoading: true, error: null });
      // Pass data as a single object, matching withdrawalsAPI.create signature
      await withdrawalsAPI.create({ amount, upiId, method });
      // Refresh history after successful creation
      await get().getHistory(); // Fetch the first page
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create withdrawal',
        isLoading: false
      });
      console.error('Error creating withdrawal:', error);
      return false;
    }
  },
}));

