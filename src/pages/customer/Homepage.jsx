import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Shield, Heart, ArrowRight, Star, Clock, DollarSign, MessageSquare, Home, Activity, CheckCircle, MapPin, Award, Phone, Mail } from 'lucide-react';
import { packagesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Homepage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setError(false);
      const response = await packagesAPI.getAll();
      setPackages(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError(true);
      toast.error('Failed to load packages. Showing fallback options.');
      // Fallback to mock data if API fails
      setPackages([
        {
          id: 1,
          name: 'Basic Personal Care',
          description: 'Essential personal care services including bathing, dressing, and grooming assistance.',
          total_cost: 50,
          duration_hours: 2,
          popular: false
        },
        {
          id: 2,
          name: 'Comprehensive Care',
          description: 'Complete care package with personal care, medication management, and companionship.',
          total_cost: 100,
          duration_hours: 4,
          popular: true
        },
        {
          id: 3,
          name: 'Premium Care Plus',
          description: 'Premium care with additional services including meal preparation and errands.',
          total_cost: 150,
          duration_hours: 6,
          popular: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const retryFetch = () => {
    setLoading(true);
    fetchPackages();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax Effect */}
      <section className="relative bg-gradient-to-br from-[#17407b] via-blue-700 to-blue-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* VERON Logo */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              VERON<br />
              <span className="text-blue-200">Professional In-Home Care Services</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Compassionate home healthcare that brings comfort, dignity, and peace of mind to your family.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-blue-200">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span className="text-sm">Licensed & Insured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">500+ Families Served</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Background Checked</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/book"
                className="bg-white text-[#17407b] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 transform hover:scale-105"
              >
                <Calendar className="h-5 w-5" />
                <span>Request Care Package</span>
              </Link>
              <Link
                to="/packages"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-[#17407b] transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
              >
                <span>View All Packages</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started with VERON is simple and straightforward
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Contact Us',
                description: 'Call or book online to discuss your care needs and schedule a consultation.',
                icon: Phone
              },
              {
                step: '2',
                title: 'Custom Care Plan',
                description: 'We create a personalized care plan tailored to your specific requirements.',
                icon: Calendar
              },
              {
                step: '3',
                title: 'Begin Care',
                description: 'Your licensed caregiver arrives and begins providing professional care services.',
                icon: Heart
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-12 h-12 bg-[#17407b] text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto group-hover:scale-110 transition-transform duration-200">
                      {item.step}
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <Icon className="h-5 w-5 text-[#17407b]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose VERON?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
              Professional care with a personal touch
            </p>
            <p className="text-lg font-medium text-[#17407b]">
              Home. Health. Happiness. Every time.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: 'Licensed Care Professionals',
                description: 'Experienced caregivers who are passionate about providing quality care.',
                color: 'text-green-600',
                bgColor: 'bg-green-100'
              },
              {
                icon: Shield,
                title: 'Vetted & Insured',
                description: 'All caregivers are thoroughly vetted, insured, and bonded for your peace of mind.',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-100'
              },
              {
                icon: Heart,
                title: 'Customized Care Plans',
                description: 'Personalized care designed to meet your specific needs and preferences.',
                color: 'text-red-600',
                bgColor: 'bg-red-100'
              },
              {
                icon: Calendar,
                title: '24/7 Flexible Scheduling',
                description: 'Available when you need us with flexible scheduling to fit your lifestyle.',
                color: 'text-blue-600',
                bgColor: 'bg-blue-100'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-full mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-gray-700 italic">
              At VERON, we believe that well-being starts at home.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            What Our Families Say
          </h2>
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <blockquote className="text-xl italic text-gray-700 mb-4">
              "VERON transformed our family's life. The caregivers are not just professionals, they're like family. My mother's quality of life has improved dramatically since we started with VERON."
            </blockquote>
            <div className="flex items-center justify-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-gray-600 font-medium">- Sarah Johnson, Daughter</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Packages Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Care Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
              Explore our care packages that deliver on home, health, and happiness.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between mb-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Unable to load packages. Please try again.</p>
              <button
                onClick={retryFetch}
                className="bg-[#17407b] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105 overflow-hidden relative">
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
                      Most Popular
                    </div>
                  )}
                  
                  {/* VERON Badge */}
                  <div className="absolute top-3 right-3 bg-[#17407b] text-white px-2 py-0.5 rounded-full text-xs font-medium">
                    VERON
                  </div>
                  
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
                        <span className="text-lg font-semibold text-green-600">Starting at ${pkg.total_cost}</span>
                      </div>
                    </div>
                    <Link
                      to={`/packages/${pkg.id}`}
                      className="w-full bg-[#17407b] hover:bg-blue-700 text-white py-2 px-4 rounded-md text-center font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
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

      {/* Service Areas Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Service Areas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We proudly serve families across the greater metropolitan area
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Downtown Area',
              'North Suburbs',
              'South Suburbs',
              'West Region'
            ].map((area, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-[#17407b]" />
                <span className="text-gray-700 font-medium">{area}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Don't see your area? <Link to="/contact" className="text-[#17407b] hover:underline">Contact us</Link> to check availability.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#17407b] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Contact us today to learn more about our services and how we can help you or your loved ones.
          </p>
          <div className="space-y-4">
            <Link
              to="/book"
              className="bg-white text-[#17407b] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2 transform hover:scale-105"
            >
              <Calendar className="h-5 w-5" />
              <span>Request Your First Visit</span>
            </Link>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 mt-6">
              <div className="flex items-center space-x-2 text-blue-200">
                <Phone className="h-4 w-4" />
                <span className="text-sm">Call: (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-200">
                <Mail className="h-4 w-4" />
                <span className="text-sm">Email: info@veron.com</span>
              </div>
            </div>
            <p className="text-sm text-blue-200 mt-4">
              Bring Home, Health & Happiness to your life.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Brand Section */}
      <section className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Home className="h-5 w-5 text-white" />
            <Activity className="h-5 w-5 text-white" />
            <Heart className="h-5 w-5 text-white" />
          </div>
          <p className="text-white font-semibold text-lg">
            VERON – Professional In-Home Care Services
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Licensed • Insured • Compassionate Care
          </p>
        </div>
      </section>
    </div>
  );
};

export default Homepage;