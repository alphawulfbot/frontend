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
    <div className="flex min-h-screen items-center justify-center bg-background text-text flex-col">
      <span className="text-xl font-bold mb-4">Login with Telegram to continue</span>
      <a
        href={TELEGRAM_BOT_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 bg-[#229ED9] text-white rounded-lg text-lg font-bold hover:bg-[#176b8a] transition-colors"
      >
        Open Telegram Bot
      </a>
      <p className="mt-4 text-gray-400">If you don't have Telegram, download it and start the bot to use Alpha Wulf.</p>
    </div>
  );
}

function App() {
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const initTelegramWebApp = useStore((state) => state.initTelegramWebApp);
  const { isAuthenticated, login, isLoading } = useAuthStore();

  useEffect(() => {
    setIsTelegram(!!window.Telegram?.WebApp);
  }, []);

  useEffect(() => {
    if (isTelegram && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      if (window.Telegram.WebApp.expand) {
        window.Telegram.WebApp.expand();
      }
      initTelegramWebApp();
    }
  }, [isTelegram, initTelegramWebApp]);

  useEffect(() => {
    if (
      isTelegram &&
      !isAuthenticated &&
      window.Telegram?.WebApp?.initData &&
      window.Telegram.WebApp.initData !== ''
    ) {
      login(window.Telegram.WebApp.initData);
    }
  }, [isTelegram, isAuthenticated, login]);

  if (isTelegram === null) {
    // Still checking
    return null;
  }

  if (!isTelegram) {
    // Not in Telegram: show login page with Telegram bot link
    return <TelegramLoginPage />;
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text">
        <span className="text-xl font-bold">Logging in with Telegram...</span>
      </div>
    );
  }

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