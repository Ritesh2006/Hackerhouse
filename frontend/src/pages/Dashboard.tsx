import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Activity, TrendingUp, Users, ArrowRight, Zap, ExternalLink, Palette, Settings2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../lib/api';

const THEMES = [
  { id: 'indigo', name: 'Cosmic Indigo', primary: '#6366f1', bg: 'linear-gradient(135deg, rgba(99,102,241,0.1), transparent)' },
  { id: 'amber', name: 'Sunset Amber', primary: '#f59e0b', bg: 'linear-gradient(135deg, rgba(245,158,11,0.1), transparent)' },
  { id: 'emerald', name: 'Emerald Forest', primary: '#10b981', bg: 'linear-gradient(135deg, rgba(16,185,129,0.1), transparent)' },
  { id: 'pink', name: 'Neon Pink', primary: '#ec4899', bg: 'linear-gradient(135deg, rgba(236,72,153,0.1), transparent)' },
  { id: 'cyan', name: 'Arctic Cyan', primary: '#06b6d4', bg: 'linear-gradient(135deg, rgba(6,182,212,0.1), transparent)' },
];

const BG_PRESETS = [
  { id: 'default', name: 'Deep Space', value: '#050914' },
  { id: 'midnight', name: 'Midnight Black', value: '#02040a' },
  { id: 'purple', name: 'Obsidian Purple', value: '#090613' },
  { id: 'forest', name: 'Forest Obsidian', value: '#040b08' },
  { id: 'charcoal', name: 'Steel Charcoal', value: '#0f1115' },
];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

