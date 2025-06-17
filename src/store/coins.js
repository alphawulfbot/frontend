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
exports.useCoinsStore = void 0;
const zustand_1 = require("zustand");
const api_1 = require("../services/api"); // Assuming userAPI is exported correctly now
exports.useCoinsStore = (0, zustand_1.create)((set) => ({
    balance: null,
    level: null,
    tapsRemaining: null,
    transactions: [],
    isLoading: false,
    error: null,
    fetchBalanceAndProfile: () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            set({ isLoading: true, error: null });
            // Fetch the full user profile which includes balance etc.
            const response = yield api_1.userAPI.getProfile();
            const userProfile = response.data; // Type is UserProfile
            set({
                balance: userProfile.balance,
                level: userProfile.level,
                tapsRemaining: (_a = userProfile.taps_remaining) !== null && _a !== void 0 ? _a : null, // Use nullish coalescing for optional fields
                // Set other relevant state parts from userProfile
                isLoading: false
            });
        }
        catch (error) {
            set({
                error: error.message || 'Failed to fetch balance and profile',
                isLoading: false
            });
            console.error("fetchBalanceAndProfile error:", error);
        }
    }),
    // tap: async () => { ... }, // Removed
    // completeTask: async (taskId: string) => { ... }, // Removed
    getTransactions: (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
        try {
            set({ isLoading: true, error: null });
            // Call the API - response.data should match TransactionsResponse { transactions: any[] }
            const response = yield api_1.coinsAPI.getTransactions(page, limit);
            // Assuming response.data is { transactions: Transaction[] }
            // Perform type checking if necessary
            const transactions = response.data.transactions;
            set({ transactions: transactions || [], isLoading: false });
        }
        catch (error) {
            set({
                error: error.message || 'Failed to get transactions',
                isLoading: false
            });
            console.error("getTransactions error:", error);
        }
    }),
}));
