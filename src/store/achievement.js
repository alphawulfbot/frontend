"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAchievementStore = void 0;
const zustand_1 = require("zustand");
exports.useAchievementStore = (0, zustand_1.create)((set) => ({
    achievements: [],
    addAchievement: (achievement) => set((state) => ({
        achievements: [...state.achievements, achievement],
    })),
}));
