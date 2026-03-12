const express = require('express');
const multer = require('multer');
const { analyzeResumeAndJD } = require('../controllers/resumeAnalyzer');
const { analyzeUploadedFiles } = require('../controllers/fileUploadAnalyzer');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.pdf', '.docx'];

    const isMimeAllowed = allowedMimes.includes(file.mimetype);
    const isExtensionAllowed = allowedExtensions.some(ext =>
      file.originalname.toLowerCase().endsWith(ext)
    );

    if (isMimeAllowed || isExtensionAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF and DOCX files are allowed.'));
    }
  }
});

/**
 * POST /api/analyze/text
 * Analyzes resume and job description
 * Body: { resume: string, jobDescription: string }
 */
router.post('/text', (req, res) => {
  try {
    const { resume, jobDescription } = req.body;

    // Validate input
    if (!resume || !jobDescription) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both resume and jobDescription are required'
      });
    }

    if (typeof resume !== 'string' || typeof jobDescription !== 'string') {
      return res.status(400).json({
        error: 'Invalid input format',
        message: 'resume and jobDescription must be strings'
      });
    }

    // Perform analysis
    const result = analyzeResumeAndJD(resume, jobDescription);
    
    console.log('Analysis Result:', result);
    console.log('Matched Skills in result:', result.matchedSkills);
    console.log('ATS Score Breakdown:', result.atsScoreBreakdown);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/analyze/upload
 * Analyzes resume and job description from uploaded files
 * Files: resume (PDF/DOCX), jobDescription (PDF/DOCX)
 */
router.post(
  '/upload',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'jobDescription', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // Validate files exist
      if (!req.files || !req.files.resume || !req.files.jobDescription) {
        return res.status(400).json({
          error: 'Missing required files',
          message: 'Both resume and jobDescription files are required'
        });
      }

      const resumeFile = req.files.resume[0];
      const jobDescriptionFile = req.files.jobDescription[0];

      // Perform analysis
      const result = await analyzeUploadedFiles(resumeFile, jobDescriptionFile);

      res.json(result);
    } catch (error) {
      console.error('File Upload API Error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * Error handler for multer
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size exceeds 10MB limit'
      });
    }
    return res.status(400).json({
      error: 'File upload error',
      message: error.message
    });
  }

  if (error) {
    return res.status(400).json({
      error: 'File processing error',
      message: error.message
    });
  }

  next();
});

module.exports = router;
