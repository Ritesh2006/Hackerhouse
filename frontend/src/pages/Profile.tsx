import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, Terminal, Code2, Star, GitBranch, Users, ExternalLink, MessageCircle, ArrowLeft, Clock, X, Calendar, DollarSign, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersApi, githubApi } from '../lib/api';

const LinkedinIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    className={className}
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

function HireModal({ isOpen, onClose, developerName, developerId }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: ''
  });
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleHire = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Session missing. Please login to hire developers.");
        navigate('/login');
        return;
    }

    if (!formData.title || !formData.description || !formData.budget || !formData.deadline) {
      alert("Please fill all fields");
      return;
    }
    
    setSending(true);
    try {
        let isoDeadline;
        try {
          const dateObj = new Date(formData.deadline);
          if (isNaN(dateObj.getTime())) throw new Error("Invalid date");
          
          const year = dateObj.getFullYear();
          if (year < 2024 || year > 2100) throw new Error("Year must be between 2024 and 2100");
          
          isoDeadline = dateObj.toISOString();
        } catch (e: any) {
          alert(`Invalid deadline: ${e.message}`);
          setSending(false);
          return;
        }

        const response = await usersApi.hireDeveloper({
          developer_id: developerId,
          title: formData.title,
          description: formData.description,
          budget: parseFloat(formData.budget),
          deadline: isoDeadline
        });
      
      const { contract_id } = response.data;
      alert("Hiring request sent successfully!");
      onClose();
      navigate(`/chat/${contract_id}`);
    } catch (err: any) {
      console.error("Hire Error Details:", err);
      const serverDetail = err.response?.data?.detail;
      const errorMessage = serverDetail || err.message || "Network Error";
      alert(`Failed: ${errorMessage}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#050914]/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            className="relative w-full max-w-lg overflow-hidden border border-white/8 shadow-2xl rounded-[2rem]"
            style={{ background: 'linear-gradient(145deg, rgba(15,22,45,0.95), rgba(10,15,35,0.98))' }}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-indigo-500/5">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2 font-display">
                  Hire {developerName} <Sparkles size={16} className="text-indigo-400" />
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Enterprise Contract Protocol</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Project Title</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    onFocus={() => setFocused('title')}
                    onBlur={() => setFocused(null)}
                    placeholder="e.g. Build a Modern Landing Page"
                    className="input-field"
                    style={{ borderRadius: '14px' }}
                  />
                  {focused === 'title' && (
                    <motion.div layoutId="modalFocus" className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }} />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Description</label>
                <div className="relative">
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    onFocus={() => setFocused('desc')}
                    onBlur={() => setFocused(null)}
                    placeholder="Describe the project goals and requirements..."
                    className="input-field h-28 resize-none py-3"
                    style={{ borderRadius: '14px' }}
                  />
                  {focused === 'desc' && (
                    <motion.div layoutId="modalFocus" className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Budget ($)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500"><DollarSign size={15} /></div>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      onFocus={() => setFocused('budget')}
                      onBlur={() => setFocused(null)}
                      placeholder="500"
                      className="input-field pl-10"
                      style={{ borderRadius: '14px' }}
                    />
                    {focused === 'budget' && (
                      <motion.div layoutId="modalFocus" className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }} />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Deadline</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500"><Calendar size={15} /></div>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      onFocus={() => setFocused('deadline')}
                      onBlur={() => setFocused(null)}
                      className="input-field pl-10 block"
                      style={{ borderRadius: '14px' }}
                    />
                    {focused === 'deadline' && (
                      <motion.div layoutId="modalFocus" className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }} />
                    )}
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleHire}
                disabled={sending}
                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-base mt-2"
              >
                {sending ? (
                  <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2.5 }} />
                ) : (
                  <>
                    <Briefcase size={18} />
                    <span>Send Hire Request</span>
                  </>
                )}
              </motion.button>
              <p className="text-[10px] text-slate-500 text-center font-medium">By initializing contract creation, you consent to secure community dispute protocols.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-hover rounded-2xl p-5 text-center relative overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
    >
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

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [githubData, setGithubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [activeContractId, setActiveContractId] = useState<string | null>(null);
  const navigate = useNavigate();

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

          <div className="relative flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-2xl shrink-0 overflow-hidden font-display image-glow-hover shine-sheen"
              style={{ boxShadow: '0 16px 40px rgba(99,102,241,0.3)' }}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0)
              )}
            </motion.div>

            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight font-display tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {displayName}
                  </h1>
                  <p className="text-indigo-400 font-bold text-sm mt-0.5">@{profile.github_username || 'dev'}</p>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Available for contracts
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
                      const clientId = '8630h8u8a8g170';
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
                      const clientId = 'Iv1.6a9f43c49e29a8a7';
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
