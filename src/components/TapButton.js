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
exports.TapButton = void 0;
const react_1 = require("react");
const coins_1 = require("../store/coins");
const framer_motion_1 = require("framer-motion");
const TapButton = () => {
    const { tap, balance, isLoading } = (0, coins_1.useCoinsStore)();
    const [isTapping, setIsTapping] = (0, react_1.useState)(false);
    const handleTap = () => __awaiter(void 0, void 0, void 0, function* () {
        if (isLoading || isTapping || !balance || balance.tapsRemaining <= 0) {
            return;
        }
        setIsTapping(true);
        yield tap();
        setIsTapping(false);
    });
    return (<framer_motion_1.motion.button whileTap={{ scale: 0.95 }} onClick={handleTap} disabled={isLoading || isTapping || !balance || balance.tapsRemaining <= 0} className={`
        relative w-32 h-32 rounded-full
        ${isLoading || isTapping || !balance || balance.tapsRemaining <= 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'}
        flex items-center justify-center
        shadow-lg transition-colors duration-200
      `}>
      <div className="text-white text-center">
        <p className="text-2xl font-bold">TAP</p>
        {balance && (<p className="text-sm">
            {balance.tapsRemaining} taps left
          </p>)}
      </div>
      {isLoading && (<div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>)}
    </framer_motion_1.motion.button>);
};
exports.TapButton = TapButton;
