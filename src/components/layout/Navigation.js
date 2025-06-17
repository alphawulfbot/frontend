"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const framer_motion_1 = require("framer-motion");
const Navigation = () => {
    const location = (0, react_router_dom_1.useLocation)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const navItems = [
        { path: '/', icon: 'home', label: 'Home' },
        { path: '/earn', icon: 'tasks', label: 'Earn' },
        { path: '/wallet', icon: 'wallet', label: 'Wallet' },
        { path: '/friends', icon: 'user-friends', label: 'Friends' },
        { path: '/games', icon: 'gamepad', label: 'Games' }
    ];
    return (<nav className="fixed bottom-0 left-0 w-full bg-[#1f1f1f] border-t-2 border-[#8b7500] z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between">
          {navItems.map((item) => (<framer_motion_1.motion.button key={item.path} onClick={() => navigate(item.path)} className={`nav-btn py-2 px-4 rounded-lg flex flex-col items-center ${location.pathname === item.path ? 'active' : ''}`} whileTap={{ scale: 0.95 }}>
              <i className={`fas fa-${item.icon} text-xl`}></i>
              <span className="text-xs mt-1">{item.label}</span>
            </framer_motion_1.motion.button>))}
        </div>
      </div>
    </nav>);
};
exports.default = Navigation;
