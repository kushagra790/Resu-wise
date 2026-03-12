const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const validator = require('validator');

/**
 * User Schema
 * Stores user account information with authentication details
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email address'],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password by default
    },
    
    role: {
      type: String,
      enum: ['user', 'admin', 'premium'],
      default: 'user'
    },
    
    isVerified: {
      type: Boolean,
      default: false
    },
    
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    
    lockUntil: {
      type: Date,
      default: null
    },
    
    verificationToken: {
      type: String,
      select: false
    },
    
    verificationTokenExpire: {
      type: Date,
      select: false
    },
    
    passwordResetToken: {
      type: String,
      select: false
    },
    
    passwordResetExpire: {
      type: Date,
      select: false
    },
    
    lastLogin: {
      type: Date,
      default: null
    },
    
    profilePicture: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

/**
 * Hash password before saving
 */
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare provided password with hashed password
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

/**
 * Check if account is locked
 */
userSchema.methods.isAccountLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

/**
 * Increment failed login attempts
 * Locks account after 5 failed attempts for 15 minutes
 */
userSchema.methods.incLoginAttempts = async function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  // Increment attempts
  const updates = { $inc: { failedLoginAttempts: 1 } };

  // Lock account after 5 failed attempts for 15 minutes
  const maxAttempts = 5;
  const lockTimeInMinutes = 15;

  if (this.failedLoginAttempts + 1 >= maxAttempts && !this.isAccountLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTimeInMinutes * 60 * 1000 };
  }

  return this.updateOne(updates);
};

/**
 * Reset login attempts on successful login
 */
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { failedLoginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 }
  });
};

/**
 * Hide sensitive fields
 */
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.verificationTokenExpire;
  delete user.passwordResetToken;
  delete user.passwordResetExpire;
  return user;
};

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
