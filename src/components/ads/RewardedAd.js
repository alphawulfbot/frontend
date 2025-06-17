"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.RewardedAd = void 0;
const react_1 = __importStar(require("react"));
const api_1 = require("../../services/api");
const UserContext_1 = require("../../contexts/UserContext");
const RewardedAd = ({ onReward, onError }) => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const { refreshUser } = (0, UserContext_1.useUser)();
    const showAd = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setLoading(true);
            setError(null);
            const response = yield api_1.adsAPI.getAd('rewarded');
            const ad = response.data;
            if (!ad) {
                throw new Error('No ad available');
            }
            // Create and show rewarded ad
            const rewarded = new window.google.ads.AdManager.RewardedAd({
                adUnitId: ad.adUnitId,
                publisherId: ad.publisherId,
            });
            return new Promise((resolve, reject) => {
                rewarded.onRewarded = (reward) => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        // Process reward on server
                        yield api_1.adsAPI.processReward(ad.id);
                        // Refresh user data
                        yield refreshUser();
                        // Notify parent component
                        onReward === null || onReward === void 0 ? void 0 : onReward(reward);
                        resolve(reward);
                    }
                    catch (err) {
                        reject(err);
                    }
                });
                rewarded.onError = (err) => {
                    const errorMessage = err.message || 'Failed to show rewarded ad';
                    setError(errorMessage);
                    onError === null || onError === void 0 ? void 0 : onError(errorMessage);
                    reject(err);
                };
                rewarded.load();
                rewarded.show();
            });
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load ad';
            setError(errorMessage);
            onError === null || onError === void 0 ? void 0 : onError(errorMessage);
            console.error('Error showing rewarded ad:', err);
            throw err;
        }
        finally {
            setLoading(false);
        }
    });
    if (loading) {
        return <div className="ad-loading">Loading rewarded ad...</div>;
    }
    if (error) {
        return (<div className="ad-error">
        <p>{error}</p>
        <button onClick={() => setError(null)} className="retry-button">
          Retry
        </button>
      </div>);
    }
    return (<button onClick={showAd} disabled={loading} className="rewarded-ad-button">
      {loading ? 'Loading...' : 'Watch Ad for Reward'}
    </button>);
};
exports.RewardedAd = RewardedAd;
