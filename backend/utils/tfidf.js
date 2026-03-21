/**
 * TF-IDF Vectorizer with Advanced NLP Preprocessing
 * Uses natural library for tokenization, stop word removal, and keyword normalization
 */

const natural = require('natural');
const { normalizeToken } = require('./keywordNormalizer');

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Common English stop words
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but',
  'by', 'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just',
  'me', 'might', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'only',
  'or', 'other', 'out', 'over', 'own', 'same', 'should', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'is', 'are', 'be', 'been', 'being'
]);

class TFIDFVectorizer {
  constructor(options = {}) {
    this.vocabulary = new Map();
    this.idf = new Map();
    this.documents = [];
    this.enableStemming = options.enableStemming === true; // Default: false - DISABLED for better word preservation
    this.enableStopWordRemoval = options.enableStopWordRemoval !== false; // Default: true
    this.minTokenLength = options.minTokenLength || 1; // Changed from 2 to 1 to keep more meaningful tokens
  }

  /**
   * Remove special characters and extra whitespace
   */
  removeSpecialCharacters(text) {
    // Replace special characters, keep alphanumeric, hyphens, and spaces
    return text.replace(/[^\w\s\-]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Lowercase text
   */
  lowercase(text) {
    return text.toLowerCase();
  }

  /**
   * Tokenize text using natural library
   */
  tokenizeText(text) {
    try {
      return tokenizer.tokenize(text) || [];
    } catch (error) {
      console.warn('Tokenization error:', error.message);
      return text.split(/\s+/);
    }
  }

  /**
   * Remove stop words
   */
  removeStopWords(tokens) {
    if (!this.enableStopWordRemoval) {
      return tokens;
    }
    return tokens.filter(token => !STOP_WORDS.has(token.toLowerCase()));
  }

  /**
   * Apply stemming using Porter Stemmer
   */
  applyStemming(tokens) {
    if (!this.enableStemming) {
      return tokens;
    }
    return tokens.map(token => stemmer.stem(token));
  }

  /**
   * Filter short tokens
   */
  filterShortTokens(tokens) {
    return tokens.filter(token => token.length >= this.minTokenLength);
  }

  /**
   * Full preprocessing pipeline
   * Order: lowercase -> remove special chars -> tokenize -> remove stop words -> normalize keywords -> filter short
   */
  preprocess(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Step 1: Lowercase
    let processed = this.lowercase(text);

    // Step 2: Remove special characters
    processed = this.removeSpecialCharacters(processed);

    // Step 3: Tokenize
    let tokens = this.tokenizeText(processed);

    // Step 4: Remove stop words
    tokens = this.removeStopWords(tokens);

    // Step 5: Normalize keywords (e.g., "node.js" → "nodejs")
    tokens = tokens.map(token => normalizeToken(token));

    // Step 6: Filter short tokens and remove empty strings
    tokens = this.filterShortTokens(tokens).filter(t => t && t.trim().length > 0);

    return tokens;
  }

  /**
   * Build vocabulary from documents
   */
  fit(documents) {
    if (!Array.isArray(documents)) {
      throw new Error('Documents must be an array');
    }

    this.documents = documents;
    const docFreq = new Map();
    const totalDocs = documents.length;

    if (totalDocs === 0) {
      throw new Error('No documents provided for fitting');
    }

    // Build vocabulary and document frequency
    documents.forEach((doc) => {
      const tokens = this.preprocess(doc);
      const uniqueTokens = new Set(tokens);

      uniqueTokens.forEach(token => {
        if (!this.vocabulary.has(token)) {
          this.vocabulary.set(token, this.vocabulary.size);
        }
        docFreq.set(token, (docFreq.get(token) || 0) + 1);
      });
    });

    // Calculate IDF (Inverse Document Frequency)
    // IDF = log(total_docs / docs_containing_term)
    docFreq.forEach((freq, token) => {
      this.idf.set(token, Math.log(totalDocs / freq));
    });

    console.log(`[TF-IDF] Vocabulary size: ${this.vocabulary.size}, Total documents: ${totalDocs}`);
  }

  /**
   * Calculate TF (Term Frequency) for a document
   */
  calculateTF(tokens) {
    const tf = new Map();
    const totalTokens = tokens.length;

    if (totalTokens === 0) {
      return tf;
    }

    tokens.forEach(token => {
      tf.set(token, (tf.get(token) || 0) + 1);
    });

    // Normalize TF (divide by total tokens)
    tf.forEach((count, token) => {
      tf.set(token, count / totalTokens);
    });

    return tf;
  }

  /**
   * Transform a document into a TF-IDF vector
   */
  transform(text) {
    if (!text || typeof text !== 'string') {
      return new Array(this.vocabulary.size).fill(0);
    }

    const tokens = this.preprocess(text);
    const tf = this.calculateTF(tokens);
    const vector = new Array(this.vocabulary.size).fill(0);

    tf.forEach((tfValue, token) => {
      if (this.vocabulary.has(token)) {
        const idx = this.vocabulary.get(token);
        const idfValue = this.idf.get(token) || 0;
        vector[idx] = tfValue * idfValue;
      }
    });

    return vector;
  }

  /**
   * Get vocabulary
   */
  getVocabulary() {
    return this.vocabulary;
  }

  /**
   * Get IDF values
   */
  getIDF() {
    return this.idf;
  }

  /**
   * Get vocabulary size
   */
  getVocabularySize() {
    return this.vocabulary.size;
  }

  /**
   * Get statistics about preprocessing
   */
  getPreprocessingStats(text) {
    const original = text.split(/\s+/).length;
    const preprocessed = this.preprocess(text).length;
    return {
      originalTokenCount: original,
      preprocessedTokenCount: preprocessed,
      tokensRemoved: original - preprocessed,
      removalPercentage: ((original - preprocessed) / original * 100).toFixed(2) + '%'
    };
  }

  /**
   * Enable/disable stemming
   */
  setStemming(enabled) {
    this.enableStemming = enabled;
  }

  /**
   * Enable/disable stop word removal
   */
  setStopWordRemoval(enabled) {
    this.enableStopWordRemoval = enabled;
  }

  /**
   * Set minimum token length
   */
  setMinTokenLength(length) {
    this.minTokenLength = length;
  }
}

module.exports = TFIDFVectorizer;
