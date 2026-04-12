const TFIDFVectorizer = require('../utils/tfidf');
const { cosineSimilarity } = require('../utils/cosine-similarity');
const { normalizeKeyword, normalizeKeywords, KEYWORD_NORMALIZATION } = require('../utils/keywordNormalizer');

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

    // ============ STEP 7: Calculate ATS Score ============
    const atsScoreResult = calculateAtsScore(resume, jobDescription, resumeSkillsByCategory, jdSkillsByCategory);
    const atsScore = atsScoreResult.score;

    // ============ STEP 8: Skill Relationship Analysis (NEW) ============
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

    // ============ STEP 9: Calculate Final Scores ============
    // Now blend three sources: TF-IDF, ATS, and Semantic
    const finalMatchScore = Math.round(
      (tfidfScore * 0.4) +
      (atsScore * 0.35) +
      (semanticScore * 0.25)
    );

    console.log('[FINAL ANALYSIS] ===========================');
    console.log('[FINAL ANALYSIS] TF-IDF Score: ' + tfidfScore + '%');
    console.log('[FINAL ANALYSIS] ATS Score: ' + atsScore + '%');
    console.log('[FINAL ANALYSIS] Semantic Score: ' + semanticScore + '%');
    console.log('[FINAL ANALYSIS] Final Match Score: ' + finalMatchScore + '%');

    // ============ STEP 10: Generate Strengths & Suggestions ============
    const strengths = generateStrengths(matchedSkillsByLevel, semanticInsights, experienceMatch);
    const suggestions = generateSuggestions(missingSkillsByLevel, relatedSkillMatches);

    // ============ STEP 11: Missing Skills Prioritized (NEW) ============
    const missingSkillsPrioritized = getMissingSkillsPrioritized(missingSkillsByLevel);

    // ============ Return Enhanced Results ============
    return {
      // NEW: Main Scores with breakdown
      scores: {
        overallMatch: finalMatchScore,
        tfidf: tfidfScore,
        ats: atsScore,
        semantic: semanticScore,
        weighted: {
          required: Math.round((matchedSkillsByLevel.required.length / Math.max(skillRequirements.required.length, 1)) * 100),
          preferred: Math.round((matchedSkillsByLevel.preferred.length / Math.max(skillRequirements.preferred.length, 1)) * 100),
          nicetoHave: Math.round((matchedSkillsByLevel.nicetoHave.length / Math.max(skillRequirements.nicetoHave.length, 1)) * 100)
        }
      },

      // NEW: ATS Breakdown
      atsScoreBreakdown: atsScoreResult.breakdown,

      // NEW: Fuzzy Match Results
      fuzzyMatching: {
        exactMatches: fuzzyMatches.exact.length,
        fuzzyMatches: fuzzyMatches.fuzzy,
        unmatched: fuzzyMatches.unmatched
      },

      // NEW: Skill Requirements with Levels
      skillRequirements: {
        required: skillRequirements.required,
        preferred: skillRequirements.preferred,
        nicetoHave: skillRequirements.nicetoHave
      },

      matchedSkillsByLevel,
      missingSkillsByLevel,

      // NEW: Prioritized Missing Skills
      missingSkillsPrioritized,

      // NEW: Related Skills that Could Help
      relatedSkillMatches,

      // Original matched/missing
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

      // NEW: Semantic Analysis & Insights
      semanticAnalysis: {
        score: semanticScore,
        insights: semanticInsights,
        breakdown: semanticResult.breakdown
      },

      // NEW: Strengths and Suggestions
      strengths,
      suggestions,

      // Backward compatibility
      matchPercentage: finalMatchScore,  // Main score for display
      tfidfScore: tfidfScore,
      atsScore: atsScore,
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
  calculateFormattingScore,
  // NEW exports for enhanced features
  generateStrengths,
  generateSuggestions
};
