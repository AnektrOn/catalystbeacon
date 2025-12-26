import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  ArrowRight,
  Check,
  Star,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Sparkles,
  Globe,
  Shield,
  Zap,
  Target,
  ChevronRight,
  Play,
  Quote
} from 'lucide-react';

const ProfessionalLandingPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#B4833D] to-[#FFD700] rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">HC University</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#courses" className="text-gray-300 hover:text-white transition-colors">Courses</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Reviews</a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-[#B4833D] hover:bg-[#9a6f33] text-white">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Subtle gradient orb */}
        <div 
          className="absolute top-0 right-0 w-96 h-96 bg-[#B4833D]/20 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Social Proof Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#B4833D]/10 border border-[#B4833D]/30">
              <Star className="w-4 h-4 text-[#FFD700] fill-current mr-2" />
              <span className="text-sm">Rated 4.9/5 by 10,000+ students</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 leading-tight">
            Transform Your Life Through
            <span className="block bg-gradient-to-r from-[#B4833D] to-[#FFD700] bg-clip-text text-transparent">
              Mastery & Education
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-400 text-center max-w-3xl mx-auto mb-12">
            Join the world's most advanced learning platform. Get access to expert-led courses, 
            personalized learning paths, and a community of 10,000+ ambitious learners.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/signup">
              <Button size="lg" className="bg-[#B4833D] hover:bg-[#9a6f33] text-white px-8 py-6 text-lg shadow-lg shadow-[#B4833D]/30">
                Start Learning Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-700 text-white hover:bg-gray-800 px-8 py-6 text-lg"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#B4833D] mb-1">10,000+</div>
              <div className="text-gray-400 text-sm">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#B4833D] mb-1">500+</div>
              <div className="text-gray-400 text-sm">Expert Teachers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#B4833D] mb-1">100+</div>
              <div className="text-gray-400 text-sm">Premium Courses</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#B4833D] mb-1">50+</div>
              <div className="text-gray-400 text-sm">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to <span className="text-[#B4833D]">Succeed</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with proven learning methods 
              to accelerate your growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Expert-Led Courses",
                description: "Learn from world-class instructors with real-world experience in their fields."
              },
              {
                icon: Target,
                title: "Personalized Learning",
                description: "AI-powered recommendations adapt to your learning style and goals."
              },
              {
                icon: Users,
                title: "Global Community",
                description: "Connect with thousands of learners and mentors worldwide."
              },
              {
                icon: Award,
                title: "Certifications",
                description: "Earn recognized credentials that boost your career prospects."
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description: "Gamified XP system keeps you motivated and on track."
              },
              {
                icon: Zap,
                title: "Learn Anywhere",
                description: "Access content on any device, online or offline."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 
                           border border-gray-800 hover:border-[#B4833D]/50 transition-all duration-300
                           hover:shadow-xl hover:shadow-[#B4833D]/10"
              >
                <div className="w-12 h-12 rounded-xl bg-[#B4833D]/10 flex items-center justify-center mb-4
                                group-hover:bg-[#B4833D]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#B4833D]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Preview Section */}
      <section id="courses" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Explore <span className="text-[#B4833D]">Popular Courses</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From personal development to professional skills, find courses that match your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Self-Mastery Foundations",
                category: "Personal Development",
                students: "5,234",
                rating: "4.9",
                price: "Free"
              },
              {
                title: "Advanced Leadership",
                category: "Professional Skills",
                students: "3,456",
                rating: "4.8",
                price: "€55/mo"
              },
              {
                title: "Creative Thinking",
                category: "Innovation",
                students: "2,890",
                rating: "4.9",
                price: "€55/mo"
              }
            ].map((course, index) => (
              <div 
                key={index}
                className="group rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 
                           border border-gray-800 hover:border-[#B4833D]/50 transition-all duration-300
                           overflow-hidden hover:shadow-xl hover:shadow-[#B4833D]/10"
              >
                <div className="h-48 bg-gradient-to-br from-[#B4833D]/20 to-[#FFD700]/10 
                                flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-[#B4833D]" />
                </div>
                <div className="p-6">
                  <div className="text-sm text-[#B4833D] mb-2">{course.category}</div>
                  <h3 className="text-xl font-semibold mb-3">{course.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.students} students
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-[#FFD700] fill-current" />
                      {course.rating}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#B4833D]">{course.price}</span>
                    <Button className="bg-[#B4833D]/10 hover:bg-[#B4833D]/20 text-[#B4833D]">
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/courses">
              <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800">
                Browse All Courses
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-gray-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by <span className="text-[#B4833D]">Thousands</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See what our students are saying about their transformation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Product Manager",
                content: "HC University completely transformed my career. The courses are practical, engaging, and led by real experts. I got promoted within 6 months!",
                avatar: "SJ"
              },
              {
                name: "Michael Chen",
                role: "Entrepreneur",
                content: "The community here is incredible. I've met lifelong friends and business partners. The platform itself is intuitive and beautiful.",
                avatar: "MC"
              },
              {
                name: "Emma Williams",
                role: "Designer",
                content: "Best investment I've made in myself. The gamification keeps me motivated, and the content is top-notch. Highly recommend!",
                avatar: "EW"
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 
                           border border-gray-800 relative"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-[#B4833D]/20" />
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#FFD700] fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6">{testimonial.content}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-[#B4833D]/20 flex items-center justify-center text-[#B4833D] font-bold mr-3">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, <span className="text-[#B4833D]">Transparent Pricing</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "€0",
                period: "forever",
                description: "Perfect for getting started",
                features: [
                  "Access to basic courses",
                  "Community forum access",
                  "XP tracking",
                  "Level progression",
                  "Basic certifications"
                ],
                cta: "Get Started",
                popular: false
              },
              {
                name: "Student",
                price: "€55",
                period: "per month",
                description: "For serious learners",
                features: [
                  "Everything in Free",
                  "All premium courses",
                  "Priority support",
                  "Advanced certifications",
                  "1-on-1 mentorship",
                  "Offline access",
                  "Career guidance"
                ],
                cta: "Start Learning",
                popular: true
              },
              {
                name: "Teacher",
                price: "€150",
                period: "per month",
                description: "Share your expertise",
                features: [
                  "Everything in Student",
                  "Create & sell courses",
                  "Revenue sharing (70%)",
                  "Teacher dashboard",
                  "Marketing tools",
                  "Analytics & insights",
                  "Dedicated support"
                ],
                cta: "Become a Teacher",
                popular: false
              }
            ].map((plan, index) => (
              <div 
                key={index}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-[#B4833D]/20 to-[#FFD700]/10 border-2 border-[#B4833D] shadow-2xl shadow-[#B4833D]/20 scale-105'
                    : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#B4833D] rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-[#B4833D]">{plan.price}</span>
                  </div>
                  <div className="text-gray-400">{plan.period}</div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-[#B4833D] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/signup">
                  <Button 
                    className={`w-full ${
                      plan.popular
                        ? 'bg-[#B4833D] hover:bg-[#9a6f33] text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-br from-[#B4833D]/20 to-[#FFD700]/10 
                          border border-[#B4833D]/30 p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your <span className="text-[#B4833D]">Transformation</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join 10,000+ students who are already transforming their lives. 
              Start learning today with our free plan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-[#B4833D] hover:bg-[#9a6f33] text-white px-12 py-6 text-xl">
                  Get Started Free
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800 px-12 py-6 text-xl">
                  Browse Courses
                </Button>
              </Link>
            </div>
            <p className="text-gray-400 mt-6 text-sm">
              ✨ No credit card required • 🚀 Start learning instantly • 💫 Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#B4833D] to-[#FFD700] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">HC University</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transforming lives through world-class education.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/courses" className="text-gray-400 hover:text-white transition-colors">Courses</Link></li>
                <li><Link to="/stellar-map" className="text-gray-400 hover:text-white transition-colors">Learning Path</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><Link to="/community" className="text-gray-400 hover:text-white transition-colors">Community</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 HC University. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Secure & Trusted</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfessionalLandingPage;

