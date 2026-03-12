/**
 * Cosine Similarity Calculator
 * Calculates the similarity between two vectors using cosine similarity
 */

function dotProduct(vec1, vec2) {
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    sum += vec1[i] * vec2[i];
  }
  return sum;
}

function magnitude(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between 0 and 1
 */
function cosineSimilarity(vec1, vec2) {
  const dot = dotProduct(vec1, vec2);
  const mag1 = magnitude(vec1);
  const mag2 = magnitude(vec2);

  if (mag1 === 0 || mag2 === 0) {
    return 0;
  }

  return dot / (mag1 * mag2);
}

module.exports = {
  cosineSimilarity,
  dotProduct,
  magnitude
};
