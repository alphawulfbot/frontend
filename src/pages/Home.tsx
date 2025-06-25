import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useAuthStore } from '../store/auth';
import LevelProgress from '../components/LevelProgress';
import DailyBonus from '../components/DailyBonus';

const Home = () => {
  const { 
    coinBalance, 
    tapsRemaining, 
    tapRefreshTime,
    level,
    levelPoints,
    isLoading,
    error,
    tapCoin,
    resetTaps,
    fetchUserData
  } = useStore();

  const { user } = useAuthStore();
  const [floatingTexts, setFloatingTexts] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Fetch user data on component mount
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  // Handle tap refresh timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (tapRefreshTime) {
        const now = new Date().getTime();
        const refreshTime = new Date(tapRefreshTime).getTime();
        if (now >= refreshTime) {
          resetTaps();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [tapRefreshTime, resetTaps]);

  const handleCoinTap = async (e: React.MouseEvent) => {
    if (tapsRemaining <= 0 || isLoading) return;

    // Add floating text animation
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    
    const textId = Date.now();
    setFloatingTexts(prev => [
      ...prev,
      { id: textId, x, y }
    ]);

    // Call the tap coin function which handles API calls
    await tapCoin();

    // Remove floating text after animation
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(text => text.id !== textId));
    }, 1000);
  };

  const formatTimeRemaining = () => {
    if (!tapRefreshTime) return '00:00:00';
    
    const now = new Date().getTime();
    const refreshTime = new Date(tapRefreshTime).getTime();
    const timeLeft = Math.max(0, refreshTime - now);
    
    const hours = Math.floor(timeLeft / 3600000);
    const minutes = Math.floor((timeLeft % 3600000) / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading && coinBalance === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffd700] mb-4"></div>
        <p>Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <LevelProgress />
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 max-w-sm">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h2 className="text-xl mb-2">Tap the coin to earn</h2>
        <p className="text-sm text-gray-400">
          Taps remaining: {tapsRemaining}/100
        </p>
        {tapsRemaining === 0 && (
          <div className="text-center text-sm text-gray-400 mt-2">
            Refreshes in: {formatTimeRemaining()}
          </div>
        )}
      </div>
      
      <motion.div
        className={`coin w-[150px] h-[150px] bg-[#ffd700] rounded-full cursor-pointer shadow-[0_0_20px_#8b7500] flex items-center justify-center font-bold text-black select-none ${
          tapsRemaining <= 0 || isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        whileHover={tapsRemaining > 0 && !isLoading ? { scale: 1.05 } : {}}
        whileTap={tapsRemaining > 0 && !isLoading ? { scale: 0.95 } : {}}
        onClick={handleCoinTap}
        style={{
          backgroundImage: 'linear-gradient(145deg, #ffd700, #8b7500)'
        }}
      >
        <span>+5</span>
      </motion.div>
      
      <div className="text-center mt-4">
        <p className="text-lg">
          Your balance: <span className="text-[#ffd700] font-bold">{coinBalance}</span> coins
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Level: {level} ({levelPoints} points)
        </p>
      </div>

      <DailyBonus />

      <AnimatePresence>
        {floatingTexts.map(text => (
          <motion.div
            key={text.id}
            className="absolute text-[#ffd700] font-bold z-10 pointer-events-none"
            initial={{ y: text.y, x: text.x, opacity: 1 }}
            animate={{ y: text.y - 60, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            +5
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Home; 