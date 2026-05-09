import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { chatApi } from '../lib/api';

// Force reload
export default function Chat() {
  const { contractId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const socketRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const reconnectCountRef = useRef(0);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');
  
    const getWsUrl = () => {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      // Handle relative URLs for production
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
            time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'
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
      
      // Don't reconnect endlessly
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
            time: data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

    // Fetch history even if websocket fails (REST fallback)
    fetchHistory();
    connect();

    return () => {
      reconnectCountRef.current = 99; // prevent reconnect in cleanup
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
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#030712] h-[100dvh]">
      <div className="flex-1 flex flex-col min-h-0 relative">
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
              <p className={`text-[10px] md:text-xs flex items-center gap-1 ${wsStatus === 'connected' ? 'text-green-400' : wsStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${wsStatus === 'connected' ? 'bg-green-400' : wsStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                {wsStatus === 'connected' ? 'Connected' : wsStatus === 'connecting' ? 'Connecting...' : 'Offline — Messages via REST'}
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
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-20">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Send size={24} className="text-indigo-400" />
              </div>
              <p className="text-slate-500 text-sm">No messages yet. Start the conversation!</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id || i}
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
