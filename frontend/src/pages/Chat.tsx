import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
      className="flex items-end gap-2 justify-start"
    >
      <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-md"
        style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.15)' }}>
        {[0, 1, 2].map(i => (
          <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Force reload
export default function Chat() {
  const { contractId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');
  
  useEffect(() => {
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '');
    const WS_URL = API_URL.replace('http', 'ws');

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/chat/contract/${contractId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.messages) {
          setMessages(res.data.messages.map((m: any, i: number) => ({
            id: i,
            text: m.text,
            sender: m.sender_id === userId ? 'me' : 'other',
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };

    let socket: WebSocket;
    let reconnectTimeout: any;

    const connect = () => {
      if (!token) return;
      socket = new WebSocket(`${WS_URL}/ws/chat/${contractId}?token=${token}`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Connected to Chat WebSocket");
        fetchHistory();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: data.text,
            sender: data.sender_id === userId ? 'me' : 'other',
            time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        } catch (e) {
          console.warn("Received non-JSON message:", event.data);
        }
      };

      socket.onclose = () => {
        console.warn("WebSocket disconnected. Reconnecting...");
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = (err) => {
        console.error("WebSocket Error:", err);
        socket.close();
      };
    };

    connect();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [contractId, userId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    const msg = {
      text: input
    };
    
    socketRef.current.send(JSON.stringify(msg));
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#030712' }}>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="px-3 sm:px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Link to="/dashboard" className="mr-0.5 sm:mr-1 text-slate-400 hover:text-white transition-colors shrink-0">
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-xs md:text-sm truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>HackerHouse Project Workspace</h3>
              <p className="text-[10px] md:text-xs text-indigo-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> Active Contract Room
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400">
                Project ID: {contractId?.substring(0, 8)}...
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex items-end gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[75%] group`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'me' ? 'text-white rounded-br-md' : 'text-slate-200 rounded-bl-md'
                  }`}
                  style={msg.sender === 'me'
                    ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: '18px 18px 4px 18px' }
                    : { background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '18px 18px 18px 4px' }
                  }
                >
                  {msg.text}
                </div>
                <p className={`text-[10px] text-slate-500 mt-1 px-1 flex items-center gap-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  {msg.time}
                  {msg.sender === 'me' && <span className="text-indigo-400 font-bold">✓ Sent</span>}
                </p>
              </div>
            </motion.div>
          ))}

          <div ref={bottomRef} />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)' }}
        >
          <div className="flex items-center gap-3 glass rounded-2xl px-4 py-2"
            style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none py-2"
            />
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background: input.trim() ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(99,102,241,0.2)' }}
            >
              <Send size={15} className="text-white translate-x-px" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
