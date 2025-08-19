import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentsAPI, usersAPI, packagesAPI, servicesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Package, 
  FileText,
  ArrowLeft,
  Phone,
  Mail
} from 'lucide-react';

const CaregiverAppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [packageDetails, setPackageDetails] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      // Get appointment
      const appointmentRes = await appointmentsAPI.getById(id);
      const appointmentData = appointmentRes.data;

      // Verify this appointment belongs to the current caregiver
      if (appointmentData.caregiver_id !== currentUser.id) {
        toast.error('You do not have access to this appointment');
        navigate('/caregiver/dashboard');
        return;
      }

      setAppointment(appointmentData);

      // Get customer details
      const customerRes = await usersAPI.getById(appointmentData.user_id);
      setCustomer(customerRes.data);

      // Get package details if available
      if (appointmentData.package_id) {
        const packageRes = await packagesAPI.getById(appointmentData.package_id);
        setPackageDetails(packageRes.data);
      }

      // Get services
      const servicesRes = await servicesAPI.getAll();
      setServices(servicesRes.data);

    } catch (error) {
      console.error('Error fetching appointment details:', error);
      toast.error('Failed to load appointment details');
      navigate('/caregiver/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (appointment) => {
    const dateTime = appointment.appointment_datetime_start ? 
      new Date(appointment.appointment_datetime_start) : 
      new Date(appointment.appointment_date + 'T' + appointment.appointment_time);
    
    return {
      date: dateTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
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

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Appointment not found</p>
          <button 
            onClick={() => navigate('/caregiver/dashboard')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const dateTime = formatDateTime(appointment);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/caregiver/dashboard')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
              <p className="text-gray-600">Review appointment information and care instructions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Appointment Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Appointment Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{dateTime.date}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{dateTime.time}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{appointment.location || 'Customer home'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                  </span>
                </div>
              </div>
              {appointment.booking_notes && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Notes:</strong> {appointment.booking_notes}
                  </p>
                </div>
              )}
            </div>

            {/* Package Details */}
            {packageDetails && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Care Package</h2>
                <div className="flex items-start">
                  <Package className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">{packageDetails.name}</h3>
                    <p className="text-gray-600 mt-1">{packageDetails.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Duration: {packageDetails.duration_hours}h</span>
                      <span>Cost: ${packageDetails.total_cost}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Care Instructions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Care Instructions</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-gray-600">
                      Please review the customer's care plan and follow all specified protocols. 
                      Ensure all tasks are completed as outlined in the service package.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info Sidebar */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
              {customer && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {customer.first_name} {customer.last_name}
                      </p>
                      <p className="text-sm text-gray-500">Customer</p>
                    </div>
                  </div>
                  {customer.phone_number && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{customer.phone_number}</p>
                      </div>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{customer.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/caregiver/evv/${appointment.id}`)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Visit
                </button>
                <button
                  onClick={() => navigate('/caregiver/schedule')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverAppointmentDetail;
