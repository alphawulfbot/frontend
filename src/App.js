"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const react_1 = require("react");
const MainLayout_1 = __importDefault(require("./components/layout/MainLayout"));
const Home_1 = __importDefault(require("./pages/Home"));
const Earn_1 = __importDefault(require("./pages/Earn"));
const Wallet_1 = __importDefault(require("./pages/Wallet"));
const Friends_1 = __importDefault(require("./pages/Friends"));
const Games_1 = __importDefault(require("./pages/Games"));
const store_1 = require("./store");
function App() {
    const initTelegramWebApp = (0, store_1.useStore)((state) => state.initTelegramWebApp);
    (0, react_1.useEffect)(() => {
        var _a;
        // Initialize Telegram WebApp
        if ((_a = window.Telegram) === null || _a === void 0 ? void 0 : _a.WebApp) {
            window.Telegram.WebApp.ready();
            initTelegramWebApp();
        }
    }, [initTelegramWebApp]);
    return (<react_router_dom_1.BrowserRouter>
      <MainLayout_1.default>
        <react_router_dom_1.Routes>
          <react_router_dom_1.Route path="/" element={<Home_1.default />}/>
          <react_router_dom_1.Route path="/earn" element={<Earn_1.default />}/>
          <react_router_dom_1.Route path="/wallet" element={<Wallet_1.default />}/>
          <react_router_dom_1.Route path="/friends" element={<Friends_1.default />}/>
          <react_router_dom_1.Route path="/games" element={<Games_1.default />}/>
        </react_router_dom_1.Routes>
      </MainLayout_1.default>
    </react_router_dom_1.BrowserRouter>);
}
exports.default = App;
