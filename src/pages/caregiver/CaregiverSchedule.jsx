import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentsAPI, customersAPI, packagesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Package,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CaregiverSchedule = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  useEffect(() => {
    if (currentUser) {
      fetchScheduleData();
    }
  }, [currentUser]);

  const fetchScheduleData = async () => {
    try {
      const [appointmentsRes, customersRes, packagesRes] = await Promise.all([
        appointmentsAPI.getAll(),
        customersAPI.getAll(),
        packagesAPI.getAll()
      ]);

      // Filter appointments for this caregiver
      const caregiverAppointments = appointmentsRes.data.filter(
        apt => apt.caregiver_id === currentUser.id
      );

      setAppointments(caregiverAppointments);
      setCustomers(customersRes.data);
      setPackages(packagesRes.data);

    } catch (error) {
      console.error('Error fetching schedule data:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown Customer';
  };

  const getPackageName = (packageId) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? pkg.name : 'Unknown Package';
  };

  const getWeekDates = () => {
    const week = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      if (apt.appointment_datetime_start) {
        // For appointments with appointment_datetime_start, extract date portion
        return apt.appointment_datetime_start.split('T')[0] === dateString;
      } else {
        // For appointments with separate date and time fields
        return apt.appointment_date === dateString;
      }
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
                <p className="text-gray-600">View and manage your upcoming appointments</p>
              </div>
            </div>
            <Link
              to="/caregiver/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {getWeekDates()[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => navigateWeek(1)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Today
              </button>
            </div>
          </div>

          {/* Week View */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-4">
              {getWeekDates().map((date, index) => {
                const dayAppointments = getAppointmentsForDate(date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNumber = date.getDate();

                return (
                  <div key={index} className="space-y-2">
                    {/* Day Header */}
                    <div className="text-center">
                      <div className="text-sm text-gray-500">{dayName}</div>
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        isToday(date)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-900'
                      }`}>
                        {dayNumber}
                      </div>
                    </div>

                    {/* Appointments */}
                    <div className="space-y-1">
                      {dayAppointments.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          No appointments
                        </div>
                      ) : (
                        dayAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <div className="font-medium text-blue-900 mb-1">
                              {formatTime(appointment.appointment_time)}
                            </div>
                            <div className="text-blue-700 mb-1">
                              {getCustomerName(appointment.user_id)}
                            </div>
                            <div className="text-blue-600">
                              {getPackageName(appointment.package_id)}
                            </div>
                            <div className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Appointments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
          </div>
          <div className="p-6">
            {appointments
              .filter(apt => {
                const aptDate = apt.appointment_datetime_start ? 
                  new Date(apt.appointment_datetime_start) : 
                  new Date(apt.appointment_date + 'T' + apt.appointment_time);
                return aptDate > new Date();
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
              .slice(0, 10)
              .map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 mb-4 last:mb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">
                            {getCustomerName(appointment.user_id)}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {appointment.appointment_datetime_start ? 
                            new Date(appointment.appointment_datetime_start).toLocaleDateString() :
                            new Date(appointment.appointment_date).toLocaleDateString()
                          }
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.appointment_datetime_start ? 
                            new Date(appointment.appointment_datetime_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                            formatTime(appointment.appointment_time)
                          }
                        </div>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          {getPackageName(appointment.package_id)}
                        </div>
                      </div>
                      
                      {appointment.location && (
                        <div className="flex items-center text-sm text-gray-600 mt-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {appointment.location}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex space-x-2">
                      <Link
                        to={`/caregiver/appointment/${appointment.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            
            {appointments.filter(apt => {
              const aptDate = apt.appointment_datetime_start ? 
                new Date(apt.appointment_datetime_start) : 
                new Date(apt.appointment_date + 'T' + apt.appointment_time);
              return aptDate > new Date();
            }).length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverSchedule;
