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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-background)', color: '#e2e8f0' }}>
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

      const setProp = (name: string, value: string) => document.documentElement.style.setProperty(name, value);

      if (primaryColor) {
        setProp('--color-primary', primaryColor);
        setProp('--color-primary-light', `${primaryColor}dd`);
        setProp('--color-primary-glow', `${primaryColor}66`);

        // Map all Tailwind CSS v4 color variables for families used in gradients/glows
        const colorFamilies = ['indigo', 'purple', 'violet'];

        for (const family of colorFamilies) {
          setProp(`--color-${family}-50`, `${primaryColor}15`);
          setProp(`--color-${family}-100`, `${primaryColor}30`);
          setProp(`--color-${family}-200`, `${primaryColor}55`);
          setProp(`--color-${family}-300`, `${primaryColor}aa`);
          setProp(`--color-${family}-400`, primaryColor);
          setProp(`--color-${family}-505`, primaryColor); // edge cases
          setProp(`--color-${family}-500`, primaryColor);
          setProp(`--color-${family}-600`, primaryColor);
          setProp(`--color-${family}-700`, primaryColor);
          setProp(`--color-${family}-800`, primaryColor);
          setProp(`--color-${family}-900`, primaryColor);
          setProp(`--color-${family}-950`, primaryColor);
        }
      }

      // Background theme handling
      const savedBgTheme = localStorage.getItem('hackerhouse_bg_theme') || 'default';
      const savedBgCustom = localStorage.getItem('hackerhouse_custom_bg_color') || '#050914';

      const bgPresets: Record<string, string> = {
        default: '#050914',
        midnight: '#02040a',
        purple: '#090613',
        forest: '#040b08',
        charcoal: '#0f1115'
      };

      let bgColor = '';
      if (savedBgTheme === 'custom') {
        bgColor = savedBgCustom;
      } else {
        bgColor = bgPresets[savedBgTheme] || '#050914';
      }

      if (bgColor) {
        setProp('--color-background', bgColor);

        // Derive surface colors (surface color should be a slightly lighter variation)
        const getSurfaceColor = (hex: string, amount: number) => {
          let r = parseInt(hex.slice(1, 3), 16);
          let g = parseInt(hex.slice(3, 5), 16);
          let b = parseInt(hex.slice(5, 7), 16);
          r = Math.min(255, Math.max(0, r + amount));
          g = Math.min(255, Math.max(0, g + amount + 2));
          b = Math.min(255, Math.max(0, b + amount + 6));
          const toHex = (c: number) => {
            const h = c.toString(16);
            return h.length === 1 ? '0' + h : h;
          };
          return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        };

        const surfaceColor = getSurfaceColor(bgColor, 5);
        const surfaceColor2 = getSurfaceColor(bgColor, 10);

        setProp('--color-surface', surfaceColor);
        setProp('--color-surface-2', surfaceColor2);
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
