"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
// Import the specific API functions AND the actual Axios instance 'axiosInstance'
const api_1 = require("@/services/api");
exports.useAuthStore = (0, zustand_1.create)()((0, middleware_1.persist)((set, get) => ({
    user: null,
    token: localStorage.getItem('token'), // Load initial token from storage
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('token'), // Initial auth state based on token
    login: (initData) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            set({ isLoading: true, error: null });
            const response = yield api_1.authAPI.login(initData);
            const { user, token } = response.data;
            localStorage.setItem('token', token);
            // Use the directly imported 'axiosInstance' to set default header
            api_1.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({ user, token, isAuthenticated: true, isLoading: false });
        }
        catch (error) {
            localStorage.removeItem('token'); // Clear token on login failure
            // Use the directly imported 'axiosInstance' to delete default header
            delete api_1.axiosInstance.defaults.headers.common['Authorization'];
            set({ error: error.message || 'Failed to login', isLoading: false, isAuthenticated: false, user: null, token: null });
        }
    }),
    logout: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            set({ isLoading: true, error: null });
            // await authAPI.logout(); // Uncomment if backend endpoint exists
            localStorage.removeItem('token');
            // Use the directly imported 'axiosInstance' to delete default header
            delete api_1.axiosInstance.defaults.headers.common['Authorization'];
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
        catch (error) {
            // Even if logout API fails, clear local state
            localStorage.removeItem('token');
            // Use the directly imported 'axiosInstance' to delete default header
            delete api_1.axiosInstance.defaults.headers.common['Authorization'];
            set({ error: error.message || 'Failed to logout', isLoading: false, user: null, token: null, isAuthenticated: false });
        }
    }),
    me: () => __awaiter(void 0, void 0, void 0, function* () {
        if (!get().isAuthenticated || !get().token) {
            set({ user: null, isAuthenticated: false });
            return;
        }
        try {
            set({ isLoading: true, error: null });
            const response = yield api_1.authAPI.me();
            set({ user: response.data.user, isLoading: false, isAuthenticated: true });
        }
        catch (error) {
            localStorage.removeItem('token');
            // Use the directly imported 'axiosInstance' to delete default header
            delete api_1.axiosInstance.defaults.headers.common['Authorization'];
            set({ error: error.message || 'Failed to fetch user data', isLoading: false, user: null, token: null, isAuthenticated: false });
        }
    }),
    refreshToken: (refreshTokenValue) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            set({ isLoading: true, error: null });
            const response = yield api_1.authAPI.refreshToken(refreshTokenValue);
            const { token } = response.data;
            localStorage.setItem('token', token);
            // Use the directly imported 'axiosInstance' to set default header
            api_1.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({ token, isLoading: false, isAuthenticated: true });
        }
        catch (error) {
            localStorage.removeItem('token');
            // Use the directly imported 'axiosInstance' to delete default header
            delete api_1.axiosInstance.defaults.headers.common['Authorization'];
            set({ error: error.message || 'Failed to refresh token', isLoading: false, user: null, token: null, isAuthenticated: false });
        }
    })
}), {
    name: 'auth-storage',
    partialize: (state) => ({
        token: state.token,
    }),
    onRehydrateStorage: () => (state) => {
        if (state) {
            state.isAuthenticated = !!state.token;
            if (state.token) {
                // Use the directly imported 'axiosInstance' to set default header
                api_1.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
            }
            else {
                // Use the directly imported 'axiosInstance' to delete default header
                delete api_1.axiosInstance.defaults.headers.common['Authorization'];
            }
        }
    }
}));
