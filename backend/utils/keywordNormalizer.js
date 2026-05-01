/**
 * KEYWORD NORMALIZATION UTILITY
 * Maps common variations and synonyms to standard keywords
 * This ensures "node.js", "nodejs", "node" all match as "nodejs"
 */

const KEYWORD_NORMALIZATION = {
  // JavaScript variations
  'javascript': ['js', 'javascript', 'ecmascript'],
  'typescript': ['ts', 'typescript'],
  'nodejs': ['node', 'node.js', 'nodejs', 'node js'],
  
  // Frontend variations
  'react': ['reactjs', 'react.js', 'react'],
  'vue': ['vuejs', 'vue.js', 'vue'],
  'angular': ['angularjs', 'angular.js', 'angular'],
  'nextjs': ['next.js', 'nextjs', 'next'],
  'nestjs': ['nest.js', 'nestjs', 'nest'],
  'html': ['html5', 'html'],
  'css': ['css3', 'css'],
  
  // Backend variations
  'springboot': ['spring boot', 'springboot', 'spring-boot'],
  'asp.net': ['asp.net', 'asp net', 'aspnet'],
  
  // Database variations
  'postgresql': ['postgres', 'postgresql', 'postgres-sql'],
  'mongodb': ['mongo', 'mongo db', 'mongodb'],
  'sql': ['mysql', 'structured query language', 'sql'],
  'database': ['db', 'databases', 'database'],
  'csharp': ['c#', 'csharp', 'c-sharp'],
  
  // DevOps variations
  'kubernetes': ['k8s', 'kubernetes', 'k8'],
  'githubactions': ['github actions', 'github-actions', 'githubactions'],
  
  // Cloud variations
  'aws': ['amazon web services', 'aws', 'amazon'],
  'gcp': ['google cloud', 'gcp', 'google cloud platform'],
  'azure': ['microsoft azure', 'azure', 'ms azure'],
  
  // Common typos and formats
  'cplus': ['c++', 'cpp', 'c plus plus'],
  'dotnet': ['.net', 'dotnet', '.net framework'],
  // NOTE: 'go' removed from golang variations — too ambiguous (matches "GD round", "go to" etc.)
  // Only 'golang' detects Go language now
  'golang': ['golang', 'google go'],
  'csharp': ['c#', 'csharp', 'c-sharp'],
  'objective-c': ['objective-c', 'objc', 'objective c'],

  // ML / Python ecosystem normalizations
  'scikit-learn': ['scikit-learn', 'sklearn', 'scikit learn'],
  'pytorch': ['pytorch', 'torch'],
  'tensorflow': ['tensorflow', 'tf'],
  'sqlalchemy': ['sqlalchemy', 'sql alchemy'],
  'machinelearning': ['ml', 'machine learning', 'machinelearning', 'ai/ml'],
  'artificialintelligence': ['ai', 'artificial intelligence'],
  'sqlmodel': ['sqlmodel', 'sql model'],
  'huggingface': ['huggingface', 'hugging face', 'hf'],
};

/**
 * Normalize a keyword to its standard form
 * e.g., "node.js" → "nodejs", "js" → "javascript"
 * 
 * @param {string} keyword - The keyword to normalize
 * @returns {string} - The normalized keyword
 */
function normalizeKeyword(keyword) {
  const lowerKeyword = keyword.toLowerCase().trim();
  
  // Find which standard form this keyword belongs to
  for (const [standard, variations] of Object.entries(KEYWORD_NORMALIZATION)) {
    if (variations.some(v => v === lowerKeyword)) {
      return standard;
    }
  }
  
  // If not in normalization map, return as-is (lowercased)
  return lowerKeyword;
}

/**
 * Normalize an array of keywords
 * 
 * @param {Array<string>} keywords - Array of keywords to normalize
 * @returns {Array<string>} - Array of normalized keywords
 */
function normalizeKeywords(keywords) {
  if (!Array.isArray(keywords)) {
    return [];
  }
  return keywords.map(k => normalizeKeyword(k));
}

/**
 * Normalize tokens in place (used for TF-IDF preprocessing)
 * Applies normalization transformations to a token
 * 
 * @param {string} token - Individual token to normalize
 * @returns {string} - Normalized token
 */
function normalizeToken(token) {
  return normalizeKeyword(token);
}

module.exports = {
  normalizeKeyword,
  normalizeKeywords,
  normalizeToken,
  KEYWORD_NORMALIZATION
};
