import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Search, LayoutDashboard, User, Bell, Home, Menu, X, LogOut, ChevronRight, Zap, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { finalBaseUrl } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export default function Navbar() {
  const location = useLocation();
  const { token, userId, logout } = useAuthStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Custom UI overlay states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 20));

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Product', icon: LayoutDashboard },
    { path: '/search', label: 'Developers', icon: Search },
  ];

  const mockNotifications = [
    { id: 1, title: 'Matching Engine Active 🚀', text: 'Google developer integration indexed successfully.', time: '2m ago', unread: true },
    { id: 2, title: 'Contract Proposal received 🤝', text: 'Stripe, Inc. initiated a hiring proposal.', time: '1h ago', unread: true },
    { id: 3, title: 'Message from Ritesh Rakshit 💬', text: 'Hey, let\'s catch up regarding the minor project details!', time: '3h ago', unread: false }
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
    document.body.style.overflow = (isMobileMenuOpen || isDocsOpen || isPricingOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen, isDocsOpen, isPricingOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-3 sm:mx-5 mt-3 sm:mt-4 transition-all duration-300">
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
              <div className="relative flex" title={isBackendOnline ? `Backend Online` : `Backend Offline`}>
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

              {/* Pricing Item */}
              <button
                onClick={() => setIsPricingOpen(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 text-slate-400 hover:text-white transition-colors relative"
              >
                <Zap size={15} />
                <span>Pricing</span>
              </button>

              {/* Docs Item */}
              <button
                onClick={() => setIsDocsOpen(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 text-slate-400 hover:text-white transition-colors relative"
              >
                <BookOpen size={15} />
                <span>Docs</span>
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {token ? (
                <>
                  {/* Notifications Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="flex w-9 h-9 rounded-xl glass items-center justify-center text-slate-400 hover:text-white transition-all relative hover:border-indigo-500/30"
                    >
                      <Bell size={15} />
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 ring-2 ring-[#050914]" />
                    </button>

                    <AnimatePresence>
                      {isNotificationsOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 p-4 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden"
                            style={{ background: 'rgba(12, 17, 34, 0.92)' }}
                          >
                            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Inbox Notifications</h4>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">2 New</span>
                            </div>
                            <div className="space-y-3">
                              {mockNotifications.map(notif => (
                                <div key={notif.id} className={`p-2.5 rounded-xl transition-colors hover:bg-white/5 cursor-pointer ${notif.unread ? 'bg-indigo-500/[0.04]' : ''}`}>
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-xs font-bold text-white leading-tight">{notif.title}</span>
                                    <span className="text-[9px] text-slate-500 shrink-0 font-medium">{notif.time}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">{notif.text}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile Link */}
                  <Link
                    to={userId ? `/profile/${userId}` : '#'}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl glass hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <User size={13} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-300 hidden md:block group-hover:text-white transition-colors">Profile</span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={logout}
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
              className="absolute bottom-0 left-0 right-0 rounded-t-[2rem] overflow-hidden z-50"
              style={{
                background: 'linear-gradient(180deg, #0d1225, #080d1c)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottom: 'none',
                paddingBottom: 'env(safe-area-inset-bottom, 28px)'
              }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/15" />
              </div>

              <div className="px-5 py-4 border-b border-white/5">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Navigation</p>
              </div>

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

                {/* Mobile Pricing */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setIsPricingOpen(true); }}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                      <Zap size={17} className="text-slate-400" />
                    </div>
                    <span className="font-semibold text-[15px]">Pricing</span>
                  </div>
                  <ChevronRight size={15} className="text-slate-600" />
                </button>

                {/* Mobile Docs */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setIsDocsOpen(true); }}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                      <BookOpen size={17} className="text-slate-400" />
                    </div>
                    <span className="font-semibold text-[15px]">Docs Hub</span>
                  </div>
                  <ChevronRight size={15} className="text-slate-600" />
                </button>
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
                    <button onClick={logout}
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

      {/* ── DOCS MODAL ── */}
      <AnimatePresence>
        {isDocsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDocsOpen(false)} className="absolute inset-0 bg-[#050914]/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              className="relative w-full max-w-2xl overflow-hidden border border-white/8 shadow-2xl rounded-[2rem]"
              style={{ background: 'linear-gradient(145deg, rgba(15,22,45,0.96), rgba(10,15,35,0.99))' }}>
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-indigo-500/5">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2 font-display">
                    Interactive Documentation Hub <Sparkles size={16} className="text-indigo-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Developer Discovery Protocols</p>
                </div>
                <button onClick={() => setIsDocsOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-sm leading-relaxed text-slate-300">
                <div>
                  <h4 className="font-bold text-white text-base mb-2">1. Infinite Geolocation Discovery</h4>
                  <p>HackerHouse leverages state-of-the-art geo-queries utilizing case-insensitive geospatial indexing. It discovers nearby talent dynamically with exact real-time mileage distances computed mathematically based on MongoDB's 2dsphere index capability.</p>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base mb-2">2. Global Theme Customization system</h4>
                  <p>Our dashboard empowers developers with a dynamic theme engine. Selecting predefined palettes or styling with custom HEX color selectors updates the root design tokens on the window object and persists them securely via localStorage across the entire platform experience.</p>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base mb-2">3. GitHub Intelligence Sync</h4>
                  <p>By connecting your GitHub profile, the system parses public repositories, commit velocity, and language details. This builds a highly optimized trust factor score for top-tier developer discovery.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PRICING MODAL ── */}
      <AnimatePresence>
        {isPricingOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPricingOpen(false)} className="absolute inset-0 bg-[#050914]/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              className="relative w-full max-w-xl overflow-hidden border border-white/8 shadow-2xl rounded-[2rem]"
              style={{ background: 'linear-gradient(145deg, rgba(15,22,45,0.96), rgba(10,15,35,0.99))' }}>
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-amber-500/5">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2 font-display">
                    Premium Subscriptions <Zap size={16} className="text-amber-400" />
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Scale your engineering team</p>
                </div>
                <button onClick={() => setIsPricingOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-6 text-center">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
                  <h4 className="text-lg font-bold text-white mb-1">Developer Growth Plan</h4>
                  <div className="text-3xl font-black text-white font-mono mt-3">$49<span className="text-sm font-normal text-slate-500">/mo</span></div>
                  <p className="text-slate-400 text-xs mt-3">Unlock infinite global searches, location-aware auto detection, and real-time GitHub trust sync metrics.</p>
                  <ul className="text-xs text-slate-300 text-left space-y-2 max-w-xs mx-auto mt-5">
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> Dynamic Local Matching Search</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> Full GitHub Commits Sync</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> Dynamic Custom theme engine</li>
                  </ul>
                  <button onClick={() => setIsPricingOpen(false)} className="btn-primary w-full py-3.5 rounded-xl font-bold mt-6 text-sm flex items-center justify-center gap-2">
                    Start Free 14-day Trial <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
