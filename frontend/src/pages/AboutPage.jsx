import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Animated terminal query component
const TerminalQuery = ({ query, response, delay = 0 }) => {
  const [displayedQuery, setDisplayedQuery] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedQuery(query.slice(0, i + 1));
      i++;
      if (i >= query.length) {
        clearInterval(interval);
        setTimeout(() => setShowResponse(true), 400);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [visible, query]);

  if (!visible) return null;

  return (
    <div className="font-mono text-sm space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-[#0EA5E9] select-none">▶</span>
        <span className="text-white">{displayedQuery}<span className="animate-pulse">|</span></span>
      </div>
      {showResponse && (
        <div className="ml-5 text-emerald-400 animate-fade-in-fast leading-relaxed">
          {response}
        </div>
      )}
    </div>
  );
};

// Floating orb background
const OrbBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#0EA5E9]/8 blur-[120px] animate-orb-1" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/8 blur-[120px] animate-orb-2" />
    <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-[#0EA5E9]/5 blur-[80px] animate-orb-3" />
    {/* Grid lines */}
    <div className="absolute inset-0" style={{
      backgroundImage: `linear-gradient(rgba(14,165,233,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.03) 1px, transparent 1px)`,
      backgroundSize: '60px 60px'
    }} />
  </div>
);

// Stat counter
const StatItem = ({ value, label, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        let start = 0;
        const end = parseInt(value);
        const duration = 2000;
        const step = (end / duration) * 16;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, started]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl font-sora font-extrabold gradient-text mb-2">
        {count}{suffix}
      </div>
      <div className="text-gray-400 text-sm tracking-widest uppercase">{label}</div>
    </div>
  );
};

