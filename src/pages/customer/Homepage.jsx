import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Shield, Heart, ArrowRight, Star, Clock, DollarSign, MessageSquare } from 'lucide-react';
import { packagesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Homepage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await packagesAPI.getAll();
      setPackages(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load packages');
      // Fallback to mock data if API fails
      setPackages([
        {
          id: 1,
          name: 'Basic Personal Care',
          description: 'Essential personal care services including bathing, dressing, and grooming assistance.',
          total_cost: 50,
          duration_hours: 2
        },
        {
          id: 2,
          name: 'Comprehensive Care',
          description: 'Complete care package with personal care, medication management, and companionship.',
          total_cost: 100,
          duration_hours: 4
        },
        {
          id: 3,
          name: 'Premium Care Plus',
          description: 'Premium care with additional services including meal preparation and errands.',
          total_cost: 150,
          duration_hours: 6
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Compassionate Care<br />
              <span className="text-blue-200">In Your Home</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Professional, personalized homecare services designed to help you maintain independence and quality of life in the comfort of your own home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/book"
                className="bg-white text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Calendar className="h-5 w-5" />
                <span>Request Care Package</span>
              </Link>
              <Link
                to="/packages"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>View All Packages</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Services?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive, professional care with a personal touch
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: 'Professional Caregivers',
                description: 'Licensed and experienced caregivers who are passionate about providing quality care.'
              },
              {
                icon: Shield,
                title: 'Safe & Secure',
                description: 'All caregivers are thoroughly vetted, insured, and bonded for your peace of mind.'
              },
              {
                icon: Heart,
                title: 'Personalized Care',
                description: 'Customized care plans designed to meet your specific needs and preferences.'
              },
              {
                icon: Calendar,
                title: 'Flexible Scheduling',
                description: '24/7 availability with flexible scheduling to fit your lifestyle and needs.'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Packages Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Care Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our most popular care packages designed to meet various needs
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                    <p className="text-gray-600 mb-4">{pkg.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{pkg.duration_hours} hours</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-lg font-semibold text-green-600">${pkg.total_cost}</span>
                      </div>
                    </div>
                    <Link
                      to={`/packages/${pkg.id}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-center font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/packages"
              className="inline-flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              <span>View All Packages</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Contact us today to learn more about our services and how we can help you or your loved ones.
          </p>
          <Link
            to="/book"
            className="bg-white text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
          >
            <Calendar className="h-5 w-5" />
            <span>Request Your First Visit</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Homepage;