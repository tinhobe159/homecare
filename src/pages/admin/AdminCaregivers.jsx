import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award
} from 'lucide-react';
import { usersAPI, userRolesAPI, skillsAPI, caregiverSkillsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminCaregivers = () => {
  const [caregivers, setCaregivers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    status: 'active',
    hourly_rate: '',
    experience_years: '',
    bio: '',
    selectedSkills: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersResponse, userRolesResponse, skillsResponse] = await Promise.all([
        usersAPI.getAll(),
        userRolesAPI.getAll(),
        skillsAPI.getAll()
      ]);
      
      // Filter users with caregiver role (role_id = 2)
      const caregiverRoleIds = userRolesResponse.data
        .filter(role => role.role_id === 2)
        .map(role => role.user_id);
      
      const caregiverUsers = usersResponse.data.filter(user => 
        caregiverRoleIds.includes(user.id)
      );
      
      setCaregivers(caregiverUsers);
      setSkills(skillsResponse.data);
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

  const handleSkillToggle = (skillId) => {
    setFormData(prev => ({
      ...prev,
      selectedSkills: (prev.selectedSkills || []).includes(skillId)
        ? (prev.selectedSkills || []).filter(id => id !== skillId)
        : [...(prev.selectedSkills || []), skillId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const caregiverData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        status: formData.status,
        hourly_rate: parseFloat(formData.hourly_rate),
        experience_years: parseInt(formData.experience_years),
        bio: formData.bio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (editingCaregiver) {
        await usersAPI.update(editingCaregiver.id, caregiverData);
        toast.success('Caregiver updated successfully');
      } else {
        const userResponse = await usersAPI.create(caregiverData);
        const newCaregiverId = userResponse.data.id;
        
        // Assign caregiver role
        await userRolesAPI.create({
          user_id: newCaregiverId,
          role_id: 2 // Caregiver role
        });
        
        // Add skills for the new caregiver
        for (const skillId of formData.selectedSkills) {
          await caregiverSkillsAPI.create({
            user_id: newCaregiverId,
            skill_id: skillId
          });
        }
        toast.success('Caregiver created successfully');
      }
      
      setShowModal(false);
      setEditingCaregiver(null);
      setFormData({ 
        first_name: '', 
        last_name: '', 
        email: '', 
        phone_number: '', 
        address: '', 
        status: 'active',
        hourly_rate: '',
        experience_years: '',
        bio: '',
        selectedSkills: []
      });
      fetchData();
    } catch (error) {
      console.error('Error saving caregiver:', error);
      toast.error('Failed to save caregiver');
    }
  };

  const handleEdit = (caregiver) => {
    setEditingCaregiver(caregiver);
    setFormData({
      first_name: caregiver.first_name || '',
      last_name: caregiver.last_name || '',
      email: caregiver.email || '',
      phone_number: caregiver.phone_number || '',
      address: caregiver.address || '',
      status: caregiver.status || 'active',
      hourly_rate: caregiver.hourly_rate?.toString() || '',
      experience_years: caregiver.experience_years?.toString() || '',
      bio: caregiver.bio || '',
      selectedSkills: [] // Will need to fetch caregiver skills
    });
    setShowModal(true);
  };

  const handleDelete = async (caregiverId) => {
    if (window.confirm('Are you sure you want to delete this caregiver?')) {
      try {
        await usersAPI.delete(caregiverId);
        toast.success('Caregiver deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting caregiver:', error);
        toast.error('Failed to delete caregiver');
      }
    }
  };

  const filteredCaregivers = caregivers.filter(caregiver => {
    const matchesSearch = (caregiver.first_name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (caregiver.last_name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (caregiver.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (caregiver.phone_number || '').includes(searchTerm || '');
    const matchesFilter = filterStatus === 'all' || caregiver.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2" />
                Caregiver Management
              </h1>
              <p className="text-gray-600 mt-1">Manage your caregiver team</p>
            </div>
            <button
              onClick={() => {
                setEditingCaregiver(null);
                setFormData({ 
                  first_name: '', 
                  last_name: '', 
                  email: '', 
                  phone_number: '', 
                  address: '', 
                  status: 'active',
                  hourly_rate: '',
                  experience_years: '',
                  bio: '',
                  selectedSkills: []
                });
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Caregiver
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search caregivers..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
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
                      <span className="text-lg font-medium text-blue-600">
                        {(caregiver.first_name || '').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{caregiver.first_name} {caregiver.last_name}</h3>
                      <p className="text-sm text-gray-500">ID: {caregiver.id}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    caregiver.status === 'active' ? 'bg-green-100 text-green-800' :
                    caregiver.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {caregiver.status}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {caregiver.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {caregiver.phone_number}
                  </div>
                  {caregiver.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {caregiver.address}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      ${caregiver.hourly_rate || 0}
                    </div>
                    <div className="text-xs text-gray-500">Hourly Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {caregiver.experience_years || 0}
                    </div>
                    <div className="text-xs text-gray-500">Years Experience</div>
                  </div>
                </div>

                {/* Bio */}
                {caregiver.bio && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{caregiver.bio}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(caregiver)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(caregiver.id)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingCaregiver ? 'Edit Caregiver' : 'Add New Caregiver'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                      <input
                        type="number"
                        name="hourly_rate"
                        value={formData.hourly_rate}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                      <input
                        type="number"
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={handleInputChange}
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="2"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of experience and specialties..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {skills.map((skill) => (
                                              <label key={skill.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={(formData.selectedSkills || []).includes(skill.id)}
                          onChange={() => handleSkillToggle(skill.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                          <span className="ml-2 text-sm text-gray-700">{skill.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingCaregiver ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCaregivers; 