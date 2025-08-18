import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, userRolesAPI, caregiverProfilesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { User, Mail, Phone, MapPin, Calendar, Award, Star, Clock, Edit3, Save, X, Camera } from 'lucide-react';

const CaregiverProfile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [caregiverProfile, setCaregiverProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (currentUser?.id) {
      fetchProfile();
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [userResponse, caregiverResponse] = await Promise.all([
        usersAPI.getById(currentUser.id),
        caregiverProfilesAPI.getAll()
      ]);

      const caregiverData = caregiverResponse.data.find(cp => cp.user_id === currentUser.id);
      
      setProfile(userResponse.data);
      setCaregiverProfile(caregiverData);
      setFormData({
        first_name: userResponse.data.first_name,
        last_name: userResponse.data.last_name,
        email: userResponse.data.email,
        phone_number: userResponse.data.phone_number,
        bio: caregiverData?.bio || '',
        specializations: Array.isArray(caregiverData?.specializations) 
          ? caregiverData.specializations.join(', ') 
          : caregiverData?.specializations || '',
        years_experience: caregiverData?.years_experience || 0,
        certifications: Array.isArray(caregiverData?.certifications)
          ? caregiverData.certifications.map(c => c.name).join(', ')
          : caregiverData?.certifications || '',
        hourly_rate: caregiverData?.hourly_rate || 0,
        availability_notes: caregiverData?.availability_notes || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
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

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Update user basic info
      await usersAPI.update(currentUser.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        updated_at: new Date().toISOString()
      });

      // Update caregiver profile
      if (caregiverProfile) {
        await caregiverProfilesAPI.update(caregiverProfile.id, {
          bio: formData.bio,
          specializations: formData.specializations,
          years_experience: parseInt(formData.years_experience),
          certifications: formData.certifications,
          hourly_rate: parseFloat(formData.hourly_rate),
          availability_notes: formData.availability_notes,
          updated_at: new Date().toISOString()
        });
      }

      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone_number: profile.phone_number,
      bio: caregiverProfile?.bio || '',
      specializations: Array.isArray(caregiverProfile?.specializations) 
        ? caregiverProfile.specializations.join(', ') 
        : caregiverProfile?.specializations || '',
      years_experience: caregiverProfile?.years_experience || 0,
      certifications: Array.isArray(caregiverProfile?.certifications)
        ? caregiverProfile.certifications.map(c => c.name).join(', ')
        : caregiverProfile?.certifications || '',
      hourly_rate: caregiverProfile?.hourly_rate || 0,
      availability_notes: caregiverProfile?.availability_notes || ''
    });
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-white" />
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50">
                <Camera className="h-3 w-3 text-gray-600" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.first_name} {profile?.last_name}
              </h1>
              <p className="text-gray-600">Professional Caregiver</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">
                    {caregiverProfile?.average_rating || 4.8} ({caregiverProfile?.total_reviews || 127} reviews)
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {caregiverProfile?.years_experience || 0} years experience
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.first_name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{profile?.email}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{profile?.phone_number}</p>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Tell clients about yourself..."
                  />
                ) : (
                  <p className="text-gray-900">{caregiverProfile?.bio || 'No bio added yet.'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                {editing ? (
                  <input
                    type="number"
                    name="years_experience"
                    value={formData.years_experience}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{caregiverProfile?.years_experience || 0} years</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                {editing ? (
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleInputChange}
                    min="0"
                    step="0.50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">${caregiverProfile?.hourly_rate || 0}/hour</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Specializations</label>
                {editing ? (
                  <input
                    type="text"
                    name="specializations"
                    value={formData.specializations}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Dementia Care, Physical Therapy, Wound Care"
                  />
                ) : (
                  <div className="text-gray-900">
                    {caregiverProfile?.specializations && Array.isArray(caregiverProfile.specializations) ? (
                      <div className="flex flex-wrap gap-2">
                        {caregiverProfile.specializations.map((spec, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                            {spec}
                          </span>
                        ))}
                      </div>
                    ) : (
                      'No specializations listed.'
                    )}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                {editing ? (
                  <textarea
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="List your certifications..."
                  />
                ) : (
                  <div className="text-gray-900">
                    {caregiverProfile?.certifications && Array.isArray(caregiverProfile.certifications) ? (
                      <div className="space-y-3">
                        {caregiverProfile.certifications.map((cert, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <div className="font-semibold text-gray-900">{cert.name}</div>
                            <div className="text-sm text-gray-600">
                              Issued by: {cert.issuer}
                            </div>
                            <div className="text-sm text-gray-600">
                              Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {cert.credential_id}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      'No certifications listed.'
                    )}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability Notes</label>
                {editing ? (
                  <textarea
                    name="availability_notes"
                    value={formData.availability_notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Preferred hours, days off, etc."
                  />
                ) : (
                  <p className="text-gray-900">{caregiverProfile?.availability_notes || 'No availability notes.'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Quick Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Clients Served</span>
                <span className="font-semibold">{caregiverProfile?.total_clients || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hours Completed</span>
                <span className="font-semibold">{caregiverProfile?.total_hours || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Rating</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{caregiverProfile?.average_rating || 4.8}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">{profile?.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">{profile?.phone_number}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">
                  Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverProfile;
