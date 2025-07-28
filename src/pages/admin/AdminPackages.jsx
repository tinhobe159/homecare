import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { packagesAPI, servicesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    total_cost: '',
    duration_hours: '',
    is_active: true,
    serviceIds: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesResponse, servicesResponse] = await Promise.all([
        packagesAPI.getAll(),
        servicesAPI.getAll()
      ]);
      setPackages(packagesResponse.data);
      setServices(servicesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load packages data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.serviceIds.length === 0) {
      toast.error('Please select at least one service');
      return;
    }
    
    try {
      const packageData = {
        name: formData.name,
        description: formData.description,
        code: formData.code,
        total_cost: parseFloat(formData.total_cost),
        duration_hours: parseInt(formData.duration_hours),
        is_active: formData.is_active,
        serviceIds: formData.serviceIds,
        created_at: new Date().toISOString()
      };

      if (editingPackage) {
        await packagesAPI.update(editingPackage.package_id, packageData);
        toast.success('Package updated successfully');
      } else {
        await packagesAPI.create(packageData);
        toast.success('Package created successfully');
      }
      
      setShowModal(false);
      setEditingPackage(null);
      setFormData({ 
        name: '', 
        description: '', 
        code: '', 
        total_cost: '', 
        duration_hours: '', 
        is_active: true,
        serviceIds: []
      });
      fetchData();
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error('Failed to save package');
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      code: pkg.code,
      total_cost: pkg.total_cost?.toString() || '',
      duration_hours: pkg.duration_hours?.toString() || '',
      is_active: pkg.is_active,
      serviceIds: pkg.serviceIds || []
    });
    setShowModal(true);
  };

  const handleDelete = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await packagesAPI.delete(packageId);
        toast.success('Package deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting package:', error);
        toast.error('Failed to delete package');
      }
    }
  };

  const getServiceNames = (serviceIds) => {
    if (!serviceIds || !Array.isArray(serviceIds)) {
      return 'No services selected';
    }
    return serviceIds.map(id => {
      const service = services.find(s => s.service_id === id);
      return service ? service.name : 'Unknown';
    }).join(', ');
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = (pkg.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (pkg.code || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    return matchesSearch;
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
                <Package className="h-6 w-6 mr-2" />
                Package Management
              </h1>
              <p className="text-gray-600 mt-1">Manage your care packages</p>
            </div>
            <button
              onClick={() => {
                setEditingPackage(null);
                setFormData({ name: '', description: '', code: '', total_cost: '', duration_hours: '', is_active: true, serviceIds: [] });
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">
                {filteredPackages.length} of {packages.length} packages
              </span>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div key={pkg.package_id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                      <p className="text-sm text-gray-500">Code: {pkg.code}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {pkg.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Package Details */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">{pkg.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration: {pkg.duration_hours} hours</span>
                    <span className="text-green-600 font-semibold">${pkg.total_cost}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>Services:</strong> {getServiceNames(pkg.serviceIds)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.package_id)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingPackage ? 'Edit Package' : 'Add New Package'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Package Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Package Code</label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Cost ($)</label>
                      <input
                        type="number"
                        name="total_cost"
                        value={formData.total_cost}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (hours)</label>
                    <input
                      type="number"
                      name="duration_hours"
                      value={formData.duration_hours}
                      onChange={handleInputChange}
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Services</label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                      {services.map(service => (
                        <div key={service.service_id} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id={`service-${service.service_id}`}
                            checked={formData.serviceIds.includes(service.service_id)}
                            onChange={() => handleServiceToggle(service.service_id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`service-${service.service_id}`} className="ml-2 text-sm text-gray-700">
                            {service.name} - ${service.hourly_rate}/hr
                          </label>
                        </div>
                      ))}
                    </div>
                    {formData.serviceIds.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">Please select at least one service</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">Active</label>
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
                      {editingPackage ? 'Update' : 'Create'}
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

export default AdminPackages; 