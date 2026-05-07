import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera } from '@react-three/drei';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Code2, ArrowRight, Star, Users, Zap, Terminal, Globe, MessageCircle, Navigation, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import AIAgent from '../components/AIAgent';


const HERO_IMAGES = [
  { url: '/hero_image.png', code: 'const dev = match(query);\ndev.collaborate();' },
  { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200', code: 'while(true) {\n  build(future);\n}' },
  { url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200', code: 'connect(global_network);\nscale(infinite);' }
];

// Floating SVG Orb
function Orb({ className, size = 300, color = '#6366f1', delay = 0 }: any) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{ width: size, height: size, background: color, opacity: 0.15 }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

// Animated Grid Background
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Radial fade to hide grid edges */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 20%, #030712 80%)'
      }} />
    </div>
  );
}

// 3D Floating Element
function Floating3D() {
  const mesh = useRef<any>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.x = Math.cos(time / 4) * 0.2;
      mesh.current.rotation.y = Math.sin(time / 2) * 0.2;
    }
  });

  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={mesh} args={[1, 100, 100]} scale={2.4}>
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.4}
          speed={3}
          roughness={0}
          metalness={1}
        />
      </Sphere>
    </Float>
  );
}

function ThreeScene() {
  return (
    <div className="absolute inset-0 z-0 opacity-40">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22c55e" />
        <Floating3D />
      </Canvas>
    </div>
  );
}

