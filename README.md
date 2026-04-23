# ResuWise — AI Resume & Job Description Analyzer 🚀

**Version:** 2.1.0 | **Status:** ✅ Production Ready | **Last Updated:** April 2026

ResuWise is a **full-stack AI-powered web application** that analyzes how well a resume matches a job description. It helps job seekers identify missing skills, improve ATS compatibility, and optimize resumes for specific roles using **TF-IDF vectorization and cosine similarity algorithms**. Now featuring an interactive **Skill Assessment Quiz** and **Resume Builder**!

---

## 📌 Overview

ResuWise intelligently compares a **candidate's resume with a job description** and provides actionable insights such as:

* 📊 **Match Percentage** – Overall compatibility score between resume and job description
* 🤖 **ATS Score** – Measures resume optimization for Applicant Tracking Systems
* 🧠 **Skill Extraction** – Automatically extracts technical skills from resume and JD
* 📉 **Gap Analysis** – Identifies missing skills required for the role
* ⚡ **AI-Driven Matching** – Uses TF-IDF and cosine similarity for accurate comparison

This tool allows candidates to **evaluate their resumes before applying for jobs**.

---

## 🔒 Security & Privacy - IMPORTANT!

### ⚠️ Never Commit Sensitive Information to GitHub

**Files that should NEVER be tracked by Git:**
- ✅ `.env` - Environment variables with API keys, database URLs, JWT secrets
- ✅ `credentials.json` - Authentication/API credentials
- ✅ Private keys or tokens
- ✅ Database connection strings with passwords

**These files are protected by `.gitignore`:**
```
.env
.env.local
.env.development
.env.production
node_modules/
```

### 🔐 Environment Setup (MUST DO BEFORE RUNNING)

#### Backend Security Setup
1. Copy the example template:
```bash
cp backend/.env.example backend/.env
```

2. Edit `backend/.env` with your actual values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/resuwise
JWT_SECRET=generate-strong-secret-minimum-32-characters
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

3. **Generate a strong JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Frontend Security Setup
1. Copy the example template:
```bash
cp frontend/.env.example frontend/.env
```

2. Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### ✅ Production Security Checklist
- [ ] Change `JWT_SECRET` to a strong random value (minimum 32 characters)
- [ ] Use MongoDB Atlas with IP whitelisting
- [ ] Enable HTTPS/SSL certificates
- [ ] Set `NODE_ENV=production`
- [ ] Use unique, strong passwords for database
- [ ] Enable request rate limiting
- [ ] Configure CORS for your domain only
- [ ] Run `npm audit fix` to update dependencies
- [ ] Review GitHub for any exposed secrets
- [ ] Use environment variables for ALL sensitive data

### 🛡️ What IS Safe to Commit
- ✅ `.env.example` files (templates with placeholder values)
- ✅ Source code
- ✅ Configuration files (without secrets)
- ✅ Documentation
- ✅ Build/transpile output
- ✅ Public credentials or API endpoints

---

## ✨ Features

### 🎨 Frontend (React + Tailwind CSS)

* Modern responsive user interface with smooth animations
* Dynamic user greetings and personalized dashboard
* Two-panel input for Resume and Job Description
* Interactive results dashboard with visual indicators
* Progress bars and animated counters
* Card-based layout with smooth UI interactions & hover effects
* Fully responsive design for mobile, tablet, and desktop
* **NEW:** Comprehensive animations for engaging UX (fade-in, slide-in effects)
* **NEW:** Context-aware navigation with back button
* **NEW:** Authentic, benefit-focused messaging
* **NEW:** Custom animated favicon with rocket icon

### 🎯 **Skill Assessment Quiz** ⭐

* Interactive quiz with 63 questions across 13 categories
* **Categories:** SQL, Programming, React, Node.js, Docker, Next.js, PostgreSQL, Django, Vue.js, WordPress, Linux, Bash, DevOps
* Real-time scoring with timer per question (30 seconds)
* Track assessment history
* Certificate/results download functionality
* Difficulty levels (Easy, Medium, Hard)
* Staggered question sets

### 📝 **Resume Builder** ⭐

* Interactive resume creation tool
* Drag-and-drop interface
* Multiple template options
* Real-time preview
* PDF export capability
* Save and manage multiple resumes
* Cloud storage integration (Firebase)

### ⚙️ Backend (Node.js + Express)

