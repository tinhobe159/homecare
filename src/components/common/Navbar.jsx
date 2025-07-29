import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Users, Package, Calendar, User, CreditCard, LogOut, Home, Settings, LogIn, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, currentUser, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
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

  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/caregivers', label: 'Caregivers', icon: Users },
    { path: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { path: '/admin/user-requests', label: 'User Requests', icon: MessageSquare },
    { path: '/admin/services', label: 'Services', icon: Settings },
    { path: '/admin/packages', label: 'Packages', icon: Package },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : (currentUser ? authenticatedCustomerNavItems : customerNavItems);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isAdmin ? '/admin' : '/'} className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">HomeCare</span>
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
                <span className="text-sm text-gray-600">Welcome, {currentUser.name}</span>
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
                  <span>Login</span>
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
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
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
                  Welcome, {currentUser.name}
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
                  <span>Login</span>
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