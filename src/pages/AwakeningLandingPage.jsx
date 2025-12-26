import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Shield
} from 'lucide-react';

const AwakeningLandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Random glitch effect
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 100);
    }, 8000);

    // Generate ethereal particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.3
    }));
    setParticles(newParticles);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a2f35] text-white overflow-hidden relative">
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=Nanum+Gothic:wght@400;700;800&display=swap" rel="stylesheet" />
      
      {/* Mystical Teal Background with Texture */}
      <div className="fixed inset-0 z-0">
        {/* Base teal gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a3d44] via-[#0a2f35] to-[#051a1f]" />
        
        {/* Weathered texture overlay */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(180, 131, 61, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(205, 127, 50, 0.02) 0%, transparent 50%)
          `
        }} />
        
        {/* Subtle noise/grain texture */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }} />

        {/* Celestial Particles - stars and cosmic dust */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: particle.id % 3 === 0 
                ? 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, transparent 70%)'
                : particle.id % 3 === 1
                ? 'radial-gradient(circle, rgba(205,127,50,0.6) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(180,131,61,0.7) 0%, transparent 70%)',
              opacity: particle.opacity * 0.6 + 0.3,
              animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
              boxShadow: particle.id % 2 === 0 ? '0 0 8px rgba(255,215,0,0.4)' : '0 0 6px rgba(205,127,50,0.3)'
            }}
          />
        ))}

        {/* Mystical Glowing Orbs - Teal and Gold */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-slow"
          style={{ 
            background: 'radial-gradient(circle, rgba(64,224,208,0.15) 0%, transparent 70%)',
            transform: `translate(${scrollY * 0.2}px, ${scrollY * 0.3}px)` 
          }}
        />
        <div 
          className="absolute top-1/2 right-1/4 w-[32rem] h-[32rem] rounded-full blur-3xl animate-pulse-slower"
          style={{ 
            background: 'radial-gradient(circle, rgba(205,127,50,0.12) 0%, transparent 70%)',
            transform: `translate(${-scrollY * 0.15}px, ${scrollY * 0.25}px)` 
          }}
        />
        <div 
          className="absolute bottom-1/4 left-1/2 w-80 h-80 rounded-full blur-3xl animate-pulse-slow"
          style={{ 
            background: 'radial-gradient(circle, rgba(72,209,204,0.1) 0%, transparent 70%)',
            transform: `translate(${scrollY * 0.18}px, ${-scrollY * 0.2}px)` 
          }}
        />

        {/* Mystical Light Rays - Teal and Gold */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div 
            className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#FFD700] to-transparent"
            style={{ transform: `translateX(${scrollY * 0.1}px) rotate(15deg)`, filter: 'blur(1px)' }}
          />
          <div 
            className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-[#48D1CC] to-transparent"
            style={{ transform: `translateX(${-scrollY * 0.15}px) rotate(-10deg)`, filter: 'blur(1px)' }}
          />
          <div 
            className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#CD7F32] to-transparent"
            style={{ transform: `translateX(${scrollY * 0.05}px) rotate(-5deg)`, filter: 'blur(1px)' }}
          />
        </div>

        {/* Teal Aurora Effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-[#48D1CC]/10 via-transparent to-[#CD7F32]/10 animate-aurora"
        />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a2f35]/90 backdrop-blur-xl border-b border-[#48D1CC]/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#B4833D] via-[#FFD700] to-[#B4833D] rounded-full blur-sm animate-pulse" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-[#B4833D] to-[#FFD700] rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
                HC <span className="text-[#FFD700]">University</span>
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-[#B4833D] to-[#FFD700] hover:from-[#FFD700] hover:to-[#B4833D] text-white font-semibold rounded-full px-6 shadow-lg shadow-[#B4833D]/30">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - The Awakening */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
          {/* Central Radial Sunburst Pattern - Astrological Chart Style */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
          style={{ transform: `translate(-50%, -50%) translateY(${scrollY * 0.2}px) rotate(${scrollY * 0.05}deg)` }}
        >
          <svg width="1000" height="1000" viewBox="0 0 1000 1000" className="animate-spin-slow">
            {/* Outer ornate circle */}
            <circle cx="500" cy="500" r="450" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.6" strokeDasharray="5,5" />
            <circle cx="500" cy="500" r="400" fill="none" stroke="#48D1CC" strokeWidth="1" opacity="0.4" />
            <circle cx="500" cy="500" r="350" fill="none" stroke="#CD7F32" strokeWidth="1.5" opacity="0.5" strokeDasharray="10,10" />
            
            {/* Radial lines with circles - Sunburst */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360 / 24) * (Math.PI / 180);
              const x1 = 500 + Math.cos(angle) * 150;
              const y1 = 500 + Math.sin(angle) * 150;
              const x2 = 500 + Math.cos(angle) * 450;
              const y2 = 500 + Math.sin(angle) * 450;
              const cx = 500 + Math.cos(angle) * 450;
              const cy = 500 + Math.sin(angle) * 450;
              return (
                <g key={i} opacity={i % 2 === 0 ? "0.6" : "0.4"}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#48D1CC" : "#CD7F32"} strokeWidth={i % 2 === 0 ? "2" : "1"} />
                  <circle cx={cx} cy={cy} r={i % 2 === 0 ? "6" : "4"} fill="none" stroke={i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#48D1CC" : "#CD7F32"} strokeWidth="1.5" />
                </g>
              );
            })}
            
            {/* Inner decorative circles */}
            <circle cx="500" cy="500" r="100" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.5" />
            <circle cx="500" cy="500" r="80" fill="none" stroke="#48D1CC" strokeWidth="0.5" opacity="0.4" strokeDasharray="3,3" />
            
            {/* Center glow */}
            <circle cx="500" cy="500" r="60" fill="url(#centerGlow)" opacity="0.3" />
            <defs>
              <radialGradient id="centerGlow">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Floating Light Orbs - BIGGER AND BRIGHTER */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-[#FFD700] rounded-full shadow-lg shadow-[#FFD700]/70"
              style={{
                left: `${15 + i * 12}%`,
                top: `${30 + (i % 3) * 20}%`,
                opacity: 0.8,
                animation: `float-orb ${8 + i * 2}s ease-in-out ${i * 0.5}s infinite`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="mb-6">
            <div className="inline-block px-6 py-2 border-2 border-[#FFD700]/50 rounded-full backdrop-blur-2xl mb-8 relative overflow-hidden group shadow-xl" style={{
              background: 'rgba(10, 47, 53, 0.6)',
              boxShadow: '0 4px 24px rgba(255, 215, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
            }}>
              {/* Liquid shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
              <span className="text-[#FFD700] text-sm uppercase tracking-widest relative z-10" style={{ letterSpacing: '0.2em' }}>
                ✦ Reclaim Your Power ✦
              </span>
            </div>
          </div>

          <h1 className={`text-6xl md:text-8xl font-bold mb-8 leading-tight uppercase ${glitchActive ? 'glitch' : ''}`} style={{ fontFamily: "'Nanum Myeongjo', serif" }}>
            There's More
            <span className="block mt-4 bg-gradient-to-r from-[#B4833D] via-[#FFD700] to-[#B4833D] bg-clip-text text-transparent">
              To Life
            </span>
          </h1>

          <p className="text-xl md:text-3xl text-[#B0E0E6] mb-6 max-w-3xl mx-auto font-light">
            Beyond the routine. Beyond the ordinary. A path to your highest potential.
          </p>

          <p className="text-lg md:text-xl text-[#87CEEB]/70 mb-12 max-w-2xl mx-auto">
            From <span className="text-[#FFD700]">practical wisdom</span> to <span className="text-[#48D1CC]">transcendent truth</span>.
            From <span className="text-[#CD7F32]">awakening</span> to <span className="text-[#FFD700]">mastery</span>.
            A comprehensive journey through knowledge and consciousness.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-[#B4833D] to-[#FFD700] hover:from-[#FFD700] hover:to-[#B4833D] text-white font-semibold px-12 py-7 text-xl rounded-full relative overflow-hidden group shadow-2xl shadow-[#B4833D]/40">
                {/* Ethereal glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/0 via-white/20 to-[#FFD700]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative z-10" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>Start Your Journey</span>
                <ArrowRight className="ml-3 w-5 h-5 relative z-10" />
              </Button>
            </Link>
          </div>

          {/* Trust Indicators - Pure Glassmorphism */}
          <div className="inline-flex items-center gap-8 px-8 py-4 backdrop-blur-3xl rounded-full relative overflow-hidden group shadow-2xl" style={{
            background: 'rgba(10, 47, 53, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
          }}>
            {/* Liquid breathing glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#48D1CC]/10 via-[#FFD700]/10 to-[#CD7F32]/10 animate-pulse-slow" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
            <div className="flex items-center gap-2 relative z-10">
              <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse shadow-lg shadow-[#FFD700]/70" />
              <span className="text-sm text-[#B0E0E6]" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>10,000+ <span className="text-[#FFD700]">Students</span></span>
            </div>
            <div className="w-px h-6 bg-[#48D1CC]/40 relative z-10" />
            <span className="text-sm text-[#B0E0E6] relative z-10" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>100+ <span className="text-[#48D1CC]">Courses</span></span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-gray-600 uppercase tracking-wider">Discover</span>
          <div className="w-6 h-10 border-2 border-[#B4833D]/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#B4833D] rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* NPC vs Player Comparison */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              Two <span className="text-[#B4833D]">Paths</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Living on autopilot, or living with intention. The choice is yours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Reactive Path - Pure Glassmorphism */}
            <div className="p-10 rounded-[2rem] relative overflow-hidden backdrop-blur-3xl shadow-2xl" style={{
              background: 'rgba(15, 65, 72, 0.15)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
            }}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#48D1CC]/10 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-full backdrop-blur-xl flex items-center justify-center shadow-lg" style={{
                    background: 'rgba(10, 47, 53, 0.4)'
                  }}>
                    <X className="w-7 h-7 text-[#87CEEB]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#B0E0E6]" style={{ fontFamily: "'Nanum Myeongjo', serif" }}>Reactive Living</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Living by default patterns",
                    "Unaware of deeper potential",
                    "Influenced by external expectations",
                    "Operating on autopilot",
                    "Limited self-awareness",
                    "Unfulfilled existence"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 text-red-500/50 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Intentional Path - Premium Glassmorphism */}
            <div className="p-10 rounded-[2rem] relative overflow-hidden backdrop-blur-3xl group shadow-2xl" style={{
              background: 'rgba(180, 131, 61, 0.15)',
              boxShadow: '0 8px 32px 0 rgba(255, 215, 0, 0.25), 0 0 60px rgba(255, 215, 0, 0.15)'
            }}>
              {/* Liquid-like glowing orbs */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFD700]/20 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#B4833D]/15 rounded-full blur-2xl animate-pulse-slower" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-[#FFD700]/5 to-transparent" />
              {/* Shimmer on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#B4833D] to-[#FFD700] flex items-center justify-center shadow-xl shadow-[#FFD700]/40">
                    <Check className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#FFD700]" style={{ fontFamily: "'Nanum Myeongjo', serif" }}>Intentional Living</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Conscious choice in daily life",
                    "Understanding deeper principles",
                    "Expanded awareness",
                    "Self-directed growth",
                    "Personal sovereignty",
                    "Meaningful existence"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white">
                      <Check className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-xl text-[#B0E0E6] mb-6">
              Your journey begins with a single decision. Choose now.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-[#B4833D] to-[#FFD700] text-white font-semibold px-12 py-6 rounded-full shadow-xl shadow-[#B4833D]/30">
                Begin Your Path
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The Journey: Ignition to God Mode */}
      <section className="relative py-32 px-4">
        {/* Subtle overlay to differentiate section without blocking background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#B4833D]/5 to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              The <span className="text-[#B4833D]">Progression</span>
            </h2>
            <p className="text-xl text-[#B0E0E6] max-w-3xl mx-auto">
              A step-by-step journey through consciousness. No shortcuts. No bypasses. Only truth.
            </p>
            
            {/* Intricate Concentric Circle Diagram - Behind Timeline */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
              <svg width="800" height="1200" viewBox="0 0 800 1200" className="animate-spin-very-slow">
                {/* Multiple concentric circles with patterns */}
                {[
                  { r: 380, stroke: "#FFD700", width: 2, dash: "none", opacity: 0.6 },
                  { r: 350, stroke: "#48D1CC", width: 1, dash: "5,5", opacity: 0.5 },
                  { r: 320, stroke: "#CD7F32", width: 1.5, dash: "10,5", opacity: 0.5 },
                  { r: 290, stroke: "#FFD700", width: 1, dash: "3,3", opacity: 0.4 },
                  { r: 260, stroke: "#48D1CC", width: 2, dash: "none", opacity: 0.6 },
                  { r: 230, stroke: "#CD7F32", width: 1, dash: "8,4", opacity: 0.5 },
                  { r: 200, stroke: "#FFD700", width: 1.5, dash: "none", opacity: 0.7 }
                ].map((circle, i) => (
                  <circle 
                    key={i}
                    cx="400" 
                    cy="600" 
                    r={circle.r} 
                    fill="none" 
                    stroke={circle.stroke} 
                    strokeWidth={circle.width}
                    opacity={circle.opacity}
                    strokeDasharray={circle.dash}
                  />
                ))}
                
                {/* Detailed tick marks around circles */}
                {Array.from({ length: 72 }).map((_, i) => {
                  const angle = (i * 360 / 72) * (Math.PI / 180);
                  const r1 = 200;
                  const r2 = i % 4 === 0 ? 215 : 208;
                  const x1 = 400 + Math.cos(angle) * r1;
                  const y1 = 600 + Math.sin(angle) * r1;
                  const x2 = 400 + Math.cos(angle) * r2;
                  const y2 = 600 + Math.sin(angle) * r2;
                  return (
                    <line 
                      key={`tick-${i}`}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={i % 4 === 0 ? "#FFD700" : "#48D1CC"}
                      strokeWidth={i % 4 === 0 ? "2" : "1"}
                      opacity="0.5"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Journey Stages */}
          <div className="relative">
            {/* Connecting line - Multi-colored */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#FFD700]/30 via-[#48D1CC]/50 to-[#CD7F32]/30 hidden md:block shadow-lg shadow-[#48D1CC]/20" />

            <div className="space-y-16">
              {[
                {
                  stage: "FOUNDATION",
                  level: "Level 1-10",
                  icon: Zap,
                  color: "from-orange-500 to-red-500",
                  description: "Understanding the world around you. Building core knowledge.",
                  topics: ["Economics", "Psychology", "Social Dynamics"]
                },
                {
                  stage: "AWAKENING",
                  level: "Level 11-25",
                  icon: Eye,
                  color: "from-[#B4833D] to-orange-500",
                  description: "Seeing beyond the veil. Energy awareness begins.",
                  topics: ["Energy Fields", "Consciousness Studies", "Reality Structure"]
                },
                {
                  stage: "ASCENSION",
                  level: "Level 26-50",
                  icon: TrendingUp,
                  color: "from-[#FFD700] to-[#B4833D]",
                  description: "Quantum understanding. Multidimensional perception.",
                  topics: ["Quantum Mechanics", "Metaphysics", "Dimensional Theory"]
                },
                {
                  stage: "MASTERY",
                  level: "Level 51+",
                  icon: Infinity,
                  color: "from-[#FFD700] to-white",
                  description: "Complete integration. Living your highest potential.",
                  topics: ["Conscious Creation", "Advanced Integration", "Ultimate Understanding"]
                }
              ].map((stage, index) => (
                <div key={index} className="relative">
                  <div className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Stage card - Pure Glassmorphism */}
                    <div className="flex-1 p-10 rounded-[2rem] relative overflow-hidden backdrop-blur-3xl group shadow-2xl transition-all" style={{
                      background: 'rgba(15, 65, 72, 0.2)',
                      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
                    }}>
                      {/* Liquid-like glow on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#48D1CC]/0 via-[#FFD700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#CD7F32]/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-xl`} style={{
                          boxShadow: '0 4px 24px rgba(255, 215, 0, 0.3)'
                        }}>
                          <stage.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-[#FFD700]" style={{ fontFamily: "'Nanum Myeongjo', serif" }}>{stage.stage}</h3>
                          <p className="text-sm text-[#87CEEB]" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>{stage.level}</p>
                        </div>
                      </div>
                      <p className="text-[#B0E0E6] mb-4 relative z-10" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>{stage.description}</p>
                      <div className="flex flex-wrap gap-2 relative z-10">
                        {stage.topics.map((topic, i) => (
                          <span key={i} className="px-3 py-1 backdrop-blur-xl rounded-full text-xs text-[#87CEEB]" style={{
                            background: 'rgba(72, 209, 204, 0.15)',
                            fontFamily: "'Nanum Gothic', sans-serif"
                          }}>
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Center node with ethereal glow */}
                    <div className="hidden md:block relative">
                      <div className="absolute inset-0 w-6 h-6 rounded-full bg-[#48D1CC]/40 blur-md animate-pulse-slow" />
                      <div className={`relative w-6 h-6 rounded-full bg-gradient-to-br ${stage.color} border-4 border-[#0a2f35] shadow-lg shadow-[#FFD700]/50`} />
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className="hidden md:block flex-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <Link to="/stellar-map">
              <Button size="lg" variant="outline" className="border-[#B4833D] text-[#FFD700] hover:bg-[#B4833D]/10 px-12 py-6">
                Explore Stellar Map
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Knowledge Spectrum */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              The <span className="text-[#B4833D]">Spectrum</span>
            </h2>
            <p className="text-xl text-[#B0E0E6] max-w-3xl mx-auto">
              From material reality to multidimensional consciousness. Complete knowledge integration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                realm: "MATERIAL",
                icon: Target,
                topics: ["Economics", "Politics", "Systems", "Psychology", "Sociology"]
              },
              {
                realm: "ENERGETIC",
                icon: Brain,
                topics: ["Energy Fields", "Consciousness", "Frequency", "Vibration", "Perception"]
              },
              {
                realm: "QUANTUM",
                icon: Infinity,
                topics: ["Metaphysics", "Dimensions", "Timelines", "Manifestation", "Ultimate Truth"]
              }
            ].map((realm, index) => (
              <div key={index} className="p-10 rounded-[2rem] relative overflow-hidden backdrop-blur-2xl group shadow-2xl border-2 border-[#48D1CC]/30 hover:border-[#FFD700]/50 transition-all" style={{
                background: 'linear-gradient(135deg, rgba(15, 65, 72, 0.4) 0%, rgba(10, 47, 53, 0.5) 50%, rgba(26, 74, 82, 0.3) 100%)',
                boxShadow: '0 8px 32px 0 rgba(72, 209, 204, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
              }}>
                {/* Liquid glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#48D1CC]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#CD7F32]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="flex justify-center mb-6 relative z-10">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#B4833D] to-[#FFD700] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl" style={{
                    boxShadow: '0 4px 24px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)'
                  }}>
                    <realm.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center mb-6 text-[#FFD700] relative z-10" style={{ fontFamily: "'Nanum Myeongjo', serif" }}>{realm.realm}</h3>
                <ul className="space-y-3 relative z-10">
                  {realm.topics.map((topic, i) => (
                    <li key={i} className="text-center text-[#B0E0E6] py-2" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 rounded-[2rem] text-center backdrop-blur-3xl relative overflow-hidden shadow-2xl" style={{
            background: 'rgba(180, 131, 61, 0.15)',
            boxShadow: '0 8px 32px 0 rgba(255, 215, 0, 0.2)'
          }}>
            {/* Liquid breathing light effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#48D1CC]/10 via-transparent to-[#CD7F32]/10 animate-pulse-slow" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <p className="text-xl text-[#B0E0E6] relative z-10" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              <span className="text-[#FFD700] font-semibold" style={{ fontFamily: "'Nanum Myeongjo', serif" }}>Curated from the works</span> of the most renowned thinkers and teachers.
              Knowledge synthesized for your transformation.
            </p>
          </div>
        </div>
      </section>

      {/* Gamification Preview */}
      <section className="relative py-32 px-4">
        {/* Subtle overlay without blocking background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#B4833D]/5 to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              The <span className="text-[#B4833D]">System</span>
            </h2>
            <p className="text-xl text-[#B0E0E6] max-w-3xl mx-auto">
              Your evolution is tracked. Your progress is measured. Your ascension is gamified.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                feature: "XP & Levels",
                description: "Earn experience points for every lesson completed. Level up through 100 consciousness stages.",
                icon: TrendingUp
              },
              {
                feature: "Stellar Map",
                description: "Navigate your learning path through an interactive 3D universe. Each star is a lesson.",
                icon: Sparkles
              },
              {
                feature: "Power Tracking",
                description: "Measure your awakening progress. Track habits, streaks, and transformations.",
                icon: Zap
              }
            ].map((feature, index) => (
              <div key={index} className="p-8 rounded-[1.75rem] backdrop-blur-3xl relative overflow-hidden group shadow-2xl transition-all hover:shadow-[#FFD700]/30" style={{
                background: 'rgba(15, 65, 72, 0.2)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
              }}>
                {/* Liquid shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#48D1CC]/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B4833D] to-[#FFD700] flex items-center justify-center mb-4 relative z-10 shadow-xl" style={{
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)'
                }}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#FFD700] relative z-10" style={{ fontFamily: "'Nanum Myeongjo', serif" }}>{feature.feature}</h3>
                <p className="text-[#B0E0E6] relative z-10" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/Access Levels */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              Access <span className="text-[#B4833D]">Levels</span>
            </h2>
            <p className="text-xl text-[#B0E0E6] max-w-3xl mx-auto">
              Choose your level of commitment to the awakening.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "FREE",
                price: "€0",
                period: "forever",
                description: "Begin your journey",
                features: [
                  "Roadmap access",
                  "Mastery habits dashboard",
                  "Calendar & routine system",
                  "Personal toolbox",
                  "Community forum access"
                ],
                cta: "Start Free",
                highlight: false
              },
              {
                name: "STUDENT",
                price: "€55",
                period: "per month",
                description: "Full awakening access",
                features: [
                  "Everything in Free",
                  "All courses unlocked",
                  "Interactive Stellar Map",
                  "Full XP & leveling system",
                  "Advanced progress tracking",
                  "Priority support",
                  "Certificates & achievements"
                ],
                cta: "Awaken Now",
                highlight: true
              }
            ].map((tier, index) => (
              <div 
                key={index}
                className={`relative p-8 rounded-[2rem] backdrop-blur-3xl ${
                  tier.highlight ? 'scale-105' : ''
                }`}
                style={tier.highlight ? {
                  background: 'rgba(180, 131, 61, 0.2)',
                  boxShadow: '0 8px 32px 0 rgba(255, 215, 0, 0.3), 0 0 60px rgba(255, 215, 0, 0.2)'
                } : {
                  background: 'rgba(15, 65, 72, 0.15)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
                }}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1 bg-gradient-to-r from-[#B4833D] to-[#FFD700] rounded-full text-white text-sm font-bold shadow-xl" style={{
                    boxShadow: '0 4px 16px rgba(255, 215, 0, 0.5)',
                    fontFamily: "'Nanum Gothic', sans-serif"
                  }}>
                    RECOMMENDED
                  </div>
                )}
                
                <div className="text-center mb-8 relative z-10">
                  <h3 className="text-2xl font-bold mb-2 text-[#FFD700]" style={{ fontFamily: "'Nanum Myeongjo', serif" }}>{tier.name}</h3>
                  <p className="text-[#87CEEB] text-sm mb-4" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>{tier.description}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-[#FFD700]" style={{ fontFamily: "'Nanum Myeongjo', serif" }}>{tier.price}</span>
                  </div>
                  <div className="text-[#B0E0E6]" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>{tier.period}</div>
                </div>

                <ul className="space-y-4 mb-8 relative z-10">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#48D1CC] flex-shrink-0 mt-0.5" />
                      <span className="text-[#B0E0E6]" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/signup">
                  <Button 
                    className={`w-full rounded-full relative z-10 ${
                      tier.highlight
                        ? 'bg-gradient-to-r from-[#B4833D] to-[#FFD700] hover:from-[#FFD700] hover:to-[#B4833D] text-white font-bold shadow-lg shadow-[#FFD700]/30'
                        : 'backdrop-blur-xl text-[#FFD700] hover:shadow-[#48D1CC]/20'
                    }`}
                    size="lg"
                    style={{
                      fontFamily: "'Nanum Gothic', sans-serif",
                      background: tier.highlight ? undefined : 'rgba(15, 65, 72, 0.3)'
                    }}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Priority 1 */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              Common <span className="text-[#FFD700]">Questions</span>
            </h2>
            <p className="text-xl text-[#B0E0E6]" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              Everything you need to know before you begin.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "How is this different from other learning platforms?",
                a: "We don't just teach skills - we guide you through a complete transformation from surface-level understanding to multidimensional consciousness. Our courses are generated from the works of renowned authors, and our gamified stellar map system makes learning a journey, not a chore."
              },
              {
                q: "What if I'm a complete beginner?",
                a: "Perfect. We start at Foundation level, covering practical topics like economics and psychology. You'll build a solid base before progressing to energy awareness and quantum concepts. No prior knowledge needed."
              },
              {
                q: "How much time do I need to commit?",
                a: "It's self-paced. Some students complete a level in weeks, others take months. The platform tracks your progress, and you can learn as little as 20 minutes per day. Your stellar map shows exactly where you are and what's next."
              },
              {
                q: "Is this scientifically grounded or 'woo-woo'?",
                a: "We bridge both worlds. Foundation and Awakening stages cover established fields (economics, psychology, neuroscience). Ascension and Mastery explore consciousness and quantum mechanics through both scientific and philosophical lenses. We're rigorous, not mystical."
              },
              {
                q: "Can I really go from economics to metaphysics?",
                a: "Yes. That's the point. True understanding requires seeing the full spectrum - from how money works to how consciousness creates reality. We don't skip steps. Each level builds on the previous one."
              },
              {
                q: "What happens after I sign up?",
                a: "Free accounts get immediate access to your dashboard with habit tracking, calendar, and roadmap. Student accounts unlock the full stellar map and all courses. You'll start wherever you are and progress at your pace."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className="p-8 rounded-[2rem] backdrop-blur-3xl relative overflow-hidden shadow-xl"
                style={{
                  background: 'rgba(15, 65, 72, 0.2)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <h3 className="text-xl font-bold text-[#FFD700] mb-4 relative z-10" style={{ fontFamily: "'Nanum Myeongjo', serif" }}>
                  {faq.q}
                </h3>
                <p className="text-[#B0E0E6] relative z-10" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Priority 2 */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              How It <span className="text-[#FFD700]">Works</span>
            </h2>
            <p className="text-xl text-[#B0E0E6]" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              Your path from awakening to mastery, step by step.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Sign Up Free",
                description: "Create your account in 30 seconds. No credit card needed.",
                icon: Unlock
              },
              {
                step: "02",
                title: "Access Dashboard",
                description: "Free members get habit tracking, calendar, and routine system immediately.",
                icon: Target
              },
              {
                step: "03",
                title: "Upgrade & Explore",
                description: "Unlock all courses, your personal Stellar Map, and XP progression system.",
                icon: Sparkles
              },
              {
                step: "04",
                title: "Level Up",
                description: "Progress through 100 levels from Foundation to Mastery. Track every step.",
                icon: TrendingUp
              }
            ].map((step, index) => (
              <div 
                key={index}
                className="relative p-8 rounded-[2rem] backdrop-blur-3xl shadow-xl text-center group hover:shadow-[#FFD700]/20 transition-all"
                style={{
                  background: 'rgba(15, 65, 72, 0.2)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="text-6xl font-bold text-[#FFD700]/20 mb-4" style={{ fontFamily: "'Nanum Myeongjo', serif" }}>
                    {step.step}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B4833D] to-[#FFD700] flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform" style={{
                    boxShadow: '0 4px 24px rgba(255, 215, 0, 0.4)'
                  }}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Nanum Myeongjo', serif" }}>
                    {step.title}
                  </h3>
                  <p className="text-[#B0E0E6] text-sm" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Screenshots - Priority 5 */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              Your <span className="text-[#FFD700]">Dashboard</span>
            </h2>
            <p className="text-xl text-[#B0E0E6]" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              A glimpse into your transformation command center.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Stellar Map",
                description: "Navigate your learning journey through an interactive 3D universe. Each star represents a lesson in your path.",
                icon: Sparkles,
                color: "from-[#B4833D] to-[#FFD700]"
              },
              {
                title: "Progress Tracking",
                description: "Watch your XP grow, levels increase, and consciousness expand. Every lesson completed brings you closer to mastery.",
                icon: TrendingUp,
                color: "from-[#48D1CC] to-[#B4833D]"
              },
              {
                title: "Habit System",
                description: "Daily routines, streak tracking, and personalized toolbox. Build the foundation for lasting transformation.",
                icon: Target,
                color: "from-[#CD7F32] to-[#FFD700]"
              },
              {
                title: "Community",
                description: "Connect with fellow journeyers. Share insights, ask questions, and grow together in a supportive environment.",
                icon: Users,
                color: "from-[#FFD700] to-[#48D1CC]"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-8 rounded-[2rem] backdrop-blur-3xl relative overflow-hidden shadow-xl group"
                style={{
                  background: 'rgba(15, 65, 72, 0.2)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Screenshot placeholder */}
                <div className="relative z-10 mb-6 h-48 rounded-2xl backdrop-blur-xl overflow-hidden" style={{
                  background: 'rgba(180, 131, 61, 0.15)'
                }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <feature.icon className="w-16 h-16 text-[#FFD700]/30" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-[#FFD700] mb-3 relative z-10" style={{ fontFamily: "'Nanum Myeongjo', serif" }}>
                  {feature.title}
                </h3>
                <p className="text-[#B0E0E6] relative z-10" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stellar Map Preview - Priority 4 */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              Your <span className="text-[#FFD700]">Stellar Map</span>
            </h2>
            <p className="text-xl text-[#B0E0E6] max-w-3xl mx-auto" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              Every lesson is a star. Every course is a constellation. Your journey through knowledge visualized.
            </p>
          </div>

          {/* Stellar Map Visual Representation */}
          <div className="relative p-12 rounded-[2rem] backdrop-blur-3xl shadow-2xl overflow-hidden" style={{
            background: 'rgba(10, 47, 53, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
            minHeight: '500px'
          }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            
            {/* Constellation visualization */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <svg width="100%" height="100%" viewBox="0 0 800 500">
                {/* Connecting lines */}
                <line x1="100" y1="100" x2="200" y2="150" stroke="#48D1CC" strokeWidth="1" opacity="0.5" strokeDasharray="5,5" />
                <line x1="200" y1="150" x2="300" y2="120" stroke="#FFD700" strokeWidth="1" opacity="0.5" strokeDasharray="5,5" />
                <line x1="300" y1="120" x2="400" y2="180" stroke="#CD7F32" strokeWidth="1" opacity="0.5" strokeDasharray="5,5" />
                <line x1="400" y1="180" x2="500" y2="140" stroke="#FFD700" strokeWidth="1" opacity="0.5" strokeDasharray="5,5" />
                <line x1="500" y1="140" x2="600" y2="200" stroke="#48D1CC" strokeWidth="1" opacity="0.5" strokeDasharray="5,5" />
                
                {/* Stars (lessons) */}
                {[
                  { x: 100, y: 100, size: 8, color: "#FFD700", completed: true },
                  { x: 200, y: 150, size: 8, color: "#FFD700", completed: true },
                  { x: 300, y: 120, size: 8, color: "#48D1CC", completed: false },
                  { x: 400, y: 180, size: 10, color: "#FFD700", completed: false },
                  { x: 500, y: 140, size: 8, color: "#CD7F32", completed: false },
                  { x: 600, y: 200, size: 8, color: "#48D1CC", completed: false },
                  { x: 150, y: 300, size: 6, color: "#FFD700", completed: true },
                  { x: 350, y: 350, size: 6, color: "#48D1CC", completed: false },
                  { x: 550, y: 320, size: 6, color: "#CD7F32", completed: false }
                ].map((star, i) => (
                  <g key={i}>
                    <circle 
                      cx={star.x} 
                      cy={star.y} 
                      r={star.size} 
                      fill={star.color}
                      opacity={star.completed ? "0.9" : "0.5"}
                    >
                      <animate 
                        attributeName="opacity" 
                        values={star.completed ? "0.9;0.9" : "0.3;0.7;0.3"} 
                        dur="3s" 
                        repeatCount="indefinite" 
                      />
                    </circle>
                    {star.completed && (
                      <circle 
                        cx={star.x} 
                        cy={star.y} 
                        r={star.size + 4} 
                        fill="none" 
                        stroke={star.color}
                        strokeWidth="2"
                        opacity="0.4"
                      />
                    )}
                  </g>
                ))}
              </svg>
            </div>

            <div className="relative z-10 text-center">
              <div className="inline-block px-6 py-2 rounded-full backdrop-blur-3xl mb-6" style={{
                background: 'rgba(10, 47, 53, 0.4)'
              }}>
                <span className="text-[#FFD700] text-sm uppercase tracking-widest" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
                  ✦ Interactive 3D Navigation ✦
                </span>
              </div>
              <p className="text-xl text-[#B0E0E6] max-w-2xl mx-auto" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
                Each completed lesson lights up like a star. Watch your constellation grow as you progress through consciousness levels.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/stellar-map">
              <Button size="lg" className="backdrop-blur-xl rounded-full px-12 py-6 text-white hover:shadow-[#FFD700]/30 transition-all" style={{
                background: 'rgba(180, 131, 61, 0.3)',
                fontFamily: "'Nanum Gothic', sans-serif"
              }}>
                Preview Stellar Map
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Course Preview - Priority 3 */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              Featured <span className="text-[#FFD700]">Courses</span>
            </h2>
            <p className="text-xl text-[#B0E0E6]" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              From the classics to cutting-edge consciousness studies.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                level: "FOUNDATION",
                title: "Economics & Power",
                author: "Classical Economics Masters",
                lessons: 12,
                color: "from-orange-500 to-red-500"
              },
              {
                level: "AWAKENING",
                title: "Energy & Consciousness",
                author: "Consciousness Researchers",
                lessons: 18,
                color: "from-[#B4833D] to-orange-500"
              },
              {
                level: "ASCENSION",
                title: "Quantum Reality",
                author: "Quantum Physicists & Philosophers",
                lessons: 24,
                color: "from-[#FFD700] to-[#B4833D]"
              }
            ].map((course, index) => (
              <div 
                key={index}
                className="p-8 rounded-[2rem] backdrop-blur-3xl relative overflow-hidden shadow-xl group hover:shadow-[#FFD700]/20 transition-all"
                style={{
                  background: 'rgba(15, 65, 72, 0.2)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="inline-block px-4 py-1 rounded-full backdrop-blur-xl mb-4" style={{
                    background: 'rgba(10, 47, 53, 0.4)'
                  }}>
                    <span className="text-xs text-[#48D1CC] uppercase tracking-wider" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
                      {course.level}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-[#FFD700] mb-3" style={{ fontFamily: "'Nanum Myeongjo', serif" }}>
                    {course.title}
                  </h3>
                  
                  <p className="text-sm text-[#87CEEB] mb-4" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
                    Based on works by {course.author}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-[#B0E0E6]" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
                    <span>{course.lessons} Lessons</span>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${course.color} opacity-60`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/courses">
              <Button size="lg" className="backdrop-blur-xl rounded-full px-12 py-6 text-white hover:shadow-[#FFD700]/30 transition-all" style={{
                background: 'rgba(180, 131, 61, 0.3)',
                fontFamily: "'Nanum Gothic', sans-serif"
              }}>
                Browse All Courses
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA - Urgency */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative rounded-[2rem] overflow-hidden backdrop-blur-3xl shadow-2xl" style={{
            background: 'rgba(180, 131, 61, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(255, 215, 0, 0.3), 0 0 60px rgba(255, 215, 0, 0.2)'
          }}>
            {/* Liquid background layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#48D1CC]/10 to-transparent animate-aurora" />
            {/* Floating orbs in CTA */}
            <div className="absolute top-8 right-8 w-20 h-20 bg-[#CD7F32]/20 rounded-full blur-2xl animate-pulse-slow" />
            <div className="absolute bottom-8 left-8 w-16 h-16 bg-[#48D1CC]/15 rounded-full blur-2xl animate-pulse-slower" />
            
            <div className="relative p-16 text-center">
              <div className="mb-8">
                <div className="inline-block px-6 py-2 rounded-full backdrop-blur-3xl mb-8 shadow-xl relative overflow-hidden" style={{
                  background: 'rgba(10, 47, 53, 0.4)',
                  boxShadow: '0 4px 24px rgba(255, 215, 0, 0.2)'
                }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
                  <span className="text-[#FFD700] text-sm uppercase tracking-widest relative z-10" style={{ letterSpacing: '0.2em', fontFamily: "'Nanum Gothic', sans-serif" }}>
                    ✦ Your Moment of Decision ✦
                  </span>
                </div>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold mb-6 relative z-10" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
                The Beginning
                <span className="block text-[#FFD700]">Doesn't Wait</span>
              </h2>
              
              <p className="text-xl text-[#B0E0E6] mb-12 max-w-2xl mx-auto relative z-10" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
                Every moment is an opportunity to choose growth over stagnation, awareness over autopilot.
                The path to transformation is available. Will you take it?
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-[#B4833D] to-[#FFD700] hover:from-[#FFD700] hover:to-[#B4833D] text-black font-bold px-16 py-8 text-2xl">
                    Wake Up Now
                    <ArrowRight className="ml-3 w-7 h-7" />
                  </Button>
                </Link>
              </div>

              <p className="text-[#87CEEB] mt-8 text-sm">
                ✦ No credit card required • ✦ Start immediately • ✦ Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4">
        {/* Glassmorphism overlay for footer */}
        <div className="absolute inset-0 backdrop-blur-2xl pointer-events-none" style={{
          background: 'rgba(10, 47, 53, 0.6)'
        }} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#B4833D] to-[#FFD700] rounded-full blur-sm animate-pulse" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-[#B4833D] to-[#FFD700] rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-xl font-bold" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>HC University</span>
              </div>
              <p className="text-[#87CEEB] text-sm" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
                Awakening consciousness through knowledge.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#FFD700]" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>Journey</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/courses" className="text-[#B0E0E6] hover:text-[#FFD700] transition-colors" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>Courses</Link></li>
                <li><Link to="/stellar-map" className="text-[#B0E0E6] hover:text-[#FFD700] transition-colors" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>Stellar Map</Link></li>
                <li><Link to="/mastery" className="text-[#B0E0E6] hover:text-[#FFD700] transition-colors" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>Mastery Tools</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#FFD700]" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>Community</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/community" className="text-[#B0E0E6] hover:text-[#FFD700] transition-colors" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>Forum</Link></li>
                <li><Link to="/achievements" className="text-[#B0E0E6] hover:text-[#FFD700] transition-colors" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>Achievements</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#FFD700]" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="text-[#B0E0E6] hover:text-[#FFD700] transition-colors" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>Terms</Link></li>
                <li><Link to="/privacy" className="text-[#B0E0E6] hover:text-[#FFD700] transition-colors" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#48D1CC]/20 pt-8 text-center">
            <p className="text-[#87CEEB] text-sm">
              © 2024 Human Catalyst University. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Ethereal Animations CSS */}
      <style>{`
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .glitch {
          animation: glitch 0.3s ease-in-out;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-15px) translateX(5px); }
        }

        @keyframes float-orb {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.8; }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes pulse-slower {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }

        @keyframes ping-slower {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }

        @keyframes aurora {
          0%, 100% { opacity: 0.3; transform: translateX(0%) translateY(0%); }
          25% { opacity: 0.5; transform: translateX(10%) translateY(-5%); }
          50% { opacity: 0.4; transform: translateX(-5%) translateY(5%); }
          75% { opacity: 0.6; transform: translateX(5%) translateY(-10%); }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-ping-slower {
          animation: ping-slower 4s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-aurora {
          animation: aurora 15s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin 60s linear infinite;
        }

        .animate-spin-very-slow {
          animation: spin 120s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* True Glassmorphism - No borders needed */
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
};

export default AwakeningLandingPage;

