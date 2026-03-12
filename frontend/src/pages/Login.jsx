import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [credentialError, setCredentialError] = useState('');
  const [attemptsInfo, setAttemptsInfo] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCredentialError('');
    setAttemptsInfo(null);

    if (!email || !password) {
      setCredentialError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setCredentialError(result.error);

      // Show attempt information if account is locked
      if (result.details?.lockTimeMinutes) {
        setAttemptsInfo({
          type: 'locked',
          message: `Account locked. Try again in ${result.details.lockTimeMinutes} minutes.`,
          attemptsRemaining: result.details.attemptsRemaining
        });
      } else if (result.details?.attemptsRemaining !== undefined) {
        setAttemptsInfo({
          type: 'warning',
          message: `${result.details.attemptsRemaining} attempts remaining`,
          attemptsRemaining: result.details.attemptsRemaining
        });
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
        <div className="text-center mb-8">
          <div className="text-5xl font-black mb-3">🚀</div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            ResuWise
          </h1>
          <p className="text-purple-300">AI Resume Intelligence Platform</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Login</h2>

          {/* Error Messages */}
          {credentialError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm font-medium">{credentialError}</p>
            </div>
          )}

          {attemptsInfo && (
            <div
              className={`mb-4 p-3 rounded-lg border ${
                attemptsInfo.type === 'locked'
                  ? 'bg-red-500/20 border-red-500/50'
                  : 'bg-yellow-500/20 border-yellow-500/50'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  attemptsInfo.type === 'locked' ? 'text-red-200' : 'text-yellow-200'
                }`}
              >
                {attemptsInfo.message}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-purple-500/50 disabled:to-blue-600/50 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Signup Link */}
          <p className="text-center text-purple-300 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold">
              Sign up
            </Link>
          </p>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-purple-400 text-xs">
          <p>Demo Credentials:</p>
          <p>Email: demo@example.com | Password: Demo@123456</p>
        </div>
      </div>
    </div>
  );
}
