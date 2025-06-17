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
const socket_js_1 = require("../services/socket.js");
const socketEvents_js_1 = require("../services/socketEvents.js");
const testSocketConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Testing socket connection...');
        // Set up event listeners
        (0, socketEvents_js_1.setupSocketEvents)();
        // Test connection
        socket_js_1.socketService.connect();
        // Listen for connection events
        socket_js_1.socketService.on('connect', () => {
            console.log('✅ Socket connected successfully');
        });
        socket_js_1.socketService.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
        });
        socket_js_1.socketService.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });
        // Test event handling
        const testEvents = [
            {
                event: 'user:update',
                data: {
                    id: 'test-user',
                    username: 'Test User',
                    level: 1,
                    coinBalance: 1000,
                },
            },
            {
                event: 'user:levelUp',
                data: {
                    level: 2,
                    experience: 100,
                    experienceToNext: 200,
                    rewards: {
                        coins: 100,
                        items: ['item1', 'item2'],
                    },
                },
            },
            {
                event: 'user:achievement',
                data: {
                    id: 'achievement-1',
                    name: 'First Win',
                    description: 'Win your first game',
                    icon: '🏆',
                    unlockedAt: new Date().toISOString(),
                },
            },
            {
                event: 'coins:update',
                data: {
                    balance: 1100,
                    change: 100,
                    reason: 'game_win',
                    timestamp: new Date().toISOString(),
                },
            },
        ];
        // Wait for connection
        console.log('Waiting for connection...');
        yield new Promise((resolve) => setTimeout(resolve, 2000));
        // Test each event
        for (const testEvent of testEvents) {
            console.log(`Testing ${testEvent.event}...`);
            socket_js_1.socketService.on(testEvent.event, (data) => {
                console.log(`✅ Received ${testEvent.event}:`, data);
            });
        }
        // Clean up after 5 seconds
        setTimeout(() => {
            console.log('Cleaning up...');
            (0, socketEvents_js_1.cleanupSocketEvents)();
            socket_js_1.socketService.disconnect();
            console.log('Test completed');
            process.exit(0);
        }, 5000);
    }
    catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
});
// Run the test
testSocketConnection().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
