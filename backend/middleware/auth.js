const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '1h'; // 1 hour default

/**
 * Protect routes - verify JWT token and attach user to request
 * All protected routes require valid Bearer token
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route - token missing',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User associated with token not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if account is locked
    if (req.user.isAccountLocked()) {
      const lockTimeRemaining = Math.ceil((req.user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(423).json({
        success: false,
        message: `Account is locked. Try again in ${lockTimeRemaining} minutes.`,
        locked: true,
        lockTimeMinutes: lockTimeRemaining,
        code: 'ACCOUNT_LOCKED'
      });
    }

    next();
  } catch (error) {
    let message = 'Not authorized to access this route';
    let code = 'INVALID_TOKEN';

    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired. Please login again';
      code = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
      code = 'TOKEN_INVALID';
    }

    res.status(401).json({
      success: false,
      message,
      code
    });
  }
};

/**
 * Optional authentication - attach user to request if token provided, but don't fail if not
 */
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // Token invalid but continue anyway
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

/**
 * Authorize specific roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route.`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    next();
  };
};

/**
 * Generate JWT Token
 * Expires in 1 hour by default
 */
exports.generateToken = (userId) => {
  const token = jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
  return token;
};

/**
 * Send token response with user data
 */
exports.sendTokenResponse = (user, statusCode, res) => {
  const token = exports.generateToken(user._id);

  // Decode to get expiry info
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);

  res.status(statusCode).json({
    success: true,
    token,
    expiresAt,
    expiresIn: JWT_EXPIRE,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }
  });
};
