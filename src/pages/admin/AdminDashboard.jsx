import React, { useState, useEffect } from 'react';
import { 
  Users, Package, Calendar, Heart, 
  TrendingUp, DollarSign, Clock, CheckCircle 
} from 'lucide-react';
import { 
  customersAPI, caregiversAPI, packagesAPI, servicesAPI, 
  appointmentsAPI, paymentsAPI 
} from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    caregivers: 0,
    packages: 0,
    services: 0,
    appointments: 0,
    totalRevenue: 0,
    pendingAppointments: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        customersRes, caregiversRes, packagesRes, servicesRes,
        appointmentsRes, paymentsRes
      ] = await Promise.all([
        customersAPI.getAll(),
        caregiversAPI.getAll(),
        packagesAPI.getAll(),
        servicesAPI.getAll(),
        appointmentsAPI.getAll(),
        paymentsAPI.getAll()
      ]);

      const appointments = appointmentsRes.data;
      const payments = paymentsRes.data;

      setStats({
        customers: customersRes.data.length,
        caregivers: caregiversRes.data.length,
        packages: packagesRes.data.length,
        services: servicesRes.data.length,
        appointments: appointments.length,
        totalRevenue: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
        pendingAppointments: appointments.filter(apt => apt.status === 'Pending').length
      });

      // Get recent appointments (last 5)
      const sortedAppointments = appointments
        .sort((a, b) => new Date(b.appointment_datetime_start) - new Date(a.appointment_datetime_start))
        .slice(0, 5);
      setRecentAppointments(sortedAppointments);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.customers,
      icon: Users,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Active Caregivers',
      value: stats.caregivers,
      icon: Users,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Care Packages',
      value: stats.packages,
      icon: Package,
      color: 'purple',
      change: '+2%'
    },
    {
      title: 'Available Services',
      value: stats.services,
      icon: Heart,
      color: 'pink',
      change: '+5%'
    },
    {
      title: 'Total Appointments',
      value: stats.appointments,
      icon: Calendar,
      color: 'indigo',
      change: '+18%'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
      change: '+25%'
    },
    {
      title: 'Pending Appointments',
      value: stats.pendingAppointments,
      icon: Clock,
      color: 'orange',
      change: '+3%'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'text-green-600 bg-green-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Completed': return 'text-blue-600 bg-blue-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      case 'Rescheduled': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your homecare service.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Appointments */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Appointments</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Appointment #{appointment.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.appointment_datetime_start).toLocaleDateString()} at{' '}
                      {new Date(appointment.appointment_datetime_start).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    <p className="text-sm text-gray-500">${appointment.total_cost}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
              
              {recentAppointments.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No recent appointments
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <CheckCircle className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { title: 'View All Customers', desc: 'Manage customer profiles', href: '/admin/customers' },
                { title: 'Manage Caregivers', desc: 'Add and edit caregiver info', href: '/admin/caregivers' },
                { title: 'Service Management', desc: 'Update services and pricing', href: '/admin/services' },
                { title: 'Package Management', desc: 'Create and edit packages', href: '/admin/packages' },
                { title: 'View Appointments', desc: 'Manage all appointments', href: '/admin/appointments' }
              ].map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200 group"
                >
                  <p className="font-medium text-gray-900 group-hover:text-blue-600">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">API Server: Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Database: Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">All Services: Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;