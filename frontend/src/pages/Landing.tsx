import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Code2, ArrowRight, Zap, Globe, Navigation, Terminal, Sparkles, Shield, Cpu, ExternalLink, CheckCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Animated background grid/glow orbs
function Orb({ style, delay = 0 }: { style: React.CSSProperties; delay?: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ filter: 'blur(120px)', ...style }}
      animate={{ scale: [1, 1.12, 1], opacity: [0.08, 0.15, 0.08] }}
      transition={{ duration: 10, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

// Trust indicator metric
function TrustMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{value}</span>
      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

const SLIDE_IMAGES = [
  { src: '/hero_vector.png', alt: 'Global Network of Developers' },
  { src: '/features_vector.png', alt: 'AI Developer Matching' },
  { src: '/dashboard_banner.png', alt: 'Collaborative Dev Workspaces' }
];

// How it works step item
function StepItem({ num, title, desc, icon: Icon }: any) {
  return (
    <div className="relative p-6 sm:p-8 rounded-[1.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all group">
      <div className="absolute top-4 right-4 text-[40px] font-black text-white/[0.02] font-mono leading-none group-hover:text-primary/5 transition-all">{num}</div>
      <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mb-5">
        <Icon size={16} />
      </div>
      <h4 className="text-base font-bold text-white mb-2 font-display">{title}</h4>
      <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [skill, setSkill] = useState('');
  const [name, setName] = useState('');
  const [availability, setAvailability] = useState('any');
  const [isLocating, setIsLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSug, setShowSug] = useState(false);
  const sugTimer = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    detectLocation();
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lon } = pos.coords;
      setCoords({ lat, lon });
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
        const d = await r.json();
        const city = d.address?.city || d.address?.town || d.address?.state || '';
        if (city) setLocation(city);
      } catch { /* ignore */ } finally { setIsLocating(false); }
    }, () => setIsLocating(false));
  };

  const fetchSuggestions = async (q: string) => {
    if (q.length < 3) { setSuggestions([]); return; }
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`);
      setSuggestions(await r.json());
    } catch { /* ignore */ }
  };

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (location) p.append('location', location);
    if (skill) p.append('skill', skill);
    if (name) p.append('name', name);
    if (availability !== 'any') p.append('availability', availability);
    if (coords) { p.append('lat', String(coords.lat)); p.append('lon', String(coords.lon)); }
    navigate(`/search?${p.toString()}`);
  };

  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: 'var(--color-background)' }}>

      {/* Background visual components */}
      <Orb style={{ width: 600, height: 600, top: '-15%', left: '-10%', background: 'var(--color-primary)' }} delay={0} />
      <Orb style={{ width: 500, height: 500, top: '30%', right: '-15%', background: 'var(--color-primary-light)' }} delay={3} />

      {/* Precision tech grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── HERO SECTION ─────────────────────────────── */}
      <section className="relative min-h-[92svh] flex items-center pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 w-full relative z-10 items-center">

          {/* Left Text and Form */}
          <div className="lg:col-span-7 space-y-8">

            {/* Linear-style badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-semibold text-slate-400 uppercase tracking-widest"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-white">v1.2.0 Release</span>
              <span className="text-slate-600">|</span>
              <span>GPS Proximity Match</span>
            </motion.div>

            <div className="space-y-5">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] font-display"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Find Top <br />
                <span className="text-gradient">Developers</span> Near You.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-normal"
              >
                Discover, connect, and hire verified engineers using GitHub intelligence and real-time location data. Seamless platform matching built for modern product engineering teams.
              </motion.p>
            </div>

            {/* Premium minimal search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="glass rounded-2xl p-2.5 flex flex-col sm:flex-row gap-2.5 max-w-4xl w-full relative z-20 border border-white/8 hover:border-indigo-500/20 focus-within:border-indigo-500/30 transition-all shadow-2xl"
              style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.45)' }}
            >
              {/* Developer Name */}
              <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5">
                <User size={15} className="text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Developer Name..."
                  className="bg-transparent flex-1 text-xs text-slate-200 placeholder-slate-600 outline-none w-full font-semibold"
                />
              </div>

              <div className="w-px bg-white/5 hidden sm:block self-stretch my-1.5" />

              {/* Skills */}
              <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5">
                <Code2 size={15} className="text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={skill}
                  onChange={e => setSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Skill (e.g. React, Python, Go)"
                  className="bg-transparent flex-1 text-xs text-slate-200 placeholder-slate-600 outline-none w-full font-semibold"
                />
              </div>

              <div className="w-px bg-white/5 hidden sm:block self-stretch my-1.5" />

              {/* Location */}
              <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 relative group">
                <MapPin size={15} className={`shrink-0 ${isLocating ? 'text-indigo-400 animate-bounce' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={location}
                  onChange={e => { setLocation(e.target.value); setShowSug(true); clearTimeout(sugTimer.current); sugTimer.current = setTimeout(() => fetchSuggestions(e.target.value), 450); }}
                  onFocus={() => setShowSug(true)}
                  onBlur={() => setTimeout(() => setShowSug(false), 200)}
                  placeholder="City or location..."
                  className="bg-transparent flex-1 text-xs text-slate-200 placeholder-slate-600 outline-none w-full font-semibold"
                />
                <button
                  onClick={detectLocation}
                  className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Navigation size={11} className={isLocating ? 'animate-spin' : ''} />
                </button>

                <AnimatePresence>
                  {showSug && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full left-0 w-full mt-3 glass rounded-xl overflow-hidden z-50 shadow-2xl border border-white/8"
                    >
                      {suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="px-4 py-3 hover:bg-white/8 cursor-pointer text-[11px] flex items-center gap-2.5 border-b border-white/5 last:border-0"
                          onClick={() => { setLocation(s.display_name.split(',')[0].trim()); setCoords({ lat: parseFloat(s.lat), lon: parseFloat(s.lon) }); setShowSug(false); }}
                        >
                          <MapPin size={11} className="text-slate-500 shrink-0" />
                          <div className="truncate text-white font-medium">{s.display_name}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-px bg-white/5 hidden sm:block self-stretch my-1.5" />

              {/* Availability Filter */}
              <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5">
                <Globe size={15} className="text-emerald-500 shrink-0" />
                <select
                  value={availability}
                  onChange={e => setAvailability(e.target.value)}
                  className="bg-transparent text-xs text-slate-300 outline-none w-full font-semibold cursor-pointer py-1"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="any" className="bg-[#0c1020] text-slate-300">Any status</option>
                  <option value="active" className="bg-[#0c1020] text-slate-300">Available now</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSearch}
                className="btn-primary py-2.5 px-5 text-xs flex items-center justify-center gap-1.5 font-bold whitespace-nowrap self-stretch md:self-auto"
              >
                <Search size={13} /> Find Developers
              </motion.button>
            </motion.div>

            {/* Minimal trust log & badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-8 pt-2"
            >
              <TrustMetric value="4.9 ★" label="Verified Rating" />
              <div className="w-px h-8 bg-white/5" />
              <TrustMetric value="10,000+" label="Global Talents" />
              <div className="w-px h-8 bg-white/5" />
              <TrustMetric value="120+" label="Connected Cities" />
            </motion.div>
          </div>

          {/* Right side visual: Auto-Sliding Image Carousel */}
          <div className="lg:col-span-5 relative order-first lg:order-last flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="relative w-full max-w-lg aspect-[4/3] flex items-center justify-center overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.01] backdrop-blur-sm shadow-2xl p-6"
            >
              <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={SLIDE_IMAGES[currentSlide].src}
                  alt={SLIDE_IMAGES[currentSlide].alt}
                  initial={{ opacity: 0, x: 50, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="relative z-10 w-full h-full object-contain rounded-2xl drop-shadow-2xl"
                />
              </AnimatePresence>

              {/* Slider Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {SLIDE_IMAGES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide 
                        ? 'w-5 bg-primary' 
                        : 'bg-white/20 hover:bg-white/45'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="py-24 px-4 bg-background relative z-10 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-20 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-xl text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
              <Cpu size={12} /> Discovery Mechanics
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">Engineered Matching Channels</h2>
            <p className="text-slate-400 text-xs">How HackerHouse processes credentials to output high-performance engineers.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side Vector Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              className="relative w-full max-w-lg mx-auto"
            >
              <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full" />
              <img src="/features_vector.png" alt="AI Developer Matching" className="relative z-10 w-full h-auto drop-shadow-2xl animate-float rounded-3xl" style={{ animationDelay: '2s' }} />
            </motion.div>

            {/* Right side Steps Stack */}
            <div className="space-y-6">
              <StepItem num="01" title="Query Proximity & Skills" desc="Filter candidates based on local coordinates and specialized tech stack specifications." icon={Search} />
              <StepItem num="02" title="Inspect Commit Velocity" desc="Analyze verified public contributions and code metrics fetched directly from GitHub profiles." icon={Terminal} />
              <StepItem num="03" title="Instantiate Proposals" desc="Commence high-fidelity conversations and contract channels within seconds of discovery." icon={CheckCircle} />
            </div>
          </div>
        </div>
      </section>

      {/* ── MOCK PORTFOLIOS GRID ──────────────────────── */}
      <section className="py-24 px-4 relative z-10 bg-indigo-500/[0.01] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-xl text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles size={12} /> Elite Talents
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">Verified Professionals</h2>
            <p className="text-slate-400 text-xs">Explore highly capable specialists indexed with historical contribution data.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Dev Card 1 */}
            <div className="p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02] flex flex-col justify-between transition-all group">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 relative">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-[#0d1225]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xs">Elena Rostova</h4>
                    <p className="text-slate-500 text-[10px] font-mono">@elena_rust</p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-white text-xs font-bold font-mono">$110/hr</span>
                  </div>
                </div>
                <p className="text-slate-400 text-[11px] mb-4 leading-relaxed">Systems architect building high-throughput database layers and custom network routing layers in Rust.</p>
                <div className="flex flex-wrap gap-1 mb-5">
                  {['Rust', 'Go', 'gRPC', 'WASM'].map(t => (
                    <span key={t} className="px-2 py-0.5 bg-white/[0.03] text-indigo-300 border border-white/5 rounded-lg text-[9px] font-bold">{t}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => navigate('/search')} className="w-full py-2 bg-white/[0.02] hover:bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1">
                Inspect Profile <ExternalLink size={10} />
              </button>
            </div>

            {/* Dev Card 2 */}
            <div className="p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02] flex flex-col justify-between transition-all group">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 relative">
                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-[#0d1225]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xs">Marcus Vance</h4>
                    <p className="text-slate-500 text-[10px] font-mono">@mvance_dev</p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-white text-xs font-bold font-mono">$95/hr</span>
                  </div>
                </div>
                <p className="text-slate-400 text-[11px] mb-4 leading-relaxed">Product engineer focused on rendering graphics pipeline systems and building rich web platforms.</p>
                <div className="flex flex-wrap gap-1 mb-5">
                  {['WebGL', 'Next.js', 'React', 'TS'].map(t => (
                    <span key={t} className="px-2 py-0.5 bg-white/[0.03] text-indigo-300 border border-white/5 rounded-lg text-[9px] font-bold">{t}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => navigate('/search')} className="w-full py-2 bg-white/[0.02] hover:bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1">
                Inspect Profile <ExternalLink size={10} />
              </button>
            </div>

            {/* Dev Card 3 */}
            <div className="p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02] flex flex-col justify-between transition-all group">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 relative">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-[#0d1225]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xs">Aria Chen</h4>
                    <p className="text-slate-500 text-[10px] font-mono">@aria_chen</p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-white text-xs font-bold font-mono">$120/hr</span>
                  </div>
                </div>
                <p className="text-slate-400 text-[11px] mb-4 leading-relaxed">AI integration expert specializing in semantic token orchestration and indexing vector layouts.</p>
                <div className="flex flex-wrap gap-1 mb-5">
                  {['Python', 'LangChain', 'VectorDB'].map(t => (
                    <span key={t} className="px-2 py-0.5 bg-white/[0.03] text-indigo-300 border border-white/5 rounded-lg text-[9px] font-bold">{t}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => navigate('/search')} className="w-full py-2 bg-white/[0.02] hover:bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1">
                Inspect Profile <ExternalLink size={10} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section className="py-24 px-4 bg-background relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-xl text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
              <Shield size={12} /> Trust Registry
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">Client Reflections</h2>
            <p className="text-slate-400 text-xs">Verified accounts on our coordinated matching outcomes.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            {/* Quote 1 */}
            <div className="p-6 sm:p-8 rounded-[1.5rem] border border-white/5 bg-white/[0.01] space-y-4">
              <p className="text-slate-300 text-xs leading-relaxed">"The GPS coordinate matching was exceptionally helpful. We located a brilliant fullstack React engineer less than three blocks from our office. We coordinate daily and ship twice as fast now."</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h5 className="text-white font-bold text-[11px]">James Carter</h5>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">CTO, PulseFlow SaaS</p>
                </div>
              </div>
            </div>

            {/* Quote 2 */}
            <div className="p-6 sm:p-8 rounded-[1.5rem] border border-white/5 bg-white/[0.01] space-y-4">
              <p className="text-slate-300 text-xs leading-relaxed">"Reviewing real repository analytics before scheduling calls saved us weeks of standard screening. The engineers we met on HackerHouse are elite builders with clear proof of work."</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h5 className="text-white font-bold text-[11px]">Elena Vance</h5>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Co-Founder, Synthetix AI</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="py-24 px-4 relative z-10 bg-background border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[2rem] overflow-hidden text-center p-10 sm:p-16 border border-white/8 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(135,99,241,0.03))',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5)'
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% -10%, rgba(99,102,241,0.15), transparent 70%)' }} />

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 font-display">Start finding elite talent.</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-xs leading-relaxed">Formulate secure proposals, match in-person proximity, and collaborate directly on HackerHouse.</p>

            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => navigate('/search')} className="btn-primary px-8 py-3.5 text-xs flex items-center gap-2 font-bold shadow-lg shadow-indigo-500/25">
                Explore Specialists <ArrowRight size={14} />
              </button>
              <button onClick={() => navigate('/signup')} className="btn-secondary px-8 py-3.5 text-xs flex items-center gap-2 font-bold">
                Join Free <Zap size={13} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