* RESTful API architecture with comprehensive endpoints
* Custom TF-IDF vectorization implementation
* Cosine similarity calculation for resume matching
* Intelligent keyword extraction from text
* Robust error handling and validation
* CORS enabled for frontend communication
* MongoDB integration for data persistence
* **Multer** for file uploads (PDF, DOCX, TXT resumes)
* JWT authentication for secure sessions
* 63+ interactive quiz questions across 13 categories
* Rate limiting and security middleware

---

### 🧠 AI Logic

ResuWise uses lightweight NLP techniques to analyze text.

**TF-IDF Vectorization**
Converts textual data into numerical vectors based on term importance.

**Cosine Similarity**
Measures similarity between resume and job description vectors (0 to 1 scale).

**Keyword Extraction**
Detects relevant technologies including:
* Programming Languages
* Frameworks & Libraries
* Databases
* Cloud Platforms
* Development Tools

---

## 📂 Project Structure

```
ResuWise/
│
├── backend/
│   ├── .env.example (copy to .env with your secrets)
│   ├── config/database.js
│   ├── controllers/
│   │   ├── auth/authController.js
│   │   ├── resumeAnalyzer.js
│   │   ├── fileUploadAnalyzer.js
│   │   └── historyController.js
│   ├── middleware/auth.js, validators.js
│   ├── models/User.js, Analysis.js, Question.js
│   ├── routes/auth.js, analyze.js, quiz.js, history.js
│   ├── utils/tfidf.js, cosine-similarity.js, passwordValidator.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── .env.example (copy to .env with API URL)
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── components/Navbar, HomePage, AnalysisPage, etc.
│   │   ├── pages/Dashboard, Login, Signup, ResumeBuilderPage
│   │   ├── context/AuthContext.jsx
│   │   ├── utils/api.js, pdfGenerator.js, storageManager.js
│   │   └── App.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore (protects .env files)
└── README.md (this file)
```

---

## 🛠️ Tech Stack

### Frontend
* React 18
* Vite (fast build)
* Tailwind CSS
* React Router
* Axios

### Backend
* Node.js & Express.js
* MongoDB + Mongoose
* JWT Authentication
* Multer (file uploads)

### AI/NLP
* TF-IDF Vectorization
* Cosine Similarity
* Keyword Extraction

---

## ⚡ Quick Start (5 minutes)

### Prerequisites
- Node.js v16+
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### 1️⃣ Setup Environment Files

```bash
# Backend
cp backend/.env.example backend/.env
# EDIT backend/.env with your MongoDB URI and JWT secret

# Frontend  
cp frontend/.env.example frontend/.env
# EDIT frontend/.env with API URL
```

### 2️⃣ Start Backend
```bash
cd backend
npm install
npm start
# Backend: http://localhost:5000
```

