import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { useAuthStore } from '../store/auth';
import { userAPI } from '../services/api';

const TELEGRAM_BOT_USERNAME = 'alphawolftesting_bot';

const Friends = () => {
  const { friends, fetchUserData, isLoading } = useStore();
  const { user } = useAuthStore();
  const [referralCode, setReferralCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
      // Generate or fetch referral code
      setReferralCode(user.referral_code || user.id?.slice(0, 8) || '');
    }
  }, [user, fetchUserData]);

  const referralLink = referralCode
    ? `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${referralCode}`
    : '';

  const handleCopyLink = async () => {
    if (referralLink) {
      try {
        await navigator.clipboard.writeText(referralLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const handleShareLink = () => {
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(referralLink);
    } else if (referralLink) {
      window.open(referralLink, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="py-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffd700]"></div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-[#ffd700] mb-2">Friends & Referrals</h2>
        <p className="text-3xl font-bold">{friends.length} Friends</p>
        <p className="text-sm text-gray-400 mt-1">Earn rewards for each friend who joins</p>
      </div>

      <div className="card p-4 mb-6">
        <h3 className="text-lg font-bold mb-3">Your Referral Link</h3>
        <div className="flex items-center justify-between bg-gray-800 p-3 rounded mb-3">
          <span className="text-xs font-mono break-all flex-1 mr-2">
            {referralLink || 'Generating referral code...'}
          </span>
          {referralLink && (
            <motion.button
              className="text-[#ffd700] hover:text-white transition-colors p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopyLink}
            >
              {copySuccess ? '✓' : '📋'}
            </motion.button>
          )}
        </div>
        
        {referralLink && (
          <div className="flex gap-2">
            <motion.button
              className="flex-1 bg-[#229ED9] text-white py-2 px-4 rounded-lg font-bold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShareLink}
            >
              Share in Telegram
            </motion.button>
            <motion.button
              className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg font-bold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopyLink}
            >
              {copySuccess ? 'Copied!' : 'Copy Link'}
            </motion.button>
          </div>
        )}
        
        <p className="text-sm text-gray-400 mt-3">
          Share this link with friends to earn 100 coins for each referral
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Your Friends</h3>
        {friends.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-gray-400 mb-4">You have no friends yet</p>
            <p className="text-sm text-gray-500">Invite friends to start earning referral bonuses!</p>
          </div>
        ) : (
          friends.map((friend, index) => (
            <motion.div
              key={friend.id}
              className="card p-4 flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#ffd700] rounded-full flex items-center justify-center text-black font-bold mr-3">
                  {friend.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-bold">{friend.username || 'Anonymous'}</p>
                  <p className="text-sm text-gray-400">
                    Level: {friend.level} • Joined: {new Date(friend.joinedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#ffd700] font-bold">{friend.balance || 0} coins</p>
                <p className="text-xs text-gray-400">+100 bonus earned</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Friends; 