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
  DollarSign
} from 'lucide-react';
import { appointmentsAPI, packagesAPI, customersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsResponse, packagesResponse, customersResponse] = await Promise.all([
        appointmentsAPI.getAll(),
        packagesAPI.getAll(),
        customersAPI.getAll()
      ]);
      setAppointments(appointmentsResponse.data);
      setPackages(packagesResponse.data);
      setCustomers(customersResponse.data);
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

  const getCustomerById = (customerId) => {
    return customers.find(customer => customer.id === customerId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const customer = getCustomerById(appointment.customer_id);
    const pkg = getPackageById(appointment.package_id);
    
    const matchesSearch = 
      (customer?.name?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (customer?.email?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (pkg?.name?.toLowerCase().includes((searchTerm || '').toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
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
                <Calendar className="h-6 w-6 mr-2" />
                Appointment Management
              </h1>
              <p className="text-gray-600 mt-1">Manage and track all appointments</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
              <div className="text-sm text-gray-500">Total Appointments</div>
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
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
            const customer = getCustomerById(appointment.customer_id);
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
                          {new Date(appointment.appointment_datetime_start).toLocaleDateString()} at {new Date(appointment.appointment_datetime_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                              className="text-green-600 hover:text-green-900 p-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900 p-1"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                            className="text-blue-600 hover:text-blue-900 p-1"
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
                          {customer?.phone || appointment.customer_phone}
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
                          <span className="font-medium">Date:</span> {new Date(appointment.appointment_datetime_start).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Time:</span> {new Date(appointment.appointment_datetime_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(appointment.appointment_datetime_end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Duration:</span> {appointment.duration_minutes || pkg?.duration_hours || 0} minutes
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Created:</span> {new Date(appointment.appointment_datetime_start).toLocaleDateString()}
                        </p>
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

        {/* Modal */}
        {showModal && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Appointment Details - #{selectedAppointment.id}
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
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
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
                      placeholder="Add any notes about this appointment..."
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
                      Update Appointment
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

export default AdminAppointments; 