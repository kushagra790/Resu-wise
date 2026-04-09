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

export default function HomePage() {
  const navigate = useNavigate();
  const handleStartAnalysis = () => navigate('/dashboard');

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* Subtle radial glow behind hero */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-800/8 blur-[100px]"></div>
        <div className="absolute top-[50%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-700/8 blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        {/* ================================
            HERO SECTION
            ================================ */}
        <section className="min-h-[92vh] flex items-center justify-center px-4 pt-16 pb-10">
          <div className="max-w-4xl mx-auto space-y-8 text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 border border-blue-600/30 rounded-full text-sm text-blue-400 font-medium">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              Smart Resume Analysis
            </div>

            {/* Headline */}
            <div className="space-y-5">
              <h1 className="text-6xl md:text-7xl font-black leading-[1.05] tracking-tight">
                <span className="text-white">Smart</span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                  Resume Intelligence
                </span>
              </h1>
              <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                Not Getting Interviews? Fix Your Resume.
              </p>
            </div>

            <p className="text-base text-gray-600 max-w-xl mx-auto">
              Smart Suggestions • Instant Feedback • Easy Fixes
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button
                onClick={handleStartAnalysis}
                className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition-all duration-200 shadow-xl shadow-blue-600/25 hover:shadow-blue-500/40 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  📄 Analyse Your Resume
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </button>

              <button
                onClick={() => navigate('/resume-builder')}
                className="group px-8 py-4 border border-white/10 hover:border-blue-600/50 rounded-xl font-bold text-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center gap-2 justify-center"
              >
                🏗️ Resume Builder
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            {/* Trust indicators */}
            <div className="pt-6 flex flex-wrap justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">✓</span> 95% Accuracy
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-500">✓</span> &lt;2 Seconds
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-500">✓</span> No Sign-up Required
              </div>
            </div>
          </div>
        </section>

        {/* ================================
            FEATURE CARDS
            ================================ */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <p className="text-blue-500 text-sm font-semibold tracking-widest uppercase">Features</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Powerful Analysis Tools
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Comprehensive tools designed to help you land your next opportunity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: '🎯', title: 'Smart Semantic Matching', desc: 'TF-IDF and cosine similarity to measure contextual alignment between your resume and job description.', accent: 'blue' },
                { icon: '🔍', title: 'Skill Gap Analysis', desc: 'Identifies matched skills, missing competencies, and provides actionable improvement insights.', accent: 'blue' },
                { icon: '⚡', title: 'ATS Optimization', desc: 'Evaluates resume structure, keyword density, and formatting to maximize ATS compatibility.', accent: 'blue' },
              ].map((card, i) => (
                <div key={i} className="group relative bg-[#0a0a0a] border border-white/5 hover:border-blue-600/30 rounded-2xl p-8 transition-all duration-300 hover:bg-[#0d0d0d] cursor-default">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-transparent transition-all duration-300"></div>
                  <div className="relative space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-2xl group-hover:bg-blue-600/15 transition-all duration-300">
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white">{card.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{card.desc}</p>
                    <div className="pt-2 flex items-center text-blue-500 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Learn more <span className="ml-1.5">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================
            HOW IT WORKS
            ================================ */}
        <section className="py-24 px-4 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <p className="text-blue-500 text-sm font-semibold tracking-widest uppercase">Process</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white">How It Works</h2>
              <p className="text-gray-500 text-lg">Three steps to your dream job</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: '01', title: 'Upload Your Documents', desc: 'Paste text or upload your resume and job description for intelligent parsing.' },
                { num: '02', title: 'AI Analysis Engine', desc: 'Our NLP engine processes keywords, skills, and semantic similarity instantly.' },
                { num: '03', title: 'Get Detailed Insights', desc: 'Receive match score, ATS evaluation, and skill gap analysis in seconds.' },
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="text-6xl font-black text-blue-600/15 mb-4 font-mono">{step.num}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{step.desc}</p>
                  {i < 2 && <div className="hidden md:block absolute top-8 right-[-16px] text-blue-600/30 text-2xl">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================
            STATS
            ================================ */}
        <section className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
              {[
                { value: <><AnimatedCounter endValue={95} />%</>, label: 'Matching Accuracy', sub: 'Advanced NLP algorithms' },
                { value: <>&lt;<AnimatedCounter endValue={2} />s</>, label: 'Analysis Time', sub: 'Lightning-fast processing' },
                { value: <><AnimatedCounter endValue={500} />+</>, label: 'Skills Database', sub: 'Comprehensive coverage' },
              ].map((stat, i) => (
                <div key={i} className="bg-[#0a0a0a] p-10 text-center">
                  <div className="text-5xl font-black text-blue-500 mb-2">{stat.value}</div>
                  <p className="text-white font-semibold mb-1">{stat.label}</p>
                  <p className="text-gray-600 text-sm">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================
            PRO TIP
            ================================ */}
        <section className="py-24 px-4 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-[#0a0a0a] border border-blue-600/20 rounded-2xl p-10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600/50 to-transparent"></div>
              <div className="text-3xl mb-4">💡</div>
              <h3 className="text-2xl font-bold text-white mb-3">Pro Tip</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Upload your resume in PDF or DOCX format for the most accurate parsing. ResuWise intelligently analyzes structure, skills, and experience depth for comprehensive insights.
              </p>
              <button
                onClick={handleStartAnalysis}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-600/25"
              >
                Get Started Now →
              </button>
            </div>
          </div>
        </section>

        {/* ================================
            FOOTER CTA
            ================================ */}
        <section className="py-24 px-4 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Ready to optimize<br />your resume?
              </h2>
              <p className="text-gray-500 text-lg">Start analyzing against job descriptions today — free.</p>
            </div>
            <button
              onClick={handleStartAnalysis}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xl transition-all duration-200 shadow-2xl shadow-blue-600/30 hover:shadow-blue-500/40"
            >
              📄 Analyse Your Resume
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
