import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Terminal, Globe, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('token', res.data.access_token);
      
      // Fetch user info to sync ID
      const userRes = await authApi.getMe();
      const userId = userRes.data.id || userRes.data._id;
      if (userId) {
        localStorage.setItem('user_id', userId);
        localStorage.setItem('chat_user_id', userId);
      }
      
      alert('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-4 flex items-center justify-center relative overflow-hidden bg-[#030014]">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 border border-white/10 shadow-2xl shadow-indigo-500/5">
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20"
            >
              <Shield className="text-white" size={32} />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2 font-display">Welcome Back</h2>
            <p className="text-slate-400">Log in to your HackerHouse professional account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <button type="button" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Forgot Password?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-bold group shadow-lg shadow-indigo-500/20 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center gap-4 mb-6">
              <div className="flex-1 h-[1px] bg-white/5" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Or continue with</span>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all active:scale-95">
                <Terminal size={16} /> GitHub
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all active:scale-95">
                <Globe size={16} /> Google
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account? {' '}
            <Link to="/signup" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Create account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
