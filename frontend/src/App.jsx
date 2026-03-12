import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Home Route */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-br from-slate-950 to-purple-950 flex flex-col">
              <Navbar />
              <HomePage />
            </div>
          }
        />

        {/* Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <div className="min-h-screen bg-gradient-to-br from-slate-950 to-purple-950">
              <Navbar />
              <Dashboard />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
