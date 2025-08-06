import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Filter,
  Eye,
  Edit,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  DollarSign,
  Plus,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { userRequestsAPI, usersAPI, packagesAPI, appointmentsAPI, userRolesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminUserRequests = () => {
  const [userRequests, setUserRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showCreateAppointmentModal, setShowCreateAppointmentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRequestForAppointment, setSelectedRequestForAppointment] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });
  const [appointmentFormData, setAppointmentFormData] = useState({
    user_id: '',
    caregiver_user_id: '',
    package_id: '',
    appointment_datetime_start: '',
    appointment_datetime_end: '',
    duration_minutes: '',
    status: 'Pending',
    booking_notes: '',
    total_cost: '',
    user_request_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsResponse, usersResponse, packagesResponse] = await Promise.all([
        userRequestsAPI.getAll(),
        usersAPI.getAll(),
        packagesAPI.getAll()
      ]);
      setUserRequests(requestsResponse.data);
      setUsers(usersResponse.data);
      setPackages(packagesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load user requests');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAppointmentInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAppointmentFromRequest = (request) => {
    const customer = users.find(u => u.id === request.user_id);
    const pkg = packages.find(p => p.id === request.package_id);
    
    // Auto-fill appointment form with request data
    setAppointmentFormData({
      user_id: request.user_id,
      caregiver_user_id: '', // Admin needs to select
      package_id: request.package_id,
      appointment_datetime_start: '',
      appointment_datetime_end: '',
      duration_minutes: pkg ? pkg.duration_hours * 60 : '',
      status: 'Pending',
      booking_notes: request.notes || '',
      total_cost: pkg ? pkg.total_cost : '',
      user_request_id: request.id
    });
    
    setSelectedRequestForAppointment(request);
    setShowCreateAppointmentModal(true);
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    
    try {
      // Calculate end time if not provided
      let endTime = appointmentFormData.appointment_datetime_end;
      if (!endTime && appointmentFormData.appointment_datetime_start && appointmentFormData.duration_minutes) {
        const startTime = new Date(appointmentFormData.appointment_datetime_start);
        const endTimeDate = new Date(startTime.getTime() + (parseInt(appointmentFormData.duration_minutes) * 60 * 1000));
        endTime = endTimeDate.toISOString();
      }

      const appointmentData = {
        ...appointmentFormData,
        appointment_datetime_end: endTime,
        created_at: new Date().toISOString()
      };

      await appointmentsAPI.create(appointmentData);
      
      // Update request status to converted
      await userRequestsAPI.update(appointmentFormData.user_request_id, { 
        status: 'converted',
        converted_at: new Date().toISOString()
      });

      toast.success('Appointment created successfully from request');
      setShowCreateAppointmentModal(false);
      setSelectedRequestForAppointment(null);
      setAppointmentFormData({
        user_id: '',
        caregiver_user_id: '',
        package_id: '',
        appointment_datetime_start: '',
        appointment_datetime_end: '',
        duration_minutes: '',
        status: 'Pending',
        booking_notes: '',
        total_cost: '',
        user_request_id: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  const handlePackageChange = (packageId) => {
    const selectedPackage = packages.find(pkg => pkg.id === parseInt(packageId));
    if (selectedPackage) {
      setAppointmentFormData(prev => ({
        ...prev,
        package_id: packageId,
        total_cost: selectedPackage.total_cost,
        duration_minutes: selectedPackage.duration_hours * 60
      }));
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await userRequestsAPI.update(requestId, { status: newStatus });
      toast.success(`Request ${newStatus} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request status');
    }
  };

  const handleConvertToAppointment = async (requestId) => {
    try {
      const request = userRequests.find(req => req.id === requestId);
      if (!request) {
        toast.error('Request not found');
        return;
      }

      // Create appointment from request
      const appointmentData = {
        user_id: request.user_id,
        package_id: request.package_id,
        status: 'pending',
        booking_notes: request.notes,
        user_request_id: request.id,
        created_at: new Date().toISOString()
      };

      await appointmentsAPI.create(appointmentData);
      
      // Update request status to converted
      await userRequestsAPI.update(requestId, { 
        status: 'converted',
        converted_at: new Date().toISOString()
      });

      toast.success('Request converted to appointment successfully');
      fetchData();
    } catch (error) {
      console.error('Error converting request:', error);
      toast.error('Failed to convert request to appointment');
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setFormData({
      status: request.status,
      notes: request.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await userRequestsAPI.update(selectedRequest.id, formData);
      toast.success('Request updated successfully');
      setShowModal(false);
      setSelectedRequest(null);
      fetchData();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const getCustomerById = (userId) => {
    return users.find(user => user.id === userId);
  };

  const getPackageById = (packageId) => {
    return packages.find(pkg => pkg.id === packageId);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'converted': return 'bg-green-100 text-green-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContactMethodIcon = (method) => {
    switch (method) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredRequests = userRequests.filter(request => {
    const customer = getCustomerById(request.user_id);
    const pkg = getPackageById(request.package_id);
    
    const matchesSearch = 
      (customer?.first_name?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (customer?.last_name?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (customer?.email?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (request.notes?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (pkg?.name?.toLowerCase().includes((searchTerm || '').toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="h-6 w-6 mr-2" />
                User Requests Management
              </h1>
              <p className="text-gray-600 mt-1">Manage and track customer inquiries</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{userRequests.length}</div>
              <div className="text-sm text-gray-500">Total Requests</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">
                {filteredRequests.length} of {userRequests.length} requests
              </span>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const customer = getCustomerById(request.user_id);
            const pkg = getPackageById(request.package_id);
            
            return (
              <div key={request.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Request #{request.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {request.status === 'new' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'contacted')}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Mark as Contacted"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'rejected')}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Reject Request"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {request.status === 'contacted' && (
                          <>
                            <button
                              onClick={() => handleCreateAppointmentFromRequest(request)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Create Appointment"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleConvertToAppointment(request.id)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Convert to Appointment"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'rejected')}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Reject Request"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {request.status === 'new' && (
                          <button
                            onClick={() => handleCreateAppointmentFromRequest(request)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Create Appointment"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Customer
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">
                          {customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown'}
                        </p>
                        <p className="text-gray-600 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {customer?.email}
                        </p>
                        <p className="text-gray-600 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {customer?.phone_number}
                        </p>
                        <p className="text-gray-600 flex items-center">
                          {getContactMethodIcon(request.preferred_contact_method)}
                          <span className="ml-1 capitalize">
                            {request.preferred_contact_method} preferred
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Package Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Package
                      </h4>
                      <div className="space-y-1 text-sm">
                        {pkg ? (
                          <>
                            <p className="font-medium">{pkg.name}</p>
                            <p className="text-gray-600">{pkg.description}</p>
                            <p className="text-blue-600 font-semibold">${pkg.total_cost}</p>
                          </>
                        ) : (
                          <p className="text-gray-500 italic">No package selected</p>
                        )}
                      </div>
                    </div>

                    {/* Request Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Status:</span> {request.status}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Created:</span> {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        {request.converted_at && (
                          <p className="text-gray-600">
                            <span className="font-medium">Converted:</span> {new Date(request.converted_at).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-gray-600">
                          <span className="font-medium">Contact:</span> {request.preferred_contact_method}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {request.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <h5 className="font-medium text-gray-900 mb-1">Customer Notes:</h5>
                      <p className="text-sm text-gray-600">{request.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Appointment Modal */}
        {showCreateAppointmentModal && selectedRequestForAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Create Appointment from Request #{selectedRequestForAppointment.id}
                  </h3>
                  <button
                    onClick={() => setShowCreateAppointmentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Request Info Summary */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Request Information (Auto-filled)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-800">Customer:</span> 
                      <span className="ml-2 text-blue-700">
                        {(() => {
                          const customer = users.find(u => u.id === selectedRequestForAppointment.user_id);
                          return customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown';
                        })()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Package:</span> 
                      <span className="ml-2 text-blue-700">
                        {(() => {
                          const pkg = packages.find(p => p.id === selectedRequestForAppointment.package_id);
                          return pkg ? pkg.name : 'No package selected';
                        })()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Contact Method:</span> 
                      <span className="ml-2 text-blue-700 capitalize">{selectedRequestForAppointment.preferred_contact_method}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Request Notes:</span> 
                      <span className="ml-2 text-blue-700">{selectedRequestForAppointment.notes || 'No notes'}</span>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleCreateAppointment} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Selection (Auto-filled, editable) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                      <select
                        name="user_id"
                        value={appointmentFormData.user_id}
                        onChange={handleAppointmentInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Customer</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} - {user.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Caregiver Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Caregiver *</label>
                      <select
                        name="caregiver_user_id"
                        value={appointmentFormData.caregiver_user_id}
                        onChange={handleAppointmentInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Caregiver</option>
                        {users.filter(u => u.role === 'caregiver').map(caregiver => (
                          <option key={caregiver.id} value={caregiver.id}>
                            {caregiver.first_name} {caregiver.last_name} - ${caregiver.hourlyRate}/hr
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Package Selection (Auto-filled, editable) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Package *</label>
                      <select
                        name="package_id"
                        value={appointmentFormData.package_id}
                        onChange={(e) => {
                          handleAppointmentInputChange(e);
                          handlePackageChange(e.target.value);
                        }}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Package</option>
                        {packages.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} - ${pkg.total_cost} ({pkg.duration_hours}h)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        name="status"
                        value={appointmentFormData.status}
                        onChange={handleAppointmentInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Start Date & Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
                      <input
                        type="datetime-local"
                        name="appointment_datetime_start"
                        value={appointmentFormData.appointment_datetime_start}
                        onChange={handleAppointmentInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* End Date & Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                      <input
                        type="datetime-local"
                        name="appointment_datetime_end"
                        value={appointmentFormData.appointment_datetime_end}
                        onChange={handleAppointmentInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty to auto-calculate based on duration</p>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        name="duration_minutes"
                        value={appointmentFormData.duration_minutes}
                        onChange={handleAppointmentInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Auto-filled from package"
                      />
                    </div>

                    {/* Total Cost */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Cost ($)</label>
                      <input
                        type="number"
                        name="total_cost"
                        value={appointmentFormData.total_cost}
                        onChange={handleAppointmentInputChange}
                        step="0.01"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Auto-filled from package"
                      />
                    </div>
                  </div>

                  {/* Booking Notes (Auto-filled from request notes) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Booking Notes</label>
                    <textarea
                      name="booking_notes"
                      value={appointmentFormData.booking_notes}
                      onChange={handleAppointmentInputChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add any special instructions or notes for this appointment..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateAppointmentModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Create Appointment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Request Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Request Details - #{selectedRequest.id}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="4"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add any notes about this request..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Update Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserRequests; 