import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    { icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', title: 'Natural Language Queries', desc: 'Ask questions in plain English. No need to learn complex query languages like KQL or DSL.', gradient: 'from-primary to-accent' },
    { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Real-Time Threat Detection', desc: 'AI-powered monitoring detects anomalies and threats instantly across your entire network.', gradient: 'from-accent to-purple-600' },
    { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', title: 'Automated Reporting', desc: 'Get comprehensive security reports automatically generated from your SIEM data.', gradient: 'from-purple-600 to-pink-500' },
    { icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', title: 'Multi-SIEM Integration', desc: 'Works seamlessly with Elastic SIEM, Wazuh, Splunk, and other major security platforms.', gradient: 'from-primary to-cyan-500' },
    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Incident Management', desc: 'Track, manage, and resolve security incidents with built-in workflow automation.', gradient: 'from-green-500 to-emerald-600' },
    { icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', title: 'Predictive Analytics', desc: 'Machine learning models predict potential threats before they become critical incidents.', gradient: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="bg-darker min-h-screen font-dm text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-darker/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
            <span className="text-2xl font-sora font-bold gradient-text">INQUISITOR</span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-gray-300 hover:text-primary transition-colors">Features</a>
            <a href="#services" className="text-gray-300 hover:text-primary transition-colors">Services</a>
            <Link to="/about" className="text-gray-300 hover:text-primary transition-colors">About</Link>
            {user ? (
              <Link to="/dashboard" className="bg-gradient-to-r from-primary to-accent px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="bg-gradient-to-r from-primary to-accent px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 hero-gradient min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <span className="inline-block bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                🚀 Next-Gen Security Intelligence
              </span>
              <h1 className="text-5xl md:text-7xl font-sora font-extrabold leading-tight">
                Talk to Your
                <span className="gradient-text block">SIEM System</span>
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                Transform complex security queries into simple conversations.{' '}
                <span className="text-white font-semibold">No KQL. No DSL.</span> Just natural language.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={user ? '/dashboard' : '/login'} className="bg-gradient-to-r from-primary to-accent px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:scale-105">
                  {user ? 'Go to Dashboard' : 'Start Free Trial'}
                </Link>
                <a href="#features" className="bg-white/5 border border-white/10 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                  Learn More
                </a>
              </div>
              <div className="flex items-center gap-8 pt-6">
                <div className="flex -space-x-3">
                  {['from-primary to-accent', 'from-accent to-purple-600', 'from-purple-600 to-pink-500'].map((g, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full bg-gradient-to-br ${g} border-2 border-darker`} />
                  ))}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Trusted by</p>
                  <p className="font-semibold">500+ Security Teams</p>
                </div>
              </div>
            </div>

            {/* Demo Card */}
            <div className="animate-float">
              <div className="bg-dark/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 glow-card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">You asked:</p>
                    <p className="text-white">"Show me all failed login attempts in last 24 hours"</p>
                  </div>
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">INQUISITOR:</p>
                    <p className="text-white mb-3">Found 47 failed login attempts. Here's the breakdown:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-400">High Risk:</span><span className="text-red-400 font-bold">12 attempts</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Medium Risk:</span><span className="text-yellow-400 font-bold">23 attempts</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Low Risk:</span><span className="text-green-400 font-bold">12 attempts</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-dark/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-sora font-bold mb-4">Powerful <span className="gradient-text">Features</span></h2>
            <p className="text-xl text-gray-400">Everything you need to secure your infrastructure</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-dark/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl glow-card">
                <div className={`w-14 h-14 bg-gradient-to-br ${f.gradient} rounded-xl flex items-center justify-center mb-6`}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-2xl font-sora font-bold mb-4">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-sora font-bold mb-4">Our <span className="gradient-text">Services</span></h2>
            <p className="text-xl text-gray-400">Comprehensive security operations made simple</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-10 rounded-2xl">
              <h3 className="text-3xl font-sora font-bold mb-4">Conversational Investigation</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">Simply ask questions like "Show me suspicious login patterns from Russia" and get instant, actionable insights.</p>
              {['Natural language processing', 'Context-aware responses', 'Historical data analysis'].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-purple-600/10 border border-accent/20 p-10 rounded-2xl">
              <h3 className="text-3xl font-sora font-bold mb-4">Automated Threat Reporting</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">Receive instant alerts and comprehensive reports when suspicious activities are detected.</p>
              {['Real-time alerting system', 'Customizable report templates', 'Multi-channel notifications'].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3">
                  <svg className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-sora font-bold mb-6">
            Ready to Transform Your <span className="gradient-text">Security Operations?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10">Join hundreds of security teams already using INQUISITOR</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login" className="bg-gradient-to-r from-primary to-accent px-10 py-5 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:scale-105">
              Start Your Free Trial
            </Link>
            <Link to="/signup" className="bg-white text-dark px-10 py-5 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>
                <span className="text-xl font-sora font-bold gradient-text">INQUISITOR</span>
              </div>
              <p className="text-gray-400 text-sm">Next-generation AI-powered SIEM assistant for modern security teams.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security', 'Compliance'] },
            ].map(section => (
              <div key={section.title}>
                <h4 className="font-sora font-bold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  {section.links.map(l => <li key={l}><a href="#" className="hover:text-primary transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 INQUISITOR. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
