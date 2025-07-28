import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Heart, Users, Calendar } from 'lucide-react';
import { carePlansAPI, customersAPI, caregiversAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminCarePlans = () => {
  const [carePlans, setCarePlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCarePlan, setEditingCarePlan] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    caregiver_id: '',
    plan_name: '',
    description: '',
    start_date: '',
    end_date: '',
    frequency: 'daily',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [carePlansResponse, customersResponse, caregiversResponse] = await Promise.all([
        carePlansAPI.getAll(),
        customersAPI.getAll(),
        caregiversAPI.getAll()
      ]);
      setCarePlans(carePlansResponse.data);
      setCustomers(customersResponse.data);
      setCaregivers(caregiversResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load care plans data');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const carePlanData = {
        customer_id: formData.customer_id,
        caregiver_id: formData.caregiver_id,
        plan_name: formData.plan_name,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        frequency: formData.frequency,
        status: formData.status,
        created_at: new Date().toISOString()
      };

      if (editingCarePlan) {
        await carePlansAPI.update(editingCarePlan.care_plan_id, carePlanData);
        toast.success('Care plan updated successfully');
      } else {
        await carePlansAPI.create(carePlanData);
        toast.success('Care plan created successfully');
      }
      
      setShowModal(false);
      setEditingCarePlan(null);
      setFormData({
        customer_id: '',
        caregiver_id: '',
        plan_name: '',
        description: '',
        start_date: '',
        end_date: '',
        frequency: 'daily',
        status: 'active'
      });
      fetchData();
    } catch (error) {
      console.error('Error saving care plan:', error);
      toast.error('Failed to save care plan');
    }
  };

  const handleEdit = (carePlan) => {
    setEditingCarePlan(carePlan);
    setFormData({
      customer_id: carePlan.customer_id,
      caregiver_id: carePlan.caregiver_id,
      plan_name: carePlan.plan_name,
      description: carePlan.description,
      start_date: carePlan.start_date,
      end_date: carePlan.end_date,
      frequency: carePlan.frequency,
      status: carePlan.status
    });
    setShowModal(true);
  };

  const handleDelete = async (carePlanId) => {
    if (window.confirm('Are you sure you want to delete this care plan?')) {
      try {
        await carePlansAPI.delete(carePlanId);
        toast.success('Care plan deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting care plan:', error);
        toast.error('Failed to delete care plan');
      }
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.customer_id === customerId);
    return customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown Customer';
  };

  const getCaregiverName = (caregiverId) => {
    const caregiver = caregivers.find(c => c.id === caregiverId);
    return caregiver ? `${caregiver.firstName} ${caregiver.lastName}` : 'Unknown Caregiver';
  };

  const filteredCarePlans = carePlans.filter(plan => {
    const matchesSearch = (plan.plan_name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         getCustomerName(plan.customer_id).toLowerCase().includes((searchTerm || '').toLowerCase());
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
                <Heart className="h-6 w-6 mr-2" />
                Care Plan Management
              </h1>
              <p className="text-gray-600 mt-1">Manage personalized care plans for customers</p>
            </div>
            <button
              onClick={() => {
                setEditingCarePlan(null);
                setFormData({
                  customer_id: '',
                  caregiver_id: '',
                  plan_name: '',
                  description: '',
                  start_date: '',
                  end_date: '',
                  frequency: 'daily',
                  status: 'active'
                });
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Care Plan
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
                placeholder="Search care plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">
                {filteredCarePlans.length} of {carePlans.length} care plans
              </span>
            </div>
          </div>
        </div>

        {/* Care Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCarePlans.map((plan) => (
            <div key={plan.care_plan_id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{plan.plan_name}</h3>
                      <p className="text-sm text-gray-500">ID: {plan.care_plan_id}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {plan.status}
                  </span>
                </div>

                {/* Care Plan Details */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">{plan.description}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Customer: {getCustomerName(plan.customer_id)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Caregiver: {getCaregiverName(plan.caregiver_id)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Frequency: {plan.frequency}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.care_plan_id)}
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
                  {editingCarePlan ? 'Edit Care Plan' : 'Add New Care Plan'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                    <input
                      type="text"
                      name="plan_name"
                      value={formData.plan_name}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <select
                      name="customer_id"
                      value={formData.customer_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Customer</option>
                      {customers.map(customer => (
                        <option key={customer.customer_id} value={customer.customer_id}>
                          {customer.first_name} {customer.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Caregiver</label>
                    <select
                      name="caregiver_id"
                      value={formData.caregiver_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Caregiver</option>
                      {caregivers.map(caregiver => (
                        <option key={caregiver.id} value={caregiver.id}>
                          {caregiver.firstName} {caregiver.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Frequency</label>
                      <select
                        name="frequency"
                        value={formData.frequency}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="completed">Completed</option>
                      </select>
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
                      {editingCarePlan ? 'Update' : 'Create'}
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

export default AdminCarePlans; 