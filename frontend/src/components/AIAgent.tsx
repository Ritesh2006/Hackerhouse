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
      // Using axios 'api' instance which already has base URL and auth headers
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
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[80vh] bg-[#1a1b26] border border-[#2d2e3d] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2d2e3d] bg-gradient-to-r from-[#1f202e] to-[#1a1b26]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20">
                  <img 
                    src="/ai_agent_logo.png" 
                    alt="HackerHouse AI" 
                    className="w-full h-full rounded-full object-cover bg-[#0f1015]"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    SoulLink AI <Sparkles size={14} className="text-purple-400" />
                  </h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">HackerHouse Production</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#2d2e3d] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                    msg.role === 'user' 
                      ? 'bg-[#2d2e3d]' 
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5'
                  }`}>
                    {msg.role === 'user' ? (
                      <User size={16} className="text-gray-300" />
                    ) : (
                      <img src="/ai_agent_logo.png" className="w-full h-full rounded-full object-cover" />
                    )}
                  </div>
                  <div className={`max-w-[75%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-900/20'
                      : 'bg-[#2d2e3d] text-gray-200 rounded-tl-none border border-white/5'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 flex items-center justify-center">
                    <img src="/ai_agent_logo.png" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="bg-[#2d2e3d] p-3 rounded-2xl rounded-tl-none flex items-center gap-2 border border-white/5">
                    <Loader2 size={16} className="text-purple-400 animate-spin" />
                    <span className="text-sm text-gray-400">Connecting to soul...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#2d2e3d] bg-[#1a1b26]">
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tell me your vision..."
                  className="w-full bg-[#0f1015] border border-[#2d2e3d] text-white rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-600 text-sm"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/40 transition-all"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full p-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl shadow-indigo-500/40 flex items-center justify-center text-white relative group overflow-hidden"
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
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="logo"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="w-full h-full rounded-full overflow-hidden"
            >
              <img 
                src="/ai_agent_logo.png" 
                alt="AI Agent" 
                className="w-full h-full object-cover scale-110"
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Pulsing ring when closed */}
        {!isOpen && (
          <>
            <span className="absolute -inset-2 rounded-full border border-indigo-500/30 animate-ping" />
            <span className="absolute -inset-4 rounded-full border border-purple-500/10 animate-pulse" />
          </>
        )}
      </motion.button>
    </div>

  );
};

export default AIAgent;
