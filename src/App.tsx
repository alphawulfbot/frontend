import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Earn from './pages/Earn';
import Wallet from './pages/Wallet';
import Friends from './pages/Friends';
import Games from './pages/Games';
import { useStore } from './store';
import { useAuthStore } from './store/auth';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        expand?: () => void;
      };
    };
  }
}

function App() {
  const initTelegramWebApp = useStore((state) => state.initTelegramWebApp);
  const { isAuthenticated, login, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      if (window.Telegram.WebApp.expand) {
        window.Telegram.WebApp.expand();
      }
      initTelegramWebApp();
    }
  }, [initTelegramWebApp]);

  useEffect(() => {
    // Auto-login with Telegram if not authenticated
    if (
      !isAuthenticated &&
      window.Telegram?.WebApp?.initData &&
      window.Telegram.WebApp.initData !== ''
    ) {
      login(window.Telegram.WebApp.initData);
    }
  }, [isAuthenticated, login]);

  if (!isAuthenticated || isLoading) {
    // Show a loading spinner or message while logging in
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