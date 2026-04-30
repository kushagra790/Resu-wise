import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AnimatedCounter({ endValue, duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = endValue / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start > endValue) { setCount(endValue); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [endValue, duration]);
  return <span>{count}</span>;
}

function FloatingElement({ delay, children }) {
  return (
    <div className="animate-bounce" style={{ animationDelay: `${delay}s`, animationDuration: '3s' }}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const handleStartAnalysis = () => navigate('/dashboard');

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/20 to-black text-white overflow-hidden relative">

      {/* Animated gradient background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orbs */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-b from-blue-600/30 to-transparent blur-[120px] animate-pulse"></div>
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-cyan-600/20 to-transparent blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-l from-purple-600/20 to-transparent blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Animated grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20"></div>
      </div>

      <div className="relative z-10">
        {/* ================================
            HERO SECTION
            ================================ */}
        <section className="min-h-[95vh] flex items-center justify-center px-4 pt-20 pb-10">
          <div className="max-w-5xl mx-auto space-y-10 text-center">

            {/* Animated Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/40 rounded-full text-sm text-blue-300 font-semibold backdrop-blur-sm hover:border-blue-400/60 transition-all duration-300 cursor-default">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
              <span>✨ AI-Powered Insights</span>
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-black leading-[1.1] tracking-tighter">
                <span className="text-white">Get Interviews,</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent animate-pulse">
                  Not Rejections
                </span>
              </h1>
              
              <p className="text-lg text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
                Your resume isn't getting through. <span className="text-blue-400 font-semibold">Our AI finds exactly what's holding you back</span> and fixes it in minutes.
              </p>
            </div>

            <p className="text-base text-gray-400 max-w-2xl mx-auto font-medium tracking-wide">
              📊 See Your Match Score • 💡 Get Specific Fixes • 🎯 Land More Interviews
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
              <button
                onMouseEnter={() => setIsHovered('analyse')}
                onMouseLeave={() => setIsHovered(null)}
                onClick={handleStartAnalysis}
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-bold text-xl transition-all duration-300 shadow-2xl shadow-blue-600/40 hover:shadow-blue-500/60 hover:scale-105 transform"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">📄</span>
                  Analyze My Resume Now
                  <span className={`transform transition-all duration-300 ${isHovered === 'analyse' ? 'translate-x-2' : ''}`}>→</span>
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>

              <button
                onMouseEnter={() => setIsHovered('builder')}
                onMouseLeave={() => setIsHovered(null)}
                onClick={() => navigate('/resume-builder')}
                className="group relative px-10 py-5 border-2 border-blue-500/50 hover:border-cyan-400 rounded-xl font-bold text-xl text-gray-200 hover:text-white transition-all duration-300 bg-white/5 hover:bg-blue-600/10 hover:shadow-lg hover:shadow-blue-600/20 hover:scale-105 transform"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🏗️</span>
                  Build a Better Resume
                  <span className={`transform transition-all duration-300 ${isHovered === 'builder' ? 'translate-x-2' : ''}`}>→</span>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ================================
            FEATURE CARDS - ENHANCED
            ================================ */}
        <section className="py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 space-y-4">
              <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase">Proven Results</p>
              <h2 className="text-3xl md:text-4xl font-black text-white">
                Everything You Need to <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Stand Out</span>
              </h2>
              <p className="text-gray-400 text-base max-w-2xl mx-auto">
                Our AI does what recruiters want—so your resume gets noticed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  icon: '🎯', 
                  title: 'Match Your Target Jobs', 
                  desc: 'We compare your resume to job descriptions and show you exactly what\'s missing. Get a real match score.',
                  color: 'from-blue-600 to-cyan-600',
                  border: 'border-blue-600/50'
                },
                { 
                  icon: '🔍', 
                  title: 'Find Your Skill Gaps', 
                  desc: 'See which skills employers want that you haven\'t highlighted. Get specific suggestions to add them.',
                  color: 'from-cyan-600 to-teal-600',
                  border: 'border-cyan-600/50'
                },
                { 
                  icon: '⚡', 
                  title: 'Pass the ATS Filter', 
                  desc: 'Most resumes get rejected by scanning software. We optimize yours to get past it and reach real people.',
                  color: 'from-purple-600 to-pink-600',
                  border: 'border-purple-600/50'
                },
              ].map((card, i) => (
                <div key={i} className="group relative h-full rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  {/* Border gradient */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-transparent border ${card.border} group-hover:border-white/30 transition-all duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative bg-[#0a0a0a] border border-white/10 group-hover:border-white/20 rounded-2xl p-10 h-full transition-all duration-300 backdrop-blur-sm">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} opacity-20 group-hover:opacity-40 flex items-center justify-center text-3xl mb-6 transition-all duration-300 group-hover:scale-110`}>
                      {card.icon}
                    </div>
                    
                    {/* Text */}
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">{card.title}</h3>
                    <p className="text-gray-400 leading-relaxed mb-6">{card.desc}</p>
                    
                    {/* Learn more */}
                    <div className="flex items-center text-blue-400 font-medium text-sm group-hover:text-cyan-400 group-hover:translate-x-2 transition-all duration-300">
                      Learn more <span className="ml-2 group-hover:rotate-90 transition-transform duration-300">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================
            HOW IT WORKS - ANIMATED
            ================================ */}
        <section className="py-32 px-4 border-t border-white/10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20 space-y-4">
              <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase">Simple Process</p>
              <h2 className="text-5xl md:text-6xl font-black text-white">Get Results in <span className="text-cyan-400">3 Steps</span></h2>
              <p className="text-gray-400 text-xl">No complicated process. Just fast results.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              
              {[
                { num: '01', title: 'Upload Your Resume', desc: 'Paste or upload your resume and the job you want.' },
                { num: '02', title: 'We Analyze It', desc: 'Our AI instantly scans and compares in seconds.' },
                { num: '03', title: 'Get Your Match Score', desc: 'See what fits, what\'s missing, and how to fix it.' },
              ].map((step, i) => (
                <div key={i} className="group relative">
                  {/* Number background */}
                  <div className="text-7xl font-black text-blue-600/10 mb-6 font-mono group-hover:text-blue-600/30 transition-colors duration-300">{step.num}</div>
                  
                  {/* Step circle */}
                  <div className="absolute -top-6 left-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg group-hover:scale-125 transition-transform duration-300 shadow-lg shadow-blue-600/40">
                    {i + 1}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================
            PRO TIP - ENHANCED
            ================================ */}
        <section className="py-32 px-4 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <div className="relative group cursor-default">
              {/* Gradient border animation */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="relative bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-blue-600/30 group-hover:border-cyan-500/50 rounded-2xl p-12 transition-all duration-300">
                <div className="text-5xl mb-6">💡</div>
                <h3 className="text-4xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">Pro Tips</h3>
                <p className="text-gray-300 leading-relaxed text-lg mb-8">
                  Upload your resume in PDF or DOCX for the most accurate parsing. ResuWise intelligently analyzes structure, skills, and experience depth for comprehensive insights. <span className="text-blue-400 font-semibold">The more detailed, the better!</span>
                </p>
                <button
                  onClick={handleStartAnalysis}
                  className="group/btn inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-600 rounded-lg font-bold text-lg transition-all duration-300 shadow-xl shadow-blue-600/40 hover:shadow-cyan-600/40 hover:scale-105 transform"
                >
                  Get Started Now
                  <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================================
            FINAL CTA - HERO-LIKE
            ================================ */}
        <section className="py-32 px-4 border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <div className="space-y-6">
              <h2 className="text-6xl md:text-7xl font-black leading-tight">
                <span className="text-white">Stop Losing Jobs to</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">Resume Screening</span>
              </h2>
              <p className="text-gray-300 text-2xl font-light max-w-2xl mx-auto">
                Get your AI match score now. <span className="text-cyan-400 font-semibold">See exactly what's holding you back</span> and fix it in minutes.
              </p>
            </div>
            
            <button
              onClick={handleStartAnalysis}
              className="group inline-flex items-center gap-4 px-12 py-7 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-500 rounded-2xl font-bold text-2xl transition-all duration-300 shadow-2xl shadow-blue-600/50 hover:shadow-cyan-600/60 hover:scale-110 transform hover:-translate-y-1"
            >
              <span className="text-4xl group-hover:rotate-12 transition-transform duration-300">📊</span>
              Analyze My Resume Free
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </button>

            <p className="text-gray-500 text-sm pt-4">
              Results in &lt;2 seconds • 100% Secure • Always Free Analysis
            </p>
          </div>
        </section>

        {/* ================================
            FOOTER
            ================================ */}
        <footer className="bg-gradient-to-b from-black to-blue-950/20 border-t border-white/10 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Footer Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <h3 className="text-white font-bold text-lg">ResuWise</h3>
                    <p className="text-cyan-400 text-sm">Resume Intelligence</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  AI-powered resume analysis to help you land your dream job.
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Resume Analysis</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Resume Builder</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Interview Quiz</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-white font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Security</a></li>
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 py-8"></div>

            {/* Bottom Footer */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                &copy; 2026 ResuWise. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-lg">𝕏</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-lg">📘</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-lg">🔗</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-lg">💼</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed right-6 bottom-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600/90 text-white shadow-2xl shadow-blue-500/40 transition duration-300 hover:-translate-y-1 hover:bg-cyan-500/90"
          aria-label="Scroll to top"
        >
          <span className="text-2xl leading-none">↑</span>
        </button>
      )}

      {/* CSS for custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
