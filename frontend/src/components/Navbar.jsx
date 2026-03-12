import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-gradient-to-r from-slate-950 to-purple-950 text-white shadow-2xl sticky top-0 z-40 border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <div className="text-2xl font-black">🚀</div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                ResuWise
              </h1>
              <p className="text-xs text-purple-300 font-medium">AI Resume Intelligence Platform</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-4">
            {/* Dashboard Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="hidden sm:inline-block px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg font-semibold transition-all duration-300 border border-purple-500/30 hover:border-purple-400/50"
            >
              📊 Dashboard
            </button>

            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 transform hover:-translate-y-0.5"
            >
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
