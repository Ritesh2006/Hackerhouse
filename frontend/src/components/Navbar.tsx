import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Search, LayoutDashboard, User, Bell, Home, Menu, X, LogOut, ChevronRight, ChevronLeft, Download, Zap, BookOpen, Sparkles, CheckCircle2, Play, Pause, Maximize2, Minimize2, HelpCircle, Info, List } from 'lucide-react';
import { useState, useEffect } from 'react';
import { finalBaseUrl } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

const SLIDES = [
  {
    title: "HackerHouse: The Engineering Marketplace",
    subtitle: "Strategic Vision",
    content: "Welcome to HackerHouse—a premium, SaaS-enabled network mapping platform designed to connect verified developer talent with scaling businesses using real-time repository intelligence and geolocation indices.",
    bullets: [
      "Bridges the gap between code quality & matching.",
      "Integrates real-time AI and location protocols.",
      "Empowers companies to locate and verify skills.",
      "Redefines developer portfolios using direct APIs."
    ],
    image: "/hero_image.png",
    notes: "Begin the presentation by introducing the platform name and core value proposition. Highlight that HackerHouse disrupts traditional recruitment by offering direct skill verification and proximity matching.",
    qa: [
      {
        q: "What is the core innovation of HackerHouse?",
        a: "It combines code repository analysis (GitHub API + Groq AI) with spatial indexing (MongoDB 2dsphere) to match recruiters with qualified local talent instantly."
      }
    ]
  },
  {
    title: "Addressing the Core Sourcing Problem",
    subtitle: "Market Analysis",
    content: "Traditional developer directories rely on unverified resumes, static profiles, and manual review processes that delay hiring. HackerHouse creates an active, code-verified, geo-searchable marketplace.",
    bullets: [
      "Eliminates resume padding with live repo scans.",
      "Replaces static location fields with active GPS data.",
      "Accelerates time-to-hire by skipping filtering stages.",
      "Facilitates direct, context-rich chat verification."
    ],
    image: "/features_vector.png",
    notes: "Talk about recruitment friction: unverified claims and slow response times. Explain how manual screening wastes billions globally.",
    qa: [
      {
        q: "How does the platform prevent fake developer profiles?",
        a: "By requiring GitHub and LinkedIn OAuth integration, we map profiles to active coding footprints, which are analyzed for authenticity."
      }
    ]
  },
  {
    title: "AI-Powered Repository Audits",
    subtitle: "Technology Stack",
    content: "Our system integrates the Groq Llama-3.1-8b API to run real-time static code reviews, language profiling, and security auditing directly against public git repositories.",
    bullets: [
      "Automates repo evaluations in under 3 seconds.",
      "Computes trust scores from commit frequencies.",
      "Parses formatting, structure, and documentation.",
      "Generates actionable quality feedback on demand."
    ],
    image: "/features_vector.png",
    notes: "Describe how we leverage LLMs for static analysis. Mention that Groq's high throughput allows real-time generation of candidate audits.",
    qa: [
      {
        q: "Why use Groq and Llama-3.1-8b specifically?",
        a: "Groq offers ultra-low latency inference, enabling us to return complete repository evaluations in under 3 seconds, keeping the UX snappy."
      }
    ]
  },
  {
    title: "Precision Geolocation Engine",
    subtitle: "Features & Architecture",
    content: "Talent discovery is anchored in location. Using MongoDB's 2dsphere index capability combined with Haversine distance calculations, developers are sorted by exact sub-mile proximity.",
    bullets: [
      "Ensures exact distance computing in real-time.",
      "Enables flexible spatial radius search rings.",
      "Maintains developer privacy with location offsets.",
      "Allows remote-first filter expansions on fallback."
    ],
    image: "/hero_vector.png",
    notes: "Explain the backend spatial geometry. Emphasize that coordinates are queried efficiently using index bounds instead of calculating distance on all documents.",
    qa: [
      {
        q: "How are developer coordinates stored in MongoDB?",
        a: "We use GeoJSON Point format: { type: 'Point', coordinates: [longitude, latitude] } indexable with a '2dsphere' index."
      }
    ]
  },
  {
    title: "Real-Time Verified Messaging Channels",
    subtitle: "Interaction Layer",
    content: "Secure WebSocket connections build instant channels between employers and talent. Message delivery is logged and managed through a robust repository-service architectural design.",
    bullets: [
      "Provides zero-latency full-stack socket syncing.",
      "Automatically logs conversations for history recovery.",
      "Grants visual delivery indicators for connections.",
      "Maintains platform stability with fallback REST APIs."
    ],
    image: "/dashboard_banner.png",
    notes: "Highlight the communication architecture. WebSockets maintain persistent duplex connections. Explain how messages fallback to REST APIs during drops.",
    qa: [
      {
        q: "What protocols safeguard the chat channel?",
        a: "Connections require JWT token authentication query parameters during handshake. Messages are verified on the backend before broadcast."
      }
    ]
  },
  {
    title: "Verified LinkedIn Identity Integrations",
    subtitle: "Integrations Layer",
    content: "Ensuring real professional credentials, the LinkedIn integration supports secure OAuth callbacks, retrieves compliant user profiles, and logs message synchronization securely.",
    bullets: [
      "Leverages OIDC-compliant userinfo endpoints.",
      "Includes sandbox fallbacks for local test runs.",
      "Maintains direct links to verified profiles.",
      "Allows synced direct messaging on LinkedIn."
    ],
    image: "/hero_image.png",
    notes: "Discuss professional background verification. LinkedIn OIDC is used to capture email, name, and profile photos, adding corporate legitimacy.",
    qa: [
      {
        q: "What is OpenID Connect (OIDC)?",
        a: "OIDC is a simple identity layer on top of the OAuth 2.0 protocol, allowing clients to verify the identity of the end-user based on authentication performed by an Authorization Server."
      }
    ]
  },
  {
    title: "Highly Customizable Visual Workspaces",
    subtitle: "User Vibe Customization",
    content: "HackerHouse features a premium theme customizer that updates theme variables instantly. Using HSL-to-hex computations, our graphics shift colors seamlessly to match user aesthetics.",
    bullets: [
      "Persists custom theme choices in local storage.",
      "Applies real-time desaturating monochrome shifts.",
      "Adapts logo and backgrounds to accent selections.",
      "Maintains contrast ratios for perfect legibility."
    ],
    image: "/dashboard_banner.png",
    notes: "Show the dynamic styling engine. Explain how changing CSS variables at the root element instantly updates the UI theme.",
    qa: [
      {
        q: "How does the customizer preserve accessibility (A11y)?",
        a: "We limit user custom colors to high-contrast hues and compute background offsets programmatically, keeping text contrast ratios within WCAG AAA guidelines."
      }
    ]
  },
  {
    title: "Trust Scores & Professional Metrics",
    subtitle: "Matching Layer",
    content: "Every developer card showcases a verified billing rate, feedback-based rating, and language competence profile. This guarantees transparency in search results.",
    bullets: [
      "Maintains hourly rates and rating calculations.",
      "Deduplicates profiles from github & local db.",
      "Highlights top-rated developers in search fallbacks.",
      "Ensures type-safe interfaces prevent UI crashes."
    ],
    image: "/features_vector.png",
    notes: "Explain developer metrics. We map developer experience, rating, and language breakdown in clean cards with hover effects.",
    qa: [
      {
        q: "How is code language distribution calculated?",
        a: "We fetch repository language statistics via the GitHub API and compute percentage weightings to generate the candidate's language stack profile."
      }
    ]
  },
  {
    title: "SoulLink AI Chat Assistant",
    subtitle: "Navigation Layer",
    content: "A premium floating assistant uses artificial intelligence to interpret natural language. It assists recruiters in formulating search criteria and retrieving matches.",
    bullets: [
      "Processes human questions into search params.",
      "Answers questions about platform tools.",
      "Maintains dynamic chat history during use.",
      "Integrates smoothly with active color schemes."
    ],
    image: "/ai_agent_logo.png",
    notes: "Demonstrate the AI chatbot helper. Highlight the natural language search parsing: it can match queries to skills, billing rates, and location.",
    qa: [
      {
        q: "How is the conversational context preserved?",
        a: "We maintain stateful history in the frontend state and pass context-enriched conversation prompts to the backend Groq service."
      }
    ]
  },
  {
    title: "Hiring Workflows & Secure Agreements",
    subtitle: "Monetization Layer",
    content: "The hiring system lets teams trigger direct agreements via a secure modal. Creating a contract allocates resources, binds contacts, and establishes workspace permissions.",
    bullets: [
      "Initializes hiring contracts instantly.",
      "Protects conversations with verified status.",
      "Displays progress markers and billing states.",
      "Maintains complete audit trails in database."
    ],
    image: "/dashboard_banner.png",
    notes: "Describe contract onboarding. Highlight states: Proposed, Active, Completed. Mention that this forms the basis for SaaS monetization.",
    qa: [
      {
        q: "What security measures protect contract negotiations?",
        a: "Only authenticated contract participants can access the associated workspace, WebSocket chat, and billing metadata, enforced by database policy checks."
      }
    ]
  },
  {
    title: "Architecture & Deployment Topology",
    subtitle: "System Architecture",
    content: "HackerHouse is built as a modular, container-ready SaaS product. Its architecture decouples frontend rendering speed from intensive backend database operations.",
    bullets: [
      "Frontend: React 18, Vite 6, Tailwind/CSS variables.",
      "Backend: FastAPI 0.110, Python 3.11, Pydantic v2.",
      "Database: MongoDB Atlas with motor async driver.",
      "Auditing: Groq AI cloud integration model."
    ],
    image: "/hero_vector.png",
    notes: "Present the deployment architecture. Highlight the high performance of FastAPI and decoupled hosting (Vercel + Render + MongoDB Atlas).",
    qa: [
      {
        q: "Why is a decoupled architecture beneficial for scaling?",
        a: "It allows independent scaling of the frontend (CDN caching) and backend services (CPU-bound API requests) without resource competition."
      }
    ]
  },
  {
    title: "Future Roadmap & Technical Evolution",
    subtitle: "Product Future",
    content: "HackerHouse is positioned to scale talent search globally. Our roadmap targets predictive AI matches, automated smart contracts, and deep integration with workspace tools.",
    bullets: [
      "Adding auto-scheduled video interviews.",
      "Integrating smart-contract payments.",
      "Enabling code test sandbox screens.",
      "Launching Slack and Discord synchronization."
    ],
    image: "/hero_image.png",
    notes: "Wrap up by outlining upcoming features. Emphasize that the platform architecture is built modularly to accommodate these integrations.",
    qa: [
      {
        q: "How will smart-contract payments work?",
        a: "We plan to bridge milestones to blockchain networks using stablecoins like USDC to automate instant developer payout upon GitHub PR approvals."
      }
    ]
  }
];

