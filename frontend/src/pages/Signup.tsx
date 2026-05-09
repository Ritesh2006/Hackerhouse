import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authApi.register(formData);
      
      // Auto login after signup
      const loginRes = await authApi.login({ 
        email: formData.email, 
        password: formData.password 
      });
      
      localStorage.setItem('token', loginRes.data.access_token);
      
      // Fetch user info to sync ID
      const userRes = await authApi.getMe();
      const userId = userRes.data.id || userRes.data._id;
      if (userId) {
        localStorage.setItem('user_id', userId);
        localStorage.setItem('chat_user_id', userId);
      }
      
      alert('Account created successfully!');
      navigate('/dashboard');
      window.location.reload();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to create account';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-4 flex items-center justify-center relative overflow-hidden bg-[#030014]">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 border border-white/10 shadow-2xl shadow-indigo-500/5">
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20"
            >
              <Sparkles className="text-white" size={32} />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2 font-display">Join HackerHouse</h2>
            <p className="text-slate-400 text-sm">Find top developers or land your next professional contract</p>
          </div>

          <form onSubmit={handleSignup} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="col-span-1 sm:col-span-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2 col-span-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2 col-span-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                  placeholder="john@hackerhouse.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 ml-1">Account Role</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Briefcase size={18} />
                </div>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all appearance-none cursor-pointer"
                >
                  <option value="developer" className="bg-[#030014]">Developer</option>
                  <option value="employer" className="bg-[#030014]">Employer</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="col-span-1 sm:col-span-2 btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-bold group shadow-lg shadow-indigo-500/20 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Professional Account</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account? {' '}
            <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Sign in here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
