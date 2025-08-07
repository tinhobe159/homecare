import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Home, Users, Calendar, Package, Settings, 
  LogOut, Menu, X, MessageSquare, BarChart3,
  UserCheck, FileText, Heart, Shield, Building2,
  Briefcase, TrendingUp, Activity, Star, DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import KeyboardShortcuts from '../common/KeyboardShortcuts';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState('admin'); // Default role, in real app this would come from auth context
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    setShowRoleSelector(false);
    toast.success(`Switched to ${newRole} view`);
  };

  // Role-based navigation items
  const getNavItems = () => {
    const baseItems = [
      { path: '/admin', label: 'Dashboard', icon: Home, roles: ['admin', 'hr', 'operations', 'executive'] },
    ];

    const roleSpecificItems = {
      admin: [
        { path: '/admin/customers', label: 'Customers', icon: Users, roles: ['admin'] },
        { path: '/admin/caregivers', label: 'Caregivers', icon: UserCheck, roles: ['admin'] },
        { path: '/admin/employees', label: 'Employees', icon: Users, roles: ['admin'] },
        { path: '/admin/roles', label: 'Roles', icon: Shield, roles: ['admin'] },
        { path: '/admin/departments', label: 'Departments', icon: Building2, roles: ['admin'] },
        { path: '/admin/appointments', label: 'Appointments', icon: Calendar, roles: ['admin'] },
        { path: '/admin/user-requests', label: 'User Requests', icon: MessageSquare, roles: ['admin'] },
        { path: '/admin/services', label: 'Services', icon: Settings, roles: ['admin'] },
        { path: '/admin/packages', label: 'Packages', icon: Package, roles: ['admin'] },
        { path: '/admin/scheduled-packages', label: 'Scheduled Packages', icon: Calendar, roles: ['admin'] },
        { path: '/admin/audit-logs', label: 'Audit Logs', icon: FileText, roles: ['admin'] },
      ],
      hr: [
        { path: '/admin/employees', label: 'Employees', icon: Users, roles: ['hr'] },
        { path: '/admin/roles', label: 'Roles', icon: Shield, roles: ['hr'] },
        { path: '/admin/departments', label: 'Departments', icon: Building2, roles: ['hr'] },
        { path: '/admin/caregivers', label: 'Caregivers', icon: UserCheck, roles: ['hr'] },
        { path: '/admin/user-requests', label: 'User Requests', icon: MessageSquare, roles: ['hr'] },
      ],
      operations: [
        { path: '/admin/customers', label: 'Customers', icon: Users, roles: ['operations'] },
        { path: '/admin/caregivers', label: 'Caregivers', icon: UserCheck, roles: ['operations'] },
        { path: '/admin/appointments', label: 'Appointments', icon: Calendar, roles: ['operations'] },
        { path: '/admin/services', label: 'Services', icon: Settings, roles: ['operations'] },
        { path: '/admin/packages', label: 'Packages', icon: Package, roles: ['operations'] },
        { path: '/admin/scheduled-packages', label: 'Scheduled Packages', icon: Calendar, roles: ['operations'] },
      ],
      executive: [
        { path: '/admin/customers', label: 'Customers', icon: Users, roles: ['executive'] },
        { path: '/admin/caregivers', label: 'Caregivers', icon: UserCheck, roles: ['executive'] },
        { path: '/admin/appointments', label: 'Appointments', icon: Calendar, roles: ['executive'] },
        { path: '/admin/audit-logs', label: 'Audit Logs', icon: FileText, roles: ['executive'] },
      ]
    };

    return [...baseItems, ...(roleSpecificItems[userRole] || [])];
  };

  const navItems = getNavItems();

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      hr: 'HR Manager',
      operations: 'Operations',
      executive: 'Executive'
    };
    return roleNames[role] || role;
  };

  const getRoleIcon = (role) => {
    const roleIcons = {
      admin: Shield,
      hr: Users,
      operations: Briefcase,
      executive: Star
    };
    return roleIcons[role] || Shield;
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <KeyboardShortcuts />
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Admin Panel</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role Selector */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="relative">
              <button
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center">
                  {React.createElement(getRoleIcon(userRole), { className: "h-4 w-4 mr-2" })}
                  <span>{getRoleDisplayName(userRole)}</span>
                </div>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showRoleSelector && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {['admin', 'hr', 'operations', 'executive'].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`w-full flex items-center px-3 py-2 text-sm hover:bg-gray-50 ${
                        userRole === role ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {React.createElement(getRoleIcon(role), { className: "h-4 w-4 mr-2" })}
                      {getRoleDisplayName(role)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto min-h-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-4 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {navItems.find(item => isActive(item.path))?.label || 'Admin Panel'}
              </h1>
            </div>

            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <span>Welcome, {getRoleDisplayName(userRole)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;