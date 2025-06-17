"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTransactionStore = void 0;
const zustand_1 = require("zustand");
exports.useTransactionStore = (0, zustand_1.create)((set) => ({
    transactions: [],
    addTransaction: (transaction) => set((state) => ({
        transactions: [...state.transactions, transaction],
    })),
}));
