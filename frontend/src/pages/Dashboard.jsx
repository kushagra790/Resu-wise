import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AnalysisPage from '../components/AnalysisPage';
import AnalysisHistory from '../components/AnalysisHistory';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showHistory, setShowHistory] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
  const { user } = useAuth();

  const handleStartAnalysis  = () => setCurrentPage('analysis');
  const handleBackHome = () => { setCurrentPage('home'); setShowHistory(false); };
  const handleSelectAnalysis = (analysisData) => {
    sessionStorage.setItem('restoredAnalysis', JSON.stringify(analysisData));
    setCurrentPage('analysis');
  };

  return (
    <div className="min-h-screen bg-black flex">
      {showHistory && (
        <AnalysisHistory
          onSelectAnalysis={handleSelectAnalysis}
          currentAnalysisId={currentAnalysisId}
        />
      )}

      <div className={`flex-1 transition-all ${showHistory ? 'ml-80' : ''}`}>
        {currentPage === 'home' ? (
          <div className="min-h-screen bg-gradient-to-br from-black via-black to-blue-950/5 p-8">
            <div className="max-w-6xl mx-auto">

              {/* Welcome Section */}
              <div className="mb-16">
                <div>
                  <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
                    Welcome, <span className="text-blue-500">{user?.name || 'User'}</span> 👋
                  </h1>
                  <p className="text-gray-400 text-lg md:text-xl">
                    Let's analyze your resume and land that perfect job
                  </p>
                </div>
              </div>

              {/* Main Action Cards - Aligned with below */}
              <div className="flex flex-col md:flex-row items-center gap-2 mb-16 w-full">
                {/* AI Analysis Card */}
                <div 
                  onClick={handleStartAnalysis}
                  className="group relative bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-600/40 rounded-2xl p-8 hover:border-blue-500/60 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-600/20 hover:-translate-y-1 w-full md:w-2/3"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
                    <h2 className="text-3xl font-bold text-white mb-3">AI Resume Analysis</h2>
                    <p className="text-gray-400 mb-6 text-lg">Get your resume match score and see exactly how competitive you are for your target role</p>
                    <div className="flex items-center gap-2 text-blue-400 font-semibold group-hover:gap-3 transition-all">
                      <span>Start Now</span>
                      <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>

                {/* Decorative Emoji Section */}
                <div className="flex items-center justify-center flex-1 h-96 md:h-auto">
                  <div className="text-9xl animate-bounce">📄</div>
                </div>
              </div>

              {/* Security & Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Security Card */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/40 rounded-xl p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-4xl">🔒</div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Your Data is Secure</h3>
                      <p className="text-gray-400 text-sm">Enterprise-grade encryption protects all your information</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <span className="text-lg">✓</span> Your data stays private (we don't sell it)
                    </div>
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <span className="text-lg">✓</span> Encrypted in transit and at rest
                    </div>
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <span className="text-lg">✓</span> Your resume is yours only
                    </div>
                  </div>
                </div>

                {/* Smart Features Card */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/40 rounded-xl p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-4xl">✨</div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Powerful Features</h3>
                      <p className="text-gray-400 text-sm">Real tools for real results</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                      <span className="text-lg">⚡</span> Real resume scoring against job postings
                    </div>
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                      <span className="text-lg">⚡</span> See exactly which skills are missing
                    </div>
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                      <span className="text-lg">⚡</span> Get personalized improvement tips
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="bg-[#0a0a0a] border border-white/6 rounded-2xl p-10">
                <h2 className="text-2xl font-bold text-white mb-8">🎯 How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { step: '1', title: 'Upload Resume', desc: 'Share your resume in seconds' },
                    { step: '2', title: 'Add Job Target', desc: 'Paste the job description' },
                    { step: '3', title: 'Get AI Analysis', desc: 'Instant matching & insights' },
                    { step: '4', title: 'Improve & Apply', desc: 'Get ready for success' },
                  ].map((item, i) => (
                    <div key={i} className="relative">
                      {i < 3 && (
                        <div className="hidden md:block absolute top-8 left-[60%] w-[80px] h-0.5 bg-gradient-to-r from-blue-600/50 to-transparent"></div>
                      )}
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-3 mx-auto">{item.step}</div>
                        <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                        <p className="text-gray-500 text-xs">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AnalysisPage onBack={handleBackHome} />
        )}
      </div>
    </div>
  );
}


