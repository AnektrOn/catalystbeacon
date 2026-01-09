import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Keep your existing imports or use these lucide icons as replacements
import { Button } from '../components/ui/button';
import { 
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Unlock,
  Eye,
  Brain,
  Infinity,
  ChevronRight,
  Check,
  X,
  Users,
  Activity,
  Flame,
  Star,
  Trophy,
  Award,
  BookOpen,
  Heart,
  Cpu
} from 'lucide-react';

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
    small: 'p-6 rounded-[24px] min-h-[100px]',
    medium: 'p-8 rounded-[24px] min-h-[180px]', 
    large: 'p-10 rounded-[32px] min-h-[300px]',
    xl: 'p-12 rounded-[32px] min-h-[400px]'
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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Random glitch effect (Slower, more mystical)
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 8000);

    // Generate ETHEREAL particles (Pale Cyan/White/Soft Violet)
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1, // Smaller, star-like
      duration: Math.random() * 20 + 15, // Slower float
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1,
      color: i % 3 === 0 ? '#a5f3fc' : i % 3 === 1 ? '#ffffff' : '#a78bfa' // Pale Cyan, White, Violet
    }));
    setParticles(newParticles);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(glitchInterval);
    };
  }, []);

  // Global Styles for the Ethereal Theme
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Rajdhani:wght@300;400;500;600;700&display=swap');

    :root {
      --ethereal-cyan: #a5f3fc;   /* Pale Cyan */
      --ethereal-white: #ffffff;  /* White */
      --ethereal-violet: #a78bfa; /* Soft Violet */
      --bg-dark: #020202;
    }

    body {
      background-color: var(--bg-dark);
      font-family: 'Rajdhani', sans-serif;
      color: #e0e0e0;
    }

    .font-cinzel { font-family: 'Cinzel', serif; }
    .font-rajdhani { font-family: 'Rajdhani', sans-serif; }

    /* Animations from XPCircleWidget */
    @keyframes breathe-light {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.1); }
    }
    .animate-breathe-light { animation: breathe-light 8s ease-in-out infinite; }

    @keyframes float-particle {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      20% { opacity: 0.8; }
      80% { opacity: 0.8; }
      100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
    }
    .animate-float-particle { animation: float-particle 10s infinite linear; }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow { animation: spin-slow 60s linear infinite; }

    /* Soft Glitch Effect */
    .glitch { position: relative; }
    .glitch::before, .glitch::after {
      content: attr(data-text);
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: var(--bg-dark);
    }
    .glitch::before {
      left: 2px; text-shadow: -1px 0 #a5f3fc;
      clip: rect(24px, 550px, 90px, 0);
      animation: glitch-anim 0.3s infinite linear alternate-reverse;
    }
    .glitch::after {
      left: -2px; text-shadow: -1px 0 #a78bfa;
      clip: rect(85px, 550px, 140px, 0);
      animation: glitch-anim 0.3s infinite linear alternate-reverse;
    }
    @keyframes glitch-anim {
      0% { clip: rect(10px, 9999px, 30px, 0); }
      20% { clip: rect(80px, 9999px, 10px, 0); }
      40% { clip: rect(30px, 9999px, 80px, 0); }
      60% { clip: rect(60px, 9999px, 20px, 0); }
      100% { clip: rect(5px, 9999px, 80px, 0); }
    }

    /* Ethereal Buttons */
    .btn-ethereal-primary {
      background: rgba(165, 243, 252, 0.1);
      border: 1px solid rgba(165, 243, 252, 0.3);
      color: #a5f3fc;
      font-weight: 600;
      letter-spacing: 2px;
      backdrop-filter: blur(4px);
      transition: all 0.4s ease;
      box-shadow: 0 0 15px rgba(165, 243, 252, 0.1);
    }
    .btn-ethereal-primary:hover {
      background: rgba(165, 243, 252, 0.2);
      border-color: rgba(165, 243, 252, 0.6);
      box-shadow: 0 0 30px rgba(165, 243, 252, 0.25);
      transform: translateY(-2px);
      text-shadow: 0 0 10px rgba(165, 243, 252, 0.8);
      color: white;
    }

    .btn-ethereal-text {
      color: rgba(255, 255, 255, 0.6);
      letter-spacing: 1px;
      transition: all 0.3s;
    }
    .btn-ethereal-text:hover {
      color: #a5f3fc;
      text-shadow: 0 0 10px rgba(165, 243, 252, 0.5);
    }
  `;

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-hidden relative">
      <style>{globalStyles}</style>
      
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep Void */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#08080c] via-[#020202] to-[#000000]" />
        
        {/* Subtle Grid (Lower opacity for ethereal feel) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(165,243,252,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(165,243,252,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Floating Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              opacity: p.opacity,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`
            }}
          />
        ))}

        {/* Ambient Light Orbs (Soft Cyan/Violet) */}
        <div 
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15 animate-breathe-light"
          style={{ 
            background: 'radial-gradient(circle, #a5f3fc 0%, transparent 70%)',
            transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.05}px)` 
          }}
        />
        <div 
          className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-10 animate-breathe-light"
          style={{ 
            background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)',
            transform: `translate(${-scrollY * 0.05}px, ${-scrollY * 0.05}px)` 
          }}
        />
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020202]/60 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-cyan-200/10 rounded-full animate-pulse" />
                <Sparkles className="w-6 h-6 text-cyan-200 drop-shadow-[0_0_10px_rgba(165,243,252,0.8)]" />
              </div>
              <span className="text-xl font-bold font-rajdhani tracking-[0.2em] text-white">
                HC <span className="text-cyan-200 text-shadow-glow">UNIVERSITY</span>
              </span>
            </div>

            <div className="flex items-center gap-8">
              <Link to="/login" className="hidden md:block text-sm font-rajdhani tracking-widest text-gray-400 hover:text-cyan-200 transition-colors uppercase">
                Access
              </Link>
              <Link to="/signup">
                <Button className="btn-ethereal-primary rounded-full px-8 py-2 text-xs">
                  INITIALIZE
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        {/* Orbital Rings Background (Matches Widget) */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none"
        >
          <svg width="1000" height="1000" viewBox="0 0 1000 1000" className="animate-spin-slow">
            <circle cx="500" cy="500" r="400" fill="none" stroke="#a5f3fc" strokeWidth="0.5" />
            <circle cx="500" cy="500" r="400" fill="none" stroke="white" strokeWidth="1" strokeDasharray="1 30" />
            <circle cx="500" cy="500" r="300" fill="none" stroke="#a78bfa" strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="500" cy="500" r="200" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="mb-10 flex justify-center">
            <div className="px-6 py-2 border border-cyan-200/20 bg-cyan-900/5 backdrop-blur-md rounded-full text-cyan-100 text-xs font-cinzel font-semibold tracking-[0.3em] uppercase shadow-[0_0_30px_rgba(165,243,252,0.1)]">
              ✦ System Awakening Sequence ✦
            </div>
          </div>

          <h1 className={`text-6xl md:text-8xl font-bold mb-8 leading-tight font-rajdhani text-white ${glitchActive ? 'glitch' : ''}`} data-text="ASCEND">
            <span className="font-light text-5xl md:text-7xl block mb-2 text-gray-300">IGNITE YOUR</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-violet-300 filter drop-shadow-[0_0_20px_rgba(165,243,252,0.3)]">
              CONSCIOUSNESS
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light font-rajdhani tracking-wide leading-relaxed">
            Interface with the ultimate learning system. Override your limits. 
            <span className="text-cyan-200 drop-shadow-[0_0_8px_rgba(165,243,252,0.5)]"> Become the Architect.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-20">
            <Link to="/signup">
              <Button size="lg" className="btn-ethereal-primary rounded-full px-12 py-8 text-xl">
                BEGIN JOURNEY
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="ghost" className="btn-ethereal-text rounded-full px-8 py-8 text-lg font-rajdhani">
                Explore Archives
              </Button>
            </Link>
          </div>

          {/* Ethereal Stats (Revised for Genesis/Exclusivity Hook) */}
          <div className="flex flex-wrap justify-center gap-12 border-t border-white/5 pt-12">
            {[
              { label: "System Status", val: "ONLINE", icon: Activity },
              { label: "Genesis Cycle", val: "001", icon: Sparkles },
              { label: "Access Ports", val: "OPEN", icon: Unlock },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="flex items-center justify-center gap-2 mb-2 text-gray-500 group-hover:text-cyan-200 transition-colors">
                  <stat.icon size={14} />
                  <span className="text-xs font-cinzel tracking-[0.1em] uppercase">{stat.label}</span>
                </div>
                <div className="text-3xl font-light font-rajdhani text-white text-shadow-glow">
                  {stat.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- COMPARISON SECTION --- */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-cinzel text-white">
              CHOOSE YOUR <span className="text-cyan-200 drop-shadow-[0_0_10px_rgba(165,243,252,0.5)]">REALITY</span>
            </h2>
            <p className="font-rajdhani text-xl text-gray-400 uppercase tracking-widest">
              Unawakened vs. Enlightened
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Reactive (Negative - Darker/Redder) */}
            <NeomorphicCard className="bg-[rgba(20,10,10,0.4)] border-red-900/30">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-red-900/10 flex items-center justify-center border border-red-500/20">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-red-300/80 font-cinzel tracking-wider">Default State</h3>
              </div>
              <ul className="space-y-6 font-rajdhani text-lg text-gray-500">
                {[
                  "Operating on Autopilot",
                  "Limited Awareness",
                  "Reactive to Stimuli",
                  "Standardized Patterns"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-900" />
                    {item}
                  </li>
                ))}
              </ul>
            </NeomorphicCard>

            {/* Intentional (Positive - Ethereal) */}
            <NeomorphicCard className="bg-[rgba(165,243,252,0.03)] border-cyan-200/20" elevated>
              <div className="absolute top-0 right-0 p-6">
                <div className="w-2 h-2 rounded-full bg-cyan-200 shadow-[0_0_10px_#a5f3fc] animate-pulse" />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-cyan-200/10 flex items-center justify-center border border-cyan-200/30 shadow-[0_0_15px_rgba(165,243,252,0.15)]">
                  <Sparkles className="w-5 h-5 text-cyan-200" />
                </div>
                <h3 className="text-2xl font-bold text-cyan-100 font-cinzel tracking-wider">Architect State</h3>
              </div>
              <ul className="space-y-6 font-rajdhani text-lg text-gray-300">
                {[
                  "Conscious Execution",
                  "Expanded Bandwidth",
                  "Proactive Creation",
                  "Overridden Limits"
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

      {/* --- THE PROGRESSION (Timeline) --- */}
      <section className="relative py-32 px-4 bg-black/20">
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-cinzel text-white">
              ASCENSION <span className="text-violet-300 drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]">PATHWAY</span>
            </h2>
            <p className="font-rajdhani text-xl text-gray-400">
              The sequence of evolution.
            </p>
          </div>

          <div className="relative space-y-12">
            {/* Vertical Line - Ethereal Beam */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-200/30 to-transparent" />

            {[
              {
                stage: "01. INITIALIZE",
                desc: "Establish baseline metrics. Understand the source code.",
                icon: Zap,
                color: "text-cyan-200"
              },
              {
                stage: "02. AWAKENING",
                desc: "Energy awareness. Perception filters removed.",
                icon: Eye,
                color: "text-blue-300"
              },
              {
                stage: "03. ASCENSION",
                desc: "Quantum mechanics. Multidimensional thought.",
                icon: TrendingUp,
                color: "text-violet-300"
              },
              {
                stage: "04. MASTERY",
                desc: "Full integration. Architect status achieved.",
                icon: Infinity,
                color: "text-white"
              }
            ].map((step, i) => (
              <div key={i} className={`relative flex items-center gap-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}>
                {/* Desktop layout shift */}
                <div className="hidden md:block flex-1" />
                
                {/* Center Node */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#020202] border border-cyan-200/50 flex items-center justify-center z-10 shadow-[0_0_15px_rgba(165,243,252,0.3)]">
                  <div className={`w-1.5 h-1.5 rounded-full bg-current ${step.color}`} />
                </div>

                {/* Content Card */}
                <div className="flex-1 ml-12 md:ml-0">
                  <NeomorphicCard className="group hover:bg-[rgba(165,243,252,0.03)] transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className={`text-xl font-bold font-rajdhani tracking-widest ${step.color} text-shadow-glow`}>{step.stage}</h3>
                      <step.icon className={`w-5 h-5 ${step.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                    </div>
                    <p className="text-gray-400 font-rajdhani leading-relaxed text-lg">{step.desc}</p>
                  </NeomorphicCard>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- COMMUNITY (Revised for Genesis Hook) --- */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-cinzel text-white">
              GENESIS <span className="text-cyan-200 drop-shadow-[0_0_10px_rgba(165,243,252,0.5)]">PROTOCOL</span>
            </h2>
            <p className="font-rajdhani text-xl text-gray-400 max-w-3xl mx-auto">
              The network is initializing. Secure your position as a Founding Architect. Shape the future of human potential.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "System Boot", val: "Phase 1", icon: Cpu },
              { label: "Genesis Batch", val: "001", icon: Users },
              { label: "Access Level", val: "Priority", icon: Award },
              { label: "Potential", val: "Infinite", icon: Infinity },
            ].map((stat, i) => (
              <NeomorphicCard key={i} className="text-center py-10" interactive>
                <div className="flex justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-cyan-200 opacity-80" />
                </div>
                <div className="text-3xl font-light font-rajdhani text-white mb-2">{stat.val}</div>
                <div className="text-xs font-cinzel tracking-widest text-gray-500 uppercase">{stat.label}</div>
              </NeomorphicCard>
            ))}
          </div>
          
          <div className="text-center mt-12">
             <Link to="/signup">
                <Button size="lg" className="btn-ethereal-primary rounded-full px-12 py-6 text-lg">
                  INITIALIZE ACCESS
                </Button>
             </Link>
          </div>
        </div>
      </section>

      {/* --- PRICING / ACCESS --- */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-cinzel text-white">
              SYSTEM <span className="text-cyan-200">ACCESS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Free Tier */}
            <NeomorphicCard className="flex flex-col">
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
              <Link to="/signup" className="w-full">
                <Button variant="ghost" className="w-full btn-ethereal-text py-6 rounded-full border border-white/10 hover:bg-white/5">
                  START FREE
                </Button>
              </Link>
            </NeomorphicCard>

            {/* Paid Tier */}
            <NeomorphicCard className="flex flex-col border-cyan-200/30 relative overflow-visible bg-[rgba(165,243,252,0.03)]" elevated>
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
              <Link to="/signup" className="w-full">
                <Button className="w-full btn-ethereal-primary py-6 rounded-full text-lg">
                  UPGRADE SYSTEM
                </Button>
              </Link>
            </NeomorphicCard>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative border-t border-white/5 bg-black py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h4 className="text-2xl font-bold font-cinzel text-white mb-2">HC <span className="text-cyan-200">UNI</span></h4>
              <p className="text-gray-500 font-rajdhani text-sm tracking-wide">System Version 2.4.0 // Neural Net Active</p>
            </div>
            <div className="flex gap-10 text-sm font-rajdhani text-gray-400 tracking-[0.15em] uppercase">
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