import React, { useState } from 'react';
import { Eye, EyeOff, Heart, Shield, Clock, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const FamilyLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock login validation
      if (formData.email === 'family@demo.com' && formData.password === 'demo123') {
        // In a real app, store auth token
        localStorage.setItem('familyAuth', JSON.stringify({ 
          email: formData.email, 
          role: 'family',
          customerId: 'cust_001',
          familyMemberId: 'fm_001',
          name: 'Sarah Johnson'
        }));
        navigate('/family-dashboard');
      } else {
        setError('Invalid email or password. Try family@demo.com / demo123');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Heart,
      title: "Real-time Care Updates",
      description: "Receive instant notifications about your loved one's care activities and well-being"
    },
    {
      icon: Shield,
      title: "Secure Communication",
      description: "Direct messaging with caregivers and care coordinators through our encrypted platform"
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "View care history, photos, and updates anytime, anywhere from any device"
    },
    {
      icon: Users,
      title: "Family Coordination",
      description: "Keep all family members informed and coordinated about care decisions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Features and Branding */}
        <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-green-600 p-8 lg:p-12 text-white">
          <div className="max-w-md mx-auto lg:mx-0">
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Heart className="w-8 h-8 mr-3" />
                <span className="text-2xl font-bold">VERON</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                Stay Connected with Your Loved One's Care
              </h1>
              <p className="text-blue-100 text-lg">
                Access real-time updates, communicate with caregivers, and be part of your family member's care journey.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-blue-100 text-sm">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-white bg-opacity-10 rounded-lg">
              <h3 className="font-semibold mb-2">Demo Credentials</h3>
              <p className="text-sm text-blue-100">
                Email: <span className="font-mono">family@demo.com</span><br />
                Password: <span className="font-mono">demo123</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Family Portal Login</h2>
              <p className="text-gray-600">
                Access your family member's care information
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/family-forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in to Family Portal'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Need access to the Family Portal?{' '}
                <Link to="/contact" className="text-blue-600 hover:text-blue-800 font-medium">
                  Contact your care coordinator
                </Link>
              </p>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Other portals:</p>
                <div className="flex justify-center space-x-4">
                  <Link
                    to="/customer-login"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Customer Portal
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    to="/admin-login"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Staff Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyLogin;
