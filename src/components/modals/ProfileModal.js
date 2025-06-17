"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const framer_motion_1 = require("framer-motion");
const store_1 = require("../../store");
const ProfileModal = ({ onClose }) => {
    const { username, coinBalance, level } = (0, store_1.useStore)();
    return (<framer_motion_1.AnimatePresence>
      <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <framer_motion_1.motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Profile</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Username:</span>
              <span className="text-[#ffd700]">{username}</span>
            </div>
            <div className="flex justify-between">
              <span>Level:</span>
              <span className="text-[#ffd700]">{level}</span>
            </div>
            <div className="flex justify-between">
              <span>Coins:</span>
              <span className="text-[#ffd700]">{coinBalance}</span>
            </div>
          </div>
        </framer_motion_1.motion.div>
      </framer_motion_1.motion.div>
    </framer_motion_1.AnimatePresence>);
};
exports.default = ProfileModal;
