import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Plus } from 'lucide-react';
import { usersAPI, caregiverAvailabilityAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const CaregiverAvailability = () => {
  const { id } = useParams();
  const [caregiver, setCaregiver] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [caregiverResponse, availabilityResponse] = await Promise.all([
        usersAPI.getById(id),
        caregiverAvailabilityAPI.getByUserId(id)
      ]);
      
      setCaregiver(caregiverResponse.data);
      setAvailability(availabilityResponse.data);
    } catch (error) {
      console.error('Error fetching caregiver availability:', error);
      toast.error('Failed to load caregiver availability');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!caregiver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Caregiver Not Found</h1>
          <Link to="/admin/caregivers" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Caregivers
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') {
      return 'N/A';
    }
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return 0;
    }
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    let duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (duration < 0) {
      duration += 24; // Handle times spanning midnight
    }
    return duration;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/caregivers"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Caregivers
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Availability for {caregiver.first_name} {caregiver.last_name}
              </h1>
              <p className="text-gray-600">Manage caregiver availability schedule</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Availability</span>
            </button>
          </div>
        </div>

        {/* Caregiver Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={caregiver.profilePicture}
              alt={`${caregiver.first_name} ${caregiver.last_name}`}
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {caregiver.first_name} {caregiver.last_name}
              </h2>
              <p className="text-gray-600">Background Check: {caregiver.backgroundCheckStatus}</p>
            </div>
          </div>
        </div>

        {/* Availability Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Availability Schedule ({availability.length} slots)</h3>
          </div>
          
          {availability.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availability.map((slot) => {
                    const duration = calculateDuration(slot.start_time, slot.end_time);
                    
                    return (
                      <tr key={slot.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(slot.date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {formatTime(slot.start_time)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {formatTime(slot.end_time)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {duration.toFixed(1)} hours
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            slot.is_available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {slot.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500 mb-2">No availability set</p>
              <p className="text-gray-400">Add availability slots for this caregiver.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaregiverAvailability; 