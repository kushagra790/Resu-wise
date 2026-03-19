const mongoose = require('mongoose');
require('dotenv').config();
const Question = require('../models/Question');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resuwise';

// Additional questions to expand the database
const additionalQuestions = [
  // More SQL Questions
  {
    category: 'SQL',
    question: 'Which keyword is used to filter records in SQL?',
    answers: {
      answer_a: 'FIND',
      answer_b: 'WHERE',
      answer_c: 'FILTER',
      answer_d: 'SEARCH'
    },
    correct_answer: 'answer_b',
    difficulty: 'easy'
  },
  {
    category: 'SQL',
    question: 'What is the purpose of the GROUP BY clause?',
    answers: {
      answer_a: 'To sort results alphabetically',
      answer_b: 'To group rows that have the same values',
      answer_c: 'To delete duplicate records',
      answer_d: 'To join multiple tables'
    },
    correct_answer: 'answer_b',
    difficulty: 'medium'
  },
  {
    category: 'SQL',
    question: 'Which SQL function returns the total number of records?',
    answers: {
      answer_a: 'TOTAL()',
      answer_b: 'SUM()',
      answer_c: 'COUNT()',
      answer_d: 'NUMBER()'
    },
    correct_answer: 'answer_c',
    difficulty: 'easy'
  },
  {
    category: 'SQL',
    question: 'What is a Foreign Key?',
    answers: {
      answer_a: 'A key that identifies a record in another table',
      answer_b: 'A key that encrypts data',
      answer_c: 'A backup key for the primary key',
      answer_d: 'A key that sorts records'
    },
    correct_answer: 'answer_a',
    difficulty: 'medium'
  },
  {
    category: 'SQL',
    question: 'Which join returns all records from both tables?',
    answers: {
      answer_a: 'INNER JOIN',
      answer_b: 'LEFT JOIN',
      answer_c: 'FULL OUTER JOIN',
      answer_d: 'RIGHT JOIN'
    },
    correct_answer: 'answer_c',
    difficulty: 'hard'
  },
  {
    category: 'SQL',
    question: 'What does UNION do in SQL?',
    answers: {
      answer_a: 'Combines result sets from multiple queries',
      answer_b: 'Joins two tables',
      answer_c: 'Deletes records',
      answer_d: 'Updates records'
    },
    correct_answer: 'answer_a',
    difficulty: 'medium'
  },
  {
    category: 'SQL',
    question: 'What is an INDEX in SQL?',
    answers: {
      answer_a: 'A structure to increase query speed',
      answer_b: 'A list of tables',
      answer_c: 'A backup file',
      answer_d: 'A data type'
    },
    correct_answer: 'answer_a',
    difficulty: 'medium'
  },
  {
    category: 'SQL',
    question: 'What does DISTINCT keyword do?',
    answers: {
      answer_a: 'Removes duplicate rows',
      answer_b: 'Counts rows',
      answer_c: 'Groups rows',
      answer_d: 'Orders rows'
    },
    correct_answer: 'answer_a',
    difficulty: 'easy'
  },
  {
    category: 'SQL',
    question: 'What is a subquery?',
    answers: {
      answer_a: 'A query within another query',
      answer_b: 'A table join',
      answer_c: 'A data backup',
      answer_d: 'A database index'
    },
    correct_answer: 'answer_a',
    difficulty: 'hard'
  },
  {
    category: 'SQL',
    question: 'Which statement is used to modify data in SQL?',
    answers: {
      answer_a: 'MODIFY',
      answer_b: 'CHANGE',
      answer_c: 'UPDATE',
      answer_d: 'EDIT'
    },
    correct_answer: 'answer_c',
    difficulty: 'easy'
  }
];

async function addQuestions() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const inserted = await Question.insertMany(additionalQuestions);
    console.log(`✅ Successfully added ${inserted.length} more questions`);

    // Display updated stats
    const stats = await Question.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Updated questions per category:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} questions`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding questions:', error);
    process.exit(1);
  }
}

addQuestions();
