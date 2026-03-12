# ResuWise - AI Resume & Job Description Analyzer 🚀

> A modern, full-stack web application that uses AI to analyze resume-job description compatibility with advanced keyword extraction, TF-IDF vectorization, and cosine similarity matching.

## 📋 Overview

ResuWise is an intelligent resume analyzer that helps job seekers understand how well their resume matches a job description. It provides:

- **Match Percentage**: Overall resume-JD compatibility score
- **ATS Score**: Applicant Tracking System optimization score
- **Skill Analysis**: Extracted skills from both resume and JD
- **Gap Analysis**: Missing skills to focus on
- **AI-Powered Matching**: Uses TF-IDF & Cosine Similarity algorithms

## 🎯 Features

### Frontend (React + Tailwind CSS)
- ✨ Modern, responsive UI with gradient designs
- 📄 Two-panel text input for resume and job description
- 📊 Interactive results dashboard with progress bars
- 🎨 Card-based layout with smooth animations
- 📱 Mobile-friendly responsive design

### Backend (Node.js + Express)
- 🔐 RESTful API with CORS support
- 🤖 Custom TF-IDF vectorizer implementation
- 📐 Cosine similarity calculation
- 🔍 Intelligent keyword extraction
- 🪵 Comprehensive error handling

### AI Logic
- **TF-IDF**: Converts text to numerical vectors
- **Cosine Similarity**: Measures semantic similarity between resume and JD
- **Keyword Extraction**: Identifies programming languages, frameworks, and tools
- **ATS Score**: Calculates keyword density for ATS optimization

## 📁 Project Structure

```
ResuWise/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env
│   ├── routes/
│   │   └── analyze.js
│   ├── controllers/
│   │   └── resumeAnalyzer.js
│   └── utils/
│       ├── tfidf.js
│       └── cosine-similarity.js
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── public/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        └── components/
            ├── Navbar.jsx
            ├── HomePage.jsx
            ├── AnalysisPage.jsx
            └── ResultsSection.jsx
```

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI library
- **Vite 4.4** - Build tool & dev server
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express 4.18** - Web framework
- **CORS** - Cross-origin resource sharing
- **Natural** - NLP utilities (optional for future enhancements)

### AI/ML
- Custom TF-IDF implementation
- Custom Cosine Similarity calculator
- Term frequency & inverse document frequency analysis

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional)

### Backend Setup

1. Navigate to backend directory:
```bash
cd ResuWise/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already included with PORT=5000):
```bash
PORT=5000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

Expected output:
```
🚀 ResuWise Backend running on http://localhost:5000
```

### Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd ResuWise/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

Expected output in terminal:
```
  VITE v4.4.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

## 🚀 How to Use

### Step 1: Start Both Servers
Keep both terminal windows open with servers running.

### Step 2: Navigate to Homepage
- Open http://localhost:3000 in your browser
- Click "✨ Start Analysis Now →" button

### Step 3: Input Your Data
- **Paste Resume**: Copy-paste your complete resume
- **Paste Job Description**: Copy-paste the job description
- Or click "📋 Load Sample Data" to test with sample data

### Step 4: Analyze
- Click "🔍 Analyze Resume" button
- Wait for AI analysis to complete

### Step 5: Review Results
- **Match Percentage**: How well your resume matches the JD
- **ATS Score**: How optimized your resume is for ATS systems
- **Matched Skills**: Your skills that appear in the JD
- **Required Skills**: All skills mentioned in the JD
- **Skills to Improve**: Missing skills to boost your score

## 📊 API Reference

### POST /api/analyze

Analyzes resume and job description, returns compatibility metrics.

**Request:**
```json
{
  "resume": "Your complete resume text...",
  "jobDescription": "Job description text..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "matchPercentage": 85,
    "atsScore": 78,
    "missingKeywords": ["kubernetes", "docker", "aws"],
    "extractedResumeSkills": ["javascript", "react", "nodejs"],
    "extractedJDSkills": ["javascript", "react", "nodejs", "kubernetes", "docker", "aws"],
    "allRequiredSkills": ["javascript", "react", "nodejs", "kubernetes", "docker", "aws"],
    "providedSkills": ["javascript", "react", "nodejs"]
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "Server is running"
}
```

## 🧮 Algorithm Explanation

### TF-IDF (Term Frequency-Inverse Document Frequency)

TF-IDF converts text into numerical vectors by:
1. **TF**: Counts how frequently a term appears in a document
2. **IDF**: Measures how unique/important a term is across all documents
3. **Result**: Higher scores for unique, frequent terms

```
TF-IDF(word) = TF(word) × IDF(word)
```

### Cosine Similarity

Measures the angle between two vectors (0-1):
- 1.0 = Perfect match
- 0.5 = Moderate match
- 0.0 = No match

```
similarity = (A · B) / (|A| × |B|)
```

### Keyword Extraction

Identifies important skills from predefined categories:
- Programming languages: JavaScript, Python, Java, etc.
- Web frameworks: React, Angular, Vue, etc.
- Databases: SQL, MongoDB, PostgreSQL, etc.
- Cloud platforms: AWS, Azure, GCP, etc.
- Tools: Git, Docker, Kubernetes, etc.

## 💡 Tips for Better Results

1. **Use Complete Resumes**: Include all relevant experience, skills, and education
2. **Include Full Job Description**: Copy the entire JD, not just the title
3. **Use Technical Terms**: Spell out technologies correctly (e.g., "React.js" vs "React")
4. **Be Specific**: Use exact tool/language names from the job description
5. **Update Regularly**: Keep resume updated with latest skills and projects

## 🎓 Academic Use

This project is ideal for:
- Final year computer science projects
- Web development courses
- Machine learning demonstrations
- AI/NLP learning
- Full-stack development practice

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000

# Try different port in backend/.env
PORT=5001
```

### Frontend compilation errors
```bash
# Clear node_modules and reinstall
rm -rf frontend/node_modules
cd frontend && npm install
```

### API Connection Error
```
"Failed to connect to server"
```
- Ensure backend is running on http://localhost:5000
- Check for CORS issues in browser console
- Verify both terminals are active

### No results from analysis
- Ensure resume and JD text are not empty
- Check backend terminal for error messages
- Verify API response in browser DevTools

## 📈 Future Enhancements

- [ ] Natural Language Processing (NLP) for semantic analysis
- [ ] Machine learning model for better skill matching
- [ ] Ranked job recommendations
- [ ] Resume formatting suggestions
- [ ] Export results as PDF
- [ ] User authentication & profile management
- [ ] Resume templates
- [ ] Real job posting integration
- [ ] Skill progression tracking

## 📝 License

MIT License - Feel free to use for educational purposes

## 👨‍💻 Author

Created as a Final Year Academic Project

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review the API Reference
3. Check browser console for errors
4. Verify backend server is running

---

**Happy Job Hunting with ResuWise! 🎯**

