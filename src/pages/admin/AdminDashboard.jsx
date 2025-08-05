import React, { useState, useEffect } from 'react';
import { 
  Users, Package, Calendar, Heart, 
  TrendingUp, DollarSign, Clock, CheckCircle,
  UserPlus, UserMinus, Activity, Star,
  BarChart3, PieChart, LineChart
} from 'lucide-react';
import { 
  customersAPI, caregiversAPI, packagesAPI, servicesAPI, 
  appointmentsAPI, paymentsAPI 
} from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({
    newUsers: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      trends: {
        weekChange: 0,
        monthChange: 0
      }
    },
    activeUsers: {
      count: 0,
      percentage: 0
    },
    churn: {
      count: 0,
      percentage: 0,
      reasons: []
    },
    retention: {
      thirtyDay: 0,
      ninetyDay: 0
    },
    sessions: {
      total: 0,
      revenuePerSession: 0,
      revenuePerUser: 0
    },
    satisfaction: {
      averageRating: 0,
      totalReviews: 0,
      npsScore: 0
    }
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

      const customers = customersRes.data;
      const appointments = appointmentsRes.data;
      const payments = paymentsRes.data;

      // Calculate analytics
      const analyticsData = calculateAnalytics(customers, appointments, payments);
      setAnalytics(analyticsData);

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

  const calculateAnalytics = (customers, appointments, payments) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

    // New Users Analysis
    const newUsersToday = customers.filter(c => new Date(c.created_at) >= today).length;
    const newUsersThisWeek = customers.filter(c => new Date(c.created_at) >= weekAgo).length;
    const newUsersThisMonth = customers.filter(c => new Date(c.created_at) >= monthAgo).length;
    
    const newUsersLastWeek = customers.filter(c => {
      const created = new Date(c.created_at);
      return created >= twoWeeksAgo && created < weekAgo;
    }).length;
    
    const newUsersLastMonth = customers.filter(c => {
      const created = new Date(c.created_at);
      return created >= twoMonthsAgo && created < monthAgo;
    }).length;

    // Active Users Analysis (users with appointments in last 30 days)
    const activeUserIds = new Set(
      appointments
        .filter(apt => new Date(apt.appointment_datetime_start) >= monthAgo)
        .map(apt => apt.customer_id)
    );
    const activeUsersCount = activeUserIds.size;
    const activeUsersPercentage = customers.length > 0 ? (activeUsersCount / customers.length) * 100 : 0;

    // Churn Analysis (users active before but not in last 30 days)
    const previouslyActiveUserIds = new Set(
      appointments
        .filter(apt => {
          const aptDate = new Date(apt.appointment_datetime_start);
          return aptDate >= twoMonthsAgo && aptDate < monthAgo;
        })
        .map(apt => apt.customer_id)
    );
    
    const churnedUserIds = Array.from(previouslyActiveUserIds).filter(
      userId => !activeUserIds.has(userId)
    );
    const churnCount = churnedUserIds.length;
    const churnPercentage = previouslyActiveUserIds.size > 0 ? (churnCount / previouslyActiveUserIds.size) * 100 : 0;

    // Retention Analysis
    const usersFrom90DaysAgo = customers.filter(c => new Date(c.created_at) <= new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000));
    const usersFrom30DaysAgo = customers.filter(c => new Date(c.created_at) <= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));
    
    const retained30Day = usersFrom30DaysAgo.filter(c => activeUserIds.has(c.id)).length;
    const retained90Day = usersFrom90DaysAgo.filter(c => activeUserIds.has(c.id)).length;
    
    const retention30Day = usersFrom30DaysAgo.length > 0 ? (retained30Day / usersFrom30DaysAgo.length) * 100 : 0;
    const retention90Day = usersFrom90DaysAgo.length > 0 ? (retained90Day / usersFrom90DaysAgo.length) * 100 : 0;

    // Session Metrics
    const totalSessions = appointments.filter(apt => apt.status === 'Completed').length;
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const revenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;
    const revenuePerUser = customers.length > 0 ? totalRevenue / customers.length : 0;

    // Satisfaction Metrics (using feedback data from appointments)
    const feedbackRatings = appointments
      .filter(apt => apt.feedback && apt.feedback.rating)
      .map(apt => apt.feedback.rating);
    
    const averageRating = feedbackRatings.length > 0 
      ? feedbackRatings.reduce((sum, rating) => sum + rating, 0) / feedbackRatings.length 
      : 0;
    
    const totalReviews = feedbackRatings.length;
    
    // Calculate NPS (Net Promoter Score)
    const promoters = feedbackRatings.filter(rating => rating >= 4).length;
    const detractors = feedbackRatings.filter(rating => rating <= 2).length;
    const npsScore = totalReviews > 0 ? ((promoters - detractors) / totalReviews) * 100 : 0;

    return {
      newUsers: {
        today: newUsersToday,
        thisWeek: newUsersThisWeek,
        thisMonth: newUsersThisMonth,
        trends: {
          weekChange: newUsersLastWeek > 0 ? ((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek) * 100 : 0,
          monthChange: newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0
        }
      },
      activeUsers: {
        count: activeUsersCount,
        percentage: activeUsersPercentage
      },
      churn: {
        count: churnCount,
        percentage: churnPercentage,
        reasons: ['Service dissatisfaction', 'Relocation', 'Health improvement', 'Cost concerns']
      },
      retention: {
        thirtyDay: retention30Day,
        ninetyDay: retention90Day
      },
      sessions: {
        total: totalSessions,
        revenuePerSession: revenuePerSession,
        revenuePerUser: revenuePerUser
      },
      satisfaction: {
        averageRating: averageRating,
        totalReviews: totalReviews,
        npsScore: npsScore
      }
    };
  };

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

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights into your homecare service performance.</p>
      </div>

      {/* New Users Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <UserPlus className="h-5 w-5 mr-2" />
          New Users
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.newUsers.today}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.newUsers.thisWeek}</p>
                <p className={`text-sm mt-1 ${analytics.newUsers.trends.weekChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {formatPercentage(analytics.newUsers.trends.weekChange)} from last week
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.newUsers.thisMonth}</p>
                <p className={`text-sm mt-1 ${analytics.newUsers.trends.monthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {formatPercentage(analytics.newUsers.trends.monthChange)} from last month
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <LineChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Activity & Retention Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Users */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Active Users
            </h3>
            <div className="p-2 rounded-full bg-green-100">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active in last 30 days</span>
              <span className="text-2xl font-bold text-gray-900">{analytics.activeUsers.count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Percentage of total users</span>
              <span className="text-lg font-semibold text-green-600">{analytics.activeUsers.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Retention Rates */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Retention Rates
            </h3>
            <div className="p-2 rounded-full bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">30-day retention</span>
              <span className="text-2xl font-bold text-gray-900">{analytics.retention.thirtyDay.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">90-day retention</span>
              <span className="text-lg font-semibold text-blue-600">{analytics.retention.ninetyDay.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Churn Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Metrics */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Revenue Metrics
            </h3>
            <div className="p-2 rounded-full bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total sessions</span>
              <span className="text-2xl font-bold text-gray-900">{analytics.sessions.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Revenue per session</span>
              <span className="text-lg font-semibold text-green-600">${analytics.sessions.revenuePerSession.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Revenue per user</span>
              <span className="text-lg font-semibold text-green-600">${analytics.sessions.revenuePerUser.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Churn Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <UserMinus className="h-5 w-5 mr-2" />
              Churn Analysis
            </h3>
            <div className="p-2 rounded-full bg-red-100">
              <UserMinus className="h-5 w-5 text-red-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Churned users</span>
              <span className="text-2xl font-bold text-gray-900">{analytics.churn.count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Churn rate</span>
              <span className="text-lg font-semibold text-red-600">{analytics.churn.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Satisfaction */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            User Satisfaction
          </h3>
          <div className="p-2 rounded-full bg-yellow-100">
            <Star className="h-5 w-5 text-yellow-600" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Average rating</span>
            <span className="text-xl font-bold text-gray-900">{analytics.satisfaction.averageRating.toFixed(1)}/5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total reviews</span>
            <span className="text-lg font-semibold text-gray-900">{analytics.satisfaction.totalReviews}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">NPS Score</span>
            <span className={`text-lg font-semibold ${analytics.satisfaction.npsScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.satisfaction.npsScore.toFixed(0)}
            </span>
          </div>
        </div>
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
              { title: 'Scheduled Packages', desc: 'Manage recurring schedules', href: '/admin/scheduled-packages' },
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
    </div>
  );
};

export default AdminDashboard;