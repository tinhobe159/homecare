import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Mail, Phone, Star } from 'lucide-react';
import { caregiversAPI, skillsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const CaregiverDetailsPage = () => {
  const { id } = useParams();
  const [caregiver, setCaregiver] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [caregiverResponse, skillsResponse] = await Promise.all([
        caregiversAPI.getById(id),
        skillsAPI.getAll()
      ]);
      
      setCaregiver(caregiverResponse.data);
      setSkills(skillsResponse.data);
    } catch (error) {
      console.error('Error fetching caregiver data:', error);
      toast.error('Failed to load caregiver data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!caregiver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Caregiver Not Found</h1>
          <Link 
            to="/caregivers" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Caregivers
          </Link>
        </div>
      </div>
    );
  }

  const caregiverSkills = skills.filter(skill => 
    caregiver.skillIds && Array.isArray(caregiver.skillIds) && 
    caregiver.skillIds.includes(skill.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/caregivers"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Caregivers
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <img
                src={caregiver.profilePicture}
                alt={`${caregiver.firstName} ${caregiver.lastName}`}
                className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
              />
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {caregiver.firstName} {caregiver.lastName}
                </h1>
                
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 mb-4">
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{caregiver.yearsOfExperience} years experience</span>
                  </div>
                  
                  {caregiver.backgroundCheckStatus === 'verified' && (
                    <div className="flex items-center justify-center md:justify-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">Background Verified</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-900">{caregiver.rating}</span>
                    <span className="text-gray-500">({caregiver.totalReviews} reviews)</span>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    ${caregiver.hourlyRate}/hr
                  </div>
                </div>

                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                  <Link 
                    to={`/book?caregiver=${caregiver.id}`}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center"
                  >
                    Book This Caregiver
                  </Link>
                  <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About {caregiver.firstName}</h2>
          <p className="text-gray-600 leading-relaxed">{caregiver.bio}</p>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills & Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caregiverSkills.map((skill) => (
              <div key={skill.id} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{skill.name}</h3>
                <p className="text-sm text-gray-600">{skill.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <span className="text-gray-600">Available through CareConnect messaging</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <span className="text-gray-600">Phone consultations available after booking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverDetailsPage; 