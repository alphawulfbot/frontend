import { create } from 'zustand';
// Remove incorrect imports: userAPI and withdrawalsAPI are not exported from api.ts
// Import specific API functions if needed, or rely on the main 'api' instance
import { api } from '@/services/api'; 
import { performanceMonitor } from '@/services/performance';
import type { ReferralState, ReferralTier, ReferralAchievement, ReferralRewards, ReferralHistory } from '@/types/referral';
import '@/types/telegram';

const TELEGRAM_BOT_USERNAME = 'AlphaWulfBot'; // Replace with actual bot username if different

// Define Referral Tiers (Ensure this matches backend logic if any)
const REFERRAL_TIERS: ReferralTier[] = [
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
export const useReferralStore = create<ReferralState>((set, get) => ({
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

  generateReferralLink: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/api/referral/generate'); 
      const code = response.data.code;
      if (typeof code !== 'string') {
        throw new Error('Invalid response format for referral code');
      }
      const referralLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${code}`;
      set({ referralCode: code, referralLink, isLoading: false });
      return referralLink;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate referral link';
      set({ error: errorMessage, isLoading: false });
      console.error("generateReferralLink error:", error);
      throw new Error(errorMessage);
    }
  },

  getReferralStats: async () => {
     try {
      set({ isLoading: true, error: null });
      const response = await api.get('/api/referral/stats'); 
      const { count, rewards, history } = response.data as { count: number; rewards: number; history: ReferralHistory[] }; 
      
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
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch referral stats';
      set({ error: errorMessage, isLoading: false });
      console.error("getReferralStats error:", error);
      throw new Error(errorMessage);
    }
  },

  shareReferralLink: async () => {
    const { referralLink } = get();
    if (!referralLink) {
      throw new Error('No referral link available. Generate one first.');
    }
    try {
      if (window.Telegram?.WebApp && typeof (window.Telegram.WebApp as any).shareUrl === 'function') {
        await (window.Telegram.WebApp as any).shareUrl(referralLink);
        performanceMonitor.recordReferralShare();
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(referralLink);
        alert('Referral link copied to clipboard!');
      } else {
        alert('Could not share or copy the link. Please copy it manually: ' + referralLink);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to share referral link';
      set({ error: errorMessage });
      console.error("shareReferralLink error:", error);
      throw new Error(errorMessage);
    }
  },

  claimSpecialReward: async (type: 'daily' | 'weekly' | 'monthly') => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post(`/api/referral/claim/${type}`); 
      const reward = response.data.reward;
      if (typeof reward !== 'number') {
         throw new Error('Invalid response format for reward amount');
      }
      set(state => ({
        referralRewards: state.referralRewards + reward,
        specialRewards: {
          ...state.specialRewards,
          [`last${type.charAt(0).toUpperCase() + type.slice(1)}Claim`]: new Date().toISOString()
        },
        isLoading: false
      }));
      performanceMonitor.recordReferralRewardClaim(reward);
      return reward;
    } catch (error: any) {
      const errorMessage = error.message || `Failed to claim ${type} reward`;
      set({ error: errorMessage, isLoading: false });
      console.error("claimSpecialReward error:", error);
      throw new Error(errorMessage);
    }
  },

  claimReferralReward: async (referralId: string): Promise<number> => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post(`/api/referral/claim/reward/${referralId}`); 
      const reward = response.data.reward;
       if (typeof reward !== 'number') {
         throw new Error('Invalid response format for referral reward amount');
      }
      set(state => ({ referralRewards: state.referralRewards + reward, isLoading: false }));
      performanceMonitor.recordReferralRewardClaim(reward);
      return reward;
    } catch (error: any) {
      const errorMessage = error.message || `Failed to claim reward for referral ${referralId}`;
      set({ error: errorMessage, isLoading: false });
      console.error("claimReferralReward error:", error);
      throw new Error(errorMessage);
    }
  },

  checkAchievements: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/api/referral/achievements'); 
      const achievements = response.data.achievements as ReferralAchievement[];
      set({ achievements, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to check achievements';
      set({ error: errorMessage, isLoading: false });
      console.error("checkAchievements error:", error);
      throw new Error(errorMessage);
    }
  },
  
  getTierProgress: () => {
    const { currentTier, nextTier, referralCount } = get();
    if (!nextTier) return 100;
    if (nextTier.requiredReferrals === currentTier.requiredReferrals) return 0;
    const progress = (referralCount - currentTier.requiredReferrals) / (nextTier.requiredReferrals - currentTier.requiredReferrals);
    return Math.max(0, Math.min(100, Math.floor(progress * 100)));
  }

}));

