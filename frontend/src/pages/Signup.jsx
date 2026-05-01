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
        const response = await api.post('/auth/check-password-strength', {
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Subtle glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/8 blur-[100px] pointer-events-none"></div>

      <div className="relative max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium"
        >
          ← Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 items-center justify-center text-2xl shadow-xl shadow-blue-600/30 mb-4">
            🚀
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">ResuWise</h1>
          <p className="text-gray-500 text-sm">AI Resume Intelligence Platform</p>
        </div>

        {/* Signup Form Card */}
        <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-6">Create Account</h2>

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              {errors.map((error, idx) => (
                <p key={idx} className="text-red-400 text-sm">• {error}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-[#111] border border-white/8 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-600/60 focus:ring-1 focus:ring-blue-600/30 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-[#111] border border-white/8 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-600/60 focus:ring-1 focus:ring-blue-600/30 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#111] border border-white/8 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-600/60 focus:ring-1 focus:ring-blue-600/30 transition-all text-sm"
              />

              {password && passwordStrength && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all`}
                        style={{ width: `${passwordStrength.data?.strength || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-400">
                      {passwordStrength.data?.strengthLevel}
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    {passwordStrength.data?.errors?.length > 0 ? (
                      passwordStrength.data.errors.map((error, idx) => (
                        <div key={idx} className="text-red-400 flex items-center gap-1">✗ {error}</div>
                      ))
                    ) : (
                      <div className="text-green-400 flex items-center gap-1">✓ Password meets all requirements</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#111] border border-white/8 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-600/60 focus:ring-1 focus:ring-blue-600/30 transition-all text-sm"
              />
              {password && passwordConfirm && password !== passwordConfirm && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-blue-600"
              />
              <label className="text-sm text-gray-500 cursor-pointer">
                I agree to terms and conditions
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-400 font-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

