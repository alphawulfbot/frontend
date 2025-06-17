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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_hooks_1 = require("@testing-library/react-hooks");
const referral_1 = require("../referral");
const api_1 = __importDefault(require("@/services/api"));
const performance_1 = require("@/services/performance");
// Mock dependencies
jest.mock('@/services/api');
jest.mock('@/services/performance');
describe('Referral Store', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset store state
        (0, react_hooks_1.act)(() => {
            referral_1.useReferralStore.setState({
                referralCode: null,
                referralLink: null,
                referralCount: 0,
                referralRewards: 0,
                referralHistory: [],
                currentTier: {
                    level: 1,
                    name: 'Bronze',
                    requiredReferrals: 0,
                    bonusMultiplier: 1,
                    rewards: {
                        joinBonus: 100,
                        withdrawalBonus: 0.1,
                        specialRewards: {
                            dailyBonus: 10,
                            weeklyBonus: 50,
                            monthlyBonus: 200,
                        },
                    },
                    achievements: [],
                },
                nextTier: {
                    level: 2,
                    name: 'Silver',
                    requiredReferrals: 5,
                    bonusMultiplier: 1.2,
                    rewards: {
                        joinBonus: 150,
                        withdrawalBonus: 0.15,
                        specialRewards: {
                            dailyBonus: 20,
                            weeklyBonus: 100,
                            monthlyBonus: 400,
                        },
                    },
                    achievements: [],
                },
                achievements: [],
                specialRewards: {
                    lastDailyClaim: null,
                    lastWeeklyClaim: null,
                    lastMonthlyClaim: null,
                },
                isLoading: false,
                error: null,
            });
        });
    });
    describe('generateReferralLink', () => {
        it('should generate a referral link successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = { data: { referralCode: 'TEST123' } };
            api_1.default.post.mockResolvedValueOnce(mockResponse);
            const { result } = (0, react_hooks_1.renderHook)(() => (0, referral_1.useReferralStore)());
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield result.current.generateReferralLink();
            }));
            expect(result.current.referralCode).toBe('TEST123');
            expect(result.current.referralLink).toBe('https://t.me/your_bot_username?start=TEST123');
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
        }));
        it('should handle errors when generating referral link', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Failed to generate');
            api_1.default.post.mockRejectedValueOnce(error);
            const { result } = (0, react_hooks_1.renderHook)(() => (0, referral_1.useReferralStore)());
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield result.current.generateReferralLink();
            }));
            expect(result.current.error).toBe('Failed to generate');
            expect(result.current.isLoading).toBe(false);
        }));
    });
    describe('getReferralStats', () => {
        it('should fetch referral stats successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                data: {
                    referralCount: 10,
                    referralRewards: 1000,
                    specialRewards: {
                        lastDailyClaim: null,
                        lastWeeklyClaim: null,
                        lastMonthlyClaim: null,
                    },
                },
            };
            api_1.default.get.mockResolvedValueOnce(mockResponse);
            const { result } = (0, react_hooks_1.renderHook)(() => (0, referral_1.useReferralStore)());
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield result.current.getReferralStats();
            }));
            expect(result.current.referralCount).toBe(10);
            expect(result.current.referralRewards).toBe(1000);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
        }));
        it('should update tier based on referral count', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const mockResponse = {
                data: {
                    referralCount: 6,
                    referralRewards: 1000,
                    specialRewards: {
                        lastDailyClaim: null,
                        lastWeeklyClaim: null,
                        lastMonthlyClaim: null,
                    },
                },
            };
            api_1.default.get.mockResolvedValueOnce(mockResponse);
            const { result } = (0, react_hooks_1.renderHook)(() => (0, referral_1.useReferralStore)());
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield result.current.getReferralStats();
            }));
            expect(result.current.currentTier.name).toBe('Silver');
            expect((_a = result.current.nextTier) === null || _a === void 0 ? void 0 : _a.name).toBe('Gold');
        }));
    });
    describe('getReferralHistory', () => {
        it('should fetch referral history successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockHistory = [
                {
                    id: '1',
                    username: 'user1',
                    joinedAt: '2024-01-01T00:00:00Z',
                    reward: 100,
                    status: 'pending',
                },
            ];
            api_1.default.get.mockResolvedValueOnce({ data: mockHistory });
            const { result } = (0, react_hooks_1.renderHook)(() => (0, referral_1.useReferralStore)());
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield result.current.getReferralHistory();
            }));
            expect(result.current.referralHistory).toEqual(mockHistory);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
        }));
    });
    describe('shareReferralLink', () => {
        it('should share referral link via Telegram WebApp', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockWebApp = {
                shareUrl: jest.fn().mockResolvedValue(undefined),
            };
            window.Telegram = { WebApp: mockWebApp };
            const { result } = (0, react_hooks_1.renderHook)(() => (0, referral_1.useReferralStore)());
            (0, react_hooks_1.act)(() => {
                referral_1.useReferralStore.setState({
                    referralLink: 'https://t.me/your_bot_username?start=TEST123',
                });
            });
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield result.current.shareReferralLink();
            }));
            expect(mockWebApp.shareUrl).toHaveBeenCalledWith({
                url: 'https://t.me/your_bot_username?start=TEST123',
                text: expect.any(String),
            });
            expect(performance_1.performanceMonitor.recordReferralShare).toHaveBeenCalled();
        }));
        it('should fallback to clipboard if Telegram WebApp is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockClipboard = {
                writeText: jest.fn().mockResolvedValue(undefined),
            };
            Object.assign(navigator, { clipboard: mockClipboard });
            const { result } = (0, react_hooks_1.renderHook)(() => (0, referral_1.useReferralStore)());
            (0, react_hooks_1.act)(() => {
                referral_1.useReferralStore.setState({
                    referralLink: 'https://t.me/your_bot_username?start=TEST123',
                });
            });
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield result.current.shareReferralLink();
            }));
            expect(mockClipboard.writeText).toHaveBeenCalledWith('https://t.me/your_bot_username?start=TEST123');
            expect(result.current.error).toBe('Link copied to clipboard!');
        }));
    });
    describe('claimReferralReward', () => {
        it('should claim reward successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = { data: { success: true } };
            api_1.default.post.mockResolvedValueOnce(mockResponse);
            const { result } = (0, react_hooks_1.renderHook)(() => (0, referral_1.useReferralStore)());
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield result.current.claimReferralReward('123');
            }));
            expect(api_1.default.post).toHaveBeenCalledWith('/referrals/123/claim');
            expect(performance_1.performanceMonitor.recordReferralRewardClaim).toHaveBeenCalled();
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
        }));
    });
    describe('claimSpecialReward', () => {
        it('should claim daily reward successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                data: {
                    reward: 10,
                    timestamp: new Date().toISOString(),
                },
            };
            api_1.default.post.mockResolvedValueOnce(mockResponse);
            const { result } = (0, react_hooks_1.renderHook)(() => (0, referral_1.useReferralStore)());
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield result.current.claimSpecialReward('daily');
            }));
            expect(result.current.specialRewards.lastDailyClaim).toBe(mockResponse.data.timestamp);
            expect(result.current.referralRewards).toBe(10);
            expect(performance_1.performanceMonitor.recordMetric).toHaveBeenCalledWith('special_reward_claim', 10, { type: 'daily' });
        }));
        it('should handle errors when claiming special reward', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Failed to claim');
            api_1.default.post.mockRejectedValueOnce(error);
            const { result } = (0, react_hooks_1.renderHook)(() => (0, referral_1.useReferralStore)());
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield result.current.claimSpecialReward('daily');
            }));
            expect(result.current.error).toBe('Failed to claim');
            expect(result.current.isLoading).toBe(false);
        }));
    });
    describe('checkAchievements', () => {
        it('should unlock new achievements when requirements are met', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = { data: { success: true } };
            api_1.default.post.mockResolvedValueOnce(mockResponse);
            const { result } = (0, react_hooks_1.renderHook)(() => (0, referral_1.useReferralStore)());
            (0, react_hooks_1.act)(() => {
                referral_1.useReferralStore.setState({
                    referralCount: 5,
                    referralRewards: 1000,
                });
            });
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield result.current.checkAchievements();
            }));
            expect(api_1.default.post).toHaveBeenCalledWith('/referrals/achievements', {
                achievements: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'silver_5',
                        type: 'referral_count',
                    }),
                    expect.objectContaining({
                        id: 'silver_rewards',
                        type: 'referral_rewards',
                    }),
                ]),
            });
            expect(performance_1.performanceMonitor.recordMetric).toHaveBeenCalledWith('achievement_unlocked', expect.any(Number), expect.any(Object));
        }));
    });
    describe('getTierProgress', () => {
        it('should calculate progress correctly', () => {
            const { result } = (0, react_hooks_1.renderHook)(() => (0, referral_1.useReferralStore)());
            (0, react_hooks_1.act)(() => {
                referral_1.useReferralStore.setState({
                    referralCount: 3,
                    currentTier: {
                        level: 1,
                        name: 'Bronze',
                        requiredReferrals: 0,
                        bonusMultiplier: 1,
                        rewards: {
                            joinBonus: 100,
                            withdrawalBonus: 0.1,
                            specialRewards: {
                                dailyBonus: 10,
                                weeklyBonus: 50,
                                monthlyBonus: 200,
                            },
                        },
                        achievements: [],
                    },
                    nextTier: {
                        level: 2,
                        name: 'Silver',
                        requiredReferrals: 5,
                        bonusMultiplier: 1.2,
                        rewards: {
                            joinBonus: 150,
                            withdrawalBonus: 0.15,
                            specialRewards: {
                                dailyBonus: 20,
                                weeklyBonus: 100,
                                monthlyBonus: 400,
                            },
                        },
                        achievements: [],
                    },
                });
            });
            const progress = result.current.getTierProgress();
            expect(progress).toEqual({
                current: 3,
                next: 5,
                percentage: 60,
            });
        });
        it('should handle max tier case', () => {
            const { result } = (0, react_hooks_1.renderHook)(() => (0, referral_1.useReferralStore)());
            (0, react_hooks_1.act)(() => {
                referral_1.useReferralStore.setState({
                    referralCount: 30,
                    currentTier: {
                        level: 4,
                        name: 'Platinum',
                        requiredReferrals: 30,
                        bonusMultiplier: 2,
                        rewards: {
                            joinBonus: 300,
                            withdrawalBonus: 0.25,
                            specialRewards: {
                                dailyBonus: 50,
                                weeklyBonus: 250,
                                monthlyBonus: 1000,
                            },
                        },
                        achievements: [],
                    },
                    nextTier: null,
                });
            });
            const progress = result.current.getTierProgress();
            expect(progress).toEqual({
                current: 30,
                next: 0,
                percentage: 100,
            });
        });
    });
});
