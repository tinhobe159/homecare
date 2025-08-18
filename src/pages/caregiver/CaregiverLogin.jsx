import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, userRolesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Heart, Shield, Clock, MapPin } from 'lucide-react';

const CaregiverLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: 'sarah.caregiver@veroncare.com',
    password: 'CaregiverP@ss2024!'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get all users and user roles
      const [usersResponse, userRolesResponse] = await Promise.all([
        usersAPI.getAll(),
        userRolesAPI.getAll()
      ]);
      
      // Find user with caregiver role (role_id = 2)
      const caregiverRoleIds = userRolesResponse.data
        .filter(role => role.role_id === 2)
        .map(role => role.user_id);
      
      const caregiver = usersResponse.data.find(user => 
        caregiverRoleIds.includes(user.id) &&
        user.email === formData.email && 
        user.password === formData.password
      );
      
      if (caregiver) {
        login(caregiver, 'caregiver'); // Login as caregiver with proper role
        toast.success('Welcome back! Ready to provide great care today.');
        navigate('/caregiver/dashboard');
      } else {
        toast.error('Invalid caregiver credentials or access denied');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Caregiver Portal
          </h2>
          <p className="text-gray-600">
            Access your schedule, care plans, and client information
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Schedule</p>
          </div>
          <div className="text-center">
            <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">GPS Check-in</p>
          </div>
          <div className="text-center">
            <Shield className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Secure</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="caregiver@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help accessing your account?{' '}
              <Link to="/contact" className="text-blue-600 hover:text-blue-500">
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Demo Access */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 mb-2">
            <strong>Demo Access:</strong>
          </p>
          <p className="text-xs text-yellow-700">
            Email: sarah.caregiver@veroncare.com<br />
            Password: CaregiverP@ss2024!
          </p>
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CaregiverLogin;
