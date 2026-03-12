import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Animated counter component for stats
function AnimatedCounter({ endValue, duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = endValue / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start > endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [endValue, duration]);

  return <span>{count}</span>;
}

export default function HomePage({ onStartAnalysis }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartAnalysis = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10">
        {/* ============================================
            HERO SECTION
            ============================================ */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
          <div className="max-w-5xl mx-auto space-y-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300 hover:border-purple-500/60 transition-all">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              Advanced AI-Powered Resume Analysis
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
                AI-Powered Resume Intelligence
              </h1>
              
              {/* Subheading */}
              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
                Instantly analyze how well your resume aligns with any job description using advanced NLP and machine learning.
              </p>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              ResuWise leverages TF-IDF vectorization, cosine similarity, and intelligent skill extraction to calculate accurate match scores, identify missing skills, and optimize resumes for ATS systems.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={handleStartAnalysis}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 transform hover:-translate-y-1 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Analyze My Resume
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button className="px-8 py-4 border-2 border-purple-500/50 rounded-lg font-bold text-lg text-purple-300 hover:bg-purple-500/10 transition-all duration-300 hover:border-purple-400">
                Try Sample Demo
              </button>
            </div>

            {/* Trust indicators */}
            <div className="pt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> 95% Accuracy
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> &lt;2 Seconds
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> No Sign-up Required
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            FEATURE CARDS SECTION
            ============================================ */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Powerful Features
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Comprehensive analysis tools designed to help you land your next opportunity
              </p>
            </div>

            {/* Feature cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="group relative bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 space-y-4">
                  <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">🎯</div>
                  <h3 className="text-xl font-bold">Smart Semantic Matching</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Uses TF-IDF and cosine similarity to measure contextual alignment between your resume and job description.
                  </p>
                  <div className="pt-4 flex items-center text-purple-400 group-hover:translate-x-2 transition-transform">
                    Learn more <span className="ml-2">→</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-blue-500/30 rounded-2xl p-8 hover:border-blue-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 transform hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 space-y-4">
                  <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">🔍</div>
                  <h3 className="text-xl font-bold">Advanced Skill Gap Analysis</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Identifies matched skills, missing competencies, and provides actionable improvement insights.
                  </p>
                  <div className="pt-4 flex items-center text-blue-400 group-hover:translate-x-2 transition-transform">
                    Learn more <span className="ml-2">→</span>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-pink-500/30 rounded-2xl p-8 hover:border-pink-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20 transform hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 space-y-4">
                  <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">⚡</div>
                  <h3 className="text-xl font-bold">ATS Optimization Scoring</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Evaluates resume structure, keyword density, and formatting to maximize ATS compatibility.
                  </p>
                  <div className="pt-4 flex items-center text-pink-400 group-hover:translate-x-2 transition-transform">
                    Learn more <span className="ml-2">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            HOW IT WORKS SECTION
            ============================================ */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                How It Works
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Three simple steps to optimize your resume and land your dream job
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection line - desktop only */}
              <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-transparent"></div>

              {/* Step 1 */}
              <div className="relative space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-purple-500/50">
                    1
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-bold">Upload Resume & Job Description</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Paste text or upload PDF/DOCX files for intelligent parsing and analysis.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/50">
                    2
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-bold">AI Analysis Engine</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Our NLP engine processes keywords, skills, and semantic similarity instantly.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-pink-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-pink-500/50">
                    3
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-bold">Get Detailed Insights</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Receive match score, ATS evaluation, and skill gap analysis instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            STATS SECTION
            ============================================ */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-3xl p-12">
              {/* Stat 1 */}
              <div className="text-center space-y-2">
                <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                  <AnimatedCounter endValue={95} />%
                </div>
                <p className="text-gray-300 text-lg">Matching Accuracy</p>
                <p className="text-gray-500 text-sm">Advanced NLP algorithms</p>
              </div>

              {/* Stat 2 */}
              <div className="text-center space-y-2">
                <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
                  &lt;<AnimatedCounter endValue={2} />s
                </div>
                <p className="text-gray-300 text-lg">Analysis Time</p>
                <p className="text-gray-500 text-sm">Lightning-fast processing</p>
              </div>

              {/* Stat 3 */}
              <div className="text-center space-y-2">
                <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                  <AnimatedCounter endValue={500} /> +
                </div>
                <p className="text-gray-300 text-lg">Skills Database</p>
                <p className="text-gray-500 text-sm">Comprehensive coverage</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            PRO TIP SECTION
            ============================================ */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/60 to-blue-900/60 border border-purple-500/30 rounded-2xl p-8 md:p-12 backdrop-blur-lg space-y-4">
              <div className="text-3xl">💡</div>
              <h3 className="text-2xl font-bold">Pro Tip</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Upload your resume in PDF or DOCX format for the most accurate parsing and keyword extraction. ResuWise intelligently analyzes structure, skills, and experience depth to provide comprehensive insights.
              </p>
              <button
                onClick={handleStartAnalysis}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                Get Started Now
                <span>→</span>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================
            FOOTER CTA SECTION
            ============================================ */}
        <section className="py-20 px-4 border-t border-purple-500/20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to optimize your resume?
              </h2>
              <p className="text-gray-400 text-lg">
                Start analyzing your resume against job descriptions today
              </p>
            </div>
            <button
              onClick={handleStartAnalysis}
              className="group relative inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold text-xl text-white transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 transform hover:-translate-y-1 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Analyze My Resume
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </section>
      </div>

      {/* Tailwind CSS animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
