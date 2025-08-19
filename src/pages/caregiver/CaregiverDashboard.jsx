import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentsAPI, evvRecordsAPI, usersAPI, userRolesAPI, addressesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  User,
  Heart,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CaregiverDashboard = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [evvRecords, setEvvRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weeklyHours: 0,
    completedVisits: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      // Get all data in parallel
      const [appointmentsRes, evvRes, usersRes, userRolesRes, addressesRes] = await Promise.all([
        appointmentsAPI.getAll(),
        evvRecordsAPI.getAll(),
        usersAPI.getAll(),
        userRolesAPI.getAll(),
        addressesAPI.getAll()
      ]);

      // Filter appointments for this caregiver
      const caregiverAppointments = appointmentsRes.data.filter(
        apt => apt.caregiver_id === currentUser.id
      );

      // Filter EVV records for this caregiver  
      const caregiverEvv = evvRes.data.filter(
        evv => evv.caregiver_id === currentUser.id
      );

      // Set the state
      setAppointments(caregiverAppointments);
      setEvvRecords(caregiverEvv);
      setUsers(usersRes.data);
      setUserRoles(userRolesRes.data);
      setAddresses(addressesRes.data);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = caregiverAppointments.filter(
        apt => apt.appointment_date?.startsWith(today)
      ).length;

      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
      const weeklyHours = caregiverEvv
        .filter(evv => {
          const evvDate = new Date(evv.check_in_time);
          return evvDate >= thisWeekStart;
        })
        .reduce((total, evv) => {
          if (evv.check_in_time && evv.check_out_time) {
            const duration = (new Date(evv.check_out_time) - new Date(evv.check_in_time)) / (1000 * 60 * 60);
            return total + duration;
          }
          return total;
        }, 0);

      const completedVisits = caregiverEvv.filter(evv => evv.status === 'completed').length;

      setStats({
        todayAppointments,
        weeklyHours: Math.round(weeklyHours * 10) / 10,
        completedVisits,
        rating: currentUser.rating || 4.8
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getCustomerName = (customerId) => {
    const user = users.find(u => u.id === customerId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown Customer';
  };

  const getCustomerAddress = (customerId) => {
    const userAddress = addresses.find(addr => addr.user_id === customerId && addr.is_primary);
    if (userAddress) {
      return `${userAddress.street_address}, ${userAddress.city}, ${userAddress.state_province}`;
    }
    return 'Address not specified';
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(apt => {
        // Handle both appointment_datetime_start and appointment_date + appointment_time formats
        const aptDate = apt.appointment_datetime_start ? 
          new Date(apt.appointment_datetime_start) : 
          new Date(apt.appointment_date + 'T' + apt.appointment_time);
        return aptDate > now;
      })
      .sort((a, b) => {
        const dateA = a.appointment_datetime_start ? 
          new Date(a.appointment_datetime_start) : 
          new Date(a.appointment_date + 'T' + a.appointment_time);
        const dateB = b.appointment_datetime_start ? 
          new Date(b.appointment_datetime_start) : 
          new Date(b.appointment_date + 'T' + b.appointment_time);
        return dateA - dateB;
      })
      .slice(0, 5);
  };

  const formatDateTime = (appointment) => {
    // Handle both appointment_datetime_start and appointment_date + appointment_time formats
    const dateTime = appointment.appointment_datetime_start ? 
      new Date(appointment.appointment_datetime_start) : 
      new Date(appointment.appointment_date + 'T' + appointment.appointment_time);
    
    return {
      date: dateTime.toLocaleDateString(),
      time: dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {currentUser?.first_name}!
                </h1>
                <p className="text-gray-600">Ready to provide excellent care today</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">This Week's Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.weeklyHours}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Completed Visits</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedVisits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Your Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rating}⭐</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
            </div>
            <div className="p-6">
              {getUpcomingAppointments().length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getUpcomingAppointments().map((appointment) => {
                    const dateTime = formatDateTime(appointment);
                    return (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">
                              {getCustomerName(appointment.user_id)}
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Clock className="h-4 w-4 mr-1" />
                          {dateTime.date} at {dateTime.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          {appointment.location || getCustomerAddress(appointment.user_id)}
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Link
                            to={`/caregiver/appointment/${appointment.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Details
                          </Link>
                          <Link
                            to={`/caregiver/evv/${appointment.id}`}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Start Visit
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/caregiver/schedule"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">View Schedule</span>
                </Link>

                <Link
                  to="/caregiver/care-plans"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart className="h-8 w-8 text-red-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Care Plans</span>
                </Link>

                <Link
                  to="/caregiver/timesheet"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Clock className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Timesheet</span>
                </Link>

                <Link
                  to="/caregiver/profile"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <User className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">My Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {evvRecords.slice(0, 5).map((evv) => (
              <div key={evv.id} className="flex items-center py-3 border-b border-gray-100 last:border-0">
                <div className={`p-2 rounded-full mr-4 ${
                  evv.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {evv.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Visit {evv.status === 'completed' ? 'completed' : 'in progress'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {evv.check_in_time ? new Date(evv.check_in_time).toLocaleString() : 'Time not recorded'}
                  </p>
                </div>
              </div>
            ))}
            {evvRecords.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverDashboard;
