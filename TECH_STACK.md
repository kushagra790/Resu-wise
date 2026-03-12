# ResuWise - Technology Stack & Dependencies

A comprehensive list of all technologies, frameworks, libraries, and tools used in the ResuWise project.

---

## 🖥️ Backend Stack

### Runtime & Framework
- **Node.js** - JavaScript runtime environment
- **Express.js** `^4.18.2` - Web framework for building REST APIs
  - CORS support for cross-origin requests
  - Middleware support (body-parser, multer)
  - RESTful API routing

### Database & ORM
- **MongoDB** - NoSQL document database
  - Flexible schema for storing analyses and user data
  - Scalable architecture
  - Document-based storage
- **Mongoose** `^7.5.0` - MongoDB ODM (Object Document Mapper)
  - Schema validation and middleware
  - Document population and relationships
  - Indexing and query optimization
  - Aggregate pipeline support

### File Upload & Processing
- **multer** `^1.4.5-lts.1` - Middleware for handling file uploads
  - Memory storage for file handling
  - File size validation (10MB limit)
  - MIME type validation for PDF and DOCX
- **pdf-parse** `^1.1.1` - PDF text extraction library
- **mammoth** `^1.6.0` - DOCX file text extraction library

### Utilities
- **validator** `^13.11.0` - Data validation and sanitization
  - Email validation
  - String validation
  - Custom validators

### NLP & Text Processing
- **natural** `^6.7.0` - Natural Language Processing library
  - WordTokenizer for text tokenization
  - PorterStemmer for word stemming
  - Stop word filtering

### Custom Modules
- **TFIDFVectorizer** - Custom implementation for TF-IDF vectorization
  - Text preprocessing (lowercasing, special character removal)
  - Token filtering and stemming
  - Vector calculation and normalization
  - Document frequency calculation

- **Cosine Similarity Calculator** - Custom similarity calculation
  - Vector dot product computation
  - Magnitude calculation
  - Similarity scoring (0-1 range)

### Development Tools (Backend)
- **nodemon** `^3.0.1` - Auto-restart Node.js during development
  - File watching and automatic reload

---

## 🎨 Frontend Stack

### Core Framework
- **React** `^18.2.0` - UI library for building user interfaces
  - Functional components with hooks
  - State management with useState
  - React DOM rendering

- **React DOM** `^18.2.0` - React rendering for browser DOM

### Build Tools
- **Vite** `^4.4.0` - Modern frontend build tool and dev server
  - Lightning-fast development environment
  - Optimized production builds (ES modules)
  - HMR (Hot Module Replacement)

- **@vitejs/plugin-react** `^4.0.0` - React plugin for Vite
  - JSX transformation and optimization

### Styling
- **Tailwind CSS** `^3.3.0` - Utility-first CSS framework
  - Custom color palettes (slate, purple, emerald)
  - Responsive design utilities
  - Gradient backgrounds
  - Animation utilities
  - Flexbox and grid utilities

- **PostCSS** `^8.4.25` - CSS transformation tool
  - Plugin pipeline processing
  - Autoprefixer integration

- **autoprefixer** `^10.4.14` - CSS vendor prefixing
  - Cross-browser compatibility

### HTTP Client
- **axios** `^1.4.0` - Promise-based HTTP client
  - Request/response interceptors
  - Error handling
  - JSON serialization

### PDF & Document Generation
- **jsPDF** `^2.5.2` - JavaScript PDF generation library
  - Create PDF documents programmatically
  - Add text, images, and styling
  - Multiple page support

- **html2canvas** `^1.4.1` - HTML to Canvas conversion
  - Render DOM elements as images
  - Screenshot functionality for PDF export

### Development Tools (Frontend)
- **Tailwind CSS** (also as dev dependency) - CSS framework development
- **PostCSS** (also as dev dependency) - CSS transforms

---

## 📱 Components & Features

### React Components
1. **Navbar.jsx** - Navigation bar with branding
2. **HomePage.jsx** - Landing page with feature overview
3. **AnalysisPage.jsx** - Main analysis interface
4. **DragAndDropUpload.jsx** - File upload with drag-and-drop
5. **ResultsSection.jsx** - Results display and visualization
6. **AnalysisHistory.jsx** - History sidebar with previous analyses

### Backend Controllers
1. **resumeAnalyzer.js** - Core analysis logic
   - Skill extraction by category
   - ATS score calculation
   - TF-IDF vectorization
   - Experience matching
   - Formatting score calculation

