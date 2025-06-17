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
exports.TelegramLogin = void 0;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const auth_1 = require("@/store/auth");
const TelegramLogin = () => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { login, isAuthenticated } = (0, auth_1.useAuthStore)();
    (0, react_1.useEffect)(() => {
        const initTelegramWebApp = () => {
            var _a;
            if ((_a = window.Telegram) === null || _a === void 0 ? void 0 : _a.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
            }
        };
        initTelegramWebApp();
    }, []);
    (0, react_1.useEffect)(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);
    const handleLogin = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        if (!((_c = (_b = (_a = window.Telegram) === null || _a === void 0 ? void 0 : _a.WebApp) === null || _b === void 0 ? void 0 : _b.initDataUnsafe) === null || _c === void 0 ? void 0 : _c.user)) {
            console.error('Telegram WebApp not initialized');
            return;
        }
        try {
            yield login(window.Telegram.WebApp.initData);
        }
        catch (error) {
            console.error('Login failed:', error);
        }
    });
    return (<div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to Coin Tap</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please login with your Telegram account to continue
          </p>
        </div>
        <button onClick={handleLogin} className="group relative flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Login with Telegram
        </button>
      </div>
    </div>);
};
exports.TelegramLogin = TelegramLogin;
