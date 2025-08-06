import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { caregiversAPI, skillsAPI, caregiverSkillsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const CaregiverManagement = () => {
  const [caregivers, setCaregivers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [caregiverSkills, setCaregiverSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [caregiversResponse, skillsResponse, caregiverSkillsResponse] = await Promise.all([
        caregiversAPI.getAll(),
        skillsAPI.getAll(),
        caregiverSkillsAPI.getAll()
      ]);
      
      setCaregivers(caregiversResponse.data);
      setSkills(skillsResponse.data);
      setCaregiverSkills(caregiverSkillsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load caregivers data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (caregiverId) => {
    if (window.confirm('Are you sure you want to delete this caregiver?')) {
      console.log('Deleting caregiver:', caregiverId);
      // TODO: Implement delete functionality
      toast.info('Delete functionality coming soon');
    }
  };

  const getSkillNames = (caregiverId) => {
    // Get skills for this specific caregiver
    const caregiverSkillIds = caregiverSkills
      .filter(cs => cs.user_id === caregiverId)
      .map(cs => cs.skill_id);
    
    if (caregiverSkillIds.length === 0) {
      return 'No skills listed';
    }
    
    return caregiverSkillIds.map(skillId => {
      const skill = skills.find(s => s.id === skillId);
      return skill ? skill.name : 'Unknown';
    }).join(', ');
  };

  const getBackgroundCheckIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Caregiver Management</h1>
          <p className="text-gray-600">Manage caregiver profiles and availability</p>
        </div>

        {/* Caregivers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caregiver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Years of Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Background Check
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {caregivers.map((caregiver) => (
                  <tr key={caregiver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={caregiver.avatar_url || caregiver.profilePicture || 'https://via.placeholder.com/40'}
                            alt={caregiver.first_name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {caregiver.first_name} {caregiver.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{caregiver.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {caregiver.years_experience || caregiver.yearsOfExperience || 'N/A'} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getBackgroundCheckIcon(caregiver.background_check_status || caregiver.backgroundCheckStatus)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {caregiver.background_check_status || caregiver.backgroundCheckStatus || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getSkillNames(caregiver.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/caregivers/${caregiver.id}/availability`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(caregiver.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverManagement; 