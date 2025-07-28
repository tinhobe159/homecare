import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { packagesAPI, servicesAPI } from '../../services/api';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Clock, DollarSign, ArrowRight, Package } from 'lucide-react';

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesRes, servicesRes] = await Promise.all([
        packagesAPI.getAll(),
        servicesAPI.getAll()
      ]);

      setPackages(packagesRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const getPackageServices = (packageId) => {
    const packageData = packages.find(pkg => pkg.package_id === packageId);
    const serviceIds = packageData?.serviceIds || [];
    return services.filter(service => 
      serviceIds && Array.isArray(serviceIds) && 
      serviceIds.includes(service.service_id) && service.is_active
    );
  };

  const filteredPackages = packages.filter(pkg =>
    (pkg.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (pkg.description || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Care Packages</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from our comprehensive care packages designed to meet your specific needs
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search packages..."
            className="max-w-md mx-auto"
          />
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Packages Grid */}
        {filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => {
              const pkgServices = getPackageServices(pkg.package_id);
              const totalDuration = pkgServices.reduce((sum, service) => sum + service.duration, 0);

              return (
                <div key={pkg.package_id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 overflow-hidden group">
                  <div className="p-6">
                    {/* Package Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                          {pkg.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">{pkg.code}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">${pkg.total_cost}</div>
                        <div className="text-sm text-gray-500">per session</div>
                      </div>
                    </div>

                    {/* Package Description */}
                    <p className="text-gray-600 mb-6">{pkg.description}</p>

                    {/* Services Summary */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Included Services ({pkgServices.length})</h4>
                      <div className="space-y-2">
                        {pkgServices.slice(0, 3).map((service) => (
                          <div key={service.service_id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{service.name}</span>
                            <div className="flex items-center space-x-2 text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{service.duration}min</span>
                              <DollarSign className="h-3 w-3" />
                              <span>${service.hourly_rate}</span>
                            </div>
                          </div>
                        ))}
                        {pkgServices.length > 3 && (
                          <div className="text-sm text-gray-500 italic">
                            +{pkgServices.length - 3} more service{pkgServices.length - 3 !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Package Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-6 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{totalDuration} min total</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4" />
                        <span>{pkgServices.length} services</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <Link
                        to={`/packages/${pkg.package_id}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/book?package=${pkg.package_id}`}
                        className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg text-center font-medium transition-colors duration-200"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center bg-blue-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Need a Custom Care Plan?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our packages can be customized to meet your specific needs. Contact us to discuss your requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Schedule Consultation
            </Link>
            <a
              href="tel:555-123-4567"
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Call (555) 123-4567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagesPage;