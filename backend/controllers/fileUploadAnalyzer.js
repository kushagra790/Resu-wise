const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { analyzeResumeAndJD, extractYearsOfExperience, calculateExperienceMatch } = require('./resumeAnalyzer');

/**
 * Extract text from PDF file
 */
function extractTextFromMalformedPDF(fileBuffer) {
  try {
    const rawData = fileBuffer.toString('latin1');
    const matches = rawData.match(/\(([^\)]+)\)/g);
    if (!matches || matches.length === 0) {
      return '';
    }

    const decoded = matches
      .map(item => item.slice(1, -1))
      .map(text => text.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\([()\\])/g, '$1'))
      .join(' ');

    return decoded.replace(/\s+/g, ' ').trim();
  } catch (error) {
    return '';
  }
}

async function extractTextFromPDF(fileBuffer) {
  try {
    const data = await pdfParse(fileBuffer);
    if (data && typeof data.text === 'string' && data.text.trim().length > 0) {
      return data.text;
    }
    throw new Error('PDF text extraction returned empty content');
  } catch (error) {
    console.warn('PDF parser failed:', error.message);

    const fallbackText = extractTextFromMalformedPDF(fileBuffer);
    if (fallbackText && fallbackText.trim().length > 20) {
      console.log('PDF fallback extraction succeeded with malformed PDF content');
      return fallbackText;
    }

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
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (!file.buffer) {
    throw new Error('File buffer is missing or invalid');
  }
  
  if (file.buffer.length === 0) {
    throw new Error('File is empty');
  }

  const mimeType = file.mimetype;
  const filename = file.originalname;

  console.log(`Extracting from file: ${filename} (type: ${mimeType}, size: ${file.buffer.length})`);

  if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
    return await extractTextFromPDF(file.buffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename.endsWith('.docx')
  ) {
    return await extractTextFromDOCX(file.buffer);
  } else {
    throw new Error(`Unsupported file format. File: ${filename} (type: ${mimeType}). Please upload PDF or DOCX files only.`);
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

    // Validate file buffers exist
    if (!resumeFile.buffer || resumeFile.buffer.length === 0) {
      throw new Error('Resume file buffer is empty');
    }
    if (!jobDescriptionFile.buffer || jobDescriptionFile.buffer.length === 0) {
      throw new Error('Job description file buffer is empty');
    }

    console.log(`Extracting text from resume (${resumeFile.originalname}, ${resumeFile.size} bytes)...`);
    // Extract text from files
    const resumeText = await extractTextFromFile(resumeFile);
    
    console.log(`Extracting text from job description (${jobDescriptionFile.originalname}, ${jobDescriptionFile.size} bytes)...`);
    const jobDescriptionText = await extractTextFromFile(jobDescriptionFile);

    // Validate extracted text
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error('Failed to extract text from resume file - file may be empty or corrupted');
    }
    if (!jobDescriptionText || jobDescriptionText.trim().length === 0) {
      throw new Error('Failed to extract text from job description file - file may be empty or corrupted');
    }

    console.log(`Resume text extracted: ${resumeText.length} characters`);
    console.log(`Job description text extracted: ${jobDescriptionText.length} characters`);

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
    console.error('File Upload Analysis Error:', error.message);
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
