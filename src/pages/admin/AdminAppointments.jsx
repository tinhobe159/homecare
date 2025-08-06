import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  DollarSign,
  Plus
} from 'lucide-react';
import { appointmentsAPI, packagesAPI, usersAPI, userRequestsAPI, userRolesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });
  const [createFormData, setCreateFormData] = useState({
    user_id: '',
    caregiver_user_id: '',
    package_id: '',
    appointment_datetime_start: '',
    appointment_datetime_end: '',
    duration_minutes: '',
    status: 'Pending',
    booking_notes: '',
    total_cost: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsResponse, packagesResponse, usersResponse, userRequestsResponse] = await Promise.all([
        appointmentsAPI.getAll(),
        packagesAPI.getAll(),
        usersAPI.getAll(),
        userRequestsAPI.getAll()
      ]);
      setAppointments(appointmentsResponse.data);
      setPackages(packagesResponse.data);
      setUsers(usersResponse.data);
      setUserRequests(userRequestsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load appointments');
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

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    
    try {
      // Calculate end time if not provided
      let endTime = createFormData.appointment_datetime_end;
      if (!endTime && createFormData.appointment_datetime_start && createFormData.duration_minutes) {
        const startTime = new Date(createFormData.appointment_datetime_start);
        const endTimeDate = new Date(startTime.getTime() + (parseInt(createFormData.duration_minutes) * 60 * 1000));
        endTime = endTimeDate.toISOString();
      }

      const appointmentData = {
        ...createFormData,
        appointment_datetime_end: endTime,
        created_at: new Date().toISOString()
      };

      await appointmentsAPI.create(appointmentData);
      toast.success('Appointment created successfully');
      setShowCreateModal(false);
      setCreateFormData({
        user_id: '',
        caregiver_user_id: '',
        package_id: '',
        appointment_datetime_start: '',
        appointment_datetime_end: '',
        duration_minutes: '',
        status: 'Pending',
        booking_notes: '',
        total_cost: ''
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
      setCreateFormData(prev => ({
        ...prev,
        package_id: packageId,
        total_cost: selectedPackage.total_cost,
        duration_minutes: selectedPackage.duration_hours * 60
      }));
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await appointmentsAPI.update(appointmentId, { status: newStatus });
      toast.success(`Appointment ${newStatus} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      status: appointment.status,
      notes: appointment.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await appointmentsAPI.update(selectedAppointment.id, formData);
      toast.success('Appointment updated successfully');
      setShowModal(false);
      setSelectedAppointment(null);
      fetchData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const getPackageById = (packageId) => {
    return packages.find(pkg => pkg.id === packageId);
  };

  const getUserById = (userId) => {
    return users.find(user => user.id === userId);
  };

  const getUserRequestById = (requestId) => {
    return userRequests.find(req => req.id === requestId);
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

  const filteredAppointments = appointments.filter(appointment => {
    const customer = getUserById(appointment.user_id);
    const pkg = getPackageById(appointment.package_id);
    
    const matchesSearch = 
      (customer?.first_name?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (customer?.last_name?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (customer?.email?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (pkg?.name?.toLowerCase().includes((searchTerm || '').toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Appointment Management
            </h1>
            <p className="text-gray-600 mt-1">Manage and track all appointments</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
              <div className="text-sm text-gray-500">Total Appointments</div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Create Appointment</span>
            </button>
          </div>
        </div>
      </div>
  
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-[50%] transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search appointments..."
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
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-600">
              {filteredAppointments.length} of {appointments.length} appointments
            </span>
          </div>
        </div>
      </div>
  
      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => {
          const customer = getUserById(appointment.user_id);
          const pkg = getPackageById(appointment.package_id);
          
          return (
            <div key={appointment.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Appointment #{appointment.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.appointment_datetime_start).toLocaleDateString()} at {' '}
                        {new Date(appointment.appointment_datetime_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        aria-label="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {appointment.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'Confirmed')}
                            className="text-green-600 hover:text-green-900 p-1"
                            aria-label="Confirm appointment"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'Cancelled')}
                            className="text-red-600 hover:text-red-900 p-1"
                            aria-label="Cancel appointment"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {appointment.status === 'Confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'Completed')}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          aria-label="Mark as completed"
                        >
                          <CheckCircle className="h-4 w-4" />
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
                      <p className="font-medium">{customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown'}</p>
                      <p className="text-gray-600 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {customer?.email || appointment.customer_email}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {customer?.phone_number || appointment.customer_phone}
                      </p>
                      {appointment.address && (
                        <p className="text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {appointment.address}
                        </p>
                      )}
                    </div>
                  </div>
  
                  {/* Package Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Package
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{pkg?.name || 'Unknown Package'}</p>
                      <p className="text-gray-600">{pkg?.description || 'No description'}</p>
                      <p className="text-blue-600 font-semibold flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        ${pkg?.total_cost || appointment.total_cost || 0}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {pkg?.duration_hours || appointment.duration || 0} hours
                      </p>
                    </div>
                  </div>
  
                  {/* Appointment Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Date:</span> {' '}
                        {new Date(appointment.appointment_datetime_start).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Time:</span> {' '}
                        {new Date(appointment.appointment_datetime_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                        {new Date(appointment.appointment_datetime_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Duration:</span> {' '}
                        {appointment.duration_minutes || pkg?.duration_hours * 60 || 0} minutes
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Created:</span> {' '}
                        {new Date(appointment.created_at).toLocaleDateString()}
                      </p>
                      {appointment.user_request_id && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md">
                          <p className="text-xs text-blue-800 font-medium">
                            From User Request #{appointment.user_request_id}
                          </p>
                          {getUserRequestById(appointment.user_request_id)?.notes && (
                            <p className="text-xs text-blue-700 mt-1">
                              {getUserRequestById(appointment.user_request_id).notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
  
                {/* Special Instructions */}
                {appointment.special_instructions && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <h5 className="font-medium text-gray-900 mb-1">Special Instructions:</h5>
                    <p className="text-sm text-gray-600">{appointment.special_instructions}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
  
      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Create New Appointment
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateAppointment} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Selection */}
                  <div>
                    <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Customer *
                    </label>
                    <select
                      id="user_id"
                      name="user_id"
                      value={createFormData.user_id}
                      onChange={handleCreateInputChange}
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
                    <label htmlFor="caregiver_user_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Caregiver *
                    </label>
                    <select
                      id="caregiver_user_id"
                      name="caregiver_user_id"
                      value={createFormData.caregiver_user_id}
                      onChange={handleCreateInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Caregiver</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} - ${user.hourlyRate}/hr
                        </option>
                      ))}
                    </select>
                  </div>
  
                  {/* Package Selection */}
                  <div>
                    <label htmlFor="package_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Package *
                    </label>
                    <select
                      id="package_id"
                      name="package_id"
                      value={createFormData.package_id}
                      onChange={(e) => {
                        handleCreateInputChange(e);
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
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={createFormData.status}
                      onChange={handleCreateInputChange}
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
                    <label htmlFor="appointment_datetime_start" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      id="appointment_datetime_start"
                      type="datetime-local"
                      name="appointment_datetime_start"
                      value={createFormData.appointment_datetime_start}
                      onChange={handleCreateInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
  
                  {/* End Date & Time */}
                  <div>
                    <label htmlFor="appointment_datetime_end" className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time
                    </label>
                    <input
                      id="appointment_datetime_end"
                      type="datetime-local"
                      name="appointment_datetime_end"
                      value={createFormData.appointment_datetime_end}
                      onChange={handleCreateInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to auto-calculate based on duration</p>
                  </div>
  
                  {/* Duration */}
                  <div>
                    <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      id="duration_minutes"
                      type="number"
                      name="duration_minutes"
                      value={createFormData.duration_minutes}
                      onChange={handleCreateInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Auto-filled from package"
                    />
                  </div>
  
                  {/* Total Cost */}
                  <div>
                    <label htmlFor="total_cost" className="block text-sm font-medium text-gray-700 mb-2">
                      Total Cost ($)
                    </label>
                    <input
                      id="total_cost"
                      type="number"
                      name="total_cost"
                      value={createFormData.total_cost}
                      onChange={handleCreateInputChange}
                      step="0.01"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Auto-filled from package"
                    />
                  </div>
                </div>
  
                {/* Booking Notes */}
                <div>
                  <label htmlFor="booking_notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Notes
                  </label>
                  <textarea
                    id="booking_notes"
                    name="booking_notes"
                    value={createFormData.booking_notes}
                    onChange={handleCreateInputChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any special instructions or notes for this appointment..."
                  />
                </div>
  
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
  
      {/* Edit Appointment Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium text-gray-900">
                  Appointment Details - #{selectedAppointment.id}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Detailed Appointment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </h4>
                  {(() => {
                    const customer = getUserById(selectedAppointment.user_id);
                    return (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown'}</p>
                        <p><span className="font-medium">Email:</span> {customer?.email || selectedAppointment.customer_email}</p>
                        <p><span className="font-medium">Phone:</span> {customer?.phone_number || selectedAppointment.customer_phone}</p>
                        {selectedAppointment.address && (
                          <p><span className="font-medium">Address:</span> {selectedAppointment.address}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Package Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Package Information
                  </h4>
                  {(() => {
                    const pkg = getPackageById(selectedAppointment.package_id);
                    return (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Package:</span> {pkg?.name || 'Unknown Package'}</p>
                        <p><span className="font-medium">Description:</span> {pkg?.description || 'No description'}</p>
                        <p><span className="font-medium">Cost:</span> ${pkg?.total_cost || selectedAppointment.total_cost || 0}</p>
                        <p><span className="font-medium">Duration:</span> {pkg?.duration_hours || selectedAppointment.duration || 0} hours</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Appointment Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Appointment Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Date:</span> {new Date(selectedAppointment.appointment_datetime_start).toLocaleDateString()}</p>
                    <p><span className="font-medium">Start Time:</span> {new Date(selectedAppointment.appointment_datetime_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><span className="font-medium">End Time:</span> {new Date(selectedAppointment.appointment_datetime_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><span className="font-medium">Duration:</span> {selectedAppointment.duration_minutes || 0} minutes</p>
                    <p><span className="font-medium">Created:</span> {new Date(selectedAppointment.created_at).toLocaleDateString()}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                        {selectedAppointment.status}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Caregiver Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Caregiver Information
                  </h4>
                  {(() => {
                    const caregiver = getUserById(selectedAppointment.caregiver_user_id);
                    return (
                      <div className="space-y-2 text-sm">
                        {caregiver ? (
                          <>
                            <p><span className="font-medium">Name:</span> {caregiver.first_name} {caregiver.last_name}</p>
                            <p><span className="font-medium">Email:</span> {caregiver.email}</p>
                            <p><span className="font-medium">Phone:</span> {caregiver.phone_number}</p>
                            <p><span className="font-medium">Hourly Rate:</span> ${caregiver.hourlyRate}/hr</p>
                          </>
                        ) : (
                          <p className="text-gray-500">No caregiver assigned</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Special Instructions */}
              {selectedAppointment.special_instructions && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Special Instructions:</h4>
                  <p className="text-sm text-gray-700">{selectedAppointment.special_instructions}</p>
                </div>
              )}

              {/* User Request Information */}
              {selectedAppointment.user_request_id && (
                <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">User Request Information:</h4>
                  {(() => {
                    const userRequest = getUserRequestById(selectedAppointment.user_request_id);
                    return (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Request ID:</span> #{selectedAppointment.user_request_id}</p>
                        {userRequest?.notes && (
                          <p><span className="font-medium">Notes:</span> {userRequest.notes}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Edit Form */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Update Appointment</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="edit-status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <textarea
                        id="edit-notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add any notes about this appointment..."
                      />
                    </div>
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
                      Update Appointment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminAppointments;
