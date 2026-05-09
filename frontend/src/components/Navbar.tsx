import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, MessageCircle, User, Bell, Home, Menu, X, LogOut, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { finalBaseUrl } from '../lib/api';

export default function Navbar() {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Find Devs', icon: Search },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/chat/global', label: 'Chat', icon: MessageCircle },
  ];
  
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${finalBaseUrl}/health`);
        setIsBackendOnline(res.ok);
      } catch {
        setIsBackendOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(() => {
    let id = localStorage.getItem('user_id');
    return (id === 'undefined' || id === 'null') ? null : id;
  });

  // Periodically check for state changes and recover missing userId
  useEffect(() => {
    const syncState = async () => {
      const currentToken = localStorage.getItem('token');
      let currentId = localStorage.getItem('user_id');
      
      // Sanitize ID
      if (currentId === 'undefined' || currentId === 'null' || !currentId) {
        currentId = null;
        
        // If we have a token but no ID, fetch it from /me
        if (currentToken && !userId) {
          try {
            const res = await fetch(`${finalBaseUrl}/auth/me`, {
              headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            if (res.ok) {
              const data = await res.json();
              const fetchedId = data._id || data.id;
              if (fetchedId) {
                localStorage.setItem('user_id', fetchedId);
                setUserId(fetchedId);
              }
            }
          } catch (e) {
            console.warn("Failed to recover user ID:", e);
          }
        }
      }
      
      if (currentToken !== token) setToken(currentToken);
      if (currentId !== userId) setUserId(currentId);
    };

    const interval = setInterval(syncState, 2000);
    syncState(); // Run immediately
    return () => clearInterval(interval);
  }, [token, userId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('chat_user_id');
    window.location.href = '/';
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
      >
        <div className="mx-3 sm:mx-4 mt-3 sm:mt-4">
          <div className="glass rounded-2xl px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between max-w-7xl mx-auto"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
                <img src="/logo.png" alt="HackerHouse Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-base sm:text-lg md:text-xl font-bold flex items-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="text-gradient">Hacker</span>
                <span className="text-white">House</span>
                <div className="ml-2 flex h-1.5 w-1.5 relative group/status" 
                     title={isBackendOnline ? `Backend Online (${finalBaseUrl})` : `Backend Offline (Check VITE_API_URL: ${finalBaseUrl})`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBackendOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isBackendOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  
                  {/* Tooltip for debugging */}
                  <div className="absolute top-4 left-0 glass p-2 rounded-lg text-[10px] text-white opacity-0 group-hover/status:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                    {isBackendOnline ? "✓ Connected" : "✗ Connection Error"} <br/>
                    {finalBaseUrl}
                  </div>
                </div>
              </span>
            </Link>

            {/* Desktop Nav Items */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="relative px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                    style={{ color: isActive ? 'white' : 'rgba(148,163,184,1)' }}
                  >
                    {(isActive || hoveredItem === item.path) && (
                      <motion.div
                        layoutId="navActive"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <Icon size={16} className="relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              {token ? (
                <>
                  <button className="hidden sm:flex w-9 h-9 rounded-xl glass items-center justify-center text-slate-400 hover:text-white transition-colors relative touch-target">
                    <Bell size={16} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                  </button>
                  <Link to={userId ? `/profile/${userId}` : '#'} className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl glass hover:border-indigo-500/30 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <User size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-300 hidden md:block">Profile</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="hidden lg:flex px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white transition-all touch-target items-center"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="px-3 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link to="/signup" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                    Signup
                  </Link>
                </div>
              )}
              
              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white touch-target active:scale-95 transition-all"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X size={20} />
                    </motion.div>
                  ) : (
                    <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu - Full Screen Bottom Sheet */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
            
            {/* Slide-up Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-[#0a0d18] rounded-t-[2rem] overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
              
              {/* Header */}
              <div className="px-5 py-3 border-b border-white/5">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Navigation</p>
              </div>

              {/* Nav Links */}
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98] ${
                          isActive
                            ? 'bg-indigo-500/15 border border-indigo-500/25 text-white'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
                            <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                          </div>
                          <span className="font-semibold text-[15px]">{item.label}</span>
                        </div>
                        <ChevronRight size={16} className={isActive ? 'text-indigo-400' : 'text-slate-600'} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Divider */}
              <div className="mx-4 my-2 border-t border-white/5" />

              {/* Auth Section */}
              <div className="px-4 pb-4 space-y-2">
                {token ? (
                  <>
                    <Link
                      to={userId ? `/profile/${userId}` : '#'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <User size={18} className="text-white" />
                        </div>
                        <span className="font-semibold text-[15px] text-white">My Profile</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-600" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all active:scale-[0.98]"
                    >
                      <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <LogOut size={18} className="text-red-400" />
                      </div>
                      <span className="font-semibold text-[15px]">Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center py-3.5 rounded-2xl glass border border-white/10 text-slate-300 font-bold text-sm transition-all active:scale-95"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
