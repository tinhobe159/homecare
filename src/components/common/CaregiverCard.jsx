import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Star } from 'lucide-react';

const CaregiverCard = ({ caregiver, skills }) => {
  const caregiverSkills = skills.filter(skill => 
    caregiver.skillIds && Array.isArray(caregiver.skillIds) && 
    caregiver.skillIds.includes(skill.id)
  );

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
      <div className="flex items-center mb-4">
        <img
          src={caregiver.profilePicture}
          alt={`${caregiver.first_name} ${caregiver.last_name}`}
          className="w-16 h-16 rounded-full object-cover mr-4"
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {caregiver.first_name} {caregiver.last_name}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">{caregiver.yearsOfExperience} years experience</span>
          </div>
          {caregiver.backgroundCheckStatus === 'verified' && (
            <div className="flex items-center space-x-1 mt-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Background Verified</span>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{caregiver.bio}</p>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Skills:</h4>
        <div className="flex flex-wrap gap-2">
          {caregiverSkills.slice(0, 3).map((skill) => (
            <span
              key={skill.id}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {skill.name}
            </span>
          ))}
          {caregiverSkills.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{caregiverSkills.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-900">{caregiver.rating}</span>
          <span className="text-sm text-gray-500">({caregiver.totalReviews} reviews)</span>
        </div>
        <div className="text-lg font-semibold text-green-600">
          ${caregiver.hourlyRate}/hr
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Link 
          to={`/caregivers/${caregiver.id}`}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 text-center text-sm font-medium"
        >
          View Profile
        </Link>
        <Link 
          to={`/book?caregiver=${caregiver.id}`}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-center text-sm font-medium"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
};

export default CaregiverCard; 