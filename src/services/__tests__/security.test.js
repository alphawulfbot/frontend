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
const security_1 = require("../security");
const crypto_js_1 = __importDefault(require("crypto-js"));
jest.mock('crypto-js');
describe('SecurityService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });
    describe('Token Management', () => {
        it('should set tokens correctly', () => {
            const accessToken = 'test-access-token';
            const refreshToken = 'test-refresh-token';
            const expiresIn = 3600;
            security_1.securityService.setTokens(accessToken, refreshToken, expiresIn);
            expect(localStorage.setItem).toHaveBeenCalledWith('token_expiry', expect.any(String));
            expect(crypto_js_1.default.AES.encrypt).toHaveBeenCalledWith(accessToken, expect.any(String));
            expect(crypto_js_1.default.AES.encrypt).toHaveBeenCalledWith(refreshToken, expect.any(String));
        });
        it('should get access token', () => {
            const mockToken = 'test-token';
            const mockEncrypted = 'encrypted-token';
            localStorage.setItem('token', mockEncrypted);
            crypto_js_1.default.AES.decrypt.mockReturnValue({
                toString: () => mockToken,
            });
            const token = security_1.securityService.getAccessToken();
            expect(token).toBe(mockToken);
        });
        it('should clear tokens', () => {
            security_1.securityService.clearTokens();
            expect(localStorage.removeItem).toHaveBeenCalledTimes(4);
        });
        it('should check token expiry', () => {
            const futureTime = Date.now() + 3600000;
            localStorage.setItem('token_expiry', futureTime.toString());
            expect(security_1.securityService.isTokenExpired()).toBeFalsy();
            const pastTime = Date.now() - 3600000;
            localStorage.setItem('token_expiry', pastTime.toString());
            expect(security_1.securityService.isTokenExpired()).toBeTruthy();
        });
    });
    describe('CSRF Protection', () => {
        it('should generate CSRF token', () => {
            const token = security_1.securityService.generateCSRFToken();
            expect(token).toBeDefined();
            expect(localStorage.setItem).toHaveBeenCalledWith('csrf_token', token);
        });
        it('should get CSRF token', () => {
            const mockToken = 'test-csrf-token';
            localStorage.setItem('csrf_token', mockToken);
            expect(security_1.securityService.getCSRFToken()).toBe(mockToken);
        });
    });
    describe('Rate Limiting', () => {
        it('should not rate limit new endpoints', () => {
            expect(security_1.securityService.isRateLimited('/api/test')).toBeFalsy();
        });
        it('should rate limit after threshold', () => {
            const endpoint = '/api/test';
            const now = Date.now();
            // Simulate 100 requests
            for (let i = 0; i < 100; i++) {
                security_1.securityService.isRateLimited(endpoint);
            }
            expect(security_1.securityService.isRateLimited(endpoint)).toBeTruthy();
        });
        it('should reset rate limit after time window', () => {
            const endpoint = '/api/test';
            const oldTime = Date.now() - 61000; // Just over 1 minute ago
            // Set old rate limit data
            localStorage.setItem('rate_limit', JSON.stringify({
                [endpoint]: Array(100).fill(oldTime),
            }));
            expect(security_1.securityService.isRateLimited(endpoint)).toBeFalsy();
        });
    });
    describe('Encryption', () => {
        it('should encrypt and decrypt data', () => {
            const testData = 'sensitive-data';
            const mockEncrypted = 'encrypted-data';
            const mockDecrypted = 'decrypted-data';
            crypto_js_1.default.AES.encrypt.mockReturnValue(mockEncrypted);
            crypto_js_1.default.AES.decrypt.mockReturnValue({
                toString: () => mockDecrypted,
            });
            security_1.securityService.setTokens(testData, testData, 3600);
            const result = security_1.securityService.getAccessToken();
            expect(result).toBe(mockDecrypted);
        });
        it('should handle decryption errors', () => {
            const mockEncrypted = 'invalid-encrypted-data';
            localStorage.setItem('token', mockEncrypted);
            crypto_js_1.default.AES.decrypt.mockImplementation(() => {
                throw new Error('Decryption failed');
            });
            const result = security_1.securityService.getAccessToken();
            expect(result).toBeNull();
        });
    });
    describe('Token Refresh', () => {
        beforeEach(() => {
            global.fetch = jest.fn();
        });
        it('should refresh token successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
                expiresIn: 3600,
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });
            const result = yield security_1.securityService.refreshToken();
            expect(result).toBeTruthy();
            expect(crypto_js_1.default.AES.encrypt).toHaveBeenCalledWith(mockResponse.accessToken, expect.any(String));
        }));
        it('should handle refresh failure', () => __awaiter(void 0, void 0, void 0, function* () {
            global.fetch.mockResolvedValueOnce({
                ok: false,
            });
            const result = yield security_1.securityService.refreshToken();
            expect(result).toBeFalsy();
            expect(localStorage.removeItem).toHaveBeenCalled();
        }));
    });
    describe('Input Sanitization', () => {
        it('should sanitize input', () => {
            const input = '<script>alert("xss")</script>';
            const sanitized = security_1.securityService.sanitizeInput(input);
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).not.toContain('javascript:');
        });
        it('should escape HTML', () => {
            const input = '<div>test</div>';
            const escaped = security_1.securityService.escapeHtml(input);
            expect(escaped).toBe('&lt;div&gt;test&lt;/div&gt;');
        });
    });
});
