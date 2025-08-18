import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Users, Package, Calendar, User, CreditCard, LogOut, Home, Settings, LogIn, MessageSquare, Clock, ClipboardList, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isCaregiver, currentUser, logout } = useAuth();

  const isActive = (path) => location.pathname === path;
  const isAdminPage = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isCaregiverPage = (location.pathname.startsWith('/caregiver/') || location.pathname === '/caregiver') && location.pathname !== '/caregiver/login';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    // Force navigation to home page and reload to clear any cached state
    window.location.href = '/';
  };

  const customerNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/packages', label: 'Packages', icon: Package },
    { path: '/caregivers', label: 'Caregivers', icon: Users },
    { path: '/book', label: 'Book Now', icon: Calendar },
  ];

  const authenticatedCustomerNavItems = [
    ...customerNavItems,
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/payments', label: 'Payments', icon: CreditCard },
  ];

  const caregiverNavItems = [
    { path: '/caregiver/dashboard', label: 'Dashboard', icon: Home },
    { path: '/caregiver/schedule', label: 'Schedule', icon: Clock },
    { path: '/caregiver/care-plans', label: 'Care Plans', icon: ClipboardList },
    { path: '/caregiver/timesheet', label: 'Timesheet', icon: FileText },
    { path: '/caregiver/profile', label: 'Profile', icon: User },
  ];

  // Determine navigation items based on user type
  let navItems = [];
  if (isAdmin && !isAdminPage) {
    navItems = [];
  } else if (isCaregiver && !isCaregiverPage) {
    navItems = [];
  } else if (isCaregiver) {
    navItems = caregiverNavItems;
  } else if (currentUser) {
    navItems = authenticatedCustomerNavItems;
  } else {
    navItems = customerNavItems;
  }

  // If we're on a caregiver page, show caregiver header
  if (isCaregiverPage) {
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/caregiver/dashboard" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">VeronCare Caregiver</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              {caregiverNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                      isActive(item.path)
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser?.first_name} {currentUser?.last_name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu for caregivers */}
        <div className="md:hidden bg-gray-50 border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {caregiverNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <div className="pt-2 border-t border-gray-200">
              <div className="px-3 py-2 text-sm text-gray-600">
                Welcome, {currentUser?.first_name} {currentUser?.last_name}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-green-600 hover:bg-green-50 w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // If we're on an admin page, show a simplified header
  if (isAdminPage) {
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">VeronCare Admin</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Admin Panel</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isAdmin ? '/admin' : '/'} className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">VeronCare</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            ) : currentUser ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome, {currentUser.first_name} {currentUser.last_name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Customer</span>
                </Link>
                <Link
                  to="/caregiver/login"
                  className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <Users className="h-4 w-4" />
                  <span>Caregiver</span>
                </Link>
                <Link
                  to="/admin/login"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden bg-gray-50 border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {/* Mobile auth buttons */}
          <div className="pt-2 border-t border-gray-200">
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            ) : currentUser ? (
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm text-gray-600">
                  Welcome, {currentUser.first_name} {currentUser.last_name}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Customer Login</span>
                </Link>
                <Link
                  to="/caregiver/login"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-green-600 hover:bg-green-50"
                >
                  <Users className="h-5 w-5" />
                  <span>Caregiver Login</span>
                </Link>
                <Link
                  to="/admin/login"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
                >
                  <Settings className="h-5 w-5" />
                  <span>Admin Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;