const AboutPage = () => {
  const [activeSection, setActiveSection] = useState(0);

  const timeline = [
    { year: '2025 Q1', title: 'The Problem Identified', desc: 'Security teams wasting hours writing KQL and DSL queries. Response times suffering. We decided to fix it.', icon: '🔍' },
    { year: '2025 Q2', title: 'NLP Core Built', desc: 'Developed the natural language processing engine that translates plain English into precise security queries.', icon: '🧠' },
    { year: '2025 Q3', title: 'ML Threat Engine', desc: 'Integrated machine learning models trained on millions of threat patterns for predictive detection.', icon: '⚡' },
    { year: '2025 Q4  ', title: 'Beta Launch', desc: 'First 50 security teams onboarded. Reduced average query time from 45 minutes to under 2 minutes.', icon: '🚀' },
    { year: '2026', title: 'Inquisitor Today', desc: 'Protecting 500+ organizations globally. Continuously learning. Always watching.', icon: '🛡️' },
  ];

  const useCases = [
    { query: 'Show failed SSH logins from Russia in last 6 hours', response: '→ Found 847 attempts from 23 IPs • Top source: 185.220.101.x • Risk: CRITICAL', color: 'text-red-400' },
    { query: 'Which users accessed sensitive data after 11pm this week?', response: '→ 3 anomalous sessions detected • User: svc_backup, jsmith • Flagged for review', color: 'text-yellow-400' },
    { query: 'Predict likelihood of ransomware attack in next 48 hours', response: '→ Risk Score: 73/100 • Based on: lateral movement patterns, port scan activity', color: 'text-orange-400' },
    { query: 'Generate incident report for SQL injection attempt', response: '→ Report generated • 4 pages • Timeline reconstructed • Remediation steps included', color: 'text-emerald-400' },
  ];

  const team = [
  { name: 'Khushi Rathore', role: 'Team Lead & Backend Dev', avatar: 'KR', gradient: 'from-[#0EA5E9] to-[#8B5CF6]' },
  { name: 'Priyanshu Srivastava', role: 'ML & Frontend', avatar: 'PS', gradient: 'from-[#8B5CF6] to-pink-500' },
  { name: 'Kartik Chauhan', role: 'UI/UX Developer', avatar: 'KC', gradient: 'from-emerald-500 to-[#0EA5E9]' },
];

  return (
    <div className="bg-[#020617] min-h-screen font-dm text-white overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-sora { font-family: 'Sora', sans-serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        
        .gradient-text {
          background: linear-gradient(135deg, #0EA5E9, #8B5CF6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,-40px) scale(1.1)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,30px) scale(0.95)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(30px,20px)} 66%{transform:translate(-20px,-30px)} }
        @keyframes fadeInFast { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideRight { from{width:0} to{width:100%} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes scanline { 0%{top:-10%} 100%{top:110%} }
        
        .animate-orb-1 { animation: orb1 8s ease-in-out infinite; }
        .animate-orb-2 { animation: orb2 10s ease-in-out infinite; }
        .animate-orb-3 { animation: orb3 12s ease-in-out infinite; }
        .animate-fade-in-fast { animation: fadeInFast 0.4s ease forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        
        .scanline-container { position: relative; overflow: hidden; }
        .scanline-container::after {
          content: '';
          position: absolute;
          left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(14,165,233,0.3), transparent);
          animation: scanline 3s linear infinite;
        }
        
        .terminal-glow {
          box-shadow: 0 0 40px rgba(14,165,233,0.1), inset 0 0 40px rgba(14,165,233,0.03);
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(14,165,233,0.3);
          box-shadow: 0 20px 60px rgba(14,165,233,0.1);
        }
        
        .timeline-line {
          background: linear-gradient(to bottom, #0EA5E9, #8B5CF6);
        }

        .section-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .section-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <OrbBackground />

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <svg className="w-8 h-8 text-[#0EA5E9]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
            <span className="text-2xl font-sora font-bold gradient-text">INQUISITOR</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">Home</Link>
            <Link to="/login" className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] px-5 py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#0EA5E9]/30 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — Cinematic, query-focused */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Story */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" />
                <span className="text-[#0EA5E9] text-sm font-mono font-medium">ABOUT THE SYSTEM</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-sora font-extrabold leading-tight">
                We built the
                <span className="gradient-text block">translator</span>
                <span className="text-gray-400 text-4xl font-light">between humans</span>
                <span className="text-white block">& security data.</span>
              </h1>
              
              <p className="text-gray-400 text-lg leading-relaxed">
                Security analysts shouldn't need to be query language experts. 
                Inquisitor was born from a simple frustration — 
                <span className="text-white font-semibold"> critical threats were being missed</span> because 
                writing the right KQL query took too long.
              </p>

              <div className="flex items-center gap-4 pt-2">
                <div className="h-px flex-1 bg-gradient-to-r from-[#0EA5E9]/50 to-transparent" />
                <span className="text-gray-500 text-sm font-mono">EST. 2024</span>
                <div className="h-px flex-1 bg-gradient-to-l from-[#8B5CF6]/50 to-transparent" />
              </div>
            </div>

            {/* Right: Live terminal demo */}
            <div className="animate-float">
              <div className="bg-[#0A0F1E] border border-[#0EA5E9]/20 rounded-2xl overflow-hidden terminal-glow scanline-container">
                {/* Terminal header */}
                <div className="flex items-center gap-2 px-5 py-3 bg-[#0F172A] border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  <span className="ml-3 text-gray-500 text-xs font-mono">inquisitor — threat-analysis</span>
                </div>
                
                {/* Terminal content */}
                <div className="p-6 space-y-6 min-h-[320px]">
                  <div className="text-gray-600 text-xs font-mono mb-4">
                    # Natural language security queries — live demo
                  </div>
                  <TerminalQuery 
                    query="Show me brute force attempts in last hour"
                    response="→ 156 attempts detected • 3 IPs blocked automatically • Confidence: 98.2%"
                    delay={500}
                  />
                  <TerminalQuery 
                    query="Predict threat escalation probability"
                    response="→ 73% escalation risk • Recommend: isolate endpoint 192.168.1.45"
                    delay={3500}
                  />
                  <TerminalQuery 
                    query="Generate executive summary report"
                    response="→ Report ready • 12 critical, 34 high, 89 medium severity events"
                    delay={7000}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 px-6 border-y border-white/5 bg-[#0F172A]/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <StatItem value="500" label="Security Teams" suffix="+" />
          <StatItem value="98" label="Detection Rate" suffix="%" />
          <StatItem value="2" label="Avg Query Time" suffix="min" />
          <StatItem value="10" label="Threats Analyzed" suffix="M+" />
        </div>
      </section>

      {/* USE CASES — The heart of the page */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#0EA5E9] font-mono text-sm tracking-widest uppercase">What Inquisitor Does</span>
            <h2 className="text-4xl md:text-5xl font-sora font-bold mt-4 mb-4">
              Ask. Detect. <span className="gradient-text">Respond.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Real queries our users run every day — no complex syntax, just plain English.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {useCases.map((uc, i) => (
              <div key={i} className="card-hover bg-[#0F172A]/60 backdrop-blur border border-white/8 rounded-2xl p-6 group">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-[#0EA5E9] font-mono text-lg mt-0.5">$</span>
                  <p className="text-white font-mono text-sm leading-relaxed">{uc.query}</p>
                </div>
                <div className={`font-mono text-sm ${uc.color} pl-6 border-l-2 border-current/30 py-2`}>
                  {uc.response}
                </div>
                <div className="mt-4 h-px bg-gradient-to-r from-[#0EA5E9]/0 via-[#0EA5E9]/20 to-[#0EA5E9]/0 group-hover:via-[#0EA5E9]/40 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION — Bold statement section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0EA5E9]/5 via-transparent to-[#8B5CF6]/5" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="text-[#0EA5E9] font-mono text-sm tracking-widest uppercase mb-6">Our Mission</div>
          <blockquote className="text-3xl md:text-5xl font-sora font-bold leading-tight mb-8">
            "Every second counts in security.
            <span className="gradient-text"> We remove the friction</span>
            {" "}between threat and response."
          </blockquote>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            We believe the best security tool is one that disappears — that gets out of your way 
            and lets analysts focus on what matters: <span className="text-white">protecting people and systems.</span> 
            Inquisitor absorbs the complexity of modern SIEM so your team doesn't have to.
          </p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-24 px-6 bg-[#0F172A]/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#0EA5E9] font-mono text-sm tracking-widest uppercase">Our Journey</span>
            <h2 className="text-4xl font-sora font-bold mt-4 gradient-text">How We Got Here</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px timeline-line opacity-30" />
            
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <div key={i} className="relative flex gap-8 group">
                  {/* Icon */}
                  <div className="relative z-10 w-16 h-16 flex-shrink-0 bg-[#0F172A] border border-[#0EA5E9]/30 rounded-xl flex items-center justify-center text-2xl group-hover:border-[#0EA5E9]/60 transition-all group-hover:shadow-lg group-hover:shadow-[#0EA5E9]/10">
                    {item.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="font-mono text-[#0EA5E9] text-xs mb-1 tracking-widest">{item.year}</div>
                    <h3 className="font-sora font-bold text-xl mb-2 text-white">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#0EA5E9] font-mono text-sm tracking-widest uppercase">The People</span>
            <h2 className="text-4xl font-sora font-bold mt-4 mb-4">
              Built by <span className="gradient-text">Security Obsessives</span>
            </h2>
            <p className="text-gray-400">Former SOC analysts, ML engineers, and platform builders.</p>
          </div>
          
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {team.map((member, i) => (
              <div key={i} className="card-hover bg-[#0F172A]/60 border border-white/8 rounded-2xl p-6 text-center group">
                <div className={`w-16 h-16 bg-gradient-to-br ${member.gradient} rounded-2xl flex items-center justify-center font-sora font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {member.avatar}
                </div>
                <h4 className="font-sora font-semibold text-white mb-1">{member.name}</h4>
                <p className="text-gray-500 text-xs">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK — Unique section */}
      <section className="py-20 px-6 bg-[#0F172A]/30 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#0EA5E9] font-mono text-sm tracking-widest uppercase">Under The Hood</span>
            <h2 className="text-3xl font-sora font-bold mt-4">Built on <span className="gradient-text">Serious Tech</span></h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'NLP Engine', desc: 'Converts natural language to precise security queries', icon: '🧠', tag: 'Core' },
              { name: 'ML Threat Model', desc: 'Trained on 10M+ attack patterns for prediction', icon: '⚡', tag: 'AI' },
              { name: 'Real-Time Pipeline', desc: 'Sub-second threat detection and alerting', icon: '📡', tag: 'Infra' },
              { name: 'Multi-SIEM Bridge', desc: 'Elastic, Splunk, Wazuh — unified interface', icon: '🔗', tag: 'Integration' },
              { name: 'Gemini LLM', desc: 'Powers conversational security assistant', icon: '💬', tag: 'AI' },
              { name: 'Zero Trust Auth', desc: 'JWT + role-based access control built-in', icon: '🔐', tag: 'Security' },
            ].map((tech, i) => (
              <div key={i} className="card-hover bg-[#020617] border border-white/8 rounded-xl p-5 group">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl">{tech.icon}</span>
                  <span className="text-[10px] font-mono text-[#0EA5E9] bg-[#0EA5E9]/10 px-2 py-1 rounded-full">{tech.tag}</span>
                </div>
                <h4 className="font-sora font-semibold text-white mb-1 text-sm">{tech.name}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/5 to-[#8B5CF6]/5" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="font-mono text-[#0EA5E9] text-sm mb-6 tracking-widest">
            {'> system.ready = true'}
          </div>
          <h2 className="text-4xl md:text-5xl font-sora font-bold mb-6">
            Ready to ask your <span className="gradient-text">first query?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join 500+ security teams. No KQL required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login" className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-[#0EA5E9]/30 transition-all transform hover:scale-105">
              Start Free Trial
            </Link>
            <Link to="/" className="bg-white/5 border border-white/10 px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center">
        <p className="text-gray-600 text-sm font-mono">
          © 2026 INQUISITOR • AI-Powered SIEM Assistant
        </p>
      </footer>
    </div>
  );
};

export default AboutPage;