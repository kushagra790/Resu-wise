const express = require('express');
const {
  signup,
  login,
  getMe,
  updateProfile,
  updatePassword,
  checkPasswordStrength,
  logout
} = require('../controllers/auth/authController');
const { protect } = require('../middleware/auth');
const { 
  validateSignup, 
  validateLogin, 
  validateUpdateProfile, 
  validateChangePassword,
  handleValidationErrors 
} = require('../middleware/validators');

const router = express.Router();

// Public routes
router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/check-password-strength', checkPasswordStrength);
router.get('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, validateUpdateProfile, handleValidationErrors, updateProfile);
router.put('/updatepassword', protect, validateChangePassword, handleValidationErrors, updatePassword);

module.exports = router;
