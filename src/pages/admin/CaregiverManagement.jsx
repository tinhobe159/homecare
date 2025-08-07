import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit, Trash2, Eye, CheckCircle, Clock, XCircle, 
  Users, UserPlus, Star, TrendingUp, Calendar,
  Search, Filter, Plus, BarChart3, Activity
} from 'lucide-react';
import { caregiversAPI, skillsAPI, caregiverSkillsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const CaregiverManagement = () => {
  const [caregivers, setCaregivers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [caregiverSkills, setCaregiverSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    verified: 0,
    averageExperience: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateMetrics();
  }, [caregivers]);

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

  const calculateMetrics = () => {
    const total = caregivers.length;
    const active = caregivers.filter(c => c.is_active).length;
    const verified = caregivers.filter(c => 
      c.background_check_status === 'verified' || 
      c.backgroundCheckStatus === 'verified'
    ).length;
    
    const totalExperience = caregivers.reduce((sum, c) => 
      sum + (c.experience_years || c.years_experience || c.yearsOfExperience || 0), 0
    );
    const averageExperience = total > 0 ? totalExperience / total : 0;

    // Mock average rating (in real app, this would come from reviews)
    const averageRating = 4.2;

    setMetrics({
      total,
      active,
      verified,
      averageExperience,
      averageRating
    });
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

  const filteredCaregivers = caregivers.filter(caregiver => {
    const fullName = `${caregiver.first_name} ${caregiver.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes((searchTerm || '').toLowerCase()) ||
                         (caregiver.email || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && caregiver.is_active) ||
                         (filterStatus === 'inactive' && !caregiver.is_active);
    return matchesSearch && matchesFilter;
  });

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
        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/admin" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Caregiver Management</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Caregiver Management</h1>
              <p className="text-gray-600">Manage caregiver profiles and availability</p>
            </div>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              data-action="add-caregiver"
            >
              <Plus className="h-4 w-4" />
              <span>Add Caregiver</span>
            </button>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Caregivers</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.total}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.active}</p>
                <p className="text-sm text-green-600 mt-1">
                  {metrics.total > 0 ? ((metrics.active / metrics.total) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.verified}</p>
                <p className="text-sm text-blue-600 mt-1">
                  {metrics.total > 0 ? ((metrics.verified / metrics.total) * 100).toFixed(1) : 0}% verified
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Experience</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.averageExperience.toFixed(1)}y</p>
                <p className="text-sm text-orange-600 mt-1">Years</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.averageRating}</p>
                <p className="text-sm text-yellow-600 mt-1">out of 5</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search caregivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-action="search"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">
                {filteredCaregivers.length} of {caregivers.length} caregivers
              </span>
            </div>
          </div>
        </div>

        {/* Caregivers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Caregiver Profiles</h3>
          </div>
          
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
                {filteredCaregivers.map((caregiver) => (
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
                          <div className="text-xs text-gray-400">ID: {caregiver.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {caregiver.years_experience || caregiver.yearsOfExperience || caregiver.experience_years || 'N/A'} years
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
                      <div className="max-w-xs truncate" title={getSkillNames(caregiver.id)}>
                        {getSkillNames(caregiver.id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/caregivers/${caregiver.id}/availability`}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="View Availability"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(caregiver.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Caregiver"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredCaregivers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-500 mb-2">No caregivers found</p>
                <p className="text-gray-400">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverManagement; 