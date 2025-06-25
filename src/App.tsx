import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Earn from './pages/Earn';
import Wallet from './pages/Wallet';
import Friends from './pages/Friends';
import Games from './pages/Games';
import { useStore } from './store';
import { useAuthStore } from './store/auth';

const TELEGRAM_BOT_LINK = 'https://t.me/alphawolftesting_bot';

function TelegramLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white flex-col">
      <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md mx-4">
        <div className="text-6xl mb-6">🐺</div>
        <h1 className="text-3xl font-bold mb-4">Alpha Wulf</h1>
        <p className="text-lg mb-6 opacity-90">
          This app is only available through Telegram. Please open it in the Telegram app to continue.
        </p>
        <a
          href={TELEGRAM_BOT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 bg-[#229ED9] text-white rounded-full text-lg font-bold hover:bg-[#176b8a] transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Open in Telegram
        </a>
        <p className="mt-6 text-sm opacity-70">
          Don't have Telegram? Download it from your app store and search for @alphawolftesting_bot
        </p>
      </div>
    </div>
  );
}

function App() {
  const [checkedTelegram, setCheckedTelegram] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const initTelegramWebApp = useStore((state) => state.initTelegramWebApp);
  const { isAuthenticated, login, isLoading, error } = useAuthStore();

  // Check for Telegram WebApp on mount with more strict detection
  useEffect(() => {
    const checkTelegram = () => {
      // Multiple checks for Telegram environment
      const hasTelegramWebApp = !!window.Telegram?.WebApp;
      const hasTelegramInitData = !!window.Telegram?.WebApp?.initData;
      const userAgent = navigator.userAgent || '';
      const isTelegramUA = userAgent.includes('Telegram') || userAgent.includes('TelegramBot');
      
      // More strict detection - require either WebApp object with initData or Telegram user agent
      const isTg = hasTelegramWebApp && (hasTelegramInitData || isTelegramUA);
      
      console.log('Telegram detection:', {
        hasTelegramWebApp,
        hasTelegramInitData,
        isTelegramUA,
        userAgent,
        finalResult: isTg
      });
      
      setIsTelegram(isTg);
      setCheckedTelegram(true);
    };

    // Small delay to ensure Telegram WebApp is fully loaded
    setTimeout(checkTelegram, 100);
  }, []);

  // Initialize Telegram WebApp if present
  useEffect(() => {
    if (isTelegram && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready();
        if (window.Telegram.WebApp.expand) {
          window.Telegram.WebApp.expand();
        }
        // Set theme
        if (window.Telegram.WebApp.setHeaderColor) {
          window.Telegram.WebApp.setHeaderColor('#667eea');
        }
        initTelegramWebApp();
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      }
    }
  }, [isTelegram, initTelegramWebApp]);

  // Attempt auto-login if in Telegram and not authenticated
  useEffect(() => {
    if (
      isTelegram &&
      !isAuthenticated &&
      !isLoading &&
      window.Telegram?.WebApp?.initData &&
      window.Telegram.WebApp.initData !== ''
    ) {
      console.log('Attempting auto-login with Telegram data');
      login(window.Telegram.WebApp.initData);
    }
  }, [isTelegram, isAuthenticated, login, isLoading]);

  // While checking for Telegram, show loading
  if (!checkedTelegram) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🐺</div>
          <span className="text-xl font-bold">Loading Alpha Wulf...</span>
        </div>
      </div>
    );
  }

  // If not in Telegram, always show login page
  if (!isTelegram) {
    return <TelegramLoginPage />;
  }

  // If in Telegram but not authenticated, show loading or error
  if (!isAuthenticated) {
    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="text-center">
            <div className="text-4xl mb-4">🐺</div>
            <span className="text-xl font-bold mb-4 block">Connecting to Alpha Wulf...</span>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-600 to-purple-700 text-white">
          <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md mx-4">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-4">Authentication Error</h2>
            <p className="mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/20 text-white rounded-lg font-bold hover:bg-white/30 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    // Fallback loading state
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🐺</div>
          <span className="text-xl font-bold">Initializing...</span>
        </div>
      </div>
    );
  }

  // Only after Telegram and authentication, show main app
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/earn" element={<Earn />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/games" element={<Games />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App; 