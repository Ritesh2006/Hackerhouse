import { motion } from 'framer-motion';
import { LayoutDashboard, MessageSquare, FileText, Activity, TrendingUp, Users, ArrowRight, Zap, GitBranch, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      className="glass rounded-2xl p-6 relative overflow-hidden cursor-default"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, ${bg}, transparent 70%)` }} />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-slate-500 text-sm mb-1">{label}</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{value}</p>
          {delta && (
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: delta.startsWith('+') ? '#22c55e' : '#f87171' }}>
              <TrendingUp size={11} />
              {delta} this week
            </p>
          )}
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

const activityFeed: any[] = [];

const projects: any[] = [];

const recentMessages: any[] = [];

export default function Dashboard() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: '#030712' }}>
      {/* Ambient light */}
      <div className="fixed top-0 left-0 right-0 h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 70% -10%, rgba(99,102,241,0.08), transparent 60%)' }} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 md:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-slate-500 text-sm mb-1">Welcome back,</p>
              <h1 className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Good evening, <span className="text-gradient">Alex</span> 👋
              </h1>
            </div>
            <Link to="/search" className="w-full sm:w-auto">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2">
                <Zap size={16} /> Find Developers <ArrowRight size={14} />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Metric Cards */}
        <motion.div
          variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <MetricCard icon={Activity} label="Active Projects" value="0" color="#6366f1" bg="rgba(99,102,241,0.08)" />
          <MetricCard icon={MessageSquare} label="Unread Messages" value="0" color="#22c55e" bg="rgba(34,197,94,0.06)" />
          <MetricCard icon={FileText} label="Contracts" value="0" color="#f59e0b" bg="rgba(245,158,11,0.06)" />
          <MetricCard icon={Users} label="Collaborators" value="0" color="#818cf8" bg="rgba(129,140,248,0.06)" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <LayoutDashboard size={18} className="text-indigo-400" /> Projects
              </h2>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {projects.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-slate-500 text-sm">No active projects</p>
                </div>
              )}
              {projects.map((proj, i) => (
                <motion.div
                  key={i}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                  className="px-6 py-5 cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-semibold text-white text-sm">{proj.name}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {proj.tags.map((t: string) => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-md"
                              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <div className="flex -space-x-2">
                          {proj.members.map((m: string, j: number) => (
                            <div key={j} className="w-7 h-7 rounded-lg text-xs font-bold text-white flex items-center justify-center border border-gray-900"
                              style={{ background: `hsl(${j * 60 + 220}, 70%, 55%)`, zIndex: proj.members.length - j }}>
                              {m}
                            </div>
                          ))}
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                          proj.status === 'In Progress' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' :
                          proj.status === 'Review' ? 'bg-green-500/15 text-green-400 border border-green-500/20' :
                          'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        }`}>{proj.status}</span>
                      </div>
                    </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${proj.progress}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${proj.color}, ${proj.color}aa)` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-8 text-right">{proj.progress}%</span>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={11} /> {proj.due}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Messages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="glass rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <MessageSquare size={16} className="text-green-400" /> Messages
                </h2>
                <Link to="/chat/global" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                  Open <ArrowRight size={12} />
                </Link>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {recentMessages.length === 0 && (
                  <div className="px-5 py-8 text-center">
                    <p className="text-slate-500 text-sm">No recent messages</p>
                  </div>
                )}
                {recentMessages.map((msg, i) => (
                  <Link key={i} to={`/chat/${msg.name.toLowerCase().replace(' ', '-')}`}>
                    <motion.div whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }} className="px-5 py-4 flex items-center gap-3 cursor-pointer">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${msg.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {msg.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">{msg.name}</span>
                          <span className="text-xs text-slate-600">{msg.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{msg.msg}</p>
                      </div>
                      {msg.unread > 0 && (
                        <span className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0"
                          style={{ background: '#6366f1' }}>{msg.unread}</span>
                      )}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="glass rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <GitBranch size={16} className="text-purple-400" />
                <h2 className="font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Activity</h2>
              </div>
              <div className="p-2 space-y-1">
                {activityFeed.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-slate-500 text-sm">No recent activity</p>
                  </div>
                )}
                {activityFeed.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.06 }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                        <Icon size={13} style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{item.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
