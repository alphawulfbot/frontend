"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStore = void 0;
const zustand_1 = require("zustand");
exports.useStore = (0, zustand_1.create)((set) => ({
    id: '',
    username: '',
    coinBalance: 0,
    level: 1,
    userLevel: 1,
    tapsRemaining: 0,
    tapRefreshTime: null,
    friends: [],
    setUser: (user) => set((state) => (Object.assign(Object.assign({}, state), user))),
    updateCoinBalance: (amount) => set((state) => ({ coinBalance: state.coinBalance + amount })),
    updateLevel: (level) => set(() => ({ level, userLevel: level })),
    resetTaps: () => set({ tapsRemaining: 100, tapRefreshTime: new Date().toISOString() }),
    initTelegramWebApp: () => {
        var _a;
        if ((_a = window.Telegram) === null || _a === void 0 ? void 0 : _a.WebApp) {
            window.Telegram.WebApp.ready();
        }
    },
}));
