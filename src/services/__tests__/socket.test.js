"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const socket_1 = require("../socket");
// Mock socket.io-client
jest.mock('socket.io-client', () => {
    const mockSocket = {
        on: jest.fn(),
        off: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        connected: false,
    };
    return {
        io: jest.fn(() => mockSocket),
    };
});
describe('SocketService', () => {
    let mockSocket;
    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        localStorage.clear();
        // Get the mock socket instance
        mockSocket = socket_io_client_1.io();
        mockSocket.connected = false;
    });
    describe('Connection Management', () => {
        it('should not connect without a token', () => {
            socket_1.socketService.connect();
            expect(socket_io_client_1.io).not.toHaveBeenCalled();
        });
        it('should connect with a valid token', () => {
            localStorage.setItem('token', 'test-token');
            socket_1.socketService.connect();
            expect(socket_io_client_1.io).toHaveBeenCalledWith('wss://server-d421.onrender.com', expect.any(Object));
        });
        it('should not reconnect if already connected', () => {
            localStorage.setItem('token', 'test-token');
            mockSocket.connected = true;
            socket_1.socketService.connect();
            expect(socket_io_client_1.io).toHaveBeenCalledTimes(1);
        });
        it('should disconnect properly', () => {
            localStorage.setItem('token', 'test-token');
            socket_1.socketService.connect();
            socket_1.socketService.disconnect();
            expect(mockSocket.disconnect).toHaveBeenCalled();
        });
    });
    describe('Event Handling', () => {
        beforeEach(() => {
            localStorage.setItem('token', 'test-token');
            socket_1.socketService.connect();
        });
        it('should register event listeners', () => {
            const callback = jest.fn();
            socket_1.socketService.on('test:event', callback);
            expect(mockSocket.on).toHaveBeenCalledWith('test:event', callback);
        });
        it('should remove event listeners', () => {
            const callback = jest.fn();
            socket_1.socketService.on('test:event', callback);
            socket_1.socketService.off('test:event', callback);
            expect(mockSocket.off).toHaveBeenCalledWith('test:event', callback);
        });
        it('should handle connection events', () => {
            const connectCallback = jest.fn();
            socket_1.socketService.on('connect', connectCallback);
            // Simulate connect event
            const connectCall = mockSocket.on.mock.calls.find(call => call[0] === 'connect');
            expect(connectCall).toBeDefined();
            connectCall[1]();
            expect(connectCallback).toHaveBeenCalled();
        });
        it('should handle connection errors', () => {
            const errorCallback = jest.fn();
            socket_1.socketService.on('connection:failed', errorCallback);
            // Simulate multiple connection errors
            const errorCall = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error');
            expect(errorCall).toBeDefined();
            for (let i = 0; i < 5; i++) {
                errorCall[1](new Error('Connection failed'));
            }
            expect(errorCallback).toHaveBeenCalledWith({
                error: 'Failed to connect to server',
                attempts: 5,
            });
        });
    });
    describe('Error Handling', () => {
        beforeEach(() => {
            localStorage.setItem('token', 'test-token');
            socket_1.socketService.connect();
        });
        it('should handle socket errors', () => {
            const errorCallback = jest.fn();
            socket_1.socketService.on('error', errorCallback);
            const errorCall = mockSocket.on.mock.calls.find(call => call[0] === 'error');
            expect(errorCall).toBeDefined();
            const testError = new Error('Test error');
            errorCall[1](testError);
            expect(errorCallback).toHaveBeenCalledWith(testError);
        });
        it('should handle listener errors gracefully', () => {
            const errorCallback = jest.fn();
            const throwingCallback = jest.fn().mockImplementation(() => {
                throw new Error('Listener error');
            });
            socket_1.socketService.on('test:event', throwingCallback);
            socket_1.socketService.on('error', errorCallback);
            const eventCall = mockSocket.on.mock.calls.find(call => call[0] === 'test:event');
            expect(eventCall).toBeDefined();
            eventCall[1]({ data: 'test' });
            expect(errorCallback).toHaveBeenCalled();
        });
    });
    describe('Reconnection Logic', () => {
        beforeEach(() => {
            localStorage.setItem('token', 'test-token');
            socket_1.socketService.connect();
        });
        it('should attempt reconnection on connection error', () => {
            const errorCall = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error');
            expect(errorCall).toBeDefined();
            errorCall[1](new Error('Connection failed'));
            expect(mockSocket.connect).toHaveBeenCalled();
        });
        it('should stop reconnection attempts after max retries', () => {
            const errorCallback = jest.fn();
            socket_1.socketService.on('connection:failed', errorCallback);
            const errorCall = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error');
            expect(errorCall).toBeDefined();
            for (let i = 0; i < 6; i++) {
                errorCall[1](new Error('Connection failed'));
            }
            expect(errorCallback).toHaveBeenCalled();
            expect(mockSocket.connect).toHaveBeenCalledTimes(5);
        });
    });
});
