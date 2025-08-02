import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  DollarSign, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  Award,
  Shield,
  Heart,
  User,
  CheckCircle
} from 'lucide-react';
import { caregiversAPI, appointmentsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CaregiverDetailsPage = () => {
  const { id } = useParams();
  const [caregiver, setCaregiver] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaregiverData();
  }, [id]);

  const fetchCaregiverData = async () => {
    try {
      const [caregiverResponse, appointmentsResponse] = await Promise.all([
        caregiversAPI.getById(id),
        appointmentsAPI.getAll()
      ]);
      setCaregiver(caregiverResponse.data);
      
      // Filter appointments for this caregiver
      const caregiverAppointments = appointmentsResponse.data.filter(
        apt => apt.caregiver_id === parseInt(id)
      );
      setAppointments(caregiverAppointments);
    } catch (error) {
      console.error('Error fetching caregiver data:', error);
      toast.error('Failed to load caregiver details');
    } finally {
      setLoading(false);
    }
  };

  const getCaregiverName = (caregiver) => {
    if (caregiver?.first_name && caregiver?.last_name) {
      return `${caregiver.first_name} ${caregiver.last_name}`;
    }
    return caregiver?.name || 'Unknown Caregiver';
  };

  const getCaregiverInitial = (caregiver) => {
    if (caregiver?.first_name) {
      return caregiver.first_name.charAt(0).toUpperCase();
    }
    return getCaregiverName(caregiver).charAt(0).toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'default';
      case 'busy': return 'secondary';
      case 'offline': return 'outline';
      default: return 'outline';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability?.toLowerCase()) {
      case 'available': return 'default';
      case 'busy': return 'secondary';
      case 'offline': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!caregiver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Caregiver Not Found</h2>
          <p className="text-gray-600 mb-6">The caregiver you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/caregivers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Caregivers
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className="mb-4"
          >
            <Link to="/caregivers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Caregivers
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Caregiver Profile */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={caregiver.profile_image} />
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                      {getCaregiverInitial(caregiver)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl">{getCaregiverName(caregiver)}</CardTitle>
                <CardDescription>
                  Professional Caregiver
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status and Availability */}
                <div className="flex justify-center space-x-2">
                  <Badge variant={getStatusColor(caregiver.status)}>
                    {caregiver.status}
                  </Badge>
                  <Badge variant={getAvailabilityColor(caregiver.availability)}>
                    {caregiver.availability}
                  </Badge>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{caregiver.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{caregiver.phone_number}</span>
                  </div>
                  {caregiver.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{caregiver.address}</span>
                    </div>
                  )}
                </div>

                {/* Key Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Hourly Rate</span>
                    <span className="text-lg font-bold text-primary">${caregiver.hourly_rate}/hr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Experience</span>
                    <span className="text-sm">{caregiver.experience_years || 0} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{caregiver.rating || 'New'}</span>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                {caregiver.specializations && caregiver.specializations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-1">
                      {caregiver.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {caregiver.certifications && caregiver.certifications.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-1">
                      {caregiver.certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to={`/booking?caregiver=${caregiver.id}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to={`/caregivers/${caregiver.id}/schedule`}>
                      <Clock className="h-4 w-4 mr-2" />
                      View Schedule
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Caregiver Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  About {caregiver.first_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {caregiver.bio || `${getCaregiverName(caregiver)} is a dedicated and compassionate caregiver with ${caregiver.experience_years || 0} years of experience in providing quality care services. Committed to ensuring the comfort and well-being of clients while maintaining the highest standards of professional care.`}
                </p>
              </CardContent>
            </Card>

            {/* Services & Expertise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Services & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Personal Care Assistance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Medication Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Companionship</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Meal Preparation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Light Housekeeping</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Transportation</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Work */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Recent Work
                </CardTitle>
                <CardDescription>
                  Recent appointments and client feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.package_name || 'Care Service'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.appointment_datetime_start).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent appointments</p>
                    <p className="text-sm text-gray-400">Be the first to book with this caregiver</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Why Choose This Caregiver */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Why Choose {caregiver.first_name}?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Verified & Trusted</h4>
                        <p className="text-sm text-gray-600">
                          Background checked and thoroughly vetted for your peace of mind
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Experienced</h4>
                        <p className="text-sm text-gray-600">
                          {caregiver.experience_years || 0} years of professional care experience
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Star className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Highly Rated</h4>
                        <p className="text-sm text-gray-600">
                          Excellent reviews from previous clients
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Reliable</h4>
                        <p className="text-sm text-gray-600">
                          Punctual and dependable service delivery
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverDetailsPage; 