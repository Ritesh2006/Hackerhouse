import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import { usersApi } from '../lib/api';

export default function ActivateTrial() {
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  
  const [status, setStatus] = useState<'pending' | 'activating' | 'success' | 'error'>('pending');
  const [errorMsg, setErrorMsg] = useState('');

  const handleActivate = async () => {
    if (!sid) {
      setStatus('error');
      setErrorMsg('Invalid session parameters.');
      return;
    }
    
    setStatus('activating');
    try {
      const res = await usersApi.activateTrialSession(sid);
      if (res.data?.status === 'activated') {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg('Failed to authorize payment session.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || 'Activation server error.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#050914' }}>
      {/* Dynamic Background */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)', filter: 'blur(40px)' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-[2rem] w-full max-w-sm p-8 text-center z-10 border border-white/8 shadow-2xl"
        style={{ background: 'linear-gradient(145deg, rgba(15,22,45,0.95), rgba(10,15,35,0.98))' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

        {status === 'pending' && (
          <>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Sparkles size={28} />
            </div>
            <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Activate Trial Account
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed mb-8">
              Click authorize to start your 14-day free trial subscription and unlock all platform capabilities.
            </p>
            <button
              onClick={handleActivate}
              className="w-full btn-primary py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              Authorize Activation
            </button>
          </>
        )}

        {status === 'activating' && (
          <div className="py-8">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-300 font-bold text-sm">Authorizing secure trial token...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Trial Activated!
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Your session has been securely synchronized. Your laptop screen should unlock immediately.
            </p>
            <div className="text-[10px] text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/10 py-1.5 px-3 rounded-full inline-block">
              Connection Synced
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <span className="text-2xl font-black">!</span>
            </div>
            <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Activation Failed
            </h2>
            <p className="text-rose-400 text-xs leading-relaxed mb-8">
              {errorMsg}
            </p>
            <button
              onClick={() => setStatus('pending')}
              className="w-full py-3.5 rounded-xl font-bold text-sm border border-white/10 hover:bg-white/5 text-white transition-all"
            >
              Try Again
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
