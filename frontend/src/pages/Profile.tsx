import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, Terminal, Code2, Star, GitBranch, Users, ExternalLink, MessageCircle, ArrowLeft, Clock, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersApi, githubApi } from '../lib/api';

function HireModal({ isOpen, onClose, developerName, developerId }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: ''
  });
  const [sending, setSending] = useState(false);
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
      const response = await usersApi.hireDeveloper({
        developer_id: developerId,
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        deadline: new Date(formData.deadline).toISOString()
      });
      
      const { contract_id } = response.data;
      alert("Hiring request sent successfully!");
      onClose();
      navigate(`/chat/${contract_id}`);
    } catch (err: any) {
      console.error("Failed to hire developer:", err);
      alert(`Failed: ${err?.response?.data?.detail || err.message}`);
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
            className="absolute inset-0 bg-[#030712]/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-indigo-600/10">
              <div>
                <h3 className="text-lg font-bold text-white">Hire {developerName}</h3>
                <p className="text-[10px] text-indigo-400 font-medium">Enterprise Contract Marketplace</p>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block">Project Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Build a Modern Landing Page"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the project requirements..."
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-indigo-500/50 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block">Budget ($)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    placeholder="500"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
              
              <button
                onClick={handleHire}
                disabled={sending}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
              >
                {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Briefcase size={18} />}
                <span>{sending ? 'Sending Request...' : 'Send Hire Request'}</span>
              </button>
              <p className="text-[10px] text-slate-500 text-center">By clicking, you agree to HackerHouse terms and contract protocols.</p>
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
      whileHover={{ scale: 1.04 }}
      className="glass-hover rounded-2xl p-5 text-center"
    >
      <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="text-2xl font-bold text-white font-display">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
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
      setLoading(true);
      try {
        if (!id) return;
        const userRes = await usersApi.getUser(id);
        const user = userRes.data;
        setProfile(user);

        // Check for active contracts
        try {
            const contractsRes = await usersApi.getMyContracts();
            const existingContract = contractsRes.data.find((c: any) => 
                (c.client_id === localStorage.getItem('user_id') && c.developer_id === id) ||
                (c.developer_id === localStorage.getItem('user_id') && c.client_id === id)
            );
            if (existingContract) {
                setActiveContractId(existingContract.id);
            }
        } catch (e) {
            console.warn("Failed to fetch contracts:", e);
        }

        if (user.github_username) {
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
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] text-slate-400">
        <p>User not found</p>
        <Link to="/search" className="mt-4 text-indigo-400 hover:underline">Back to search</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: '#030712' }}>
      <div className="fixed top-0 left-0 right-0 h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(99,102,241,0.12), transparent 70%)' }} />

      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link to="/search" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft size={16} /> Back to search
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-5 sm:p-6 md:p-8 mb-6 relative overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {githubData?.note && (
            <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 text-sm font-medium flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Terminal size={16} />
              </div>
              {githubData.note}
            </div>
          )}
          
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent)' }} />

          <div className="relative flex flex-col sm:flex-row gap-5 sm:gap-8 items-start">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl md:text-4xl font-black shadow-2xl shrink-0 overflow-hidden font-display`}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name || profile.full_name} className="w-full h-full object-cover" />
              ) : (
                (profile.name || profile.full_name || 'U').charAt(0)
              )}
            </motion.div>

            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-display">
                    {profile.name || profile.full_name}
                  </h1>
                  <p className="text-indigo-400 font-medium">@{profile.github_username || 'dev'}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20`}>
                  <span className={`w-2 h-2 rounded-full bg-green-400 animate-pulse`} />
                  Available for hire
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-400 mb-4 sm:mb-5">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-400" /> {profile.location_name || 'Global'}</span>
                <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-green-400" /> $95/hr</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-yellow-400" /> Active now</span>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-5 sm:mb-6 max-w-2xl">{githubData?.bio || profile.bio || 'Professional Developer and HackerHouse member.'}</p>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5 sm:mb-6">
                {(profile.skills || []).map((skill: string) => (
                  <span key={skill} className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {activeContractId ? (
                   <motion.button 
                   whileHover={{ scale: 1.03 }} 
                   whileTap={{ scale: 0.97 }}
                   onClick={() => navigate(`/chat/${activeContractId}`)}
                   className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4 sm:px-5"
                 >
                   <MessageCircle size={16} /> Start Chat
                 </motion.button>
                ) : (
                    <motion.button 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsHireModalOpen(true)}
                    className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4 sm:px-5"
                    >
                    <Briefcase size={16} /> Hire Developer
                    </motion.button>
                )}
                
                {!profile.github_username && (
                  <motion.button 
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => alert("Redirecting to GitHub OAuth...")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 text-white border border-white/10 hover:border-indigo-500/30 transition-all"
                  >
                    <GitBranch size={16} /> Connect GitHub
                  </motion.button>
                )}

                {!profile.linkedin_id && (
                  <motion.button 
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => alert("Redirecting to LinkedIn OAuth...")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#0077b5] text-white border border-white/10 hover:opacity-90 transition-all"
                  >
                    <ExternalLink size={16} /> Connect LinkedIn
                  </motion.button>
                )}

                {profile.github_username && (
                  <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm glass transition-all hover:border-indigo-500/30"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      <ExternalLink size={16} /> GitHub <span className="text-slate-500">↗</span>
                    </motion.button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6"
        >
          <StatCard label="Repositories" value={githubData?.public_repos || profile.public_repos || 0} icon={Terminal} color="#6366f1" />
          <StatCard label="Total Stars" value={githubData?.total_stars || profile.total_stars || 0} icon={Star} color="#f59e0b" />
          <StatCard label="Followers" value={githubData?.followers || profile.followers || 0} icon={Users} color="#22c55e" />
        </motion.div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2 font-display">
              <Code2 size={16} className="text-indigo-400" /> Top Languages (GitHub)
            </h3>
            <div className="flex flex-wrap gap-2">
              {githubData?.languages?.map((lang: string) => (
                <span key={lang} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm font-medium">
                  {lang}
                </span>
              ))}
              {!githubData?.languages?.length && <p className="text-slate-500 text-sm">No language data available</p>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2 font-display">
              <GitBranch size={16} className="text-purple-400" /> Featured Repos
            </h3>
            <div className="space-y-3">
              {githubData?.top_repos?.map((repo: any, i: number) => (
                <a key={i} href={repo.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <div>
                    <div className="text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">{repo.name}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-slate-500">{repo.language || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-yellow-400">
                    <Star size={12} />
                    <span>{repo.stars}</span>
                  </div>
                </a>
              ))}
              {!githubData?.top_repos?.length && <p className="text-slate-500 text-sm">No repositories found</p>}
            </div>
          </motion.div>
        </div>
      </div>

      <HireModal 
        isOpen={isHireModalOpen} 
        onClose={() => setIsHireModalOpen(false)} 
        developerName={profile?.name}
        developerId={id}
      />
    </div>
  );
}