### 3️⃣ Start Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
# Frontend: http://localhost:3000
```

### 4️⃣ Access the App
- **Landing:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard
- **Backend API:** http://localhost:5000/health

---

## 🚀 How to Use

### 1. Resume Analysis
- Go to Dashboard
- Upload or paste resume
- Paste job description
- Click "Analyze"
- View match %, ATS score, missing skills

### 2. Skill Quiz
- Select category
- Answer 5 questions (30s each)
- Get instant feedback
- Track your scores

### 3. Resume Builder
- Create new resume
- Fill information
- Export as PDF

---

## 📊 Recent Improvements (v2.1.0)

### ✨ UI/UX Enhancements
- ✅ Reduced font sizes for better aesthetics
- ✅ Improved copywriting (results-driven messaging)
- ✅ Professional footer with links
- ✅ Custom favicon
- ✅ Dynamic user greetings
- ✅ Smooth animations throughout
- ✅ Authentic, benefit-focused content
- ✅ Back navigation button
- ✅ Responsive design improvements
- ✅ Staggered animation delays

### 🔧 Technical
- ✅ React Router navigation working properly
- ✅ Environment variables configured
- ✅ .gitignore protecting secrets
- ✅ JWT authentication implemented

---

## 🔍 Security Audit Checklist

- ✅ No hardcoded API keys in source code (using .env instead)
- ✅ `.env` files excluded from Git via `.gitignore`
- ✅ MongoDB URI uses environment variables
- ✅ JWT secret uses environment variables
- ✅ `.env.example` provided as template (without secrets)
- ✅ No credentials in GitHub commit history
- ✅ CORS properly configured
- ✅ Input validation on all routes
- ✅ Password hashing implemented
- ✅ Protected routes with authentication

---

## 🆘 Troubleshooting

### MongoDB Connection Error
```bash
# Check MONGODB_URI in backend/.env
# Verify IP whitelisting in MongoDB Atlas
# Test: node -e "require('mongoose').connect(process.env.MONGODB_URI)"
```

### Frontend Can't Reach Backend
```bash
# Check VITE_API_BASE_URL in frontend/.env
# Ensure CORS_ORIGIN matches in backend/.env
# Confirm backend is running on correct port
```

### JWT Issues
```bash
# Generate new secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Update JWT_SECRET in backend/.env
# Restart backend
```

---

## 📞 Support

**Found a bug?** [Create an issue](https://github.com/EktaAgrawal08/ResuWise/issues)

**Want to contribute?** Submit a pull request!

---

## 📄 License

Open source - See LICENSE file for details

---

## 👨‍💻 Author

**Developed by:** Ekta Agrawal  
**GitHub:** [EktaAgrawal08](https://github.com/EktaAgrawal08)

---

**Version:** 2.1.0 | **Last Updated:** April 11, 2026 | **Status:** ✅ Production Ready
# ResuWise — AI Resume & Job Description Analyzer 🚀

**Version:** 2.1.0 | **Status:** ✅ Production Ready | **Last Updated:** April 2026

ResuWise is a **full-stack AI-powered web application** that analyzes how well a resume matches a job description. It helps job seekers identify missing skills, improve ATS compatibility, and optimize resumes for specific roles using **TF-IDF vectorization and cosine similarity algorithms**. Now featuring an interactive **Skill Assessment Quiz** and **Resume Builder**!

---

## 📌 Overview

ResuWise intelligently compares a **candidate's resume with a job description** and provides actionable insights such as:

* 📊 **Match Percentage** – Overall compatibility score between resume and job description
* 🤖 **ATS Score** – Measures resume optimization for Applicant Tracking Systems
* 🧠 **Skill Extraction** – Automatically extracts technical skills from resume and JD
* 📉 **Gap Analysis** – Identifies missing skills required for the role
* ⚡ **AI-Driven Matching** – Uses TF-IDF and cosine similarity for accurate comparison

This tool allows candidates to **evaluate their resumes before applying for jobs**.

---

## 🔒 Security & Privacy

### Important: Protecting Sensitive Information

**Never commit these files to Git:**
- ✅ `.env` files containing API keys, database URLs, JWT secrets
- ✅ `credentials.json` or any authentication files
- ✅ Private keys or tokens

**These files are already in `.gitignore`:**
```
.env
.env.local
.env.development
.env.production
node_modules/
```

### Environment Setup (MUST DO)

#### Backend Security Setup
1. Copy the example template:
```bash
cp backend/.env.example backend/.env
```

2. Edit `backend/.env` with your actual values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://your-user:your-password@cluster.mongodb.net/resuwise
JWT_SECRET=generate-a-strong-secret-at-least-32-chars
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

3. Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Frontend Security Setup
1. Copy the example template:
```bash
cp frontend/.env.example frontend/.env
```

2. Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### Production Security Checklist
- [ ] Change `JWT_SECRET` to a strong random value (minimum 32 characters)
- [ ] Use MongoDB Atlas with IP whitelisting for production
- [ ] Enable HTTPS/SSL certificates
- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique passwords in MongoDB
- [ ] Enable request rate limiting
- [ ] Set up CORS properly for your domain
- [ ] Regularly update dependencies: `npm audit fix`

---

## ✨ Features

### 🎨 Frontend (React + Tailwind CSS)

* Modern responsive user interface with smooth animations
* Dynamic user greetings and personalized dashboard
* Two-panel input for Resume and Job Description
* Interactive results dashboard with visual indicators
* Progress bars and animated counters
* Card-based layout with smooth UI interactions & hover effects
* Fully responsive design for mobile, tablet, and desktop
* **NEW:** Comprehensive animations for engaging UX
* **NEW:** Context-aware navigation with back button

### 🎯 **Skill Assessment Quiz** ⭐

* Interactive quiz with 63 questions across 13 categories
* **Categories:** SQL, Programming, React, Node.js, Docker, Next.js, PostgreSQL, Django, Vue.js, WordPress, Linux, Bash, DevOps
* Real-time scoring with timer per question
* Track assessment history
* Certificate/results download functionality
* Difficulty levels (Easy, Medium, Hard)

### 📝 **Resume Builder** ⭐

* Interactive resume creation tool
* Drag-and-drop interface
* Multiple template options
* Real-time preview
* PDF export capability
* Save and manage multiple resumes
* Cloud storage integration

### ⚙️ Backend (Node.js + Express)

* RESTful API architecture with comprehensive endpoints
* Custom TF-IDF vectorization implementation
* Cosine similarity calculation for resume matching
* Intelligent keyword extraction from text
* Robust error handling and validation
* CORS enabled for frontend communication
* MongoDB integration for quiz questions and user data
* **Multer** for file uploads (PDF, DOCX, TXT resumes)
* JWT authentication for secure sessions
* Comprehensive quiz management system with 63+ questions
* Rate limiting and security middleware

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
│   │   ├── quiz.js
│   │   ├── history.js
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
│   │   ├── seedQuiz.js
│   │   ├── seedQuizFull.js
│   │   └── addMoreQuestions.js
│   ├── config/database.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── resume-builder/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── AnalysisPage.jsx
│   │   │   ├── AnalysisHistory.jsx
│   │   │   ├── DragAndDropUpload.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ResultsSection.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── ResumeBuilderPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   ├── pdfGenerator.js
│   │   │   ├── storageManager.js
│   │   │   └── suggestionGenerator.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── Resume-Builder/ (Interactive resume tool)
│   ├── index.html
│   ├── resume-builder.html
│   ├── test.html
│   ├── bootstrap.css
│   └── icons/
│
├── .gitignore
├── .env.example (do not use - use backend/.env.example and frontend/.env.example)
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
* JWT (Authentication)
* Cors, Dotenv

### AI / NLP Logic

* TF-IDF Vectorization
* Cosine Similarity
* Keyword Extraction

### Additional Tools

* Firebase (Resume Builder storage)
* Bootstrap Icons
* Responsive Design (Mobile-first)

---

## ⚡ Quick Start (5 minutes)

**Prerequisites:** Node.js v16+, npm, MongoDB

### 1️⃣ Setup Environment Files

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and JWT secret

# Frontend  
cp frontend/.env.example frontend/.env
# Edit frontend/.env with correct API URL
```

