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
exports.BannerAd = void 0;
const react_1 = __importStar(require("react"));
const api_1 = require("../../services/api");
const UserContext_1 = require("../../contexts/UserContext");
const BannerAd = ({ containerId, onError }) => {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const { refreshUser } = (0, UserContext_1.useUser)();
    (0, react_1.useEffect)(() => {
        loadAd();
    }, []);
    const loadAd = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setLoading(true);
            setError(null);
            const response = yield api_1.adsAPI.getAd('banner');
            const ad = response.data;
            if (!ad) {
                setError('No ad available');
                onError === null || onError === void 0 ? void 0 : onError('No ad available');
                return;
            }
            const adContainer = document.getElementById(containerId);
            if (!adContainer) {
                throw new Error('Ad container not found');
            }
            const adElement = document.createElement('ins');
            adElement.className = 'adsbygoogle';
            adElement.style.display = 'block';
            adElement.setAttribute('data-ad-client', ad.publisherId);
            adElement.setAttribute('data-ad-slot', ad.adUnitId);
            adElement.setAttribute('data-ad-format', 'auto');
            adElement.setAttribute('data-full-width-responsive', 'true');
            adContainer.appendChild(adElement);
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            // Record ad impression
            yield api_1.adsAPI.recordClick(ad.id);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load ad';
            setError(errorMessage);
            onError === null || onError === void 0 ? void 0 : onError(errorMessage);
            console.error('Error loading banner ad:', err);
        }
        finally {
            setLoading(false);
        }
    });
    const handleClick = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield api_1.adsAPI.getAd('banner');
            const ad = response.data;
            if (ad) {
                yield api_1.adsAPI.recordClick(ad.id);
                yield refreshUser(); // Refresh user data after ad interaction
            }
        }
        catch (err) {
            console.error('Error recording ad click:', err);
        }
    });
    if (loading) {
        return <div className="ad-loading">Loading ad...</div>;
    }
    if (error) {
        return <div className="ad-error">{error}</div>;
    }
    return (<div id={containerId} className="banner-ad-container" onClick={handleClick}/>);
};
exports.BannerAd = BannerAd;
