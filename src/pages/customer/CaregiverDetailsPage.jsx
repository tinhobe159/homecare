import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Mail, Phone, Star } from 'lucide-react';
import { caregiversAPI, skillsAPI, caregiverSkillsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const CaregiverDetailsPage = () => {
  const { id } = useParams();
  const [caregiver, setCaregiver] = useState(null);
  const [skills, setSkills] = useState([]);
  const [caregiverSkills, setCaregiverSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      console.log('Fetching caregiver data for ID:', id);
      // Get the specific caregiver by ID
      const [caregiverResponse, skillsResponse, caregiverSkillsResponse] = await Promise.all([
        caregiversAPI.getById(id),
        skillsAPI.getAll(),
        caregiverSkillsAPI.getAll()
      ]);
      
      console.log('Caregiver response:', caregiverResponse.data);
      setCaregiver(caregiverResponse.data);
      setSkills(skillsResponse.data);
      setCaregiverSkills(caregiverSkillsResponse.data);
    } catch (error) {
      console.error('Error fetching caregiver data:', error);
      if (error.message === 'User is not a caregiver' || error.message === 'Caregiver profile not found') {
        toast.error('Caregiver not found');
      } else {
        toast.error('Failed to load caregiver data');
      }
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
          <p className="text-gray-600 mb-4">This caregiver profile does not exist or is not available.</p>
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

  // Get skills for this specific caregiver
  const caregiverSkillIds = caregiverSkills
    .filter(cs => Number(cs.user_id) === Number(caregiver.id))
    .map(cs => Number(cs.skill_id));
  
  const caregiverSkillList = skills.filter(skill => 
    caregiverSkillIds.includes(Number(skill.id))
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
                src={caregiver.avatar_url || caregiver.profilePicture || 'https://via.placeholder.com/128'}
                alt={`${caregiver.first_name} ${caregiver.last_name}`}
                className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
              />
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {caregiver.first_name} {caregiver.last_name}
                </h1>
                
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 mb-4">
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{caregiver.years_experience || 'N/A'} years experience</span>
                  </div>
                  
                  {caregiver.background_check_status === 'verified' && (
                    <div className="flex items-center justify-center md:justify-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">Background Verified</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-900">{caregiver.rating || 'N/A'}</span>
                    <span className="text-gray-500">({caregiver.total_reviews || 0} reviews)</span>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    ${caregiver.hourly_rate || 'N/A'}/hr
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About {caregiver.first_name}</h2>
          <p className="text-gray-600 leading-relaxed">{caregiver.bio || 'No bio available'}</p>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills & Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caregiverSkillList.map((skill) => (
              <div key={skill.id} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{skill.name}</h3>
                <p className="text-sm text-gray-600">{skill.description}</p>
              </div>
            ))}
          </div>
          {caregiverSkillList.length === 0 && (
            <p className="text-gray-500 text-center py-4">No skills listed for this caregiver.</p>
          )}
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