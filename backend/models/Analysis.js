const mongoose = require('mongoose');

/**
 * Analysis Schema
 * Stores resume-JD analysis results for each user
 */
const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    
    resumeText: {
      type: String,
      required: [true, 'Resume text is required'],
      trim: true,
      maxlength: [50000, 'Resume text cannot exceed 50000 characters']
    },
    
    resumeFileName: {
      type: String,
      default: null
    },
    
    jdText: {
      type: String,
      required: [true, 'Job description text is required'],
      trim: true,
      maxlength: [50000, 'Job description text cannot exceed 50000 characters']
    },
    
    jdFileName: {
      type: String,
      default: null
    },
    
    matchPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    
    atsScoreBreakdown: {
      keywordDensity: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      skillsPresence: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      sectionDetection: {
        detected: [String],
        count: Number,
        score: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        }
      },
      formattingIndicators: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    },
    
    matchedSkills: {
      type: Map,
      of: [String],
      default: {}
    },
    
    missingSkills: {
      type: Map,
      of: [String],
      default: {}
    },
    
    extractedResumeSkills: {
      type: Map,
      of: [String],
      default: {}
    },
    
    extractedJDSkills: {
      type: Map,
      of: [String],
      default: {}
    },
    
    missingKeywords: {
      type: [String],
      default: []
    },
    
    allRequiredSkills: {
      type: [String],
      default: []
    },
    
    providedSkills: {
      type: [String],
      default: []
    },
    
    experience: {
      resumeYears: [Number],
      requiredYears: [Number],
      matchScore: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
      },
      isQualified: {
        type: Boolean,
        default: null
      },
      message: String
    },
    
    jobTitle: {
      type: String,
      default: null
    },
    
    company: {
      type: String,
      default: null
    },
    
    notes: {
      type: String,
      default: null,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    
    tags: {
      type: [String],
      default: []
    },
    
    isFavorite: {
      type: Boolean,
      default: false
    },
    
    status: {
      type: String,
      enum: ['pending', 'completed', 'archived'],
      default: 'completed'
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

/**
 * Create compound indexes for efficient querying
 */
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ createdAt: -1 });
analysisSchema.index({ status: 1 });
analysisSchema.index({ isFavorite: 1 });

/**
 * Virtual for summary score (average of match percentage and ATS score)
 */
analysisSchema.virtual('overallScore').get(function() {
  return Math.round((this.matchPercentage + this.atsScore) / 2);
});

/**
 * Populate User on retrieve
 */
analysisSchema.pre(/^find/, function(next) {
  next();
});

/**
 * Static method to get analysis statistics
 */
analysisSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {

        totalAnalyses: { $sum: 1 },
        avgMatchPercentage: { $avg: '$matchPercentage' },
        avgAtsScore: { $avg: '$atsScore' },
        maxMatchPercentage: { $max: '$matchPercentage' },
        minMatchPercentage: { $min: '$matchPercentage' },
        favoriteCount: {
          $sum: { $cond: ['$isFavorite', 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalAnalyses: 0,
    avgMatchPercentage: 0,
    avgAtsScore: 0,
    maxMatchPercentage: 0,
    minMatchPercentage: 0,
    favoriteCount: 0
  };
};

/**
 * Instance method to get improvement score
 */
analysisSchema.methods.getImprovementScore = function() {
  const maxScore = 100;
  return maxScore - this.overallScore;
};

/**
 * Instance method to get qualification status
 */
analysisSchema.methods.getQualificationStatus = function() {
  if (this.experience.isQualified === null) {
    return 'Unknown';
  }
  return this.experience.isQualified ? 'Qualified' : 'Under-qualified';
};

// Create indexes
analysisSchema.index({ userId: 1 });
analysisSchema.index({ createdAt: -1 });

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;
