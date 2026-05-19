import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Briefcase, ArrowRight, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';

const roles = [
  { value: 'developer', label: 'Developer', desc: 'I build & ship code', emoji: '⚡' },
  { value: 'employer', label: 'Employer', desc: 'I hire talent', emoji: '🚀' },
];

import { useAuthStore } from '../stores/authStore';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'developer' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.register(formData);
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create account');
    } finally { setLoading(false); }
  };

  const inputClass = "input-field";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16 relative overflow-hidden" style={{ background: 'var(--color-background)' }}>
      {/* Orbs */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, var(--color-primary-glow), transparent 70%)', filter: 'blur(60px)', animation: 'breathe 9s ease-in-out infinite' }} />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)', filter: 'blur(50px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[520px] relative z-10"
      >
        <div className="relative rounded-[2rem] overflow-hidden"
          style={{ background: 'linear-gradient(145deg, rgba(15,22,45,0.9), rgba(10,15,35,0.95))', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)' }}>

          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--color-primary), rgba(16,185,129,0.5), transparent)' }} />

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary, #10b981))', boxShadow: '0 8px 32px var(--color-primary-glow)' }}>
                <Sparkles size={28} className="text-white" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1.5" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>Join HackerHouse</h1>
              <p className="text-slate-400 text-sm">Connect with elite developers around the world</p>
            </div>

            {/* Role picker */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {roles.map(r => (
                <motion.button key={r.value} type="button" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, role: r.value })}
                  className="relative p-4 rounded-2xl text-left transition-all"
                  style={{
                    background: formData.role === r.value ? 'var(--color-primary-glow)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${formData.role === r.value ? 'var(--color-primary)' : 'rgba(255,255,255,0.07)'}`,
                  }}>
                  {formData.role === r.value && (
                    <motion.div layoutId="roleCheck" className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--color-primary-glow)', border: '1px solid var(--color-primary)' }}>
                      <Check size={11} className="text-primary-light" />
                    </motion.div>
                  )}
                  <div className="text-xl mb-1">{r.emoji}</div>
                  <div className="font-bold text-white text-sm">{r.label}</div>
                  <div className="text-[11px] text-slate-500">{r.desc}</div>
                </motion.button>
              ))}
            </div>

            <form onSubmit={handleSignup}>
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-2xl text-red-300 text-sm text-center font-medium mb-4"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    ⚠️ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-400 tracking-wide uppercase ml-1">Full Name</label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors ${focused === 'name' ? 'text-primary' : 'text-slate-500'}`}><User size={15} /></div>
                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} placeholder="Jane Smith" className={`${inputClass} pl-11`} style={{ borderRadius: '14px' }} />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-400 tracking-wide uppercase ml-1">Email</label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors ${focused === 'email' ? 'text-primary' : 'text-slate-500'}`}><Mail size={15} /></div>
                    <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} placeholder="jane@example.com" className={`${inputClass} pl-11`} style={{ borderRadius: '14px' }} />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-400 tracking-wide uppercase ml-1">Password</label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors ${focused === 'password' ? 'text-primary' : 'text-slate-500'}`}><Lock size={15} /></div>
                    <input type={showPass ? 'text' : 'password'} required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} placeholder="••••••••••" className={`${inputClass} pl-11 pr-11`} style={{ borderRadius: '14px' }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Role display */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-400 tracking-wide uppercase ml-1">Role</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500"><Briefcase size={15} /></div>
                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className={`${inputClass} pl-11 appearance-none`} style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)' }}>
                      {roles.map(r => <option key={r.value} value={r.value} style={{ background: '#0a0f1e' }}>{r.label}</option>)}
                    </select>
                  </div>
                </div>

                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="col-span-2 btn-primary py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-base mt-3">
                  {loading ? (
                    <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2.5 }} />
                  ) : (
                    <><span>Create Account</span><ArrowRight size={17} /></>
                  )}
                </motion.button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already on HackerHouse?{' '}
              <Link to="/login" className="text-primary font-bold hover:text-primary-light transition-colors">Sign in →</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
