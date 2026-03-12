const express = require('express');
const {
  saveAnalysis,
  getUserHistory,
  getAnalysisById,
  updateAnalysis,
  deleteAnalysis,
  getUserStats,
  getFavorites,
  searchAnalyses,
  exportAnalyses
} = require('../controllers/historyController');

const router = express.Router();

// Save analysis
router.post('/save', saveAnalysis);

// Get stats before other routes
router.get('/stats', getUserStats);
router.get('/favorites', getFavorites);
router.get('/search', searchAnalyses);
router.get('/export', exportAnalyses);

// Get all with pagination
router.get('/all', getUserHistory);

// Get single analysis
router.get('/:id', getAnalysisById);

// Update analysis
router.put('/:id', updateAnalysis);

// Delete analysis
router.delete('/:id', deleteAnalysis);

module.exports = router;
