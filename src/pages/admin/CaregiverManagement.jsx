import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { caregiversAPI, skillsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const CaregiverManagement = () => {
  const [caregivers, setCaregivers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [caregiversResponse, skillsResponse] = await Promise.all([
        caregiversAPI.getAll(),
        skillsAPI.getAll()
      ]);
      
      setCaregivers(caregiversResponse.data);
      setSkills(skillsResponse.data);
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

  const getSkillNames = (skillIds) => {
    if (!skillIds || !Array.isArray(skillIds)) {
      return 'No skills listed';
    }
    return skillIds.map(id => {
      const skill = skills.find(s => s.id === id);
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
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={caregiver.profilePicture}
                            alt={`${caregiver.firstName} ${caregiver.lastName}`}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {caregiver.firstName} {caregiver.lastName}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {caregiver.bio}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {caregiver.yearsOfExperience}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getBackgroundCheckIcon(caregiver.backgroundCheckStatus)}
                        <span className="text-sm text-gray-900">{caregiver.backgroundCheckStatus}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate">
                        {getSkillNames(caregiver.skillIds)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/admin/caregivers/${caregiver.id}/availability`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Availability
                      </Link>
                      <button className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(caregiver.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
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