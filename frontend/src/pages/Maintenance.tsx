import { motion } from 'framer-motion';
import { Settings, Wrench, ShieldAlert } from 'lucide-react';

export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#050914' }}>
      {/* Background glowing shapes */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-20" 
        style={{ background: 'radial-gradient(circle, var(--color-primary), transparent 70%)', filter: 'blur(60px)' }} 
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] rounded-full pointer-events-none opacity-15" 
        style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)', filter: 'blur(70px)' }} 
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="maintenance-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#maintenance-grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative rounded-[2.5rem] w-full max-w-lg p-8 sm:p-12 text-center z-10 border border-white/8 shadow-2xl overflow-hidden"
        style={{ background: 'linear-gradient(145deg, rgba(15,22,45,0.92), rgba(10,15,35,0.96))' }}
      >
        {/* Amber top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        {/* Animated Gears Logo Container */}
        <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping opacity-40" style={{ animationDuration: '3s' }} />
          
          {/* Rotating outer tech circle */}
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-indigo-500/30 animate-spin" style={{ animationDuration: '20s' }} />

          {/* Large Gear */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute text-amber-500/80"
          >
            <Settings size={64} className="drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
          </motion.div>

          {/* Small Gear */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
            className="absolute text-indigo-400/80 -top-1 -right-1"
          >
            <Settings size={36} className="drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
          </motion.div>

          {/* Inner Wrench Icon */}
          <div className="absolute w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-white z-10 shadow-lg">
            <Wrench size={18} className="animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 
          className="text-3xl sm:text-4xl font-black text-white leading-tight font-display tracking-tight mb-4" 
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Under Maintenance
        </h1>

        {/* Description */}
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-sm mx-auto">
          We are currently upgrading our repository indexing nodes and database servers to enhance matchmaking latency. We will be back online shortly!
        </p>

        {/* Status indicator bar */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-left max-w-xs mx-auto mb-6">
          <ShieldAlert size={20} className="text-amber-500 shrink-0 animate-bounce" />
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">System Status</div>
            <div className="text-xs font-bold text-slate-300">Database Optimization (82% Complete)</div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full max-w-xs mx-auto h-1.5 bg-white/5 rounded-full overflow-hidden mb-8 border border-white/5 relative">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "82%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500"
          />
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">
          HackerHouse Network Operations
        </div>
      </motion.div>
    </div>
  );
}
