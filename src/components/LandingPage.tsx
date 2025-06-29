import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Star, 
  Shield, 
  Zap, 
  Brain, 
  Globe, 
  Phone, 
  Mail,
  ChevronDown,
  Play,
  Award,
  TrendingUp,
  Smartphone,
  Monitor,
  MessageSquare
} from 'lucide-react';
import { BoltBadge } from './BoltBadge';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Show sticky CTA after scrolling
    const handleScroll = () => {
      setShowCTA(window.scrollY > 800);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContactSales = () => {
    window.location.href = 'mailto:anbiabi@yahoo.fr?subject=SlotEase Sales Inquiry&body=Hello, I am interested in learning more about SlotEase for my organization. Please contact me to discuss pricing and implementation.';
  };

  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI-powered appointment scheduling that eliminates conflicts and optimizes your calendar automatically.",
      demo: "Real-time availability checking across all services"
    },
    {
      icon: Users,
      title: "Queue Management",
      description: "Intelligent queue management with real-time updates and estimated wait times for better customer experience.",
      demo: "Live queue monitoring with position tracking"
    },
    {
      icon: Brain,
      title: "AI Optimization",
      description: "Machine learning algorithms that predict demand patterns and suggest optimal scheduling strategies.",
      demo: "Predictive analytics for peak hour management"
    },
    {
      icon: Globe,
      title: "Universal Access",
      description: "Multi-channel booking through web, mobile, phone, and SMS for maximum accessibility.",
      demo: "One platform, multiple access points"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Medical Director, City General Hospital",
      content: "SlotEase reduced our no-show rate by 35% and improved patient satisfaction scores significantly. The AI recommendations are incredibly accurate.",
      rating: 5,
      avatar: "👩‍⚕️"
    },
    {
      name: "Michael Rodriguez",
      role: "Operations Manager, First National Bank",
      content: "We've cut waiting times in half and our staff can focus on customers instead of managing appointments. The ROI was immediate.",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Jennifer Park",
      role: "Director, Immigration Services",
      content: "The multilingual support and accessibility features have made our services available to everyone in our community. Game-changing platform.",
      rating: 5,
      avatar: "👩‍💻"
    }
  ];

  const stats = [
    { number: "50%", label: "Reduction in Wait Times" },
    { number: "35%", label: "Fewer No-Shows" },
    { number: "90%", label: "Customer Satisfaction" },
    { number: "24/7", label: "Availability" }
  ];

  const faqs = [
    {
      question: "How quickly can we get started with SlotEase?",
      answer: "Most organizations are up and running within 10 minutes using our Smart Setup Wizard. The AI guides you through configuration based on your service type."
    },
    {
      question: "Does SlotEase integrate with existing systems?",
      answer: "Yes, SlotEase offers robust API integration capabilities and can connect with most existing healthcare, government, and business management systems."
    },
    {
      question: "What about data security and privacy?",
      answer: "We use enterprise-grade encryption, are GDPR compliant, and maintain SOC 2 Type II certification. Your data security is our top priority."
    },
    {
      question: "Can customers book without creating accounts?",
      answer: "Absolutely. SlotEase supports guest booking with phone verification, making it accessible to everyone regardless of technical comfort level."
    }
  ];

  return (
    <div className="min-h-screen bg-safari-beige">
      {/* Custom Safari Styles */}
      <style jsx>{`
        .bg-safari-beige { background-color: #F5F5DC; }
        .bg-safari-terracotta { background-color: #CD4F38; }
        .bg-safari-ochre { background-color: #DAA520; }
        .bg-safari-orange { background-color: #FFA07A; }
        .bg-safari-yellow { background-color: #F4C430; }
        .bg-safari-green { background-color: #355E3B; }
        .text-safari-terracotta { color: #CD4F38; }
        .text-safari-ochre { color: #DAA520; }
        .text-safari-orange { color: #FFA07A; }
        .text-safari-yellow { color: #F4C430; }
        .text-safari-green { color: #355E3B; }
        .border-safari-terracotta { border-color: #CD4F38; }
        .border-safari-ochre { border-color: #DAA520; }
        .border-safari-green { border-color: #355E3B; }
        
        .safari-gradient-hero {
          background: linear-gradient(135deg, #F4C430 0%, #FFA07A 50%, #CD4F38 100%);
        }
        
        .safari-gradient-sunset {
          background: linear-gradient(to right, #FFA07A, #F4C430, #DAA520);
        }
        
        .safari-gradient-earth {
          background: linear-gradient(135deg, #355E3B 0%, #DAA520 100%);
        }
        
        .safari-texture {
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(218, 165, 32, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(205, 79, 56, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(53, 94, 59, 0.1) 0%, transparent 50%);
        }
        
        .safari-card {
          background: rgba(245, 245, 220, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(218, 165, 32, 0.2);
          box-shadow: 0 8px 32px rgba(205, 79, 56, 0.1);
        }
        
        .safari-btn-primary {
          background: linear-gradient(135deg, #CD4F38, #DAA520);
          border: none;
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(205, 79, 56, 0.3);
        }
        
        .safari-btn-primary:hover {
          background: linear-gradient(135deg, #B8442F, #C4941C);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(205, 79, 56, 0.4);
          color: white;
        }
        
        .safari-btn-secondary {
          background: transparent;
          border: 2px solid #355E3B;
          color: #355E3B;
          transition: all 0.3s ease;
        }
        
        .safari-btn-secondary:hover {
          background: #355E3B;
          color: #F5F5DC;
          transform: translateY(-2px);
        }
        
        .safari-divider {
          height: 60px;
          background: url("data:image/svg+xml,%3Csvg width='100' height='60' viewBox='0 0 100 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,60 Q25,20 50,40 T100,30 L100,60 Z' fill='%23F5F5DC'/%3E%3C/svg%3E") repeat-x;
          background-size: 100px 60px;
        }
        
        .safari-pattern {
          background-image: 
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(218, 165, 32, 0.05) 10px,
              rgba(218, 165, 32, 0.05) 20px
            );
        }
        
        .safari-shadow {
          box-shadow: 0 10px 30px rgba(205, 79, 56, 0.15);
        }
        
        .safari-text-shadow {
          text-shadow: 2px 2px 4px rgba(53, 94, 59, 0.3);
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .safari-icon-bg {
          background: radial-gradient(circle, rgba(244, 196, 48, 0.2), rgba(255, 160, 122, 0.1));
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center safari-gradient-hero overflow-hidden">
        <div className="absolute inset-0 safari-texture"></div>
        <div className="absolute inset-0 safari-pattern opacity-30"></div>
        
        {/* Bolt Badge - Top Right */}
        <div className="absolute top-6 right-6 z-20">
          <BoltBadge variant="minimal" className="bg-white bg-opacity-90 rounded-lg px-3 py-2" />
        </div>
        
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 safari-card rounded-full text-safari-green font-medium mb-6 animate-float">
              <Zap className="h-5 w-5 mr-2 text-safari-ochre" />
              Powered by Advanced AI Technology
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight safari-text-shadow">
              Transform Your
              <span className="block bg-gradient-to-r from-safari-yellow to-safari-orange bg-clip-text text-transparent">
                Appointment
              </span>
              Scheduling Experience
            </h1>
            
            <p className="text-xl md:text-2xl text-white mb-8 max-w-4xl mx-auto leading-relaxed opacity-90">
              The universal platform that eliminates scheduling conflicts, reduces wait times, 
              and delivers exceptional customer experiences across hospitals, government offices, 
              banks, and service providers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 safari-btn-primary text-lg font-semibold rounded-lg flex items-center justify-center"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            
            <button className="px-8 py-4 safari-btn-secondary text-lg font-semibold rounded-lg flex items-center justify-center">
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center safari-card rounded-lg p-6">
                <div className="text-3xl md:text-4xl font-bold text-safari-terracotta mb-2">{stat.number}</div>
                <div className="text-safari-green font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white opacity-70" />
        </div>
      </section>

      {/* Safari Divider */}
      <div className="safari-divider"></div>

      {/* Pain Point Narrative */}
      <section className="py-20 bg-white safari-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-safari-green mb-6">
              Tired of endless back-and-forth emails and scheduling conflicts?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              You're not alone. Service providers worldwide struggle with the same challenges every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="safari-card p-8 rounded-xl safari-shadow">
              <div className="w-12 h-12 bg-safari-orange rounded-lg flex items-center justify-center mb-6 safari-icon-bg">
                <Clock className="h-6 w-6 text-safari-terracotta" />
              </div>
              <h3 className="text-xl font-semibold text-safari-green mb-4">Wasted Time</h3>
              <p className="text-gray-600">
                Staff spend hours managing appointments manually, leading to errors and frustrated customers waiting in long queues.
              </p>
            </div>

            <div className="safari-card p-8 rounded-xl safari-shadow">
              <div className="w-12 h-12 bg-safari-yellow rounded-lg flex items-center justify-center mb-6 safari-icon-bg">
                <Users className="h-6 w-6 text-safari-ochre" />
              </div>
              <h3 className="text-xl font-semibold text-safari-green mb-4">Poor Experience</h3>
              <p className="text-gray-600">
                Customers face uncertainty about wait times, difficulty booking appointments, and lack of real-time updates.
              </p>
            </div>

            <div className="safari-card p-8 rounded-xl safari-shadow">
              <div className="w-12 h-12 bg-safari-orange rounded-lg flex items-center justify-center mb-6 safari-icon-bg">
                <TrendingUp className="h-6 w-6 text-safari-terracotta" />
              </div>
              <h3 className="text-xl font-semibold text-safari-green mb-4">Lost Revenue</h3>
              <p className="text-gray-600">
                No-shows, double bookings, and inefficient scheduling directly impact your bottom line and operational efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Showcase */}
      <section className="py-20 safari-gradient-earth">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 safari-text-shadow">
              Meet SlotEase: Your Complete Solution
            </h2>
            <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
              A comprehensive platform that transforms how you manage appointments and serve your customers.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">Interactive Feature Demonstrations</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                      activeFeature === index
                        ? 'safari-card border-2 border-safari-yellow'
                        : 'bg-white bg-opacity-10 border-2 border-transparent hover:border-white hover:border-opacity-30'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        activeFeature === index ? 'bg-safari-ochre' : 'bg-white bg-opacity-20'
                      }`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                        <p className="text-white opacity-80 mb-2">{feature.description}</p>
                        {activeFeature === index && (
                          <div className="text-sm text-safari-yellow font-medium">
                            ✓ {feature.demo}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="safari-card p-8 rounded-2xl">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-safari-green">Live Demo Preview</h4>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-safari-terracotta rounded-full"></div>
                    <div className="w-3 h-3 bg-safari-yellow rounded-full"></div>
                    <div className="w-3 h-3 bg-safari-green rounded-full"></div>
                  </div>
                </div>
                
                {/* Mock Interface */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-safari-beige rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-safari-ochre" />
                      <span className="text-sm font-medium text-safari-green">Today's Schedule</span>
                    </div>
                    <span className="text-sm text-safari-terracotta font-medium">24 appointments</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-safari-orange bg-opacity-20 rounded-lg text-center">
                      <div className="text-lg font-bold text-safari-terracotta">8</div>
                      <div className="text-xs text-safari-green">Waiting</div>
                    </div>
                    <div className="p-3 bg-safari-ochre bg-opacity-20 rounded-lg text-center">
                      <div className="text-lg font-bold text-safari-ochre">3</div>
                      <div className="text-xs text-safari-green">In Service</div>
                    </div>
                    <div className="p-3 bg-safari-green bg-opacity-20 rounded-lg text-center">
                      <div className="text-lg font-bold text-safari-green">15m</div>
                      <div className="text-xs text-safari-green">Avg Wait</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-safari-beige rounded">
                      <span className="text-sm text-safari-green">Next: John Smith</span>
                      <span className="text-xs text-safari-ochre">09:30 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-safari-beige rounded">
                      <span className="text-sm text-safari-green">Sarah Johnson</span>
                      <span className="text-xs text-gray-500">10:00 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="py-20 safari-gradient-sunset">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 safari-card rounded-full text-safari-green font-medium mb-6">
              <Brain className="h-5 w-5 mr-2 text-safari-ochre" />
              Coming Soon: AI Smart Guide
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 safari-text-shadow">
              The Future of Intelligent Scheduling
            </h2>
            <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
              Our upcoming AI Smart Guide will revolutionize how appointments are managed with predictive intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="safari-card p-8 rounded-xl safari-shadow">
              <div className="w-12 h-12 bg-safari-green bg-opacity-20 rounded-lg flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-safari-green" />
              </div>
              <h3 className="text-xl font-semibold text-safari-green mb-4">Predictive Analytics</h3>
              <p className="text-gray-600">
                AI predicts peak times, suggests optimal scheduling, and automatically adjusts capacity based on historical patterns.
              </p>
            </div>

            <div className="safari-card p-8 rounded-xl safari-shadow">
              <div className="w-12 h-12 bg-safari-ochre bg-opacity-20 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6 text-safari-ochre" />
              </div>
              <h3 className="text-xl font-semibold text-safari-green mb-4">Natural Language Booking</h3>
              <p className="text-gray-600">
                Customers can book appointments using natural language through voice, chat, or text messages.
              </p>
            </div>

            <div className="safari-card p-8 rounded-xl safari-shadow">
              <div className="w-12 h-12 bg-safari-terracotta bg-opacity-20 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-safari-terracotta" />
              </div>
              <h3 className="text-xl font-semibold text-safari-green mb-4">Auto-Optimization</h3>
              <p className="text-gray-600">
                Continuous learning algorithms automatically optimize schedules, reduce no-shows, and improve efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white safari-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-safari-green mb-6">
              Trusted by Leading Organizations
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied customers who've transformed their operations with SlotEase.
            </p>
          </div>

          {/* Client Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 opacity-60">
            <div className="flex items-center justify-center p-6 safari-card rounded-lg">
              <span className="text-2xl font-bold text-safari-green">🏥 HealthCorp</span>
            </div>
            <div className="flex items-center justify-center p-6 safari-card rounded-lg">
              <span className="text-2xl font-bold text-safari-green">🏛️ GovServices</span>
            </div>
            <div className="flex items-center justify-center p-6 safari-card rounded-lg">
              <span className="text-2xl font-bold text-safari-green">🏦 MegaBank</span>
            </div>
            <div className="flex items-center justify-center p-6 safari-card rounded-lg">
              <span className="text-2xl font-bold text-safari-green">🎓 EduCenter</span>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="safari-card p-8 rounded-xl safari-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-safari-yellow fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-safari-green">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 safari-gradient-earth">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 text-safari-yellow mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Enterprise Security</h3>
              <p className="text-white opacity-80">SOC 2 Type II Certified</p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-12 w-12 text-safari-orange mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">GDPR Compliant</h3>
              <p className="text-white opacity-80">Full Data Protection</p>
            </div>
            <div className="flex flex-col items-center">
              <Globe className="h-12 w-12 text-safari-yellow mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">99.9% Uptime</h3>
              <p className="text-white opacity-80">Reliable & Available</p>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="h-12 w-12 text-safari-orange mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
              <p className="text-white opacity-80">Always Here to Help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Preview */}
      <section className="py-20 bg-white safari-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-safari-green mb-6">
                Perfect on Every Device
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                SlotEase works seamlessly across all devices, ensuring your customers can book appointments anytime, anywhere.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Smartphone className="h-8 w-8 text-safari-ochre" />
                  <div>
                    <h3 className="text-lg font-semibold text-safari-green">Mobile Optimized</h3>
                    <p className="text-gray-600">Native mobile experience with offline capabilities</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Monitor className="h-8 w-8 text-safari-terracotta" />
                  <div>
                    <h3 className="text-lg font-semibold text-safari-green">Desktop Dashboard</h3>
                    <p className="text-gray-600">Comprehensive admin interface for full control</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="h-8 w-8 text-safari-ochre" />
                  <div>
                    <h3 className="text-lg font-semibold text-safari-green">Voice & SMS</h3>
                    <p className="text-gray-600">Book appointments via phone or text message</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="safari-card p-8 rounded-2xl">
                {/* Mobile Mockup */}
                <div className="bg-gray-900 p-2 rounded-2xl max-w-sm mx-auto">
                  <div className="bg-white rounded-xl overflow-hidden">
                    <div className="bg-safari-ochre p-4 text-white">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">SlotEase</h4>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-safari-beige rounded-lg">
                        <span className="text-sm font-medium text-safari-green">Next Appointment</span>
                        <span className="text-sm text-safari-ochre">2:30 PM</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="p-3 bg-safari-ochre bg-opacity-20 text-safari-ochre rounded-lg text-sm font-medium">
                          Book New
                        </button>
                        <button className="p-3 bg-safari-beige text-safari-green rounded-lg text-sm font-medium">
                          View Queue
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-safari-green">Current Wait</span>
                          <span className="font-medium text-safari-green">12 minutes</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-safari-terracotta h-2 rounded-full w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 safari-gradient-sunset">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 safari-text-shadow">Frequently Asked Questions</h2>
            <p className="text-xl text-white opacity-90">Everything you need to know about SlotEase</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="safari-card p-6 rounded-xl safari-shadow">
                <h3 className="text-lg font-semibold text-safari-green mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 safari-gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 safari-text-shadow">
            Ready to Transform Your Scheduling?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join thousands of organizations already using SlotEase to deliver exceptional customer experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white text-safari-terracotta text-lg font-semibold rounded-lg hover:bg-safari-beige transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            
            <button 
              onClick={handleContactSales}
              className="px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-safari-terracotta transition-all duration-300 flex items-center justify-center"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact Sales
            </button>
          </div>

          <p className="text-white opacity-80 text-sm mb-8">
            No credit card required • Setup in under 10 minutes • 30-day free trial
          </p>

          {/* Bolt Badge in Footer */}
          <BoltBadge variant="footer" className="mt-8" />
        </div>
      </section>

      {/* Sticky CTA */}
      {showCTA && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <button
            onClick={onGetStarted}
            className="px-6 py-3 safari-btn-primary font-semibold rounded-full shadow-lg flex items-center"
          >
            Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};