const TFIDFVectorizer = require('../utils/tfidf');
const { cosineSimilarity } = require('../utils/cosine-similarity');
const { normalizeKeyword, normalizeKeywords, KEYWORD_NORMALIZATION } = require('../utils/keywordNormalizer');
const stringSimilarity = require('string-similarity');

// NEW FEATURES: Import enhanced utilities
const { findFuzzyMatch, batchFuzzyMatch } = require('../utils/fuzzyMatcher');
const { parseSkillRequirements, calculateWeightedSkillScore, getMissingSkillsPrioritized } = require('../utils/skillRequirementParser');
const { calculateSemanticSimilarity, getSemanticInsights } = require('../utils/semanticSimilarity');
const { calculateRelationshipScore, getLearningPath, suggestComplementarySkills } = require('../utils/skillRelationships');

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
  const matchPercentage = matchedKeywords.length / normalizedJDKeywords.size;
  
  // If less than 40% of critical JD keywords found in resume, penalize heavily
  // This prevents false positives from generic word matches
  if (normalizedJDKeywords.size > 5 && matchPercentage < 0.4) {
    return Math.round(Math.max(score * 0.5, 0)); // Halve score as penalty
  }
  
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

  // Calculate skills score and penalize missing critical skills
  const missingCount = requiredSkills.length - presentSkillCount;
  const missingPercentage = requiredSkills.length > 0 ? missingCount / requiredSkills.length : 0;
  
  let score = (presentSkillCount / requiredSkills.length) * 100;
  
  // If more than 25% of JD skills are missing, apply heavy penalty
  // Missing critical skills = not a good fit, even if some match
  if (missingPercentage > 0.25) {
    const penaltyPercentage = missingPercentage * 50; // Each 1% missing above 25% = 0.5 point penalty
    score = Math.max(0, score - penaltyPercentage);
    console.log('[ATS] Skills Calculation: ' + presentSkillCount + ' matched out of ' + requiredSkills.length + ' (Missing: ' + (missingPercentage * 100).toFixed(0) + '% - PENALTY APPLIED)');
  } else {
    console.log('[ATS] Skills Calculation: ' + presentSkillCount + ' matched out of ' + requiredSkills.length);
  }
  
  console.log('[ATS] Raw skills score: ' + score.toFixed(2) + '%');
  return Math.round(score);
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

  // Require core sections: experience, skills, education for good score
  // DON'T artificially inflate for basic formatting
  const coreRequired = ['experience', 'skills', 'education'];
  const hasCoreCount = coreRequired.filter(s => detected.includes(s)).length;
  const score = Math.min((hasCoreCount / 3) * 100 * 0.75, 75); // Max 75% instead of 100

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

  // Check for bullet points (common resume format) - reduced from 20 to 8
  if (/[-•*]\s/m.test(resume)) {
    indicators.hasBulletPoints = 8;
  }

  // Check for line breaks and structure - reduced from 20 to 8
  const lineCount = (resume.match(/\n/g) || []).length;
  if (lineCount > 15) {
    indicators.hasLineBreaks = 8;
  }

  // Check for multiple sections (indicated by multiple capital phrases) - reduced from 20 to 10
  const capitalPhraseCount = (resume.match(/\n[A-Z][A-Z\s]{2,}/g) || []).length;
  if (capitalPhraseCount >= 3) {
    indicators.hasMultipleSections = 10;
  }

  // Check for date patterns (YYYY-YYYY or similar) - reduced from 20 to 8
  if (/(\d{4}\s*[-–]\s*\d{4})|(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(resume)) {
    indicators.hasStructuredDates = 8;
  }

  // Check for consistent formatting (presence of standard separators) - reduced from 20 to 12
  if (/(\s{2,}|\t|[—–-]\s|\|)/g.test(resume)) {
    indicators.hasConsistentFormatting = 12;
  }

  formattingScore = Object.values(indicators).reduce((a, b) => a + b, 0);
  return Math.min(formattingScore, 50); // Cap at 50 instead of 100
}

