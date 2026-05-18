import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, Terminal, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.05,
        size: Math.random() * 2 + 0.5,
      });
    }
    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129,140,248,${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-16 relative overflow-hidden" style={{ background: '#050914' }}>
      <ParticleField />

      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)', filter: 'blur(40px)', animation: 'breathe 8s ease-in-out infinite' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)', filter: 'blur(40px)', animation: 'breathe 10s ease-in-out 2s infinite' }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Card */}
        <div className="relative rounded-[2rem] overflow-hidden" style={{ background: 'linear-gradient(145deg, rgba(15,22,45,0.9), rgba(10,15,35,0.95))', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.05), inset 0 1px 0 rgba(255,255,255,0.07)' }}>

          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(16,185,129,0.5), transparent)' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.15), transparent 70%)', filter: 'blur(20px)' }} />

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}
              >
                <Sparkles size={28} className="text-white" />
                <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)', borderTop: '1px solid rgba(255,255,255,0.3)' }} />
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
                Welcome back
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-slate-400 text-sm">
                Sign in to your <span className="text-gradient font-semibold">HackerHouse</span> account
              </motion.p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 16 }} exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-2xl text-red-300 text-sm text-center font-medium"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    ⚠️ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wide uppercase ml-1">Email</label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-200 ${focused === 'email' ? 'text-indigo-400' : 'text-slate-500'}`}>
                    <Mail size={16} />
                  </div>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    placeholder="you@example.com"
                    className="input-field pl-11"
                    style={{ borderRadius: '14px' }}
                  />
                  {focused === 'email' && (
                    <motion.div layoutId="inputFocus" className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }} />
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-400 tracking-wide uppercase">Password</label>
                  <button type="button" className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Forgot?</button>
                </div>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-200 ${focused === 'password' ? 'text-indigo-400' : 'text-slate-500'}`}>
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••••"
                    className="input-field pl-11 pr-12"
                    style={{ borderRadius: '14px' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {focused === 'password' && (
                    <motion.div layoutId="inputFocus" className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }} />
                  )}
                </div>
              </div>

              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-base mt-6"
              >
                {loading ? (
                  <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2.5 }} />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-[11px] text-slate-600 font-bold uppercase tracking-widest">Or continue with</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button whileHover={{ y: -1, scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Iv1.6a9f43c49e29a8a7';
                  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user`;
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-slate-300 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Terminal size={15} />
                GitHub
              </motion.button>
              <motion.button whileHover={{ y: -1, scale: 1.01 }} whileTap={{ scale: 0.98 }}
                disabled
                className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                title="Google login coming soon">
                <Globe size={15} />
                Google
              </motion.button>
            </div>

            <p className="mt-7 text-center text-sm text-slate-500">
              No account?{' '}
              <Link to="/signup" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                Create one free →
              </Link>
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex justify-center items-center gap-6 mt-6 text-xs text-slate-600">
          {['256-bit SSL', 'Zero-log policy', 'GDPR compliant'].map(t => (
            <span key={t} className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500/60" />
              {t}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
