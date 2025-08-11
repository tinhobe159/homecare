import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, Plus, Users, 
  TrendingUp, Activity, Star, BarChart3,
  Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle
} from 'lucide-react';
import { caregiversAPI, skillsAPI, caregiverSkillsAPI, caregiverAvailabilityAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const CaregiverAvailability = () => {
  const { id } = useParams();
  const [caregiver, setCaregiver] = useState(null);
  const [skills, setSkills] = useState([]);
  const [caregiverSkills, setCaregiverSkills] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [metrics, setMetrics] = useState({
    totalSlots: 0,
    availableSlots: 0,
    totalHours: 0,
    averageHoursPerWeek: 0,
    availabilityRate: 0
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    calculateMetrics();
  }, [availability]);

  const fetchData = async () => {
    try {
      const [caregiverResponse, skillsResponse, caregiverSkillsResponse, availabilityResponse] = await Promise.all([
        caregiversAPI.getById(id),
        skillsAPI.getAll(),
        caregiverSkillsAPI.getAll(),
        caregiverAvailabilityAPI.getByUserId(id)
      ]);
      
      setCaregiver(caregiverResponse.data);
      setSkills(skillsResponse.data);
      setCaregiverSkills(caregiverSkillsResponse.data);
      setAvailability(availabilityResponse.data);
    } catch (error) {
      console.error('Error fetching caregiver availability:', error);
      toast.error('Failed to load caregiver availability');
    } finally {
      setLoading(false);
    }
  };

  // Get skills for this specific caregiver
  const getCaregiverSkills = () => {
    const caregiverSkillIds = caregiverSkills
      .filter(cs => Number(cs.user_id) === Number(caregiver?.id))
      .map(cs => Number(cs.skill_id));
    
    return skills.filter(skill => 
      caregiverSkillIds.includes(Number(skill.id))
    );
  };

  // Get background check icon
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

  const calculateMetrics = () => {
    const totalSlots = availability.length;
    const availableSlots = availability.filter(slot => slot.is_available).length;
    const totalHours = availability.reduce((sum, slot) => {
      return sum + calculateDuration(slot.start_time, slot.end_time);
    }, 0);
    
    const availabilityRate = totalSlots > 0 ? (availableSlots / totalSlots) * 100 : 0;
    const averageHoursPerWeek = totalSlots > 0 ? totalHours / 4 : 0; // Assuming 4 weeks

    setMetrics({
      totalSlots,
      availableSlots,
      totalHours,
      averageHoursPerWeek,
      availabilityRate
    });
  };

  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') {
      return 'N/A';
    }
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return 0;
    }
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    let duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (duration < 0) {
      duration += 24; // Handle times spanning midnight
    }
    return duration;
  };

  const filteredAvailability = availability.filter(slot => {
    const matchesSearch = new Date(slot.date).toLocaleDateString().includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'available' && slot.is_available) ||
                         (filterStatus === 'unavailable' && !slot.is_available);
    return matchesSearch && matchesFilter;
  });

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
          <Link to="/admin/caregivers" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Caregivers
          </Link>
        </div>
      </div>
    );
  }

  const caregiverSkillList = getCaregiverSkills();

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
                  <Link to="/admin/caregivers" className="text-gray-700 hover:text-blue-600">
                    Caregivers
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Availability</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Availability for {caregiver.first_name} {caregiver.last_name}
              </h1>
              <p className="text-gray-600">Manage caregiver availability schedule</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Availability</span>
            </button>
          </div>
        </div>

        {/* Caregiver Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start space-x-4">
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={caregiver.avatar_url || 'https://via.placeholder.com/64'}
              alt={`${caregiver.first_name} ${caregiver.last_name}`}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {caregiver.first_name} {caregiver.last_name}
                </h2>
                {getBackgroundCheckIcon(caregiver.background_check_status)}
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  caregiver.background_check_status === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {caregiver.background_check_status || 'Unknown'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {caregiver.years_experience || 'N/A'} years experience
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">
                    Rating: {caregiver.rating || 'N/A'} ({caregiver.total_reviews || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-green-600">
                    ${caregiver.hourly_rate || 'N/A'}/hr
                  </span>
                </div>
              </div>

              {/* Skills Section */}
              {caregiverSkillList.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {caregiverSkillList.slice(0, 5).map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {caregiverSkillList.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{caregiverSkillList.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Bio */}
              {caregiver.bio && (
                <p className="text-gray-600 text-sm">{caregiver.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Slots</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.totalSlots}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.availableSlots}</p>
                <p className="text-sm text-green-600 mt-1">
                  {metrics.availabilityRate.toFixed(1)}% rate
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
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.totalHours.toFixed(1)}h</p>
                <p className="text-sm text-purple-600 mt-1">Scheduled</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Hours/Week</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.averageHoursPerWeek.toFixed(1)}h</p>
                <p className="text-sm text-orange-600 mt-1">Average</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Availability</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.availabilityRate.toFixed(0)}%</p>
                <p className="text-sm text-yellow-600 mt-1">Success rate</p>
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
                placeholder="Search by date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">
                {filteredAvailability.length} of {availability.length} slots
              </span>
            </div>
          </div>
        </div>

        {/* Availability Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Availability Schedule ({availability.length} slots)</h3>
          </div>
          
          {availability.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAvailability.map((slot) => {
                    const duration = calculateDuration(slot.start_time, slot.end_time);
                    
                    return (
                      <tr key={slot.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(slot.date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {formatTime(slot.start_time)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {formatTime(slot.end_time)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {duration.toFixed(1)} hours
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            slot.is_available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {slot.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50" title="Edit">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500 mb-2">No availability set</p>
              <p className="text-gray-400">Add availability slots for this caregiver.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaregiverAvailability; 