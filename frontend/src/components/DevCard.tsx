import { motion } from 'framer-motion';
import { Star, MapPin, GitBranch, ExternalLink } from 'lucide-react';
import { useNavigate, useRef } from 'react-router-dom';

const SKILL_COLORS: Record<string, string> = {
  React: '#61dafb', TypeScript: '#3178c6', Python: '#4ade80', 'Node.js': '#68a063',
  AWS: '#ff9900', FastAPI: '#009688', PostgreSQL: '#336791', Docker: '#2496ed',
  Vue: '#42d392', Go: '#00add8', Kubernetes: '#326ce5', ML: '#ff6f00',
  Swift: '#ff5f57', Rust: '#f46623', Solidity: '#363636', Web3: '#f6851b',
};

interface DevCardProps {
  dev: any;
  index: number;
}

export default function DevCard({ dev, index }: DevCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const skills = Array.isArray(dev.skills) ? dev.skills : [];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}>
      <div ref={cardRef} onClick={() => navigate(`/profile/${dev.id}`)} onMouseMove={handleMouseMove}
        className="card-devcard p-6 cursor-pointer group">
        <div className="blur-glow-overlay" />
        <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-10"
          style={{ background: 'linear-gradient(90deg, #6366f1, #10b981)' }} />

        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/5 group-hover:ring-indigo-500/30 transition-all duration-300 group-hover:scale-105 image-glow-hover shine-sheen">
                {dev.avatar_url ? (
                  <img src={dev.avatar_url} alt={dev.full_name || dev.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-lg"
                    style={{ background: `linear-gradient(135deg, #6366f1, ${SKILL_COLORS[skills[0]] || '#4f46e5'})` }}>
                    {(dev.full_name || dev.name || 'D').charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{ background: '#10b981', borderColor: '#050914' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-base leading-tight font-display truncate">
                {dev.full_name || dev.name || 'Anonymous Dev'}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <p className="text-indigo-400 text-xs font-semibold">@{dev.github_username || 'dev'}</p>
                {dev.source === 'github' && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-slate-400"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <GitBranch size={9} /> GH
                  </span>
                )}
                {(dev.linkedin_id || dev.source === 'linkedin') && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                    style={{ background: 'rgba(0,119,181,0.15)', border: '1px solid rgba(0,119,181,0.25)', color: '#60aee8' }}>
                    <ExternalLink size={9} /> in
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0 ml-2">
            <div className="text-white font-black text-sm">${dev.hourly_rate || '95'}<span className="text-slate-500 font-normal text-xs">/hr</span></div>
            <div className="flex items-center gap-1 mt-1">
              <Star size={10} className="text-amber-400" fill="currentColor" />
              <span className="text-xs font-bold text-amber-400">{dev.rating || '4.8'}</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2 text-[13.5px]">
            {dev.bio || 'Professional developer and HackerHouse community member.'}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {skills.slice(0, 5).map((skill: string) => (
              <span key={skill} className="skill-tag" style={{
                background: `${SKILL_COLORS[skill] || '#6366f1'}12`,
                color: SKILL_COLORS[skill] || '#a5b4fc',
                border: `1px solid ${SKILL_COLORS[skill] || '#6366f1'}25`,
              }}>{skill}</span>
            ))}
            {skills.length > 5 && (
              <span className="skill-tag" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(148,163,184,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
                +{skills.length - 5}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.055)' }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <GitBranch size={12} className="text-indigo-400" />
                <span className="text-slate-300 font-semibold">{dev.public_repos || 0}</span>
                <span>repos</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Star size={12} className="text-amber-400" />
                <span className="text-slate-300 font-semibold">{dev.total_stars || 0}</span>
                <span>stars</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={11} className="text-emerald-500" />
              <span>{dev.distance_km ? `${dev.distance_km.toFixed(1)} km` : dev.location_name || 'Remote'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
