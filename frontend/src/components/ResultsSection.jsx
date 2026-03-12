import React, { useState, useEffect } from 'react';
import { generatePDFReport } from '../utils/pdfGenerator';
import { generateImprovementSuggestions } from '../utils/suggestionGenerator';

export default function ResultsSection({ results, onBackToAnalysis, onHome }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [animateProgress, setAnimateProgress] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setAnimateProgress(true);
    // Generate suggestions based on results
    const generatedSuggestions = generateImprovementSuggestions(results);
    setSuggestions(generatedSuggestions);
    // Debug: log the results structure
    console.log('Results received:', results);
    console.log('ATS Breakdown:', results?.atsScoreBreakdown);
    console.log('Matched Skills:', results?.matchedSkills);
  }, [results]);

  // Extract data with backward compatibility
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

  // Helper to get color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

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

  const getScoreBg = (score) => {
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getScoreBgLight = (score) => {
    if (score >= 80) return 'bg-green-100 border-green-300';
    if (score >= 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  // Animated circular progress component
  const CircularProgress = ({ percentage, label }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={
                percentage >= 80
                  ? '#10b981'
                  : percentage >= 60
                  ? '#eab308'
                  : '#ef4444'
              }
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={animateProgress ? strokeDashoffset : circumference}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold ${getScoreColor(percentage)}`}>
              {Math.round(percentage)}%
            </div>
          </div>
        </div>
        <p className="mt-4 text-center font-semibold text-gray-700">{label}</p>
      </div>
    );
  };

  // Get all matched skills or use backward compatibility
  let allMatchedSkills = {};
  let allMissingSkills = {};
  
  try {
    allMatchedSkills = (matchedSkills && Object.values(matchedSkills).flat().length > 0)
      ? matchedSkills
      : (extractedResumeSkills && Object.values(extractedResumeSkills).flat().length > 0)
      ? extractedResumeSkills
      : {};

    allMissingSkills = (missingSkills && Object.values(missingSkills).flat().length > 0)
      ? missingSkills
      : missingKeywords && missingKeywords.length > 0
      ? { 'Missing Skills': missingKeywords }
      : {};
  } catch (err) {
    console.error('Error processing skills:', err);
    allMatchedSkills = matchedSkills || {};
    allMissingSkills = missingSkills || {};
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'matched', label: 'Matched Skills', icon: '✅' },
    { id: 'missing', label: 'Missing Skills', icon: '⚠️' },
    { id: 'ats', label: 'ATS Insights', icon: '🔍' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={onBackToAnalysis}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all hover:shadow-lg"
            >
              ← Back to Analysis
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all hover:shadow-lg disabled:opacity-50"
            >
              {isDownloading ? '⏳ Generating PDF...' : '📄 Download Report'}
            </button>
            <button
              onClick={onHome}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all hover:shadow-lg"
            >
              🏠 Back to Home
            </button>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            ✨ Analysis Results
          </h2>
          <p className="text-gray-300">
            Your comprehensive resume-job description matching analysis
          </p>
        </div>

        {/* Main Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Match Percentage Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all">
            <CircularProgress
              percentage={matchPercentage}
              label="Resume Match Score"
            />
            <p className="text-center text-sm text-gray-600 mt-4">
              {matchPercentage >= 80
                ? '🎉 Excellent Match!'
                : matchPercentage >= 60
                ? '👍 Good Match'
                : '⚠️ Needs Improvement'}
            </p>
          </div>

          {/* ATS Score Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all">
            <CircularProgress
              percentage={atsScore}
              label="ATS Compatibility"
            />
            <p className="text-center text-sm text-gray-600 mt-4">
              Keyword density & system optimization
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-4 font-semibold transition-all text-sm md:text-base ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-b-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Experience Section */}
                {experience && experience.resumeYears && (
                  <div className={`p-6 rounded-xl border-2 ${getScoreBgLight(experience.matchScore)}`}>
                    <h4 className="font-bold text-gray-800 mb-3">💼 Experience Match</h4>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Your Experience</p>
                        <p className="text-2xl font-bold text-gray-800">{experience.resumeYears?.join(', ') || 'N/A'}</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className={`text-3xl ${experience.isQualified ? 'text-green-600' : 'text-red-600'}`}>
                          {experience.isQualified ? '✓' : '✗'}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Required</p>
                        <p className="text-2xl font-bold text-gray-800">{experience.requiredYears?.join(', ') || 'N/A'}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 font-semibold">{experience.message}</p>
                  </div>
                )}

                {/* Score Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800">📈 Score Breakdown</h4>
                  {atsScoreBreakdown && atsScoreBreakdown.keywordDensity !== undefined ? (
                    <>
                      {/* Keyword Density */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            Keyword Density (40%)
                          </span>
                          <span className="text-sm font-bold text-gray-800">
                            {atsScoreBreakdown.keywordDensity}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all duration-1000"
                            style={{
                              width: animateProgress ? `${atsScoreBreakdown.keywordDensity}%` : '0%'
                            }}
                          />
                        </div>
                      </div>

                      {/* Skills Presence */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            Skills Presence (30%)
                          </span>
                          <span className="text-sm font-bold text-gray-800">
                            {atsScoreBreakdown.skillsPresence}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-400 to-purple-600 h-full transition-all duration-1000"
                            style={{
                              width: animateProgress ? `${atsScoreBreakdown.skillsPresence}%` : '0%'
                            }}
                          />
                        </div>
                      </div>

                      {/* Section Detection */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            Section Detection (20%)
                          </span>
                          <span className="text-sm font-bold text-gray-800">
                            {atsScoreBreakdown.sectionDetection && atsScoreBreakdown.sectionDetection.score}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-1000"
                            style={{
                              width: animateProgress ? `${atsScoreBreakdown.sectionDetection && atsScoreBreakdown.sectionDetection.score}%` : '0%'
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Sections found: {atsScoreBreakdown.sectionDetection && atsScoreBreakdown.sectionDetection.detected && atsScoreBreakdown.sectionDetection.detected.join(', ') || 'None'}
                        </p>
                      </div>

                      {/* Formatting */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            Formatting Quality (10%)
                          </span>
                          <span className="text-sm font-bold text-gray-800">
                            {atsScoreBreakdown.formattingIndicators}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-orange-400 to-orange-600 h-full transition-all duration-1000"
                            style={{
                              width: animateProgress ? `${atsScoreBreakdown.formattingIndicators}%` : '0%'
                            }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600">ATS breakdown data not available</p>
                  )}
                </div>

                {/* Insights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-bold text-gray-800 mb-2">🎯 Assessment</p>
                    <p className="text-sm text-gray-700">
                      {matchPercentage >= 80
                        ? 'Your resume is well-aligned with the job. Consider applying!'
                        : matchPercentage >= 60
                        ? 'Good alignment. Minor optimizations could help.'
                        : 'Consider updating to better match requirements.'}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="font-bold text-gray-800 mb-2">🚀 Next Steps</p>
                    <p className="text-sm text-gray-700">
                      {missingKeywords.length > 0
                        ? `Focus on: ${missingKeywords.slice(0, 2).join(', ')}`
                        : 'Your resume is comprehensive!'}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-bold text-gray-800 mb-2">📊 Coverage</p>
                    <p className="text-sm text-gray-700">
                      {Math.round((Object.values(allMatchedSkills).flat().length / (Object.values(allMissingSkills).flat().length + Object.values(allMatchedSkills).flat().length || 1)) * 100)}% skills coverage • {Object.values(allMissingSkills).flat().length} gaps
                    </p>
                  </div>
                </div>

                {/* Improvement Suggestions */}
                {suggestions && suggestions.length > 0 && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                      💡 Improvement Suggestions
                    </h4>
                    <ul className="space-y-3">
                      {suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="text-amber-600 font-bold min-w-fit">→</span>
                          <span className="text-gray-700 text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Matched Skills Tab */}
            {activeTab === 'matched' && (
              <div className="space-y-4 animate-fadeIn">
                {(() => {
                  try {
                    const hasSkills = allMatchedSkills && Object.entries(allMatchedSkills).some(([_, skills]) => Array.isArray(skills) && skills.length > 0);
                    if (hasSkills) {
                      return Object.entries(allMatchedSkills).map(([category, skills]) => {
                        if (!Array.isArray(skills) || skills.length === 0) return null;
                        return (
                          <div key={category} className="border border-green-200 rounded-lg p-4 bg-green-50">
                            <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                              ✅ {category}
                              <span className="bg-green-200 text-green-900 text-xs font-bold px-2 py-1 rounded-full">
                                {skills.length}
                              </span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-4 py-2 bg-green-100 text-green-900 rounded-full text-sm font-semibold hover:bg-green-200 transition-all"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    } else {
                      return (
                        <div className="p-6 text-center text-gray-500">
                          <p>No matched skills found</p>
                        </div>
                      );
                    }
                  } catch (err) {
                    console.error('Error rendering matched skills:', err);
                    return (
                      <div className="p-6 text-center text-red-500">
                        <p>Error loading matched skills. Please try again.</p>
                      </div>
                    );
                  }
                })()}
              </div>
            )}

            {/* Missing Skills Tab */}
            {activeTab === 'missing' && (
              <div className="space-y-4 animate-fadeIn">
                {Object.keys(allMissingSkills).length > 0 &&
                Object.values(allMissingSkills).flat().length > 0 ? (
                  Object.entries(allMissingSkills).map(([category, skills]) => (
                    skills.length > 0 && (
                      <div key={category} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                          ⚠️ {category}
                          <span className="bg-red-200 text-red-900 text-xs font-bold px-2 py-1 rounded-full">
                            {skills.length}
                          </span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-red-100 text-red-900 rounded-full text-sm font-semibold hover:bg-red-200 transition-all"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <div className="p-6 text-center text-green-600">
                    <p>🎉 No missing skills! You have everything required.</p>
                  </div>
                )}
              </div>
            )}

            {/* ATS Insights Tab */}
            {activeTab === 'ats' && (
              <div className="space-y-4 animate-fadeIn">
                {(() => {
                  try {
                    const hasAtsData = atsScoreBreakdown && 
                      (atsScoreBreakdown.keywordDensity !== undefined || atsScoreBreakdown.breakdown?.keywordDensity !== undefined);
                    
                    if (hasAtsData) {
                      // Handle both direct and nested breakdown structures
                      const breakdown = atsScoreBreakdown.breakdown || atsScoreBreakdown;
                      
                      return (
                        <>
                          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                            <h4 className="font-bold text-gray-800 mb-4">🔍 ATS Score Analysis</h4>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700 font-semibold">Final ATS Score:</span>
                                <span className={`text-3xl font-bold ${getScoreColor(atsScore)}`}>
                                  {atsScore}%
                                </span>
                              </div>

                              <div className="pt-4 border-t border-blue-200">
                                <p className="text-sm text-gray-600 mb-3">Score Composition:</p>
                                <ul className="space-y-2 text-sm">
                                  <li className="flex justify-between">
                                    <span className="text-gray-700">• Keyword Density (40%)</span>
                                    <span className="font-bold text-blue-600">{breakdown?.keywordDensity || 'N/A'}</span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span className="text-gray-700">• Skills Presence (30%)</span>
                                    <span className="font-bold text-purple-600">{breakdown?.skillsPresence || 'N/A'}</span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span className="text-gray-700">• Section Detection (20%)</span>
                                    <span className="font-bold text-green-600">{breakdown?.sectionDetection?.score || 'N/A'}</span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span className="text-gray-700">• Formatting Quality (10%)</span>
                                    <span className="font-bold text-orange-600">{breakdown?.formattingIndicators || 'N/A'}</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="font-bold text-gray-800 mb-3">💡 Recommendations</h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                              {breakdown?.keywordDensity < 70 && (
                                <li>• ⚠️ Increase keyword density: Add more relevant technical terms from the job description</li>
                              )}
                              {breakdown?.skillsPresence < 70 && (
                                <li>• ⚠️ Highlight more required skills: Ensure all relevant skills are visible</li>
                              )}
                              {breakdown?.sectionDetection?.score < 70 && (
                                <li>• ⚠️ Add standard sections: Include Education, Experience, Skills sections</li>
                              )}
                              {breakdown?.formattingIndicators < 70 && (
                                <li>• ⚠️ Improve formatting: Use bullet points and clear section headers</li>
                              )}
                              {atsScore >= 80 && (
                                <li>✅ Great job! Your resume is well-optimized for ATS systems</li>
                              )}
                            </ul>
                          </div>
                        </>
                      );
                    } else {
                      return <p className="text-gray-600">ATS insights not available - please check console for details</p>;
                    }
                  } catch (err) {
                    console.error('Error rendering ATS insights:', err, 'atsScoreBreakdown:', atsScoreBreakdown);
                    return <p className="text-red-600">Error loading ATS insights. Check console for details.</p>;
                  }
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
