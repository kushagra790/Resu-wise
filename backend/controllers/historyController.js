const Analysis = require('../models/Analysis');

/**
 * Save Analysis Result
 * POST /api/history/save
 */
exports.saveAnalysis = async (req, res) => {
  try {
    const {
      resumeText,
      jdText,
      matchPercentage,
      atsScore,
      atsScoreBreakdown,
      matchedSkills,
      missingSkills,
      missingKeywords,
      experience,
      extractedResumeSkills,
      extractedJDSkills,
      allRequiredSkills,
      providedSkills,
      jobTitle,
      company,
      notes
    } = req.body;

    // Validation
    if (!resumeText || !jdText) {
      return res.status(400).json({
        success: false,
        message: 'Resume and job description texts are required'
      });
    }

    // Create analysis record
    const analysis = await Analysis.create({
      resumeText,
      jdText,
      matchPercentage,
      atsScore,
      atsScoreBreakdown,
      matchedSkills,
      missingSkills,
      missingKeywords,
      experience,
      extractedResumeSkills,
      extractedJDSkills,
      allRequiredSkills,
      providedSkills,
      jobTitle: jobTitle || null,
      company: company || null,
      notes: notes || null
    });

    res.status(201).json({
      success: true,
      message: 'Analysis saved successfully',
      data: analysis
    });
  } catch (error) {
    console.error('Save Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error saving analysis'
    });
  }
};

/**
 * Get User's Analysis History
 * GET /api/history/all
 */
exports.getUserHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = '-createdAt', status = 'completed' } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Get total count
    const total = await Analysis.countDocuments(query);

    // Get analyses with pagination
    const analyses = await Analysis.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: analyses.length,
      total,
      pages: Math.ceil(total / limit),
      data: analyses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get Single Analysis by ID
 * GET /api/history/:id
 */
exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update Analysis (notes, favorite status, tags)
 * PUT /api/history/:id
 */
exports.updateAnalysis = async (req, res) => {
  try {
    const { notes, isFavorite, tags, status, jobTitle, company } = req.body;

    // Find analysis
    let analysis = await Analysis.findOne({
      _id: req.params.id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    // Update allowed fields
    const updateData = {};
    if (notes !== undefined) updateData.notes = notes;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
    if (tags) updateData.tags = tags;
    if (status) updateData.status = status;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (company !== undefined) updateData.company = company;

    analysis = await Analysis.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Analysis updated successfully',
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete Analysis
 * DELETE /api/history/:id
 */
exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Analysis deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get User Statistics
 * GET /api/history/stats
 */
exports.getUserStats = async (req, res) => {
  try {
    // Get all analyses
    const totalAnalyses = await Analysis.countDocuments();
    const favoriteCount = await Analysis.countDocuments({ isFavorite: true });
    
    const stats = {
      totalAnalyses,
      favoriteCount,
      averageScore: 0
    };
    
    // Calculate average ATS score
    const avgResult = await Analysis.aggregate([
      { $group: { _id: null, avgATS: { $avg: '$atsScore' } } }
    ]);
    
    if (avgResult.length > 0) {
      stats.averageScore = avgResult[0].avgATS;
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get Favorite Analyses
 * GET /api/history/favorites
 */
exports.getFavorites = async (req, res) => {
  try {
    const analyses = await Analysis.find({
      isFavorite: true
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Search Analyses
 * GET /api/history/search?q=keyword
 */
exports.searchAnalyses = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const analyses = await Analysis.find({
      $or: [
        { jobTitle: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Export Analyses (for CSV/JSON)
 * GET /api/history/export?format=json
 */
exports.exportAnalyses = async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const analyses = await Analysis.find({}).sort('-createdAt');

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="analyses.json"');
      res.send(JSON.stringify(analyses, null, 2));
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format. Use json or csv'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
