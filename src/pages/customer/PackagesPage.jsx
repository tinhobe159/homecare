import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { packagesAPI, servicesAPI } from '../../services/api';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Clock, DollarSign, ArrowRight, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    const packageData = packages.find(pkg => pkg.id === packageId);
    const serviceIds = packageData?.serviceIds || [];
    return services.filter(service => 
      serviceIds && Array.isArray(serviceIds) && 
              serviceIds.includes(service.id) && service.is_active
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
              const pkgServices = getPackageServices(pkg.id);
              const totalDuration = pkgServices.reduce((sum, service) => sum + service.duration, 0);

              return (
                <Card key={pkg.id} className="hover:shadow-lg transition-all duration-200 group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="group-hover:text-blue-600 transition-colors duration-200">
                          {pkg.name}
                        </CardTitle>
                        <CardDescription className="text-sm font-medium">{pkg.code}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">${pkg.total_cost}</div>
                        <div className="text-sm text-muted-foreground">per session</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Package Description */}
                    <p className="text-muted-foreground">{pkg.description}</p>

                    {/* Services Summary */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Included Services ({pkgServices.length})</h4>
                      <div className="space-y-2">
                        {pkgServices.slice(0, 3).map((service) => (
                          <div key={service.id} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{service.name}</span>
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{service.duration}min</span>
                              <DollarSign className="h-3 w-3" />
                              <span>${service.hourly_rate}</span>
                            </div>
                          </div>
                        ))}
                        {pkgServices.length > 3 && (
                          <div className="text-sm text-muted-foreground italic">
                            +{pkgServices.length - 3} more service{pkgServices.length - 3 !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Package Stats */}
                    <div className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
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
                      <Button asChild variant="default" className="flex-1">
                        <Link to={`/packages/${pkg.id}`}>
                          <span>View Details</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="flex-1">
                        <Link to={`/book?package=${pkg.id}`}>
                          Book Now
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <Card className="mt-16 text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4">Need a Custom Care Plan?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our packages can be customized to meet your specific needs. Contact us to discuss your requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/book">
                  Schedule Consultation
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="tel:555-123-4567">
                  Call (555) 123-4567
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PackagesPage;