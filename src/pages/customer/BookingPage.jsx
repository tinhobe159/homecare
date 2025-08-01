import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Mail, MapPin, Package, CreditCard, Repeat, CalendarDays } from 'lucide-react';
import { packagesAPI, userRequestsAPI, caregiversAPI, scheduledPackagesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RecurrenceBuilder from '../../components/common/RecurrenceBuilder';
import CalendarPreview from '../../components/common/CalendarPreview';
import { useAuth } from '../../contexts/AuthContext';

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAdmin } = useAuth();
  const [packages, setPackages] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    bookingType: 'one-time', // 'one-time' or 'scheduled'
    selectedPackage: location.state?.packageId || new URLSearchParams(location.search).get('package') || '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    preferredDate: '',
    preferredTime: '',
    duration: '',
    specialInstructions: '',
    emergencyContact: '',
    emergencyPhone: '',
    selectedCaregiver: ''
  });

  // Scheduled package state
  const [scheduledData, setScheduledData] = useState({
    rrule: '',
    startDatetime: '',
    exceptions: []
  });

  const [showRecurrenceBuilder, setShowRecurrenceBuilder] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-fill customer information when user is logged in
  useEffect(() => {
    if (currentUser && !isAdmin) {
      setFormData(prev => ({
        ...prev,
        customerName: currentUser.name || `${currentUser.first_name} ${currentUser.last_name}` || '',
        customerEmail: currentUser.email || '',
        customerPhone: currentUser.phone || currentUser.phone_number || '',
        address: currentUser.address || ''
      }));
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [packagesResponse, caregiversResponse] = await Promise.all([
        packagesAPI.getAll(),
        caregiversAPI.getAll()
      ]);
      setPackages(packagesResponse.data);
      setCaregivers(caregiversResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
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

  const handleBookingTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      bookingType: type
    }));
    
    if (type === 'scheduled') {
      setShowRecurrenceBuilder(true);
    }
  };

  const handleRecurrenceChange = (rrule) => {
    console.log('RecurrenceBuilder called handleRecurrenceChange with rrule:', rrule);
    setScheduledData(prev => ({
      ...prev,
      rrule
    }));
  };

  const handleExceptionChange = (exceptions) => {
    setScheduledData(prev => ({
      ...prev,
      exceptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.selectedPackage) {
      toast.error('Please select a package');
      return;
    }
    
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.bookingType === 'scheduled') {
      console.log('Scheduled package validation:', {
        rrule: scheduledData.rrule,
        startDatetime: scheduledData.startDatetime,
        hasRrule: !!scheduledData.rrule,
        hasStartDatetime: !!scheduledData.startDatetime
      });
      
      if (!scheduledData.startDatetime) {
        toast.error('Please select a start date and time for your scheduled package');
        return;
      }
      
      if (!scheduledData.rrule) {
        return;
      }
    } else {
      if (!formData.preferredDate || !formData.preferredTime) {
        toast.error('Please select date and time for one-time booking');
        return;
      }
    }

    setSubmitting(true);
    
    try {
      if (formData.bookingType === 'scheduled') {
        // Create scheduled package
        const scheduledPackageData = {
          customer_id: currentUser?.id || null,
          package_id: parseInt(formData.selectedPackage),
          caregiver_id: formData.selectedCaregiver ? parseInt(formData.selectedCaregiver) : null,
          start_datetime: scheduledData.startDatetime,
          rrule: scheduledData.rrule,
          end_date: null,
          status: 'active',
          exceptions: scheduledData.exceptions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('Creating scheduled package with data:', scheduledPackageData);
        await scheduledPackagesAPI.create(scheduledPackageData);
        toast.success('Scheduled package created successfully!');
      } else {
        // Create one-time request
        const requestData = {
          customer_id: currentUser?.id || null,
          package_id: parseInt(formData.selectedPackage),
          status: 'new',
          preferred_contact_method: 'email',
          notes: `Customer: ${formData.customerName}
Email: ${formData.customerEmail}
Phone: ${formData.customerPhone}
Address: ${formData.address}
Preferred Date: ${formData.preferredDate}
Preferred Time: ${formData.preferredTime}
Duration: ${formData.duration} hours
Special Instructions: ${formData.specialInstructions}
Emergency Contact: ${formData.emergencyContact}
Emergency Phone: ${formData.emergencyPhone}
Selected Caregiver: ${formData.selectedCaregiver ? 'Yes' : 'No preference'}`,
          created_at: new Date().toISOString()
        };

        await userRequestsAPI.create(requestData);
        toast.success('Request submitted successfully! We will contact you soon.');
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPackage = packages.find(pkg => pkg.id === parseInt(formData.selectedPackage));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 py-8">
            <h1 className="text-3xl font-bold mb-2">Request Care Package</h1>
            <p className="text-blue-100">Submit your care request and we'll get back to you</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Booking Type Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Booking Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    formData.bookingType === 'one-time'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleBookingTypeChange('one-time')}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold">One-time Appointment</h3>
                  </div>
                  <p className="text-gray-600">
                    Book a single appointment for a specific date and time. Perfect for occasional care needs.
                  </p>
                </div>
                
                <div
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    formData.bookingType === 'scheduled'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleBookingTypeChange('scheduled')}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Repeat className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold">Scheduled Package</h3>
                  </div>
                  <p className="text-gray-600">
                    Set up recurring appointments with flexible scheduling. Ideal for ongoing care needs.
                  </p>
                </div>
              </div>
            </div>

            {/* Package Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Select Care Package
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      parseInt(formData.selectedPackage) === pkg.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, selectedPackage: pkg.id.toString() }))}
                  >
                    <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="text-2xl font-bold text-blue-600">${pkg.total_cost}</p>
                    <p className="text-sm text-gray-600">{pkg.duration_hours} hours</p>
                    <p className="text-sm text-gray-500 mt-2">{pkg.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
                {currentUser && !isAdmin && (
                  <span className="ml-2 text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Auto-filled from your profile
                  </span>
                )}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Service address"
                  />
                </div>
              </div>
            </div>

            {/* Appointment Details - One-time */}
            {formData.bookingType === 'one-time' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Appointment Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time *
                    </label>
                    <input
                      type="time"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      max="24"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={selectedPackage?.duration_hours || "Hours"}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Configuration - Scheduled */}
            {formData.bookingType === 'scheduled' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Repeat className="h-5 w-5 mr-2" />
                  Schedule Configuration
                </h2>
                
                {/* Start Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={scheduledData.startDatetime.split('T')[0] || ''}
                      onChange={(e) => {
                        const time = scheduledData.startDatetime.split('T')[1] || '09:00';
                        setScheduledData(prev => ({
                          ...prev,
                          startDatetime: `${e.target.value}T${time}`
                        }));
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={scheduledData.startDatetime.split('T')[1] || '09:00'}
                      onChange={(e) => {
                        const date = scheduledData.startDatetime.split('T')[0] || new Date().toISOString().split('T')[0];
                        setScheduledData(prev => ({
                          ...prev,
                          startDatetime: `${date}T${e.target.value}`
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Recurrence Builder */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recurrence Pattern</h3>
                    <button
                      type="button"
                      onClick={() => setShowRecurrenceBuilder(!showRecurrenceBuilder)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {showRecurrenceBuilder ? 'Hide Builder' : 'Show Builder'}
                    </button>
                  </div>
                  
                  {showRecurrenceBuilder && (
                    <RecurrenceBuilder
                      onRecurrenceChange={handleRecurrenceChange}
                      initialValue={scheduledData.rrule}
                    />
                  )}
                  
                  {scheduledData.rrule && !showRecurrenceBuilder && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 font-medium">Current Pattern:</p>
                      <p className="text-blue-700">{scheduledData.rrule}</p>
                    </div>
                  )}
                </div>

                {/* Calendar Preview */}
                {scheduledData.rrule && scheduledData.startDatetime && (
                  <CalendarPreview
                    rrule={scheduledData.rrule}
                    startDate={scheduledData.startDatetime}
                    exceptions={scheduledData.exceptions}
                    onExceptionChange={handleExceptionChange}
                  />
                )}
              </div>
            )}

            {/* Caregiver Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Caregiver Selection (Optional)
              </h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  You can optionally select a specific caregiver for your appointment. If you don't select one, we'll assign the best available caregiver for your needs.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* No preference option */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      formData.selectedCaregiver === ''
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      selectedCaregiver: ''
                    }))}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">
                          No Preference
                        </h3>
                        <p className="text-xs text-gray-500">
                          Let us assign the best caregiver
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          We'll match you with the most suitable caregiver based on your needs and availability.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {caregivers.map((caregiver) => (
                    <div
                      key={caregiver.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        formData.selectedCaregiver === caregiver.id.toString()
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        selectedCaregiver: prev.selectedCaregiver === caregiver.id.toString() ? '' : caregiver.id.toString()
                      }))}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <img
                            src={caregiver.profilePicture}
                            alt={`${caregiver.first_name} ${caregiver.last_name}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900">
                            {caregiver.first_name} {caregiver.last_name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {caregiver.yearsOfExperience} years experience
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-yellow-600">★</span>
                            <span className="text-xs text-gray-600 ml-1">
                              {caregiver.rating} ({caregiver.totalReviews} reviews)
                            </span>
                          </div>
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            ${caregiver.hourlyRate}/hr
                          </p>
                        </div>
                      </div>
                      {caregiver.bio && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {caregiver.bio}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {caregivers.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No caregivers available at the moment.
                  </p>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions or Requirements
              </label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special requirements, medical conditions, or preferences..."
              />
            </div>

            {/* Summary */}
            {selectedPackage && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><span className="font-medium">Package:</span> {selectedPackage.name}</p>
                    <p><span className="font-medium">Cost:</span> ${selectedPackage.total_cost}</p>
                    <p><span className="font-medium">Duration:</span> {selectedPackage.duration_hours} hours</p>
                    <p><span className="font-medium">Type:</span> {formData.bookingType === 'one-time' ? 'One-time' : 'Scheduled'}</p>
                  </div>
                  <div>
                    {formData.bookingType === 'one-time' ? (
                      <>
                        <p><span className="font-medium">Date:</span> {formData.preferredDate}</p>
                        <p><span className="font-medium">Time:</span> {formData.preferredTime}</p>
                      </>
                    ) : (
                      <>
                        <p><span className="font-medium">Start Date:</span> {scheduledData.startDatetime.split('T')[0]}</p>
                        <p><span className="font-medium">Start Time:</span> {scheduledData.startDatetime.split('T')[1]}</p>
                      </>
                    )}
                    <p><span className="font-medium">Customer:</span> {formData.customerName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/packages')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Packages
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {formData.bookingType === 'scheduled' ? 'Create Scheduled Package' : 'Submit Request'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage; 