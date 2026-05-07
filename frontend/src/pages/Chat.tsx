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
  const { roomId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Consolidate userId logic to be consistent
  const [userId] = useState(() => {
    const saved = localStorage.getItem('chat_user_id') || localStorage.getItem('user_id');
    if (saved) {
      localStorage.setItem('chat_user_id', saved);
      return saved;
    }
    const newId = `anon_${Math.floor(Math.random() * 10000)}`;
    localStorage.setItem('chat_user_id', newId);
    return newId;
  });

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const WS_URL = API_URL.replace('http', 'ws');

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/chat/history/${roomId}`);
        if (Array.isArray(res.data)) {
          setMessages(res.data.map((m: any) => ({
            id: m.id,
            text: m.message,
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
      socket = new WebSocket(`${WS_URL}/chat/ws/${roomId}?user_id=${userId}`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Connected to Chat Relay");
        fetchHistory();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'text') {
            setMessages(prev => {
              // Avoid duplicate messages from history vs real-time if IDs match
              if (prev.some(m => m.id === data.id)) return prev;
              return [...prev, {
                id: data.id || Date.now(),
                text: data.message,
                sender: data.sender_id === userId ? 'me' : 'other',
                time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }];
            });
          } else if (data.type === 'typing' && data.sender_id !== userId) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000);
          }
        } catch (e) {
          console.warn("Received non-JSON message:", event.data);
        }
      };

      socket.onclose = () => {
        console.warn("Disconnected from Chat Relay. Reconnecting...");
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
  }, [roomId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    const msg = {
      message: input,
      type: 'text'
    };
    
    socketRef.current.send(JSON.stringify(msg));
    setInput('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'typing' }));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#030712' }}>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/dashboard" className="mr-1 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-xs md:text-sm truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Collaborative Workspace</h3>
              <p className="text-[10px] md:text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Secure & Encrypted
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (input) {
                navigator.clipboard.writeText(input);
                alert("Message copied to clipboard! Opening LinkedIn...");
              }
              window.open(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(roomId || 'developer')}&origin=GLOBAL_SEARCH_HEADER`, '_blank');
            }}
            className="px-4 py-1.5 rounded-full bg-[#0a66c2]/10 border border-[#0a66c2]/30 text-[#0a66c2] text-[10px] md:text-xs font-bold hover:bg-[#0a66c2] hover:text-white transition-all flex items-center gap-2"
          >
            <Users size={14} /> Direct LinkedIn Message
          </button>
        </motion.div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex items-end gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[68%] group`}>
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

          <AnimatePresence>
            {isTyping && <TypingIndicator />}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="px-6 pb-6 pt-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3 glass rounded-2xl px-4 py-2"
            style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
            <input
              type="text"
              value={input}
              onChange={handleTyping}
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
