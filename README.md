# ResuWise — AI Resume & Job Description Analyzer 🚀

**Version:** 2.0.0 | **Status:** ✅ Production Ready

ResuWise is a **full-stack AI-powered web application** that analyzes how well a resume matches a job description. It helps job seekers identify missing skills, improve ATS compatibility, and optimize resumes for specific roles using **TF-IDF vectorization and cosine similarity algorithms**. Now featuring an interactive **Skill Assessment Quiz** and **Resume Builder**!

---

## 📌 Overview

ResuWise intelligently compares a **candidate’s resume with a job description** and provides actionable insights such as:

* 📊 **Match Percentage** – Overall compatibility score between resume and job description
* 🤖 **ATS Score** – Measures resume optimization for Applicant Tracking Systems
* 🧠 **Skill Extraction** – Automatically extracts technical skills from resume and JD
* 📉 **Gap Analysis** – Identifies missing skills required for the role
* ⚡ **AI-Driven Matching** – Uses TF-IDF and cosine similarity for accurate comparison

This tool allows candidates to **evaluate their resumes before applying for jobs**.

---

## ✨ Features

### 🎨 Frontend (React + Tailwind CSS)

* Modern responsive user interface
* Two-panel input for Resume and Job Description
* Interactive results dashboard with visual indicators
* Progress bars and animated counters
* Card-based layout with smooth UI interactions
* Fully responsive design for mobile, tablet, and desktop

### 🎯 **NEW: Skill Assessment Quiz** ⭐

* Interactive quiz with 63 questions across 13 categories
* **Categories:** SQL, Programming, React, Node.js, Docker, Next.js, PostgreSQL, Django, Vue.js, WordPress, Linux, Bash, DevOps
* Real-time scoring with timer per question
* Track assessment history
* Certificate/results download functionality

### 📝 **NEW: Resume Builder** ⭐

* Interactive resume creation tool
* Drag-and-drop interface
* Multiple template options
* Real-time preview
* PDF export capability
* Save and manage multiple resumes

---

### ⚙️ Backend (Node.js + Express)

* RESTful API architecture with comprehensive endpoints
* Custom TF-IDF vectorization implementation
* Cosine similarity calculation for resume matching
* Intelligent keyword extraction from text
* Robust error handling and validation
* CORS enabled for frontend communication
* MongoDB integration for quiz questions and user data
* **Multer** for file uploads (PDF, DOCX, TXT resumes)
* Comprehensive quiz management system with 63+ questions

---

### 🧠 AI Logic

ResuWise uses lightweight NLP techniques to analyze text.

**TF-IDF Vectorization**

Converts textual data into numerical vectors based on the importance of terms.

**Cosine Similarity**

Measures similarity between resume and job description vectors.

**Keyword Extraction**

Detects relevant technologies including:

* Programming Languages
* Frameworks
* Databases
* Cloud Platforms
* Development Tools

**ATS Score**

Calculates keyword density to estimate how well the resume performs in ATS systems.

---

## 📂 Project Structure

