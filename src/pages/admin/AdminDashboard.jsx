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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

    // Calculate new users
    const todayUsers = customers.filter(c => new Date(c.created_at) >= today).length;
    const weekUsers = customers.filter(c => new Date(c.created_at) >= weekAgo).length;
    const monthUsers = customers.filter(c => new Date(c.created_at) >= monthAgo).length;
    const prevWeekUsers = customers.filter(c => {
      const created = new Date(c.created_at);
      return created >= twoWeeksAgo && created < weekAgo;
    }).length;
    const prevMonthUsers = customers.filter(c => {
      const created = new Date(c.created_at);
      return created >= twoMonthsAgo && created < monthAgo;
    }).length;

    // Calculate active users (users with appointments in last 30 days)
    const activeUsers = customers.filter(customer => {
      return appointments.some(apt => 
        apt.customer_id === customer.id && 
        new Date(apt.appointment_datetime_start) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      );
    }).length;

    // Calculate retention
    const thirtyDayRetention = customers.length > 0 ? (activeUsers / customers.length) * 100 : 0;
    const ninetyDayRetention = Math.min(thirtyDayRetention * 0.8, 100); // Simplified calculation

    // Calculate sessions and revenue
    const totalSessions = appointments.length;
    const totalRevenue = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    const revenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;
    const revenuePerUser = customers.length > 0 ? totalRevenue / customers.length : 0;

    // Calculate satisfaction (simplified)
    const averageRating = 4.2; // Mock data
    const totalReviews = appointments.length * 0.3; // Mock data
    const npsScore = 65; // Mock data

    return {
      newUsers: {
        today: todayUsers,
        thisWeek: weekUsers,
        thisMonth: monthUsers,
        trends: {
          weekChange: prevWeekUsers > 0 ? ((weekUsers - prevWeekUsers) / prevWeekUsers) * 100 : 0,
          monthChange: prevMonthUsers > 0 ? ((monthUsers - prevMonthUsers) / prevMonthUsers) * 100 : 0
        }
      },
      activeUsers: {
        count: activeUsers,
        percentage: customers.length > 0 ? (activeUsers / customers.length) * 100 : 0
      },
      churn: {
        count: Math.floor(customers.length * 0.05), // 5% churn rate
        percentage: 5,
        reasons: ['Service quality', 'Pricing', 'Availability']
      },
      retention: {
        thirtyDay: thirtyDayRetention,
        ninetyDay: ninetyDayRetention
      },
      sessions: {
        total: totalSessions,
        revenuePerSession: revenuePerSession,
        revenuePerUser: revenuePerUser
      },
      satisfaction: {
        averageRating: averageRating,
        totalReviews: Math.floor(totalReviews),
        npsScore: npsScore
      }
    };
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-8">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.newUsers.today}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.newUsers.thisWeek}</div>
              <p className={`text-xs ${analytics.newUsers.trends.weekChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3 inline mr-1" />
                {formatPercentage(analytics.newUsers.trends.weekChange)} from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.newUsers.thisMonth}</div>
              <p className={`text-xs ${analytics.newUsers.trends.monthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3 inline mr-1" />
                {formatPercentage(analytics.newUsers.trends.monthChange)} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeUsers.count}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.activeUsers.percentage.toFixed(1)}% of total users
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Activity & Retention Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Active Users
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active in last 30 days</span>
                <span className="text-2xl font-bold">{analytics.activeUsers.count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Percentage of total users</span>
                <Badge variant="secondary">{analytics.activeUsers.percentage.toFixed(1)}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Retention Rates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Retention Rates
            </CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">30-day retention</span>
                <span className="text-2xl font-bold">{analytics.retention.thirtyDay.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">90-day retention</span>
                <Badge variant="outline">{analytics.retention.ninetyDay.toFixed(1)}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Churn Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Revenue Metrics
            </CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total sessions</span>
                <span className="text-2xl font-bold">{analytics.sessions.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue per session</span>
                <Badge variant="secondary">${analytics.sessions.revenuePerSession.toFixed(2)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue per user</span>
                <Badge variant="secondary">${analytics.sessions.revenuePerUser.toFixed(2)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Churn Analysis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold flex items-center">
              <UserMinus className="h-5 w-5 mr-2" />
              Churn Analysis
            </CardTitle>
            <UserMinus className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Churned users</span>
                <span className="text-2xl font-bold">{analytics.churn.count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Churn rate</span>
                <Badge variant="destructive">{analytics.churn.percentage.toFixed(1)}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Satisfaction */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold flex items-center">
            <Star className="h-5 w-5 mr-2" />
            User Satisfaction
          </CardTitle>
          <Star className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average rating</span>
              <span className="text-xl font-bold">{analytics.satisfaction.averageRating.toFixed(1)}/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total reviews</span>
              <span className="text-lg font-semibold">{analytics.satisfaction.totalReviews}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">NPS Score</span>
              <Badge variant={analytics.satisfaction.npsScore >= 0 ? "default" : "destructive"}>
                {analytics.satisfaction.npsScore.toFixed(0)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Recent Appointments</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      Appointment #{appointment.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(appointment.appointment_datetime_start).toLocaleDateString()} at{' '}
                      {new Date(appointment.appointment_datetime_start).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">${appointment.total_cost}</p>
                  </div>
                  <Badge variant={appointment.status === 'confirmed' ? 'default' : 
                                 appointment.status === 'pending' ? 'secondary' : 
                                 appointment.status === 'cancelled' ? 'destructive' : 'outline'}>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
              
              {recentAppointments.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No recent appointments
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {[
                { title: 'View All Customers', desc: 'Manage customer profiles', href: '/admin/customers' },
                { title: 'Manage Caregivers', desc: 'Add and edit caregiver info', href: '/admin/caregivers' },
                { title: 'Service Management', desc: 'Update services and pricing', href: '/admin/services' },
                { title: 'Package Management', desc: 'Create and edit packages', href: '/admin/packages' },
                { title: 'Scheduled Packages', desc: 'Manage recurring schedules', href: '/admin/scheduled-packages' },
                { title: 'View Appointments', desc: 'Manage all appointments', href: '/admin/appointments' }
              ].map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto p-3"
                  asChild
                >
                  <a href={action.href}>
                    <div className="text-left">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;