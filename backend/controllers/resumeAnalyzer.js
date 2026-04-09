const TFIDFVectorizer = require('../utils/tfidf');
const { cosineSimilarity } = require('../utils/cosine-similarity');
const { normalizeKeyword, normalizeKeywords, KEYWORD_NORMALIZATION } = require('../utils/keywordNormalizer');

/**
 * Comprehensive categorized skill dictionary
 * All keywords are lowercase for case-insensitive matching
 */
const SKILL_KEYWORDS = {
  'Programming Languages': [
    // NOTE: Removed 'go', 'r', 'c' — too short, cause false positives on common English words
    'javascript', 'python', 'java', 'csharp', 'c#', 'typescript', 'ruby', 'php',
    'golang', 'rust', 'kotlin', 'swift', 'objective-c', 'c++', 'scala', 'perl',
    'matlab', 'haskell', 'clojure', 'groovy', 'bash', 'shell', 'powershell'
  ],
  'Frontend': [
    'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs', 'vue.js',
    'svelte', 'ember', 'nextjs', 'next.js', 'gatsby', 'html', 'css', 'scss', 'sass',
    'less', 'webpack', 'babel', 'redux', 'mobx', 'graphql', 'apollo', 'tailwind', 'bootstrap',
    'material ui', 'materialui', 'semantic ui', 'vue router', 'react router'
  ],
  'Backend': [
    'nodejs', 'node.js', 'express', 'fastapi', 'flask', 'django', 'asp.net', 'asp net',
    'spring', 'springboot', 'spring boot', 'rails', 'laravel', 'symfony', 'nest.js', 'nestjs',
    'fastify', 'hapi', 'koa', 'deno', 'golang', 'rust', 'sqlmodel', 'sqlalchemy',
    'pydantic', 'uvicorn', 'gunicorn', 'celery', 'rabbitmq', 'kafka'
  ],
  'Databases': [
    'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'firebase', 'firestore',
    'redis', 'cassandra', 'elasticsearch', 'dynamodb', 'oracle', 'mssql', 'sqlite', 'mariadb',
    'couchdb', 'neo4j', 'influxdb', 'memcached', 'solr', 'supabase', 'planetscale',
    'sqlalchemy', 'sqlmodel', 'prisma', 'sequelize', 'mongoose'
  ],
  'DevOps': [
    'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab-ci', 'github actions', 'github-actions',
    'circleci', 'travis ci', 'ansible', 'puppet', 'chef', 'terraform',
    'helm', 'prometheus', 'grafana', 'elk', 'datadog', 'newrelic', 'splunk', 'cloudwatch'
  ],
  'Cloud': [
    'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud',
    'ibm cloud', 'heroku', 'digitalocean', 'vercel', 'netlify', 'cloudflare',
    'ec2', 's3', 'lambda', 'rds', 'ecs', 'app engine', 'cloud run'
  ],
  'Tools & Platforms': [
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'linux', 'windows',
    'macos', 'unix', 'vim', 'vscode', 'intellij', 'eclipse', 'xcode', 'postman',
    'swagger', 'npm', 'yarn', 'pip', 'maven', 'gradle', 'nginx',
    'apache', 'pm2', 'vagrant', 'vmware', 'virtualbox', 'jupyter', 'jupyter notebook'
  ],
  'Data Science & ML': [
    // Python ML/Data ecosystem — commonly listed in JDs as section headers like
    // "Required Skills", "Key Skills", "Requirements", "Qualifications"
    'numpy', 'pandas', 'matplotlib', 'seaborn', 'plotly', 'scipy',
    'scikit-learn', 'sklearn', 'tensorflow', 'keras', 'pytorch', 'torch',
    'huggingface', 'transformers', 'langchain', 'openai', 'anthropic',
    'xgboost', 'lightgbm', 'catboost', 'opencv', 'pillow', 'nltk', 'spacy',
    'pydantic', 'sqlalchemy', 'sqlmodel', 'alembic', 'airflow',
    'mlflow', 'wandb', 'dvc', 'bentoml', 'fastai', 'stable diffusion',
    'machine learning', 'deep learning', 'nlp', 'computer vision',
    'data analysis', 'data science', 'data engineering', 'etl',
    'statistics', 'linear algebra', 'neural network', 'llm', 'generative ai'
  ],
  'APIs & Architecture': [
    'rest', 'restful', 'rest api', 'graphql', 'grpc', 'websocket', 'webhook',
    'microservices', 'monolith', 'serverless', 'event-driven', 'message queue',
    'api gateway', 'load balancer', 'cdn', 'oauth', 'jwt', 'openapi'
  ]
};

