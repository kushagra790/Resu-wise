import React, { useState, useEffect } from 'react';
import { generatePDFReport } from '../utils/pdfGenerator';
import { generateImprovementSuggestions } from '../utils/suggestionGenerator';

export default function ResultsSection({ results, onBackToAnalysis, onHome }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [animateProgress, setAnimateProgress] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setAnimateProgress(true);
    const generatedSuggestions = generateImprovementSuggestions(results);
    setSuggestions(generatedSuggestions);
  }, [results]);

  const {
    matchPercentage = 0,
    atsScore = 0,
    atsScoreBreakdown = {},
    matchedSkills = {},
    missingSkills = {},
    extractedResumeSkills = {},
    extractedJDSkills = {},
    experience = {},
    missingKeywords = [],
    allRequiredSkills = [],
    providedSkills = []
  } = results;

  console.log('[ResultsSection] Received results:', {
    matchPercentage,
    atsScore,
    hasMatchPercentage: results.hasOwnProperty('matchPercentage'),
    allKeys: Object.keys(results)
  });

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `ResuWise-Analysis-${timestamp}`;
      generatePDFReport(results, fileName);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreRing = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return { text: 'Excellent Match', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 60) return { text: 'Good Match', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    return { text: 'Needs Work', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
  };

  // Circular progress ring
  const CircularProgress = ({ percentage, label, sublabel }) => {
    const radius = 46;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    const ringColor = getScoreRing(percentage);
    const scoreLabel = getScoreLabel(percentage);

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#ffffff08" strokeWidth="8" />
            <circle
              cx="60" cy="60" r={radius} fill="none"
              stroke={ringColor} strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={animateProgress ? offset : circumference}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ filter: `drop-shadow(0 0 8px ${ringColor}60)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(percentage)}`}>{Math.round(percentage)}%</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-sm">{label}</p>
          {sublabel && <p className="text-gray-500 text-xs mt-0.5">{sublabel}</p>}
          <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full border font-medium ${scoreLabel.bg} ${scoreLabel.color}`}>
            {scoreLabel.text}
          </span>
        </div>
      </div>
    );
  };

  // Progress bar row
  const ScoreBar = ({ label, weight, value, color }) => (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-gray-400">{label} <span className="text-gray-600">({weight})</span></span>
        <span className="text-sm font-bold text-white">{value ?? 'N/A'}{value !== undefined ? '%' : ''}</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: animateProgress && value !== undefined ? `${value}%` : '0%' }}
        />
      </div>
    </div>
  );

  let allMatchedSkills = {};
  let allMissingSkills = {};
  try {
    allMatchedSkills = matchedSkills && Object.values(matchedSkills).flat().length > 0
      ? matchedSkills
      : extractedResumeSkills && Object.values(extractedResumeSkills).flat().length > 0
      ? extractedResumeSkills : {};
    allMissingSkills = missingSkills && Object.values(missingSkills).flat().length > 0
      ? missingSkills
      : missingKeywords?.length > 0 ? { 'Missing Skills': missingKeywords } : {};
  } catch (e) {
    allMatchedSkills = matchedSkills || {};
    allMissingSkills = missingSkills || {};
  }

  const totalMatched = Object.values(allMatchedSkills).flat().length;
  const totalMissing = Object.values(allMissingSkills).flat().length;
  const coveragePct = Math.round((totalMatched / (totalMatched + totalMissing || 1)) * 100);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'matched', label: 'Matched', icon: '✅' },
    { id: 'missing', label: 'Missing', icon: '⚠️' },
    { id: 'ats', label: 'ATS Insights', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={onBackToAnalysis}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 border border-white/8 hover:border-white/15 hover:text-white transition-all duration-200"
            >
              ← Back to Analysis
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-400 border border-blue-600/30 hover:bg-blue-600/10 hover:border-blue-500/50 transition-all duration-200 disabled:opacity-40"
            >
              {isDownloading ? '⏳ Generating...' : '📄 Download PDF'}
            </button>
            <button
              onClick={onHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all duration-200"
            >
              🏠 Home
            </button>
          </div>
          <h2 className="text-3xl font-bold text-white">
            Analysis <span className="text-blue-500">Results</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Your resume-job description matching report</p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-[#0a0a0a] border border-white/6 rounded-xl p-8 flex items-center justify-center hover:border-blue-600/25 transition-all duration-200">
            {console.log('[CircularProgress] Displaying matchPercentage:', matchPercentage)}
            <CircularProgress percentage={matchPercentage} label="Resume Match Score" sublabel="Combined semantic + ATS analysis" />
          </div>
          <div className="bg-[#0a0a0a] border border-white/6 rounded-xl p-8 flex items-center justify-center hover:border-blue-600/25 transition-all duration-200">
            {console.log('[CircularProgress] Displaying atsScore:', atsScore)}
            <CircularProgress percentage={atsScore} label="ATS Compatibility" sublabel="Skills, keywords & formatting" />
          </div>
        </div>

        {/* Tab Panel */}
        <div className="bg-[#0a0a0a] border border-white/6 rounded-xl overflow-hidden">

          {/* Tab Nav */}
          <div className="flex border-b border-white/6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600/15 text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/3 border-b-2 border-transparent'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">

            {/* ── Overview ── */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">

                {/* Experience */}
                {experience?.resumeYears?.length > 0 && (
                  <div className={`p-5 rounded-xl border ${experience.isQualified ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      💼 Experience Match
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Your Experience</p>
                        <p className="text-2xl font-bold text-white">{experience.resumeYears?.join(', ')} <span className="text-sm text-gray-400">yrs</span></p>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${experience.isQualified ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                          {experience.isQualified ? '✓' : '✗'}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Required</p>
                        <p className="text-2xl font-bold text-white">{experience.requiredYears?.join(', ')} <span className="text-sm text-gray-400">yrs</span></p>
                      </div>
                    </div>
                    <p className={`text-sm mt-3 font-medium ${experience.isQualified ? 'text-emerald-400' : 'text-red-400'}`}>{experience.message}</p>
                  </div>
                )}

                {/* Score Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white flex items-center gap-2">📈 Score Breakdown</h4>
                  {atsScoreBreakdown?.keywordDensity !== undefined ? (
                    <div className="space-y-3">
                      <ScoreBar label="Keyword Density" weight="40%" value={atsScoreBreakdown.keywordDensity} color="bg-gradient-to-r from-blue-600 to-blue-400" />
                      <ScoreBar label="Skills Presence" weight="30%" value={atsScoreBreakdown.skillsPresence} color="bg-gradient-to-r from-violet-600 to-violet-400" />
                      <ScoreBar label="Section Detection" weight="20%" value={atsScoreBreakdown.sectionDetection?.score} color="bg-gradient-to-r from-emerald-600 to-emerald-400" />
                      <ScoreBar label="Formatting Quality" weight="10%" value={atsScoreBreakdown.formattingIndicators} color="bg-gradient-to-r from-amber-600 to-amber-400" />
                      {atsScoreBreakdown.sectionDetection?.detected?.length > 0 && (
                        <p className="text-xs text-gray-600 pt-1">
                          Sections found: <span className="text-gray-400">{atsScoreBreakdown.sectionDetection.detected.join(', ')}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">ATS breakdown data not available</p>
                  )}
                </div>

                {/* Quick Insight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 bg-[#0d0d0d] border-l-2 border-blue-500 rounded-r-xl rounded-l-sm">
                    <p className="text-xs text-gray-500 mb-1">🎯 Assessment</p>
                    <p className="text-sm text-gray-300">
                      {matchPercentage >= 80 ? 'Well-aligned — consider applying!' : matchPercentage >= 60 ? 'Good fit. Minor optimizations could help.' : 'Update resume to better match requirements.'}
                    </p>
                  </div>
                  <div className="p-4 bg-[#0d0d0d] border-l-2 border-violet-500 rounded-r-xl rounded-l-sm">
                    <p className="text-xs text-gray-500 mb-1">🚀 Next Steps</p>
                    <p className="text-sm text-gray-300">
                      {missingKeywords.length > 0 ? `Add: ${missingKeywords.slice(0, 2).join(', ')}` : 'Your resume is comprehensive!'}
                    </p>
                  </div>
                  <div className="p-4 bg-[#0d0d0d] border-l-2 border-emerald-500 rounded-r-xl rounded-l-sm">
                    <p className="text-xs text-gray-500 mb-1">📊 Coverage</p>
                    <p className="text-sm text-gray-300">{coveragePct}% skills covered · <span className="text-red-400">{totalMissing} gap{totalMissing !== 1 ? 's' : ''}</span></p>
                  </div>
                </div>

                {/* Improvement Suggestions */}
                {suggestions?.length > 0 && (
                  <div className="p-5 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                    <h4 className="font-semibold text-amber-400 mb-3 flex items-center gap-2 text-sm">💡 Improvement Suggestions</h4>
                    <ul className="space-y-2">
                      {suggestions.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-400">
                          <span className="text-amber-500 font-bold shrink-0">→</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── Matched Skills ── */}
            {activeTab === 'matched' && (
              <div className="space-y-4 animate-fadeIn">
                {Object.entries(allMatchedSkills).some(([, s]) => Array.isArray(s) && s.length > 0) ? (
                  Object.entries(allMatchedSkills).map(([category, skills]) => {
                    if (!Array.isArray(skills) || skills.length === 0) return null;
                    return (
                      <div key={category} className="bg-[#0d0d0d] border border-emerald-500/15 rounded-xl p-5">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
                          <span className="text-emerald-400">✅</span> {category}
                          <span className="ml-auto bg-emerald-500/15 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {skills.length}
                          </span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-emerald-500/8 text-emerald-300 border border-emerald-500/20 rounded-full text-xs font-medium hover:bg-emerald-500/15 transition-colors">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-600">
                    <p className="text-3xl mb-2">🔍</p>
                    <p>No matched skills found</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Missing Skills ── */}
            {activeTab === 'missing' && (
              <div className="space-y-4 animate-fadeIn">
                {Object.values(allMissingSkills).flat().length > 0 ? (
                  Object.entries(allMissingSkills).map(([category, skills]) =>
                    skills.length > 0 && (
                      <div key={category} className="bg-[#0d0d0d] border border-red-500/15 rounded-xl p-5">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
                          <span className="text-red-400">⚠️</span> {category}
                          <span className="ml-auto bg-red-500/15 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full border border-red-500/20">
                            {skills.length}
                          </span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-red-500/8 text-red-300 border border-red-500/20 rounded-full text-xs font-medium hover:bg-red-500/15 transition-colors">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="p-8 text-center text-gray-600">
                    <p className="text-3xl mb-2">🎉</p>
                    <p className="text-emerald-400 font-medium">No missing skills! You have everything required.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── ATS Insights ── */}
            {activeTab === 'ats' && (
              <div className="space-y-4 animate-fadeIn">
                {atsScoreBreakdown?.keywordDensity !== undefined ? (() => {
                  const bd = atsScoreBreakdown.breakdown || atsScoreBreakdown;
                  return (
                    <>
                      <div className="bg-[#0d0d0d] border border-blue-600/20 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-5">
                          <h4 className="font-semibold text-white text-sm">🔍 ATS Score Analysis</h4>
                          <span className={`text-2xl font-bold ${getScoreColor(atsScore)}`}>{atsScore}%</span>
                        </div>
                        <div className="space-y-3">
                          {[
                            { label: 'Keyword Density', weight: '40%', val: bd?.keywordDensity, color: 'text-blue-400' },
                            { label: 'Skills Presence', weight: '30%', val: bd?.skillsPresence, color: 'text-violet-400' },
                            { label: 'Section Detection', weight: '20%', val: bd?.sectionDetection?.score, color: 'text-emerald-400' },
                            { label: 'Formatting Quality', weight: '10%', val: bd?.formattingIndicators, color: 'text-amber-400' },
                          ].map((row) => (
                            <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/4 last:border-0">
                              <span className="text-sm text-gray-400">{row.label} <span className="text-gray-600 text-xs">({row.weight})</span></span>
                              <span className={`font-bold text-sm ${row.color}`}>{row.val ?? 'N/A'}{row.val !== undefined ? '%' : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#0d0d0d] border border-white/6 rounded-xl p-5">
                        <h4 className="font-semibold text-white text-sm mb-3">💡 Recommendations</h4>
                        <ul className="space-y-2">
                          {bd?.keywordDensity < 70 && <li className="text-sm text-gray-400 flex gap-2"><span className="text-yellow-500">⚠️</span> Increase keyword density — add relevant technical terms from the JD</li>}
                          {bd?.skillsPresence < 70 && <li className="text-sm text-gray-400 flex gap-2"><span className="text-yellow-500">⚠️</span> Highlight more required skills — ensure all relevant skills are visible</li>}
                          {bd?.sectionDetection?.score < 70 && <li className="text-sm text-gray-400 flex gap-2"><span className="text-yellow-500">⚠️</span> Add standard sections — Education, Experience, Skills</li>}
                          {bd?.formattingIndicators < 70 && <li className="text-sm text-gray-400 flex gap-2"><span className="text-yellow-500">⚠️</span> Improve formatting — use bullet points and clear section headers</li>}
                          {atsScore >= 80 && <li className="text-sm text-emerald-400 flex gap-2"><span>✅</span> Great job! Your resume is well-optimized for ATS systems</li>}
                        </ul>
                      </div>
                    </>
                  );
                })() : (
                  <p className="text-gray-600 text-sm">ATS insights not available</p>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
