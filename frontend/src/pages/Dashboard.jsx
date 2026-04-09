import { useState } from 'react';
import AnalysisPage from '../components/AnalysisPage';
import AnalysisHistory from '../components/AnalysisHistory';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showHistory, setShowHistory] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);

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
          <div className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">

              {/* Welcome */}
              <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                  Welcome to <span className="text-blue-500">ResuWise</span> 👋
                </h1>
                <p className="text-gray-500 text-lg">
                  Ready to get AI-powered resume insights? Start by uploading your resume.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                {[
                  { 
                    icon: '📊', 
                    title: 'AI Analysis', 
                    desc: 'Get detailed resume-JD matching scores',
                    action: 'analyze'
                  },
                  { 
                    icon: '📋', 
                    title: 'History', 
                    desc: 'Access all your previous analyses',
                    action: 'history'
                  },
                  { 
                    icon: '🔒', 
                    title: 'Private', 
                    desc: 'All your data is encrypted and secure',
                    action: 'private'
                  },
                ].map((card, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (card.action === 'analyze') {
                        handleStartAnalysis();
                      } else if (card.action === 'history') {
                        setShowHistory(!showHistory);
                      }
                    }}
                    className={`bg-[#0a0a0a] border border-white/6 rounded-xl p-6 hover:border-blue-600/25 transition-all duration-200 ${
                      card.action !== 'private' ? 'cursor-pointer hover:bg-blue-600/5' : ''
                    }`}
                  >
                    <div className="text-3xl mb-3">{card.icon}</div>
                    <h3 className="text-white font-semibold mb-1">{card.title}</h3>
                    <p className="text-gray-600 text-sm">{card.desc}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center mb-16">
                <button
                  onClick={handleStartAnalysis}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-xl shadow-blue-600/25 hover:shadow-blue-500/35"
                >
                  🚀 Start Analysis
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { title: '✨ Smart Features', items: ['ATS Score Calculation', 'Skill Gap Analysis', 'Keyword Matching', 'Experience Scoring', 'PDF Download'] },
                  { title: '🎯 How It Works', items: ['Upload resume or paste text', 'Add job description', 'Get AI analysis instantly', 'Review recommendations', 'Download as PDF'] },
                ].map((panel, i) => (
                  <div key={i} className="bg-[#0a0a0a] border border-white/6 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">{panel.title}</h3>
                    <ul className="text-gray-500 space-y-2 text-sm">
                      {panel.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <span className="text-blue-600 text-xs">●</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
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