function MetricCard({ icon: Icon, label, value, sub, color, gradient }: any) {
  return (
    <motion.div variants={item} whileHover={{ y: -4, scale: 1.01 }}
      className="relative rounded-[2rem] p-6 overflow-hidden cursor-default group border border-white/10"
      style={{ background: 'rgba(12,18,35,0.6)', backdropFilter: 'blur(16px)' }}>
      
      {/* Gradient accent */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ background: gradient }} />
      <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">{label}</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{value}</p>
          {sub && <p className="text-xs mt-1.5 text-slate-500 font-medium">{sub}</p>}
        </div>
        <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
          style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ navigate }: { navigate: (path: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ ease: [0.23, 1, 0.32, 1] }}
      className="relative rounded-[2.5rem] overflow-hidden text-center py-20 px-8 border border-white/10"
      style={{ background: 'rgba(15,22,45,0.5)', backdropFilter: 'blur(20px)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.1), transparent 60%)' }} />
      <div className="relative z-10">
        <motion.div animate={{ rotate: [0, 10, -5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-24 h-24 rounded-[2rem] mx-auto mb-6 flex items-center justify-center shadow-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.1))', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Zap size={40} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-black text-white mb-3 font-display">Start your first project 🚀</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
          You haven't hired anyone or been hired yet. Browse our top developers to get started on your next big idea.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/search')} className="btn-primary flex items-center gap-2 px-8 py-3.5 text-sm">
            Explore Developers <ArrowRight size={15} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState('indigo');
  const [customHex, setCustomHex] = useState('#6366f1');
  const [activeBg, setActiveBg] = useState('default');
  const [customBgHex, setCustomBgHex] = useState('#050914');
  const navigate = useNavigate();

  // Load and apply theme globally
  useEffect(() => {
    const savedTheme = localStorage.getItem('hackerhouse_theme') || 'indigo';
    const savedCustom = localStorage.getItem('hackerhouse_custom_color') || '#6366f1';
    setCustomHex(savedCustom);
    applyTheme(savedTheme, savedCustom);

    const savedBgTheme = localStorage.getItem('hackerhouse_bg_theme') || 'default';
    const savedBgCustom = localStorage.getItem('hackerhouse_custom_bg_color') || '#050914';
    setCustomBgHex(savedBgCustom);
    setActiveBg(savedBgTheme);
  }, []);

  const applyTheme = (themeId: string, hex?: string) => {
    setActiveTheme(themeId);
    localStorage.setItem('hackerhouse_theme', themeId);
    
    let primaryColor = '';
    if (themeId === 'custom' && hex) {
      primaryColor = hex;
      setCustomHex(hex);
      localStorage.setItem('hackerhouse_custom_color', hex);
    } else {
      const theme = THEMES.find(t => t.id === themeId);
      if (theme) primaryColor = theme.primary;
    }
    
    if (primaryColor) {
      const setProp = (name: string, value: string) => document.documentElement.style.setProperty(name, value);
      
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
      
      // Dispatch global theme changed event
      window.dispatchEvent(new Event('hackerhouse_theme_changed'));
    }
  };

  const applyBgColor = (bgId: string, hex?: string) => {
    setActiveBg(bgId);
    localStorage.setItem('hackerhouse_bg_theme', bgId);

    let bgColor = '';
    if (bgId === 'custom' && hex) {
      bgColor = hex;
      setCustomBgHex(hex);
      localStorage.setItem('hackerhouse_custom_bg_color', hex);
    } else {
      const preset = BG_PRESETS.find(b => b.id === bgId);
      if (preset) bgColor = preset.value;
    }

    if (bgColor) {
      const setProp = (name: string, value: string) => document.documentElement.style.setProperty(name, value);
      setProp('--color-background', bgColor);
      
      const getSurfaceColor = (hexVal: string, amount: number) => {
        let r = parseInt(hexVal.slice(1, 3), 16);
        let g = parseInt(hexVal.slice(3, 5), 16);
        let b = parseInt(hexVal.slice(5, 7), 16);
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

      // Dispatch global theme changed event
      window.dispatchEvent(new Event('hackerhouse_theme_changed'));
    }
  };
    
  useEffect(() => {
    (async () => {
      try {
        const userRes = await usersApi.getProfile();
        setUser(userRes.data);
        const [projRes, contrRes] = await Promise.all([usersApi.getMyProjects(), usersApi.getMyContracts()]);
        setProjects(projRes.data);
        setContracts(contrRes.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050914' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: 48, height: 48 }} />
          <p className="text-slate-500 text-sm animate-pulse font-medium">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Member';

  const metrics = [
    { icon: Activity, label: 'Active Projects', value: projects.length, color: '#6366f1', gradient: 'radial-gradient(circle at top right, rgba(99,102,241,0.1), transparent 70%)' },
    { icon: FileText, label: 'Contracts', value: contracts.length, color: '#f59e0b', gradient: 'radial-gradient(circle at top right, rgba(245,158,11,0.1), transparent 70%)' },
    { icon: Users, label: 'Role', value: user?.role?.toUpperCase() || 'DEV', color: '#ec4899', gradient: 'radial-gradient(circle at top right, rgba(236,72,153,0.1), transparent 70%)' },
    { icon: TrendingUp, label: 'Completion', value: '100%', sub: 'All tasks on track', color: '#10b981', gradient: 'radial-gradient(circle at top right, rgba(16,185,129,0.1), transparent 70%)' },
  ];

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden" style={{ background: '#050914' }}>
      
      {/* ── BANNER AREA ── */}
      <div className="relative w-full h-[200px] sm:h-[320px] md:h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-transparent" />
        <img src="/dashboard_banner.png" alt="Workspace Banner" className="w-full h-full object-cover animate-float" style={{ animationDuration: '20s' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-[#050914]/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative -mt-24 sm:-mt-32 md:-mt-40 z-10">
        
        {/* Workspace Welcome & Theme Panel Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.23, 1, 0.32, 1] }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden relative group cursor-pointer">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <span className="text-2xl font-black text-white">{firstName.charAt(0)}</span>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <Settings2 size={20} className="text-white" />
                </div>
              </div>
              <div>
                <p className="text-slate-300 text-sm font-semibold tracking-wide uppercase">{greeting},</p>
                <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
                  {firstName} <span className="text-gradient">✨</span>
                </h1>
              </div>
            </div>
            <p className="text-slate-400 text-sm max-w-lg">Manage your active contracts, discover top talent, and customize your workspace.</p>
          </motion.div>

          {/* Theme Customizer Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="glass rounded-[2rem] p-5 border border-white/10 shadow-2xl backdrop-blur-2xl w-full lg:w-[480px]"
            style={{ background: 'rgba(12, 17, 34, 0.6)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Palette size={14} className="text-primary" />
              <h3 className="text-white text-xs font-bold uppercase tracking-widest">Workspace Customizer</h3>
            </div>
            
            <div className="space-y-4">
              {/* Primary Color Selector */}
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Accent Color</p>
                <div className="flex flex-wrap items-center gap-2.5">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => applyTheme(theme.id)}
                      title={theme.name}
                      className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center relative overflow-hidden group hover:scale-105 ${activeTheme === theme.id ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-background' : 'ring-1 ring-white/10'}`}
                      style={{ background: theme.primary }}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {activeTheme === theme.id && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                    </button>
                  ))}

                  <div className="w-px h-6 bg-white/10 mx-0.5" />
                  
                  <div className={`relative flex items-center gap-2 px-2 py-1 rounded-xl transition-all ${activeTheme === 'custom' ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/5 hover:bg-white/10'}`}>
                    <div className="relative w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-white/20">
                      <input
                        type="color"
                        value={customHex}
                        onChange={(e) => applyTheme('custom', e.target.value)}
                        className="absolute inset-[-10px] w-10 h-10 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => applyTheme('custom', e.target.value)}
                      placeholder="#HEX"
                      className="bg-transparent w-16 outline-none text-[11px] text-white font-mono uppercase tracking-wider"
                    />
                  </div>
                </div>
              </div>

              {/* Background Color Selector */}
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Background Color</p>
                <div className="flex flex-wrap items-center gap-2.5">
                  {BG_PRESETS.map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => applyBgColor(bg.id)}
                      title={bg.name}
                      className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center relative overflow-hidden group hover:scale-105 ${activeBg === bg.id ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-background' : 'ring-1 ring-white/10'}`}
                      style={{ background: bg.value }}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {activeBg === bg.id && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                    </button>
                  ))}

                  <div className="w-px h-6 bg-white/10 mx-0.5" />

                  <div className={`relative flex items-center gap-2 px-2 py-1 rounded-xl transition-all ${activeBg === 'custom' ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/5 hover:bg-white/10'}`}>
                    <div className="relative w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-white/20">
                      <input
                        type="color"
                        value={customBgHex}
                        onChange={(e) => applyBgColor('custom', e.target.value)}
                        className="absolute inset-[-10px] w-10 h-10 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={customBgHex}
                      onChange={(e) => applyBgColor('custom', e.target.value)}
                      placeholder="#HEX"
                      className="bg-transparent w-16 outline-none text-[11px] text-white font-mono uppercase tracking-wider"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Metrics Grid */}
        <motion.div variants={container} initial="hidden" animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {metrics.map((m, i) => <MetricCard key={i} {...m} />)}
        </motion.div>

        {/* Main Content Area */}
        {projects.length === 0 && contracts.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Projects Container */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="lg:col-span-2 rounded-[2rem] overflow-hidden border border-white/10"
              style={{ background: 'rgba(15,22,45,0.4)', backdropFilter: 'blur(20px)' }}>
              
              <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.02]">
                <h2 className="font-black text-white flex items-center gap-2.5 text-base font-display">
                  <LayoutDashboard size={18} className="text-indigo-400" /> Active Projects
                </h2>
                <div className="px-3 py-1 bg-white/5 rounded-lg text-xs text-slate-400 font-bold">{projects.length} Total</div>
              </div>
              
              <div className="divide-y divide-white/5">
                {projects.map((proj, i) => (
                  <motion.div key={i} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }} className="px-8 py-5 cursor-pointer transition-colors group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-sm truncate group-hover:text-indigo-300 transition-colors">{proj.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">{proj.description}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-sm font-black text-emerald-400 font-mono">${proj.budget}</span>
                        <span className="text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                          {proj.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contracts Container */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-[2rem] overflow-hidden border border-white/10 flex flex-col"
              style={{ background: 'rgba(15,22,45,0.4)', backdropFilter: 'blur(20px)' }}>
              
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                <h2 className="font-black text-white flex items-center gap-2.5 text-base font-display">
                  <FileText size={16} className="text-amber-400" /> Active Contracts
                </h2>
              </div>
              
              <div className="divide-y divide-white/5 flex-1">
                {contracts.map((c, i) => (
                  <div key={i} className="px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    onClick={() => navigate(`/chat/${c.id}`)}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-bold text-white font-mono group-hover:text-amber-400 transition-colors">#{c.id.substring(0, 8)}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{c.status}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-400/10 group-hover:text-amber-400 transition-colors">
                      <ExternalLink size={14} className="text-slate-400 group-hover:text-amber-400" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}
