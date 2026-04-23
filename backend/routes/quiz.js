const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Shuffle array function
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get quiz questions by category - with randomization
router.get('/questions', async (req, res) => {
  try {
    const { category = 'CODE', limit = 5 } = req.query;
    
    // Fetch ALL questions for the category
    const allQuestions = await Question.find({ category: category.toUpperCase() })
      .select('-__v -updatedAt -createdAt');
    
    if (!allQuestions || allQuestions.length === 0) {
      const availableCategories = await Question.distinct('category');
      const categoryList = availableCategories.length > 0
        ? availableCategories.sort().join(', ')
        : 'No categories are currently seeded.';

      return res.status(404).json({ 
        error: 'No questions found for this category',
        message: availableCategories.length > 0
          ? `Try one of these seeded categories: ${categoryList}`
          : 'No quiz questions are currently seeded. Run the quiz seed script to populate data.',
        categories: availableCategories
      });
    }
    
    // Shuffle all questions
    const shuffledQuestions = shuffleArray(allQuestions);
    
    // Return only the requested limit
    const questions = shuffledQuestions.slice(0, parseInt(limit) || 5);
    
    res.json(questions);
  } catch (error) {
    console.error('Quiz API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get available categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Question.distinct('category');
    res.json({ categories: categories.sort() });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// CREATE - Add a new question (Admin)
router.post('/questions', async (req, res) => {
  try {
    const { category, question, answers, correct_answer, difficulty } = req.body;
    
    if (!category || !question || !answers || !correct_answer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newQuestion = new Question({
      category: category.toUpperCase(),
      question,
      answers,
      correct_answer,
      difficulty: difficulty || 'medium'
    });
    
    const saved = await newQuestion.save();
    res.status(201).json({ 
      message: 'Question created successfully',
      question: saved 
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ 
      error: 'Failed to create question',
      message: error.message 
    });
  }
});

// UPDATE - Update a question (Admin)
router.put('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, question, answers, correct_answer, difficulty } = req.body;
    
    const updated = await Question.findByIdAndUpdate(
      id,
      {
        category: category?.toUpperCase(),
        question,
        answers,
        correct_answer,
        difficulty,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json({ 
      message: 'Question updated successfully',
      question: updated 
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ 
      error: 'Failed to update question',
      message: error.message 
    });
  }
});

// DELETE - Delete a question (Admin)
router.delete('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Question.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json({ 
      message: 'Question deleted successfully',
      question: deleted 
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ 
      error: 'Failed to delete question',
      message: error.message 
    });
  }
});

// GET - Get all questions (for admin panel)
router.get('/all', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category) {
      query.category = category.toUpperCase();
    }
    
    const questions = await Question.find(query).sort({ category: 1, createdAt: -1 });
    
    res.json({ 
      total: questions.length,
      questions 
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET - Get question count by category
router.get('/stats/categories', async (req, res) => {
  try {
    const stats = await Question.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;
