/**
 * Skill Requirement Parser
 * Parses job description to differentiate:
 * - Required skills (must-have)
 * - Preferred skills (nice-to-have but important)
 * - Nice-to-have skills (bonus)
 */

/**
 * Parse job description to categorize skills
 * 
 * @param {string} jd - Job description text
 * @param {Object} allSkillsByCategory - Skills extracted from JD
 * @returns {Object} - { required: [], preferred: [], nicetoHave: [] }
 */
function parseSkillRequirements(jd, allSkillsByCategory) {
  if (!jd || typeof jd !== 'string') {
    return { required: [], preferred: [], nicetoHave: [] };
  }

  const lowerJD = jd.toLowerCase();
  const result = {
    required: [],
    preferred: [],
    nicetoHave: []
  };

  // Flatten all skills
  const allSkills = Object.values(allSkillsByCategory || {}).flat();

  // Keywords that indicate requirement level
  const requiredKeywords = [
    'must have', 'must know', 'required', 'essential', 'critical',
    'mandatory', 'requirement', 'must be proficient', 'must have experience'
  ];

  const preferredKeywords = [
    'preferred', 'should have', 'strong knowledge', 'experience with',
    'familiar with', 'good understanding'
  ];

  const nicetoHaveKeywords = [
    'nice to have', 'bonus', 'plus', 'a plus', 'is a plus',
    'would be great', 'helpful', 'beneficial'
  ];

  // Build context windows around each skill mention
  const skillContextMap = new Map();

  allSkills.forEach(skill => {
    const skillRegex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'gi');
    const matches = [...lowerJD.matchAll(skillRegex)];

    if (matches.length > 0) {
      const firstMatch = matches[0];
      const start = Math.max(0, firstMatch.index - 150);
      const end = Math.min(lowerJD.length, firstMatch.index + skill.length + 150);
      const context = lowerJD.substring(start, end);

      // Find requirement level based on context
      let level = 'nicetoHave'; // Default

      if (requiredKeywords.some(kw => context.includes(kw))) {
        level = 'required';
      } else if (preferredKeywords.some(kw => context.includes(kw))) {
        level = 'preferred';
      } else {
        // Additional heuristic: if skill is in first 30% of JD, likely required
        if (firstMatch.index < lowerJD.length * 0.3) {
          level = 'required';
        }
      }

      skillContextMap.set(skill, { level, context });
    }
  });

  // Categorize skills
  skillContextMap.forEach((info, skill) => {
    if (!result[info.level].includes(skill)) {
      result[info.level].push(skill);
    }
  });

  // If all skills went to one category, redistribute intelligently
  if (result.required.length === 0 && allSkills.length > 0) {
    // First 60% are required, next 30% preferred, rest nice-to-have
    const len = allSkills.length;
    result.required = allSkills.slice(0, Math.ceil(len * 0.6));
    result.preferred = allSkills.slice(Math.ceil(len * 0.6), Math.ceil(len * 0.9));
    result.nicetoHave = allSkills.slice(Math.ceil(len * 0.9));
  }

  return result;
}

/**
 * Calculate weighted skill score based on requirement level
 * 
 * @param {Object} matchedSkills - { required: [], preferred: [], nicetoHave: [] }
 * @param {Object} allRequiredSkills - { required: [], preferred: [], nicetoHave: [] }
 * @returns {Object} - Detailed breakdown with separate scores
 */
function calculateWeightedSkillScore(matchedSkills, allRequiredSkills) {
  const scores = {
    required: { matched: 0, total: 0, percentage: 0, weight: 0.5 },
    preferred: { matched: 0, total: 0, percentage: 0, weight: 0.3 },
    nicetoHave: { matched: 0, total: 0, percentage: 0, weight: 0.2 }
  };

  // Count matches
  Object.keys(scores).forEach(level => {
    const matched = (matchedSkills[level] || []).length;
    const total = (allRequiredSkills[level] || []).length;
    scores[level].matched = matched;
    scores[level].total = total;
    scores[level].percentage = total > 0 ? (matched / total) * 100 : 0;
  });

  // Calculate weighted score
  let weightedPercentage = 0;
  let totalWeight = 0;

  Object.entries(scores).forEach(([level, data]) => {
    if (data.total > 0) {
      weightedPercentage += (data.percentage * data.weight);
      totalWeight += data.weight;
    }
  });

  const finalScore = totalWeight > 0 ? Math.round(weightedPercentage / totalWeight) : 0;

  return {
    finalScore,
    breakdown: scores,
    details: {
      requiredMatch: `${scores.required.matched}/${scores.required.total}`,
      preferredMatch: `${scores.preferred.matched}/${scores.preferred.total}`,
      nicetoHaveMatch: `${scores.nicetoHave.matched}/${scores.nicetoHave.total}`
    }
  };
}

/**
 * Get missing skills by priority
 * 
 * @param {Object} missingSkills - { required: [], preferred: [], nicetoHave: [] }
 * @returns {Array} - Sorted by priority: required first, then preferred, then nice-to-have
 */
function getMissingSkillsPrioritized(missingSkills) {
  const result = [];

  // Required (highest priority)
  (missingSkills.required || []).forEach(skill => {
    result.push({ skill, priority: 'critical', level: 'required' });
  });

  // Preferred (medium priority)
  (missingSkills.preferred || []).forEach(skill => {
    result.push({ skill, priority: 'high', level: 'preferred' });
  });

  // Nice-to-have (low priority)
  (missingSkills.nicetoHave || []).forEach(skill => {
    result.push({ skill, priority: 'low', level: 'nicetoHave' });
  });

  return result;
}

module.exports = {
  parseSkillRequirements,
  calculateWeightedSkillScore,
  getMissingSkillsPrioritized
};
