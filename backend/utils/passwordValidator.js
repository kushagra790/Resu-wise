/**
 * Password Validation Utilities
 * Enforces strong password requirements
 */

/**
 * Check if password meets strong password requirements
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
const validateStrongPassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least 1 lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least 1 number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least 1 special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)')
  }

  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length > 0 ? errors.join('. ') : 'Password meets requirements'
  };
};

/**
 * Generate password strength indicator
 */
const getPasswordStrength = (password) => {
  let strength = 0;

  // Length
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;

  // Character variety
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;

  if (strength > 100) strength = 100;

  let level = 'Weak';
  if (strength >= 80) level = 'Very Strong';
  else if (strength >= 60) level = 'Strong';
  else if (strength >= 40) level = 'Moderate';
  else if (strength >= 20) level = 'Fair';

  return {
    score: strength,
    level
  };
};

module.exports = {
  validateStrongPassword,
  getPasswordStrength
};
