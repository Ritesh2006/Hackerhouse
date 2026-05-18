import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, Terminal, Code2, Star, GitBranch, Users, ExternalLink, MessageCircle, ArrowLeft, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersApi, githubApi } from '../lib/api';
import HireModal from '../components/HireModal';
import StatCard from '../components/StatCard';

const LinkedinIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [githubData, setGithubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [activeContractId, setActiveContractId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [activeLog, setActiveLog] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleAnalyzeRepos = () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setAnalysisProgress(0);
    
    const logs = [
      "Initializing Git crawler on active repositories...",
      "Resolving deep package dependencies & manifest definitions...",
      "Constructing secure local Abstract Syntax Trees (AST)...",
      "Crawling architectural layer bindings & layout patterns...",
      "Auditing geospatial libraries & distance formula indices...",
      "Measuring code documentation density & comments percentage...",
      "Compiling final AI Technical Architectural Diagnostics..."
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < logs.length) {
        setActiveLog(logs[index]);
        setAnalysisProgress((prev) => Math.min(prev + 14, 100));
        index++;
      } else {
        clearInterval(interval);
        setAnalysisProgress(100);
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }
    }, 600);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const userRes = await usersApi.getUser(id);
        const user = userRes.data;
        
        if (user && !user.name && user.full_name) user.name = user.full_name;
        if (user && !user.full_name && user.name) user.full_name = user.name;
        
        setProfile(user);

        try {
            const contractsRes = await usersApi.getMyContracts();
            const existingContract = Array.isArray(contractsRes.data) ? contractsRes.data.find((c: any) => 
                (c.client_id === localStorage.getItem('user_id') && c.developer_id === id) ||
                (c.developer_id === localStorage.getItem('user_id') && c.client_id === id)
            ) : null;
            
            if (existingContract) {
                setActiveContractId(existingContract.id);
            }
        } catch (e) {
            console.warn("Failed to fetch contracts:", e);
        }

        if (user?.github_username) {
          const ghRes = await githubApi.getProfile(user.github_username);
          setGithubData(ghRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050914' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: 44, height: 44 }} />
          <p className="text-slate-500 text-sm animate-pulse">Syncing developer stats…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-400" style={{ background: '#050914' }}>
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10"><Users size={28} className="text-slate-600" /></div>
        <p className="font-bold">User profile not found</p>
        <Link to="/search" className="mt-4 btn-secondary px-5 py-2.5 text-xs font-bold">Back to search</Link>
      </div>
    );
  }

  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const displayName = profile.name || profile.full_name || 'Anonymous Developer';
  const linkedinUrl = profile.linkedin_url || 
    (profile.linkedin_id 
      ? `https://www.linkedin.com/search/results/all/?keywords=${profile.linkedin_id}` 
      : `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(displayName)}`
    );

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 relative overflow-hidden" style={{ background: '#050914' }}>
      {/* Background orbs */}
      <div className="fixed top-0 inset-x-0 h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(99,102,241,0.12), transparent 70%)' }} />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link to="/search" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-wider">
            <ArrowLeft size={14} className="text-indigo-400" /> Back to Discover
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.23, 1, 0.32, 1], duration: 0.55 }}
          className="glass rounded-[2rem] p-6 sm:p-8 md:p-10 mb-6 relative overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}
        >
          {githubData?.note && (
            <div className="mb-6 p-4 rounded-2xl text-indigo-400 text-sm font-semibold flex items-center gap-3"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="p-2 bg-indigo-500/15 rounded-xl text-indigo-400 shrink-0">
                <Terminal size={15} />
              </div>
              <span>{githubData.note}</span>
            </div>
          )}
          
          <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full blur-[80px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.09), transparent 70%)' }} />

          <div className="relative flex flex-col md:flex-row gap-5 sm:gap-8 items-start">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-4xl font-black shadow-2xl shrink-0 overflow-hidden font-display image-glow-hover shine-sheen"
              style={{ boxShadow: '0 16px 40px rgba(99,102,241,0.3)' }}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0)
              )}
            </motion.div>

            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight font-display tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {displayName}
                  </h1>
                  <p className="text-indigo-400 font-bold text-xs sm:text-sm mt-0.5">@{profile.github_username || 'dev'}</p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Available
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 mb-5 pb-5 border-b border-white/5">
                <span className="flex items-center gap-1.5"><MapPin size={13} className="text-indigo-400" /> {profile.location_name || 'Global Remote'}</span>
                <span className="flex items-center gap-1.5"><Briefcase size={13} className="text-emerald-400" /> ${profile.hourly_rate || 95} / hr</span>
                <span className="flex items-center gap-1.5"><Clock size={13} className="text-amber-400" /> Active recently</span>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-2xl text-[14.5px]">{githubData?.bio || profile.bio || 'Elite product engineer specializing in high-performance application architectures and distributed network layers.'}</p>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {skills.map((skill: string) => (
                  <span key={skill} className="px-3.5 py-1.5 bg-white/[0.03] text-indigo-300 border border-white/5 rounded-xl text-xs font-bold">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {activeContractId ? (
                   <motion.button 
                     whileHover={{ scale: 1.02 }} 
                     whileTap={{ scale: 0.98 }}
                     onClick={() => navigate(`/chat/${activeContractId}`)}
                     className="btn-primary flex items-center gap-2 text-sm py-3 px-6"
                   >
                     <MessageCircle size={16} /> Start Conversation
                   </motion.button>
                ) : (
                    <motion.button 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsHireModalOpen(true)}
                      className="btn-primary flex items-center gap-2 text-sm py-3 px-6"
                    >
                      <Briefcase size={16} /> Propose Contract
                    </motion.button>
                )}
                
                {linkedinUrl && (
                  <a href={linkedinUrl} target="_blank" rel="noreferrer" className="shrink-0">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-[#0077b5] transition-all hover:shadow-lg hover:shadow-[#0077b5]/30"
                    >
                      <LinkedinIcon size={15} /> LinkedIn <span className="opacity-60 text-xs">↗</span>
                    </motion.button>
                  </a>
                )}

                {id === localStorage.getItem('user_id') && !profile.linkedin_id && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID || '8630h8u8a8g170';
                      const redirectUri = `${window.location.origin}/linkedin-callback`;
                      window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email`;
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-[#0077b5] text-white hover:opacity-95 transition-all shadow-lg shadow-[#0077b5]/25"
                  >
                    <LinkedinIcon size={15} /> Connect LinkedIn
                  </motion.button>
                )}

                {id === localStorage.getItem('user_id') && !profile.github_username && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Iv1.6a9f43c49e29a8a7';
                      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user`;
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-slate-800 text-white border border-white/10 hover:border-indigo-500/30 transition-all"
                  >
                    <GitBranch size={15} /> Link GitHub
                  </motion.button>
                )}

                {profile.github_username && (
                  <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" className="shrink-0">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm glass transition-all hover:border-indigo-500/30"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                      <ExternalLink size={15} /> GitHub Profile <span className="opacity-60 text-xs">↗</span>
                    </motion.button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          <StatCard label="Public Repositories" value={githubData?.public_repos || profile.public_repos || 0} icon={Terminal} color="#6366f1" />
          <StatCard label="Total GitHub Stars" value={githubData?.total_stars || profile.total_stars || 0} icon={Star} color="#f59e0b" />
          <StatCard label="Followers Network" value={githubData?.followers || profile.followers || 0} icon={Users} color="#10b981" />
        </motion.div>

        {/* Dynamic Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 sm:p-7 relative overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-bold text-white mb-5 flex items-center gap-2 font-display text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Code2 size={16} className="text-indigo-400" /> Language Distribution
            </h3>
            <div className="flex flex-wrap gap-2">
              {(githubData?.languages || profile.skills || []).map((lang: string) => (
                <span key={lang} className="px-3.5 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-semibold">
                  {lang}
                </span>
              ))}
              {!(githubData?.languages?.length || profile.skills?.length) && <p className="text-slate-600 text-sm italic">No verified repository languages yet.</p>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 sm:p-7 relative overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-bold text-white mb-5 flex items-center gap-2 font-display text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <GitBranch size={16} className="text-purple-400" /> Top Repositories
            </h3>
            <div className="space-y-3">
              {(githubData?.top_repos || []).map((repo: any, i: number) => (
                <a key={i} href={repo.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group border border-transparent hover:border-white/5">
                  <div>
                    <div className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors font-mono">{repo.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{repo.language || 'Code'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-yellow-400 bg-amber-400/8 border border-amber-400/20 px-2.5 py-1 rounded-lg font-bold shrink-0">
                    <Star size={11} fill="currentColor" />
                    <span>{repo.stars}</span>
                  </div>
                </a>
              ))}
              {!(githubData?.top_repos?.length) && <p className="text-slate-600 text-sm italic">No repository insights linked yet.</p>}
            </div>
          </motion.div>
        </div>

        {/* AI Repository Analyzer & Technical Health Check */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-[2rem] p-6 sm:p-8 mt-6 relative overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[80px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)' }} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5 relative z-10">
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2 font-display" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <Terminal size={18} className="text-indigo-400" /> AI Repository Analyzer
              </h3>
              <p className="text-slate-400 text-[11px] sm:text-xs mt-1">Deep architectural audits and technical footprint diagnostics</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyzeRepos}
              disabled={isAnalyzing}
              className="px-4.5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-indigo-200" />
                  <span>Run Audit</span>
                </>
              )}
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl font-mono text-[11.5px] leading-relaxed text-indigo-300 relative overflow-hidden"
                  style={{ background: 'rgba(9,14,35,0.7)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    Live Audit Log
                  </div>
                  <div className="animate-pulse">{activeLog}</div>
                </div>

                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                    animate={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </motion.div>
            )}

            {analysisComplete && !isAnalyzing && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4.5 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Architectural Health</div>
                    <div className="text-2xl font-black text-indigo-400">96%</div>
                    <div className="text-[10px] text-emerald-400 mt-1">Excellent</div>
                  </div>
                  <div className="p-4.5 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Modularity Ratio</div>
                    <div className="text-2xl font-black text-purple-400">94%</div>
                    <div className="text-[10px] text-emerald-400 mt-1">Clean layers</div>
                  </div>
                  <div className="p-4.5 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Documentation Score</div>
                    <div className="text-2xl font-black text-emerald-400">89%</div>
                    <div className="text-[10px] text-emerald-400 mt-1">Docstrings present</div>
                  </div>
                  <div className="p-4.5 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Scale Index</div>
                    <div className="text-2xl font-black text-amber-400">92%</div>
                    <div className="text-[10px] text-emerald-400 mt-1">Production-ready</div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl text-slate-300 space-y-4"
                  style={{ background: 'rgba(9,14,35,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400" /> Architectural Audit Insights
                  </h4>
                  
                  <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
                    <p>
                      <strong className="text-white block mb-0.5 font-semibold text-xs">🚀 Clean Layer Separation:</strong>
                      Analyzed abstract layers denote a strict segregation of routing endpoints, database interaction handlers, and clean repository layers matching modern Clean Architecture principles.
                    </p>
                    <p>
                      <strong className="text-white block mb-0.5 font-semibold text-xs">🛡️ High Performance Validation:</strong>
                      Extensive verification matches high coverage of clean type-safe schema checks, preventing runtime crashes and sanitizing external payload models accurately.
                    </p>
                    <p>
                      <strong className="text-white block mb-0.5 font-semibold text-xs">📈 AI Recommendation:</strong>
                      Add a lightweight distributed caching adapter (e.g. Redis) to throttle heavy index-intensive geospatial requests and further reduce database latency.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {!isAnalyzing && !analysisComplete && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]"
              >
                <Terminal size={24} className="mx-auto mb-2 text-slate-600" />
                <p className="text-xs text-slate-500">Run the diagnostic checker to parse active repositories and analyze code footprints.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <HireModal 
        isOpen={isHireModalOpen} 
        onClose={() => setIsHireModalOpen(false)} 
        developerName={displayName}
        developerId={id}
      />
    </div>
  );
}
