import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  appointmentsAPI, 
  taskPackagesAPI, 
  taskPackageServicesAPI, 
  servicesAPI,
  customersAPI 
} from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Heart, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  FileText,
  AlertCircle,
  ChevronRight,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CaregiverCarePlans = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [taskPackages, setTaskPackages] = useState([]);
  const [taskPackageServices, setTaskPackageServices] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchCarePlans();
    }
  }, [currentUser]);

  const fetchCarePlans = async () => {
    try {
      // Fetch all necessary data
      const [
        appointmentsRes,
        taskPackagesRes,
        taskPackageServicesRes,
        servicesRes,
        customersRes
      ] = await Promise.all([
        appointmentsAPI.getAll(),
        taskPackagesAPI.getAll(),
        taskPackageServicesAPI.getAll(),
        servicesAPI.getAll(),
        customersAPI.getAll()
      ]);

      // Filter appointments for this caregiver
      const caregiverAppointments = appointmentsRes.data.filter(
        apt => apt.caregiver_id === currentUser.id
      );

      setAppointments(caregiverAppointments);
      setTaskPackages(taskPackagesRes.data || []);
      setTaskPackageServices(taskPackageServicesRes.data || []);
      setServices(servicesRes.data);
      setCustomers(customersRes.data);

    } catch (error) {
      console.error('Error fetching care plans:', error);
      toast.error('Failed to load care plans');
    } finally {
      setLoading(false);
    }
  };

  // Get unique customers for this caregiver
  const getCaregiverCustomers = () => {
    const customerIds = [...new Set(appointments.map(apt => apt.customer_id))];
    return customers.filter(customer => customerIds.includes(customer.id));
  };

  // Get task packages for a specific customer
  const getCustomerTaskPackages = (customerId) => {
    return taskPackages.filter(pkg => pkg.customer_id === customerId);
  };

  // Get services for a task package
  const getTaskPackageServices = (taskPackageId) => {
    const serviceIds = taskPackageServices
      .filter(tps => tps.task_package_id === taskPackageId)
      .map(tps => tps.service_id);
    
    return services.filter(service => serviceIds.includes(service.id));
  };

  // Get active appointments for customer
  const getCustomerActiveAppointments = (customerId) => {
    const now = new Date();
    return appointments.filter(apt => 
      apt.customer_id === customerId && 
      new Date(apt.appointment_date + 'T' + apt.appointment_time) >= now
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Care Plans</h1>
                <p className="text-gray-600">Manage task packages and care requirements for your clients</p>
              </div>
            </div>
            <Link
              to="/caregiver/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getCaregiverCustomers().length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Care Plans Assigned</h3>
            <p className="text-gray-600">You don't have any care plans assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Your Clients</h2>
                </div>
                <div className="p-6 space-y-4">
                  {getCaregiverCustomers().map((customer) => {
                    const activeAppointments = getCustomerActiveAppointments(customer.id);
                    const taskPackages = getCustomerTaskPackages(customer.id);
                    
                    return (
                      <div
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className={`p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors ${
                          selectedCustomer?.id === customer.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">
                              {customer.first_name} {customer.last_name}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Target className="h-3 w-3 mr-1" />
                            {taskPackages.length} task package(s)
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {activeAppointments.length} upcoming visit(s)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Care Plan Details */}
            <div className="lg:col-span-2">
              {selectedCustomer ? (
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {selectedCustomer.first_name} {selectedCustomer.last_name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="font-medium">{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <p className="font-medium">{selectedCustomer.phone_number}</p>
                      </div>
                    </div>
                  </div>

                  {/* Task Packages */}
                  {getCustomerTaskPackages(selectedCustomer.id).map((taskPackage) => {
                    const packageServices = getTaskPackageServices(taskPackage.id);
                    
                    return (
                      <div key={taskPackage.id} className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {taskPackage.name}
                              </h4>
                              <p className="text-gray-600 mt-1">{taskPackage.description}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm rounded-full ${
                              taskPackage.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : taskPackage.status === 'paused'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {taskPackage.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h5 className="font-medium text-gray-900 mb-4">Care Tasks</h5>
                          {packageServices.length === 0 ? (
                            <p className="text-gray-500">No tasks assigned to this package</p>
                          ) : (
                            <div className="space-y-3">
                              {packageServices.map((service) => (
                                <div
                                  key={service.id}
                                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                                >
                                  <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                                      <Heart className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{service.name}</p>
                                      <p className="text-sm text-gray-600">{service.description}</p>
                                      <p className="text-xs text-gray-500">
                                        Duration: {service.duration} min | Rate: ${service.hourly_rate}/hr
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-full">
                                      <CheckCircle className="h-5 w-5" />
                                    </button>
                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                                      <FileText className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {getCustomerTaskPackages(selectedCustomer.id).length === 0 && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Task Packages
                      </h3>
                      <p className="text-gray-600">
                        This client doesn't have any task packages assigned yet.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Client
                  </h3>
                  <p className="text-gray-600">
                    Choose a client from the list to view their care plans and task packages.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaregiverCarePlans;
