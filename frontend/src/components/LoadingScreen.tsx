import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: '#050914' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 60%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative flex items-center justify-center">
        {/* Spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute w-24 h-24 rounded-full"
          style={{ border: '2px solid transparent', borderTopColor: 'rgba(99,102,241,0.6)', borderRightColor: 'rgba(99,102,241,0.2)' }}
        />

        {/* Breathing glow ring */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-28 h-28 rounded-full"
          style={{ border: '1px solid rgba(99,102,241,0.15)' }}
        />

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-14 h-14 rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 0 40px rgba(99,102,241,0.35)' }}
        >
          <img src="/logo.png" alt="HackerHouse" className="w-full h-full object-cover"
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;font-weight:900;font-size:24px;font-family:Outfit">H</div>';
            }}
          />
        </motion.div>
      </div>

      {/* Brand text */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-10 text-center"
      >
        <h1 className="text-xl font-black tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <span className="text-gradient">Hacker</span>
          <span className="text-white">House</span>
        </h1>
        <motion.p
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-indigo-400/50 text-[11px] font-semibold tracking-[0.25em] uppercase mt-3"
        >
          Loading workspace
        </motion.p>
      </motion.div>

      {/* Progress bar */}
      <motion.div className="mt-8 w-32 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1] }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #6366f1, #10b981)' }}
        />
      </motion.div>
    </motion.div>
  );
}
