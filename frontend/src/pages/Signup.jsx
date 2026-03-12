import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  // Check password strength in real-time
  useEffect(() => {
    const checkStrength = async () => {
      if (!password) {
        setPasswordStrength(null);
        return;
      }

      try {
        const response = await api.post('/api/auth/check-password-strength', {
          password
        });
        setPasswordStrength(response.data);
      } catch (err) {
        console.error('Error checking password strength:', err);
      }
    };

    const timer = setTimeout(checkStrength, 300);
    return () => clearTimeout(timer);
  }, [password]);

  // Auto-redirect on successful signup
  useEffect(() => {
    if (success) {
      const redirectTimer = setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      return () => clearTimeout(redirectTimer);
    }
  }, [success, navigate]);

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return 'bg-gray-400';
    const level = passwordStrength.data?.strengthLevel;
    switch (level) {
      case 'Weak':
        return 'bg-red-500';
      case 'Fair':
        return 'bg-orange-500';
      case 'Moderate':
        return 'bg-yellow-500';
      case 'Strong':
        return 'bg-lime-500';
      case 'Very Strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
      setErrors(['Please fill in all fields']);
      return;
    }

    if (!agreeToTerms) {
      setErrors(['Please agree to terms and conditions']);
      return;
    }

    if (password !== passwordConfirm) {
      setErrors(['Passwords do not match']);
      return;
    }

    setIsLoading(true);

    const result = await signup(name, email, password, passwordConfirm);

    if (result.success) {
      setSuccess(true);
      setSuccessMessage(`✅ Account created successfully! Welcome ${name}! Redirecting to dashboard...`);
    } else {
      if (Array.isArray(result.validationErrors)) {
        setErrors(result.validationErrors);
      } else {
        setErrors([result.error]);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-purple-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
        >
          ← Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl font-black mb-3">🚀</div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            ResuWise
          </h1>
          <p className="text-purple-300">AI Resume Intelligence Platform</p>
        </div>

        {/* Signup Form Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg animate-pulse">
              <p className="text-green-200 text-sm font-medium">
                {successMessage}
              </p>
            </div>
          )}

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              {errors.map((error, idx) => (
                <p key={idx} className="text-red-200 text-sm font-medium">
                  • {error}
                </p>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-500/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-500/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-500/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              />

              {/* Password Requirements */}
              {password && passwordStrength && (
                <div className="mt-3 space-y-2">
                  {/* Strength Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all`}
                        style={{
                          width: `${passwordStrength.data?.strength || 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-purple-300">
                      {passwordStrength.data?.strengthLevel}
                    </span>
                  </div>

                  {/* Requirements List */}
                  <div className="text-xs space-y-1">
                    {passwordStrength.data?.errors?.length > 0 ? (
                      passwordStrength.data.errors.map((error, idx) => (
                        <div key={idx} className="text-red-400 flex items-center gap-1">
                          ✗ {error}
                        </div>
                      ))
                    ) : (
                      <div className="text-green-400 flex items-center gap-1">
                        ✓ Password meets all requirements
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-500/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              />
              {password && passwordConfirm && password !== passwordConfirm && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <label className="text-sm text-purple-300 cursor-pointer">
                I agree to terms and conditions
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-purple-500/50 disabled:to-blue-600/50 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-purple-300 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
