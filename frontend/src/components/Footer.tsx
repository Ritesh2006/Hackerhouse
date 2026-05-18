import { motion } from 'framer-motion';
import { Globe, Mail, Heart, GitBranch, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = {
  Platform: [
    { label: 'Find Developers', to: '/search' },
    { label: 'Post a Project', to: '/dashboard' },
    { label: 'Browse Skills', to: '/search' },
    { label: 'Global Chat', to: '/chat/global' },
  ],
  Community: [
    { label: 'Our Manifesto', to: '#' },
    { label: 'Success Stories', to: '#' },
    { label: 'Discord Server', to: '#' },
    { label: 'Blog & News', to: '#' },
  ],
  Company: [
    { label: 'About Us', to: '#' },
    { label: 'Careers', to: '#' },
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden" style={{ background: '#050914', borderTop: '1px solid rgba(255,255,255,0.055)' }}>
      {/* Glow blob */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.06), transparent 70%)', filter: 'blur(60px)' }} />

      <div className="max-w-7xl mx-auto px-5 relative z-10 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
                <img src="/logo.png" alt="HackerHouse" className="w-full h-full object-cover" onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.style.background = 'linear-gradient(135deg,#6366f1,#4f46e5)';
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
            <div className="flex gap-2 max-w-xs">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/40 transition-all"
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                <Mail size={15} className="text-white" />
              </motion.button>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: GitBranch, href: '#', label: 'GitHub' },
                { icon: Globe, href: '#', label: 'Website' },
                { icon: Mail, href: '#', label: 'Email' },
                { icon: ExternalLink, href: '#', label: 'LinkedIn' },
              ].map(({ icon: Icon, href, label }) => (
                <motion.a key={label} whileHover={{ y: -3, scale: 1.1 }} href={href} aria-label={label}
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
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to}
                      className="text-slate-500 hover:text-indigo-400 text-sm transition-colors duration-200 hover:translate-x-0.5 inline-block">
                      {label}
                    </Link>
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
    </footer>
  );
}