### 2️⃣ Start Backend
```bash
cd backend
npm install
npm start
# Running on http://localhost:5000
```

### 3️⃣ Start Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

### 4️⃣ Access Application
- **Landing Page:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard
- **Quiz:** http://localhost:3000/resume-builder
- **Login:** http://localhost:3000/login
- **Signup:** http://localhost:3000/signup
- **Backend API:** http://localhost:5000/health

---

## 📦 Installation & Setup

### Prerequisites

Install the following:

* Node.js (v16 or higher)
* npm or yarn
* Git
* MongoDB (local or MongoDB Atlas account)

### Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file from example
cp .env.example .env

# Edit .env file with your configuration
# IMPORTANT: Fill in MONGODB_URI and JWT_SECRET

# Start backend server
npm start

# Backend runs at http://localhost:5000
```

### Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file from example
cp .env.example .env

# Start development server
npm run dev

# Open in browser: http://localhost:3000
```

---

## 🚀 How to Use

### Resume Analysis

1. Visit the Landing Page: `http://localhost:3000`
2. Click "Start Analyzing" or navigate to Dashboard
3. Sign up or log in (if authentication is enabled)
4. Upload or paste your **resume text**
5. Paste the **job description**
6. Click **Analyze Resume**
7. View analysis results:
   - Resume Match Percentage
   - ATS Optimization Score
   - Matched Skills
   - Required Skills
   - Missing Skills & Recommendations

### Quiz Assessment

1. Go to the Quiz section
2. Select a skill category (SQL, React, Docker, etc.)
3. Answer 5 questions with 30 seconds per question
4. Get instant feedback and scoring
5. View your assessment history

### Resume Builder

1. Access the Resume Builder
2. Fill in your information
3. Choose a template
4. Preview in real-time
5. Export as PDF

---

## 📊 API Reference

### 1. POST /api/analyze

Analyzes resume and job description.

**Request:**
```json
{
  "resume": "Your resume text here...",
  "jobDescription": "Job description text here..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "matchPercentage": 85,
    "atsScore": 78,
    "missingKeywords": ["docker", "aws"],
    "extractedResumeSkills": ["javascript", "react"],
    "extractedJDSkills": ["javascript", "react", "docker", "aws"],
    "recommendations": ["Add Docker experience", "Learn AWS basics"]
  }
}
```

### 2. GET /api/quiz/questions

Fetches quiz questions for a specific category.

