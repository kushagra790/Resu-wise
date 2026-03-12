import { useState } from 'react';
import AnalysisPage from '../components/AnalysisPage';
import AnalysisHistory from '../components/AnalysisHistory';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showHistory, setShowHistory] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);

  const handleStartAnalysis = () => {
    setCurrentPage('analysis');
  };

  const handleBackHome = () => {
    setCurrentPage('home');
    setShowHistory(false);
  };

  const handleSelectAnalysis = (analysisData) => {
    // Store the analysis data in a way that AnalysisPage can restore it
    sessionStorage.setItem('restoredAnalysis', JSON.stringify(analysisData));
    setCurrentPage('analysis');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-purple-950 flex">
      {/* History Sidebar */}
      {showHistory && (
        <AnalysisHistory 
          onSelectAnalysis={handleSelectAnalysis}
          currentAnalysisId={currentAnalysisId}
        />
      )}
      
      {/* Main Content */}
      <div className={`flex-1 transition-all ${showHistory ? 'ml-80' : ''}`}>
        {currentPage === 'home' ? (
          <div className="min-h-screen bg-gradient-to-br from-slate-950 to-purple-950 p-8">
            <div className="max-w-4xl mx-auto">
              {/* Welcome Section */}
              <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                  Welcome to ResuWise! 👋
                </h1>
                <p className="text-purple-300 text-lg">
                  Ready to get AI-powered resume insights? Start by uploading your resume or pasting text.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/50 transition-all">
                  <div className="text-3xl font-black mb-2">📊</div>
                  <h3 className="text-white font-semibold mb-2">AI Analysis</h3>
                  <p className="text-purple-300 text-sm">Get detailed resume-JD matching scores</p>
                </div>

                <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/50 transition-all">
                  <div className="text-3xl font-black mb-2">📋</div>
                  <h3 className="text-white font-semibold mb-2">History</h3>
                  <p className="text-purple-300 text-sm">Access all your previous analyses</p>
                </div>

                <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/50 transition-all">
                  <div className="text-3xl font-black mb-2">🔒</div>
                  <h3 className="text-white font-semibold mb-2">Private</h3>
                  <p className="text-purple-300 text-sm">All your data is encrypted and secure</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button
                  onClick={handleStartAnalysis}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold text-lg rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 transform hover:-translate-y-1"
                >
                  🚀 Start Analysis
                </button>
              </div>

              {/* Features Section */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/30 border border-purple-500/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-3">✨ Smart Features</h3>
                  <ul className="text-purple-300 space-y-2 text-sm">
                    <li>✓ ATS Score Calculation</li>
                    <li>✓ Skill Gap Analysis</li>
                    <li>✓ Keyword Matching</li>
                    <li>✓ Experience Scoring</li>
                    <li>✓ PDF Download</li>
                  </ul>
                </div>

                <div className="bg-slate-900/30 border border-purple-500/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-3">🎯 How It Works</h3>
                  <ul className="text-purple-300 space-y-2 text-sm">
                    <li>1. Upload resume or paste text</li>
                    <li>2. Add job description</li>
                    <li>3. Get AI analysis instantly</li>
                    <li>4. Review recommendations</li>
                    <li>5. Download as PDF</li>
                  </ul>
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
