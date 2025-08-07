import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserPlus,
  Activity,
  Star,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { customersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    averageAge: 0,
    satisfactionRate: 0
  });
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    is_active: true
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    calculateMetrics();
  }, [customers]);

  const fetchCustomers = async () => {
    try {
      const customersResponse = await customersAPI.getAll();
      setCustomers(customersResponse.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const total = customers.length;
    const active = customers.filter(c => c.is_active).length;
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newThisMonth = customers.filter(c => {
      const created = new Date(c.created_at);
      return created >= thisMonth;
    }).length;

    // Calculate average age
    const ages = customers
      .filter(c => c.date_of_birth)
      .map(c => {
        const birthDate = new Date(c.date_of_birth);
        const today = new Date();
        return today.getFullYear() - birthDate.getFullYear();
      });
    const averageAge = ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0;

    // Mock satisfaction rate (in real app, this would come from reviews)
    const satisfactionRate = 4.3;

    setMetrics({
      total,
      active,
      newThisMonth,
      averageAge,
      satisfactionRate
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'is_active' ? (value === 'active') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCustomer) {
        await customersAPI.update(editingCustomer.id, formData);
        toast.success('Customer updated successfully');
      } else {
        const customerResponse = await customersAPI.create(formData);
        const newCustomerId = customerResponse.data.id;
        
        // No role assignment needed as customers are not explicitly tied to roles here
        // If roles are introduced, this would be the place to assign them.
        
        toast.success('Customer created successfully');
      }
      
      setShowModal(false);
      setEditingCustomer(null);
      setFormData({ 
        first_name: '', 
        last_name: '', 
        email: '', 
        phone_number: '', 
        date_of_birth: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        is_active: true 
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to save customer');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      email: customer.email || '',
      phone_number: customer.phone_number || '',
      date_of_birth: customer.date_of_birth || '',
      emergency_contact_name: customer.emergency_contact_name || '',
      emergency_contact_phone: customer.emergency_contact_phone || '',
      is_active: customer.is_active || true
    });
    setShowModal(true);
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersAPI.delete(customerId);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast.error('Failed to delete customer');
      }
    }
  };

  const getCustomerName = (customer) => {
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown Customer';
  };

  const getCustomerInitial = (customer) => {
    const name = getCustomerName(customer);
    return name.charAt(0).toUpperCase();
  };

  const filteredCustomers = customers.filter(customer => {
    const fullName = getCustomerName(customer).toLowerCase();
    const matchesSearch = fullName.includes((searchTerm || '').toLowerCase()) ||
                         (customer.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (customer.phone_number || '').includes(searchTerm || '');
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && customer.is_active) ||
                         (filterStatus === 'inactive' && !customer.is_active);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/admin" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Customer Management</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
              <p className="text-gray-600">Manage customer profiles and information</p>
            </div>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setFormData({ 
                  first_name: '', 
                  last_name: '', 
                  email: '', 
                  phone_number: '', 
                  date_of_birth: '',
                  emergency_contact_name: '',
                  emergency_contact_phone: '',
                  is_active: true 
                });
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              data-action="add-customer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.total}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.active}</p>
                <p className="text-sm text-green-600 mt-1">
                  {metrics.total > 0 ? ((metrics.active / metrics.total) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.newThisMonth}</p>
                <p className="text-sm text-purple-600 mt-1">New registrations</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <UserPlus className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Age</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.averageAge.toFixed(0)}y</p>
                <p className="text-sm text-orange-600 mt-1">Years</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.satisfactionRate}</p>
                <p className="text-sm text-yellow-600 mt-1">out of 5</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-action="search"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">
                {filteredCustomers.length} of {customers.length} customers
              </span>
            </div>
          </div>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-lg font-medium text-blue-600">
                        {getCustomerInitial(customer)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{getCustomerName(customer)}</h3>
                      <p className="text-sm text-gray-500">ID: {customer.id}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {customer.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {customer.phone_number}
                  </div>
                  {customer.date_of_birth && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(customer.date_of_birth).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                {customer.emergency_contact_name && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-1">Emergency Contact</p>
                    <p className="text-sm text-gray-900">{customer.emergency_contact_name}</p>
                    {customer.emergency_contact_phone && (
                      <p className="text-sm text-gray-600">{customer.emergency_contact_phone}</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    title="Edit Customer"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    title="Delete Customer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No customers found</p>
            <p className="text-gray-400">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="is_active"
                        value={formData.is_active ? 'active' : 'inactive'}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                      <input
                        type="text"
                        name="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        name="emergency_contact_phone"
                        value={formData.emergency_contact_phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingCustomer ? 'Update' : 'Create'}
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

export default AdminCustomers; 