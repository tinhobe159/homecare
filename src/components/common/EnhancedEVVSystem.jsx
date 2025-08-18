import React, { useState, useEffect } from 'react';
import { evvRecordsAPI } from '../../services/api';
import { 
  getCurrentLocation, 
  validateLocationProximity, 
  reverseGeocode, 
  formatLocationForEVV,
  DISTANCE_THRESHOLDS 
} from '../../utils/geolocation';

const EnhancedEVVSystem = ({ appointment, onUpdate }) => {
  const [evvRecord, setEvvRecord] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationValidation, setLocationValidation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tasksCompleted, setTasksCompleted] = useState([]);
  const [caregiverNotes, setCaregiverNotes] = useState('');

  // Load existing EVV record for this appointment
  useEffect(() => {
    loadEVVRecord();
  }, [appointment.id]);

  const loadEVVRecord = async () => {
    try {
      const response = await evvRecordsAPI.getByAppointmentId(appointment.id);
      if (response.data && response.data.length > 0) {
        setEvvRecord(response.data[0]);
        setTasksCompleted(response.data[0].tasksCompleted || []);
        setCaregiverNotes(response.data[0].caregiverNotes || '');
      }
    } catch (error) {
      console.error('Error loading EVV record:', error);
    }
  };

  const getCurrentLocationWithValidation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current GPS location
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      // Get address from coordinates (in production, use proper geocoding service)
      const address = await reverseGeocode(location.latitude, location.longitude);

      // Validate location if appointment has address
      if (appointment.customerAddress) {
        // In a real app, you'd convert the customer address to coordinates
        // For demo purposes, using Springfield coordinates
        const appointmentLocation = {
          latitude: 39.7817,
          longitude: -89.6501
        };

        const validation = validateLocationProximity(
          location, 
          appointmentLocation, 
          DISTANCE_THRESHOLDS.NORMAL
        );
        setLocationValidation(validation);
      }

      return formatLocationForEVV(location, address);
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    const locationData = await getCurrentLocationWithValidation();
    if (!locationData) return;

    try {
      setIsLoading(true);
      
      const checkInData = {
        appointmentId: appointment.id,
        caregiverId: appointment.caregiverId,
        checkInLocation: locationData,
        device_info: {
          device_id: navigator.userAgent,
          version: 'v1.2.3',
          platform: navigator.platform
        },
        tasksCompleted: [],
        caregiverNotes: ''
      };

      const response = await evvRecordsAPI.checkIn(checkInData);
      setEvvRecord(response.data);
      
      if (onUpdate) onUpdate(response.data);
      
    } catch (error) {
      setError('Failed to check in: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!evvRecord) return;

    const locationData = await getCurrentLocationWithValidation();
    if (!locationData) return;

    try {
      setIsLoading(true);
      
      const checkOutData = {
        checkOutLocation: locationData,
        tasksCompleted,
        caregiverNotes,
        status: 'completed'
      };

      const response = await evvRecordsAPI.checkOut(evvRecord.id, checkOutData);
      setEvvRecord(response.data);
      
      if (onUpdate) onUpdate(response.data);
      
    } catch (error) {
      setError('Failed to check out: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCompletion = (taskId, taskName, completed, notes = '') => {
    const updatedTasks = tasksCompleted.filter(t => t.taskId !== taskId);
    
    if (completed) {
      updatedTasks.push({
        taskId,
        taskName,
        completed: true,
        notes,
        completedAt: new Date().toISOString()
      });
    }
    
    setTasksCompleted(updatedTasks);
  };

  const getLocationStatusColor = () => {
    if (!locationValidation) return 'text-gray-500';
    return locationValidation.isValid ? 'text-green-600' : 'text-red-600';
  };

  const isCheckedIn = evvRecord && evvRecord.checkInTime && !evvRecord.checkOutTime;
  const isCompleted = evvRecord && evvRecord.checkOutTime;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md" data-testid="evv-system">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Electronic Visit Verification</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${getLocationStatusColor()}`} data-testid="location-display">
            {currentLocation ? '📍 Location Ready' : '📍 Location Needed'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {locationValidation && !locationValidation.isValid && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          <strong>Location Warning:</strong> {locationValidation.message}
        </div>
      )}

      <div className="space-y-4">
        {/* Current Location Display */}
        {currentLocation && (
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-gray-700 mb-2">Current Location</h4>
            <p className="text-sm text-gray-600">
              📍 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </p>
            <p className="text-sm text-gray-500">
              Accuracy: ±{currentLocation.accuracy}m
            </p>
          </div>
        )}

        {/* Check In/Out Buttons */}
        <div className="flex space-x-4">
          {!isCheckedIn && !isCompleted && (
            <button
              onClick={handleCheckIn}
              disabled={isLoading}
              data-testid="check-in-btn"
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Getting Location...' : '✓ Check In'}
            </button>
          )}

          {isCheckedIn && (
            <button
              onClick={handleCheckOut}
              disabled={isLoading}
              data-testid="check-out-btn"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Getting Location...' : '✓ Check Out'}
            </button>
          )}

          {isCompleted && (
            <div className="flex-1 bg-gray-100 text-gray-600 py-3 px-4 rounded-lg text-center">
              ✅ Visit Completed
            </div>
          )}
        </div>

        {/* Task Completion */}
        {isCheckedIn && (
          <div className="border-t pt-4" data-testid="task-list">
            <h4 className="font-medium text-gray-700 mb-3">Tasks for this Visit</h4>
            <div className="space-y-2">
              {appointment.packageServices?.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`task-${service.id}`}
                      checked={tasksCompleted.some(t => t.taskId === `task_${service.id}`)}
                      onChange={(e) => handleTaskCompletion(
                        `task_${service.id}`,
                        service.name,
                        e.target.checked,
                        'Task completed as planned'
                      )}
                      className="h-4 w-4 text-green-600"
                    />
                    <label htmlFor={`task-${service.id}`} className="text-sm text-gray-600">
                      Complete
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Caregiver Notes */}
        {isCheckedIn && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visit Notes
            </label>
            <textarea
              value={caregiverNotes}
              onChange={(e) => setCaregiverNotes(e.target.value)}
              placeholder="Add any notes about the visit..."
              rows="3"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* EVV Record Summary */}
        {evvRecord && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-3">Visit Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Check In:</p>
                <p className="font-medium">
                  {evvRecord.checkInTime ? new Date(evvRecord.checkInTime).toLocaleString() : 'Not checked in'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Check Out:</p>
                <p className="font-medium">
                  {evvRecord.checkOutTime ? new Date(evvRecord.checkOutTime).toLocaleString() : 'Not checked out'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Tasks Completed:</p>
                <p className="font-medium">{tasksCompleted.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Status:</p>
                <p className="font-medium capitalize">{evvRecord.status}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedEVVSystem;
