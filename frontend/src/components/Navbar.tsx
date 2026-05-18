import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Search, LayoutDashboard, User, Bell, Home, Menu, X, LogOut, ChevronRight, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { finalBaseUrl } from '../lib/api';

export default function Navbar() {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 20));

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Product', icon: LayoutDashboard },
    { path: '/search', label: 'Developers', icon: Search },
    { path: '#pricing', label: 'Pricing', icon: Zap },
    { path: '#docs', label: 'Docs', icon: ChevronRight },
  ];

  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${finalBaseUrl}/health`);
        setIsBackendOnline(res.ok);
      } catch { setIsBackendOnline(false); }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(() => {
    const id = localStorage.getItem('user_id');
    return (id === 'undefined' || id === 'null') ? null : id;
  });

  useEffect(() => {
    const syncState = async () => {
      const currentToken = localStorage.getItem('token');
      let currentId = localStorage.getItem('user_id');
      if (currentId === 'undefined' || currentId === 'null' || !currentId) {
        currentId = null;
        if (currentToken && !userId) {
          try {
            const res = await fetch(`${finalBaseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${currentToken}` } });
            if (res.ok) {
              const data = await res.json();
              const fetchedId = data._id || data.id;
              if (fetchedId) { localStorage.setItem('user_id', fetchedId); setUserId(fetchedId); }
            }
          } catch (e) { console.warn('Failed to recover user ID:', e); }
        }
      }
      if (currentToken !== token) setToken(currentToken);
      if (currentId !== userId) setUserId(currentId);
    };
    const interval = setInterval(syncState, 2000);
    syncState();
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
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className={`mx-3 sm:mx-5 mt-3 sm:mt-4 transition-all duration-300`}>
          <div
            className={`glass rounded-2xl px-3 sm:px-5 md:px-7 py-3 flex items-center justify-between max-w-7xl mx-auto transition-all duration-300 ${
              scrolled
                ? 'shadow-2xl shadow-black/40 border-white/10'
                : 'border-white/6'
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-indigo-500/30">
                <img src="/logo.png" alt="HackerHouse" className="w-full h-full object-cover" />
              </div>
              <span className="text-base sm:text-[17px] font-black tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="text-gradient">Hacker</span>
                <span className="text-white">House</span>
              </span>
              {/* Status dot */}
              <div
                className="relative flex"
                title={isBackendOnline ? `Backend Online` : `Backend Offline`}
              >
                <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-70 ${isBackendOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackendOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] rounded-2xl p-1 border border-white/5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="relative px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors z-10"
                    style={{ color: isActive ? 'white' : 'rgba(148,163,184,0.9)' }}
                  >
                    {(isActive || hoveredItem === item.path) && (
                      <motion.div
                        layoutId="navPill"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: isActive
                            ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(79,70,229,0.15))'
                            : 'rgba(255,255,255,0.05)',
                          border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)'
                        }}
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                      />
                    )}
                    <Icon size={15} className="relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {token ? (
                <>
                  <button className="hidden sm:flex w-9 h-9 rounded-xl glass items-center justify-center text-slate-400 hover:text-white transition-all relative hover:border-indigo-500/30">
                    <Bell size={15} />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 ring-2 ring-[#050914]" />
                  </button>
                  <Link
                    to={userId ? `/profile/${userId}` : '#'}
                    className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl glass hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <User size={13} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-300 hidden md:block group-hover:text-white transition-colors">Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden lg:flex px-3.5 py-2 rounded-xl text-red-400/80 text-xs font-bold hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all items-center gap-1.5"
                  >
                    <LogOut size={13} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                    Log in
                  </Link>
                  <Link to="/signup" className="btn-primary text-sm py-2 px-5 flex items-center gap-1.5">
                    <Zap size={13} />
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white touch-target active:scale-95 transition-all"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X size={18} />
                    </motion.div>
                  ) : (
                    <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" onClick={() => setIsMobileMenuOpen(false)} />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 rounded-t-[2rem] overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #0d1225, #080d1c)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottom: 'none',
                paddingBottom: 'env(safe-area-inset-bottom, 28px)'
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/15" />
              </div>

              {/* Branding */}
              <div className="px-5 py-4 border-b border-white/5">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Navigation</p>
              </div>

              {/* Links */}
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98] ${
                          isActive
                            ? 'bg-indigo-500/12 border border-indigo-500/25 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
                            <Icon size={17} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                          </div>
                          <span className="font-semibold text-[15px]">{item.label}</span>
                        </div>
                        <ChevronRight size={15} className={isActive ? 'text-indigo-400' : 'text-slate-600'} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mx-4 my-1 h-px bg-white/5" />

              <div className="px-4 pb-4 pt-2 space-y-2">
                {token ? (
                  <>
                    <Link to={userId ? `/profile/${userId}` : '#'} onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-300 hover:bg-white/5 transition-all border border-transparent active:scale-[0.98]">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                          <User size={17} className="text-white" />
                        </div>
                        <span className="font-semibold text-[15px] text-white">My Profile</span>
                      </div>
                      <ChevronRight size={15} className="text-slate-600" />
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all active:scale-[0.98]">
                      <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <LogOut size={17} className="text-red-400" />
                      </div>
                      <span className="font-semibold text-[15px]">Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center py-3.5 rounded-2xl glass border border-white/10 text-slate-300 font-bold text-sm transition-all active:scale-95">
                      Log In
                    </Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center py-3.5 rounded-2xl btn-primary text-sm font-bold active:scale-95">
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