2. **fileUploadAnalyzer.js** - File processing
   - PDF text extraction
   - DOCX text extraction
   - File validation

3. **historyController.js** - Analysis history management
   - Save user analyses to database
   - Retrieve analysis history with pagination
   - Update analysis metadata (notes, favorites, tags)
   - Delete analyses
   - User statistics calculation
   - Analysis search and filtering
   - Export analyses as JSON

### Backend Routes
1. **analyze.js** - API endpoints
   - POST `/api/analyze/text` - Text-based analysis
   - POST `/api/analyze/upload` - File-based analysis
   - Error handling middleware

2. **history.js** - Analysis history endpoints
   - POST `/api/history/save` - Save analysis result
   - GET `/api/history/all` - Get user's analyses with pagination
   - GET `/api/history/:id` - Get single analysis
   - PUT `/api/history/:id` - Update analysis metadata
   - DELETE `/api/history/:id` - Delete analysis
   - GET `/api/history/stats` - Get user statistics
   - GET `/api/history/favorites` - Get favorite analyses
   - GET `/api/history/search` - Search analyses
   - GET `/api/history/export` - Export analyses as JSON

### Database Models
1. **Analysis Model**
   - Store resume-JD analysis results
   - User reference and indexing
   - Detailed ATS score breakdown
   - Matched/missing skills by category
   - Experience level analysis
   - Job metadata (title, company)
   - User annotations (notes, tags, favorites)
   - Status tracking (pending, completed, archived)
   - Timestamps for created/updated dates
   - Compound indexes for efficient queries
   - Static methods: getUserStats
   - Instance methods: getImprovementScore, getQualificationStatus

### Utilities
- **storageManager.js** - Local storage operations
  - Save analysis history
  - Retrieve past analyses
  - Export analysis data

- **pdfGenerator.js** - PDF report generation
  - Create analysis reports
  - Add sections for results
  - Export functionality

- **suggestionGenerator.js** - Generate improvement suggestions
  - Skill recommendations
  - Resume optimization tips

- **tfidf.js** - TF-IDF implementation
  - Document vectorization
  - Vocabulary management

- **cosine-similarity.js** - Similarity calculation
  - Vector comparison
  - Score normalization

---

## 🛠️ Algorithms & Techniques

### Text Processing
- **Tokenization** - Breaking text into tokens
- **Stop Word Removal** - Filtering common English words
- **Stemming** - Word normalization using Porter Stemmer
- **Lowercasing** - Case-insensitive processing
- **Special Character Removal** - Cleaning text

### Analysis Methods
- **TF-IDF (Term Frequency-Inverse Document Frequency)**
  - Measures word importance in documents
  - Vectorizes text for comparison

- **Cosine Similarity**
  - Measures angle between vectors
  - Determines document similarity (0-1 scale)

- **Keyword Matching**
  - Categorized skill extraction
  - Regex pattern matching with word boundaries
  - Case-insensitive matching

- **ATS Score Calculation**
  - Keyword density (40% weight)
  - Skills presence (30% weight)
  - Resume sections detection (20% weight)
  - Formatting indicators (10% weight)

- **Experience Matching**
  - Year extraction from text
  - Comparison with job requirements
  - Qualification assessment

---

## 📊 Data Structures

### Skill Categories (Backend)
1. Programming Languages
2. Frontend Technologies
3. Backend Technologies
4. Databases
5. DevOps & Infrastructure
6. Cloud Platforms
7. Tools & Platforms

### Analysis Response Format
```javascript
{
  matchPercentage: Number,
  atsScore: Number,
  atsScoreBreakdown: Object,
  matchedSkills: Object,
  missingSkills: Object,
  extractedResumeSkills: Object,
  extractedJDSkills: Object,
  experience: Object,
  missingKeywords: Array,
  allRequiredSkills: Array,
  providedSkills: Array
}
```

---

## 🔧 Configuration Files

- **package.json** (Frontend & Backend)
  - Dependencies listing
  - Scripts definition
  - Project metadata

- **vite.config.js** - Vite build configuration
- **tailwind.config.js** - Tailwind CSS customization
- **postcss.config.cjs** - PostCSS plugins
- **.env** - Environment variables
  - MongoDB connection URI
  - JWT secret and expiration
  - API ports and URLs
  - CORS configuration
- **.env.example** - Environment variables template

---

## 📦 Project Structure

