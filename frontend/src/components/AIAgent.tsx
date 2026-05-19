import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Sparkles, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I am your HackerHouse AI Agent. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    const newMsg: Message = { role: 'user', content: userMessage };
    const chatHistory = [...messages];
    
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userMessage,
        history: chatHistory.map(m => ({ role: m.role, content: m.content }))
      });

      if (response.data && response.data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMsg = error.response?.data?.detail || "Sorry, I'm having trouble connecting right now. Please try again later.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[75vh] border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ 
              background: 'linear-gradient(145deg, rgba(15,22,45,0.98), rgba(10,15,35,0.99))', 
              borderColor: 'rgba(255,255,255,0.08)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}
          >
            {/* Ambient background glow inside agent */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none" 
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)' }} />

            {/* Header */}
            <div className="flex items-center justify-between p-4.5 border-b border-white/5 relative z-10 bg-indigo-500/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl p-0.5 bg-gradient-to-br from-primary via-primary-light to-primary-glow shadow-lg shadow-primary/25 shrink-0">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-[#0c1020] flex items-center justify-center">
                    <Sparkles size={16} className="text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5 font-display" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    SoulLink AI <Sparkles size={13} className="text-indigo-400 animate-pulse" />
                  </h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Verified Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 scrollbar-hide">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${
                    msg.role === 'user' 
                      ? 'bg-white/5 border border-white/10' 
                      : 'bg-indigo-500/10 border border-indigo-500/25 p-0.5'
                  }`}>
                    {msg.role === 'user' ? (
                      <User size={14} className="text-slate-300" />
                    ) : (
                      <Sparkles size={14} className="text-indigo-400" />
                    )}
                  </div>
                  <div 
                    className={`max-w-[78%] p-3.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white'
                        : 'text-slate-200'
                    }`}
                    style={msg.role === 'user'
                      ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: '18px 18px 4px 18px', boxShadow: '0 4px 12px rgba(99,102,241,0.15)' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px 18px 18px 4px' }
                    }
                  >
                    <p className="whitespace-pre-wrap text-[13px]">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Loader2 size={14} className="text-indigo-400 animate-spin" />
                  </div>
                  <div className="bg-white/3 border border-white/5 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold tracking-wide">AI is brainstorming...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 relative z-10 bg-indigo-500/[0.01]">
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask anything or search developers..."
                  className="w-full bg-background border text-white rounded-2xl py-3 pl-4 pr-12 focus:outline-none transition-all placeholder:text-slate-600 text-xs font-semibold"
                  style={{ borderColor: inputFocused ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)' }}
                />
                {inputFocused && (
                  <motion.div layoutId="agentInputFocus" className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: '0 0 0 3px var(--color-primary-glow)' }} />
                )}
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl text-white disabled:opacity-30 disabled:scale-100 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                  style={{ background: inputValue.trim() ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))' : 'rgba(255,255,255,0.05)' }}
                >
                  <Send size={13} className="translate-x-px" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.06, rotate: 3 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary-light to-primary-glow shadow-2xl shadow-primary/30 flex items-center justify-center text-white relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="logo"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Sparkles size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Pulsing ring when closed */}
        {!isOpen && (
          <>
            <span className="absolute -inset-1.5 rounded-2xl border border-indigo-500/35 animate-ping" />
            <span className="absolute -inset-3 rounded-2xl border border-purple-500/10 animate-pulse" />
          </>
        )}
      </motion.button>
    </div>
  );
};

export default AIAgent;
