import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Package, 
  DollarSign, 
  MapPin,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { packagesAPI, caregiversAPI, appointmentsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const BookingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    package_id: '',
    caregiver_id: 'auto',
    appointment_datetime_start: '',
    appointment_datetime_end: '',
    special_instructions: '',
    contact_preference: 'phone'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesResponse, caregiversResponse] = await Promise.all([
        packagesAPI.getAll(),
        caregiversAPI.getAll()
      ]);
      setPackages(packagesResponse.data);
      setCaregivers(caregiversResponse.data);
    } catch (error) {
      console.error('Error fetching booking data:', error);
      toast.error('Failed to load booking options');
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

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.package_id || !formData.appointment_datetime_start) {
      toast.error('Please select a package and appointment time');
      return;
    }

    setSubmitting(true);

    try {
      const selectedPackage = packages.find(pkg => pkg.id === parseInt(formData.package_id));
      
      // Calculate end time if not provided
      let endTime = formData.appointment_datetime_end;
      if (!endTime && selectedPackage) {
        const startTime = new Date(formData.appointment_datetime_start);
        const endTimeDate = new Date(startTime.getTime() + (selectedPackage.duration_hours * 60 * 60 * 1000));
        endTime = endTimeDate.toISOString();
      }

      const appointmentData = {
        customer_id: user?.id,
        package_id: parseInt(formData.package_id),
        caregiver_id: (formData.caregiver_id && formData.caregiver_id !== 'auto') ? parseInt(formData.caregiver_id) : null,
        appointment_datetime_start: formData.appointment_datetime_start,
        appointment_datetime_end: endTime,
        status: 'pending',
        special_instructions: formData.special_instructions,
        total_cost: selectedPackage?.total_cost || 0,
        contact_preference: formData.contact_preference
      };

      await appointmentsAPI.create(appointmentData);
      toast.success('Booking request submitted successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to submit booking request');
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedPackage = () => {
    return packages.find(pkg => pkg.id === parseInt(formData.package_id));
  };

  const getSelectedCaregiver = () => {
    if (!formData.caregiver_id || formData.caregiver_id === 'auto') {
      return null;
    }
    return caregivers.find(caregiver => caregiver.id === parseInt(formData.caregiver_id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Book Care Service</h1>
          <p className="text-gray-600 mt-2">Schedule your personalized care service</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Package Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Select Care Package
              </CardTitle>
              <CardDescription>
                Choose the care package that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="package_id">Care Package *</Label>
                  <Select 
                    value={formData.package_id} 
                    onValueChange={(value) => handleSelectChange('package_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a care package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{pkg.name}</span>
                            <Badge variant="secondary">${pkg.total_cost}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {getSelectedPackage() && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{getSelectedPackage().name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{getSelectedPackage().description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>{getSelectedPackage().duration_hours} hours</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>${getSelectedPackage().total_cost}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Caregiver Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Choose Caregiver (Optional)
              </CardTitle>
              <CardDescription>
                Select a preferred caregiver or let us assign one for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="caregiver_id">Preferred Caregiver</Label>
                  <Select 
                    value={formData.caregiver_id} 
                    onValueChange={(value) => handleSelectChange('caregiver_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Let us assign a caregiver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Let us assign a caregiver</SelectItem>
                      {caregivers.map((caregiver) => (
                        <SelectItem key={caregiver.id} value={caregiver.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{caregiver.first_name} {caregiver.last_name}</span>
                            <Badge variant="outline">${caregiver.hourly_rate}/hr</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {getSelectedCaregiver() && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {getSelectedCaregiver().first_name} {getSelectedCaregiver().last_name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{getSelectedCaregiver().bio}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current mr-2" />
                        <span>{getSelectedCaregiver().rating || 'New'} rating</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>{getSelectedCaregiver().experience_years || 0} years exp.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Appointment Details
              </CardTitle>
              <CardDescription>
                Schedule your care service appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="appointment_datetime_start">Start Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    name="appointment_datetime_start"
                    value={formData.appointment_datetime_start}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div>
                  <Label htmlFor="appointment_datetime_end">End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    name="appointment_datetime_end"
                    value={formData.appointment_datetime_end}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to auto-calculate based on package duration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Special Instructions
              </CardTitle>
              <CardDescription>
                Any specific requirements or notes for your care service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="special_instructions">Instructions</Label>
                  <Textarea
                    name="special_instructions"
                    value={formData.special_instructions}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Any special requirements, allergies, preferences, or notes for the caregiver..."
                  />
                </div>
                <div>
                  <Label htmlFor="contact_preference">Preferred Contact Method</Label>
                  <Select 
                    value={formData.contact_preference} 
                    onValueChange={(value) => handleSelectChange('contact_preference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {getSelectedPackage() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Selected Package</h4>
                      <p className="text-sm text-gray-600">{getSelectedPackage().name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Duration</h4>
                      <p className="text-sm text-gray-600">{getSelectedPackage().duration_hours} hours</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Total Cost</h4>
                      <p className="text-lg font-bold text-primary">${getSelectedPackage().total_cost}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Caregiver</h4>
                      <p className="text-sm text-gray-600">
                        {getSelectedCaregiver() 
                          ? `${getSelectedCaregiver().first_name} ${getSelectedCaregiver().last_name}`
                          : 'Will be assigned'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.package_id || !formData.appointment_datetime_start}
              className="min-w-[150px]"
            >
              {submitting ? 'Submitting...' : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage; 