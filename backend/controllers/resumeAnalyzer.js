const TFIDFVectorizer = require('../utils/tfidf');
const { cosineSimilarity } = require('../utils/cosine-similarity');

/**
 * Comprehensive categorized skill dictionary
 * All keywords are lowercase for case-insensitive matching
 */
const SKILL_KEYWORDS = {
  'Programming Languages': [
    'javascript', 'python', 'java', 'csharp', 'c#', 'typescript', 'ruby', 'php', 'go', 
    'golang', 'rust', 'kotlin', 'swift', 'objective-c', 'c++', 'c', 'scala', 'perl', 'r',
    'matlab', 'assembly', 'haskell', 'clojure', 'groovy', 'bash', 'shell'
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
    'fastify', 'hapi', 'koa', 'deno', 'java', 'python', 'c#', 'csharp', 'go', 'golang', 'rust'
  ],
  'Databases': [
    'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'mongodb', 'firebase', 'firestore',
    'redis', 'cassandra', 'elasticsearch', 'dynamodb', 'oracle', 'mssql', 'sqlite', 'mariadb',
    'couchdb', 'neo4j', 'influxdb', 'etcd', 'memcached', 'elasticsearch', 'solr'
  ],
  'DevOps': [
    'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab-ci', 'github actions', 'github-actions',
    'circleci', 'circle ci', 'travis ci', 'travisci', 'ansible', 'puppet', 'chef', 'terraform',
    'helm', 'prometheus', 'grafana', 'elk', 'datadog', 'newrelic', 'splunk', 'cloudwatch'
  ],
  'Cloud': [
    'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud',
    'ibm cloud', 'heroku', 'digitalocean', 'linode', 'vercel', 'netlify', 'cloudflare',
    'ec2', 's3', 's3bucket', 'lambda', 'rds', 'ecs', 'app engine', 'cloud storage', 'cloud run'
  ],
  'Tools & Platforms': [
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'linux', 'windows',
    'macos', 'mac', 'unix', 'vim', 'vscode', 'intellij', 'eclipse', 'xcode', 'postman',
    'swagger', 'npm', 'yarn', 'pip', 'maven', 'gradle', 'make', 'cmake', 'docker', 'nginx',
    'apache', 'pm2', 'supervisord', 'systemd', 'vagrant', 'vmware', 'virtualbox'
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
      // Use word boundary regex for case-insensitive matching
      // Escape special regex characters in keyword
      const escapedKeyword = escapeRegex(keyword);
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
      if (regex.test(lowerText)) {
        // Avoid duplicates by checking if skill already added
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
 */
function extractKeywords(text) {
  const skillsByCategory = extractSkillsByCategory(text);
  const allSkills = new Set();

  Object.values(skillsByCategory).forEach(skills => {
    skills.forEach(skill => allSkills.add(skill));
  });

  return Array.from(allSkills);
}

/**
 * Calculate keyword density component (40% weight)
 * Returns 0-100 based on percentage of JD keywords found in resume
 */
function calculateKeywordDensity(resume, jd) {
  const allJDKeywords = extractKeywords(jd);
  const resumeKeywords = extractKeywords(resume);

  if (allJDKeywords.length === 0) return 0;

  const matchedKeywords = allJDKeywords.filter(keyword =>
    resumeKeywords.some(rKeyword => rKeyword.toLowerCase() === keyword.toLowerCase())
  );

  const score = (matchedKeywords.length / allJDKeywords.length) * 100;
  return Math.min(score, 100);
}

/**
 * Calculate required skills presence component (30% weight)
 * Returns 0-100 based on how many required skill categories are represented
 */
function calculateSkillsPresence(resumeSkillsByCategory, jdSkillsByCategory) {
  const requiredCategories = Object.keys(jdSkillsByCategory);
  const requiredSkills = Object.values(jdSkillsByCategory).flat();

  if (requiredSkills.length === 0) return 0;

  // Count how many required skills are present
  let presentSkillCount = 0;
  requiredSkills.forEach(reqSkill => {
    Object.values(resumeSkillsByCategory).forEach(resumeSkillsList => {
      if (resumeSkillsList.some(s => s.toLowerCase() === reqSkill.toLowerCase())) {
        presentSkillCount++;
      }
    });
  });

  const score = (presentSkillCount / requiredSkills.length) * 100;
  return Math.min(score, 100);
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
 * - 30% Skills Presence
 * - 20% Resume Sections
 * - 10% Formatting Indicators
 */
function calculateAtsScore(resume, jd, resumeSkillsByCategory, jdSkillsByCategory) {
  // Component 1: Keyword Density (40%)
  const keywordDensity = calculateKeywordDensity(resume, jd);

  // Component 2: Skills Presence (30%)
  const skillsPresence = calculateSkillsPresence(
    resumeSkillsByCategory || {},
    jdSkillsByCategory || {}
  );

  // Component 3: Resume Sections (20%)
  const sectionDetection = detectResumeSections(resume);
  const sectionsScore = sectionDetection.score;

  // Component 4: Formatting Indicators (10%)
  const formattingScoreValue = calculateFormattingScore(resume);

  // Calculate weighted score
  const finalScore = Math.round(
    (keywordDensity * 0.4) +
    (skillsPresence * 0.3) +
    (sectionsScore * 0.2) +
    (formattingScoreValue * 0.1)
  );

  return {
    score: Math.min(finalScore, 100),
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
 */
function findMatchedAndMissingSkills(resumeSkillsByCategory, jdSkillsByCategory) {
  const matchedSkills = {};
  const missingSkills = {};

  // Initialize categories
  Object.keys(jdSkillsByCategory).forEach(category => {
    matchedSkills[category] = [];
    missingSkills[category] = [];
  });

  // Find matched and missing skills
  Object.entries(jdSkillsByCategory).forEach(([category, jdSkills]) => {
    const resumeSkills = resumeSkillsByCategory[category] || [];

    jdSkills.forEach(jdSkill => {
      const isMatched = resumeSkills.some(
        rSkill => rSkill.toLowerCase() === jdSkill.toLowerCase()
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

    // Initialize TF-IDF Vectorizer
    const vectorizer = new TFIDFVectorizer();
    vectorizer.fit([resume, jobDescription]);

    // Transform both texts into vectors
    const resumeVector = vectorizer.transform(resume);
    const jdVector = vectorizer.transform(jobDescription);

    // Calculate cosine similarity
    const matchPercentage = Math.round(cosineSimilarity(resumeVector, jdVector) * 100);

    // Calculate ATS Score with detailed breakdown
    const atsScoreResult = calculateAtsScore(resume, jobDescription, resumeSkillsByCategory, jdSkillsByCategory);

    return {
      matchPercentage,
      atsScore: atsScoreResult.score,
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
