import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
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
  Package,
  Calendar,
  MessageCircle,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { userRequestsAPI, customersAPI, packagesAPI, appointmentsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminUserRequests = () => {
  const [userRequests, setUserRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsResponse, customersResponse, packagesResponse] = await Promise.all([
        userRequestsAPI.getAll(),
        customersAPI.getAll(),
        packagesAPI.getAll()
      ]);
      setUserRequests(requestsResponse.data);
      setCustomers(customersResponse.data);
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
        customer_id: request.customer_id,
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

  const getCustomerById = (customerId) => {
    return customers.find(customer => customer.id === customerId);
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
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const filteredRequests = userRequests.filter(request => {
    const customer = getCustomerById(request.customer_id);
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
            const customer = getCustomerById(request.customer_id);
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
                              <MessageCircle className="h-4 w-4" />
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
                              onClick={() => handleConvertToAppointment(request.id)}
                              className="text-green-600 hover:text-green-900 p-1"
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

        {/* Modal */}
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