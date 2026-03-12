import React, { useState, useEffect } from 'react';
import {
  getAnalysisHistory,
  deleteAnalysisFromHistory,
  clearAllHistory,
  exportHistoryAsJSON
} from '../utils/storageManager';

export default function AnalysisHistory({ onSelectAnalysis, currentAnalysisId }) {
  const [history, setHistory] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = getAnalysisHistory();
    setHistory(data);
  };

  const handleDelete = (id) => {
    deleteAnalysisFromHistory(id);
    loadHistory();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all analysis history? This cannot be undone.')) {
      clearAllHistory();
      setHistory([]);
      setShowConfirm(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-slate-900 to-purple-950 shadow-2xl overflow-y-auto z-40 border-r border-purple-500/30">
      <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow">
        <h3 className="text-lg font-bold">📋 Analysis History</h3>
        <p className="text-sm text-purple-100 mt-1">Your recent analyses</p>
      </div>

      <div className="p-4 space-y-3">
        {history.length > 0 ? (
          <>
            {history.map((analysis) => (
              <div
                key={analysis.id}
                onClick={() => onSelectAnalysis(analysis.fullResults)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  currentAnalysisId === analysis.id
                    ? 'bg-purple-500/20 border-purple-500 shadow-md'
                    : 'bg-slate-800/50 border-purple-500/30 hover:border-purple-500/60'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs text-purple-300">{analysis.dateForDisplay}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(analysis.id);
                    }}
                    className="text-purple-400 hover:text-red-500 transition"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-purple-200">Match:</span>
                    <span className={`text-sm font-bold ${getScoreColor(analysis.matchPercentage)}`}>
                      {analysis.matchPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-purple-200">ATS:</span>
                    <span className={`text-sm font-bold ${getScoreColor(analysis.atsScore)}`}>
                      {analysis.atsScore}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-purple-300 truncate">
                  Resume: {analysis.resumePreview}
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-purple-500/30 space-y-2">
              <button
                onClick={() => exportHistoryAsJSON()}
                className="w-full px-3 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/40 border border-green-500/40 rounded-lg transition text-sm font-semibold"
              >
                📥 Export as JSON
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 border border-red-500/40 rounded-lg transition text-sm font-semibold"
              >
                🗑️ Clear History
              </button>
            </div>

            {showConfirm && (
              <div className="mt-2 p-3 bg-red-950/30 border border-red-500/50 rounded">
                <p className="text-sm text-red-300 mb-2">Delete all history?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearAll}
                    className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-2 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold rounded transition"
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-purple-400 text-sm">No analyses yet</p>
            <p className="text-purple-300/60 text-xs mt-2">Your analyses will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
