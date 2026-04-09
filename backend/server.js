const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 ResuWise Backend running on http://localhost:${PORT}`);
});

module.exports = app;
