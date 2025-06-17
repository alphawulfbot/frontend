"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("../store");
const LevelProgress = () => {
    const { level } = (0, store_1.useStore)();
    const maxPoints = level * 100;
    const currentPoints = level * 50; // Example: halfway to next level
    const progress = (currentPoints / maxPoints) * 100;
    return (<div className="card p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm">
          Level: <span className="text-[#ffd700] font-bold">{level}</span>
        </span>
        <span className="text-sm">
          {currentPoints}/{maxPoints}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className="bg-[#ffd700] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}/>
      </div>
    </div>);
};
exports.default = LevelProgress;
