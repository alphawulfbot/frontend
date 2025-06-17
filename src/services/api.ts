import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { handleApiError, AppError } from './errorHandler';
import { securityService } from './security';

// Minimal test export
export const testExportValue = "TEST_VALUE";

const API_URL = 'https://backend-m664.onrender.com';

// --- Exported Types ---
export interface UserProfile {
  id: string;
  telegram_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  balance: number;
  total_earned?: number;
  level: string;
  level_points?: number;
  taps_remaining?: number;
  referral_code?: string;
}

export interface LoginResponse {
  user: UserProfile;
  token: string;
}

export interface MeResponse {
  user: UserProfile;
}

export interface BalanceResponse { balance: number }
export interface TransactionsResponse { transactions: any[] } // Replace 'any'
export interface HistoryResponse { history: any[] } // Replace 'any'
export interface AdResponse { adId: string; type: string; platform: string; adUnitId: string; /* ... */ }
export interface AdMetricsResponse { totalViews: number; totalClicks: number; ctr: number; /* ... */ }
export interface TelegramStatusResponse { connected: boolean }
// --- End Exported Types ---

// Export the actual Axios instance with a unique name
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor using the unique instance name
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Keep X-Telegram-Init-Data handling if needed for specific requests
    if (!(config.url === '/api/auth/telegram' && config.headers['X-Telegram-Init-Data'])) {
       delete config.headers['X-Telegram-Init-Data'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor using the unique instance name
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Clear the default header on the instance
      delete axiosInstance.defaults.headers.common['Authorization'];
      console.error("Unauthorized access - 401");
    }
    return Promise.reject(handleApiError(error));
  }
);

// API function wrappers using the unique instance name
export const authAPI = {
  login: (initData: string): Promise<AxiosResponse<LoginResponse>> => 
    axiosInstance.post<LoginResponse>("/api/auth/telegram", {}, { headers: { "X-Telegram-Init-Data": initData } }),
  me: (): Promise<AxiosResponse<MeResponse>> => 
    axiosInstance.get<MeResponse>('/api/users/profile'),
  logout: (): Promise<AxiosResponse<void>> => 
    axiosInstance.post<void>('/api/auth/logout'), // Check backend
  refreshToken: (refreshToken: string): Promise<AxiosResponse<{ token: string }>> => 
    axiosInstance.post<{ token: string }>('/api/auth/refresh', { refreshToken }), // Check backend
};

export const userAPI = {
  getProfile: (): Promise<AxiosResponse<UserProfile>> => 
    axiosInstance.get<UserProfile>('/api/users/profile'),
  updateProfile: (data: Partial<UserProfile>): Promise<AxiosResponse<{ message: string; user: UserProfile }>> => 
    axiosInstance.put<{ message: string; user: UserProfile }>('/api/users/profile', data),
  getProgress: (): Promise<AxiosResponse<any>> => 
    axiosInstance.get<any>('/api/progress'), // Replace 'any'
  getAchievements: (): Promise<AxiosResponse<any[]>> => 
    axiosInstance.get<any[]>('/api/progress/achievements'), // Replace 'any'
  getStats: (): Promise<AxiosResponse<any>> => 
    axiosInstance.get<any>('/api/users/stats'), // Check backend
  updateSettings: (settings: any): Promise<AxiosResponse<any>> => 
    axiosInstance.put<any>('/api/users/settings', settings), // Replace 'any'
  getNotifications: (): Promise<AxiosResponse<any[]>> => 
    axiosInstance.get<any[]>('/api/users/notifications'), // Replace 'any'
  markNotificationRead: (id: string): Promise<AxiosResponse<any>> => 
    axiosInstance.put<any>(`/api/users/notifications/${id}/read`), // Replace 'any'
};

export const coinsAPI = {
  getBalance: async (): Promise<AxiosResponse<BalanceResponse>> => {
    const profileRes = await userAPI.getProfile();
    return { ...profileRes, data: { balance: profileRes.data.balance } } as AxiosResponse<BalanceResponse>;
  },
  getHistory: (page?: number, limit?: number): Promise<AxiosResponse<HistoryResponse>> => 
    axiosInstance.get<HistoryResponse>('/api/coins/history', { params: { page, limit } }), // Check backend
  addCoins: (amount: number): Promise<AxiosResponse<any>> => 
    axiosInstance.post<any>('/api/coins/add', { amount }), // Check backend
  withdraw: (data: { amount: number; method: string }): Promise<AxiosResponse<any>> => 
    axiosInstance.post<any>('/api/coins/withdraw', data), // Check backend
  getExchangeRate: (): Promise<AxiosResponse<any>> => 
    axiosInstance.get<any>('/api/coins/exchange-rate'), // Check backend
  convertCoins: (amount: number, currency: string): Promise<AxiosResponse<any>> => 
    axiosInstance.post<any>('/api/coins/convert', { amount, currency }), // Check backend
  getTransactions: (page?: number, limit?: number): Promise<AxiosResponse<TransactionsResponse>> => 
    axiosInstance.get<TransactionsResponse>('/api/coins/transactions', { params: { page, limit } }), // Check backend
};

export const withdrawalsAPI = {
  getHistory: (page?: number, limit?: number): Promise<AxiosResponse<HistoryResponse>> => 
    axiosInstance.get<HistoryResponse>('/api/withdrawals/history', { params: { page, limit } }),
  getPending: (): Promise<AxiosResponse<any[]>> => 
    axiosInstance.get<any[]>('/api/withdrawals/pending'),
  create: (data: { amount: number; method: string; upiId?: string }): Promise<AxiosResponse<any>> => 
    axiosInstance.post<any>('/api/withdrawals', data),
  cancel: (id: string): Promise<AxiosResponse<any>> => 
    axiosInstance.post<any>(`/api/withdrawals/${id}/cancel`),
  getMethods: (): Promise<AxiosResponse<any[]>> => 
    axiosInstance.get<any[]>('/api/withdrawals/methods'),
  verifyMethod: (method: string, data: any): Promise<AxiosResponse<any>> => 
    axiosInstance.post<any>(`/api/withdrawals/verify/${method}`, data),
};

export const adsAPI = {
  getAd: (type: string): Promise<AxiosResponse<AdResponse>> => 
    axiosInstance.get<AdResponse>(`/api/ads/get?type=${type}`),
  recordClick: (adId: string): Promise<AxiosResponse<any>> => 
    axiosInstance.post<any>(`/api/ads/click/${adId}`),
  processReward: (adId: string): Promise<AxiosResponse<any>> => 
    axiosInstance.post<any>(`/api/ads/reward/${adId}`),
  getMetrics: (adId: string): Promise<AxiosResponse<AdMetricsResponse>> => 
    axiosInstance.get<AdMetricsResponse>(`/api/ads/metrics/${adId}`),
  createAd: (data: any): Promise<AxiosResponse<any>> => 
    axiosInstance.post<any>('/api/ads/create', data),
  updateStatus: (adId: string, status: string): Promise<AxiosResponse<any>> => 
    axiosInstance.put<any>(`/api/ads/status/${adId}`, { status }),
  getAdHistory: (): Promise<AxiosResponse<any[]>> => 
    axiosInstance.get<any[]>('/api/ads/history'), // Check backend
  getAdStats: (): Promise<AxiosResponse<any>> => 
    axiosInstance.get<any>('/api/ads/stats'), // Check backend
};

