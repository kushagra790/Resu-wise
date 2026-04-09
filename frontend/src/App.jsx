import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import Dashboard from './pages/Dashboard';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Home Route */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-br from-black to-black flex flex-col">
              <Navbar />
              <HomePage />
            </div>
          }
        />

        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Signup Route */}
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard Route - Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-black to-black">
                <Navbar />
                <Dashboard />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Resume Builder Route - Protected */}
        <Route
          path="/resume-builder"
          element={
            <ProtectedRoute>
              <ResumeBuilderPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
