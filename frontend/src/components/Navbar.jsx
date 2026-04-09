import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-black/95 text-white sticky top-0 z-40 border-b border-blue-600/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-lg shadow-lg shadow-blue-600/30 group-hover:shadow-blue-600/50 transition-all duration-300">
              🚀
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                ResuWise
              </h1>
              <p className="text-[10px] text-blue-400/60 font-medium tracking-widest uppercase">Smart Resume Platform</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated && (
              <>
                <span className="hidden sm:inline text-sm text-gray-400">
                  Welcome, <span className="text-blue-400 font-medium">{user?.name}</span>
                </span>
                <button
                  onClick={() => navigate('/profile')}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-blue-600/30 transition-all duration-200"
                  title="Edit profile"
                >
                  <span className="text-base">⚙️</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-blue-600/30 transition-all duration-200"
                >
                  <span className="text-base">📊</span>
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/30 transition-all duration-200"
                >
                  <span className="text-base">🚪</span>
                  Logout
                </button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-blue-600/30 transition-all duration-200"
                >
                  <span className="text-base">🔑</span>
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40"
                >
                  <span className="text-base">✍️</span>
                  Sign Up
                </button>
              </>
            )}

            {!isAuthenticated && (
              <button
                onClick={() => navigate('/')}
                className="sm:hidden inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40"
              >
                <span className="text-base">🏠</span>
                Home
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

