import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SpaceSlideshow3D from '../components/landing/SpaceSlideshow3D';
import Interactive3DSection from '../components/landing/Interactive3DSection';
import { Button } from '../components/ui/button';
import { 
  Sparkles, 
  Users, 
  BookOpen, 
  Award, 
  Zap, 
  Target,
  Check,
  ArrowRight,
  ArrowDown,
  Rocket,
  Brain,
  Heart,
  Star,
  Trophy,
  Flame
} from 'lucide-react';

const EnhancedLandingPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrolled / maxScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Slideshow content (first section)
  const slides = [
    // Slide 0: Hero
    <div className="text-center space-y-6 px-4 max-w-4xl mx-auto">
      <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
        Transform Your
        <span className="block text-[#B4833D]">Human Potential</span>
      </h1>
      <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
        Join The Human Catalyst University and unlock your path to mastery through 
        our revolutionary learning system.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/signup">
          <Button 
            size="lg" 
            className="bg-[#B4833D] hover:bg-[#9a6f33] text-white px-8 py-6 text-lg
                       shadow-lg shadow-[#B4833D]/30 hover:shadow-[#B4833D]/50 transition-all"
          >
            Start Free Journey
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
        <Link to="/login">
          <Button 
            size="lg" 
            variant="outline"
            className="border-[#81754B] text-[#B4833D] hover:bg-[#81754B]/10 
                       px-8 py-6 text-lg backdrop-blur-sm bg-black/20"
          >
            Sign In
          </Button>
        </Link>
      </div>
      <div className="mt-12 animate-bounce">
        <ArrowDown className="w-8 h-8 text-[#B4833D] mx-auto" />
      </div>
    </div>,

    // Slide 1: Features
    <div className="text-center space-y-8 px-4 max-w-6xl mx-auto">
      <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
        Why Choose <span className="text-[#B4833D]">HC University</span>?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {[
          { icon: Sparkles, title: "Stellar Map Learning", desc: "Navigate your learning journey through an interactive 3D map" },
          { icon: Target, title: "XP & Level System", desc: "Gamified progress tracking with achievements and rewards" },
          { icon: BookOpen, title: "Expert Courses", desc: "Learn from world-class teachers and industry leaders" },
          { icon: Users, title: "Community", desc: "Connect with fellow catalysts and share your journey" },
          { icon: Award, title: "Certifications", desc: "Earn recognized credentials as you master new skills" },
          { icon: Zap, title: "Flexible Learning", desc: "Learn at your own pace, anytime, anywhere" },
        ].map((feature, index) => (
          <div
            key={index}
            className="p-6 rounded-xl bg-black/30 backdrop-blur-sm border border-[#81754B]/30
                       hover:border-[#B4833D] hover:bg-black/40 transition-all"
          >
            <feature.icon className="w-12 h-12 text-[#B4833D] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-300">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>,

    // Slide 2: Pricing
    <div className="text-center space-y-8 px-4 max-w-6xl mx-auto">
      <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
        Choose Your <span className="text-[#B4833D]">Path</span>
      </h2>
      <p className="text-xl text-gray-300 mb-12">
        Start free, upgrade when you're ready
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            name: "Free",
            price: "€0",
            period: "Forever",
            features: ["Access to basic courses", "Community access", "XP tracking", "Level progression"],
            cta: "Get Started",
            highlight: false,
          },
          {
            name: "Student",
            price: "€55",
            period: "per month",
            features: ["Everything in Free", "All premium courses", "Priority support", "Certificates", "Advanced features"],
            cta: "Start Learning",
            highlight: true,
          },
          {
            name: "Teacher",
            price: "€150",
            period: "per month",
            features: ["Everything in Student", "Create & sell courses", "Revenue sharing", "Teacher dashboard", "Marketing tools"],
            cta: "Become Teacher",
            highlight: false,
          },
        ].map((plan, index) => (
          <div
            key={index}
            className={`p-8 rounded-xl backdrop-blur-sm border transition-all ${
              plan.highlight
                ? "bg-gradient-to-br from-[#B4833D]/20 to-[#66371B]/20 border-[#B4833D] scale-105"
                : "bg-black/30 border-[#81754B]/30 hover:border-[#B4833D]"
            }`}
          >
            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-[#B4833D]">{plan.price}</span>
              <span className="text-gray-400 ml-2">{plan.period}</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start text-gray-300">
                  <Check className="w-5 h-5 text-[#B4833D] mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup">
              <Button
                className={`w-full ${
                  plan.highlight
                    ? "bg-[#B4833D] hover:bg-[#9a6f33] text-white"
                    : "bg-transparent border-[#81754B] text-[#B4833D] hover:bg-[#81754B]/10"
                }`}
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>,

    // Slide 3: CTA
    <div className="text-center space-y-8 px-4 max-w-4xl mx-auto">
      <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
        Ready to <span className="text-[#B4833D]">Transform</span>?
      </h2>
      <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
        Join thousands of catalysts already on their journey to mastery. 
        Start free, upgrade when you're ready.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/signup">
          <Button 
            size="lg" 
            className="bg-[#B4833D] hover:bg-[#9a6f33] text-white px-12 py-6 text-xl
                       shadow-lg shadow-[#B4833D]/30 hover:shadow-[#B4833D]/50 transition-all
                       animate-pulse"
          >
            Start Your Journey Now
            <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </Link>
      </div>
      <p className="text-gray-400 mt-8">
        No credit card required • Free forever plan available
      </p>
    </div>,
  ];

  return (
    <div className="relative w-full bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a]">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/50 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#B4833D] to-[#FFD700] transition-all duration-300"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Section 1: 3D Slideshow (Full screen) */}
      <section className="relative w-full h-screen">
        <SpaceSlideshow3D slides={slides} />
      </section>

      {/* Section 2: Our Mission with Blobs */}
      <Interactive3DSection type="blobs" className="min-h-screen py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              Our <span className="text-[#B4833D]">Mission</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              We believe that every human has untapped potential waiting to be unlocked. 
              The Human Catalyst University is designed to ignite that spark within you, 
              providing the tools, knowledge, and community you need to transform your life.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {[
                { icon: Rocket, title: "Launch", desc: "Start your transformational journey" },
                { icon: Brain, title: "Learn", desc: "Master skills that matter" },
                { icon: Heart, title: "Thrive", desc: "Become your best self" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-[#81754B]/30
                             hover:border-[#B4833D] hover:bg-black/50 transition-all group"
                >
                  <item.icon className="w-16 h-16 text-[#B4833D] mx-auto mb-4 
                                      group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300 text-lg">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Interactive3DSection>

      {/* Section 3: Learning Paths with Spiral */}
      <Interactive3DSection type="spiral" className="min-h-screen py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-white text-center mb-16">
              Explore <span className="text-[#B4833D]">Learning Paths</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "Personal Development",
                  icon: Star,
                  courses: ["Self-Mastery", "Mindset Training", "Emotional Intelligence"],
                  color: "#B4833D"
                },
                {
                  title: "Professional Skills",
                  icon: Trophy,
                  courses: ["Leadership", "Communication", "Strategic Thinking"],
                  color: "#81754B"
                },
                {
                  title: "Creative Arts",
                  icon: Sparkles,
                  courses: ["Design Thinking", "Content Creation", "Visual Arts"],
                  color: "#FFD700"
                },
                {
                  title: "Health & Wellness",
                  icon: Flame,
                  courses: ["Nutrition", "Fitness", "Mental Health"],
                  color: "#66371B"
                },
              ].map((path, index) => (
                <div
                  key={index}
                  className="p-8 rounded-2xl bg-black/50 backdrop-blur-lg border border-[#81754B]/30
                             hover:border-[#B4833D] transition-all group"
                  style={{ 
                    background: `linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(180,131,61,0.1) 100%)`
                  }}
                >
                  <path.icon className="w-12 h-12 text-[#B4833D] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold text-white mb-4">{path.title}</h3>
                  <ul className="space-y-2">
                    {path.courses.map((course, i) => (
                      <li key={i} className="flex items-center text-gray-300">
                        <Check className="w-5 h-5 text-[#B4833D] mr-2" />
                        {course}
                      </li>
                    ))}
                  </ul>
                  <Link to="/courses">
                    <Button
                      className="mt-6 w-full bg-transparent border-[#B4833D] text-[#B4833D] 
                                 hover:bg-[#B4833D] hover:text-white transition-all"
                    >
                      Explore Courses
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Interactive3DSection>

      {/* Section 4: Community with Rings */}
      <Interactive3DSection type="rings" className="min-h-screen py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              Join Our <span className="text-[#B4833D]">Community</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Connect with thousands of catalysts worldwide. Share your journey, 
              learn from others, and grow together.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {[
                { number: "10,000+", label: "Active Students" },
                { number: "500+", label: "Expert Teachers" },
                { number: "100+", label: "Courses" },
                { number: "50+", label: "Countries" },
              ].map((stat, index) => (
                <div key={index} className="p-6 rounded-xl bg-black/40 backdrop-blur-md border border-[#81754B]/30">
                  <div className="text-4xl font-bold text-[#B4833D] mb-2">{stat.number}</div>
                  <div className="text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>

            <Link to="/community">
              <Button
                size="lg"
                className="bg-[#B4833D] hover:bg-[#9a6f33] text-white px-12 py-6 text-xl
                           shadow-lg shadow-[#B4833D]/30 hover:shadow-[#B4833D]/50 transition-all"
              >
                Join the Community
                <Users className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </div>
      </Interactive3DSection>

      {/* Section 5: Final CTA with Mixed 3D */}
      <Interactive3DSection type="mixed" className="min-h-screen py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">
              Your Journey <span className="text-[#B4833D]">Starts Now</span>
            </h2>
            <p className="text-2xl md:text-3xl text-gray-300 mb-12 leading-relaxed">
              Don't wait for the perfect moment. The perfect moment is now.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link to="/signup">
                <Button 
                  size="lg" 
                  className="bg-[#B4833D] hover:bg-[#9a6f33] text-white px-16 py-8 text-2xl
                             shadow-2xl shadow-[#B4833D]/50 hover:shadow-[#B4833D]/70 transition-all
                             animate-pulse"
                >
                  Begin Your Transformation
                  <Rocket className="ml-3 w-8 h-8" />
                </Button>
              </Link>
            </div>

            <div className="text-gray-400 space-y-2">
              <p className="text-lg">✨ No credit card required</p>
              <p className="text-lg">🚀 Start learning immediately</p>
              <p className="text-lg">💫 Free forever plan available</p>
            </div>
          </div>
        </div>
      </Interactive3DSection>

      {/* Footer */}
      <footer className="relative bg-black/80 backdrop-blur-md border-t border-[#81754B]/30 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-[#B4833D] mb-4">HC University</h3>
              <p className="text-gray-400">Transforming human potential through education.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Learn</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/courses" className="hover:text-[#B4833D]">Courses</Link></li>
                <li><Link to="/stellar-map" className="hover:text-[#B4833D]">Stellar Map</Link></li>
                <li><Link to="/pricing" className="hover:text-[#B4833D]">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/community" className="hover:text-[#B4833D]">Forum</Link></li>
                <li><Link to="/achievements" className="hover:text-[#B4833D]">Achievements</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/terms" className="hover:text-[#B4833D]">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-[#B4833D]">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#81754B]/30 text-center text-gray-400">
            <p>&copy; 2024 Human Catalyst University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedLandingPage;