// 3D + Sliding Image Hero Element
function HeroVisual() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="relative w-full max-w-lg lg:max-w-2xl mx-auto aspect-square flex items-center justify-center scale-75 sm:scale-90 lg:scale-100"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
    >
      {/* 3D Scene in background */}
      <ThreeScene />

      {/* Hero Image Carousel */}
      <div className="relative z-10 w-[85%] h-[85%] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ x: 300, opacity: 0, scale: 1.1 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -300, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "anticipate" }}
            className="absolute inset-0"
          >
            <img 
              src={HERO_IMAGES[index].url} 
              alt="Developer Hub"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-60" />
            
            {/* Floating Code Snippet for current slide */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 glass p-3 sm:p-4 rounded-2xl border border-white/10 min-w-[140px] sm:min-w-[180px]"
            >
              <div className="flex gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <code className="text-[10px] sm:text-xs text-indigo-300 font-mono whitespace-pre">
                {HERO_IMAGES[index].code}
              </code>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {HERO_IMAGES.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-indigo-500' : 'w-2 bg-white/20'}`} 
          />
        ))}
      </div>

      {/* Decorative Orbs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 blur-[80px] rounded-full animate-pulse" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-500/10 blur-[80px] rounded-full animate-pulse delay-700" />
    </motion.div>
  );
}

// Typewriter effect component
function Typewriter() {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const words = ['Developers', 'Engineers', 'Collaborators', 'Innovators'];

  useEffect(() => {
    let timer = setTimeout(() => {
      const i = loopNum % words.length;
      const fullText = words[i];

      setDisplayText(isDeleting 
        ? fullText.substring(0, displayText.length - 1)
        : fullText.substring(0, displayText.length + 1)
      );

      setTypingSpeed(isDeleting ? 80 : 150);

      if (!isDeleting && displayText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum, typingSpeed]);

  return <span className="text-gradient">{displayText}<span className="animate-pulse">|</span></span>;
}

// Documentation Modal Component
function DocumentationModal({ isOpen, onClose, feature }: { isOpen: boolean, onClose: () => void, feature: any }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[#0f111a] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${feature.color}20` }}>
                {React.createElement(feature.icon, { size: 20, style: { color: feature.color } })}
              </div>
              <h2 className="text-xl font-bold text-white">{feature.title} Documentation</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="p-8 overflow-y-auto space-y-6 text-slate-300">
            <section>
              <h3 className="text-white font-semibold mb-2">Overview</h3>
              <p className="text-sm leading-relaxed">{feature.desc}</p>
            </section>
            <section>
              <h3 className="text-white font-semibold mb-2">How it works</h3>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 font-mono text-xs text-indigo-300">
                {`// HackerHouse API Integration\nasync function initialize${feature.title.replace(/\s+/g, '')}() {\n  const config = await HH.getFeatureConfig('${feature.title.toLowerCase()}');\n  return HH.connect(config);\n}`}
              </div>
            </section>
            <section className="space-y-3">
              <h3 className="text-white font-semibold">Key Benefits</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Zap size={14} className="text-indigo-400" /> Enterprise-grade security and reliability</li>
                <li className="flex items-center gap-2"><Zap size={14} className="text-indigo-400" /> Seamless integration with existing workflows</li>
                <li className="flex items-center gap-2"><Zap size={14} className="text-indigo-400" /> Real-time data synchronization and low latency</li>
              </ul>
            </section>
          </div>
          <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end">
            <button onClick={onClose} className="btn-primary py-2 px-6">Got it</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Stats badge
function StatBadge({ icon: Icon, value, label, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass rounded-2xl px-5 py-4 flex items-center gap-3 flex-1 min-w-[140px]"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(99,102,241,0.15)' }}>
        <Icon size={18} className="text-indigo-400" />
      </div>
      <div>
        <div className="text-xl font-bold text-white font-display">{value}</div>
        <div className="text-xs text-slate-500 whitespace-nowrap">{label}</div>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [skill, setSkill] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [searchType, setSearchType] = useState<'skill' | 'name'>('skill');
  const [coords, setCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionTimeout = useRef<any>(null);

  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);


  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&featuretype=city`);
      const data = await res.json();
      setLocationSuggestions(data);
    } catch (err) {
      console.error("Location search failed", err);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocation(val);
    setShowSuggestions(true);
    
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    suggestionTimeout.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 500);
  };
  const heroRef = useRef(null);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`
          );
          const data = await response.json();
          const addr = data.address;
          const area = addr.suburb || addr.neighborhood || addr.residential || addr.road || '';
          const city = addr.city || addr.town || addr.village || addr.state || addr.country;
          
          const displayLocation = area && city ? `${area}, ${city}` : city;
          if (displayLocation) setLocation(displayLocation);
        } catch (err) {
          console.error("Geocoding failed:", err);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
      }
    );
  };

  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (searchType === 'skill' && skill) params.append('skill', skill);
    if (searchType === 'name' && nameQuery) params.append('name', nameQuery);
    if (coords) {
      params.append('lat', coords.lat.toString());
      params.append('lon', coords.lon.toString());
    }
    navigate(`/search?${params.toString()}`);
  };

  const techLogos = ['React', 'Python', 'TypeScript', 'Node.js', 'Go', 'Rust', 'Swift', 'Kotlin'];

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: '#030712' }}>
      <GridBackground />

      {/* Orbs */}
      <Orb className="top-20 left-1/4" size={500} color="#6366f1" delay={0} />
      <Orb className="top-40 right-1/4" size={400} color="#22c55e" delay={2} />
      <Orb className="bottom-1/3 left-1/3" size={350} color="#818cf8" delay={4} />

      {/* Hero Section */}
      <motion.section ref={heroRef} style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-[90vh] flex items-center pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left Content */}
            <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs md:text-sm"
              >
                <Zap size={14} className="text-yellow-400" />
                <span className="text-slate-300">Connect with devs near you</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight font-display">
                  <span className="text-white block">Find Elite</span>
                  <Typewriter />
                  <span className="text-white block">Near You.</span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-base md:text-lg text-slate-400 max-w-lg leading-relaxed"
              >
                HackerHouse uses GitHub intelligence + GPS proximity to match you with top engineers in your city. From discovery to contract — all in one platform.
              </motion.p>

              {/* Search bar */}
              <div className="flex justify-center mb-4">
                <div className="glass p-1 rounded-xl border border-white/10 flex gap-1">
                  <button onClick={() => setSearchType('skill')} 
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${searchType === 'skill' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}>
                    Skills
                  </button>
                  <button onClick={() => setSearchType('name')} 
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${searchType === 'name' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}>
                    Name
                  </button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="glass rounded-2xl p-2 md:p-3 flex flex-col md:flex-row gap-2 md:gap-3 max-w-xl"
                style={{ border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <div className="flex-1 flex items-center gap-2 px-3 py-2 border-b border-white/5 md:border-b-0 relative group">
                  <MapPin size={16} className={`shrink-0 transition-colors ${isLocating ? 'text-indigo-400 animate-bounce' : 'text-slate-500'}`} />
                  <input
                    type="text"
                    value={location}
                    onChange={handleLocationChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Your city..."
                    className="bg-transparent w-full text-sm text-slate-200 placeholder-slate-600 outline-none relative z-10"
                  />
                  <button 
                    onClick={detectLocation}
                    title="Detect current location"
                    className="absolute right-2 p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
                  </button>
                  
                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 w-full mt-2 glass rounded-xl overflow-hidden z-50 border border-white/10 shadow-2xl flex flex-col"
                      >
                        {locationSuggestions.map((sug, i) => {
                          const nameParts = sug.display_name.split(',');
                          const mainName = nameParts[0].trim();
                          const subName = nameParts.slice(1, 3).join(',').trim();
                          return (
                            <div
                              key={i}
                              className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 text-sm text-slate-300 flex items-center gap-3"
                              onClick={() => {
                                setLocation(mainName);
                                setCoords({ lat: parseFloat(sug.lat), lon: parseFloat(sug.lon) });
                                setShowSuggestions(false);
                              }}
                            >
                              <MapPin size={14} className="text-slate-500 shrink-0" />
                              <div className="min-w-0">
                                <div className="font-medium text-white truncate">{mainName}</div>
                                <div className="text-xs text-slate-500 truncate">{subName}</div>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="w-px bg-white/10 hidden md:block" />
                <div className="flex-1 flex items-center gap-2 px-3 py-2">
                  {searchType === 'skill' ? (
                    <>
                      <Code2 size={16} className="text-green-400 shrink-0" />
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        placeholder="Skills (React...)"
                        className="bg-transparent w-full text-sm text-slate-200 placeholder-slate-600 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </>
                  ) : (
                    <>
                      <Users size={16} className="text-blue-400 shrink-0" />
                      <input
                        type="text"
                        value={nameQuery}
                        onChange={(e) => setNameQuery(e.target.value)}
                        placeholder="Developer Name..."
                        className="bg-transparent w-full text-sm text-slate-200 placeholder-slate-600 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </>
                  )}
                </div>
                <button onClick={handleSearch} className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap py-3 md:py-2 px-6">
                  <Search size={16} />
                  <span>Search</span>
                </button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-wrap gap-3 md:gap-4"
              >
                <StatBadge icon={Users} value="12K+" label="Developers" delay={0.5} />
                <StatBadge icon={Star} value="4.9★" label="Avg Rating" delay={0.6} />
                <StatBadge icon={Globe} value="48" label="Cities" delay={0.7} />
              </motion.div>
            </div>

            {/* Right: Visual */}
            <div className="order-1 lg:order-2">
              <HeroVisual />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Tech Marquee */}
      <section className="py-8 border-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex gap-8 overflow-hidden">
          <motion.div
            className="flex gap-8 shrink-0"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {[...techLogos, ...techLogos].map((tech, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-500 text-sm font-medium whitespace-nowrap">
                <Terminal size={14} className="text-indigo-500" />
                {tech}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4 font-display">
              Everything you need to <span className="text-gradient">collaborate</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">From finding talent to signing contracts and communicating in real-time.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Code2, title: 'GitHub Intelligence', color: '#6366f1',
                desc: 'Leverage deep integration with the GitHub API to analyze repository quality, contribution velocity, and language proficiency. We verify expertise through real-world code metrics and project history.',
                gradient: 'from-indigo-500/20 to-transparent'
              },
              {
                icon: MapPin, title: 'GPS-Based Matching', color: '#22c55e',
                desc: 'Optimize your collaboration by finding talent in your immediate vicinity. Our proximity engine uses geolocation to rank developers by distance, making in-person meetups seamless.',
                gradient: 'from-green-500/20 to-transparent'
              },
              {
                icon: MessageCircle, title: 'Real-time Collaboration', color: '#f59e0b',
                desc: 'Streamline your workflow with integrated real-time communication. Securely manage contracts, conduct video consultations, and exchange messages in a unified workspace.',
                gradient: 'from-amber-500/20 to-transparent'
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="glass-hover rounded-2xl p-8 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110"
                    style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}30` }}>
                    <Icon size={22} style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-display">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  <div 
                    onClick={() => { setSelectedFeature(feature); setIsDocModalOpen(true); }}
                    className="flex items-center gap-2 mt-6 text-sm font-medium transition-all hover:opacity-80"
                    style={{ color: feature.color }}
                  >
                    <span>Learn more</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Detailed Info Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold text-white leading-tight font-display">
                Precision Matching.<br />
                <span className="text-gradient">Local Connection.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                HackerHouse isn't just another platform; it's a specialized ecosystem for high-performance engineering teams. We bridge the gap between digital expertise and physical proximity, facilitating high-bandwidth collaboration that remote-only environments can't replicate.
              </p>
              
              <div className="space-y-4 pt-4">
                {[
                  { title: "Verified Skillsets", desc: "Cross-referenced with GitHub and production history to ensure expertise is real." },
                  { title: "Seamless Onboarding", desc: "Integrated contract and payment management tools designed for modern developers." },
                  { title: "Hyper-Local Focus", desc: "Reduce latency in communication by finding talent in your immediate time zone and city." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{item.title}</h4>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass rounded-3xl p-1 overflow-hidden">
                <div className="bg-slate-900/50 rounded-[22px] p-8 aspect-video flex items-center justify-center relative overflow-hidden">
                   {/* Mock UI/Visual */}
                   <div className="absolute inset-0 noise-bg opacity-20" />
                   <div className="relative z-10 text-center">
                      <div className="inline-block p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
                        <Terminal size={32} className="text-indigo-400" />
                      </div>
                      <p className="text-slate-300 font-mono text-sm">Waiting for connection...</p>
                      <div className="flex gap-2 justify-center mt-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-75" />
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150" />
                      </div>
                   </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-500/10 blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-12 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,197,94,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.2), transparent 70%)' }} />
            <h2 className="relative text-4xl font-black text-white mb-4 font-display">
              Ready to find your next<br /><span className="text-gradient">collaborator?</span>
            </h2>
            <p className="relative text-slate-400 mb-8">Join 12,000+ developers already building together on HackerHouse.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/search')}
              className="relative btn-primary text-lg px-8 py-4 inline-flex items-center gap-3"
            >
              <Search size={18} />
              Explore Developers
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      </section>
      <AIAgent />
      {selectedFeature && (
        <DocumentationModal 
          isOpen={isDocModalOpen} 
          onClose={() => setIsDocModalOpen(false)} 
          feature={selectedFeature} 
        />
      )}
    </div>
  );
}