/**
 * Escape special regex characters in string
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract skills from text grouped by category
 * Returns object with categories as keys and arrays of found skills as values
 */
// Skills that are too short or common to match with simple \b word boundary.
// These require a stricter context (comma/bullet list, colon list, etc.) to avoid
// false positives like "GD Round" being picked up as Go language.
const CONTEXT_SENSITIVE_SKILLS = new Set([
  // Removed entirely — too ambiguous as single words
]);

function extractSkillsByCategory(text) {
  const lowerText = text.toLowerCase();
  const foundSkills = {};

  // Initialize each category with empty array
  Object.keys(SKILL_KEYWORDS).forEach(category => {
    foundSkills[category] = [];
  });

  // Search for each skill
  Object.entries(SKILL_KEYWORDS).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      const escapedKeyword = escapeRegex(keyword);

      // For multi-word skills (e.g. "machine learning", "spring boot"), do a simple substring check
      // For single-word skills, use strict word-boundary matching
      let found = false;
      if (keyword.includes(' ')) {
        // Multi-word: check full phrase with word boundaries
        const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
        found = regex.test(lowerText);
      } else {
        // Single word: strict word boundary — avoids 'go' matching 'going', 'good'
        const regex = new RegExp(`(?<![a-z0-9])${escapedKeyword}(?![a-z0-9])`, 'i');
        found = regex.test(lowerText);
      }

      if (found) {
        const skillLower = keyword.toLowerCase();
        if (!foundSkills[category].find(s => s.toLowerCase() === skillLower)) {
          foundSkills[category].push(keyword);
        }
      }
    });
  });

  return foundSkills;
}

/**
 * Extract all keywords from text (flat array, case-insensitive)
 * Used for backward compatibility
 * Applies keyword normalization for better matching
 */
function extractKeywords(text) {
  const skillsByCategory = extractSkillsByCategory(text);
  const allSkills = new Set();

  Object.values(skillsByCategory).forEach(skills => {
    skills.forEach(skill => {
      // Normalize the skill before adding
      const normalized = normalizeKeyword(skill);
      allSkills.add(normalized);
    });
  });

  return Array.from(allSkills);
}

/**
 * Calculate keyword density component (40% weight)
 * Returns 0-100 based on percentage of JD keywords found in resume
 * Uses normalized keywords for better matching
 */
function calculateKeywordDensity(resume, jd) {
  const allJDKeywords = extractKeywords(jd);
  const resumeKeywords = extractKeywords(resume);

  if (allJDKeywords.length === 0) return 0;

  // Normalize for comparison
  const normalizedJDKeywords = new Set(allJDKeywords.map(k => normalizeKeyword(k)));
  const normalizedResumeKeywords = new Set(resumeKeywords.map(k => normalizeKeyword(k))); 

  const matchedKeywords = Array.from(normalizedJDKeywords).filter(keyword =>
    normalizedResumeKeywords.has(keyword)
  );

  const score = (matchedKeywords.length / normalizedJDKeywords.size) * 100;
  return Math.min(score, 100);
}

/**
 * Calculate required skills presence component (30% weight)
 * Returns 0-100 based on how many required skill categories are represented
 * Uses normalized keywords for better matching
 * IMPORTANT: Does NOT artificially inflate to 100 if skills are missing
 */