```
ResuWise/
│
├── backend/
│   ├── controllers/
│   │   ├── resumeAnalyzer.js
│   │   ├── historyController.js
│   │   ├── fileUploadAnalyzer.js
│   │   └── auth/authController.js
│   ├── models/
│   │   ├── Analysis.js
│   │   ├── Question.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analyze.js
│   │   ├── quiz.js (NEW)
│   │   ├── history.js (NEW)
│   │   └── auth.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validators.js
│   ├── utils/
│   │   ├── tfidf.js
│   │   ├── cosine-similarity.js
│   │   └── passwordValidator.js
│   ├── scripts/
│   │   ├── seedDatabase.js
│   │   ├── seedQuiz.js (NEW)
│   │   └── addMoreQuestions.js
│   ├── config/database.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── resume-builder/ (NEW - Quiz & Resume files)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── AnalysisPage.jsx
│   │   │   ├── AnalysisHistory.jsx (NEW)
│   │   │   ├── DragAndDropUpload.jsx (NEW)
│   │   │   ├── ProtectedRoute.jsx (NEW)
│   │   │   └── ResultsSection.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── ResumeBuilderPage.jsx (NEW)
│   │   ├── context/
│   │   │   └── AuthContext.jsx (NEW)
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   ├── pdfGenerator.js (NEW)
│   │   │   ├── storageManager.js (NEW)
│   │   │   └── suggestionGenerator.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── Resume-Builder/ (NEW - Interactive resume tool)
│   ├── index.html
│   ├── resume-builder.html
│   ├── test.html (Quiz integration)
│   ├── bootstrap.css
│   └── icons/
│
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend

* React 18
* Vite (Fast build tool)
* Tailwind CSS (Utility-first CSS)
* React Router (Client-side routing)
* Axios (HTTP client)
* html2canvas & jsPDF (PDF generation)

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* Multer (File uploads)
* Natural (NLP library)
* Cors, Dotenv

### AI / NLP Logic

* TF-IDF Vectorization
* Cosine Similarity
* Keyword Extraction (Programming languages, frameworks, databases)

### Additional Tools

* Firebase (Resume Builder storage)
* Bootstrap Icons
* Responsive Design (Mobile-first)

---

## ⚡ Quick Start (5 minutes)

**Prerequisites:** Node.js v16+, npm, MongoDB

### Start Backend
```bash
cd backend
npm install
npm start
# Running on http://localhost:5000
```

### Start Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

### Access Application
- **Home:** http://localhost:3000
- **Analysis Dashboard:** http://localhost:3000/dashboard
- **Quiz:** http://localhost:3000/resume-builder
- **Backend API:** http://localhost:5000/health

---

## 📦 Installation & Setup

### Prerequisites

Install the following:

* Node.js (v16 or higher)
* npm
* Git

---

## Backend Setup

Navigate to backend folder:

cd backend

Install dependencies:

npm install

Create `.env` file:

PORT=5000
NODE_ENV=development

Start backend server:

npm start

Backend runs at:

http://localhost:5000

---

## Frontend Setup

Open a new terminal and run:

cd frontend

Install dependencies:

npm install

Start development server:

npm run dev

Open in browser:

http://localhost:3000

---

## 🚀 How to Use

1. Start both backend and frontend servers
2. Open the application in the browser
3. Paste your **resume text**
4. Paste the **job description**
5. Click **Analyze Resume**
6. View analysis results including:

* Resume Match Percentage
* ATS Optimization Score
* Matched Skills
* Required Skills
* Missing Skills

---

## 📊 API Reference

### 1. POST /api/analyze

Analyzes resume and job description.

**Request:**
```json
{
  "resume": "Resume text",
  "jobDescription": "Job description text"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "matchPercentage": 85,
    "atsScore": 78,
    "missingKeywords": ["docker","aws"],
    "extractedResumeSkills": ["javascript","react"],
    "extractedJDSkills": ["javascript","react","docker","aws"]
  }
}
```

### 2. GET /api/quiz/questions (NEW)

Fetches quiz questions for a specific category.

**Query Parameters:**
- `category`: SQL, CODE, REACT, NODEJS, DOCKER, NEXT.JS, POSTGRES, DJANGO, VUEJS, WORDPRESS, LINUX, BASH, DEVOPS
- `limit`: Number of questions (default: 5)

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "category": "SQL",
    "question": "What does SQL stand for?",
    "answers": {
      "answer_a": "Structured Query Language",
      "answer_b": "Simple Question Language",
      "answer_c": "Standard Query Library",
      "answer_d": "Stored Query Language"
    },
    "correct_answer": "answer_a",
    "difficulty": "easy"
  }
]
```

### 3. GET /api/quiz/categories (NEW)

Returns all available quiz categories.

**Response:**
```json
{
  "categories": ["BASH", "CODE", "DEVOPS", "DJANGO", "DOCKER", "LINUX", "NEXT.JS", "NODEJS", "POSTGRES", "REACT", "SQL", "VUEJS", "WORDPRESS"]
}
```

