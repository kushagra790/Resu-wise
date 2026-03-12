const User = require('../../models/User');
const { sendTokenResponse, generateToken } = require('../../middleware/auth');
const { validateStrongPassword, getPasswordStrength } = require('../../utils/passwordValidator');

/**
 * Signup User with Strong Password Validation
 * POST /api/auth/signup
 */
exports.signup = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password, passwordConfirm)'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate strong password requirements
    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please use a different email or login.'
      });
    }

    // Create user with hashed password
    user = await User.create({
      name,
      email,
      password // Will be hashed by schema pre-save middleware
    });

    // Get password strength for client feedback
    const passwordStrength = getPasswordStrength(password);

    console.log(`✅ New user registered: ${email}`);

    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Signup Error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: messages
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user'
    });
  }
};

/**
 * Login User with Account Locking
 * POST /api/auth/login
 * Account locks for 15 minutes after 5 failed attempts
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user (include password field since it's set to select: false by default)
    let user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials - email not found'
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked. Please try again in ${lockTimeRemaining} minutes.`,
        locked: true,
        lockTimeMinutes: lockTimeRemaining
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Increment failed login attempts
      await user.incLoginAttempts();
      
      const failedAttempts = user.failedLoginAttempts + 1;
      const remainingAttempts = Math.max(0, 5 - failedAttempts);

      if (remainingAttempts === 0) {
        return res.status(423).json({
          success: false,
          message: 'Account locked due to too many failed login attempts. Please try again in 15 minutes.',
          locked: true,
          failedAttempts: failedAttempts,
          attemptsRemaining: 0
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials - password incorrect',
        failedAttempts: failedAttempts,
        attemptsRemaining: remainingAttempts
      });
    }

    // Reset login attempts on successful login
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      await user.resetLoginAttempts();
    }

    // Get updated user
    user = await User.findById(user._id);

    console.log(`✅ User logged in: ${email}`);

    // Send token response (expires in 1 hour by default)
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in'
    });
  }
};

/**
 * Get Current User Profile
 * GET /api/auth/me
 * Protected route - requires valid JWT
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update User Profile
 * PUT /api/auth/updateprofile
 * Protected route - requires valid JWT
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Check if email is already used
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    });

    console.log(`✅ User profile updated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update Password with Strong Password Requirements
 * PUT /api/auth/updatepassword
 * Protected route - requires valid JWT
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Validate strong password for new password
    const passwordValidation = validateStrongPassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet security requirements',
        details: passwordValidation.errors
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    console.log(`✅ Password changed for user: ${user.email}`);

    // Send new token with updated user
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Check Password Strength
 * POST /api/auth/check-password-strength
 * Not protected - used during signup for real-time feedback
 */
exports.checkPasswordStrength = (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const validation = validateStrongPassword(password);
    const strength = getPasswordStrength(password);

    res.status(200).json({
      success: true,
      data: {
        isValid: validation.isValid,
        errors: validation.errors,
        strength: strength.score,
        strengthLevel: strength.level,
        message: validation.message
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Logout User
 * GET /api/auth/logout
 * Protected route - requires valid JWT
 */
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully. Please clear the token on client side.',
    instruction: 'Delete the JWT token from localStorage/cookies'
  });
};
