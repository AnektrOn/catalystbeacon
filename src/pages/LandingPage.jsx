import React from 'react';
import { Link } from 'react-router-dom';
import SpaceSlideshow3D from '../components/landing/SpaceSlideshow3D';
import { Button } from '../components/ui/button';
import { 
  Sparkles, 
  Users, 
  BookOpen, 
  Award, 
  Zap, 
  Target,
  Check,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  // Define slides with content
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
    <div className="relative w-full h-screen">
      <SpaceSlideshow3D slides={slides} />
    </div>
  );
};

export default LandingPage;

