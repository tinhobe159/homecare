import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentsAPI, evvRecordsAPI, usersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  MapPin, 
  Clock, 
  User, 
  CheckCircle, 
  Play, 
  Square,
  ArrowLeft,
  Camera,
  Mic
} from 'lucide-react';

const CaregiverEVVPage = () => {
  const { id } = useParams(); // appointment ID
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [evvRecord, setEvvRecord] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingVisit, setStartingVisit] = useState(false);
  const [endingVisit, setEndingVisit] = useState(false);

  // Form state for visit completion
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState('');
  const [customerSignature, setCustomerSignature] = useState('');

  useEffect(() => {
    fetchAppointmentAndEVV();
    getCurrentLocation();
  }, [id]);

  const fetchAppointmentAndEVV = async () => {
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

      // Check if EVV record already exists
      const evvRes = await evvRecordsAPI.getAll();
      const existingEVV = evvRes.data.find(evv => evv.appointment_id === parseInt(id));
      
      if (existingEVV) {
        setEvvRecord(existingEVV);
        setIsActive(existingEVV.status === 'in_progress');
        if (existingEVV.tasks_completed) {
          setTasks(existingEVV.tasks_completed);
        }
        if (existingEVV.visit_notes) {
          setNotes(existingEVV.visit_notes);
        }
      }

    } catch (error) {
      console.error('Error fetching appointment and EVV data:', error);
      toast.error('Failed to load visit information');
      navigate('/caregiver/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.warn('Location access denied. Manual check-in will be used.');
        }
      );
    }
  };

  const startVisit = async () => {
    try {
      setStartingVisit(true);
      
      const evvData = {
        appointment_id: parseInt(id),
        caregiver_id: currentUser.id,
        check_in_time: new Date().toISOString(),
        check_in_location: location || { latitude: 0, longitude: 0, accuracy: 0, manual: true },
        status: 'in_progress',
        visit_notes: '',
        tasks_completed: []
      };

      const response = await evvRecordsAPI.create(evvData);
      setEvvRecord(response.data);
      setIsActive(true);
      toast.success('Visit started successfully!');
      
    } catch (error) {
      console.error('Error starting visit:', error);
      toast.error('Failed to start visit');
    } finally {
      setStartingVisit(false);
    }
  };

  const endVisit = async () => {
    try {
      setEndingVisit(true);
      
      const updateData = {
        check_out_time: new Date().toISOString(),
        check_out_location: location || { latitude: 0, longitude: 0, accuracy: 0, manual: true },
        status: 'completed',
        visit_notes: notes,
        tasks_completed: tasks,
        customer_signature: customerSignature
      };

      await evvRecordsAPI.update(evvRecord.id, updateData);
      setIsActive(false);
      toast.success('Visit completed successfully!');
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/caregiver/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error ending visit:', error);
      toast.error('Failed to complete visit');
    } finally {
      setEndingVisit(false);
    }
  };

  const toggleTask = (taskName) => {
    setTasks(prev => {
      const existingTask = prev.find(t => t.task_name === taskName);
      if (existingTask) {
        // Toggle completion
        return prev.map(t => 
          t.task_name === taskName 
            ? { ...t, completed: !t.completed, completed_at: t.completed ? null : new Date().toISOString() }
            : t
        );
      } else {
        // Add new task
        return [...prev, {
          task_name: taskName,
          completed: true,
          completed_at: new Date().toISOString(),
          notes: ''
        }];
      }
    });
  };

  const formatDateTime = (appointment) => {
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
  const commonTasks = [
    'Bathing Assistance',
    'Medication Reminders',
    'Meal Preparation',
    'Light Housekeeping',
    'Mobility Assistance',
    'Companionship',
    'Transportation',
    'Health Monitoring'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/caregiver/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Electronic Visit Verification</h1>
                <p className="text-gray-600">
                  {customer ? `Visit with ${customer.first_name} ${customer.last_name}` : 'Loading...'}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              isActive 
                ? 'bg-green-100 text-green-800' 
                : evvRecord?.status === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isActive ? 'Visit In Progress' : evvRecord?.status === 'completed' ? 'Visit Completed' : 'Ready to Start'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main EVV Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visit Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Visit Status</h2>
              <div className="space-y-4">
                {/* Check-in */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-4 ${
                      evvRecord?.check_in_time ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Play className={`h-5 w-5 ${
                        evvRecord?.check_in_time ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">Check In</p>
                      {evvRecord?.check_in_time && (
                        <p className="text-sm text-gray-500">
                          {new Date(evvRecord.check_in_time).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {!isActive && !evvRecord && (
                    <button
                      onClick={startVisit}
                      disabled={startingVisit}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {startingVisit ? 'Starting...' : 'Start Visit'}
                    </button>
                  )}
                </div>

                {/* Check-out */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-4 ${
                      evvRecord?.check_out_time ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Square className={`h-5 w-5 ${
                        evvRecord?.check_out_time ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">Check Out</p>
                      {evvRecord?.check_out_time && (
                        <p className="text-sm text-gray-500">
                          {new Date(evvRecord.check_out_time).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {isActive && (
                    <button
                      onClick={endVisit}
                      disabled={endingVisit}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {endingVisit ? 'Ending...' : 'End Visit'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tasks Completion */}
            {(isActive || evvRecord) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Care Tasks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {commonTasks.map((taskName) => {
                    const task = tasks.find(t => t.task_name === taskName);
                    const isCompleted = task?.completed || false;
                    
                    return (
                      <button
                        key={taskName}
                        onClick={() => toggleTask(taskName)}
                        disabled={!isActive && evvRecord?.status === 'completed'}
                        className={`flex items-center p-3 border rounded-lg text-left transition-colors ${
                          isCompleted 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        } ${(!isActive && evvRecord?.status === 'completed') ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <CheckCircle className={`h-5 w-5 mr-3 ${
                          isCompleted ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <span className="text-sm font-medium">{taskName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Visit Notes */}
            {(isActive || evvRecord) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Visit Notes</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!isActive && evvRecord?.status === 'completed'}
                  placeholder="Enter any notes about the visit, customer condition, or special observations..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Appointment Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Appointment Info</h2>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{dateTime.date} at {dateTime.time}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{appointment.location || 'Customer home'}</span>
                </div>
                {customer && (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{customer.first_name} {customer.last_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Location Status</h2>
              <div className="flex items-center">
                <MapPin className={`h-5 w-5 mr-2 ${location ? 'text-green-600' : 'text-yellow-600'}`} />
                <span className="text-sm">
                  {location ? 'Location detected' : 'Using manual check-in'}
                </span>
              </div>
              {location && (
                <p className="text-xs text-gray-500 mt-2">
                  Accuracy: {Math.round(location.accuracy)}m
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/caregiver/appointment/${appointment.id}`)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Appointment Details
                </button>
                <button
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  disabled
                >
                  <Camera className="h-4 w-4 inline mr-2" />
                  Take Photo (Coming Soon)
                </button>
                <button
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  disabled
                >
                  <Mic className="h-4 w-4 inline mr-2" />
                  Voice Notes (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverEVVPage;
