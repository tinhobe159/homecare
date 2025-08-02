import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Star, 
  Clock, 
  Users, 
  Shield, 
  Award,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { packagesAPI, caregiversAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Homepage = () => {
  const [packages, setPackages] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesResponse, caregiversResponse] = await Promise.all([
        packagesAPI.getAll(),
        caregiversAPI.getAll()
      ]);
      setPackages(packagesResponse.data.slice(0, 3)); // Show only 3 packages
      setCaregivers(caregiversResponse.data.slice(0, 4)); // Show only 4 caregivers
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load homepage data');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verified Caregivers",
      description: "All our caregivers are thoroughly vetted and background-checked for your peace of mind."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "24/7 Availability",
      description: "Round-the-clock care services available whenever you need them."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Professional Care",
      description: "Licensed and experienced caregivers providing compassionate, professional care."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Personalized Service",
      description: "Customized care plans tailored to your specific needs and preferences."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Family Member",
      content: "The caregivers from HomeCare have been amazing with my mother. They're professional, caring, and reliable.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Client",
      content: "I've been using their services for 6 months now and couldn't be happier. The quality of care is exceptional.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Family Member",
      content: "Finding reliable care for my grandmother was a challenge until we found HomeCare. Highly recommended!",
      rating: 5
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-primary rounded-full flex items-center justify-center">
                <Heart className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional Home Care
              <span className="text-primary block">When You Need It</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with verified, compassionate caregivers for personalized home care services. 
              Your family's comfort and safety is our priority.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-4">
                <Link to="/packages">
                  View Care Packages
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
                <Link to="/caregivers">
                  Meet Our Caregivers
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose HomeCare?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide professional, compassionate care with a focus on your family's well-being
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Packages Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Care Packages
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our carefully designed care packages tailored to different needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {pkg.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      ${pkg.total_cost}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {pkg.duration_hours} hours
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      {pkg.services?.length || 0} services included
                    </div>
                    <Button asChild className="w-full mt-4">
                      <Link to={`/packages/${pkg.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/packages">
                View All Packages
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Caregivers Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Caregivers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experienced, compassionate professionals dedicated to providing exceptional care
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {caregivers.map((caregiver) => (
              <Card key={caregiver.id} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={caregiver.profile_image} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {caregiver.first_name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-lg">
                    {caregiver.first_name} {caregiver.last_name}
                  </CardTitle>
                  <CardDescription>
                    {caregiver.specializations?.slice(0, 2).join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                      {caregiver.rating || 'New'} ({caregiver.experience_years || 0} years)
                    </div>
                    <div className="text-sm text-gray-600">
                      ${caregiver.hourly_rate}/hr
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full mt-3">
                      <Link to={`/caregivers/${caregiver.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/caregivers">
                View All Caregivers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from families we've helped
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground mb-8">
            Contact us today to discuss your care needs and find the perfect caregiver for your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-4">
              <Link to="/booking">
                Book a Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-4">
              <Link to="/contact">
                Contact Us
                <Phone className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;