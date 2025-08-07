import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Users,
  UserCheck,
  UserX
} from 'lucide-react';
import { departmentsAPI, administratorProfilesAPI, usersAPI, userRolesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [administrators, setAdministrators] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [departmentsResponse, administratorProfilesResponse, usersResponse, userRolesResponse] = await Promise.all([
        departmentsAPI.getAll(),
        administratorProfilesAPI.getAll(),
        usersAPI.getAll(),
        userRolesAPI.getAll()
      ]);
      
      setDepartments(departmentsResponse.data);
      setAdministrators(administratorProfilesResponse.data);
      setUsers(usersResponse.data);
      setUserRoles(userRolesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load departments data');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate code format (uppercase, alphanumeric)
    if (!/^[A-Z0-9]+$/.test(formData.code)) {
      toast.error('Department code must be uppercase letters and numbers only');
      return;
    }

    // Check if code already exists
    const existingDepartment = departments.find(d => 
      d.code === formData.code && (!editingDepartment || d.id !== editingDepartment.id)
    );
    
    if (existingDepartment) {
      toast.error('Department code already exists');
      return;
    }
    
    try {
      if (editingDepartment) {
        await departmentsAPI.update(editingDepartment.id, formData);
        toast.success('Department updated successfully');
      } else {
        await departmentsAPI.create(formData);
        toast.success('Department created successfully');
      }
      
      setShowModal(false);
      setEditingDepartment(null);
      setFormData({ 
        name: '', 
        code: '', 
        description: '' 
      });
      fetchData();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error('Failed to save department');
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (departmentId) => {
    // Check if department is being used by any administrators
    const administratorsInDepartment = administrators.filter(admin => admin.department === departmentId);
    
    if (administratorsInDepartment.length > 0) {
      toast.error(`Cannot delete department. It has ${administratorsInDepartment.length} administrator(s) assigned.`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentsAPI.delete(departmentId);
        toast.success('Department deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting department:', error);
        toast.error('Failed to delete department');
      }
    }
  };

  const getAdministratorsInDepartment = (departmentId) => {
    const adminUserIds = administrators
      .filter(admin => admin.department === departmentId)
      .map(admin => admin.user_id);
    
    return users.filter(user => adminUserIds.includes(user.id));
  };

  const getDepartmentUsageCount = (departmentId) => {
    return administrators.filter(admin => admin.department === departmentId).length;
  };

  const filteredDepartments = departments.filter(department => {
    const matchesSearch = department.name.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         department.code.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (department.description && department.description.toLowerCase().includes((searchTerm || '').toLowerCase()));
    return matchesSearch;
  });

  const getStatusIcon = (hasAdministrators) => {
    return hasAdministrators ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-gray-400" />
    );
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Department Management</h1>
          <p className="text-gray-600">Manage organizational departments and their administrators</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">
                {filteredDepartments.length} of {departments.length} departments
              </span>
            </div>
          </div>
        </div>

        {/* Departments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administrators
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
                {filteredDepartments.map((department) => {
                  const adminCount = getDepartmentUsageCount(department.id);
                  const hasAdministrators = adminCount > 0;
                  
                  return (
                    <tr key={department.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {department.name}
                            </div>
                            {department.description && (
                              <div className="text-sm text-gray-500">
                                {department.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {department.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {adminCount} administrator{adminCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(hasAdministrators)}
                          <span className={`ml-2 text-sm font-medium ${
                            hasAdministrators ? 'text-green-800' : 'text-gray-500'
                          }`}>
                            {hasAdministrators ? 'Active' : 'No Administrators'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const adminsInDept = getAdministratorsInDepartment(department.id);
                              if (adminsInDept.length > 0) {
                                const adminList = adminsInDept.map(u => `${u.first_name} ${u.last_name}`).join(', ');
                                toast.info(`Administrators in ${department.name}: ${adminList}`);
                              } else {
                                toast.info(`No administrators assigned to ${department.name}`);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Administrators"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(department)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(department.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Department Button */}
        <div className="mt-6">
          <button
            onClick={() => {
              setEditingDepartment(null);
              setFormData({ 
                name: '', 
                code: '', 
                description: '' 
              });
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingDepartment ? 'Edit Department' : 'Add New Department'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department Code</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                      placeholder="e.g., OPS, CS, HR"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use uppercase letters and numbers only (e.g., OPS, CS, HR)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of the department's function..."
                    />
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
                      {editingDepartment ? 'Update' : 'Create'}
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

export default AdminDepartments;
