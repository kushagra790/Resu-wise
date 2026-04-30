const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

/**
 * ══════════════════════════════════════════════════════════════════
 * QUIZ SYSTEM - ENHANCED WITH ANSWER SHUFFLING
 * ══════════════════════════════════════════════════════════════════
 * 
 * IMPROVEMENTS:
 * 1. Randomly selects 5 questions from available pool (no more repetition)
 * 2. Shuffles answer options for each question (prevents pattern recognition)
 * 3. Updates correct_answer based on shuffled positions
 * 4. Maintains scoring logic compatibility
 * 5. Removes internal database fields before sending to frontend
 * 
 * FLOW:
 * Frontend → GET /api/quiz/questions?category=REACT&limit=5
 * → Backend fetches ALL questions for category
 * → Randomly selects 5 questions
 * → Shuffles answers for each question
 * → Returns clean response to frontend
 * → Frontend stores answers and validates on response
 */

// ─────────────────────────────────────────────────────────────────
// UTILITY: Shuffle array (Fisher-Yates algorithm)
// ─────────────────────────────────────────────────────────────────
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─────────────────────────────────────────────────────────────────
// UTILITY: Shuffle answer options and remap correct_answer
// ─────────────────────────────────────────────────────────────────
function shuffleAnswersAndRemapCorrect(question) {
  // Create array of answer keys in original order
  const originalAnswerKeys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
  const originalAnswerValues = originalAnswerKeys.map(key => question.answers[key]);
  
  // Find the original correct answer value
  const originalCorrectAnswer = question.answers[question.correct_answer];
  
  // Shuffle the answer values
  const shuffledAnswerValues = shuffleArray(originalAnswerValues);
  
  // Find new position of correct answer
  const newCorrectAnswerKey = originalAnswerKeys[shuffledAnswerValues.indexOf(originalCorrectAnswer)];
  
  // Create new answers object with shuffled values
  const newAnswers = {};
  originalAnswerKeys.forEach((key, index) => {
    newAnswers[key] = shuffledAnswerValues[index];
  });
  
  return {
    ...question,
    answers: newAnswers,
    correct_answer: newCorrectAnswerKey
  };
}

// ─────────────────────────────────────────────────────────────────
// UTILITY: Remove internal database fields
// ─────────────────────────────────────────────────────────────────
function cleanQuestionForFrontend(question) {
  return {
    question: question.question,
    answers: question.answers,
    correct_answer: question.correct_answer,
    difficulty: question.difficulty
    // Intentionally removed: _id, category, createdAt, updatedAt, __v
  };
}

// ─────────────────────────────────────────────────────────────────
// ROUTE: Get quiz questions by category with randomization
// ─────────────────────────────────────────────────────────────────
/**
 * GET /api/quiz/questions?category=REACT&limit=5
 * 
 * PROCESS:
 * 1. Fetch ALL questions for the requested category
 * 2. Shuffle the entire question pool
 * 3. Select only the first 'limit' questions
 * 4. For each question:
 *    - Shuffle the answer options (a, b, c, d)
 *    - Remap correct_answer to match new position
 *    - Remove internal database fields
 * 5. Return clean response
 */
router.get('/questions', async (req, res) => {
  try {
    const { category = 'CODE', limit = 5 } = req.query;
    
    console.log(`[Quiz] Fetching questions for category: ${category}, limit: ${limit}`);
    
    // ─ STEP 1: Fetch ALL questions for the category
    const allQuestions = await Question.find({ category: category.toUpperCase() })
      .lean(); // Use lean for better performance (read-only)
    
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
    
    console.log(`[Quiz] Found ${allQuestions.length} questions for ${category}`);
    
    // ─ STEP 2: Shuffle all questions and select random subset
    const shuffledQuestions = shuffleArray(allQuestions);
    const selectedQuestions = shuffledQuestions.slice(0, parseInt(limit) || 5);
    
    // ─ STEP 3: For each question, shuffle answers and remap correct_answer
    const processedQuestions = selectedQuestions.map(question => {
      const shuffledQuestion = shuffleAnswersAndRemapCorrect(question);
      return cleanQuestionForFrontend(shuffledQuestion);
    });
    
    console.log(`[Quiz] Returning ${processedQuestions.length} randomized questions`);
    res.json(processedQuestions);
    
  } catch (error) {
    console.error('[Quiz API Error]:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ─────────────────────────────────────────────────────────────────
// ROUTE: Get available quiz categories
// ─────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────
// ROUTE: CREATE - Add a new question (Admin)
// ─────────────────────────────────────────────────────────────────
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
