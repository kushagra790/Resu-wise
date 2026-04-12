/**
 * Fuzzy Matching Utility
 * Handles typos and skill name variations using Fuse.js
 */

const Fuse = require('fuse.js');

/**
 * Find fuzzy matches for a skill against a list of target skills
 * Handles typos like "Javescript" → "JavaScript", "Reacct" → "React"
 * 
 * @param {string} skill - Skill to search for
 * @param {Array<string>} targetSkills - List of skills to match against
 * @param {number} threshold - Fuse threshold (0-1, lower = more matches). Default: 0.3
 * @returns {Object} - { matched: string, score: number, isExactMatch: boolean }
 */
function findFuzzyMatch(skill, targetSkills, threshold = 0.3) {
  if (!skill || !targetSkills || targetSkills.length === 0) {
    return null;
  }

  const fuse = new Fuse(targetSkills, {
    keys: [],
    threshold: threshold,
    shouldSort: true,
    isCaseSensitive: false,
    distance: 100
  });

  const results = fuse.search(skill);

  if (results.length === 0) {
    return null;
  }

  const bestMatch = results[0];
  const isExactMatch = skill.toLowerCase() === bestMatch.item.toLowerCase();

  return {
    matched: bestMatch.item,
    score: 1 - bestMatch.score, // Convert Fuse score to similarity score (0-1)
    isExactMatch,
    allResults: results.slice(0, 3) // Top 3 matches
  };
}

/**
 * Batch fuzzy match multiple skills against target skills
 * 
 * @param {Array<string>} skills - Skills to match
 * @param {Array<string>} targetSkills - Target skills to match against
 * @param {number} threshold - Fuse threshold
 * @returns {Object} - { exact: [], fuzzy: [], unmatched: [] }
 */
function batchFuzzyMatch(skills, targetSkills, threshold = 0.3) {
  const results = {
    exact: [],
    fuzzy: [],
    unmatched: []
  };

  skills.forEach(skill => {
    const match = findFuzzyMatch(skill, targetSkills, threshold);

    if (!match) {
      results.unmatched.push(skill);
    } else if (match.isExactMatch) {
      results.exact.push({
        original: skill,
        matched: match.matched,
        score: 1.0
      });
    } else {
      results.fuzzy.push({
        original: skill,
        matched: match.matched,
        score: match.score,
        alternatives: match.allResults?.slice(1).map(r => ({
          skill: r.item,
          score: 1 - r.score
        })) || []
      });
    }
  });

  return results;
}

/**
 * Find all fuzzy matches (not just best match)
 * Useful for suggestions
 * 
 * @param {string} skill - Skill to search for
 * @param {Array<string>} targetSkills - List of skills
 * @param {number} threshold - Fuse threshold
 * @param {number} limit - Max number of results
 * @returns {Array} - Array of matches sorted by score
 */
function findAllFuzzyMatches(skill, targetSkills, threshold = 0.3, limit = 5) {
  if (!skill || !targetSkills || targetSkills.length === 0) {
    return [];
  }

  const fuse = new Fuse(targetSkills, {
    threshold: threshold,
    shouldSort: true,
    isCaseSensitive: false
  });

  return fuse.search(skill).slice(0, limit).map(result => ({
    skill: result.item,
    score: 1 - result.score
  }));
}

module.exports = {
  findFuzzyMatch,
  batchFuzzyMatch,
  findAllFuzzyMatches
};
