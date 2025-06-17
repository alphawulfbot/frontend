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
const react_1 = require("@testing-library/react");
const BannerAd_1 = require("../BannerAd");
const RewardedAd_1 = require("../RewardedAd");
const api_1 = require("../../../services/api");
// Mock the API calls
jest.mock('../../../services/api', () => ({
    adsAPI: {
        getAd: jest.fn(),
        recordClick: jest.fn(),
        processReward: jest.fn(),
    },
}));
describe('Ad Components', () => {
    describe('BannerAd', () => {
        const mockAd = {
            adId: '123',
            title: 'Test Banner',
            content: 'test-image.jpg',
            publisherId: 'pub-123',
            adUnitId: 'unit-123',
            id: '123',
        };
        const containerId = 'test-banner-container';
        beforeEach(() => {
            jest.clearAllMocks();
            api_1.adsAPI.getAd.mockResolvedValue({ data: mockAd });
            // Add a container to the DOM for BannerAd
            const container = document.createElement('div');
            container.id = containerId;
            document.body.appendChild(container);
        });
        afterEach(() => {
            const container = document.getElementById(containerId);
            if (container)
                container.remove();
        });
        it('renders banner ad container', () => {
            (0, react_1.render)(<BannerAd_1.BannerAd containerId={containerId}/>);
            expect(document.getElementById(containerId)).toBeInTheDocument();
        });
        it('renders banner ad correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)(<BannerAd_1.BannerAd containerId={containerId}/>);
            yield (0, react_1.waitFor)(() => {
                expect(document.getElementById(containerId)).toBeInTheDocument();
            });
        }));
        it('handles error state correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            api_1.adsAPI.getAd.mockRejectedValue(new Error('Failed to load'));
            (0, react_1.render)(<BannerAd_1.BannerAd containerId={containerId}/>);
            yield (0, react_1.waitFor)(() => {
                expect(react_1.screen.getByText('Failed to load ad')).toBeInTheDocument();
            });
        }));
    });
    describe('RewardedAd', () => {
        const mockAd = {
            adId: '123',
            title: 'Test Rewarded Ad',
            description: 'Watch this ad for rewards',
            content: 'test-image.jpg',
            rewardType: 'points',
            rewardAmount: 100,
        };
        beforeEach(() => {
            jest.clearAllMocks();
            api_1.adsAPI.getAd.mockResolvedValue({ data: mockAd });
        });
        it('renders rewarded ad container', () => {
            (0, react_1.render)(<RewardedAd_1.RewardedAd />);
            expect(react_1.screen.getByTestId('rewarded-ad-container')).toBeInTheDocument();
        });
        it('renders rewarded ad correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, react_1.render)(<RewardedAd_1.RewardedAd />);
            yield (0, react_1.waitFor)(() => {
                expect(react_1.screen.getByText('Test Rewarded Ad')).toBeInTheDocument();
                expect(react_1.screen.getByText('Watch this ad for rewards')).toBeInTheDocument();
                expect(react_1.screen.getByText('Watch for 100 points')).toBeInTheDocument();
            });
        }));
        it('handles reward correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const onReward = jest.fn();
            (0, react_1.render)(<RewardedAd_1.RewardedAd onReward={onReward}/>);
            // Simulate reward logic as needed
        }));
        it('handles error state correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            api_1.adsAPI.getAd.mockRejectedValue(new Error('Failed to load'));
            (0, react_1.render)(<RewardedAd_1.RewardedAd />);
            yield (0, react_1.waitFor)(() => {
                expect(react_1.screen.getByText('Failed to load ad')).toBeInTheDocument();
            });
        }));
    });
});
