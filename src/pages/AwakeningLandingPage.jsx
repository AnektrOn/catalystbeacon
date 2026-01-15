import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Unlock,
  Eye,
  Infinity,
  Check,
  X,
  Activity,
  ChevronDown
} from 'lucide-react';

// Logo path - production uses /assets/Logo beacon.png
// For local development, we'll try the production path first, then fallback to hc-logo.svg
const LogoBeacon = '/hc-logo.svg';

/* --- INTERNAL COMPONENT: ETHEREAL CARD (Matching XPCircleWidget V4) --- */
const NeomorphicCard = ({ 
  children, 
  size = 'medium', 
  className = '',
  elevated = false,
  interactive = false,
  onClick,
  style = {}
}) => {
  // 1. Base Styles for the Ethereal Card (Matches XPCircleWidgetV2 CSS)
  const cardStyles = {
    base: `
      relative w-full overflow-hidden transition-all duration-500 ease-out
      bg-[rgba(8,8,12,0.4)] backdrop-blur-[20px] 
      border border-white/10 text-[#e0e0e0] font-rajdhani
      shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_80px_rgba(165,243,252,0.05)]
    `,
    hover: interactive ? `
      hover:-translate-y-1 
      hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_0_100px_rgba(165,243,252,0.08)]
      hover:border-white/15
      cursor-pointer group
    ` : '',
    elevated: elevated ? `shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_0_90px_rgba(165,243,252,0.08)]` : ``,
    
    // Size variants matching your original sizes
    small: 'p-4 md:p-6 rounded-[24px] min-h-[100px]',
    medium: 'p-6 md:p-8 rounded-[24px] min-h-[180px]', 
    large: 'p-6 md:p-10 rounded-[24px] md:rounded-[32px] min-h-[280px] md:min-h-[300px]',
    xl: 'p-8 md:p-12 rounded-[24px] md:rounded-[32px] min-h-[350px] md:min-h-[400px]'
  };

  return (
    <div 
      className={`
        ${cardStyles.base} 
        ${cardStyles[size === 'medium' ? 'medium' : size]} 
        ${cardStyles.hover} 
        ${cardStyles.elevated} 
        card-ambient-glow 
        ${className}
      `}
      onClick={interactive ? onClick : undefined}
      style={style}
    >
      {/* Light Source Animation (Matches XPCircleWidget) */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(165,243,252,0.08),transparent_60%)] pointer-events-none z-0 animate-breathe-light" />
      
      {/* Floating Particles (Subtle) */}
      {interactive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700">
           <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-[80%] left-[20%] animate-float-particle" style={{ animationDelay: '0s' }} />
           <div className="absolute w-[1px] h-[1px] bg-white rounded-full top-[60%] left-[80%] animate-float-particle" style={{ animationDelay: '2s' }} />
        </div>
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

/* --- MAIN PAGE COMPONENT --- */
const EnhancedLandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [particles, setParticles] = useState([]);
  const [expandedPhases, setExpandedPhases] = useState(new Set());

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Random glitch effect (Frequency: Every 2 seconds)
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 800);
    }, 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(glitchInterval);
    };
  }, []);

  // Global Styles for the Ethereal Theme - MATCHING HTML PREVIEW EXACTLY
  const globalStyles = `
    :root {
      --ethereal-cyan: #a5f3fc;
      --ethereal-violet: #a78bfa;
      --bg-dark: #020202;
    }

    .font-cinzel { font-family: 'Cinzel', serif; }
    .font-rajdhani { font-family: 'Rajdhani', sans-serif; }

    /* Animations */
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow { animation: spin-slow 60s linear infinite; }

    @keyframes breathe-light {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.1); }
    }
    .animate-breathe-light { animation: breathe-light 8s ease-in-out infinite; }

    /* Text Shadow Glow */
    .text-shadow-glow {
      text-shadow: 0 0 20px rgba(165, 243, 252, 0.4);
    }

    /* RESTORED GLITCH EFFECT (The original one you liked) */
    .glitch { position: relative; display: block; }
    .glitch::before, .glitch::after {
      content: attr(data-text);
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: #020202;
      opacity: 0.8;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      z-index: 50;
      font-size: inherit;
      font-weight: bold;
    }
    .glitch::before {
      left: 2px;
      text-shadow: -1px 0 #a5f3fc;
      clip-path: inset(10% 0 60% 0);
      animation: glitch-anim 0.3s infinite linear alternate-reverse;
    }
    .glitch::after {
      left: -2px;
      text-shadow: -1px 0 #a78bfa;
      clip-path: inset(70% 0 10% 0);
      animation: glitch-anim 0.3s infinite linear alternate-reverse;
      animation-delay: 0.1s;
    }

    @keyframes glitch-anim {
      0% { clip-path: inset(10% 0 85% 0); transform: translate(0); }
      20% { clip-path: inset(85% 0 5% 0); transform: translate(-2px, 2px); }
      40% { clip-path: inset(5% 0 90% 0); transform: translate(2px, -2px); }
      60% { clip-path: inset(70% 0 10% 0); transform: translate(-1px, 1px); }
      80% { clip-path: inset(40% 0 50% 0); transform: translate(1px, -1px); }
      100% { clip-path: inset(15% 0 70% 0); transform: translate(0); }
    }

    /* Restored Button Styles */
    .btn-ethereal-primary {
      background: rgba(165, 243, 252, 0.05) !important;
      border: 1px solid rgba(165, 243, 252, 0.3) !important;
      color: #a5f3fc !important;
      font-weight: 600 !important;
      letter-spacing: 2px !important;
      backdrop-filter: blur(4px) !important;
      transition: all 0.4s ease !important;
      box-shadow: 0 0 15px rgba(165, 243, 252, 0.1) !important;
    }
    .btn-ethereal-primary:hover {
      background: rgba(165, 243, 252, 0.15) !important;
      border-color: rgba(165, 243, 252, 0.6) !important;
      box-shadow: 0 0 30px rgba(165, 243, 252, 0.25) !important;
      transform: translateY(-2px) !important;
      text-shadow: 0 0 10px rgba(165, 243, 252, 0.8) !important;
      color: white !important;
    }

    .btn-ethereal-text {
      color: rgba(255, 255, 255, 0.6) !important;
      letter-spacing: 1px !important;
      transition: all 0.3s !important;
    }
    .btn-ethereal-text:hover {
      color: #a5f3fc !important;
      text-shadow: 0 0 10px rgba(165, 243, 252, 0.5) !important;
    }
  `;

  return (
    <div className="min-h-screen bg-[#020202] text-[#e0e0e0] overflow-hidden relative font-rajdhani">
      <style>{globalStyles}</style>
      
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#08080c] via-[#020202] to-[#000000]" />
        <div 
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 animate-breathe-light"
          style={{ 
            background: 'radial-gradient(circle, #a5f3fc 0%, transparent 70%)',
            transform: `translate(${scrollY * 0.02}px, ${scrollY * 0.02}px)` 
          }}
        />
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#020202]/60 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center gap-3">
              <img src={LogoBeacon} alt="HC Beacon" className="h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(165,243,252,0.6)]" />
            </div>

            <div className="flex items-center gap-8">
              <Link to="/login" className="hidden md:block text-sm font-cinzel tracking-wide text-gray-400 hover:text-cyan-200 transition-colors">
                Access
              </Link>
              <Button asChild variant="ghost" className="btn-ethereal-primary rounded-full px-8 py-2 text-xs">
                <Link to="/signup">
                  Initialize
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative flex items-center justify-center px-4 pt-80 pb-40 w-full">
        
        {/* Orbital Rings Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none z-0">
          <svg width="1000" height="1000" viewBox="0 0 1000 1000" className="animate-spin-slow">
            <circle cx="500" cy="500" r="400" fill="none" stroke="#a5f3fc" strokeWidth="0.5" />
            <circle cx="500" cy="500" r="400" fill="none" stroke="white" strokeWidth="1" strokeDasharray="1 30" />
            <circle cx="500" cy="500" r="300" fill="none" stroke="#a78bfa" strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="500" cy="500" r="200" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
            
            {/* Badge */}
            <div className="mb-10 flex justify-center">
                <div className="px-6 py-2 border border-cyan-200/20 bg-cyan-900/5 backdrop-blur-md rounded-full text-cyan-100 text-xs font-cinzel font-semibold tracking-[0.3em] uppercase shadow-[0_0_30px_rgba(165,243,252,0.1)]">
                  ✦ QUANTUM KERNEL: ACCESSED ✦
                </div>
            </div>

            {/* Main Headline with JS Glitch Trigger */}
            <h1 className="text-6xl md:text-9xl font-bold mb-10 leading-tight font-rajdhani text-white">
                <span className="font-light text-5xl md:text-7xl block mb-3 text-gray-300 tracking-wide">REWRITE THE</span>
                <span className={`block text-6xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-violet-300 filter drop-shadow-[0_0_30px_rgba(165,243,252,0.5)] ${glitchActive ? 'glitch' : ''}`} data-text="MATRIX">
                  SOURCE CODE
                </span>
            </h1>

            {/* Subheadline (RESTAURÉ) */}
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light font-rajdhani tracking-wide leading-relaxed">
                Most lives run on autopilot. This is a manual override.
                <br className="hidden md:block" />
                Not motivation. Not content. 
                <span className="text-cyan-200 drop-shadow-[0_0_8px_rgba(165,243,252,0.5)] font-medium"> A complete framework for human evolution.</span>
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-24">
                <Button asChild className="group relative px-12 py-6 btn-ethereal-primary text-xl rounded-full h-auto">
                    <Link to="/signup" className="flex items-center gap-3">
                        INITIATE SEQUENCE
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </Link>
                </Button>
                
                <Button asChild variant="ghost" className="px-10 py-6 text-gray-400 font-rajdhani text-xl tracking-widest uppercase hover:text-[#a5f3fc] transition-colors duration-300 flex items-center gap-2 hover:drop-shadow-[0_0_10px_rgba(165,243,252,0.5)] h-auto">
                    <Link to="/courses">
                        EXPLORE THE ARCHITECTURE
                    </Link>
                </Button>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap justify-center gap-16 border-t border-white/5 pt-12">
                {/* Stat 1 */}
                <div className="text-center group cursor-default">
                    <div className="flex items-center justify-center gap-2 mb-2 text-gray-600 group-hover:text-cyan-200 transition-colors duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                        <span className="text-xs font-cinzel tracking-[0.2em] uppercase">System Status</span>
                    </div>
                    <div className="text-3xl font-light font-rajdhani text-white text-shadow-glow tracking-widest">
                        ONLINE
                    </div>
                </div>

                {/* Stat 2 */}
                <div className="text-center group cursor-default">
                    <div className="flex items-center justify-center gap-2 mb-2 text-gray-600 group-hover:text-cyan-200 transition-colors duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                        <span className="text-xs font-cinzel tracking-[0.2em] uppercase">Genesis Cycle</span>
                    </div>
                    <div className="text-3xl font-light font-rajdhani text-white text-shadow-glow tracking-widest">
                        001
                    </div>
                </div>

                {/* Stat 3 */}
                <div className="text-center group cursor-default">
                    <div className="flex items-center justify-center gap-2 mb-2 text-gray-600 group-hover:text-cyan-200 transition-colors duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <span className="text-xs font-cinzel tracking-[0.2em] uppercase">Access Ports</span>
                    </div>
                    <div className="text-3xl font-light font-rajdhani text-white text-shadow-glow tracking-widest">
                        OPEN
                    </div>
                </div>
            </div>

        </div>
      </section>

      {/* --- COMPARISON SECTION --- */}
      <section className="relative py-40 md:py-48 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent pointer-events-none"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 font-cinzel text-white">
              CHOOSE YOUR <span className="text-cyan-200 drop-shadow-[0_0_15px_rgba(165,243,252,0.6)]">REALITY</span>
            </h2>
            <p className="font-rajdhani text-lg md:text-xl text-gray-400 tracking-wide">
              Unawakened vs. Enlightened
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            {/* Reactive (Negative - Darker/Redder) */}
            <NeomorphicCard className="bg-[rgba(20,10,10,0.4)] border-red-900/30 shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_0_90px_rgba(239,68,68,0.05)]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-red-900/10 flex items-center justify-center border border-red-500/20">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-red-300/80 font-cinzel tracking-wider">UNAWAKENED</h3>
              </div>
              <ul className="space-y-6 font-rajdhani text-lg text-gray-500">
                {[
                  "Conditioned perception",
                  "Reactive behavior",
                  "Fragmented identity",
                  "External influence"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-900" />
                    {item}
                  </li>
                ))}
              </ul>
            </NeomorphicCard>

            {/* Intentional (Positive - Ethereal) */}
            <NeomorphicCard className="bg-[rgba(165,243,252,0.03)] border-cyan-200/30 shadow-[0_35px_70px_rgba(0,0,0,0.7),inset_0_0_100px_rgba(165,243,252,0.1)]" elevated>
              <div className="absolute top-0 right-0 p-6">
                <div className="w-2 h-2 rounded-full bg-cyan-200 shadow-[0_0_10px_#a5f3fc] animate-pulse" />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-cyan-200/10 flex items-center justify-center border border-cyan-200/30 shadow-[0_0_15px_rgba(165,243,252,0.15)]">
                  <Sparkles className="w-5 h-5 text-cyan-200" />
                </div>
                <h3 className="text-2xl font-bold text-cyan-100 font-cinzel tracking-wider">ENLIGHTENED</h3>
              </div>
              <ul className="space-y-6 font-rajdhani text-lg text-gray-300">
                {[
                  "Conscious perception",
                  "Deliberate action",
                  "Integrated identity",
                  "Internal authority"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <Check className="w-4 h-4 text-cyan-200" />
                    <span className="text-shadow-glow">{item}</span>
                  </li>
                ))}
              </ul>
            </NeomorphicCard>
          </div>
        </div>
      </section>

      {/* --- WHAT THIS IS (AND IS NOT) --- */}
      <section className="relative py-32 md:py-40 px-4">
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-cinzel text-white">
              WHAT THIS IS <span className="text-cyan-200 drop-shadow-[0_0_12px_rgba(165,243,252,0.5)]">(AND IS NOT)</span>
            </h2>
          </div>

          <NeomorphicCard className="mb-12 shadow-[0_40px_80px_rgba(0,0,0,0.7),inset_0_0_110px_rgba(165,243,252,0.08)] border-cyan-200/20" size="large" elevated>
            <div className="space-y-8">
              <div className="space-y-6">
                <p className="text-xl md:text-2xl font-rajdhani text-gray-300 leading-relaxed">
                  This is not another app.
                </p>
                <p className="text-lg md:text-xl font-rajdhani text-gray-400 leading-relaxed">
                  Human Catalyst is not designed to make you feel better for a moment.
                </p>
                <p className="text-lg md:text-xl font-rajdhani text-cyan-200 leading-relaxed font-semibold">
                  It is designed to change how you function.
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <p className="text-base md:text-lg font-rajdhani text-gray-400">
                  Not content to consume.
                </p>
                <p className="text-base md:text-lg font-rajdhani text-gray-400">
                  Not techniques to collect.
                </p>
                <p className="text-base md:text-lg font-rajdhani text-gray-400">
                  Not beliefs to adopt.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="text-lg md:text-xl font-rajdhani text-white leading-relaxed">
                  A system to reconfigure perception, behavior, and identity — over time.
                </p>
              </div>
            </div>
          </NeomorphicCard>

          <div className="mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 font-cinzel text-white text-center">
              What makes it different
            </h3>
            <div className="grid md:grid-cols-2 gap-6 md:gap-10">
              {[
                "Structured progression, not random practices",
                "Integration into daily life, not isolated experiences",
                "Inner mechanics, not surface habits",
                "Long-term coherence, not short-term relief"
              ].map((item, i) => (
                <NeomorphicCard key={i} className="flex items-start gap-4" size="small">
                  <div className="w-2 h-2 rounded-full bg-cyan-200 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(165,243,252,0.5)]" />
                  <p className="text-base font-rajdhani text-gray-300 leading-relaxed">{item}</p>
                </NeomorphicCard>
              ))}
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-lg md:text-xl font-rajdhani text-gray-300 mb-6 italic">
              You don't escape reality.
            </p>
            <p className="text-lg md:text-xl font-rajdhani text-cyan-200 font-semibold">
              You learn to operate within it consciously.
            </p>
          </div>

          <div className="text-center">
            <Button asChild variant="ghost" className="btn-ethereal-text rounded-full px-8 py-4 text-base font-rajdhani">
              <Link to="/courses">
                → See how the system works
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* --- THE PROGRESSION (Timeline) --- */}
      <section className="relative py-40 md:py-48 px-4 bg-gradient-to-b from-black/20 via-cyan-900/10 to-black/20">
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 font-cinzel text-white">
              ASCENSION <span className="text-violet-300 drop-shadow-[0_0_15px_rgba(167,139,250,0.6)]">PATHWAY</span>
            </h2>
            <p className="font-rajdhani text-lg md:text-xl text-gray-400">
              The sequence of evolution.
            </p>
          </div>

          <div className="relative space-y-8 md:space-y-12">
            {/* Vertical Line - Ethereal Beam */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-200/30 to-transparent" />

            {[
              {
                stage: "01. Initialize",
                subtitle: "Stabilize awareness. Interrupt autopilot.",
                desc: "You begin by observing how your mind actually works.",
                details: [
                  "Where attention goes.",
                  "How reactions arise.",
                  "What runs automatically."
                ],
                conclusion: "This phase creates space. Without it, nothing changes.",
                icon: Zap,
                color: "text-cyan-200"
              },
              {
                stage: "02. Awakening",
                subtitle: "Recognize patterns as they happen.",
                desc: "You stop noticing patterns after the fact.",
                details: [
                  "You start noticing them in real time.",
                  "Thoughts, emotions, decisions become visible.",
                  "Choice becomes possible."
                ],
                conclusion: null,
                icon: Eye,
                color: "text-blue-300"
              },
              {
                stage: "03. Ascension",
                subtitle: "Act from clarity instead of habit.",
                desc: "Understanding becomes applied.",
                details: [
                  "You respond instead of reacting.",
                  "Decisions align with intention.",
                  "This is where daily life begins to shift:"
                ],
                shiftAreas: [
                  "relationships",
                  "work",
                  "direction",
                  "energy"
                ],
                conclusion: null,
                icon: TrendingUp,
                color: "text-violet-300"
              },
              {
                stage: "04. Mastery",
                subtitle: "Sustain coherence over time.",
                desc: "Awareness is no longer an effort.",
                details: [
                  "It becomes a stable mode of operation.",
                  "You don't need constant tools or guidance.",
                  "You operate with internal authority."
                ],
                conclusion: null,
                icon: Infinity,
                color: "text-white"
              }
            ].map((step, i) => (
              <div key={i} className={`relative flex items-start gap-4 md:gap-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}>
                {/* Desktop layout shift */}
                <div className="hidden md:block flex-1" />
                
                {/* Center Node */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#020202] border border-cyan-200/50 flex items-center justify-center z-10 shadow-[0_0_15px_rgba(165,243,252,0.3)] flex-shrink-0">
                  <div className={`w-1.5 h-1.5 rounded-full bg-current ${step.color}`} />
                </div>

                {/* Content Card */}
                <div className="flex-1 ml-14 md:ml-0 w-full">
                  <NeomorphicCard className={`group hover:bg-[rgba(165,243,252,0.03)] transition-colors flex flex-col ${i === 0 ? 'shadow-[0_25px_60px_rgba(0,0,0,0.6)]' : i === 1 ? 'shadow-[0_30px_65px_rgba(0,0,0,0.65)]' : i === 2 ? 'shadow-[0_35px_70px_rgba(0,0,0,0.7)]' : 'shadow-[0_40px_80px_rgba(0,0,0,0.75)]'}`} size="large" elevated={i >= 2}>
                    <div className="flex items-start justify-between mb-4 md:mb-6">
                      <h3 className={`text-lg md:text-xl font-bold font-rajdhani tracking-widest ${step.color} text-shadow-glow flex-1`}>{step.stage}</h3>
                      <step.icon className={`w-5 h-5 ${step.color} opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2`} />
                    </div>
                    <p className={`text-base md:text-lg font-semibold font-rajdhani mb-3 md:mb-4 ${step.color}`}>{step.subtitle}</p>
                    <p className="text-gray-300 font-rajdhani leading-relaxed text-sm md:text-base mb-3 md:mb-4">{step.desc}</p>
                    <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                      {step.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-400 font-rajdhani leading-relaxed text-sm md:text-base">{detail}</p>
                      ))}
                    </div>
                    {step.shiftAreas && (
                      <div className="mt-auto pt-3 md:pt-4 border-t border-white/10">
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                          {step.shiftAreas.map((area, idx) => (
                            <div key={idx} className="text-gray-300 font-rajdhani text-xs md:text-sm italic">
                              {area}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {step.conclusion && (
                      <p className="text-gray-300 font-rajdhani leading-relaxed text-sm md:text-base mt-auto pt-3 md:pt-4 border-t border-white/10 italic">
                        {step.conclusion}
                      </p>
                    )}
                  </NeomorphicCard>
                </div>
              </div>
            ))}
          </div>

          {/* Transition Line */}
          <div className="mt-20 text-center">
            <NeomorphicCard className="max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl font-rajdhani text-gray-300 leading-relaxed mb-2">
                This is not a quick fix.
              </p>
              <p className="text-xl md:text-2xl font-rajdhani text-cyan-200 font-semibold">
                It is a change in how you function.
              </p>
            </NeomorphicCard>
          </div>

          {/* Micro-CTA */}
          <div className="text-center mt-12">
            <Button asChild variant="ghost" className="btn-ethereal-text rounded-full px-8 py-4 text-base font-rajdhani">
              <Link to="/signup">
                → Enter the System
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* --- GENESIS PROTOCOL --- */}
      <section className="relative py-32 md:py-40 px-4">
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-cinzel text-white">
              GENESIS <span className="text-cyan-200 drop-shadow-[0_0_12px_rgba(165,243,252,0.5)]">PROTOCOL</span>
            </h2>
            <p className="text-lg md:text-xl font-rajdhani text-gray-400 mb-8">
              The core structure behind the system.
            </p>
          </div>

          {/* Intro Card */}
          <NeomorphicCard className="mb-16 max-w-3xl mx-auto" size="medium">
            <div className="text-center space-y-4">
              <p className="text-lg md:text-xl font-rajdhani text-gray-400">
                Not theory.
              </p>
              <p className="text-lg md:text-xl font-rajdhani text-gray-400">
                Not motivation.
              </p>
              <p className="text-xl md:text-2xl font-rajdhani text-cyan-200 font-semibold">
                A practical architecture for conscious change.
              </p>
            </div>
          </NeomorphicCard>

          {/* How the protocol works */}
          <div className="mb-20">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 font-cinzel text-white text-center">
              How the protocol works
            </h3>
            <NeomorphicCard className="max-w-3xl mx-auto" size="medium">
              <p className="text-lg md:text-xl font-rajdhani text-gray-300 mb-4">
                The system follows a simple principle:
              </p>
              <p className="text-xl md:text-2xl font-rajdhani text-cyan-200 font-semibold mb-6 italic">
                real change requires sequence, integration, and time.
              </p>
              <div className="space-y-3 pt-4 border-t border-white/10">
                <p className="text-base md:text-lg font-rajdhani text-gray-400">
                  Each phase prepares the next.
                </p>
                <p className="text-base md:text-lg font-rajdhani text-gray-400">
                  Skipping steps creates confusion, not growth.
                </p>
              </div>
            </NeomorphicCard>
          </div>

          {/* Phases - Timeline Layout */}
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical Timeline Line */}
            <div className="absolute left-8 md:left-12 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-200/20 via-cyan-200/40 to-transparent hidden md:block" />
            
            {/* Mobile Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-cyan-200/20 via-cyan-200/40 to-transparent md:hidden" />

            <div className="space-y-16 md:space-y-24">
              {[
                {
                  phaseNum: "I",
                  phase: "DECONDITIONING",
                  shortDesc: "Reduce noise. Restore signal.",
                  fullDesc: "You identify unconscious habits that distort perception.",
                  details: [
                    "Mental overload, emotional loops, automatic narratives."
                  ],
                  conclusion: "This phase is about seeing clearly, not fixing yourself.",
                  color: "text-cyan-200",
                  bgColor: "bg-cyan-200/10",
                  borderColor: "border-cyan-200/30",
                  dotColor: "bg-cyan-200"
                },
                {
                  phaseNum: "II",
                  phase: "REORIENTATION",
                  shortDesc: "Realign perception and intention.",
                  fullDesc: "Once noise is reduced, direction becomes visible.",
                  details: [
                    "You learn to orient attention deliberately.",
                    "Thoughts, emotions, and actions begin to align."
                  ],
                  conclusion: "This is where coherence starts.",
                  color: "text-blue-300",
                  bgColor: "bg-blue-300/10",
                  borderColor: "border-blue-300/30",
                  dotColor: "bg-blue-300"
                },
                {
                  phaseNum: "III",
                  phase: "INTEGRATION",
                  shortDesc: "Translate awareness into daily life.",
                  fullDesc: "Understanding becomes behavior.",
                  details: [
                    "Clarity is applied to work, relationships, and decisions."
                  ],
                  conclusion: "The system stops being something you \"use\". It becomes something you live.",
                  color: "text-violet-300",
                  bgColor: "bg-violet-300/10",
                  borderColor: "border-violet-300/30",
                  dotColor: "bg-violet-300"
                },
                {
                  phaseNum: "IV",
                  phase: "EXPANSION",
                  shortDesc: "Stabilize and extend capacity.",
                  fullDesc: "Growth is no longer accidental.",
                  details: [
                    "You maintain clarity under pressure and complexity."
                  ],
                  expansionNote: "This phase prepares you to:",
                  expansionItems: [
                    "handle more responsibility",
                    "sustain long-term direction",
                    "influence without force"
                  ],
                  color: "text-white",
                  bgColor: "bg-white/10",
                  borderColor: "border-white/30",
                  dotColor: "bg-white"
                }
              ].map((phase, i) => {
                const isExpanded = expandedPhases.has(i);
                const togglePhase = () => {
                  const newExpanded = new Set(expandedPhases);
                  if (isExpanded) {
                    newExpanded.delete(i);
                  } else {
                    newExpanded.add(i);
                  }
                  setExpandedPhases(newExpanded);
                };

                return (
                  <div key={i} className="relative flex gap-6 md:gap-8">
                    {/* Timeline Node */}
                    <div className="flex-shrink-0 relative z-10">
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${phase.bgColor} border-2 ${phase.borderColor} flex items-center justify-center shadow-[0_0_20px_rgba(165,243,252,0.2)]`}>
                        <div className={`text-3xl md:text-4xl font-bold font-cinzel ${phase.color}`}>
                          {phase.phaseNum}
                        </div>
                      </div>
                      {/* Glow dot */}
                      <div className={`absolute inset-0 ${phase.dotColor} rounded-full opacity-30 blur-md animate-pulse`} />
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 pt-2">
                      <NeomorphicCard 
                        className={`group transition-all duration-300 ${phase.borderColor} border ${i === 0 ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : i === 1 ? 'shadow-[0_25px_55px_rgba(0,0,0,0.55)]' : i === 2 ? 'shadow-[0_30px_65px_rgba(0,0,0,0.65)]' : 'shadow-[0_35px_75px_rgba(0,0,0,0.7)]'}`}
                        size="medium"
                        elevated={i >= 2}
                      >
                        {/* Always Visible Content */}
                        <div className="space-y-3">
                          <h3 className={`text-xl md:text-2xl font-bold font-rajdhani tracking-wide ${phase.color}`}>
                            {phase.phase}
                          </h3>
                          <p className={`text-base md:text-lg font-rajdhani ${phase.color} font-medium`}>
                            {phase.shortDesc}
                          </p>
                        </div>

                        {/* Expandable Content - Always visible on desktop, collapsible on mobile */}
                        <div className={`mt-6 pt-6 border-t border-white/10 space-y-4 transition-all duration-300 ${isExpanded ? 'block' : 'hidden md:block'}`}>
                            <p className="text-gray-300 font-rajdhani text-sm md:text-base leading-relaxed">
                              {phase.fullDesc}
                            </p>

                            {phase.details && phase.details.length > 0 && (
                              <div className="space-y-2">
                                {phase.details.map((detail, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <div className={`w-1 h-1 rounded-full ${phase.dotColor} mt-2 flex-shrink-0`} />
                                    <p className="text-gray-400 font-rajdhani text-sm leading-relaxed flex-1">
                                      {detail}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {phase.expansionNote && (
                              <div className="pt-4 border-t border-white/5">
                                <p className="text-gray-300 font-rajdhani text-sm mb-3 font-medium">
                                  {phase.expansionNote}
                                </p>
                                <div className="space-y-2">
                                  {phase.expansionItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <Check className={`w-4 h-4 ${phase.color} flex-shrink-0`} />
                                      <p className={`font-rajdhani text-sm ${phase.color}`}>
                                        {item}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {phase.conclusion && (
                              <div className={`pt-4 border-t ${phase.borderColor} mt-4`}>
                                <p className={`font-rajdhani text-sm leading-relaxed ${phase.color} italic`}>
                                  {phase.conclusion}
                                </p>
                              </div>
                            )}
                          </div>

                        {/* Mobile Expand/Collapse Button */}
                        <button
                          onClick={togglePhase}
                          className="md:hidden mt-4 flex items-center gap-2 text-gray-400 hover:text-cyan-200 transition-colors text-sm font-rajdhani w-full"
                        >
                          <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                          />
                        </button>
                      </NeomorphicCard>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Anchor Line */}
          <div className="mt-20 text-center">
            <NeomorphicCard className="max-w-3xl mx-auto" size="medium">
              <p className="text-xl md:text-2xl font-rajdhani text-gray-300 leading-relaxed">
                The protocol doesn't add layers.
              </p>
              <p className="text-xl md:text-2xl font-rajdhani text-cyan-200 font-semibold mt-2">
                It removes interference.
              </p>
            </NeomorphicCard>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Button asChild size="lg" className="btn-ethereal-primary rounded-full px-14 py-7 text-xl font-semibold shadow-[0_0_35px_rgba(165,243,252,0.35)] hover:shadow-[0_0_55px_rgba(165,243,252,0.55)] hover:scale-105 transition-all duration-300">
              <Link to="/signup">
                → Initialize Access
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* --- PRICING / ACCESS --- */}
      <section className="relative py-40 md:py-48 px-4 bg-black/30">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 font-cinzel text-white">
              SYSTEM <span className="text-cyan-200 drop-shadow-[0_0_15px_rgba(165,243,252,0.6)]">ACCESS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16 max-w-4xl mx-auto">
            {/* Free Tier */}
            <NeomorphicCard className="flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
              <div className="mb-8">
                <h3 className="text-2xl font-bold font-cinzel text-gray-300 mb-2">INITIATE</h3>
                <div className="text-5xl font-light font-rajdhani text-white">€0 <span className="text-lg font-normal text-gray-500">/ forever</span></div>
              </div>
              <ul className="space-y-5 mb-10 flex-1">
                {["Basic Neural Map", "Habit Tracker", "Public Forum"].map((f, i) => (
                  <li key={i} className="flex items-center gap-4 text-gray-400 font-rajdhani">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600" /> {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="ghost" className="w-full btn-ethereal-text py-7 rounded-full border border-white/10 hover:bg-white/5 text-lg font-semibold hover:scale-105 transition-all duration-300">
                  <Link to="/signup" className="w-full">
                  Start Free
                </Link>
              </Button>
            </NeomorphicCard>

            {/* Paid Tier */}
            <NeomorphicCard className="flex flex-col border-cyan-200/40 relative overflow-visible bg-[rgba(165,243,252,0.05)] shadow-[0_40px_90px_rgba(0,0,0,0.8),inset_0_0_120px_rgba(165,243,252,0.12)]" elevated>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-900/80 text-cyan-200 text-xs font-bold font-rajdhani tracking-[0.2em] rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(165,243,252,0.2)]">
                FULL ACCESS
              </div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold font-cinzel text-cyan-200 mb-2 text-shadow-glow">ARCHITECT</h3>
                <div className="text-5xl font-light font-rajdhani text-white">€55 <span className="text-lg font-normal text-gray-400">/ mo</span></div>
              </div>
              <ul className="space-y-5 mb-10 flex-1">
                {[
                  "Complete Course Library",
                  "Interactive 3D Stellar Map",
                  "XP & Leveling System",
                  "Priority Network Access",
                  "Certificates of Mastery"
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-4 text-white font-rajdhani">
                    <Sparkles className="w-4 h-4 text-cyan-200" /> {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full btn-ethereal-primary py-7 rounded-full text-xl font-semibold shadow-[0_0_30px_rgba(165,243,252,0.3)] hover:shadow-[0_0_50px_rgba(165,243,252,0.5)] hover:scale-105 transition-all duration-300">
                  <Link to="/signup" className="w-full">
                  Upgrade System
                </Link>
              </Button>
            </NeomorphicCard>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative border-t border-white/5 bg-black py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <img src={LogoBeacon} alt="HC Beacon" className="h-10 w-auto mb-4 object-contain opacity-80" />
              <p className="text-gray-500 font-rajdhani text-sm tracking-wide">System Version 2.4.0 // Neural Net Active</p>
            </div>
            <div className="flex gap-10 text-sm font-cinzel text-gray-400 tracking-wide">
              <Link to="/courses" className="hover:text-cyan-200 transition-colors">Data</Link>
              <Link to="/community" className="hover:text-cyan-200 transition-colors">Network</Link>
              <Link to="/terms" className="hover:text-cyan-200 transition-colors">Protocol</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default EnhancedLandingPage;