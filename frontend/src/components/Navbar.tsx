import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, MessageCircle, Code2, User, Bell, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';

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
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/health`);
        setIsBackendOnline(res.ok);
      } catch {
        setIsBackendOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

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
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mt-4">
          <div className="glass rounded-2xl px-4 md:px-6 py-4 flex items-center justify-between max-w-7xl mx-auto"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                <Code2 size={16} className="text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold flex items-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="text-gradient">Hacker</span>
                <span className="text-white">House</span>
                <div className="ml-2 flex h-1.5 w-1.5 relative" title={isBackendOnline ? "Backend Online" : "Backend Offline"}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBackendOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isBackendOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
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
            <div className="flex items-center gap-2 md:gap-3">
              {token ? (
                <>
                  <button className="hidden sm:flex w-9 h-9 rounded-xl glass items-center justify-center text-slate-400 hover:text-white transition-colors relative">
                    <Bell size={16} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                  </button>
                  <Link to={userId ? `/profile/${userId}` : '#'} className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:border-indigo-500/30 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <User size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-300 hidden md:block">Profile</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link to="/signup" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                    Signup
                  </Link>
                </div>
              )}
              
              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-[#030712] border-l border-white/5 p-6 pt-24 shadow-2xl">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-medium transition-all ${
                        isActive ? 'bg-indigo-500/10 text-white border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={20} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              
              <div className="mt-auto absolute bottom-8 left-6 right-6">
                <div className="glass rounded-2xl p-4 border border-white/5">
                  <p className="text-sm text-slate-500 mb-3 text-center">Ready to build?</p>
                  <button className="w-full btn-primary py-3">Post a Project</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
