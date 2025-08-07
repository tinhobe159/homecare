import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit, Trash2, Eye, CheckCircle, Clock, XCircle, 
  Users, UserPlus, Star, TrendingUp, Calendar,
  Search, Filter, Plus, BarChart3, Activity, Mail, Phone
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
  const [filterSkill, setFilterSkill] = useState('all'); // Added skill filter state
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
      
      // Filter only caregiver users (assuming IDs 12-19 based on the data)
      // In a real app, you'd filter by role or use a separate endpoint
      const caregiverUsers = caregiversResponse.data.filter(user => user.id >= 12 && user.id <= 19);
      
      setCaregivers(caregiverUsers);
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

  // Helper function to get caregiver skill IDs
  const getCaregiverSkillIds = (caregiverId) => {
    return caregiverSkills
      .filter(cs => cs.user_id === caregiverId)
      .map(cs => cs.skill_id);
  };

  // Helper function to check if caregiver has specific skill
  const caregiverHasSkill = (caregiverId, skillId) => {
    const caregiverSkillIds = getCaregiverSkillIds(caregiverId);
    return caregiverSkillIds.includes(skillId);
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
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && caregiver.is_active) ||
                         (filterStatus === 'inactive' && !caregiver.is_active);
    
    // NEW: Skill filter implementation
    const matchesSkill = filterSkill === 'all' || caregiverHasSkill(caregiver.id, parseInt(filterSkill));
    
    return matchesSearch && matchesStatus && matchesSkill;
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            {/* NEW: Skill Filter Dropdown */}
            <div>
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Skills</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">
                {filteredCaregivers.length} of {caregivers.length} caregivers
              </span>
            </div>
          </div>
        </div>

        {/* Caregivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCaregivers.map((caregiver) => (
            <div key={caregiver.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={caregiver.avatar_url || caregiver.profilePicture || 'https://via.placeholder.com/48'}
                        alt={caregiver.first_name}
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {caregiver.first_name} {caregiver.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {caregiver.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getBackgroundCheckIcon(caregiver.background_check_status || caregiver.backgroundCheckStatus)}
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (caregiver.background_check_status || caregiver.backgroundCheckStatus) === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {caregiver.background_check_status || caregiver.backgroundCheckStatus || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {caregiver.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {caregiver.phone_number || 'No phone'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {caregiver.years_experience || caregiver.yearsOfExperience || caregiver.experience_years || 'N/A'} years experience
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 mr-2" />
                    Rating: {caregiver.rating || 'N/A'} ({caregiver.total_reviews || 0} reviews)
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Skills:</h4>
                  <div className="flex flex-wrap gap-1">
                    {getSkillNames(caregiver.id) === 'No skills listed' ? (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        No skills listed
                      </span>
                    ) : (
                      getSkillNames(caregiver.id).split(', ').slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))
                    )}
                    {getSkillNames(caregiver.id) !== 'No skills listed' && 
                     getSkillNames(caregiver.id).split(', ').length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{getSkillNames(caregiver.id).split(', ').length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
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
              </div>
            </div>
          ))}
        </div>

        {filteredCaregivers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No caregivers found</p>
            <p className="text-gray-400">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaregiverManagement;