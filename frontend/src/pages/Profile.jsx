import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Validation
      if (!formData.name.trim()) {
        setError('Name is required');
        setIsLoading(false);
        return;
      }

      if (formData.name.trim().length < 2) {
        setError('Name must be at least 2 characters');
        setIsLoading(false);
        return;
      }

      if (formData.email !== user?.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Please provide a valid email address');
          setIsLoading(false);
          return;
        }
      }

      // Call update API
      const response = await api.put('/auth/updateprofile', {
        name: formData.name.trim(),
        email: formData.email
      });

      if (response.data.success) {
        // Update user in context and localStorage
        const updatedUser = response.data.data;
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!'
        });

        // Reset form
        setFormData({
          name: updatedUser.name,
          email: updatedUser.email
        });

        // Redirect after 2 seconds
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update profile';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/20 to-black text-white py-20 px-4">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-b from-blue-600/20 to-transparent blur-[120px] animate-pulse"></div>
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-cyan-600/15 to-transparent blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-blue-400 transition-colors mb-4"
          >
            <span>←</span> Back to Dashboard
          </button>
          <h1 className="text-4xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Edit Profile
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Update your account information</p>
        </div>

        {/* Messages */}
        {message?.type === 'success' && (
          <div className="mb-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg text-green-300 text-center font-medium animate-fadeIn">
            ✓ {message.text}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-300 text-center font-medium animate-fadeIn">
            ✗ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card background */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
            
            <div className="relative bg-[#0a0a0a] border border-blue-600/30 group-hover:border-cyan-500/50 rounded-2xl p-8 transition-all duration-300">
              
              {/* Name Field */}
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-semibold text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 hover:border-blue-600/30 focus:border-blue-600/50 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all duration-300"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 hover:border-blue-600/30 focus:border-blue-600/50 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all duration-300"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-bold text-lg transition-all duration-300 shadow-xl shadow-blue-600/40 hover:shadow-cyan-600/40 hover:scale-105 transform disabled:scale-100 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⟳</span> Updating...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>

            </div>
          </div>

          {/* Current Info */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2 text-sm text-gray-400">
            <p><span className="text-blue-400 font-semibold">Current name:</span> {user?.name}</p>
            <p><span className="text-blue-400 font-semibold">Current email:</span> {user?.email}</p>
            <p><span className="text-blue-400 font-semibold">Account role:</span> {user?.role || 'user'}</p>
          </div>

        </form>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
