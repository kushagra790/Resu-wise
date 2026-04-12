/**
 * Semantic Similarity Utility
 * Calculates semantic similarity between resume and JD
 * Uses multiple strategies: token overlap, phrase similarity, and semantic proximity
 */

const stringSimilarity = require('string-similarity');

/**
 * Calculate semantic similarity using multiple strategies
 * Combines: word overlap, phrase matching, token similarity
 * 
 * @param {string} resume - Resume text
 * @param {string} jd - Job description text
 * @returns {Object} - { score: 0-100, breakdown: {...} }
 */
function calculateSemanticSimilarity(resume, jd) {
  if (!resume || !jd) {
    return { score: 0, breakdown: {} };
  }

  const strategies = {};

  // Strategy 1: Full text similarity
  strategies.fullTextSimilarity = stringSimilarity.compareTwoStrings(
    resume.toLowerCase(),
    jd.toLowerCase()
  ) * 100;

  // Strategy 2: Sentence-level similarity
  strategies.sentenceSimilarity = calculateSentenceLevelSimilarity(resume, jd);

  // Strategy 3: Paragraph-level similarity
  strategies.paragraphSimilarity = calculateParagraphLevelSimilarity(resume, jd);

  // Strategy 4: Common phrase detection
  strategies.commonPhrases = detectCommonPhrases(resume, jd);

  // Weighted combination
  const combinedScore = Math.round(
    (strategies.fullTextSimilarity * 0.25) +
    (strategies.sentenceSimilarity * 0.25) +
    (strategies.paragraphSimilarity * 0.25) +
    (strategies.commonPhrases * 0.25)
  );

  return {
    score: Math.min(combinedScore, 100),
    breakdown: strategies,
    confidence: 'medium'
  };
}

/**
 * Compare sentences between resume and JD
 */
function calculateSentenceLevelSimilarity(resume, jd) {
  const resumeSentences = resume
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  const jdSentences = jd
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  if (resumeSentences.length === 0 || jdSentences.length === 0) {
    return 0;
  }

  let totalSimilarity = 0;
  let comparisons = 0;

  // Compare first 5 sentences from each
  const resemeToCompare = resumeSentences.slice(0, 5);
  const jdToCompare = jdSentences.slice(0, 5);

  resemeToCompare.forEach(rSentence => {
    jdToCompare.forEach(jdSentence => {
      totalSimilarity += stringSimilarity.compareTwoStrings(
        rSentence.toLowerCase(),
        jdSentence.toLowerCase()
      );
      comparisons++;
    });
  });

  return ((totalSimilarity / comparisons) * 100) || 0;
}

/**
 * Compare paragraph-level similarity
 */
function calculateParagraphLevelSimilarity(resume, jd) {
  const resumeParagraphs = resume
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 20)
    .slice(0, 3);

  const jdParagraphs = jd
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 20)
    .slice(0, 3);

  if (resumeParagraphs.length === 0 || jdParagraphs.length === 0) {
    return 0;
  }

  let bestMatch = 0;

  resumeParagraphs.forEach(rPara => {
    jdParagraphs.forEach(jdPara => {
      const similarity = stringSimilarity.compareTwoStrings(
        rPara.toLowerCase(),
        jdPara.toLowerCase()
      );
      bestMatch = Math.max(bestMatch, similarity);
    });
  });

  return (bestMatch * 100) || 0;
}

/**
 * Detect common phrases between texts
 */
function detectCommonPhrases(resume, jd) {
  const resumeLower = resume.toLowerCase();
  const jdLower = jd.toLowerCase();

  // Extract 2-3 word phrases
  const phraseRegex = /\b\w+\s+\w+(?:\s+\w+)?\b/g;
  const resumePhrases = (resumeLower.match(phraseRegex) || [])
    .filter(p => p.split(' ').every(w => w.length > 3)); // Filter short words

  const jdPhrases = new Set(
    (jdLower.match(phraseRegex) || [])
      .filter(p => p.split(' ').every(w => w.length > 3))
  );

  const commonCount = resumePhrases.filter(p => jdPhrases.has(p)).length;
  const totalPhrases = Math.max(resumePhrases.length, jdPhrases.size);

  return totalPhrases > 0 ? (commonCount / totalPhrases) * 100 : 0;
}

/**
 * Get semantic insights (what matches semantically)
 */
function getSemanticInsights(resume, jd) {
  const insights = {
    commonThemes: [],
    resumeStrengths: [],
    gapAreas: []
  };

  // Simple theme detection
  const themes = {
    leadership: /lead|manage|direct|oversee|coordinate/gi,
    technical: /develop|build|implement|code|program|engineer/gi,
    communication: /present|write|communicate|speak|document/gi,
    analysis: /analyze|assess|evaluate|study|research/gi,
    collaboration: /team|collaborate|cooperate|partner|joint/gi,
    innovation: /innovate|creative|novel|improve|transform/gi
  };

  Object.entries(themes).forEach(([theme, regex]) => {
    const resumeMatches = (resume.match(regex) || []).length;
    const jdMatches = (jd.match(regex) || []).length;

    if (jdMatches > 0 && resumeMatches > 0) {
      insights.commonThemes.push({
        theme,
        strength: Math.min((resumeMatches / jdMatches) * 100, 100)
      });
    } else if (jdMatches > 0 && resumeMatches === 0) {
      insights.gapAreas.push({
        theme,
        emphasisInJD: jdMatches
      });
    }
  });

  return insights;
}

module.exports = {
  calculateSemanticSimilarity,
  getSemanticInsights,
  calculateSentenceLevelSimilarity,
  calculateParagraphLevelSimilarity,
  detectCommonPhrases
};
