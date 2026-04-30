# ResuWise — AI Resume Analyzer 🚀

**Version:** 2.1.0 | **Status:** Production Ready

ResuWise is a full-stack AI-powered web application that analyzes how well a resume matches a job description. It helps users improve ATS compatibility, identify missing skills, and optimize resumes using TF-IDF and cosine similarity.

---

## 📌 Overview

ResuWise compares a resume with a job description and provides:

- Match Percentage  
- ATS Score  
- Skill Extraction  
- Missing Skills (Gap Analysis)  
- Improvement Suggestions  

---

## ✨ Features

### 🔍 Resume Analysis
- Upload or paste resume  
- Compare with job description  
- Match score + ATS score  
- Missing skills detection  

### 🎯 Skill Assessment Quiz
- 60+ questions across multiple tech domains  
- Timer-based interactive quiz  
- Performance tracking  

### 📝 Resume Builder
- Create and edit resumes  
- Live preview  
- Export as PDF  

---

## 🧠 How It Works

1. User inputs resume + job description  
2. Text is processed and cleaned  
3. TF-IDF converts text into vectors  
4. Cosine similarity calculates match score  
5. System outputs insights and suggestions  

---

## 🛠️ Tech Stack

**Frontend:**  
- React  
- Tailwind CSS  
- Vite  

**Backend:**  
- Node.js  
- Express.js  
- MongoDB  

**AI/NLP:**  
- TF-IDF  
- Cosine Similarity  

---

## 📂 Project Structure

```
backend/
frontend/
```

---

## ⚡ Setup Instructions

### 1. Clone Repository
```bash
git clone <repo-url>
cd ResuWise
```

### 2. Setup Environment

Backend:
```bash
cp backend/.env.example backend/.env
```

Frontend:
```bash
cp frontend/.env.example frontend/.env
```

---

### 3. Run Backend
```bash
cd backend
npm install
npm start
```

---

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🚀 Usage

1. Upload or paste resume  
2. Enter job description  
3. Click Analyze  
4. View match score and suggestions  

---

## 📈 Future Improvements

- AI-based resume rewriting  
- More advanced NLP models  
- Interview preparation module  

---

## 👨‍💻 Author

Ekta Agrawal  
GitHub: https://github.com/EktaAgrawal08
kushagra singh
srishti agarwal

---

## 📄 License

Open source project
