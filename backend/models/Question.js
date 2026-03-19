const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  question: {
    type: String,
    required: true
  },
  answers: {
    answer_a: String,
    answer_b: String,
    answer_c: String,
    answer_d: String
  },
  correct_answer: {
    type: String,
    required: true,
    enum: ['answer_a', 'answer_b', 'answer_c', 'answer_d']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster category queries
QuestionSchema.index({ category: 1 });

module.exports = mongoose.model('Question', QuestionSchema);
