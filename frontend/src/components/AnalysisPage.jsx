import { useState, useRef } from 'react';
import axios from 'axios';
import ResultsSection from './ResultsSection';
import { saveAnalysisToHistory } from '../utils/storageManager';

export default function AnalysisPage({ onBack }) {
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'file'
  
  // Text mode state
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // File mode state
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescFile, setJobDescFile] = useState(null);
  const [resumeDragging, setResumeDragging] = useState(false);
  const [jobDescDragging, setJobDescDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const resumeFileRef = useRef(null);
  const jobDescFileRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isValidFile = (file) => {
    if (!file) return false;
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const validExt = file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.docx');
    return validTypes.includes(file.type) || validExt;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileDrop = (e, setter, setDragging) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      setter(file);
      setError(null);
    } else {
      setError('Invalid file type. Only PDF and DOCX are supported.');
    }
  };

  const handleFileSelect = (e, setter) => {
    const file = e.target.files[0];
    if (file && isValidFile(file)) {
      setter(file);
      setError(null);
    } else if (file) {
      setError('Invalid file type. Only PDF and DOCX are supported.');
    }
  };

  // ── Analyze ───────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    setError(null);

    if (inputMode === 'text') {
      if (!resume.trim()) { setError('Please paste your resume'); return; }
      if (!jobDescription.trim()) { setError('Please paste the job description'); return; }

      setLoading(true);
      try {
        const response = await axios.post(
          'http://localhost:5000/api/analyze/text',
          { resume: resume.trim(), jobDescription: jobDescription.trim() },
          { headers: { 'Content-Type': 'application/json' } }
        );
        if (response.data.success) {
          setResults(response.data.data);
          saveAnalysisToHistory(response.data.data, resume.trim(), jobDescription.trim());
        } else {
          setError(response.data.error || 'Analysis failed');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to connect to server.');
      } finally {
        setLoading(false);
      }
    } else {
      // File mode
      if (!resumeFile) { setError('Please upload your resume file'); return; }
      if (!jobDescFile) { setError('Please upload the job description file'); return; }

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jobDescription', jobDescFile);

        // Note: Don't set Content-Type header manually - axios handles it automatically
        // Setting it manually prevents axios from adding the boundary parameter
        const response = await axios.post(
          'http://localhost:5000/api/analyze/upload',
          formData
        );

        if (response.data.success) {
          setResults(response.data.data);
          saveAnalysisToHistory(response.data.data, `[File: ${resumeFile.name}]`, `[File: ${jobDescFile.name}]`);
        } else {
          setError(response.data.error || 'Analysis failed');
        }
      } catch (err) {
        console.error('File upload error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to process files.');
      } finally {
        setLoading(false);
      }
    }
  };

  // ── Sample Data ───────────────────────────────────────────────────────────
  const loadSample = () => {
    setInputMode('text');
    setResume(`Senior Software Engineer

PROFESSIONAL SUMMARY
Experienced Senior Software Engineer with 5+ years of expertise in full-stack web development, cloud architecture, and team leadership.

TECHNICAL SKILLS
Programming Languages: JavaScript, Python, Java, TypeScript
Web Development: React, Angular, Vue.js, Node.js, Express
Databases: PostgreSQL, MongoDB, Redis, Firebase
Cloud & DevOps: AWS, Docker, Kubernetes, GitHub Actions

PROFESSIONAL EXPERIENCE
Senior Developer | Tech Company (2022 - Present)
- Architected and deployed microservices using Docker and Kubernetes on AWS
- Led team of 4 developers, conducting code reviews and mentoring
- Improved application performance by 40% through optimization

Full Stack Developer | StartUp Inc (2020 - 2022)
- Built responsive web applications using React and Node.js
- Managed AWS infrastructure and deployment automation

EDUCATION
Bachelor of Engineering in Computer Science
University of Technology, 2019

CERTIFICATIONS
- AWS Solutions Architect Associate
- Kubernetes Certified Application Developer`);
    setJobDescription(`Senior Full Stack Engineer

RESPONSIBILITIES
- Design and implement scalable microservices architecture
- Lead development of React-based front-end applications
- Manage AWS cloud infrastructure and DevOps practices
- Mentor and code review junior developers

REQUIRED SKILLS
- 5+ years of professional software development experience
- Expert-level JavaScript and TypeScript proficiency
- Strong React and Node.js experience
- Cloud infrastructure (AWS, Azure, or GCP)
- Docker and Kubernetes experience
- Database design (SQL and NoSQL)

NICE-TO-HAVE
- Python programming
- Redis caching experience`);
    setError(null);
  };

  // ── File Upload Card ──────────────────────────────────────────────────────
  const FileCard = ({ label, icon, file, setFile, dragging, setDragging, inputRef, field }) => (
    <div className="bg-[#0a0a0a] border border-white/6 rounded-xl p-6 hover:border-blue-600/25 transition-all duration-200">
      <label className="block text-sm font-semibold text-white mb-3">{icon} {label}</label>

      {file ? (
        /* File selected – show info */
        <div className="flex items-center gap-4 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-xl flex-shrink-0">
            {file.name.endsWith('.pdf') ? '📄' : '📝'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{file.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)}</p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-gray-500 hover:text-red-400 text-lg transition-colors flex-shrink-0"
            title="Remove file"
          >✕</button>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => handleFileDrop(e, setFile, setDragging)}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center h-44 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 select-none ${
            dragging
              ? 'border-blue-500 bg-blue-600/10 scale-[1.01]'
              : 'border-white/10 hover:border-blue-600/40 hover:bg-white/[0.02]'
          }`}
        >
          <div className="text-4xl mb-3 opacity-60">{dragging ? '📂' : '⬆️'}</div>
          <p className="text-sm font-medium text-gray-400">
            {dragging ? 'Drop it here!' : 'Drag & drop or click to browse'}
          </p>
          <p className="text-xs text-gray-600 mt-1">PDF or DOCX · Max 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => handleFileSelect(e, setFile)}
          />
        </div>
      )}

      <p className="text-xs text-gray-600 mt-2">
        {field === 'resume' ? 'Include skills, experience, education, and certifications' : 'Include title, responsibilities, requirements, and qualifications'}
      </p>
    </div>
  );

  // ── Results view ──────────────────────────────────────────────────────────
  if (results) {
    return (
      <ResultsSection
        results={results}
        onBackToAnalysis={() => setResults(null)}
        onHome={onBack}
      />
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200"
            >
              ← Back to Dashboard
            </button>
          </div>
          <h2 className="text-3xl font-bold text-white">
            Resume <span className="text-blue-500">Analysis Engine</span>
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Paste text or upload your resume &amp; job description to get intelligent match insights
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex mb-6 gap-1 p-1 bg-white/[0.04] border border-white/8 rounded-xl w-fit">
          <button
            onClick={() => { setInputMode('text'); setError(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              inputMode === 'text'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ✏️ Paste Text
          </button>
          <button
            onClick={() => { setInputMode('file'); setError(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              inputMode === 'file'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📁 Upload Document
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 flex items-start gap-3">
            <span className="text-lg mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold text-sm">Error</p>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {inputMode === 'text' ? (
            <>
              {/* Resume Text */}
              <div className="bg-[#0a0a0a] border border-white/6 rounded-xl p-6 hover:border-blue-600/25 transition-all duration-200">
                <label className="block text-sm font-semibold text-white mb-3">📄 Your Resume</label>
                <textarea
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder="Paste your entire resume here..."
                  className="w-full h-64 p-4 bg-[#111] border border-white/6 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600/50 focus:border-blue-600/40 resize-none font-mono text-sm text-white placeholder-gray-700 transition-all"
                />
                <p className="text-xs text-gray-600 mt-2">Include skills, experience, education, and certifications</p>
              </div>

              {/* JD Text */}
              <div className="bg-[#0a0a0a] border border-white/6 rounded-xl p-6 hover:border-blue-600/25 transition-all duration-200">
                <label className="block text-sm font-semibold text-white mb-3">💼 Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-64 p-4 bg-[#111] border border-white/6 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600/50 focus:border-blue-600/40 resize-none font-mono text-sm text-white placeholder-gray-700 transition-all"
                />
                <p className="text-xs text-gray-600 mt-2">Include title, responsibilities, requirements, and qualifications</p>
              </div>
            </>
          ) : (
            <>
              <FileCard
                label="Your Resume"
                icon="📄"
                file={resumeFile}
                setFile={setResumeFile}
                dragging={resumeDragging}
                setDragging={setResumeDragging}
                inputRef={resumeFileRef}
                field="resume"
              />
              <FileCard
                label="Job Description"
                icon="💼"
                file={jobDescFile}
                setFile={setJobDescFile}
                dragging={jobDescDragging}
                setDragging={setJobDescDragging}
                inputRef={jobDescFileRef}
                field="jobDesc"
              />
            </>
          )}
        </div>

        {/* Supported formats badge (file mode only) */}
        {inputMode === 'file' && (
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/8 rounded-full text-xs text-gray-500">
              <span className="text-red-400 font-semibold">PDF</span>
              <span className="text-white/20">·</span>
              <span className="text-blue-400 font-semibold">DOCX</span>
              <span className="text-white/20">·</span>
              <span>Max 10 MB per file</span>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`px-12 py-4 rounded-xl font-bold text-white text-lg transition-all duration-200 ${
              loading
                ? 'bg-blue-900/50 cursor-not-allowed text-blue-400'
                : 'bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/25 hover:shadow-blue-500/35 hover:scale-105'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block animate-spin">⚙️</span>
                {inputMode === 'file' ? 'Extracting & Analyzing...' : 'Analyzing...'}
              </span>
            ) : (
              inputMode === 'file' ? '📂 Analyze Documents' : '🔍 Analyze Resume'
            )}
          </button>

          {inputMode === 'text' && (
            <button
              onClick={loadSample}
              className="text-gray-600 hover:text-blue-400 text-sm font-medium transition-colors duration-200"
            >
              📋 Load Sample Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
