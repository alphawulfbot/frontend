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
const react_hooks_1 = require("@testing-library/react-hooks");
const auth_1 = require("../auth");
const api_1 = require("../../services/api");
const socket_1 = require("../../services/socket");
// Mock dependencies
jest.mock('../../services/api');
jest.mock('../../services/socket');
jest.mock('../../services/security');
describe('Auth Store', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        // Clear localStorage
        localStorage.clear();
        // Reset store state
        (0, react_hooks_1.act)(() => {
            auth_1.useAuthStore.getState().logout();
        });
    });
    describe('Initial State', () => {
        it('should initialize with default values', () => {
            const { result } = (0, react_hooks_1.renderHook)(() => (0, auth_1.useAuthStore)());
            expect(result.current.user).toBeNull();
            expect(result.current.token).toBeNull();
            expect(result.current.isLoading).toBeFalsy();
            expect(result.current.error).toBeNull();
            expect(result.current.isAuthenticated).toBeFalsy();
        });
        it('should load token from localStorage if available', () => {
            const mockToken = 'test-token';
            localStorage.setItem('token', mockToken);
            const { result } = (0, react_hooks_1.renderHook)(() => (0, auth_1.useAuthStore)());
            expect(result.current.token).toBe(mockToken);
        });
    });
    describe('Login Flow', () => {
        const mockUser = {
            id: '1',
            telegramId: '123456789',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            coinBalance: 1000,
            totalEarned: 1000,
            level: 1,
            tapsRemaining: 100,
            referralCode: 'ABC123',
        };
        const mockToken = 'test-token';
        beforeEach(() => {
            // Mock Telegram WebApp
            window.Telegram = {
                WebApp: {
                    ready: jest.fn(),
                    initData: 'test-init-data',
                },
            };
        });
        it('should handle successful login', () => __awaiter(void 0, void 0, void 0, function* () {
            api_1.authAPI.login.mockResolvedValueOnce({
                data: {
                    user: mockUser,
                    token: mockToken,
                },
            });
            const { result } = (0, react_hooks_1.renderHook)(() => (0, auth_1.useAuthStore)());
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield result.current.login('test-init-data');
            }));
            expect(api_1.authAPI.login).toHaveBeenCalledWith('test-init-data');
            expect(result.current.user).toEqual(mockUser);
            expect(result.current.token).toBe(mockToken);
            expect(result.current.isLoading).toBeFalsy();
            expect(result.current.error).toBeNull();
            expect(result.current.isAuthenticated).toBeTruthy();
            expect(localStorage.getItem('token')).toBe(mockToken);
            expect(socket_1.socketService.connect).toHaveBeenCalled();
        }));
        it('should handle login error', () => __awaiter(void 0, void 0, void 0, function* () {
            const errorMessage = 'Login failed';
            api_1.authAPI.login.mockRejectedValueOnce(new Error(errorMessage));
            const { result } = (0, react_hooks_1.renderHook)(() => (0, auth_1.useAuthStore)());
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(result.current.login('test-init-data')).rejects.toThrow(errorMessage);
            }));
            expect(result.current.user).toBeNull();
            expect(result.current.token).toBeNull();
            expect(result.current.isLoading).toBeFalsy();
            expect(result.current.error).toBe(errorMessage);
            expect(result.current.isAuthenticated).toBeFalsy();
            expect(localStorage.getItem('token')).toBeNull();
            expect(socket_1.socketService.connect).not.toHaveBeenCalled();
        }));
        it('should handle missing Telegram WebApp', () => __awaiter(void 0, void 0, void 0, function* () {
            window.Telegram = undefined;
            const { result } = (0, react_hooks_1.renderHook)(() => (0, auth_1.useAuthStore)());
            yield (0, react_hooks_1.act)(() => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(result.current.login('test-init-data')).rejects.toThrow('Telegram Web App not initialized');
            }));
            expect(result.current.user).toBeNull();
            expect(result.current.token).toBeNull();
            expect(result.current.isLoading).toBeFalsy();
            expect(result.current.isAuthenticated).toBeFalsy();
        }));
    });
    describe('Logout Flow', () => {
        it('should handle logout correctly', () => {
            const { result } = (0, react_hooks_1.renderHook)(() => (0, auth_1.useAuthStore)());
            // Set initial state
            (0, react_hooks_1.act)(() => {
                result.current.user = {
                    id: '1',
                    telegramId: '123456789',
                    username: 'testuser',
                    firstName: 'Test',
                    lastName: 'User',
                    coinBalance: 1000,
                    totalEarned: 1000,
                    level: 1,
                    tapsRemaining: 100,
                    referralCode: 'ABC123',
                };
                result.current.token = 'test-token';
                localStorage.setItem('token', 'test-token');
            });
            (0, react_hooks_1.act)(() => {
                result.current.logout();
            });
            expect(result.current.user).toBeNull();
            expect(result.current.token).toBeNull();
            expect(result.current.isAuthenticated).toBeFalsy();
            expect(localStorage.getItem('token')).toBeNull();
            expect(socket_1.socketService.disconnect).toHaveBeenCalled();
        });
    });
    describe('User Data Updates', () => {
        it('should update user data correctly', () => {
            const { result } = (0, react_hooks_1.renderHook)(() => (0, auth_1.useAuthStore)());
            // Set initial state
            (0, react_hooks_1.act)(() => {
                result.current.user = {
                    id: '1',
                    telegramId: '123456789',
                    username: 'testuser',
                    firstName: 'Test',
                    lastName: 'User',
                    coinBalance: 1000,
                    totalEarned: 1000,
                    level: 1,
                    tapsRemaining: 100,
                    referralCode: 'ABC123',
                };
            });
            // Update user data
            (0, react_hooks_1.act)(() => {
                result.current.updateUserData({
                    coinBalance: 2000,
                    level: 2,
                });
            });
            expect(result.current.user).toEqual({
                id: '1',
                telegramId: '123456789',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                coinBalance: 2000,
                totalEarned: 1000,
                level: 2,
                tapsRemaining: 100,
                referralCode: 'ABC123',
            });
        });
        it('should handle null user state', () => {
            const { result } = (0, react_hooks_1.renderHook)(() => (0, auth_1.useAuthStore)());
            (0, react_hooks_1.act)(() => {
                result.current.updateUserData({
                    coinBalance: 2000,
                });
            });
            expect(result.current.user).toBeNull();
        });
    });
    describe('Real-time Updates', () => {
        it('should handle socket events correctly', () => {
            var _a;
            const { result } = (0, react_hooks_1.renderHook)(() => (0, auth_1.useAuthStore)());
            // Set initial state
            (0, react_hooks_1.act)(() => {
                result.current.user = {
                    id: '1',
                    telegramId: '123456789',
                    username: 'testuser',
                    firstName: 'Test',
                    lastName: 'User',
                    coinBalance: 1000,
                    totalEarned: 1000,
                    level: 1,
                    tapsRemaining: 100,
                    referralCode: 'ABC123',
                };
            });
            // Simulate socket events
            (0, react_hooks_1.act)(() => {
                const socketCallback = socket_1.socketService.on.mock.calls[0][1];
                socketCallback({ coinBalance: 2000 });
            });
            expect((_a = result.current.user) === null || _a === void 0 ? void 0 : _a.coinBalance).toBe(2000);
        });
    });
});
