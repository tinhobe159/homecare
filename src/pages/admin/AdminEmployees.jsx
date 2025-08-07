import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Building2,
  UserCheck,
  UserX,
  Filter,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { usersAPI, userRolesAPI, departmentsAPI, administratorProfilesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminEmployees = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [administratorProfiles, setAdministratorProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    department_id: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersResponse, departmentsResponse, userRolesResponse, administratorProfilesResponse] = await Promise.all([
        usersAPI.getAll(),
        departmentsAPI.getAll(),
        userRolesAPI.getAll(),
        administratorProfilesAPI.getAll()
      ]);
      
      setUsers(usersResponse.data);
      setDepartments(departmentsResponse.data);
      setUserRoles(userRolesResponse.data);
      setAdministratorProfiles(administratorProfilesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load employees data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let userId;
      
      if (editingEmployee) {
        // Update existing user
        await usersAPI.update(editingEmployee.id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          is_active: formData.is_active
        });
        userId = editingEmployee.id;
        toast.success('Employee updated successfully');
      } else {
        // Create new user
        const userResponse = await usersAPI.create({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password,
          is_active: formData.is_active
        });
        userId = userResponse.data.id;
        
        // Assign admin role
        await userRolesAPI.create({
          user_id: userId,
          role_id: 1, // Admin role
          is_active: true
        });
        
        toast.success('Employee created successfully');
      }
      
      // Handle department assignment
      if (formData.department_id) {
        const existingProfile = administratorProfiles.find(ap => ap.user_id === userId);
        
        if (existingProfile) {
          // Update existing profile
          await administratorProfilesAPI.update(existingProfile.id, {
            department: parseInt(formData.department_id)
          });
        } else {
          // Create new profile
          await administratorProfilesAPI.create({
            user_id: userId,
            department: parseInt(formData.department_id)
          });
        }
      }
      
      setShowModal(false);
      setEditingEmployee(null);
      setFormData({ 
        first_name: '', 
        last_name: '', 
        email: '', 
        phone_number: '', 
        password: '',
        department_id: '',
        is_active: true 
      });
      fetchData();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save employee');
    }
  };

  const handleEdit = (employee) => {
    const profile = administratorProfiles.find(ap => ap.user_id === employee.id);
    
    setEditingEmployee(employee);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone_number: employee.phone_number || '',
      password: '', // Don't show password in edit mode
      department_id: profile ? profile.department.toString() : '',
      is_active: employee.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee? This will also remove their role assignments.')) {
      try {
        // Remove administrator profile first
        const profile = administratorProfiles.find(ap => ap.user_id === employeeId);
        if (profile) {
          await administratorProfilesAPI.delete(profile.id);
        }
        
        // Remove user role
        const userRole = userRoles.find(ur => ur.user_id === employeeId && ur.role_id === 1);
        if (userRole) {
          await userRolesAPI.delete(userRole.id);
        }
        
        // Delete user
        await usersAPI.delete(employeeId);
        toast.success('Employee deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Failed to delete employee');
      }
    }
  };

  // Get admin employees (users with admin role)
  const getAdminEmployees = () => {
    const adminRoleIds = userRoles
      .filter(ur => ur.role_id === 1) // Admin role
      .map(ur => ur.user_id);
    
    return users.filter(user => adminRoleIds.includes(user.id));
  };

  // Get employee with department info
  const getEmployeesWithDepartments = () => {
    return getAdminEmployees().map(employee => {
      const profile = administratorProfiles.find(ap => ap.user_id === employee.id);
      const department = profile ? departments.find(d => d.id === profile.department) : null;
      
      return {
        ...employee,
        department: department || null,
        profile: profile || null
      };
    });
  };

  const employees = getEmployeesWithDepartments();

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.first_name?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         employee.last_name?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         employee.email?.toLowerCase().includes((searchTerm || '').toLowerCase());
    
    const matchesDepartmentFilter = filterDepartment === 'all' || 
                                   (employee.department && employee.department.id.toString() === filterDepartment);
    
    const matchesStatusFilter = filterStatus === 'all' || 
                               (filterStatus === 'active' && employee.is_active) ||
                               (filterStatus === 'inactive' && !employee.is_active);
    
    return matchesSearch && matchesDepartmentFilter && matchesStatusFilter;
  });

  const getStatusIcon = (isActive) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Management</h1>
          <p className="text-gray-600">Manage administrative employees and their department assignments</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
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
                {filteredEmployees.length} of {employees.length} employees
              </span>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
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
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {employee.first_name?.charAt(0) || 'E'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {employee.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.email}</div>
                      {employee.phone_number && (
                        <div className="text-sm text-gray-500">{employee.phone_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.department ? (
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {employee.department.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.department.code}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No department</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(employee.is_active)}
                        <span className={`ml-2 text-sm font-medium ${
                          employee.is_active ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Employee"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Employee"
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

        {/* Add Employee Button */}
        <div className="mt-6">
          <button
            onClick={() => {
              setEditingEmployee(null);
              setFormData({ 
                first_name: '', 
                last_name: '', 
                email: '', 
                phone_number: '', 
                password: '',
                department_id: '',
                is_active: true 
              });
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {!editingEmployee && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!editingEmployee}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
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
                      {editingEmployee ? 'Update' : 'Create'}
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

export default AdminEmployees;
