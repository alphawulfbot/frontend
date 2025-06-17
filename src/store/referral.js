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
exports.useReferralStore = void 0;
const zustand_1 = require("zustand");
// Remove incorrect imports: userAPI and withdrawalsAPI are not exported from api.ts
// Import specific API functions if needed, or rely on the main 'api' instance
const api_1 = require("@/services/api");
const performance_1 = require("@/services/performance");
require("@/types/telegram");
const TELEGRAM_BOT_USERNAME = 'AlphaWulfBot'; // Replace with actual bot username if different
// Define Referral Tiers (Ensure this matches backend logic if any)
const REFERRAL_TIERS = [
    {
        level: 1,
        name: 'Bronze',
        requiredReferrals: 0,
        bonusMultiplier: 1,
        rewards: { perReferral: 100, daily: 50, weekly: 200, monthly: 500 },
        achievements: []
    },
    {
        level: 2,
        name: 'Silver',
        requiredReferrals: 5,
        bonusMultiplier: 1.2,
        rewards: { perReferral: 150, daily: 75, weekly: 300, monthly: 750 },
        achievements: []
    },
    {
        level: 3,
        name: 'Gold',
        requiredReferrals: 20,
        bonusMultiplier: 1.5,
        rewards: { perReferral: 200, daily: 100, weekly: 400, monthly: 1000 },
        achievements: []
    }
];
// Define the state structure and actions matching the ReferralState interface
exports.useReferralStore = (0, zustand_1.create)((set, get) => ({
    referralCode: '',
    referralLink: '',
    referralCount: 0,
    referralRewards: 0,
    referralHistory: [],
    currentTier: REFERRAL_TIERS[0],
    nextTier: REFERRAL_TIERS[1],
    achievements: [],
    specialRewards: {
        lastDailyClaim: null,
        lastWeeklyClaim: null,
        lastMonthlyClaim: null
    },
    isLoading: false,
    error: null,
    // --- Actions matching ReferralState --- 
    generateReferralLink: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            set({ isLoading: true, error: null });
            const response = yield api_1.api.get('/api/referral/generate');
            const code = response.data.code;
            if (typeof code !== 'string') {
                throw new Error('Invalid response format for referral code');
            }
            const referralLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${code}`;
            set({ referralCode: code, referralLink, isLoading: false });
            return referralLink;
        }
        catch (error) {
            const errorMessage = error.message || 'Failed to generate referral link';
            set({ error: errorMessage, isLoading: false });
            console.error("generateReferralLink error:", error);
            throw new Error(errorMessage);
        }
    }),
    getReferralStats: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            set({ isLoading: true, error: null });
            const response = yield api_1.api.get('/api/referral/stats');
            const { count, rewards, history } = response.data;
            let currentTier = REFERRAL_TIERS[REFERRAL_TIERS.length - 1];
            for (let i = 0; i < REFERRAL_TIERS.length; i++) {
                if (count < REFERRAL_TIERS[i].requiredReferrals) {
                    currentTier = REFERRAL_TIERS[i - 1] || REFERRAL_TIERS[0];
                    break;
                }
            }
            const nextTier = REFERRAL_TIERS.find(tier => tier.level === currentTier.level + 1);
            set({
                referralCount: count,
                referralRewards: rewards,
                referralHistory: history,
                currentTier,
                nextTier,
                isLoading: false
            });
            return { count, rewards, history };
        }
        catch (error) {
            const errorMessage = error.message || 'Failed to fetch referral stats';
            set({ error: errorMessage, isLoading: false });
            console.error("getReferralStats error:", error);
            throw new Error(errorMessage);
        }
    }),
    shareReferralLink: () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { referralLink } = get();
        if (!referralLink) {
            throw new Error('No referral link available. Generate one first.');
        }
        try {
            if (((_a = window.Telegram) === null || _a === void 0 ? void 0 : _a.WebApp) && typeof window.Telegram.WebApp.shareUrl === 'function') {
                yield window.Telegram.WebApp.shareUrl(referralLink);
                performance_1.performanceMonitor.recordReferralShare();
            }
            else if (navigator.clipboard) {
                yield navigator.clipboard.writeText(referralLink);
                alert('Referral link copied to clipboard!');
            }
            else {
                alert('Could not share or copy the link. Please copy it manually: ' + referralLink);
            }
        }
        catch (error) {
            const errorMessage = error.message || 'Failed to share referral link';
            set({ error: errorMessage });
            console.error("shareReferralLink error:", error);
            throw new Error(errorMessage);
        }
    }),
    claimSpecialReward: (type) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            set({ isLoading: true, error: null });
            const response = yield api_1.api.post(`/api/referral/claim/${type}`);
            const reward = response.data.reward;
            if (typeof reward !== 'number') {
                throw new Error('Invalid response format for reward amount');
            }
            set(state => ({
                referralRewards: state.referralRewards + reward,
                specialRewards: Object.assign(Object.assign({}, state.specialRewards), { [`last${type.charAt(0).toUpperCase() + type.slice(1)}Claim`]: new Date().toISOString() }),
                isLoading: false
            }));
            performance_1.performanceMonitor.recordReferralRewardClaim(reward);
            return reward;
        }
        catch (error) {
            const errorMessage = error.message || `Failed to claim ${type} reward`;
            set({ error: errorMessage, isLoading: false });
            console.error("claimSpecialReward error:", error);
            throw new Error(errorMessage);
        }
    }),
    claimReferralReward: (referralId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            set({ isLoading: true, error: null });
            const response = yield api_1.api.post(`/api/referral/claim/reward/${referralId}`);
            const reward = response.data.reward;
            if (typeof reward !== 'number') {
                throw new Error('Invalid response format for referral reward amount');
            }
            set(state => ({ referralRewards: state.referralRewards + reward, isLoading: false }));
            performance_1.performanceMonitor.recordReferralRewardClaim(reward);
            return reward;
        }
        catch (error) {
            const errorMessage = error.message || `Failed to claim reward for referral ${referralId}`;
            set({ error: errorMessage, isLoading: false });
            console.error("claimReferralReward error:", error);
            throw new Error(errorMessage);
        }
    }),
    checkAchievements: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            set({ isLoading: true, error: null });
            const response = yield api_1.api.get('/api/referral/achievements');
            const achievements = response.data.achievements;
            set({ achievements, isLoading: false });
        }
        catch (error) {
            const errorMessage = error.message || 'Failed to check achievements';
            set({ error: errorMessage, isLoading: false });
            console.error("checkAchievements error:", error);
            throw new Error(errorMessage);
        }
    }),
    getTierProgress: () => {
        const { currentTier, nextTier, referralCount } = get();
        if (!nextTier)
            return 100;
        if (nextTier.requiredReferrals === currentTier.requiredReferrals)
            return 0;
        const progress = (referralCount - currentTier.requiredReferrals) / (nextTier.requiredReferrals - currentTier.requiredReferrals);
        return Math.max(0, Math.min(100, Math.floor(progress * 100)));
    }
}));
