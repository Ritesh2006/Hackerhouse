import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';

export default function LoadingScreen() {
  const dashes = Array.from({ length: 8 });

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030712]"
    >
      <div className="relative flex items-center justify-center">
        {/* Central Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl"
          style={{ boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)' }}
        >
          <Code2 size={32} className="text-white" />
        </motion.div>

        {/* Rotating Dashes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: '120px', height: '120px' }}
        >
          {dashes.map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-indigo-500/40 rounded-full"
              style={{
                width: '12px',
                height: '4px',
                left: '50%',
                top: '50%',
                transformOrigin: '0 0',
                transform: `rotate(${i * 45}deg) translate(40px, -2px)`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                backgroundColor: ['rgba(99, 102, 241, 0.4)', 'rgba(34, 197, 94, 0.8)', 'rgba(99, 102, 241, 0.4)'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* Outer Glow Ring */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-32 h-32 rounded-full border border-indigo-500/10"
        />
      </div>

      {/* Brand Text */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-12 text-center"
      >
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">Hacker</span>
          <span className="text-white">House</span>
        </h1>
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-indigo-400/60 text-xs font-medium tracking-[0.2em] uppercase mt-2"
        >
          Initializing Environment
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
