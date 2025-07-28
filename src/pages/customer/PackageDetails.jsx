import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { packagesAPI, servicesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { ArrowLeft, Clock, DollarSign, Check, Calendar, Package } from 'lucide-react';

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackageDetails();
  }, [id]);

  const fetchPackageDetails = async () => {
    try {
      console.log('Fetching package details for ID:', id);
      
      const [packageRes, servicesRes] = await Promise.all([
        packagesAPI.getById(id),
        servicesAPI.getAll()
      ]);

      console.log('Package response:', packageRes);
      console.log('Services response:', servicesRes);

      if (!packageRes.data) {
        console.error('Package not found for ID:', id);
        toast.error('Package not found');
        navigate('/packages');
        return;
      }

      setPackageData(packageRes.data);

      // Get services for this package using serviceIds array
      const serviceIds = packageRes.data.serviceIds || [];
      console.log('Service IDs for package:', serviceIds);
      
      const packageServices = servicesRes.data.filter(service => 
        serviceIds && Array.isArray(serviceIds) && 
        serviceIds.includes(service.service_id) && service.is_active
      );
      
      console.log('Filtered services:', packageServices);
      setServices(packageServices);
    } catch (error) {
      console.error('Error fetching package details:', error);
      console.error('Error details:', error.response?.data, error.response?.status);
      toast.error('Failed to load package details');
      navigate('/packages');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Package not found</h2>
          <Link to="/packages" className="text-blue-600 hover:text-blue-700">
            Back to packages
          </Link>
        </div>
      </div>
    );
  }

  const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/packages"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Packages</span>
          </Link>
        </div>

        {/* Package Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{packageData.name}</h1>
                <p className="text-blue-100 text-lg mb-4">{packageData.description}</p>
                <div className="flex items-center space-x-4 text-blue-100">
                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4" />
                    <span>{packageData.code}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{totalDuration} minutes total</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold mb-1">${packageData.total_cost}</div>
                <div className="text-blue-200">per session</div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Included */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Services Included ({services.length})
          </h2>
          
          <div className="grid gap-6">
            {services.map((service) => (
              <div key={service.service_id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{service.code}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>${service.hourly_rate}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{service.description}</p>
                <div className="mt-3 flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Included in package</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Package Summary */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Package Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{services.length}</div>
              <div className="text-gray-600">Services Included</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{totalDuration}</div>
              <div className="text-gray-600">Total Minutes</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">${packageData.total_cost}</div>
              <div className="text-gray-600">Session Cost</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Book This Package?</h3>
            <p className="text-gray-600 mb-6">
              Schedule your consultation or book this package directly with one of our certified caregivers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`/book?package=${packageData.package_id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Calendar className="h-5 w-5" />
                <span>Book This Package</span>
              </Link>
              <Link
                to="/caregivers"
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                View Caregivers
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 text-center bg-gray-100 rounded-xl p-6">
          <p className="text-gray-600 mb-4">
            Have questions about this package or need customization?
          </p>
          <a
            href="tel:555-123-4567"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Call us at (555) 123-4567
          </a>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;