import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, User, Package, Edit, Trash2, Play, Pause, X, Eye,
  Search, Filter, Activity, Star, TrendingUp, BarChart3, 
  DollarSign, Users, AlertTriangle
} from 'lucide-react';
import { scheduledPackagesAPI, packagesAPI, usersAPI, userRolesAPI, caregiversAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import RecurrenceBuilder from '../../components/common/RecurrenceBuilder';
import CalendarPreview from '../../components/common/CalendarPreview';
import { useAuth } from '../../contexts/AuthContext';

const AdminScheduledPackages = () => {
  const { isAdmin } = useAuth();
  const [scheduledPackages, setScheduledPackages] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showRecurrenceBuilder, setShowRecurrenceBuilder] = useState(false);
  const [showCalendarPreview, setShowCalendarPreview] = useState(false);
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    totalRevenue: 0,
    averageDuration: 0,
    satisfactionRate: 0
  });

  const [formData, setFormData] = useState({
    user_id: '',
    package_id: '',
    caregiver_id: '',
    start_datetime: '',
    rrule: '',
    end_date: '',
    status: 'active',
    exceptions: []
  });

  // Scheduled package state for better UX
  const [scheduledData, setScheduledData] = useState({
    rrule: '',
    start_datetime: '',
    exceptions: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateMetrics();
  }, [scheduledPackages, packages]);

  const fetchData = async () => {
    try {
      const [scheduledResponse, packagesResponse, usersResponse, caregiversResponse] = await Promise.all([
        scheduledPackagesAPI.getAll(),
        packagesAPI.getAll(),
        usersAPI.getAll(),
        caregiversAPI.getAll()
      ]);
      
      setScheduledPackages(scheduledResponse.data);
      setPackages(packagesResponse.data);
      setUsers(usersResponse.data);
      setCaregivers(caregiversResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const total = scheduledPackages.length;
    const active = scheduledPackages.filter(sp => sp.status === 'active').length;
    
    // Calculate total revenue
    const totalRevenue = scheduledPackages.reduce((sum, sp) => {
      const pkg = packages.find(p => p.id === sp.package_id);
      return sum + (pkg?.total_cost || 0);
    }, 0);
    
    // Calculate average duration
    const totalDuration = scheduledPackages.reduce((sum, sp) => {
      const pkg = packages.find(p => p.id === sp.package_id);
      return sum + (pkg?.duration_hours || 0);
    }, 0);
    const averageDuration = total > 0 ? totalDuration / total : 0;
    
    // Mock satisfaction rate
    const satisfactionRate = 4.3;

    setMetrics({
      total,
      active,
      totalRevenue,
      averageDuration,
      satisfactionRate
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecurrenceChange = (rrule) => {
    console.log('RecurrenceBuilder called handleRecurrenceChange with rrule:', rrule);
    setScheduledData(prev => ({
      ...prev,
      rrule
    }));
    setFormData(prev => ({
      ...prev,
      rrule
    }));
  };

  const handleExceptionChange = (exceptions) => {
    setScheduledData(prev => ({
      ...prev,
      exceptions
    }));
    setFormData(prev => ({
      ...prev,
      exceptions
    }));
  };

  const openCreateModal = () => {
    if (!isAdmin) {
      toast.error('Only administrators can create scheduled packages');
      return;
    }
    setEditingPackage(null);
    setFormData({
      user_id: '',
      package_id: '',
      caregiver_id: '',
      start_datetime: '',
      rrule: '',
      end_date: '',
      status: 'active',
      exceptions: []
    });
    setScheduledData({
      rrule: '',
      start_datetime: '',
      exceptions: []
    });
    setShowRecurrenceBuilder(false);
    setShowCalendarPreview(false);
    setShowModal(true);
  };

  const openEditModal = (pkg) => {
    if (!isAdmin) {
      toast.error('Only administrators can edit scheduled packages');
      return;
    }
    
    // Parse the start_datetime properly, handling timezone
    let parsedStartDatetime = '';
    if (pkg.start_datetime) {
      const date = new Date(pkg.start_datetime);
      // Convert to local timezone and format as YYYY-MM-DDTHH:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      parsedStartDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    setEditingPackage(pkg);
    setFormData({
      user_id: pkg.user_id || '',
      package_id: pkg.package_id || '',
      caregiver_id: pkg.caregiver_id || '',
      start_datetime: pkg.start_datetime || '',
      rrule: pkg.rrule || '',
      end_date: pkg.end_date || '',
      status: pkg.status || 'active',
      exceptions: pkg.exceptions || []
    });
    setScheduledData({
      rrule: pkg.rrule || '',
      start_datetime: parsedStartDatetime,
      exceptions: pkg.exceptions || []
    });
    setShowRecurrenceBuilder(false);
    setShowCalendarPreview(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convert the local datetime to ISO format with timezone
      let formattedStartDatetime = formData.start_datetime;
      if (scheduledData.start_datetime) {
        const date = new Date(scheduledData.start_datetime);
        formattedStartDatetime = date.toISOString();
      }
      
      const packageData = {
        user_id: parseInt(formData.user_id),
        package_id: parseInt(formData.package_id),
        caregiver_id: parseInt(formData.caregiver_id),
        start_datetime: formattedStartDatetime,
        rrule: formData.rrule,
        end_date: formData.end_date,
        status: formData.status,
        exceptions: formData.exceptions
      };

      if (editingPackage) {
        await scheduledPackagesAPI.update(editingPackage.id, packageData);
        toast.success('Scheduled package updated successfully');
      } else {
        await scheduledPackagesAPI.create(packageData);
        toast.success('Scheduled package created successfully');
      }
      
      setShowModal(false);
      setEditingPackage(null);
      fetchData();
    } catch (error) {
      console.error('Error saving scheduled package:', error);
      toast.error('Failed to save scheduled package');
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      toast.error('Only administrators can delete scheduled packages');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this scheduled package?')) {
      try {
        await scheduledPackagesAPI.delete(id);
        toast.success('Scheduled package deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting scheduled package:', error);
        toast.error('Failed to delete scheduled package');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!isAdmin) {
      toast.error('Only administrators can change package status');
      return;
    }
    
    try {
      await scheduledPackagesAPI.update(id, { status: newStatus });
      toast.success('Status updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
      case 'paused':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Paused</span>;
      case 'cancelled':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
      case 'completed':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Completed</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const formatRRule = (rrule) => {
    if (!rrule) return 'No recurrence';
    
    // Simple formatting for display
    if (rrule.includes('FREQ=DAILY')) return 'Daily';
    if (rrule.includes('FREQ=WEEKLY')) return 'Weekly';
    if (rrule.includes('FREQ=MONTHLY')) return 'Monthly';
    if (rrule.includes('FREQ=YEARLY')) return 'Yearly';
    
    return 'Custom';
  };

  const getCustomerById = (user_id) => {
    return users.find(user => user.id === user_id);
  };

  const getCaregiverById = (user_id) => {
    return caregivers.find(caregiver => parseInt(caregiver.user_id) === parseInt(user_id));
  };

  const getPackageById = (packageId) => {
    return packages.find(pkg => pkg.id === packageId);
  };

  const filteredScheduledPackages = scheduledPackages.filter(sp => {
    const customer = getCustomerById(sp.user_id);
    const caregiver = getCaregiverById(sp.caregiver_id);
    const pkg = getPackageById(sp.package_id);
    
    const matchesSearch = (customer?.first_name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (customer?.last_name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (caregiver?.first_name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (caregiver?.last_name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (pkg?.name || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesStatus = filterStatus === 'all' || sp.status === filterStatus;
    return matchesSearch && matchesStatus;
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
                  <span className="text-gray-500">Scheduled Packages</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Scheduled Packages</h1>
              <p className="text-gray-600">Manage recurring service packages and schedules</p>
            </div>
            {isAdmin && (
              <button
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                data-action="add-scheduled-package"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule Package</span>
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scheduled</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.total}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">${metrics.totalRevenue.toFixed(0)}</p>
                <p className="text-sm text-purple-600 mt-1">Total value</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.averageDuration.toFixed(1)}h</p>
                <p className="text-sm text-orange-600 mt-1">Per package</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
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
                placeholder="Search scheduled packages..."
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
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">
                {filteredScheduledPackages.length} of {scheduledPackages.length} scheduled packages
              </span>
            </div>
          </div>
        </div>

        {/* Scheduled Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScheduledPackages.map((scheduledPackage) => {
            const customer = getCustomerById(scheduledPackage.user_id);
            const caregiver = getCaregiverById(scheduledPackage.caregiver_id);
            const pkg = getPackageById(scheduledPackage.package_id);
            
            return (
              <div key={scheduledPackage.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {pkg?.name || 'Unknown Package'}
                        </h3>
                        <p className="text-sm text-gray-500">ID: {scheduledPackage.id}</p>
                      </div>
                    </div>
                    {getStatusBadge(scheduledPackage.status)}
                  </div>

                  {/* Package Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown Customer'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {caregiver ? `${caregiver.first_name} ${caregiver.last_name}` : 'No Caregiver Assigned'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatRRule(scheduledPackage.rrule)}
                    </div>
                    {pkg && (
                      <div className="flex items-center text-sm text-green-600 font-semibold">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ${pkg.total_cost}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => openEditModal(scheduledPackage)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Edit Scheduled Package"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(scheduledPackage.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Delete Scheduled Package"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredScheduledPackages.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No scheduled packages found</p>
            <p className="text-gray-400">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={editingPackage ? 'Edit Scheduled Package' : 'Schedule New Package'}
            size="lg"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Package and Customer Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Package & Customer Selection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                    <select
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Customer</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package *</label>
                    <select
                      name="package_id"
                      value={formData.package_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Package</option>
                      {packages.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} - ${pkg.total_cost} ({pkg.duration_hours}h)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Caregiver Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Caregiver Selection
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Select a specific caregiver for this scheduled package. If no caregiver is selected, the system will assign the best available caregiver.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* No preference option */}
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        parseInt(formData.caregiver_id) === 0
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        caregiver_id: ''
                      }))}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900">
                            No Preference
                          </h3>
                          <p className="text-xs text-gray-500">
                            Auto-assign best caregiver
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            System will match with most suitable caregiver.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {caregivers.map((caregiver) => (
                      <div
                        key={caregiver.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          parseInt(formData.caregiver_id) === parseInt(caregiver.user_id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          caregiver_id: parseInt(prev.caregiver_id) === parseInt(caregiver.user_id) ? '' : caregiver.user_id.toString()
                        }))}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <Avatar
                              src={caregiver.avatar_url}
                              name={`${caregiver.first_name} ${caregiver.last_name}`}
                              size="md"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900">
                              {caregiver.first_name} {caregiver.last_name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {caregiver.years_experience} years experience
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-yellow-600">★</span>
                              <span className="text-xs text-gray-600 ml-1">
                                {caregiver.rating} ({caregiver.total_reviews} reviews)
                              </span>
                            </div>
                            <p className="text-xs text-blue-600 font-medium mt-1">
                              ${caregiver.hourly_rate}/hr
                            </p>
                          </div>
                        </div>
                        {caregiver.bio && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {caregiver.bio}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Schedule Configuration */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Schedule Configuration
                </h3>
                
                {/* Start Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={scheduledData.start_datetime ? scheduledData.start_datetime.split('T')[0] : ''}
                      onChange={(e) => {
                        const time = scheduledData.start_datetime ? scheduledData.start_datetime.split('T')[1] : '09:00';
                        const newStartDatetime = `${e.target.value}T${time}`;
                        setScheduledData(prev => ({
                          ...prev,
                          start_datetime: newStartDatetime
                        }));
                        setFormData(prev => ({
                          ...prev,
                          start_datetime: newStartDatetime
                        }));
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={scheduledData.start_datetime ? scheduledData.start_datetime.split('T')[1] : '09:00'}
                      onChange={(e) => {
                        const date = scheduledData.start_datetime ? scheduledData.start_datetime.split('T')[0] : new Date().toISOString().split('T')[0];
                        const newStartDatetime = `${date}T${e.target.value}`;
                        setScheduledData(prev => ({
                          ...prev,
                          start_datetime: newStartDatetime
                        }));
                        setFormData(prev => ({
                          ...prev,
                          start_datetime: newStartDatetime
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Recurrence Builder */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recurrence Pattern</h3>
                    <button
                      type="button"
                      onClick={() => setShowRecurrenceBuilder(!showRecurrenceBuilder)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {showRecurrenceBuilder ? 'Hide Builder' : 'Show Builder'}
                    </button>
                  </div>
                  
                  {showRecurrenceBuilder && (
                    <RecurrenceBuilder
                      onRecurrenceChange={handleRecurrenceChange}
                      initialValue={scheduledData.rrule}
                    />
                  )}
                  
                  {scheduledData.rrule && !showRecurrenceBuilder && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 font-medium">Current Pattern:</p>
                      <p className="text-blue-700">{scheduledData.rrule}</p>
                    </div>
                  )}
                </div>

                {/* Calendar Preview */}
                {scheduledData.rrule && scheduledData.start_datetime && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Calendar Preview</h3>
                      <button
                        type="button"
                        onClick={() => setShowCalendarPreview(!showCalendarPreview)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {showCalendarPreview ? 'Hide Preview' : 'Show Preview'}
                      </button>
                    </div>
                    
                    {showCalendarPreview && (
                      <CalendarPreview
                        rrule={scheduledData.rrule}
                        startDate={scheduledData.start_datetime}
                        exceptions={scheduledData.exceptions}
                        onExceptionChange={handleExceptionChange}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Status and End Date */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Package Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Leave empty for no end date"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              {formData.package_id && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Package Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Package:</span> {packages.find(p => p.id === parseInt(formData.package_id))?.name}</p>
                      <p><span className="font-medium">Cost:</span> ${packages.find(p => p.id === parseInt(formData.package_id))?.total_cost}</p>
                      <p><span className="font-medium">Duration:</span> {packages.find(p => p.id === parseInt(formData.package_id))?.duration_hours} hours</p>
                      <p><span className="font-medium">Status:</span> {formData.status}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Start Date:</span> {scheduledData.start_datetime ? scheduledData.start_datetime.split('T')[0] : ''}</p>
                      <p><span className="font-medium">Start Time:</span> {scheduledData.start_datetime ? scheduledData.start_datetime.split('T')[1] : ''}</p>
                      <p><span className="font-medium">Customer:</span> {users.find(u => u.id === parseInt(formData.user_id))?.first_name} {users.find(u => u.id === parseInt(formData.user_id))?.last_name}</p>
                      <p><span className="font-medium">Caregiver:</span> {formData.caregiver_id ? caregivers.find(c => parseInt(c.user_id) === parseInt(formData.caregiver_id))?.first_name + ' ' + caregivers.find(c => parseInt(c.user_id) === parseInt(formData.caregiver_id))?.last_name : 'Auto-assign'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  data-action="save"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default AdminScheduledPackages; 