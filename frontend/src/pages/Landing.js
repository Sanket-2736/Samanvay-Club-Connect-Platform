import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Sparkles, Calendar, Users, TrendingUp, Award, Clock } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Smart Club Connect
            </h1>
          </div>
          <Button 
            onClick={() => navigate('/auth')} 
            data-testid="nav-get-started-btn"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Transform Campus Clubs
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            From Scattered Chaos to
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-green-500 to-teal-600 bg-clip-text text-transparent">
              Streamlined Excellence
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            The complete digital platform for managing club activities, events, finances, and student engagement.
            Built for PCCOE, Pune.
          </p>
          <Button 
            onClick={() => navigate('/auth')} 
            data-testid="hero-get-started-btn"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Three Pillars of Excellence</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-12 w-12 text-blue-600" />,
                title: 'Coordination',
                description: 'Project management, task tracking, and team collaboration for club leaders',
                features: ['Task Assignment', 'Real-time Messaging', 'Document Repository']
              },
              {
                icon: <Calendar className="h-12 w-12 text-green-600" />,
                title: 'Participation',
                description: 'AI-powered event discovery, one-click RSVP, and automatic portfolio building',
                features: ['Smart Recommendations', 'QR Check-in', 'Digital Badges']
              },
              {
                icon: <TrendingUp className="h-12 w-12 text-teal-600" />,
                title: 'Reporting',
                description: 'Real-time analytics, financial tracking, and institutional oversight',
                features: ['Live Dashboards', 'Budget Monitoring', 'Audit Trails']
              }
            ].map((pillar, idx) => (
              <div key={idx} className="p-8 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="mb-4">{pillar.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{pillar.title}</h3>
                <p className="text-gray-600 mb-4">{pillar.description}</p>
                <ul className="space-y-2">
                  {pillar.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Smart Club Connect?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Sparkles className="h-8 w-8" />, title: 'AI-Powered', desc: 'Intelligent event recommendations' },
              { icon: <Clock className="h-8 w-8" />, title: '5-Second Check-in', desc: 'QR code attendance tracking' },
              { icon: <Award className="h-8 w-8" />, title: 'Gamification', desc: 'Badges and achievements' },
              { icon: <TrendingUp className="h-8 w-8" />, title: 'Real-time Analytics', desc: 'Live participation data' }
            ].map((benefit, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-green-50 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4 text-blue-600">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Campus?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join the digital revolution in club management
          </p>
          <Button 
            onClick={() => navigate('/auth')} 
            data-testid="cta-get-started-btn"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-gray-400 text-center">
        <p>© 2025 Smart Club Connect | Built for PCCOE, Pune</p>
      </footer>
    </div>
  );
};

export default Landing;