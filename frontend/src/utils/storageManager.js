/**
 * Local storage manager for analysis history
 */

const HISTORY_KEY = 'resuwise_analysis_history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Save analysis to history
 */
export const saveAnalysisToHistory = (results, resumeText, jobDescriptionText) => {
  try {
    const history = getAnalysisHistory();

    const newAnalysis = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      dateForDisplay: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      matchPercentage: results.matchPercentage,
      atsScore: results.atsScore,
      resumePreview: resumeText.substring(0, 100) + '...',
      jobPreview: jobDescriptionText.substring(0, 100) + '...',
      fullResults: results
    };

    // Add to beginning of history
    history.unshift(newAnalysis);

    // Keep only last 20 items
    if (history.length > MAX_HISTORY_ITEMS) {
      history.pop();
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return newAnalysis;
  } catch (error) {
    console.error('Error saving to history:', error);
    return null;
  }
};

/**
 * Get all analysis history
 */
export const getAnalysisHistory = () => {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error retrieving history:', error);
    return [];
  }
};

/**
 * Get specific analysis by ID
 */
export const getAnalysisById = (id) => {
  const history = getAnalysisHistory();
  return history.find(item => item.id === id);
};

/**
 * Delete analysis from history
 */
export const deleteAnalysisFromHistory = (id) => {
  try {
    const history = getAnalysisHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting from history:', error);
    return false;
  }
};

/**
 * Clear all history
 */
export const clearAllHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
};

/**
 * Export history as JSON
 */
export const exportHistoryAsJSON = () => {
  try {
    const history = getAnalysisHistory();
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resuwise_history_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting history:', error);
  }
};
