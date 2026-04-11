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

        {/* Login Form Card */}
        <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Welcome back</h2>

          {credentialError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{credentialError}</p>
            </div>
          )}

          {attemptsInfo && (
            <div className={`mb-4 p-3 rounded-lg border ${
              attemptsInfo.type === 'locked'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-yellow-500/10 border-yellow-500/30'
            }`}>
              <p className={`text-sm ${attemptsInfo.type === 'locked' ? 'text-red-400' : 'text-yellow-400'}`}>
                {attemptsInfo.message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-500 hover:text-blue-400 font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
