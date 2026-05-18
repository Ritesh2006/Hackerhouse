import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Terminal, Shield, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { chatApi } from '../lib/api';

export default function Chat() {
  const { contractId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [focused, setFocused] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const reconnectCountRef = useRef(0);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');
  
  useEffect(() => {
    const getWsUrl = () => {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const absoluteBaseUrl = baseUrl.startsWith('http') 
        ? baseUrl 
        : `${window.location.origin}${baseUrl.startsWith('/') ? '' : '/'}${baseUrl}`;
      
      const cleanBaseUrl = absoluteBaseUrl.replace('/api/v1', '');
      return cleanBaseUrl.replace(/^https/, 'wss').replace(/^http/, 'ws');
    };
    
    const WS_URL = getWsUrl();

    const fetchHistory = async () => {
      try {
        console.log("Fetching chat history for:", contractId);
        const res = await chatApi.getHistory(contractId!);
        if (res.data && Array.isArray(res.data.messages)) {
          setMessages(res.data.messages.map((m: any, i: number) => ({
            id: i,
            text: m.text,
            sender: String(m.sender_id) === String(userId) ? 'me' : 'other',
            time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
            linkedinStatus: m.linkedin_status
          })));
        } else {
          console.log("No messages found in chat history.");
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };

    let socket: WebSocket;
    let reconnectTimeout: any;

    const connect = () => {
      if (!token || !contractId) return;
      
      if (reconnectCountRef.current > 5) {
        console.warn("Max reconnect attempts reached");
        setWsStatus('disconnected');
        return;
      }
      
      setWsStatus('connecting');
      console.log(`Connecting WebSocket to: ${WS_URL}/ws/chat/${contractId}`);
      socket = new WebSocket(`${WS_URL}/ws/chat/${contractId}?token=${token}`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Connected to Chat WebSocket");
        setWsStatus('connected');
        reconnectCountRef.current = 0;
        fetchHistory();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: data.text,
            sender: String(data.sender_id) === String(userId) ? 'me' : 'other',
            time: data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            linkedinStatus: data.linkedin_status
          }]);
        } catch {
          console.warn("Received non-JSON message:", event.data);
        }
      };

      socket.onclose = () => {
        setWsStatus('disconnected');
        reconnectCountRef.current += 1;
        reconnectTimeout = setTimeout(connect, 3000 * Math.min(reconnectCountRef.current, 5));
      };

      socket.onerror = () => {
        setWsStatus('disconnected');
        socket.close();
      };
    };

    fetchHistory();
    connect();

    return () => {
      reconnectCountRef.current = 99;
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [contractId, userId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    const msg = { text: input };
    socketRef.current.send(JSON.stringify(msg));
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col h-[100dvh]" style={{ background: '#050914' }}>
      <div className="flex-1 flex flex-col min-h-0 relative">
        
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(180deg, rgba(13,18,40,0.9), rgba(5,9,20,0.85))', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/dashboard" className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all shrink-0">
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm truncate flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                HackerHouse Chat <Sparkles size={14} className="text-indigo-400" />
              </h3>
              <p className={`text-[10px] md:text-xs flex items-center gap-1.5 ${wsStatus === 'connected' ? 'text-emerald-400' : wsStatus === 'connecting' ? 'text-amber-400' : 'text-rose-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : wsStatus === 'connecting' ? 'bg-amber-400 animate-bounce' : 'bg-rose-400'}`} />
                {wsStatus === 'connected' ? 'Secure Sync Active' : wsStatus === 'connecting' ? 'Syncing...' : 'Fallback REST mode'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] text-slate-500 font-mono tracking-wider">
              WS: {contractId?.substring(0, 8)}
            </div>
          </div>
        </motion.div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-20">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/15">
                <Terminal size={24} className="text-indigo-400" />
              </div>
              <p className="text-slate-400 text-sm font-semibold">Start your production chat.</p>
              <p className="text-slate-600 text-xs max-w-xs">All developer communications are end-to-end verified and synced with LinkedIn & GitHub metadata.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className={`flex items-end gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[80%] sm:max-w-[70%] group">
                <div
                  className={`px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'me' ? 'text-white' : 'text-slate-200'
                  }`}
                  style={msg.sender === 'me'
                    ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: '18px 18px 4px 18px', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px 18px 18px 4px' }
                  }
                >
                  {msg.text}
                </div>
                <p className={`text-[9px] mt-1.5 px-1.5 flex flex-wrap items-center gap-1.5 font-semibold uppercase tracking-wider ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-slate-600 font-bold">{msg.time}</span>
                  {msg.sender === 'me' && (
                    <>
                      <span className="text-indigo-400/80 flex items-center gap-0.5"><Shield size={10} /> Sync</span>
                      {msg.linkedinStatus?.synced && (
                        <span 
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-sm transition-all"
                          style={{
                            background: 'linear-gradient(135deg, #0077b5, #005987)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                          title={msg.linkedinStatus.details || 'Message synced to LinkedIn'}
                        >
                          <svg className="w-2 h-2 fill-current mr-0.5" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                          Linked Sync
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="px-4 pb-6 pt-3 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)' }}
        >
          <div className="flex items-center gap-3 bg-white/[0.03] border rounded-2xl px-4 py-2 relative transition-all"
            style={{ borderColor: focused ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.08)', boxShadow: focused ? '0 0 20px rgba(99,102,241,0.08)' : 'none' }}>
            <input
              type="text"
              value={input}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a verified message..."
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none py-2"
            />
            {focused && (
              <motion.div layoutId="chatInputFocus" className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' }} />
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100"
              style={{ background: input.trim() ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.05)' }}
            >
              <Send size={15} className="text-white translate-x-px" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