function calculateSkillsPresence(resumeSkillsByCategory, jdSkillsByCategory) {
  const requiredCategories = Object.keys(jdSkillsByCategory);
  const requiredSkills = Object.values(jdSkillsByCategory).flat();

  if (requiredSkills.length === 0) return 0;

  // Count how many required skills are present (using normalization)
  let presentSkillCount = 0;
  requiredSkills.forEach(reqSkill => {
    const normalizedReqSkill = normalizeKeyword(reqSkill);
    Object.values(resumeSkillsByCategory).forEach(resumeSkillsList => {
      if (resumeSkillsList.some(s => normalizeKeyword(s) === normalizedReqSkill)) {
        presentSkillCount++;
      }
    });
  });

  // Calculate accurate skills score without artificial inflation
  const score = (presentSkillCount / requiredSkills.length) * 100;
  
  // Log for debugging
  console.log('[ATS] Skills Calculation: ' + presentSkillCount + ' matched out of ' + requiredSkills.length);
  console.log('[ATS] Raw skills score: ' + score.toFixed(2) + '%');
  
  return Math.round(score); // Return actual score, don't cap at artificial 100
}

/**
 * Detect standard resume sections
 * Returns object with section detection results
 */
function detectResumeSections(text) {
  if (!text || typeof text !== 'string') {
    return { detected: [], score: 0 };
  }

  const lowerText = text.toLowerCase();
  const sections = {
    education: /(?:education|degree|university|college|school|diploma|bachelor's?|master's?|phd|b\.s\.|m\.s\.|m\.b\.a\.)/i,
    experience: /(?:experience|professional experience|work experience|employment|career|job|position)/i,
    skills: /(?:skills|technical skills|core competencies|competencies|proficiencies|expertise)/i,
    contact: /(?:email|phone|linkedin|contact|address)/i,
    summary: /(?:summary|objective|professional summary|about|profile)/i
  };

  const detected = [];
  Object.entries(sections).forEach(([section, regex]) => {
    if (regex.test(lowerText)) {
      detected.push(section);
    }
  });

  // Standard resume should have at least 3 sections
  const score = Math.min((detected.length / 3) * 100, 100);

  return { detected, count: detected.length, score };
}

/**
 * Calculate formatting indicators component (10% weight)
 * Returns 0-100 based on resume structure and formatting
 */
