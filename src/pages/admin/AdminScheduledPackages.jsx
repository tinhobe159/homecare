import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Package, Edit, Trash2, Play, Pause, X, Eye } from 'lucide-react';
import { scheduledPackagesAPI, packagesAPI, usersAPI, userRolesAPI, caregiversAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showRecurrenceBuilder, setShowRecurrenceBuilder] = useState(false);
  const [showCalendarPreview, setShowCalendarPreview] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecurrenceChange = (rrule) => {
    setFormData(prev => ({
      ...prev,
      rrule
    }));
  };

  const handleExceptionChange = (exceptions) => {
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
    setShowModal(true);
  };

  const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      user_id: pkg.user_id.toString(),
      package_id: pkg.package_id.toString(),
      caregiver_id: pkg.caregiver_id ? pkg.caregiver_id.toString() : '',
      start_datetime: pkg.start_datetime,
      rrule: pkg.rrule,
      end_date: pkg.end_date,
      status: pkg.status,
      exceptions: pkg.exceptions || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.user_id || !formData.package_id || !formData.start_datetime || !formData.rrule) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const submitData = {
        user_id: parseInt(formData.user_id),
        package_id: parseInt(formData.package_id),
        caregiver_id: formData.caregiver_id ? parseInt(formData.caregiver_id) : null,
        start_datetime: formData.start_datetime,
        rrule: formData.rrule,
        end_date: formData.end_date,
        status: formData.status,
        exceptions: formData.exceptions
      };

      if (editingPackage) {
        await scheduledPackagesAPI.update(editingPackage.id, submitData);
        toast.success('Scheduled package updated successfully');
      } else {
        await scheduledPackagesAPI.create(submitData);
        toast.success('Scheduled package created successfully');
      }

      setShowModal(false);
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
    try {
      await scheduledPackagesAPI.update(id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: <Play className="h-4 w-4" /> },
      paused: { color: 'bg-yellow-100 text-yellow-800', icon: <Pause className="h-4 w-4" /> },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <X className="h-4 w-4" /> }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-4 w-4" /> };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  const formatRRule = (rrule) => {
    if (!rrule) return 'No recurrence';
    
    // Simple formatting for common RRULE patterns
    if (rrule.includes('FREQ=DAILY')) return 'Daily';
    if (rrule.includes('FREQ=WEEKLY')) return 'Weekly';
    if (rrule.includes('FREQ=MONTHLY')) return 'Monthly';
    if (rrule.includes('FREQ=YEARLY')) return 'Yearly';
    
    return 'Custom recurrence';
  };

  const getCustomerById = (userId) => {
    return users.find(user => user.id === userId);
  };

  const getCaregiverById = (userId) => {
    return caregivers.find(caregiver => caregiver.id === userId);
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scheduled Packages</h1>
          <p className="text-gray-600">Manage recurring care packages and schedules</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">All Scheduled Packages</h2>
              {isAdmin && (
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create New Schedule
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caregiver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
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
                {scheduledPackages.map((pkg) => {
                  const customer = getCustomerById(pkg.user_id);
                  const packageData = packages.find(p => p.id === pkg.package_id);
                  const caregiver = getCaregiverById(pkg.caregiver_id);
                  
                  return (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={customer?.avatar_url || 'https://via.placeholder.com/40'}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">{customer?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{packageData?.name}</div>
                        <div className="text-sm text-gray-500">${packageData?.total_cost}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {caregiver ? (
                          <div className="flex items-center">
                            <img
                              className="h-8 w-8 rounded-full"
                              src={caregiver.avatar_url || 'https://via.placeholder.com/32'}
                              alt=""
                            />
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">
                                {caregiver.first_name} {caregiver.last_name}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            {new Date(pkg.start_datetime).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">
                            {new Date(pkg.start_datetime).toLocaleTimeString()}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatRRule(pkg.rrule)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pkg.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingPackage(pkg);
                              setShowCalendarPreview(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Calendar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openEditModal(pkg)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {pkg.status === 'active' && (
                                <button
                                  onClick={() => handleStatusChange(pkg.id, 'paused')}
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Pause"
                                >
                                  <Pause className="w-4 h-4" />
                                </button>
                              )}
                              {pkg.status === 'paused' && (
                                <button
                                  onClick={() => handleStatusChange(pkg.id, 'active')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Resume"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              )}
                              {pkg.status === 'cancelled' && (
                                <button
                                  onClick={() => handleStatusChange(pkg.id, 'active')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Reactivate"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              )}
                              {(pkg.status === 'active' || pkg.status === 'paused') && (
                                <button
                                  onClick={() => handleStatusChange(pkg.id, 'cancelled')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(pkg.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingPackage ? 'Edit Scheduled Package' : 'Create Scheduled Package'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
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
                      {user.first_name} {user.last_name} - {user.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package *
                </label>
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
                      {pkg.name} - ${pkg.total_cost}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caregiver (Optional)
                </label>
                <select
                  name="caregiver_id"
                  value={formData.caregiver_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No preference</option>
                  {caregivers.map(caregiver => (
                    <option key={caregiver.id} value={caregiver.id}>
                      {caregiver.first_name} {caregiver.last_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_datetime.split('T')[0] || ''}
                  onChange={(e) => {
                    const time = formData.start_datetime.split('T')[1] || '09:00';
                    setFormData(prev => ({
                      ...prev,
                      start_datetime: `${e.target.value}T${time}`
                    }));
                  }}
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
                  value={formData.start_datetime.split('T')[1] || '09:00'}
                  onChange={(e) => {
                    const date = formData.start_datetime.split('T')[0] || new Date().toISOString().split('T')[0];
                    setFormData(prev => ({
                      ...prev,
                      start_datetime: `${date}T${e.target.value}`
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Recurrence Pattern *
                </label>
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
                  initialValue={formData.rrule}
                />
              )}
              
              {formData.rrule && !showRecurrenceBuilder && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium">Current Pattern:</p>
                  <p className="text-blue-700">{formData.rrule}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingPackage ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Calendar Preview Modal */}
        <Modal
          isOpen={showCalendarPreview}
          onClose={() => setShowCalendarPreview(false)}
          title="Schedule Preview"
          size="lg"
        >
          {editingPackage && (
            <CalendarPreview
              rrule={editingPackage.rrule}
              startDate={editingPackage.start_datetime}
              exceptions={editingPackage.exceptions || []}
              onExceptionChange={handleExceptionChange}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminScheduledPackages; 