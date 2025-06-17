"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const framer_motion_1 = require("framer-motion");
const ProfileModal_1 = __importDefault(require("../modals/ProfileModal"));
const SettingsModal_1 = __importDefault(require("../modals/SettingsModal"));
const Header = () => {
    const [showProfile, setShowProfile] = (0, react_1.useState)(false);
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    return (<header className="py-4 flex justify-between items-center">
      <div className="flex items-center">
        <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f43a.svg" alt="Wolf" className="w-10 h-10 mr-2"/>
        <h1 className="text-2xl font-bold text-[#ffd700]">Alpha Wulf</h1>
      </div>
      
      <div className="flex space-x-3">
        <button onClick={() => setShowProfile(true)} className="text-xl hover:text-[#ffd700] transition-colors">
          <i className="fas fa-user-circle"></i>
        </button>
        <button onClick={() => setShowSettings(true)} className="text-xl hover:text-[#ffd700] transition-colors">
          <i className="fas fa-cog"></i>
        </button>
      </div>

      <framer_motion_1.AnimatePresence>
        {showProfile && (<ProfileModal_1.default onClose={() => setShowProfile(false)}/>)}
        {showSettings && (<SettingsModal_1.default onClose={() => setShowSettings(false)}/>)}
      </framer_motion_1.AnimatePresence>
    </header>);
};
exports.default = Header;