/**
 * Calculate ATS Score based on resume quality (independent of JD)
 * Evaluates structure, formatting, and completeness
 */
function calculateAtsScoreResumeOnly(resume) {
  if (!resume || typeof resume !== 'string') {
    return { score: 0, breakdown: {} };
  }

  const lowerResume = resume.toLowerCase();
  let score = 0;
  const breakdown = {};

  // 1. Section Quality (25% weight)
  const sections = {
    summary: /(?:summary|objective|professional summary|about|profile)/i,
    skills: /(?:skills|technical skills|core competencies|competencies|expertise)/i,
    education: /(?:education|degree|university|college|school)/i,
    projects: /(?:projects?|portfolio|work samples)/i,
    experience: /(?:experience|professional experience|work experience|employment|career)/i
  };

  const detectedSections = Object.entries(sections)
    .filter(([, regex]) => regex.test(lowerResume))
    .map(([section]) => section);

  const sectionScore = Math.min((detectedSections.length / Object.keys(sections).length) * 100, 100);
  breakdown.sections = {
    detected: detectedSections,
    count: detectedSections.length,
    score: Math.round(sectionScore)
  };
  score += breakdown.sections.score * 0.25;

  // 2. Formatting & Readability (35% weight)
  let formattingScore = 0;
  if (/[-•*]\s/m.test(resume)) formattingScore += 30;
  const lineCount = (resume.match(/\n/g) || []).length;
  if (lineCount > 12) formattingScore += 25;
  if (/\b(\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(resume)) formattingScore += 25;
  if (/([\s]{2,}|\t|[—–-]\s|\|)/g.test(resume)) formattingScore += 20;
  breakdown.formatting = { score: Math.min(formattingScore, 100) };
  score += breakdown.formatting.score * 0.35;

  // 3. Technical Skills Presence (25% weight)
  const skillsKeywords = ['javascript', 'typescript', 'react', 'nextjs', 'node', 'nodejs', 'express', 'redux', 'html', 'css', 'tailwind', 'git', 'docker', 'jest', 'github'];
  const foundSkills = new Set();
  skillsKeywords.forEach(skill => {
    if (lowerResume.includes(skill)) {
      foundSkills.add(skill);
    }
  });
  const skillsPresenceScore = Math.min((foundSkills.size / skillsKeywords.length) * 100, 100);
  breakdown.skillsPresence = {
    detected: Array.from(foundSkills),
    score: Math.round(skillsPresenceScore)
  };
  score += breakdown.skillsPresence.score * 0.25;

  // 4. Readability / Content Quality (15% weight)
  let readabilityScore = 0;
  if (resume.length > 450) readabilityScore += 35;
  const paragraphCount = resume.split(/\n\n+/).filter(p => p.trim().length > 20).length;
  if (paragraphCount >= 3) readabilityScore += 30;
  const avgSentenceLength = resume.split(/[.!?]+/).reduce((sum, s) => sum + s.trim().length, 0) / Math.max(resume.split(/[.!?]+/).filter(s => s.trim().length > 0).length, 1);
  if (avgSentenceLength < 130) readabilityScore += 35;
  breakdown.readability = { score: Math.min(readabilityScore, 100) };
  score += breakdown.readability.score * 0.15;

  // 5. Contact Bonus (up to 10 points)
  let contactBonus = 0;
  if (/\b\d{10,}\b/.test(lowerResume)) contactBonus += 4;
  if (/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(lowerResume)) contactBonus += 4;
  if (/(?:linkedin|github|portfolio|website)/i.test(lowerResume)) contactBonus += 2;
  breakdown.contact = { score: Math.min(contactBonus, 10) };

  return {
    score: Math.round(Math.min(score + breakdown.contact.score, 100)),
    breakdown
  };
}

/**
 * Calculate Match Score between Resume and JD
 * Formula: (TF-IDF × 0.40) + (Semantic × 0.30) + (Skill Match × 0.30)
 */
function calculateMatchScore(resume, jd, resumeSkillsByCategory, jdSkillsByCategory) {
  // Component 1: TF-IDF Similarity (40%)
  const tfidfScore = calculateTFIDFSimilarity(resume, jd, resumeSkillsByCategory, jdSkillsByCategory);
  
  // Component 2: Semantic Similarity (30%)
  const semanticScore = calculateSemanticSimilarityScore(resume, jd, resumeSkillsByCategory, jdSkillsByCategory);
  
  // Component 3: Skill Match (30%)
  const skillMatchScore = calculateSkillsMatch(resumeSkillsByCategory, jdSkillsByCategory);
  
  const finalScore = Math.round(
    (tfidfScore * 0.40) +
    (semanticScore * 0.30) +
    (skillMatchScore * 0.30)
  );

  return {
    score: Math.max(0, Math.min(100, finalScore)),
    breakdown: {
      tfidf: Math.round(tfidfScore),
      semantic: Math.round(semanticScore),
      skillMatch: Math.round(skillMatchScore)
    },
    weights: {
      tfidf: 0.40,
      semantic: 0.30,
      skillMatch: 0.30
    }
  };
}

/**
 * Calculate TF-IDF similarity between resume and JD
 */
function getTitle(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  return lines.length > 0 ? lines[0].toLowerCase() : '';
}

function calculateTitleSimilarity(resume, jd) {
  const resumeTitle = getTitle(resume);
  const jdTitle = getTitle(jd);
  if (!resumeTitle || !jdTitle) return 0;
  return stringSimilarity.compareTwoStrings(resumeTitle, jdTitle) * 100;
}

function calculateTokenJaccard(resume, jd) {
  const tfidf = new TFIDFVectorizer();
  const resumeTokens = new Set(tfidf.preprocess(resume));
  const jdTokens = new Set(tfidf.preprocess(jd));
  const sharedTokens = [...resumeTokens].filter(token => jdTokens.has(token)).length;
  const totalTokens = new Set([...resumeTokens, ...jdTokens]).size;
  return totalTokens === 0 ? 0 : (sharedTokens / totalTokens) * 100;
}

function calculateCategoryOverlap(resumeSkillsByCategory, jdSkillsByCategory) {
  const resumeCategories = Object.entries(resumeSkillsByCategory || {})
    .filter(([, skills]) => skills && skills.length > 0)
    .map(([category]) => category);
  const jdCategories = Object.entries(jdSkillsByCategory || {})
    .filter(([, skills]) => skills && skills.length > 0)
    .map(([category]) => category);

  if (jdCategories.length === 0) return 0;
  const shared = resumeCategories.filter(category => jdCategories.includes(category)).length;
  return (shared / jdCategories.length) * 100;
}

function calculateTFIDFSimilarity(resume, jd, resumeSkillsByCategory = {}, jdSkillsByCategory = {}) {
  try {
    const exactKeywordOverlap = calculateKeywordDensity(resume, jd);
    const categoryOverlap = calculateCategoryOverlap(resumeSkillsByCategory, jdSkillsByCategory);
    const titleSimilarity = calculateTitleSimilarity(resume, jd);
    const tokenJaccard = calculateTokenJaccard(resume, jd);

    const score = Math.round(
      (exactKeywordOverlap * 0.20) +
      (categoryOverlap * 0.50) +
      (tokenJaccard * 0.15) +
      (titleSimilarity * 0.15) +
      15
    );

    return Math.min(100, score);
  } catch (error) {
    console.error('TF-IDF calculation error:', error);
    return 0;
  }
}

/**
 * Calculate semantic similarity
 */
function calculateSemanticSimilarityScore(resume, jd, resumeSkillsByCategory = {}, jdSkillsByCategory = {}) {
  try {
    const semanticResult = calculateSemanticSimilarity(resume, jd);
    const keywordDensityScore = calculateKeywordDensity(resume, jd);
    const categoryOverlap = calculateCategoryOverlap(resumeSkillsByCategory, jdSkillsByCategory);
    const titleSimilarity = calculateTitleSimilarity(resume, jd);
    const tokenJaccard = calculateTokenJaccard(resume, jd);

    const finalScore = Math.round(
      (semanticResult.score * 0.08) +
      (keywordDensityScore * 0.12) +
      (categoryOverlap * 0.55) +
      (titleSimilarity * 0.15) +
      (tokenJaccard * 0.10) +
      15
    );

    return Math.min(100, finalScore);
  } catch (error) {
    console.error('Semantic similarity error:', error);
    return 0;
  }
}

/**
 * Calculate skill match score
 */
function calculateSkillsMatch(resumeSkills, jdSkills) {
  if (!resumeSkills || !jdSkills) return 0;

  const flatResumeSkills = Object.values(resumeSkills).flat();
  const normalizedResumeSkills = flatResumeSkills.map(skill => normalizeKeyword(skill));
  const resumeSkillSet = new Set(normalizedResumeSkills);

  let weightedMatches = 0;
  let totalJdSkills = 0;

  Object.values(jdSkills).forEach(jdCategorySkills => {
    jdCategorySkills.forEach(jdSkill => {
      totalJdSkills += 1;
      const normalizedJdSkill = normalizeKeyword(jdSkill);

      if (resumeSkillSet.has(normalizedJdSkill)) {
        weightedMatches += 1;
        return;
      }

      const fuzzyMatch = findFuzzyMatch(jdSkill, flatResumeSkills, 0.35);
      if (fuzzyMatch && fuzzyMatch.score >= 0.75) {
        weightedMatches += 0.8;
        return;
      }

      const relationship = calculateRelationshipScore(jdSkill, flatResumeSkills);
      if (relationship && relationship.score > 0) {
        weightedMatches += Math.min(0.6, relationship.score / 100);
        return;
      }

      // Partial credit for same broad category if the JD skill is from a category also present in the resume
      const resumeCategories = Object.entries(resumeSkills)
        .filter(([, skills]) => skills.length > 0)
        .map(([category]) => category);
      const jdCategories = Object.entries(jdSkills)
        .filter(([, skills]) => skills.length > 0)
        .map(([category]) => category);

      const categoryOverlap = jdCategories.some(category => resumeCategories.includes(category));
      if (categoryOverlap) {
        weightedMatches += 0.75;
      }
    });
  });

  return totalJdSkills > 0 ? Math.min(100, Math.round((weightedMatches / totalJdSkills) * 100)) : 0;
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
 * Main analysis function with ENHANCED features
 * Integrates:
 * - Fuzzy matching for typos
 * - Skill requirement differentiation (required/preferred/nice-to-have)
 * - Semantic similarity analysis
 * - Skill relationship mapping
 * - Comprehensive enhanced reporting
 */
function analyzeResumeAndJD(resume, jobDescription) {
  try {
    // ============ INPUT VALIDATION ============
    if (!resume || typeof resume !== 'string' || resume.trim().length === 0) {
      throw new Error('Invalid resume: Must be a non-empty string');
    }
    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
      throw new Error('Invalid job description: Must be a non-empty string');
    }
    if (resume.length > 50000 || jobDescription.length > 50000) {
      throw new Error('Input too large: Maximum 50,000 characters per document');
    }

    // ============ STEP 1: Extract Skills ============
    const resumeSkillsByCategory = extractSkillsByCategory(resume);
    const jdSkillsByCategory = extractSkillsByCategory(jobDescription);

    // Find matched and missing skills by category
    const { matchedSkills, missingSkills } = findMatchedAndMissingSkills(
      resumeSkillsByCategory,
      jdSkillsByCategory
    );

    // ============ STEP 2: Apply Fuzzy Matching (NEW) ============
    console.log('[FUZZY MATCH] Applying fuzzy matching for typos and variations...');
    const flatResumeSkills = Object.values(resumeSkillsByCategory).flat();
    const flatJDSkills = Object.values(jdSkillsByCategory).flat();
    const fuzzyMatches = batchFuzzyMatch(flatResumeSkills, flatJDSkills, 0.35);
    
    console.log('[FUZZY MATCH] Exact matches:', fuzzyMatches.exact.length);
    console.log('[FUZZY MATCH] Fuzzy matches:', fuzzyMatches.fuzzy.length);
    console.log('[FUZZY MATCH] Unmatched:', fuzzyMatches.unmatched.length);

    // ============ STEP 3: Parse Skill Requirements (NEW) ============
    console.log('[SKILL REQUIREMENTS] Parsing JD to identify requirement levels...');
    const skillRequirements = parseSkillRequirements(jobDescription, jdSkillsByCategory);
    const missingSkillsByLevel = {
      required: skillRequirements.required.filter(s => !flatResumeSkills.some(rs => normalizeKeyword(rs) === normalizeKeyword(s))),
      preferred: skillRequirements.preferred.filter(s => !flatResumeSkills.some(rs => normalizeKeyword(rs) === normalizeKeyword(s))),
      nicetoHave: skillRequirements.nicetoHave.filter(s => !flatResumeSkills.some(rs => normalizeKeyword(rs) === normalizeKeyword(s)))
    };
    
    const matchedSkillsByLevel = {
      required: skillRequirements.required.filter(s => flatResumeSkills.some(rs => normalizeKeyword(rs) === normalizeKeyword(s))),
      preferred: skillRequirements.preferred.filter(s => flatResumeSkills.some(rs => normalizeKeyword(rs) === normalizeKeyword(s))),
      nicetoHave: skillRequirements.nicetoHave.filter(s => flatResumeSkills.some(rs => normalizeKeyword(rs) === normalizeKeyword(s)))
    };

    const weightedSkillScore = calculateWeightedSkillScore(matchedSkillsByLevel, skillRequirements);
    console.log('[SKILL REQUIREMENTS] Weighted skill score:', weightedSkillScore.finalScore + '%');

    // ============ STEP 4: Calculate Semantic Similarity (NEW) ============
    console.log('[SEMANTIC] Calculating semantic similarity...');
    const semanticResult = calculateSemanticSimilarity(resume, jobDescription);
    const semanticScore = semanticResult.score;
    const semanticInsights = getSemanticInsights(resume, jobDescription);
    console.log('[SEMANTIC] Semantic score:', semanticScore + '%');

    // ============ STEP 5: Extract Experience ============
    const resumeExperience = extractYearsOfExperience(resume);
    const jdExperience = extractYearsOfExperience(jobDescription);
    const experienceMatch = calculateExperienceMatch(resumeExperience, jdExperience);

    // Extract flat arrays for backward compatibility
    const resumeSkills = extractKeywords(resume);
    const jdSkills = extractKeywords(jobDescription);

    // ============ STEP 6: TF-IDF Vectorization ============
    const vectorizer = new TFIDFVectorizer();
    vectorizer.fit([resume, jobDescription]);

    const resumeTokens = vectorizer.preprocess(resume);
    const jdTokens = vectorizer.preprocess(jobDescription);
    
    const resumeTokensSet = new Set(resumeTokens);
    const jdTokensSet = new Set(jdTokens);
    const sharedTokens = new Set([...resumeTokensSet].filter(x => jdTokensSet.has(x)));
    
    console.log('[TF-IDF] === Vocabulary Analysis ===');
    console.log('[TF-IDF] Total vocabulary size:', vectorizer.getVocabularySize());
    console.log('[TF-IDF] Shared tokens:', sharedTokens.size);

    const resumeVector = vectorizer.transform(resume);
    const jdVector = vectorizer.transform(jobDescription);

    let tfidfScore = Math.round(cosineSimilarity(resumeVector, jdVector) * 100);
    console.log('[TF-IDF] Cosine similarity: ' + tfidfScore + '%');

    // Fallback for zero similarity
    if (tfidfScore === 0) {
      console.log('[TF-IDF FALLBACK] Using enhanced keyword overlap...');
      const normalizedResumeSkills = new Set(resumeSkills.map(s => normalizeKeyword(s)));
      const normalizedJDSkills = new Set(jdSkills.map(s => normalizeKeyword(s)));
      
      const skillsOverlap = Array.from(normalizedJDSkills).filter(skill => 
        normalizedResumeSkills.has(skill)
      ).length;
      
      const keywordOverlap = sharedTokens.size;
      const totalUniqueTokens = resumeTokensSet.size + jdTokensSet.size - sharedTokens.size;
      const jaccardScore = totalUniqueTokens > 0 ? (keywordOverlap / totalUniqueTokens) * 100 : 0;
      
      const enhancedScore = Math.round((skillsOverlap / Math.max(normalizedJDSkills.size, 1)) * 60 + jaccardScore * 0.4);
      tfidfScore = Math.max(enhancedScore, 30);
    }

    // ============ STEP 7: Calculate Separate Scores ============
    // ATS Score: Resume-only quality
    const atsScoreResult = calculateAtsScoreResumeOnly(resume);
    const atsScore = atsScoreResult.score;

    // Match Score: Resume-JD compatibility
    const matchScoreResult = calculateMatchScore(resume, jobDescription, resumeSkillsByCategory, jdSkillsByCategory);
    const matchScore = matchScoreResult.score;

    // ============ STEP 8: Check for Generic JD Warning ============
    const jdTechnicalKeywords = Object.values(jdSkillsByCategory).flat().length;
    const warnings = [];
    if (jdTechnicalKeywords < 5) {
      warnings.push({
        type: 'generic_jd',
        message: 'Job description appears generic with few technical requirements. Consider tailoring your resume to specific job requirements.',
        severity: 'medium'
      });
    }

    // ============ STEP 9: Skill Relationship Analysis ============
    console.log('[SKILL RELATIONSHIPS] Analyzing skill relationships for missing skills...');
    const relatedSkillMatches = [];
    missingSkillsByLevel.required.forEach(missSkill => {
      const relationshipScore = calculateRelationshipScore(missSkill, flatResumeSkills);
      if (relationshipScore.score > 0) {
        relatedSkillMatches.push({
          skill: missSkill,
          level: 'required',
          relationshipScore: relationshipScore.score,
          reason: relationshipScore.reason
        });
      }
    });

    // ============ STEP 10: Generate Enhanced Suggestions ============
    const suggestions = generateEnhancedSuggestions(missingSkillsByLevel, relatedSkillMatches, atsScoreResult.breakdown);

    // ============ STEP 11: Missing Skills Prioritized ============
    const missingSkillsPrioritized = getMissingSkillsPrioritized(missingSkillsByLevel);

    // ============ STEP 10: Create Score Explanations ============
    const scoreExplanations = {
      atsScore: `ATS Score evaluates resume quality and structure independently of the job description. Your score of ${atsScore}% is based on: ${atsScoreResult.breakdown.sections.detected.join(', ')} sections detected, contact information, formatting quality, and technical skills presence.`,
      matchScore: `Match Score measures compatibility between your resume and job requirements using TF-IDF (${matchScoreResult.breakdown.tfidf}%), semantic similarity (${matchScoreResult.breakdown.semantic}%), and skill matching (${matchScoreResult.breakdown.skillMatch}%).`,
      overall: `Overall assessment combines ATS quality (${atsScore}%) and job match (${matchScore}%) for comprehensive evaluation.`
    };

    // ============ Return Enhanced Results ============
    return {
      // NEW: Separate Scores
      atsScore: atsScore,
      matchScore: matchScore,
      tfidfScore: matchScoreResult.breakdown.tfidf,
      semanticScore: matchScoreResult.breakdown.semantic,
      skillMatchScore: matchScoreResult.breakdown.skillMatch,

      // ATS Breakdown
      atsScoreBreakdown: atsScoreResult.breakdown,

      // Match Score Breakdown
      matchScoreBreakdown: matchScoreResult.breakdown,

      // Warnings
      warnings: warnings,

      // Enhanced Suggestions
      suggestions: suggestions,

      // Score Explanations
      scoreExplanations: scoreExplanations,

      // Keep existing fields for backward compatibility
      matchPercentage: matchScore,  // Use match score as primary percentage
      scores: {
        overallMatch: matchScore,  // For test compatibility
        tfidf: matchScoreResult.breakdown.tfidf,
        ats: atsScore,
        semantic: matchScoreResult.breakdown.semantic
      },
      tfidfScore: matchScoreResult.breakdown.tfidf,
      semanticScore: matchScoreResult.breakdown.semantic,

      // Skills data
      matchedSkills,
      missingSkills,
      extractedResumeSkills: resumeSkillsByCategory,
      extractedJDSkills: jdSkillsByCategory,

      // Experience
      experience: {
        resumeYears: resumeExperience,
        requiredYears: jdExperience,
        matchScore: experienceMatch.score,
        isQualified: experienceMatch.isQualified,
        message: experienceMatch.message
      },

      // Fuzzy matching results
      fuzzyMatching: {
        exactMatches: fuzzyMatches.exact.length,
        fuzzyMatches: fuzzyMatches.fuzzy,
        unmatched: fuzzyMatches.unmatched
      },

      // Skill requirements
      skillRequirements: {
        required: skillRequirements.required,
        preferred: skillRequirements.preferred,
        nicetoHave: skillRequirements.nicetoHave
      },

      matchedSkillsByLevel,
      missingSkillsByLevel,
      missingSkillsPrioritized,
      relatedSkillMatches,

      // Backward compatibility
      missingKeywords: jdSkills.filter(skill => !resumeSkills.some(rSkill => rSkill.toLowerCase() === skill.toLowerCase())),
      allRequiredSkills: jdSkills,
      providedSkills: resumeSkills
    };
  } catch (error) {
    console.error('Analysis Error:', error);
    throw new Error('Failed to analyze resume and job description');
  }
}

/**
 * Generate strengths based on analysis
 */
function generateStrengths(matchedSkillsByLevel, semanticInsights, experienceMatch) {
  const strengths = [];

  // Matched required skills
  if (matchedSkillsByLevel.required.length > 0) {
    strengths.push({
      category: 'Required Skills',
      description: `Strong match on ${matchedSkillsByLevel.required.length} required skill(s)`,
      skills: matchedSkillsByLevel.required.slice(0, 5),
      impact: 'high'
    });
  }

  // Matched preferred skills
  if (matchedSkillsByLevel.preferred.length > 0) {
    strengths.push({
      category: 'Preferred Skills',
      description: `Experience with ${matchedSkillsByLevel.preferred.length} preferred skill(s)`,
      skills: matchedSkillsByLevel.preferred.slice(0, 5),
      impact: 'medium'
    });
  }

  // Common themes from semantic analysis
  if (semanticInsights.commonThemes.length > 0) {
    const topTheme = semanticInsights.commonThemes.sort((a, b) => b.strength - a.strength)[0];
    strengths.push({
      category: 'Experience Alignment',
      description: `Strong alignment in ${topTheme.theme} (${Math.round(topTheme.strength)}% match)`,
      impact: 'high'
    });
  }

  // Experience qualification
  if (experienceMatch.isQualified) {
    strengths.push({
      category: 'Experience',
      description: experienceMatch.message,
      impact: 'high'
    });
  }

  return strengths;
}

/**
 * Generate suggestions for improvement
 */
function generateSuggestions(missingSkillsByLevel, relatedSkillMatches) {
  const suggestions = [];

  // Critical missing required skills
  if (missingSkillsByLevel.required.length > 0) {
    suggestions.push({
      priority: 'critical',
      category: 'Missing Required Skills',
      skills: missingSkillsByLevel.required.slice(0, 5),
      action: `Learn or gain experience with: ${missingSkillsByLevel.required.slice(0, 3).join(', ')}`,
      impact: 'high'
    });
  }

  // Missing preferred skills
  if (missingSkillsByLevel.preferred.length > 0 && missingSkillsByLevel.preferred.length <= 5) {
    suggestions.push({
      priority: 'high',
      category: 'Missing Preferred Skills',
      skills: missingSkillsByLevel.preferred,
      action: `These would strengthen your candidacy: ${missingSkillsByLevel.preferred.join(', ')}`,
      impact: 'medium'
    });
  }

  // Related skills that could help
  if (relatedSkillMatches.length > 0) {
    suggestions.push({
      priority: 'medium',
      category: 'Leverage Related Skills',
      action: 'You have related skills that demonstrate foundational knowledge',
      relatedSkills: relatedSkillMatches.slice(0, 3),
      impact: 'medium'
    });
  }

  // Experience gap
  if (!missingSkillsByLevel.required.length && missingSkillsByLevel.preferred.length > 0) {
    suggestions.push({
      priority: 'low',
      category: 'Polish Application',
      action: `Highlight transferable skills and ready to learn: ${missingSkillsByLevel.preferred.slice(0, 2).join(', ')}`,
      impact: 'low'
    });
  }

  return suggestions;
}

/**
 * Generate enhanced, practical suggestions based on ATS score and missing skills
 */
function generateEnhancedSuggestions(missingSkillsByLevel, relatedSkillMatches, atsBreakdown) {
  const suggestions = [];

  // ATS-based suggestions
  if (atsBreakdown.sections.score < 60) {
    suggestions.push({
      priority: 'high',
      category: 'Resume Structure',
      action: 'Add missing sections to improve ATS compatibility: Summary, Skills, Education, Experience, Projects',
      impact: 'high',
      details: `Detected sections: ${atsBreakdown.sections.detected.join(', ') || 'none'}`
    });
  }

  if (atsBreakdown.contact.score < 50) {
    suggestions.push({
      priority: 'high',
      category: 'Contact Information',
      action: 'Ensure resume includes phone number, email, and professional links (LinkedIn, GitHub, portfolio)',
      impact: 'high'
    });
  }

  if (atsBreakdown.formatting.score < 50) {
    suggestions.push({
      priority: 'medium',
      category: 'Formatting',
      action: 'Use bullet points, consistent formatting, and clear date formats to improve readability',
      impact: 'medium'
    });
  }

  // Skill-based suggestions
  if (missingSkillsByLevel.required.length > 0) {
    const topMissing = missingSkillsByLevel.required.slice(0, 3);
    suggestions.push({
      priority: 'high',
      category: 'Critical Skills Gap',
      action: `Focus on acquiring these required skills: ${topMissing.join(', ')}. Consider online courses, certifications, or personal projects.`,
      impact: 'high',
      skills: topMissing
    });
  }

  if (missingSkillsByLevel.preferred.length > 0) {
    const topPreferred = missingSkillsByLevel.preferred.slice(0, 3);
    suggestions.push({
      priority: 'medium',
      category: 'Preferred Skills',
      action: `Develop these preferred skills to strengthen your application: ${topPreferred.join(', ')}. Start with tutorials or small projects.`,
      impact: 'medium',
      skills: topPreferred
    });
  }

  // Role-specific practical suggestions
  if (relatedSkillMatches.length > 0) {
    suggestions.push({
      priority: 'medium',
      category: 'Leverage Existing Skills',
      action: 'Highlight transferable skills and related experience in your resume and cover letter',
      impact: 'medium',
      examples: relatedSkillMatches.slice(0, 2).map(r => `${r.skill} (related to your ${r.reason})`)
    });
  }

  // Generic improvement suggestions
  suggestions.push({
    priority: 'low',
    category: 'Tailor Your Resume',
    action: 'Customize your resume for each job application by incorporating job-specific keywords naturally',
    impact: 'low'
  });

  suggestions.push({
    priority: 'low',
    category: 'Quantify Achievements',
    action: 'Replace generic statements with specific metrics and achievements (e.g., "Improved performance by 30%" instead of "Improved performance")',
    impact: 'low'
  });

  return suggestions;
}

module.exports = {
  analyzeResumeAndJD,
  extractKeywords,
  extractSkillsByCategory,
  calculateAtsScoreResumeOnly,
  findMatchedAndMissingSkills,
  extractYearsOfExperience,
  calculateExperienceMatch,
  calculateKeywordDensity,
  calculateSkillsPresence,
  detectResumeSections,
  calculateFormattingScore,
  // NEW exports for enhanced features
  generateStrengths,
  generateSuggestions,
  calculateMatchScore
};
