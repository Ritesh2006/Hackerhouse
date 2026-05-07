import { motion } from 'framer-motion';
import { LayoutDashboard, MessageSquare, FileText, Activity, TrendingUp, Users, ArrowRight, Zap, GitBranch, Clock, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usersApi } from '../lib/api';
import AIAgent from '../components/AIAgent';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

function MetricCard({ icon: Icon, label, value, delta, color, bg }: any) {
  return (
    <motion.div variants={itemVariants}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden cursor-default"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, ${bg}, transparent 70%)` }} />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-slate-500 text-xs sm:text-sm mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{value}</p>
          {delta && (
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: delta.startsWith('+') ? '#22c55e' : '#f87171' }}>
              <TrendingUp size={11} />
              {delta} this week
            </p>
          )}
        </div>
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userRes = await usersApi.getProfile();
        setUser(userRes.data);

        const [projectsRes, contractsRes] = await Promise.all([
          usersApi.getMyProjects(),
          usersApi.getMyContracts()
        ]);
        setProjects(projectsRes.data);
        setContracts(contractsRes.data);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-4" style={{ background: '#030712' }}>
      <div className="fixed top-0 left-0 right-0 h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 70% -10%, rgba(99,102,241,0.08), transparent 60%)' }} />

      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 md:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-slate-500 text-sm mb-1">Welcome back,</p>
              <h1 className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Good evening, <span className="text-gradient">{user?.full_name?.split(' ')[0] || 'Member'}</span> 👋
              </h1>
            </div>
            <Link to="/search" className="w-full sm:w-auto">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2">
                <Zap size={16} /> Find Developers <ArrowRight size={14} />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <MetricCard icon={Activity} label="Active Projects" value={projects.length} color="#6366f1" bg="rgba(99,102,241,0.08)" />
          <MetricCard icon={FileText} label="Contracts" value={contracts.length} color="#f59e0b" bg="rgba(245,158,11,0.06)" />
          <MetricCard icon={Users} label="Role" value={user?.role?.toUpperCase()} color="#818cf8" bg="rgba(129,140,248,0.06)" />
          <MetricCard icon={TrendingUp} label="Completion" value="100%" color="#22c55e" bg="rgba(34,197,94,0.06)" />
        </motion.div>

        {projects.length === 0 && contracts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-12 text-center flex flex-col items-center gap-6"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Zap size={40} className="text-indigo-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Start your first project 🚀</h2>
                <p className="text-slate-400 max-w-md">You haven't hired anyone or been hired yet. Browse our top developers to get started.</p>
            </div>
            <Link to="/search">
                <button className="btn-primary px-8 py-3">Explore Marketplace</button>
            </Link>
          </motion.div>
        ) : (
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="lg:col-span-2 glass rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <LayoutDashboard size={18} className="text-indigo-400" /> Active Projects
                </h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {projects.map((proj, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                    className="px-6 py-5 cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-white text-sm">{proj.title}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{proj.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-indigo-400">${proj.budget}</span>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/20`}>
                            {proj.status}
                          </span>
                        </div>
                      </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
  
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="glass rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <h2 className="font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    <FileText size={16} className="text-fuchsia-400" /> Recent Contracts
                  </h2>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  {contracts.map((contract, i) => (
                    <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => navigate(`/chat/${contract.id}`)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">Contract #{contract.id.substring(0, 8)}</span>
                          <span className="text-[10px] text-slate-500">{new Date(contract.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Status: {contract.status}</p>
                      </div>
                      <ExternalLink size={14} className="text-slate-600 ml-3" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
      <AIAgent />
    </div>
  );
}
