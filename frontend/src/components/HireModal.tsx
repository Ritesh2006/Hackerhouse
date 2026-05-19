import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../lib/api';

interface HireModalProps {
  isOpen: boolean;
  onClose: () => void;
  developerName: string;
  developerId: string | undefined;
}

export default function HireModal({ isOpen, onClose, developerName, developerId }: HireModalProps) {
  const [formData, setFormData] = useState({ title: '', description: '', budget: '', deadline: '' });
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
      const serverDetail = err.response?.data?.detail;
      alert(`Failed: ${serverDetail || err.message || "Network Error"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            className="relative w-full max-w-lg overflow-hidden border border-white/8 shadow-2xl rounded-[2rem]"
            style={{ background: 'linear-gradient(145deg, rgba(15,22,45,0.95), rgba(10,15,35,0.98))' }}>
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-primary/5">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2 font-display">
                  Hire {developerName} <Sparkles size={16} className="text-primary" />
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
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                    onFocus={() => setFocused('title')} onBlur={() => setFocused(null)}
                    placeholder="e.g. Build a Modern Landing Page" className="input-field" style={{ borderRadius: '14px' }} />
                  {focused === 'title' && (
                    <motion.div layoutId="modalFocus" className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ boxShadow: '0 0 0 3px var(--color-primary-glow)' }} />
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Description</label>
                <div className="relative">
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                    onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)}
                    placeholder="Describe the project goals and requirements..." className="input-field h-28 resize-none py-3" style={{ borderRadius: '14px' }} />
                  {focused === 'desc' && (
                    <motion.div layoutId="modalFocus" className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ boxShadow: '0 0 0 3px var(--color-primary-glow)' }} />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Budget ($)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500"><DollarSign size={15} /></div>
                    <input type="number" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      onFocus={() => setFocused('budget')} onBlur={() => setFocused(null)}
                      placeholder="500" className="input-field pl-10" style={{ borderRadius: '14px' }} />
                    {focused === 'budget' && (
                      <motion.div layoutId="modalFocus" className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ boxShadow: '0 0 0 3px var(--color-primary-glow)' }} />
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Deadline</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500"><Calendar size={15} /></div>
                    <input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      onFocus={() => setFocused('deadline')} onBlur={() => setFocused(null)}
                      className="input-field pl-10 block" style={{ borderRadius: '14px' }} />
                    {focused === 'deadline' && (
                      <motion.div layoutId="modalFocus" className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ boxShadow: '0 0 0 3px var(--color-primary-glow)' }} />
                    )}
                  </div>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={handleHire} disabled={sending}
                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-base mt-2">
                {sending ? (
                  <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2.5 }} />
                ) : (
                  <><Briefcase size={18} /><span>Send Hire Request</span></>
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
