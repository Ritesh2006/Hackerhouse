import { motion, AnimatePresence } from 'framer-motion';
import { SortAsc, Search, Code2, ChevronDown, Sparkles, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../lib/api';
import DevCard from '../components/DevCard';

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
    <div className="min-h-screen pt-28 pb-20 px-4" style={{ background: 'var(--color-background)' }}>
      {/* Ambient background */}
      <div className="fixed top-0 inset-x-0 h-96 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 60% -20%, var(--color-primary-glow), transparent 60%)' }} />

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
            {sorted.map((dev, i) => <DevCard key={dev.id || dev._id || i} dev={dev} index={i} />)}
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