function calculateFormattingScore(resume) {
  if (!resume || typeof resume !== 'string') {
    return 0;
  }

  let formattingScore = 0;
  const indicators = {
    hasBulletPoints: 0,
    hasLineBreaks: 0,
    hasMultipleSections: 0,
    hasStructuredDates: 0,
    hasConsistentFormatting: 0
  };

  // Check for bullet points (common resume format)
  if (/[-•*]\s/m.test(resume)) {
    indicators.hasBulletPoints = 20;
  }

  // Check for line breaks and structure
  const lineCount = (resume.match(/\n/g) || []).length;
  if (lineCount > 15) {
    indicators.hasLineBreaks = 20;
  }

  // Check for multiple sections (indicated by multiple capital phrases)
  const capitalPhraseCount = (resume.match(/\n[A-Z][A-Z\s]{2,}/g) || []).length;
  if (capitalPhraseCount >= 3) {
    indicators.hasMultipleSections = 20;
  }

  // Check for date patterns (YYYY-YYYY or similar)
  if (/(\d{4}\s*[-–]\s*\d{4})|(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(resume)) {
    indicators.hasStructuredDates = 20;
  }

  // Check for consistent formatting (presence of standard separators)
  if (/(\s{2,}|\t|[—–-]\s|\|)/g.test(resume)) {
    indicators.hasConsistentFormatting = 20;
  }

  formattingScore = Object.values(indicators).reduce((a, b) => a + b, 0);
  return Math.min(formattingScore, 100);
}

/**
 * Calculate comprehensive ATS Score with weighted components
 * Weights:
 * - 40% Keyword Density
 * - 30% Skills Presence (NO ARTIFICIAL INFLATION)
 * - 20% Resume Sections
 * - 10% Formatting Indicators
 * 
 * This score reflects actual resume quality relative to JD requirements
 */
function calculateAtsScore(resume, jd, resumeSkillsByCategory, jdSkillsByCategory) {
  // Component 1: Keyword Density (40%)
  const keywordDensity = calculateKeywordDensity(resume, jd);
  console.log('[ATS] Keyword Density: ' + keywordDensity.toFixed(2) + '%');

  // Component 2: Skills Presence (30%)
  const skillsPresence = calculateSkillsPresence(
    resumeSkillsByCategory || {},
    jdSkillsByCategory || {}
  );
  console.log('[ATS] Skills Presence: ' + skillsPresence.toFixed(2) + '%');

  // Component 3: Resume Sections (20%)
  const sectionDetection = detectResumeSections(resume);
  const sectionsScore = sectionDetection.score;
  console.log('[ATS] Sections Score: ' + sectionsScore.toFixed(2) + '%');

  // Component 4: Formatting Indicators (10%)
  const formattingScoreValue = calculateFormattingScore(resume);
  console.log('[ATS] Formatting Score: ' + formattingScoreValue.toFixed(2) + '%');

  // Calculate weighted score (no artificial capping)
  const finalScore = Math.round(
    (keywordDensity * 0.4) +
    (skillsPresence * 0.3) +
    (sectionsScore * 0.2) +
    (formattingScoreValue * 0.1)
  );

  console.log('[ATS] Final ATS Score: ' + finalScore + '%');

  return {
    score: finalScore,  // Return actual score without artificial capping
    breakdown: {
      keywordDensity: Math.round(keywordDensity),
      skillsPresence: Math.round(skillsPresence),
      sectionDetection: {
        detected: sectionDetection.detected,
        count: sectionDetection.count,
        score: Math.round(sectionsScore)
      },
      formattingIndicators: Math.round(formattingScoreValue)
    },
    weights: {
      keywordDensity: 0.4,
      skillsPresence: 0.3,
      sectionDetection: 0.2,
      formattingIndicators: 0.1
    }
  };
}

/**
 * Extract years of experience from text using regex patterns
 * Detects patterns like: "3 years", "5+ years", "2 yrs", "7 year", etc.
 * Returns array of detected experience values
 */
function extractYearsOfExperience(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const lowerText = text.toLowerCase();
  const yearsPatterns = [
    // Pattern: "X+ years" or "X+ yrs" or "X+ year"
    /\b(\d+)\+?\s*(?:years?|yrs?)\b/gi,
  ];

  const experienceValues = new Set();

  yearsPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(lowerText)) !== null) {
      const years = parseInt(match[1], 10);
      if (!isNaN(years) && years > 0 && years <= 100) {
        experienceValues.add(years);
      }
    }
  });

  return Array.from(experienceValues).sort((a, b) => a - b);
}

/**
 * Calculate experience match score
 * Compares resume years with job description required years
 */
function calculateExperienceMatch(resumeExperience, jdExperience) {
  // If experience data not found, return neutral score
  if (!resumeExperience || resumeExperience.length === 0 || !jdExperience || jdExperience.length === 0) {
    return {
      score: 50,
      resumeYears: resumeExperience && resumeExperience.length > 0 ? Math.max(...resumeExperience) : null,
      requiredYears: jdExperience && jdExperience.length > 0 ? Math.max(...jdExperience) : null,
      isQualified: null,
      message: 'Experience requirement not clearly specified'
    };
  }

  // Get the highest years mentioned in each
  const maxResumeYears = Math.max(...resumeExperience);
  const maxJDYears = Math.max(...jdExperience);

  let score = 0;
  let isQualified = false;
  let message = '';

  if (maxResumeYears >= maxJDYears) {
    // Resume meets or exceeds requirement
    const surplus = maxResumeYears - maxJDYears;
    score = Math.min(100, 85 + (surplus * 2));
    isQualified = true;
    message = `Qualifies! Has ${maxResumeYears} years, requires ${maxJDYears} years.`;
  } else {
    // Resume lacks required years
    const deficit = maxJDYears - maxResumeYears;
    score = Math.max(0, 85 - (deficit * 15));
    isQualified = false;
    message = `⚠️ Experience gap! Has ${maxResumeYears} years, requires ${maxJDYears} years (${deficit} year${deficit > 1 ? 's' : ''} short).`;
  }

  return {
    score: Math.round(score),
    resumeYears: maxResumeYears,
    requiredYears: maxJDYears,
    isQualified,
    message
  };
}

