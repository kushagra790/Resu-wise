const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const Question = require('./models/Question');
const { allQuestions } = require('./scripts/seedQuizFull');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin ? corsOrigin.split(',').map(origin => origin.trim()) : true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
const analyzeRoutes = require('./routes/analyze');
const historyRoutes = require('./routes/history');
const quizRoutes = require('./routes/quiz');
const authRoutes = require('./routes/auth');

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ResuWise Backend API', version: '1.0.0', endpoints: { auth: '/api/auth', analyze: '/api/analyze', history: '/api/history', quiz: '/api/quiz', health: '/health' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/quiz', quizRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

async function ensureQuizQuestionsSeeded() {
  const questionCount = await Question.estimatedDocumentCount();

  if (questionCount > 0) {
    console.log(`[Quiz Seed] ${questionCount} quiz questions already available`);
    return;
  }

  const inserted = await Question.insertMany(allQuestions);
  console.log(`[Quiz Seed] Seeded ${inserted.length} quiz questions`);
}

async function startServer() {
  await connectDB();
  await ensureQuizQuestionsSeeded();

  app.listen(PORT, () => {
    console.log(`🚀 ResuWise Backend running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start ResuWise Backend:', error);
  process.exit(1);
});

module.exports = app;
