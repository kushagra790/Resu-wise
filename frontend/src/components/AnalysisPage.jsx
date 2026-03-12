import { useState } from 'react';
import axios from 'axios';
import ResultsSection from './ResultsSection';
import { saveAnalysisToHistory } from '../utils/storageManager';

export default function AnalysisPage({ onBack }) {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    // Validation
    if (!resume.trim()) {
      setError('Please paste your resume');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please paste the job description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/analyze/text',
        {
          resume: resume.trim(),
          jobDescription: jobDescription.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        console.log('✅ Full API Response:', response.data);
        console.log('✅ Analysis Data:', response.data.data);
        console.log('Matched Skills:', response.data.data.matchedSkills);
        console.log('ATS Breakdown:', response.data.data.atsScoreBreakdown);
        setResults(response.data.data);
        // Save to history
        saveAnalysisToHistory(
          response.data.data,
          resume.trim(),
          jobDescription.trim()
        );
      } else {
        setError(response.data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to connect to server. Make sure backend is running on http://localhost:5000'
      );
    } finally {
      setLoading(false);
    }
  };

  // If results are showing, display them
  if (results) {
    return (
      <ResultsSection
        results={results}
        onBackToAnalysis={() => setResults(null)}
        onHome={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-purple-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/50 rounded-lg transition flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Resume Analysis Engine
          </h2>
          <p className="text-purple-200 mt-2">
            Get intelligent insights on how your resume matches the job
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-500/50 rounded-lg text-red-300 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Resume Input */}
          <div className="bg-slate-900/50 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition">
            <label className="block text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
              📄 Your Resume
            </label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your entire resume here..."
              className="w-full h-64 p-4 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm text-white placeholder-gray-500 transition"
            />
            <p className="text-xs text-purple-300 mt-2">
              Include all skills, experience, education, and certifications
            </p>
          </div>

          {/* Job Description Input */}
          <div className="bg-slate-900/50 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition">
            <label className="block text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
              💼 Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-64 p-4 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm text-white placeholder-gray-500 transition"
            />
            <p className="text-xs text-purple-300 mt-2">
              Include job title, responsibilities, requirements, and qualifications
            </p>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`px-12 py-4 rounded-lg font-bold text-white text-lg transition transform ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block animate-spin">⚙️</span>
                Analyzing...
              </span>
            ) : (
              '🔍 Analyze Resume'
            )}
          </button>
        </div>

        {/* Sample Data Button */}
        <div className="text-center">
          <button
            onClick={() => {
              setResume(`Senior Software Engineer

PROFESSIONAL SUMMARY
Experienced Senior Software Engineer with 5+ years of expertise in full-stack web development, cloud architecture, and team leadership. Proven track record of delivering scalable, high-performance applications.

TECHNICAL SKILLS
Programming Languages: JavaScript, Python, Java, TypeScript
Web Development: React, Angular, Vue.js, Node.js, Express
Databases: PostgreSQL, MongoDB, Redis, Firebase
Cloud & DevOps: AWS, Docker, Kubernetes, GitHub Actions
Tools & Platforms: Git, GitHub, GitLab, Jira, Linux

PROFESSIONAL EXPERIENCE
Senior Developer | Tech Company (2022 - Present)
- Architected and deployed microservices using Docker and Kubernetes on AWS
- Led team of 4 developers, conducting code reviews and mentoring
- Improved application performance by 40% through optimization
- Implemented CI/CD pipelines using GitHub Actions

Full Stack Developer | StartUp Inc (2020 - 2022)
- Built responsive web applications using React and Node.js
- Developed RESTful APIs and optimized database queries
- Managed AWS infrastructure and deployment automation
- Implemented Redis caching, reducing load times by 35%

EDUCATION
Bachelor of Engineering in Computer Science
University of Technology, 2019

CERTIFICATIONS
- AWS Solutions Architect Associate
- Kubernetes Certified Application Developer`);
              setJobDescription(`Senior Full Stack Engineer

ABOUT THE ROLE
We are looking for an experienced Senior Full Stack Engineer to lead our technical initiatives and mentor junior developers. The ideal candidate will have strong expertise in modern web technologies and cloud architecture.

RESPONSIBILITIES
- Design and implement scalable microservices architecture
- Lead development of React-based front-end applications
- Architect backend systems using Node.js and Express
- Manage AWS cloud infrastructure and DevOps practices
- Mentor and code review junior developers
- Participate in technical planning and architecture discussions
- Implement CI/CD pipelines and DevOps best practices

REQUIRED SKILLS
- 5+ years of professional software development experience
- Expert-level JavaScript and TypeScript proficiency
- Strong React and Vue.js experience
- Backend development with Node.js and Express
- Cloud infrastructure (AWS, Azure, or GCP)
- Docker and Kubernetes experience
- Database design (SQL and NoSQL)
- Git version control and GitHub
- Strong communication and leadership skills

NICE-TO-HAVE
- Python programming
- Microservices architecture experience
- Redis caching experience
- Machine learning basics
- GraphQL experience

BENEFITS
- Competitive salary and equity
- Remote-friendly work environment
- Professional development budget
- Health and wellness benefits`);
              setError(null);
            }}
            className="text-purple-400 hover:text-purple-300 font-semibold underline decoration-purple-500/50 hover:decoration-purple-400 transition"
          >
            📋 Load Sample Data
          </button>
        </div>
      </div>
    </div>
  );
}
