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
const react_1 = __importStar(require("react"));
const api_1 = require("../../services/api");
const InterstitialAd = ({ onClose, onAdClick }) => {
    const [ad, setAd] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    const [countdown, setCountdown] = (0, react_1.useState)(5);
    (0, react_1.useEffect)(() => {
        loadAd();
    }, []);
    (0, react_1.useEffect)(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);
    const loadAd = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setLoading(true);
            const response = yield api_1.adsAPI.getAd('interstitial');
            setAd(response.data);
        }
        catch (err) {
            setError('Failed to load ad');
            console.error('Error loading interstitial ad:', err);
        }
        finally {
            setLoading(false);
        }
    });
    const handleClick = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!ad)
            return;
        try {
            yield api_1.adsAPI.recordClick(ad.adId);
            onAdClick === null || onAdClick === void 0 ? void 0 : onAdClick();
        }
        catch (err) {
            console.error('Error recording ad click:', err);
        }
    });
    if (loading) {
        return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-center">Loading ad...</p>
        </div>
      </div>);
    }
    if (error) {
        return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <p className="text-red-500">{error}</p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>
            Close
          </button>
        </div>
      </div>);
    }
    if (!ad) {
        return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <p>No ad available</p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>
            Close
          </button>
        </div>
      </div>);
    }
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{ad.title}</h2>
          {countdown > 0 ? (<span className="text-gray-500">Skip in {countdown}s</span>) : (<button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
              Skip
            </button>)}
        </div>
        <div className="mb-4 cursor-pointer" onClick={handleClick}>
          <img src={ad.content} alt={ad.title} className="w-full h-64 object-cover rounded"/>
        </div>
        <p className="text-sm text-gray-500 text-center">
          Advertisement
        </p>
      </div>
    </div>);
};
exports.default = InterstitialAd;
