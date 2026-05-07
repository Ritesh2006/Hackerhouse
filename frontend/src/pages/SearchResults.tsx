import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, GitBranch, SortAsc, Search, Code2, ChevronDown, ExternalLink } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usersApi } from '../lib/api';

const skillColors: Record<string, string> = {
  React: '#61dafb', TypeScript: '#3178c6', Python: '#4ade80', 'Node.js': '#68a063',
  AWS: '#ff9900', FastAPI: '#009688', PostgreSQL: '#336791', Docker: '#2496ed',
  Vue: '#42d392', Go: '#00add8', Kubernetes: '#326ce5', ML: '#ff6f00',
  Swift: '#ff5f57', 'React Native': '#61dafb', Firebase: '#ffca28', Figma: '#f24e1e',
  Rust: '#f46623', WebAssembly: '#654ff0', 'C++': '#00599c', Systems: '#6366f1',
  Solidity: '#363636', Web3: '#f6851b', 'ethers.js': '#6c47ff',
};

function DevCard({ dev, index }: { dev: any; index: number }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div onClick={() => navigate(`/profile/${dev.id}`)}>
        <div className="card-devcard p-6 cursor-pointer relative">
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: 'linear-gradient(90deg, #6366f1, #22c55e)', originX: 0 }}
              />
            )}
          </AnimatePresence>

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden shrink-0`}>
                {dev.avatar_url ? (
                  <img src={dev.avatar_url} alt={dev.name} className="w-full h-full object-cover" />
                ) : (
                  dev.name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2 font-display">
                  {dev.name}
                  <a href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(dev.name)}`} 
                     target="_blank" rel="noreferrer" 
                     className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 p-1 rounded-md"
                     onClick={(e) => e.stopPropagation()}
                     title="Search on LinkedIn">
                    <ExternalLink size={14} />
                  </a>
                </h3>
                <p className="text-indigo-400 text-sm">@{dev.github_username || 'dev'}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20`}>
              <span className={`w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse`} />
              Available
            </div>
          </div>

          <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2">{dev.bio || 'Professional Developer'}</p>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {dev.skills.map((skill: string) => (
              <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: `${skillColors[skill] || '#6366f1'}15`,
                  color: skillColors[skill] || '#818cf8',
                  border: `1px solid ${skillColors[skill] || '#6366f1'}30`
                }}>
                {skill}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <GitBranch size={13} className="text-indigo-400" />
                <span className="text-slate-300 font-medium">{dev.public_repos || 0}</span> repos
              </div>
              <div className="flex items-center gap-1.5">
                <Star size={13} className="text-yellow-400" />
                <span className="text-slate-300 font-medium">{dev.total_stars || 0}</span> stars
              </div>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-slate-500" />
              <span className="text-xs text-slate-400">{dev.distance_km ? `${dev.distance_km.toFixed(1)} km` : 'Local'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('distance');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const fetchDevelopers = async () => {
      setLoading(true);
      try {
        const skill = searchParams.get('skill');
        const name = searchParams.get('name');
        const location = searchParams.get('location');
        const lat = searchParams.get('lat');
        const lon = searchParams.get('lon');
        
        const res = await usersApi.getUsers({ 
          skill: skill || undefined, 
          name: name || undefined,
          location: location || undefined,
          lat: lat ? parseFloat(lat) : undefined,
          lon: lon ? parseFloat(lon) : undefined
        });
        setDevelopers(res.data);
      } catch (err) {
        console.error("Failed to fetch developers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevelopers();
  }, [searchParams]);

  return (
    <div className="min-h-screen pt-28 pb-16 px-4" style={{ background: '#030712' }}>
      <div className="fixed top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(ellipse, #6366f1, transparent)' }} />

      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 text-sm text-slate-500 mb-3 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
            <Search size={14} className="shrink-0" />
            <span>{searchParams.get('location') || 'Anywhere'}</span>
            {searchParams.get('skill') && <><span>·</span><Code2 size={14} className="shrink-0" /><span>{searchParams.get('skill')}</span></>}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white font-display">
                {loading ? 'Searching...' : `${developers.length} Developers Found`}
              </h1>
              <p className="text-slate-500 mt-1 text-sm md:text-base">Showing top matches for your criteria</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-xl text-sm font-medium glass border-white/10 text-slate-400 hover:text-white transition-all"
                >
                  <div className="flex items-center gap-2">
                    <SortAsc size={16} />
                    Sort: <span className="text-indigo-400 capitalize">{sortBy}</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {filterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-12 glass rounded-xl p-2 w-40 z-20 shadow-2xl"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {['distance', 'stars', 'rating'].map(opt => (
                        <button key={opt} onClick={() => { setSortBy(opt); setFilterOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-all ${sortBy === opt ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                          {opt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card-devcard p-6 border border-white/5 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/10" />
                    <div className="space-y-2">
                      <div className="w-32 h-5 bg-white/10 rounded-md" />
                      <div className="w-24 h-4 bg-white/10 rounded-md" />
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-white/10 rounded-full" />
                </div>
                <div className="space-y-2 mb-4">
                  <div className="w-full h-4 bg-white/10 rounded-md" />
                  <div className="w-5/6 h-4 bg-white/10 rounded-md" />
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  <div className="w-16 h-6 bg-white/10 rounded-lg" />
                  <div className="w-20 h-6 bg-white/10 rounded-lg" />
                  <div className="w-14 h-6 bg-white/10 rounded-lg" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex gap-4">
                    <div className="w-16 h-4 bg-white/10 rounded-md" />
                    <div className="w-16 h-4 bg-white/10 rounded-md" />
                  </div>
                  <div className="w-12 h-4 bg-white/10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {developers.map((dev, i) => <DevCard key={dev.id} dev={dev} index={i} />)}
            {developers.length === 0 && (
              <div className="col-span-full text-center py-20 glass rounded-3xl border-dashed border-white/10">
                <p className="text-slate-500">No developers found for this search. Try different skills or location.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