### 4. POST /api/history (NEW)

Stores analysis results for user history.

**Request:**
```json
{
  "userId": "user123",
  "resume": "Resume text",
  "jobDescription": "JD text",
  "results": { ...analysis results }
}
```

### 5. GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "Server running",
  "mongodb": "connected"
}
```

## 🧬 How It Works

### Resume Analysis Flow

1. **User Input** → Resume + Job Description text
2. **Text Processing** → Tokenization and keyword extraction
3. **Vectorization** → Convert text to numerical vectors using TF-IDF
4. **Similarity Matching** → Calculate cosine similarity between vectors
5. **Analysis** → Generate match %, ATS score, missing skills
6. **Results** → Display actionable insights to user

### Algorithm Breakdown

**TF-IDF (Term Frequency - Inverse Document Frequency)**
```
TF-IDF = Term Frequency × log(Total Docs / Docs containing term)
- Gives importance scores to keywords
- Rare technical terms get higher scores
- Common words like "the" get lower scores
```

**Cosine Similarity**
```
Similarity = (A · B) / (|A| × |B|)
Range: 0 (completely different) to 1 (identical)
```

### Quiz System Flow

1. **Category Selection** → User picks skill category
2. **Question Fetch** → Backend retrieves 5 random questions
3. **Timer** → 30 seconds per question
4. **Scoring** → Instant feedback on answers
5. **Results** → Final score and saved to history

---

## 📝 Recent Improvements (v2.0.0)

✅ **Fixed Issues:**
- ✓ Resolved duplicate quiz display bug
- ✓ Fixed category dropdown capitalization issue
- ✓ Normalized API field names for consistency
- ✓ Improved error messages for better UX

✅ **New Additions:**
- ✓ Added 35 new quiz questions (28 → 63 total)
- ✓ Implemented 7 new skill categories
- ✓ Resume-Builder files properly integrated
- ✓ Frontend and backend fully synchronized

---

## 💡 Tips for Better Results

* Include **relevant technologies mentioned in the job description**
* Use **accurate technical terminology**
* Add **projects and tools used**
* Keep resumes **updated with latest skills**

---

## 🎓 Academic Relevance

This project demonstrates concepts from:

* Natural Language Processing
* Machine Learning Fundamentals
* Full Stack Development
* Information Retrieval

Suitable for **final year computer science projects and ML demonstrations**.

---

---

## 🆕 What's New in v2.0.0

✨ **Skill Assessment Quiz System**
- 63 interactive quiz questions across 13 tech categories
- Real-time timer and scoring
- Difficulty levels (Easy, Medium, Hard)
- Category-based learning paths

📝 **Resume Builder Integration**
- Interactive resume creation tool
- Multiple template options
- Real-time preview
- PDF export functionality
- Fire base cloud storage

📊 **Enhanced Database**
- MongoDB integration for data persistence
- User quiz history tracking
- Analysis results storage
- Question bank management

🔐 **Authentication System** (Foundation)
- User registration and login
- Protected routes
- Secure session management

🎯 **UX Improvements**
- Drag-and-drop file upload
- Visual progress indicators
- Responsive mobile design
- Better error handling

---

## 🚀 Future Enhancements

* 🤖 Advanced semantic NLP using transformer models (BERT)
* 💬 Chatbot for resume improvement suggestions
* 🎓 Interactive learning paths for skill gaps
* 📈 Job market insights and salary data
* 🔗 LinkedIn integration
* 🌐 Multi-language support
* 📱 Mobile app (React Native)
* ✅ Email verification and password reset
* 🏆 Leaderboards for quiz competitions
* 📧 Email notifications for matched jobs

---

## 📜 License

MIT License — Free for educational purposes.

---

## 👩‍💻 Author

Developed as a **Final Year Computer Science Project**.

⭐ If you found this project useful, feel free to **star the repository**.
