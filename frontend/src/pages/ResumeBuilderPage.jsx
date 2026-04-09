import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResumeBuilderPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-black flex flex-col">
      {/* Header with Go to Dashboard Button */}
      <div className="bg-black/95 border-b border-blue-600/20 backdrop-blur-xl px-4 py-3 flex justify-between items-center">
        <div className="text-white">
          <h1 className="text-lg font-bold">Resume Builder</h1>
          <p className="text-xs text-gray-400">Create and customize your resume</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40"
        >
          <span className="text-base">📊</span>
          Go to Dashboard
        </button>
      </div>

      {/* iframe to load the Resume Builder HTML application */}
      <iframe
        src="/resume-builder/resume-builder.html"
        title="Resume Builder"
        className="w-full flex-1 border-none"
        style={{ minHeight: 'calc(100vh - 80px)' }}
      />
    </div>
  );
}
