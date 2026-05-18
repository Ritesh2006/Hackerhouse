import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, GitBranch, SortAsc, Search, Code2, ChevronDown, Sparkles, ExternalLink, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usersApi } from '../lib/api';

const SKILL_COLORS: Record<string, string> = {
  React: '#61dafb', TypeScript: '#3178c6', Python: '#4ade80', 'Node.js': '#68a063',
  AWS: '#ff9900', FastAPI: '#009688', PostgreSQL: '#336791', Docker: '#2496ed',
  Vue: '#42d392', Go: '#00add8', Kubernetes: '#326ce5', ML: '#ff6f00',
  Swift: '#ff5f57', Rust: '#f46623', Solidity: '#363636', Web3: '#f6851b',
};

function DevCard({ dev, index }: { dev: any; index: number }) {
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
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
    >
      <div
        ref={cardRef}
        onClick={() => navigate(`/profile/${dev.id}`)}
        onMouseMove={handleMouseMove}
        className="card-devcard p-6 cursor-pointer group"
      >
        {/* Dynamic radial glow overlay */}
        <div className="blur-glow-overlay" />

        {/* Top accent on hover */}
        <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-10"
          style={{ background: 'linear-gradient(90deg, #6366f1, #10b981)' }} />

        {/* Header row */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
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
              {/* Online dot */}
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

          {/* Rate & status */}
          <div className="text-right shrink-0 ml-2">
            <div className="text-white font-black text-sm">${dev.hourly_rate || '95'}<span className="text-slate-500 font-normal text-xs">/hr</span></div>
            <div className="flex items-center gap-1 mt-1">
              <Star size={10} className="text-amber-400" fill="currentColor" />
              <span className="text-xs font-bold text-amber-400">{dev.rating || '4.8'}</span>
            </div>
          </div>
        </div>

        {/* Bio, Skills, and Footer wrapped in z-10 */}
        <div className="relative z-10">
          {/* Bio */}
          <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2 text-[13.5px]">
            {dev.bio || 'Professional developer and HackerHouse community member.'}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {skills.slice(0, 5).map((skill: string) => (
              <span key={skill} className="skill-tag"
                style={{
                  background: `${SKILL_COLORS[skill] || '#6366f1'}12`,
                  color: SKILL_COLORS[skill] || '#a5b4fc',
                  border: `1px solid ${SKILL_COLORS[skill] || '#6366f1'}25`,
                }}>
                {skill}
              </span>
            ))}
            {skills.length > 5 && (
              <span className="skill-tag" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(148,163,184,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
                +{skills.length - 5}
              </span>
            )}
          </div>

          {/* Footer */}
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

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card-devcard p-6">
          <div className="flex gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl skeleton" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-32 skeleton" />
              <div className="h-3 w-20 skeleton" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 w-full skeleton" />
            <div className="h-3 w-4/5 skeleton" />
          </div>
          <div className="flex gap-2 mb-4">
            {[60, 72, 52].map((w, j) => <div key={j} className="h-6 rounded-lg skeleton" style={{ width: w }} />)}
          </div>
          <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="flex justify-between pt-3">
            <div className="h-3 w-24 skeleton" />
            <div className="h-3 w-16 skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [developers, setDevelopers] = useState<any[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('distance');
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchDevelopers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        skill: searchParams.get('skill') || undefined,
        name: searchParams.get('name') || undefined,
        location: searchParams.get('location') || undefined,
        lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
        lon: searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : undefined,
      };
      const res = await usersApi.getUsers(params);
      if (res.data?.success) {
        setDevelopers(Array.isArray(res.data.data) ? res.data.data : []);
        setIsFallback(!!res.data.is_fallback);
      } else {
        setDevelopers(Array.isArray(res.data) ? res.data : []);
        setIsFallback(false);
      }
    } catch { setDevelopers([]); } finally { setLoading(false); }
  }, [searchParams]);

  useEffect(() => { fetchDevelopers(); }, [fetchDevelopers]);

  const sorted = [...developers].sort((a, b) => {
    if (sortBy === 'distance') return (a.distance_km || 9999) - (b.distance_km || 9999);
    if (sortBy === 'stars') return (b.total_stars || 0) - (a.total_stars || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className="min-h-screen pt-28 pb-20 px-4" style={{ background: '#050914' }}>
      {/* Ambient background */}
      <div className="fixed top-0 inset-x-0 h-96 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 60% -20%, rgba(99,102,241,0.1), transparent 60%)' }} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.23, 1, 0.32, 1] }} className="mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 font-medium">
            <Search size={12} />
            <span>{searchParams.get('location') || 'Anywhere'}</span>
            {searchParams.get('skill') && (<>
              <span className="text-slate-700">·</span>
              <Code2 size={12} className="text-indigo-500" />
              <span className="text-indigo-400/80">{searchParams.get('skill')}</span>
            </>)}
          </div>

          {isFallback && !loading && (
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-amber-400 text-sm font-semibold mb-5"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Sparkles size={14} />
              No exact match — showing best available developers
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
                {loading ? (
                  <span className="flex items-center gap-3">
                    <div className="spinner" style={{ width: 28, height: 28 }} />
                    Searching...
                  </span>
                ) : (
                  <>{developers.length} Developer{developers.length !== 1 ? 's' : ''} <span className="text-gradient">Found</span></>
                )}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {loading ? 'Analyzing talent across the network…' : isFallback ? 'Expanded search to show top talent' : 'Sorted by your criteria'}
              </p>
            </div>

            {/* Sort */}
            <div className="relative">
              <button onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-all glass"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <SortAsc size={15} className="text-indigo-400" />
                Sort: <span className="text-indigo-400 capitalize">{sortBy}</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {filterOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-12 rounded-2xl p-2 w-44 z-20 shadow-2xl"
                    style={{ background: 'rgba(13,18,40,0.98)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
                    {['distance', 'stars', 'rating'].map(opt => (
                      <button key={opt} onClick={() => { setSortBy(opt); setFilterOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm capitalize font-semibold transition-all ${sortBy === opt ? 'text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        style={{ background: sortBy === opt ? 'rgba(99,102,241,0.12)' : undefined }}>
                        {opt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        {loading ? <LoadingSkeleton /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sorted.map((dev, i) => <DevCard key={dev.id || i} dev={dev} index={i} />)}
            {developers.length === 0 && (
              <div className="col-span-full text-center py-24">
                <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <Users size={36} className="text-indigo-400/60" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">No developers found</h3>
                <p className="text-slate-500 text-sm">Try broadening your search or clearing filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
