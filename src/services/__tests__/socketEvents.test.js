"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("../socket");
const socketEvents_1 = require("../socketEvents");
const game_1 = require("../../store/game");
const achievement_1 = require("../../store/achievement");
const transaction_1 = require("../../store/transaction");
jest.mock('../../store/game', () => ({
    useGameStore: {
        getState: jest.fn(() => ({
            updateLevel: jest.fn(),
            updateExperience: jest.fn(),
            updateTapsRemaining: jest.fn(),
        })),
    },
}));
jest.mock('../../store/achievement', () => ({
    useAchievementStore: {
        getState: jest.fn(() => ({
            addAchievement: jest.fn(),
        })),
    },
}));
jest.mock('../../store/transaction', () => ({
    useTransactionStore: {
        getState: jest.fn(() => ({
            addTransaction: jest.fn(),
        })),
    },
}));
describe('Socket Events', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => {
        (0, socketEvents_1.cleanupSocketEvents)();
    });
    it('sets up event listeners correctly', () => {
        const mockOn = jest.spyOn(socket_1.socketService, 'on');
        (0, socketEvents_1.setupSocketEvents)();
        expect(mockOn).toHaveBeenCalledWith('user:update', expect.any(Function));
        expect(mockOn).toHaveBeenCalledWith('user:levelUp', expect.any(Function));
        expect(mockOn).toHaveBeenCalledWith('user:achievement', expect.any(Function));
        expect(mockOn).toHaveBeenCalledWith('coins:update', expect.any(Function));
    });
    it('handles user update event', () => {
        const mockUpdateLevel = jest.fn();
        const mockUpdateExperience = jest.fn();
        const mockUpdateTapsRemaining = jest.fn();
        game_1.useGameStore.getState.mockReturnValue({
            updateLevel: mockUpdateLevel,
            updateExperience: mockUpdateExperience,
            updateTapsRemaining: mockUpdateTapsRemaining,
        });
        (0, socketEvents_1.setupSocketEvents)();
        const updateData = {
            level: 2,
            experience: 100,
            tapsRemaining: 50,
        };
        socket_1.socketService.emit('user:update', updateData);
        expect(mockUpdateLevel).toHaveBeenCalledWith(updateData.level);
        expect(mockUpdateExperience).toHaveBeenCalledWith(updateData.experience);
        expect(mockUpdateTapsRemaining).toHaveBeenCalledWith(updateData.tapsRemaining);
    });
    it('handles achievement event', () => {
        const mockAddAchievement = jest.fn();
        achievement_1.useAchievementStore.getState.mockReturnValue({
            addAchievement: mockAddAchievement,
        });
        (0, socketEvents_1.setupSocketEvents)();
        const achievementData = {
            id: 'achievement-1',
            name: 'First Win',
            description: 'Win your first game',
            icon: '🏆',
            unlockedAt: new Date().toISOString(),
        };
        socket_1.socketService.emit('user:achievement', achievementData);
        expect(mockAddAchievement).toHaveBeenCalledWith(achievementData);
    });
    it('handles coins update event', () => {
        const mockAddTransaction = jest.fn();
        transaction_1.useTransactionStore.getState.mockReturnValue({
            addTransaction: mockAddTransaction,
        });
        (0, socketEvents_1.setupSocketEvents)();
        const transactionData = {
            balance: 1100,
            change: 100,
            reason: 'game_win',
            timestamp: new Date().toISOString(),
        };
        socket_1.socketService.emit('coins:update', transactionData);
        expect(mockAddTransaction).toHaveBeenCalledWith(transactionData);
    });
});
