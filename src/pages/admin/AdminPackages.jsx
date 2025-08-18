import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, Search, Package, 
  DollarSign, Clock, Activity, Star, TrendingUp,
  BarChart3, Settings
} from 'lucide-react';
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
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    averageCost: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    service_ids: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateMetrics();
  }, [packages]);

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

  const calculateMetrics = () => {
    const total = packages.length;
    const active = packages.filter(p => p.is_active).length;
    const totalCost = packages.reduce((sum, p) => sum + (p.total_cost || 0), 0);
    const averageCost = total > 0 ? totalCost / total : 0;
    
    // Mock revenue and rating (in real app, this would come from actual data)
    const totalRevenue = totalCost * 1.3; // 30% markup
    const averageRating = 4.4;

    setMetrics({
      total,
      active,
      averageCost,
      totalRevenue,
      averageRating
    });
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
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter(id => id !== serviceId)
        : [...prev.service_ids, serviceId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.service_ids.length === 0) {
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
        service_ids: formData.service_ids,
        created_at: new Date().toISOString()
      };

      if (editingPackage) {
        await packagesAPI.update(editingPackage.id, packageData);
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
    if (!serviceIds || serviceIds.length === 0) {
      return 'No services';
    }
    
    return serviceIds.map(serviceId => {
      const service = services.find(s => s.id === serviceId);
      return service ? service.name : 'Unknown Service';
    }).join(', ');
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         pkg.description.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         pkg.code.toLowerCase().includes((searchTerm || '').toLowerCase());
    return matchesSearch;
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
                  <span className="text-gray-500">Package Management</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Package Management</h1>
              <p className="text-gray-600">Manage service packages and pricing</p>
            </div>
            <button
              onClick={() => {
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
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              data-action="add-package"
            >
              <Plus className="h-4 w-4" />
              <span>Add Package</span>
            </button>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Packages</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.total}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Avg Cost</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">${metrics.averageCost.toFixed(2)}</p>
                <p className="text-sm text-purple-600 mt-1">Per package</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">${metrics.totalRevenue.toFixed(0)}</p>
                <p className="text-sm text-orange-600 mt-1">Total generated</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.averageRating}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-action="search"
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
            <div key={pkg.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {pkg.duration_hours} hours
                    </div>
                    <div className="flex items-center text-sm text-green-600 font-semibold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${pkg.total_cost}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>Services:</strong> {getServiceNames(pkg.serviceIds)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    title="Edit Package"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    title="Delete Package"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No packages found</p>
            <p className="text-gray-400">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingPackage ? 'Edit Package' : 'Add New Package'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="is_active"
                        value={formData.is_active.toString()}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                      {services.map((service) => (
                        <label key={service.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.serviceIds.includes(service.id)}
                            onChange={() => handleServiceToggle(service.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{service.name}</span>
                        </label>
                      ))}
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
                      data-action="save"
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