```
ResuWise/
├── backend/
│   ├── config/
│   │   └── database.js (MongoDB connection)
│   ├── controllers/
│   │   ├── resumeAnalyzer.js
│   │   ├── fileUploadAnalyzer.js
│   │   ├── historyController.js
│   │   └── auth/
│   │       └── authController.js
│   ├── middleware/
│   │   └── auth.js (JWT & authorization)
│   ├── models/
│   │   ├── User.js (User schema with auth)
│   │   ├── Analysis.js (Analysis schema)
│   │   └── index.js (Models export)
│   ├── routes/
│   │   ├── analyze.js
│   │   ├── auth.js
│   │   └── history.js
│   ├── utils/
│   │   ├── tfidf.js
│   │   ├── cosine-similarity.js
│   │   └── (other utilities)
│   ├── server.js (Entry point)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── vite.config.js
│   ├── postcss.config.cjs
│   ├── tailwind.config.js
│   └── package.json
└── (Configuration & Documentation files)
```

---

## 🚀 Version Information

| Component | Version | Purpose |
|-----------|---------|---------|
| Node.js | LTS (v18+) | Runtime |
| npm | Latest | Package manager |
| React | 18.2.0 | UI Framework |
| Vite | 4.4.0 | Build tool |
| Tailwind CSS | 3.3.0 | Styling |
| Express.js | 4.18.2 | Backend framework |
| multer | 1.4.5-lts.1 | File uploads |
| axios | 1.4.0 | HTTP client |
| jsPDF | 2.5.2 | PDF generation |

---

## 📋 Supported File Formats

- **Resume**: PDF (.pdf), Word Documents (.docx)
- **Job Description**: PDF (.pdf), Word Documents (.docx)
- **Output**: PDF reports of analysis results

---

## 🌐 API Endpoints

### Analysis Endpoints
- **POST** `/api/analyze` - Text-based resume & JD analysis
- **POST** `/api/analyze-upload` - File-based resume & JD analysis
- **GET** `/health` - Health check endpoint

### Request Validation
- Content-Type: application/json
- File size limit: 10MB
- Supported MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document

---

## 🔐 Security Features

- CORS middleware for controlled cross-origin requests
- File type validation (whitelist-based)
- File size limits (10MB max)
- Input validation for text and files
- Error handling middleware
- Request body size limits (50MB)

---

## 💾 Storage & State Management

### Frontend
- **localStorage** - Analysis history persistence
- **sessionStorage** - Temporary state between pages
- **useState** - React component state

### Backend
- **In-memory** processing (stateless)
- **Multer memory storage** for file uploads

---

## 🔄 Data Flow

1. **Text Analysis Flow**
   - User enters resume & JD
   - Frontend sends POST to `/api/analyze`
   - Backend processes with TF-IDF & Cosine Similarity
   - Returns comprehensive analysis
   - Frontend displays results with visualizations

2. **File Upload Flow**
   - User uploads resume & JD files
   - Multer middleware validates files
   - pdf-parse or mammoth extracts text
   - Analysis proceeds same as text flow
   - Results returned with file metadata

---

## 📈 Performance Considerations

- **TF-IDF Caching** - Document vectors cached during session
- **Efficient Tokenization** - Natural library for fast text processing
- **Multer Memory Storage** - Fast file processing without disk I/O
- **Vite HMR** - Hot module replacement for instant reload
- **Tailwind Purging** - Optimized CSS output

---

## 🎓 Academic Features

- **Comprehensive Analysis** - Multiple scoring metrics
- **Detailed Breakdown** - Component-wise score visualization
- **Skill Categorization** - Organized technical skill extraction
- **Export Functionality** - PDF report generation
- **History Tracking** - Previous analyses saved locally

---

## 📝 Error Handling

- Try-catch blocks in all async operations
- Validation at API endpoint level
- File format validation
- Input sanitization
- Comprehensive error messages
- Error logging to console

---

## 🔗 Dependencies Summary

**Backend Production Dependencies**: 11 packages
- express, cors, dotenv, natural, multer
- pdf-parse, mammoth
- **mongoose, bcryptjs, jsonwebtoken, validator** (NEW)

**Backend Development Dependencies**: 1 package
- nodemon

**Frontend Production Dependencies**: 5 packages
- axios, html2canvas, jspdf, react, react-dom

**Frontend Development Dependencies**: 5 packages
- @vitejs/plugin-react, autoprefixer, postcss, tailwindcss, vite

**Total Overall**: 16 production + 6 development packages

---

**Last Updated**: February 2026
**Project Status**: Production-Ready Prototype
**License**: MIT
