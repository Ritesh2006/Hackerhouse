import { useState, useEffect } from 'react';
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
import { AnimatePresence, motion } from 'framer-motion';
import GitHubCallback from './pages/GitHubCallback';
import LinkedInCallback from './pages/LinkedInCallback';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <BrowserRouter>
      <AnimatePresence>{loading && <LoadingScreen key="loader" />}</AnimatePresence>
      {!loading && <AppInner />}
    </BrowserRouter>
  );
}

export default App;