export default function Navbar() {
  const location = useLocation();
  const { token, userId, logout } = useAuthStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Custom UI overlay states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // New slide settings
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev > 0 ? prev - 1 : SLIDES.length - 1));
    setProgress(0);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev < SLIDES.length - 1 ? prev + 1 : 0));
    setProgress(0);
  };

  const downloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download the PDF presentation.");
      return;
    }
    
    const slidesHTML = SLIDES.map((slide, index) => `
      <div class="slide-page">
        <div class="slide-header">
          <span class="slide-logo">HackerHouse Presentation Deck</span>
          <span class="slide-num">Slide ${index + 1} of ${SLIDES.length}</span>
        </div>
        <div class="slide-container">
          <div class="slide-content-left">
            <span class="slide-badge">${slide.subtitle}</span>
            <h1 class="slide-title">${slide.title}</h1>
            <div class="slide-text">${slide.content}</div>
            <div class="slide-bullets">
              ${slide.bullets.map(b => `<div class="slide-bullet"><span class="bullet-dot">•</span> ${b}</div>`).join('')}
            </div>
            <div class="slide-qa-box">
              <div class="qa-title">Viva Preparation Q&A</div>
              <div class="qa-q"><strong>Q:</strong> ${slide.qa[0].q}</div>
              <div class="qa-a"><strong>A:</strong> ${slide.qa[0].a}</div>
            </div>
          </div>
          <div class="slide-content-right">
            <img src="${slide.image}" class="slide-image" />
            <div class="slide-notes">
              <strong>Presenter Notes:</strong> ${slide.notes}
            </div>
          </div>
        </div>
        <div class="slide-footer">
          <span>HackerHouse — Engineering Verification Network</span>
          <span>https://hackerhouse.dev</span>
        </div>
      </div>
    `).join('<div class="page-break"></div>');

    printWindow.document.write(`
      <html>
        <head>
          <title>HackerHouse Project Presentation Deck</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
            @page {
              size: A4 landscape;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: 'Plus Jakarta Sans', sans-serif;
              background: #050914;
              color: #f1f5f9;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .slide-page {
              width: 297mm;
              height: 210mm;
              padding: 16mm;
              box-sizing: border-box;
              background: radial-gradient(circle at 10% 20%, #0d1225 0%, #050914 90%);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
              overflow: hidden;
              page-break-inside: avoid;
              page-break-after: always;
            }
            .slide-page::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 4px;
              background: linear-gradient(90deg, #6366f1, #a855f7);
            }
            .slide-header {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              font-weight: 700;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .slide-container {
              display: grid;
              grid-template-columns: 1.2fr 0.8fr;
              gap: 20px;
              flex: 1;
              margin-top: 15px;
              margin-bottom: 15px;
              min-height: 0;
            }
            .slide-content-left {
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .slide-content-right {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              gap: 15px;
            }
            .slide-badge {
              font-size: 10px;
              font-weight: 700;
              color: #818cf8;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              margin-bottom: 5px;
            }
            .slide-title {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 26px;
              font-weight: 900;
              margin: 0 0 10px 0;
              color: #ffffff;
              line-height: 1.15;
            }
            .slide-text {
              font-size: 13px;
              color: #cbd5e1;
              line-height: 1.5;
              margin-bottom: 15px;
              font-weight: 400;
            }
            .slide-bullets {
              display: grid;
              grid-template-columns: 1fr;
              gap: 8px;
              margin-bottom: 15px;
            }
            .slide-bullet {
              font-size: 11px;
              color: #cbd5e1;
              line-height: 1.4;
              display: flex;
              align-items: flex-start;
            }
            .bullet-dot {
              color: #6366f1;
              font-weight: 900;
              margin-right: 6px;
            }
            .slide-qa-box {
              background: rgba(255, 255, 255, 0.03);
              border-left: 3px solid #f59e0b;
              padding: 8px 12px;
              border-radius: 4px;
              font-size: 10px;
            }
            .qa-title {
              font-weight: 700;
              color: #f59e0b;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 3px;
            }
            .qa-q {
              color: #ffffff;
            }
            .qa-a {
              color: #cbd5e1;
              margin-top: 2px;
            }
            .slide-image {
              width: 100%;
              max-height: 150px;
              object-fit: contain;
              border-radius: 8px;
              border: 1px solid rgba(255, 255, 255, 0.08);
              background: rgba(255, 255, 255, 0.02);
              padding: 4px;
            }
            .slide-notes {
              background: rgba(99, 102, 241, 0.08);
              border: 1px solid rgba(99, 102, 241, 0.15);
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 10px;
              color: #a5b4fc;
              line-height: 1.4;
              width: 90%;
            }
            .slide-footer {
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: #64748b;
              border-top: 1px solid rgba(255, 255, 255, 0.05);
              padding-top: 8px;
            }
            .page-break {
              page-break-after: always;
              break-after: page;
            }
            @media print {
              body {
                background: #050914;
              }
              .slide-page {
                width: 297mm;
                height: 210mm;
                margin: 0;
                border: none;
                border-radius: 0;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${slidesHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    if (!isDocsOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (e.key === 'ArrowRight') {
        handleNextSlide();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDocsOpen, activeSlide]);

  useEffect(() => {
    if (!isDocsOpen) {
      setIsPlaying(false);
      setProgress(0);
      return;
    }
    if (!isPlaying) {
      setProgress(0);
      return;
    }

    const intervalTime = 100;
    const totalDuration = 7000;
    const increment = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveSlide((curr) => (curr < SLIDES.length - 1 ? curr + 1 : 0));
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isDocsOpen, isPlaying]);

  useEffect(() => {
    setProgress(0);
  }, [activeSlide]);

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 20));

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Product', icon: LayoutDashboard },
    { path: '/search', label: 'Developers', icon: Search },
  ];

  const mockNotifications = [
    { id: 1, title: 'Matching Engine Active 🚀', text: 'Google developer integration indexed successfully.', time: '2m ago', unread: true },
    { id: 2, title: 'Contract Proposal received 🤝', text: 'Stripe, Inc. initiated a hiring proposal.', time: '1h ago', unread: true },
    { id: 3, title: 'Message from Ritesh Rakshit 💬', text: 'Hey, let\'s catch up regarding the minor project details!', time: '3h ago', unread: false }
  ];

  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${finalBaseUrl}/health`);
        setIsBackendOnline(res.ok);
      } catch { setIsBackendOnline(false); }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = (isMobileMenuOpen || isDocsOpen || isPricingOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen, isDocsOpen, isPricingOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-3 sm:mx-5 mt-3 sm:mt-4 transition-all duration-300">
          <div
            className={`glass rounded-2xl px-3 sm:px-5 md:px-7 py-3 flex items-center justify-between max-w-7xl mx-auto transition-all duration-300 ${
              scrolled
                ? 'shadow-2xl shadow-black/40 border-white/10'
                : 'border-white/6'
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-primary/30">
                <img src="/logo.png" alt="HackerHouse" className="w-full h-full object-cover" />
              </div>
              <span className="text-base sm:text-[17px] font-black tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="text-gradient">Hacker</span>
                <span className="text-white">House</span>
              </span>
              {/* Status dot */}
              <div className="relative flex" title={isBackendOnline ? `Backend Online` : `Backend Offline`}>
                <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-70 ${isBackendOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackendOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] rounded-2xl p-1 border border-white/5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="relative px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors z-10"
                    style={{ color: isActive ? 'white' : 'rgba(148,163,184,0.9)' }}
                  >
                    {(isActive || hoveredItem === item.path) && (
                      <motion.div
                        layoutId="navPill"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: isActive
                            ? 'linear-gradient(135deg, var(--color-primary-glow), rgba(255,255,255,0.02))'
                            : 'rgba(255,255,255,0.05)',
                          border: isActive ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.06)'
                        }}
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                      />
                    )}
                    <Icon size={15} className="relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}

              {/* Pricing Item */}
              <button
                onClick={() => setIsPricingOpen(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 text-slate-400 hover:text-white transition-colors relative"
              >
                <Zap size={15} />
                <span>Pricing</span>
              </button>

              {/* Docs Item */}
              <button
                onClick={() => setIsDocsOpen(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 text-slate-400 hover:text-white transition-colors relative"
              >
                <BookOpen size={15} />
                <span>Docs</span>
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {token ? (
                <>
                  {/* Notifications Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="flex w-9 h-9 rounded-xl glass items-center justify-center text-slate-400 hover:text-white transition-all relative hover:border-primary/30"
                    >
                      <Bell size={15} />
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-[#050914]" />
                    </button>

                    <AnimatePresence>
                      {isNotificationsOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 p-4 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden"
                            style={{ background: 'rgba(12, 17, 34, 0.92)' }}
                          >
                            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Inbox Notifications</h4>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary-light font-bold">2 New</span>
                            </div>
                            <div className="space-y-3">
                              {mockNotifications.map(notif => (
                                <div key={notif.id} className={`p-2.5 rounded-xl transition-colors hover:bg-white/5 cursor-pointer ${notif.unread ? 'bg-primary/[0.04]' : ''}`}>
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-xs font-bold text-white leading-tight">{notif.title}</span>
                                    <span className="text-[9px] text-slate-500 shrink-0 font-medium">{notif.time}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">{notif.text}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile Link */}
                  <Link
                    to={userId ? `/profile/${userId}` : '#'}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl glass hover:border-primary/30 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <User size={13} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-300 hidden md:block group-hover:text-white transition-colors">Profile</span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    className="hidden lg:flex px-3.5 py-2 rounded-xl text-red-400/80 text-xs font-bold hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all items-center gap-1.5"
                  >
                    <LogOut size={13} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                    Log in
                  </Link>
                  <Link to="/signup" className="btn-primary text-sm py-2 px-5 flex items-center gap-1.5">
                    <Zap size={13} />
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white touch-target active:scale-95 transition-all"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X size={18} />
                    </motion.div>
                  ) : (
                    <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" onClick={() => setIsMobileMenuOpen(false)} />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 rounded-t-[2rem] overflow-hidden z-50"
              style={{
                background: 'linear-gradient(180deg, #0d1225, #080d1c)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottom: 'none',
                paddingBottom: 'env(safe-area-inset-bottom, 28px)'
              }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/15" />
              </div>

              <div className="px-5 py-4 border-b border-white/5">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Navigation</p>
              </div>

              <div className="px-4 py-3 space-y-1">
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98] ${
                          isActive
                            ? 'bg-primary/12 border border-primary/25 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary/20' : 'bg-white/5'}`}>
                            <Icon size={17} className={isActive ? 'text-primary' : 'text-slate-400'} />
                          </div>
                          <span className="font-semibold text-[15px]">{item.label}</span>
                        </div>
                        <ChevronRight size={15} className={isActive ? 'text-primary' : 'text-slate-600'} />
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile Pricing */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setIsPricingOpen(true); }}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                      <Zap size={17} className="text-slate-400" />
                    </div>
                    <span className="font-semibold text-[15px]">Pricing</span>
                  </div>
                  <ChevronRight size={15} className="text-slate-600" />
                </button>

                {/* Mobile Docs */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setIsDocsOpen(true); }}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                      <BookOpen size={17} className="text-slate-400" />
                    </div>
                    <span className="font-semibold text-[15px]">Docs Hub</span>
                  </div>
                  <ChevronRight size={15} className="text-slate-600" />
                </button>
              </div>

              <div className="mx-4 my-1 h-px bg-white/5" />

              <div className="px-4 pb-4 pt-2 space-y-2">
                {token ? (
                  <>
                    <Link to={userId ? `/profile/${userId}` : '#'} onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-300 hover:bg-white/5 transition-all border border-transparent active:scale-[0.98]">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                          <User size={17} className="text-white" />
                        </div>
                        <span className="font-semibold text-[15px] text-white">My Profile</span>
                      </div>
                      <ChevronRight size={15} className="text-slate-600" />
                    </Link>
                    <button onClick={logout}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all active:scale-[0.98]">
                      <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <LogOut size={17} className="text-red-400" />
                      </div>
                      <span className="font-semibold text-[15px]">Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center py-3.5 rounded-2xl glass border border-white/10 text-slate-300 font-bold text-sm transition-all active:scale-95">
                      Log In
                    </Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center py-3.5 rounded-2xl btn-primary text-sm font-bold active:scale-95">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DOCS MODAL ── */}
      <AnimatePresence>
        {isDocsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => { setIsDocsOpen(false); setIsFullscreen(false); }} 
              className="absolute inset-0 bg-background/85 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              className={`relative shadow-2xl border border-white/8 transition-all duration-300 flex flex-col overflow-hidden ${
                isFullscreen 
                  ? 'fixed inset-0 w-screen h-screen rounded-none max-w-none max-h-none border-none' 
                  : 'w-full max-w-[95vw] md:max-w-6xl h-[680px] max-h-[90vh] rounded-[2rem]'
              }`}
              style={{ background: 'linear-gradient(145deg, rgba(15,22,45,0.96), rgba(10,15,35,0.99))' }}
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-primary/5 shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <BookOpen size={16} className="text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-black text-white flex items-center gap-2 font-display">
                      HackerHouse Presentation Hub <Sparkles size={14} className="text-primary" />
                    </h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Strategic Pitch & Architecture Deck</p>
                  </div>
                </div>
                
                {/* Header Controls */}
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Autoplay Play/Pause */}
                  <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-2.5 py-1.5">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                      title={isPlaying ? "Pause Autoplay" : "Start Autoplay (7s)"}
                    >
                      {isPlaying ? (
                        <>
                          <Pause size={12} className="text-primary animate-pulse" />
                          <span className="text-[10px] font-bold hidden sm:inline text-primary">PAUSE</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} className="text-slate-400" />
                          <span className="text-[10px] font-bold hidden sm:inline">PLAY</span>
                        </>
                      )}
                    </button>
                    {isPlaying && (
                      <div className="w-12 bg-white/10 h-1 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className="bg-primary h-full transition-all duration-100 ease-linear"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Fullscreen Toggle */}
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)} 
                    className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    title={isFullscreen ? "Exit Fullscreen" : "Presenter Mode"}
                  >
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>

                  {/* PDF Download */}
                  <button 
                    onClick={downloadPDF} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white transition-all bg-primary/20 hover:bg-primary/30 border border-primary/30"
                    title="Download Landscape Presentation PDF"
                  >
                    <Download size={12} />
                    <span className="hidden sm:inline">PDF</span>
                  </button>

                  <div className="w-px h-6 bg-white/5" />

                  {/* Close */}
                  <button 
                    onClick={() => { setIsDocsOpen(false); setIsFullscreen(false); }} 
                    className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-red-500/20 border border-white/5 hover:border-red-500/20 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Main Deck Container (Split sidebar + slides) */}
              <div className="flex-1 flex min-h-0 relative z-10">
                
                {/* Left Sidebar Slide Selector (Desktop only) */}
                <div className="hidden md:flex w-60 border-r border-white/5 bg-black/15 flex-col overflow-y-auto p-4 space-y-1 shrink-0">
                  <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <List size={10} />
                    Slide Outline
                  </div>
                  {SLIDES.map((slide, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setActiveSlide(idx); }}
                      className={`text-left px-3 py-2 rounded-xl text-xs transition-all border flex items-start gap-2.5 ${
                        idx === activeSlide
                          ? 'bg-primary/10 border-primary/20 text-white shadow-sm'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 ${
                        idx === activeSlide ? 'bg-primary text-white' : 'bg-white/5 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="truncate flex-1">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">{slide.subtitle}</div>
                        <div className="font-semibold truncate">{slide.title}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right Slide Stage */}
                <div className="flex-1 flex flex-col justify-between min-h-0 bg-[#090d1a]/40">
                  
                  {/* Slide Viewport */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full"
                      >
                        {/* Slide Left: Info (7 cols) */}
                        <div className="lg:col-span-7 flex flex-col space-y-4">
                          <div>
                            <span className="text-primary text-xs font-black uppercase tracking-widest bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full inline-block">
                              Slide {activeSlide + 1} of {SLIDES.length} — {SLIDES[activeSlide].subtitle}
                            </span>
                            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white mt-2 leading-tight tracking-tight font-display" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                              {SLIDES[activeSlide].title}
                            </h2>
                          </div>
                          
                          <div className="h-px w-full bg-white/5" />
                          
                          <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
                            {SLIDES[activeSlide].content}
                          </p>
                          
                          {/* Bullet Points */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                            {SLIDES[activeSlide].bullets.map((bullet, idx) => (
                              <div key={idx} className="flex items-start gap-2.5 text-[11px] md:text-xs text-slate-400 font-semibold font-sans">
                                <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
                                <span>{bullet}</span>
                              </div>
                            ))}
                          </div>

                          {/* Presenter Helper / Viva Q&A Drawer */}
                          <div className="pt-3">
                            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3.5 backdrop-blur-sm">
                              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                                <div className="flex gap-3 text-[10px] font-black uppercase tracking-wider">
                                  <button
                                    onClick={() => setShowSpeakerNotes(false)}
                                    className={`pb-1 transition-all ${!showSpeakerNotes ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
                                  >
                                    College Viva Q&A
                                  </button>
                                  <button
                                    onClick={() => setShowSpeakerNotes(true)}
                                    className={`pb-1 transition-all ${showSpeakerNotes ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200'}`}
                                  >
                                    Speaker Presentation Guide
                                  </button>
                                </div>
                                <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold">
                                  <HelpCircle size={10} />
                                  <span>Viva Helper</span>
                                </div>
                              </div>
                              
                              <div className="text-[11px] leading-relaxed text-slate-300 min-h-[50px] transition-all">
                                {!showSpeakerNotes ? (
                                  <div className="space-y-2">
                                    {SLIDES[activeSlide].qa.map((item, index) => (
                                      <div key={index}>
                                        <p className="font-bold text-amber-400/90 flex items-center gap-1">
                                          <Sparkles size={9} className="text-amber-500 shrink-0" />
                                          Q: {item.q}
                                        </p>
                                        <p className="text-slate-300 mt-0.5 pl-3 border-l border-amber-500/20">{item.a}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="italic text-slate-400 flex items-start gap-1.5">
                                    <Info size={11} className="text-primary shrink-0 mt-0.5" />
                                    <span>{SLIDES[activeSlide].notes}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Slide Right: Visual Mockup (5 cols) */}
                        <div className="lg:col-span-5 flex flex-col items-center justify-center h-full">
                          <div className="relative group w-full max-w-[340px] aspect-video sm:aspect-auto sm:h-52 lg:h-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 flex items-center justify-center p-4">
                            {/* Neon glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary-light/5 opacity-50" />
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary-light rounded-2xl blur opacity-20 group-hover:opacity-35 transition duration-500" />
                            
                            <motion.img 
                              key={activeSlide}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.3 }}
                              src={SLIDES[activeSlide].image} 
                              alt={SLIDES[activeSlide].title} 
                              className="relative z-10 max-w-full max-h-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          
                          <span className="text-[10px] text-slate-500 italic mt-3 flex items-center gap-1">
                            <Sparkles size={9} className="text-primary" />
                            Visual Asset: {SLIDES[activeSlide].image.split('/').pop()}
                          </span>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Stage Bottom Controls */}
                  <div className="p-4 md:p-6 border-t border-white/5 bg-black/10 shrink-0">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      
                      {/* Nav Button Controls */}
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handlePrevSlide}
                          className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border text-white border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        >
                          <ChevronLeft size={14} /> Previous
                        </motion.button>

                        <div className="text-xs font-bold text-slate-400 font-mono">
                          {activeSlide + 1} / {SLIDES.length}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleNextSlide}
                          className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border text-white border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        >
                          Next <ChevronRight size={14} />
                        </motion.button>
                      </div>

                      {/* Dots progress selector */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {SLIDES.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveSlide(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              idx === activeSlide 
                                ? 'w-5 bg-primary shadow-sm shadow-primary/45' 
                                : 'w-1.5 bg-white/15 hover:bg-white/30'
                            }`}
                            title={`Go to Slide ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">
                        Use Arrow Keys ◄ / ► to Navigate
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PRICING MODAL ── */}
      <AnimatePresence>
        {isPricingOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPricingOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              className="relative w-full max-w-xl overflow-hidden border border-white/8 shadow-2xl rounded-[2rem]"
              style={{ background: 'linear-gradient(145deg, rgba(15,22,45,0.96), rgba(10,15,35,0.99))' }}>
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-amber-500/5">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2 font-display">
                    Premium Subscriptions <Zap size={16} className="text-amber-400" />
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Scale your engineering team</p>
                </div>
                <button onClick={() => setIsPricingOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-6 text-center">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
                  <h4 className="text-lg font-bold text-white mb-1">Developer Growth Plan</h4>
                  <div className="text-3xl font-black text-white font-mono mt-3">$49<span className="text-sm font-normal text-slate-500">/mo</span></div>
                  <p className="text-slate-400 text-xs mt-3">Unlock infinite global searches, location-aware auto detection, and real-time GitHub trust sync metrics.</p>
                  <ul className="text-xs text-slate-300 text-left space-y-2 max-w-xs mx-auto mt-5">
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> Dynamic Local Matching Search</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> Full GitHub Commits Sync</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> Dynamic Custom theme engine</li>
                  </ul>
                  <button onClick={() => setIsPricingOpen(false)} className="btn-primary w-full py-3.5 rounded-xl font-bold mt-6 text-sm flex items-center justify-center gap-2">
                    Start Free 14-day Trial <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
