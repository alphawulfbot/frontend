"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGameStore = void 0;
const zustand_1 = require("zustand");
exports.useGameStore = (0, zustand_1.create)((set) => ({
    level: 1,
    experience: 0,
    experienceToNext: 100,
    tapsRemaining: 100,
    updateLevel: (level) => set({ level }),
    updateExperience: (experience) => set({ experience }),
    updateTapsRemaining: (tapsRemaining) => set({ tapsRemaining }),
}));
