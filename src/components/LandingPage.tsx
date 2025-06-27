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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Powered by Advanced AI Technology
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {" "}Appointment{" "}
              </span>
              Scheduling Experience
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              The universal platform that eliminates scheduling conflicts, reduces wait times, 
              and delivers exceptional customer experiences across hospitals, government offices, 
              banks, and service providers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-lg hover:border-primary-500 hover:text-primary-600 transition-all duration-300 flex items-center justify-center">
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-gray-400" />
        </div>
      </section>

      {/* Pain Point Narrative */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tired of endless back-and-forth emails and scheduling conflicts?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              You're not alone. Service providers worldwide struggle with the same challenges every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-error-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Wasted Time</h3>
              <p className="text-gray-600">
                Staff spend hours managing appointments manually, leading to errors and frustrated customers waiting in long queues.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Poor Experience</h3>
              <p className="text-gray-600">
                Customers face uncertainty about wait times, difficulty booking appointments, and lack of real-time updates.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-error-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lost Revenue</h3>
              <p className="text-gray-600">
                No-shows, double bookings, and inefficient scheduling directly impact your bottom line and operational efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet SlotEase: Your Complete Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive platform that transforms how you manage appointments and serve your customers.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Interactive Feature Demonstrations</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                      activeFeature === index
                        ? 'bg-primary-50 border-2 border-primary-200'
                        : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        activeFeature === index ? 'bg-primary-600' : 'bg-gray-400'
                      }`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                        <p className="text-gray-600 mb-2">{feature.description}</p>
                        {activeFeature === index && (
                          <div className="text-sm text-primary-600 font-medium">
                            ✓ {feature.demo}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-2xl">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-gray-900">Live Demo Preview</h4>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-error-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-warning-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-accent-400 rounded-full"></div>
                  </div>
                </div>
                
                {/* Mock Interface */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-primary-600" />
                      <span className="text-sm font-medium">Today's Schedule</span>
                    </div>
                    <span className="text-sm text-accent-600 font-medium">24 appointments</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-accent-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-accent-600">8</div>
                      <div className="text-xs text-gray-600">Waiting</div>
                    </div>
                    <div className="p-3 bg-primary-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-primary-600">3</div>
                      <div className="text-xs text-gray-600">In Service</div>
                    </div>
                    <div className="p-3 bg-secondary-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-secondary-600">15m</div>
                      <div className="text-xs text-gray-600">Avg Wait</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Next: John Smith</span>
                      <span className="text-xs text-primary-600">09:30 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Sarah Johnson</span>
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
      <section className="py-20 bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-secondary-100 text-secondary-800 rounded-full text-sm font-medium mb-6">
              <Brain className="h-4 w-4 mr-2" />
              Coming Soon: AI Smart Guide
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              The Future of Intelligent Scheduling
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our upcoming AI Smart Guide will revolutionize how appointments are managed with predictive intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Predictive Analytics</h3>
              <p className="text-gray-600">
                AI predicts peak times, suggests optimal scheduling, and automatically adjusts capacity based on historical patterns.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Natural Language Booking</h3>
              <p className="text-gray-600">
                Customers can book appointments using natural language through voice, chat, or text messages.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Auto-Optimization</h3>
              <p className="text-gray-600">
                Continuous learning algorithms automatically optimize schedules, reduce no-shows, and improve efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Leading Organizations
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied customers who've transformed their operations with SlotEase.
            </p>
          </div>

          {/* Client Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 opacity-60">
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
              <span className="text-2xl font-bold text-gray-400">🏥 HealthCorp</span>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
              <span className="text-2xl font-bold text-gray-400">🏛️ GovServices</span>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
              <span className="text-2xl font-bold text-gray-400">🏦 MegaBank</span>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
              <span className="text-2xl font-bold text-gray-400">🎓 EduCenter</span>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Security</h3>
              <p className="text-gray-600">SOC 2 Type II Certified</p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-12 w-12 text-accent-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">GDPR Compliant</h3>
              <p className="text-gray-600">Full Data Protection</p>
            </div>
            <div className="flex flex-col items-center">
              <Globe className="h-12 w-12 text-secondary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">99.9% Uptime</h3>
              <p className="text-gray-600">Reliable & Available</p>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Always Here to Help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Perfect on Every Device
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                SlotEase works seamlessly across all devices, ensuring your customers can book appointments anytime, anywhere.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Smartphone className="h-8 w-8 text-primary-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Mobile Optimized</h3>
                    <p className="text-gray-600">Native mobile experience with offline capabilities</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Monitor className="h-8 w-8 text-secondary-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Desktop Dashboard</h3>
                    <p className="text-gray-600">Comprehensive admin interface for full control</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="h-8 w-8 text-accent-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Voice & SMS</h3>
                    <p className="text-gray-600">Book appointments via phone or text message</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-8 rounded-2xl">
                {/* Mobile Mockup */}
                <div className="bg-gray-900 p-2 rounded-2xl max-w-sm mx-auto">
                  <div className="bg-white rounded-xl overflow-hidden">
                    <div className="bg-primary-600 p-4 text-white">
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
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Next Appointment</span>
                        <span className="text-sm text-primary-600">2:30 PM</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="p-3 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium">
                          Book New
                        </button>
                        <button className="p-3 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium">
                          View Queue
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current Wait</span>
                          <span className="font-medium">12 minutes</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-accent-500 h-2 rounded-full w-3/4"></div>
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about SlotEase</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Scheduling?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of organizations already using SlotEase to deliver exceptional customer experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            
            <button className="px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-300 flex items-center justify-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Sales
            </button>
          </div>

          <p className="text-primary-100 text-sm mt-6">
            No credit card required • Setup in under 10 minutes • 30-day free trial
          </p>
        </div>
      </section>

      {/* Sticky CTA */}
      {showCTA && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <button
            onClick={onGetStarted}
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 flex items-center"
          >
            Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};