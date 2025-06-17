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
exports.useWithdrawalsStore = void 0;
const zustand_1 = require("zustand");
const api_1 = require("../services/api");
exports.useWithdrawalsStore = (0, zustand_1.create)((set, get) => ({
    withdrawals: [],
    isLoading: false,
    error: null,
    // Initialize pagination state if used
    // currentPage: 1,
    // totalPages: 1,
    // totalWithdrawals: 0,
    getHistory: (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
        try {
            set({ isLoading: true, error: null });
            // Call API, expecting HistoryResponse { history: Withdrawal[] }
            const response = yield api_1.withdrawalsAPI.getHistory(page, limit);
            // Access only the 'history' property defined in HistoryResponse
            const historyData = response.data.history || [];
            // const paginationData = response.data.pagination; // Uncomment and use if API returns pagination
            set({
                withdrawals: historyData,
                // Update pagination state if applicable
                // currentPage: paginationData?.page || 1,
                // totalPages: paginationData?.pages || 1,
                // totalWithdrawals: paginationData?.total || 0,
                isLoading: false
            });
        }
        catch (error) {
            set({
                error: error.message || 'Failed to get withdrawal history',
                isLoading: false
            });
            console.error("getHistory error:", error);
        }
    }),
    create: (amount_1, upiId_1, ...args_1) => __awaiter(void 0, [amount_1, upiId_1, ...args_1], void 0, function* (amount, upiId, method = 'upi') {
        try {
            set({ isLoading: true, error: null });
            // Pass data as a single object, matching withdrawalsAPI.create signature
            yield api_1.withdrawalsAPI.create({ amount, upiId, method });
            // Refresh history after successful creation
            yield get().getHistory(); // Fetch the first page
            set({ isLoading: false });
            return true;
        }
        catch (error) {
            set({
                error: error.message || 'Failed to create withdrawal',
                isLoading: false
            });
            console.error('Error creating withdrawal:', error);
            return false;
        }
    }),
}));
