import { motion } from 'framer-motion';
import { Globe, Mail, Heart, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative pt-20 pb-10 overflow-hidden" style={{ background: '#030712', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Decorative Blur */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-5"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16">
          {/* Logo & Bio */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                <Terminal size={22} className="text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Hacker<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">House</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              The premium destination for elite developers to connect, collaborate, and build the future of software. Find your next powerhouse partner.
            </p>
            <div className="flex items-center gap-4">
              <motion.a whileHover={{ y: -3 }} href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all border border-white/5">
                <Terminal size={18} />
              </motion.a>
              <motion.a whileHover={{ y: -3 }} href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all border border-white/5">
                <Globe size={18} />
              </motion.a>
              <motion.a whileHover={{ y: -3 }} href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all border border-white/5">
                <Terminal size={18} />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/search" className="text-slate-500 hover:text-indigo-400 transition-colors">Find Developers</Link></li>
              <li><Link to="/dashboard" className="text-slate-500 hover:text-indigo-400 transition-colors">Post a Project</Link></li>
              <li><Link to="/search" className="text-slate-500 hover:text-indigo-400 transition-colors">Browse Skills</Link></li>
              <li><Link to="#" className="text-slate-500 hover:text-indigo-400 transition-colors">Top Contributors</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-white font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Community</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="#" className="text-slate-500 hover:text-indigo-400 transition-colors">Our Manifesto</Link></li>
              <li><Link to="#" className="text-slate-500 hover:text-indigo-400 transition-colors">Success Stories</Link></li>
              <li><Link to="#" className="text-slate-500 hover:text-indigo-400 transition-colors">Discord Server</Link></li>
              <li><Link to="#" className="text-slate-500 hover:text-indigo-400 transition-colors">Blog & News</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-4 sm:mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Newsletter</h4>
            <p className="text-slate-500 text-sm mb-4">Get curated developer opportunities delivered weekly.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="email@work.com" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 flex-1 transition-all min-w-0"
              />
              <button className="w-10 h-10 shrink-0 rounded-xl bg-indigo-500 flex items-center justify-center text-white hover:bg-indigo-400 transition-colors">
                <Mail size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 sm:pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
          <p className="text-slate-600 text-xs">
            © {currentYear} HackerHouse Inc. All rights reserved. Built with precision for the modern dev.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <Link to="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-indigo-400 transition-colors">Terms of Service</Link>
            <div className="flex items-center gap-1.5 ml-2">
              <span>Made with</span>
              <Heart size={12} className="text-rose-500 fill-rose-500" />
              <span>by the community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
