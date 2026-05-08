const express = require('express');
const multer = require('multer');

const router = express.Router();
const maxUploadMb = Number(process.env.UPLOAD_FILE_SIZE_MB || 2);
const maxUploadBytes = maxUploadMb * 1024 * 1024;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxUploadBytes
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

    const { analyzeResumeAndJD } = require('../controllers/resumeAnalyzer');
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
      // Validate files exist — more robust checking
      if (!req.files) {
        console.error('No files in request');
        return res.status(400).json({
          success: false,
          error: 'Missing required files',
          message: 'No files received in request'
        });
      }

      if (!req.files.resume || req.files.resume.length === 0) {
        console.error('Resume file missing');
        return res.status(400).json({
          success: false,
          error: 'Missing required file',
          message: 'Resume file is required'
        });
      }

      if (!req.files.jobDescription || req.files.jobDescription.length === 0) {
        console.error('Job description file missing');
        return res.status(400).json({
          success: false,
          error: 'Missing required file',
          message: 'Job description file is required'
        });
      }

      const resumeFile = req.files.resume[0];
      const jobDescriptionFile = req.files.jobDescription[0];

      console.log(`Processing files: ${resumeFile.originalname} and ${jobDescriptionFile.originalname}`);

      const { analyzeUploadedFiles } = require('../controllers/fileUploadAnalyzer');
      const result = await analyzeUploadedFiles(resumeFile, jobDescriptionFile);

      res.json(result);
    } catch (error) {
      console.error('File Upload API Error:', error.message);
      res.status(400).json({
        success: false,
        error: 'File analysis failed',
        message: error.message
      });
    }
  }
);

/**
 * Error handler for multer and other errors
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer Error:', error.code, error.message);
    
    if (error.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: `File size exceeds ${maxUploadMb}MB limit`
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        message: 'Upload only one resume and one job description file'
      });
    }
    
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      message: error.message
    });
  }

  if (error) {
    console.error('Upload Error:', error.message);
    return res.status(400).json({
      success: false,
      error: 'File processing error',
      message: error.message
    });
  }

  next();
});

module.exports = router;
