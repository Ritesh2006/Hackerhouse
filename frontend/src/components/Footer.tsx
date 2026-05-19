import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Mail, Heart, GitBranch, ExternalLink, Check, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = {
  Platform: [
    { label: 'Find Developers', to: '/search' },
    { label: 'Post a Project', to: '/dashboard' },
    { label: 'Browse Skills', to: '/search' },
    { label: 'Global Chat', to: '/chat/global' },
  ],
  Community: [
    { label: 'Our Manifesto', to: '#', toast: 'manifesto' },
    { label: 'Success Stories', to: '#', toast: 'success stories' },
    { label: 'Discord Server', to: '#', toast: 'Discord server invitation' },
    { label: 'Blog & News', to: '#', toast: 'latest updates & articles' },
  ],
  Company: [
    { label: 'About Us', to: '#', toast: 'about section' },
    { label: 'Careers', to: '#', toast: 'job boards' },
    { label: 'Privacy Policy', to: '#', toast: 'privacy terms' },
    { label: 'Terms of Service', to: '#', toast: 'terms of service' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('❌ Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    setEmail('');
    showToast('✨ Subscribed successfully to HackerHouse newsletters!');
    setTimeout(() => setSubscribed(false), 5000);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <footer className="relative overflow-hidden mt-auto" style={{ background: 'var(--color-background)', borderTop: '1px solid rgba(255,255,255,0.055)' }}>
      {/* Glow blob */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, var(--color-primary-glow), transparent 70%)', filter: 'blur(60px)' }} />

      <div className="max-w-7xl mx-auto px-5 relative z-10 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
                <img src="/logo.png" alt="HackerHouse" className="w-full h-full object-cover" onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.style.background = 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))';
                }} />
              </div>
              <span className="text-xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="text-gradient">Hacker</span><span className="text-white">House</span>
              </span>
            </Link>

            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">
              The premium developer marketplace powered by GitHub intelligence and GPS-based matching. Build your next great team.
            </p>

            {/* Newsletter */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Stay in the loop</p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-xs">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/30 transition-all"
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))', boxShadow: '0 4px 16px var(--color-primary-glow)' }}>
                {subscribed ? <Check size={15} className="text-white" /> : <Mail size={15} className="text-white" />}
              </motion.button>
            </form>

            {/* Socials */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: GitBranch, href: 'https://github.com', label: 'GitHub' },
                { icon: Globe, href: 'https://hackerhouse.dev', label: 'Website' },
                { icon: Mail, href: 'mailto:hello@hackerhouse.dev', label: 'Email' },
                { icon: ExternalLink, href: 'https://linkedin.com', label: 'LinkedIn' },
              ].map(({ icon: Icon, href, label }) => (
                <motion.a key={label} whileHover={{ y: -3, scale: 1.1 }} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Icon size={15} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-bold mb-5 text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{title}</h4>
              <ul className="space-y-3.5">
                {links.map((link: any) => (
                  <li key={link.label}>
                    {link.to === '#' ? (
                      <button
                        onClick={() => showToast(`✨ The ${link.toast} will be launched soon!`)}
                        className="text-slate-500 hover:text-primary text-sm transition-colors duration-200 hover:translate-x-0.5 inline-block text-left cursor-pointer bg-transparent border-none p-0 outline-none"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link to={link.to}
                        className="text-slate-500 hover:text-primary text-sm transition-colors duration-200 hover:translate-x-0.5 inline-block text-left font-normal"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <p className="text-slate-600 text-xs">
            © {year} HackerHouse Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
            <span>Crafted with</span>
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Heart size={11} className="text-rose-500 fill-rose-500" />
            </motion.span>
            <span>by the community</span>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[9999] glass px-5 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-2xl border border-white/10"
            style={{ borderLeft: '4px solid var(--color-primary)' }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Bell size={14} className="animate-bounce" />
            </div>
            <span className="text-white">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
