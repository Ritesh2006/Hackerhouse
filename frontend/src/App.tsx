import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import SearchResults from './pages/SearchResults';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LoadingScreen from './components/LoadingScreen';
import AIAgent from './components/AIAgent';
import ErrorBoundary from './components/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import GitHubCallback from './pages/GitHubCallback';
import LinkedInCallback from './pages/LinkedInCallback';
import { useAuthStore } from './stores/authStore';

// Animated page wrapper
function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function AppInner() {
  const location = useLocation();
  const noFooterRoutes = ['/chat'];
  const showFooter = !noFooterRoutes.some(r => location.pathname.startsWith(r));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#050914', color: '#e2e8f0' }}>
      <Navbar />
      <main className="flex-1">
        <PageWrapper>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat/:contractId" element={<Chat />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/github-callback" element={<GitHubCallback />} />
            <Route path="/linkedin-callback" element={<LinkedInCallback />} />
          </Routes>
        </PageWrapper>
      </main>
      {showFooter && <Footer />}
      <AIAgent />
    </div>
  );
}

function App() {
  const { initialized, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const updateGlobalTheme = () => {
      const savedTheme = localStorage.getItem('hackerhouse_theme') || 'indigo';
      const savedCustom = localStorage.getItem('hackerhouse_custom_color') || '#6366f1';
      
      let primaryColor = '';
      if (savedTheme === 'custom') {
        primaryColor = savedCustom;
      } else {
        const themes: Record<string, string> = {
          indigo: '#6366f1',
          amber: '#f59e0b',
          emerald: '#10b981',
          pink: '#ec4899',
          cyan: '#06b6d4',
        };
        primaryColor = themes[savedTheme] || '#6366f1';
      }
      
      if (primaryColor) {
        document.documentElement.style.setProperty('--color-primary', primaryColor);
        document.documentElement.style.setProperty('--color-primary-glow', `${primaryColor}66`);
        document.documentElement.style.setProperty('--tw-color-indigo-400', primaryColor);
        document.documentElement.style.setProperty('--tw-color-indigo-500', primaryColor);
      }
    };

    updateGlobalTheme();
    window.addEventListener('hackerhouse_theme_changed', updateGlobalTheme);
    return () => window.removeEventListener('hackerhouse_theme_changed', updateGlobalTheme);
  }, []);

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppInner />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
