import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }}
      className="glass-hover rounded-2xl p-5 text-center relative overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="absolute top-0 inset-x-0 h-0.5 opacity-0 hover:opacity-100 transition-opacity" style={{ background: color }} />
      <div className="w-11 h-11 rounded-2xl mx-auto mb-3.5 flex items-center justify-center"
        style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="text-2xl font-black text-white font-display" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {typeof value === 'number' ? value.toLocaleString() : (value || '0')}
      </div>
      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{label}</div>
    </motion.div>
  );
}
