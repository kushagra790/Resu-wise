const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { analyzeResumeAndJD, extractYearsOfExperience, calculateExperienceMatch } = require('./resumeAnalyzer');

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(fileBuffer) {
  try {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(fileBuffer) {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
}

/**
 * Extract text from uploaded file based on MIME type
 */
async function extractTextFromFile(file) {
  if (!file || !file.buffer) {
    throw new Error('No file provided');
  }

  const mimeType = file.mimetype;
  const filename = file.originalname;

  if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
    return await extractTextFromPDF(file.buffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename.endsWith('.docx')
  ) {
    return await extractTextFromDOCX(file.buffer);
  } else {
    throw new Error('Unsupported file format. Please upload PDF or DOCX files only.');
  }
}

/**
 * Analyze resume and job description from uploaded files
 */
async function analyzeUploadedFiles(resumeFile, jobDescriptionFile) {
  try {
    // Validate files exist
    if (!resumeFile) {
      throw new Error('Resume file is required');
    }
    if (!jobDescriptionFile) {
      throw new Error('Job Description file is required');
    }

    // Extract text from files
    const resumeText = await extractTextFromFile(resumeFile);
    const jobDescriptionText = await extractTextFromFile(jobDescriptionFile);

    // Validate extracted text
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error('Failed to extract text from resume file');
    }
    if (!jobDescriptionText || jobDescriptionText.trim().length === 0) {
      throw new Error('Failed to extract text from job description file');
    }

    // Pass to existing analyzer logic
    const result = analyzeResumeAndJD(resumeText, jobDescriptionText);

    return {
      success: true,
      data: result,
      fileInfo: {
        resumeFileName: resumeFile.originalname,
        jobDescriptionFileName: jobDescriptionFile.originalname
      }
    };
  } catch (error) {
    console.error('File Upload Analysis Error:', error);
    throw error;
  }
}

module.exports = {
  extractTextFromFile,
  extractTextFromPDF,
  extractTextFromDOCX,
  analyzeUploadedFiles,
  extractYearsOfExperience,
  calculateExperienceMatch
};