**Query Parameters:**
- `category`: SQL, CODE, REACT, NODEJS, DOCKER, NEXTJS, POSTGRES, DJANGO, VUEJS, WORDPRESS, LINUX, BASH, DEVOPS
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
      "answer_b": "Simple Question Language"
    },
    "correct_answer": "answer_a",
    "difficulty": "easy"
  }
]
```

### 3. GET /api/quiz/categories

Returns all available quiz categories.

**Response:**
```json
{
  "categories": ["BASH", "CODE", "DEVOPS", "DOCKER", "LINUX", "NEXTJS", "NODEJS", "POSTGRES", "REACT", "SQL", "VUEJS", "WORDPRESS"]
}
```

### 4. POST /api/auth/signup

Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "passwordConfirm": "SecurePass123!"
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

---

## 🧬 How It Works

### Resume Analysis Flow

1. **User Input** → Resume + Job Description text
2. **Text Processing** → Tokenization and keyword extraction
3. **Vectorization** → Convert text to numerical vectors using TF-IDF
4. **Similarity Matching** → Calculate cosine similarity between vectors
5. **Analysis** → Generate match %, ATS score, missing skills
6. **Results** → Display actionable insights to user

### Algorithm Details

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

---

## 📝 Recent Improvements (v2.1.0)

### ✨ UI/UX Enhancements
- ✅ Reduced hero font sizes for better visual hierarchy
- ✅ Improved copywriting with results-driven messaging
- ✅ Added professional footer with links and branding
- ✅ Custom favicon with rocket icon
- ✅ Dynamic user greetings based on authentication
- ✅ Comprehensive animations and transitions
- ✅ Context-aware navigation (Dashboard ↔ Landing Page)
- ✅ Enhanced dashboard with animated cards
- ✅ Authentic, benefit-focused content (removed marketing fluff)
- ✅ Improved layout centering and spacing
- ✅ Added back navigation button

### 🔧 Technical Improvements
- ✅ Fixed bar graph icon hover animation (scale-110 → scale-105)
- ✅ Implemented React Router for proper page navigation
- ✅ Added fade-in and slide animations for page load
- ✅ Staggered animation delays for visual appeal
- ✅ Improved responsive design for all screen sizes

### 🔒 Security Improvements
- ✅ Environment variables properly configured
- ✅ .gitignore protecting sensitive files
- ✅ Database connection secured with environment variables
- ✅ JWT authentication for protected routes

---

## 💡 Tips for Better Results

* Include **relevant technologies mentioned in the job description**
* Use **accurate technical terminology**
* Add **projects and tools used**
* Keep resumes **updated with latest skills**
* Avoid **generic descriptions**
* Include **quantifiable achievements**

---

## 🎓 Academic Relevance

This project demonstrates concepts from:

* Natural Language Processing (NLP)
* Machine Learning Fundamentals
* Full Stack Web Development
* Information Retrieval
* Text Mining & Analysis
* REST API Design

Suitable for **university final year projects and advanced ML demonstrations**.

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Ensure MongoDB is running
# For MongoDB Atlas:
# - Check IP whitelist
# - Verify connection string
# - Confirm credentials

# Test connection:
node -e "require('mongoose').connect(process.env.MONGODB_URI)"
```

### Frontend Won't Connect to Backend

```bash
# Check CORS_ORIGIN in backend/.env
# Check VITE_API_BASE_URL in frontend/.env
# Ensure backend is running on correct port
```

### JWT Token Issues

```bash
# Generate new JWT secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update backend/.env with new JWT_SECRET
# Restart backend server
```

### Port Already in Use

```bash
# Change port in backend/.env
PORT=5001

# Or kill process using the port (macOS/Linux):
lsof -ti:5000 | xargs kill -9
```

---

## 📞 Support & Contributions

**Issues:** Found a bug? [Create an issue on GitHub](https://github.com/EktaAgrawal08/ResuWise/issues)

**Contributions:** We welcome pull requests! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📄 License

This project is open source. See LICENSE file for details.

---

## 👨‍💻 Author

**Developed by:** Ekta Agrawal  
**GitHub:** [EktaAgrawal08](https://github.com/EktaAgrawal08)

---

## 🙏 Acknowledgments

* TF-IDF algorithm implementation
* Cosine similarity matching
* MongoDB community
* React and Node.js communities
* Open source contributors

---

**Last Updated:** April 11, 2026  
**Status:** Active Development ✅  
**Version:** 2.1.0