/**
 * Find matched and missing skills grouped by category
 * Uses normalized keywords for better matching across variations
 */
function findMatchedAndMissingSkills(resumeSkillsByCategory, jdSkillsByCategory) {
  const matchedSkills = {};
  const missingSkills = {};

  // Initialize categories
  Object.keys(jdSkillsByCategory).forEach(category => {
    matchedSkills[category] = [];
    missingSkills[category] = [];
  });

  // Find matched and missing skills using normalization
  Object.entries(jdSkillsByCategory).forEach(([category, jdSkills]) => {
    const resumeSkills = resumeSkillsByCategory[category] || [];

    jdSkills.forEach(jdSkill => {
      const normalizedJDSkill = normalizeKeyword(jdSkill);
      const isMatched = resumeSkills.some(
        rSkill => normalizeKeyword(rSkill) === normalizedJDSkill
      );

      if (isMatched) {
        matchedSkills[category].push(jdSkill);
      } else {
        missingSkills[category].push(jdSkill);
      }
    });
  });

  return { matchedSkills, missingSkills };
}

/**
 * Main analysis function
 */
function analyzeResumeAndJD(resume, jobDescription) {
  try {
    // Extract skills grouped by category
    const resumeSkillsByCategory = extractSkillsByCategory(resume);
    const jdSkillsByCategory = extractSkillsByCategory(jobDescription);

    // Find matched and missing skills by category
    const { matchedSkills, missingSkills } = findMatchedAndMissingSkills(
      resumeSkillsByCategory,
      jdSkillsByCategory
    );

    // Extract experience years
    const resumeExperience = extractYearsOfExperience(resume);
    const jdExperience = extractYearsOfExperience(jobDescription);
    const experienceMatch = calculateExperienceMatch(resumeExperience, jdExperience);

    // Extract flat arrays for backward compatibility
    const resumeSkills = extractKeywords(resume);
    const jdSkills = extractKeywords(jobDescription);

    // Initialize TF-IDF Vectorizer with shared vocabulary
    const vectorizer = new TFIDFVectorizer();
    
    // CRITICAL: Fit on both documents together to create shared vocabulary
    vectorizer.fit([resume, jobDescription]);

    // DEBUG: Log vocabulary building and token analysis
    const resumeTokens = vectorizer.preprocess(resume);
    const jdTokens = vectorizer.preprocess(jobDescription);
    const vocabulary = vectorizer.getVocabulary();
    
    // Calculate overlap in vocabulary
    const resumeTokensSet = new Set(resumeTokens);
    const jdTokensSet = new Set(jdTokens);
    const sharedTokens = new Set([...resumeTokensSet].filter(x => jdTokensSet.has(x)));
    
    console.log('[TF-IDF] === Vocabulary Analysis ===');
    console.log('[TF-IDF] Total vocabulary size:', vectorizer.getVocabularySize());
    console.log('[TF-IDF] Resume unique tokens:', resumeTokensSet.size);
    console.log('[TF-IDF] JD unique tokens:', jdTokensSet.size);
    console.log('[TF-IDF] Shared tokens:', sharedTokens.size);
    console.log('[TF-IDF] Resume tokens (first 15):', Array.from(resumeTokensSet).slice(0, 15));
    console.log('[TF-IDF] JD tokens (first 15):', Array.from(jdTokensSet).slice(0, 15));
    console.log('[TF-IDF] Shared tokens:', Array.from(sharedTokens).slice(0, 15));

    // Transform both texts into vectors using shared vocabulary
    const resumeVector = vectorizer.transform(resume);
    const jdVector = vectorizer.transform(jobDescription);

    // Calculate cosine similarity
    let matchPercentage = Math.round(cosineSimilarity(resumeVector, jdVector) * 100);
    console.log('[TF-IDF] Cosine similarity: ' + matchPercentage + '%');

    // ROBUST FALLBACK: If cosine similarity is 0, use enhanced keyword overlap
    if (matchPercentage === 0) {
      console.log('[TF-IDF FALLBACK] Cosine similarity is 0, calculating enhanced keyword overlap...');
      
      // Calculate keyword overlap percentage using normalized skills
      const normalizedResumeSkills = new Set(resumeSkills.map(s => normalizeKeyword(s)));
      const normalizedJDSkills = new Set(jdSkills.map(s => normalizeKeyword(s)));
      
      const skillsOverlap = Array.from(normalizedJDSkills).filter(skill => 
        normalizedResumeSkills.has(skill)
      ).length;
      
      // Also calculate token Jaccard as secondary metric
      const keywordOverlap = sharedTokens.size;
      const totalUniqueTokens = resumeTokensSet.size + jdTokensSet.size - sharedTokens.size;
      const jaccardScore = totalUniqueTokens > 0 ? (keywordOverlap / totalUniqueTokens) * 100 : 0;
      
      // Blend both metrics: 60% skills matching + 40% Jaccard token overlap
      const enhancedScore = Math.round((skillsOverlap / Math.max(normalizedJDSkills.size, 1)) * 60 + jaccardScore * 0.4);
      
      matchPercentage = Math.max(enhancedScore, 30); // Minimum 30% for any overlap
      console.log('[TF-IDF FALLBACK] Skills overlap:', skillsOverlap, 'out of', normalizedJDSkills.size);
      console.log('[TF-IDF FALLBACK] Jaccard similarity: ' + jaccardScore.toFixed(2) + '%');
      console.log('[TF-IDF FALLBACK] Enhanced score: (' + (skillsOverlap / Math.max(normalizedJDSkills.size, 1) * 60).toFixed(2) + ' + ' + (jaccardScore * 0.4).toFixed(2) + ') = ' + matchPercentage + '%');
    }

    // Calculate ATS Score with detailed breakdown
    const atsScoreResult = calculateAtsScore(resume, jobDescription, resumeSkillsByCategory, jdSkillsByCategory);

    // COMBINED SCORE: Blend TF-IDF semantic matching with ATS score accuracy
    // finalScore = (tfidfScore * 0.6) + (atsScore * 0.4)
    // 60% weight to semantic similarity, 40% weight to ATS accuracy
    const tfidfScore = matchPercentage;
    const atsScore = atsScoreResult.score;
    const combinedMatchScore = Math.round((tfidfScore * 0.6) + (atsScore * 0.4));
    
    console.log('[COMBINED SCORE] TF-IDF Score: ' + tfidfScore + '%');
    console.log('[COMBINED SCORE] ATS Score: ' + atsScore + '%');
    console.log('[COMBINED SCORE] Final Resume Match Score: ' + combinedMatchScore + '%');
    console.log('[COMBINED SCORE] Formula: (' + tfidfScore + ' * 0.6) + (' + atsScore + ' * 0.4) = ' + combinedMatchScore);

    return {
      matchPercentage: combinedMatchScore,  // MAIN SCORE: This is what displays as "Resume Match Score"
      tfidfScore: tfidfScore,                // Detailed breakdown
      atsScore: atsScore,                    // Detailed breakdown
      atsScoreBreakdown: atsScoreResult.breakdown,
      matchedSkills,
      missingSkills,
      extractedResumeSkills: resumeSkillsByCategory,
      extractedJDSkills: jdSkillsByCategory,
      experience: {
        resumeYears: resumeExperience,
        requiredYears: jdExperience,
        matchScore: experienceMatch.score,
        isQualified: experienceMatch.isQualified,
        message: experienceMatch.message
      },
      // Backward compatibility
      missingKeywords: jdSkills.filter(
        skill => !resumeSkills.some(rSkill => rSkill.toLowerCase() === skill.toLowerCase())
      ),
      allRequiredSkills: jdSkills,
      providedSkills: resumeSkills
    };
  } catch (error) {
    console.error('Analysis Error:', error);
    throw new Error('Failed to analyze resume and job description');
  }
}

module.exports = {
  analyzeResumeAndJD,
  extractKeywords,
  extractSkillsByCategory,
  calculateAtsScore,
  findMatchedAndMissingSkills,
  extractYearsOfExperience,
  calculateExperienceMatch,
  calculateKeywordDensity,
  calculateSkillsPresence,
  detectResumeSections,
  calculateFormattingScore
};
