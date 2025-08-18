import React, { useState, useEffect } from "react";
import { evvRecordsAPI, usersAPI, appointmentsAPI } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const SupervisorVerificationDashboard = () => {
  const [pendingRecords, setPendingRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, verified, all

  useEffect(() => {
    loadPendingVerifications();
  }, [filter]);

  const loadPendingVerifications = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (filter === 'pending') {
        response = await evvRecordsAPI.getPendingVerifications();
      } else {
        response = await evvRecordsAPI.getAll();
      }

      // Enrich with caregiver and appointment data
      const enrichedRecords = await Promise.all(
        response.data.map(async (record) => {
          try {
            const [caregiverResponse, appointmentResponse] = await Promise.all([
              usersAPI.getById(record.caregiver_id),
              appointmentsAPI.getById(record.appointment_id)
            ]);
            
            return {
              ...record,
              caregiver: caregiverResponse.data,
              appointment: appointmentResponse.data
            };
          } catch (error) {
            console.error(`Error enriching record ${record.id}:`, error);
            return record;
          }
        })
      );

      // Apply filter
      let filteredRecords = enrichedRecords;
      if (filter === 'pending') {
        filteredRecords = enrichedRecords.filter(r => !r.supervisorVerification?.verified);
      } else if (filter === 'verified') {
        filteredRecords = enrichedRecords.filter(r => r.supervisorVerification?.verified);
      }

      setPendingRecords(filteredRecords);
    } catch (error) {
      console.error('Error loading EVV records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyRecord = async (recordId, isApproved) => {
    try {
      const verificationData = {
        verified: isApproved,
        verified_by: 1, // Current admin user ID (should come from auth context)
        verified_at: new Date().toISOString(),
        notes: verificationNotes
      };

      await evvRecordsAPI.addSupervisorVerification(recordId, verificationData);
      
      // Refresh the list
      await loadPendingVerifications();
      
      // Clear selection and notes
      setSelectedRecord(null);
      setVerificationNotes('');
      
    } catch (error) {
      console.error('Error verifying record:', error);
    }
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'Incomplete';
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadge = (record) => {
    if (record.supervisorVerification?.verified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ Verified
        </span>
      );
    } else if (record.status === 'completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          ⏳ Pending Review
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          📋 {record.status}
        </span>
      );
    }
  };

  const getLocationAccuracy = (location) => {
    if (!location) return 'N/A';
    if (location.accuracy <= 10) return '🟢 Excellent';
    if (location.accuracy <= 25) return '🟡 Good';
    return '🔴 Poor';
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Supervisor Verification Dashboard</h2>
        
        {/* Filter Tabs */}
        <div className="flex rounded-md shadow-sm">
          {[
            { key: 'pending', label: 'Pending', count: pendingRecords.filter(r => !r.supervisorVerification?.verified).length },
            { key: 'verified', label: 'Verified', count: pendingRecords.filter(r => r.supervisorVerification?.verified).length },
            { key: 'all', label: 'All Records', count: pendingRecords.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-900'
              } border border-gray-300 ${
                tab.key === 'pending' ? 'rounded-l-md' : 
                tab.key === 'all' ? 'rounded-r-md' : ''
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {pendingRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No records found</div>
            <p className="text-gray-400 mt-2">
              {filter === 'pending' ? 'All visits have been verified' : 'No EVV records available'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {pendingRecords.map((record) => (
              <li key={record.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={record.caregiver?.avatar_url || 'https://via.placeholder.com/40'}
                        alt=""
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {record.caregiver?.first_name} {record.caregiver?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Visit on {new Date(record.appointment?.appointment_datetime_start).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(record)}
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Review Details →
                      </button>
                    </div>
                  </div>
                  
                  {/* Quick Info */}
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Duration:</span> {calculateDuration(record.check_in_time, record.check_out_time)}
                    </div>
                    <div>
                      <span className="font-medium">Tasks:</span> {record.tasksCompleted?.length || 0} completed
                    </div>
                    <div>
                      <span className="font-medium">Check-in Accuracy:</span> {getLocationAccuracy(record.checkInLocation)}
                    </div>
                    <div>
                      <span className="font-medium">Check-out Accuracy:</span> {getLocationAccuracy(record.checkOutLocation)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detailed Review Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-semibold">EVV Record Verification</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-4 space-y-6">
              {/* Caregiver & Appointment Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Caregiver</h4>
                  <div className="flex items-center space-x-3">
                    <img
                      className="h-12 w-12 rounded-full"
                      src={selectedRecord.caregiver?.avatar_url || 'https://via.placeholder.com/48'}
                      alt=""
                    />
                    <div>
                      <p className="font-medium">{selectedRecord.caregiver?.first_name} {selectedRecord.caregiver?.last_name}</p>
                      <p className="text-sm text-gray-500">{selectedRecord.caregiver?.email}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Appointment</h4>
                  <p className="text-sm">
                    {new Date(selectedRecord.appointment?.appointment_datetime_start).toLocaleString()} - 
                    {new Date(selectedRecord.appointment?.appointment_datetime_end).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Duration: {calculateDuration(selectedRecord.check_in_time, selectedRecord.check_out_time)}</p>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Location Verification</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium text-green-700">Check-in Location</p>
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {selectedRecord.checkInLocation?.address || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Accuracy: ±{selectedRecord.checkInLocation?.accuracy}m
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedRecord.check_in_time ? new Date(selectedRecord.check_in_time).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium text-blue-700">Check-out Location</p>
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {selectedRecord.checkOutLocation?.address || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Accuracy: ±{selectedRecord.checkOutLocation?.accuracy}m
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedRecord.check_out_time ? new Date(selectedRecord.check_out_time).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Completed Tasks */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Completed Tasks</h4>
                {selectedRecord.tasksCompleted?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRecord.tasksCompleted.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded">
                        <div>
                          <p className="font-medium text-green-800">✓ {task.taskName}</p>
                          {task.notes && <p className="text-sm text-green-600">{task.notes}</p>}
                        </div>
                        <span className="text-sm text-green-600">
                          {new Date(task.completedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No tasks completed</p>
                )}
              </div>

              {/* Caregiver Notes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Caregiver Notes</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-700">
                    {selectedRecord.caregiverNotes || 'No notes provided'}
                  </p>
                </div>
              </div>

              {/* Verification Section */}
              {!selectedRecord.supervisorVerification?.verified && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Supervisor Verification</h4>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add verification notes..."
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-3 mt-3">
                    <button
                      onClick={() => handleVerifyRecord(selectedRecord.id, true)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                    >
                      ✓ Approve & Verify
                    </button>
                    <button
                      onClick={() => handleVerifyRecord(selectedRecord.id, false)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                    >
                      ✗ Reject & Flag
                    </button>
                  </div>
                </div>
              )}

              {/* Already Verified */}
              {selectedRecord.supervisorVerification?.verified && (
                <div className="bg-green-50 border border-green-200 p-4 rounded">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="font-medium text-green-800">Verified</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Verified on {new Date(selectedRecord.supervisorVerification.verified_at).toLocaleString()}
                  </p>
                  {selectedRecord.supervisorVerification.notes && (
                    <p className="text-sm text-green-600 mt-2">
                      <strong>Notes:</strong> {selectedRecord.supervisorVerification.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorVerificationDashboard;
