import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD
  ? 'https://homecare-mjhy.onrender.com'
  : 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data, error.config?.url);
    return Promise.reject(error);
  }
);

// Packages
export const packagesAPI = {
  getAll: () => api.get('/packages'),
  getById: (id) => api.get(`/packages/${id}`),
  create: (data) => api.post('/packages', data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
};

// Package Services
export const packageServicesAPI = {
  getAll: () => api.get('/packageServices'),
  getByPackageId: (packageId) => api.get(`/packageServices?package_id=${packageId}`),
  create: (data) => api.post('/packageServices', data),
  deleteByPackageId: (packageId) => api.delete(`/packageServices?package_id=${packageId}`),
};

// Services
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// Users (Unified System)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getByRole: (role) => api.get(`/users?role=${role}`),
};

// User Roles
export const userRolesAPI = {
  getAll: () => api.get('/user_roles'),
  getByUserId: (userId) => api.get(`/user_roles?user_id=${userId}`),
  create: (data) => api.post('/user_roles', data),
  update: (id, data) => api.put(`/user_roles/${id}`, data),
  delete: (id) => api.delete(`/user_roles/${id}`),
};

// Roles API
export const rolesAPI = {
  getAll: () => api.get('/roles'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
};

// Customer Profiles (for backward compatibility)
export const customersAPI = {
  getAll: () => api.get('/users').then(response => {
    // Filter users with customer role and join with customer_profiles
    return api.get('/user_roles?role_id=3').then(rolesResponse => {
      const customerUserIds = rolesResponse.data.map(role => role.user_id);
      const customerUsers = response.data.filter(user => customerUserIds.includes(user.id));
      return api.get('/customer_profiles').then(profilesResponse => {
        return {
          data: customerUsers.map(user => {
            const profile = profilesResponse.data.find(p => p.user_id === user.id);
            return { ...user, ...profile };
          })
        };
      });
    });
  }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Caregiver Profiles (for backward compatibility)
export const caregiversAPI = {
  getAll: async () => {
    try {
      // Get all users first
      const usersResponse = await api.get('/users');
      
      // Get caregiver roles (role_id: 2 = caregiver)
      const rolesResponse = await api.get('/user_roles?role_id=2');
      const caregiverUserIds = rolesResponse.data.map(role => role.user_id);
      
      // Filter users who are caregivers
      const caregiverUsers = usersResponse.data.filter(user => caregiverUserIds.includes(user.id));
      
      // Get caregiver profiles (additional data)
      const profilesResponse = await api.get('/caregiver_profiles');
      
      // Merge caregivers with their profiles (if profile exists)
      const caregiversWithProfiles = caregiverUsers.map(user => {
        const profile = profilesResponse.data.find(p => p.user_id === user.id);
        // If profile exists, merge it with user data
        return profile ? { ...user, ...profile } : user;
      });
      
      return { data: caregiversWithProfiles };
    } catch (error) {
      console.error('Error in caregiversAPI.getAll():', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      // Get the specific user
      const userResponse = await api.get(`/users/${id}`);
      
      // Check if user has caregiver role
      const rolesResponse = await api.get('/user_roles?role_id=2');
      const caregiverUserIds = rolesResponse.data.map(role => role.user_id);
      
      if (!caregiverUserIds.includes(Number(id))) {
        throw new Error('User is not a caregiver');
      }
      
      // Get caregiver profile (additional data)
      const profilesResponse = await api.get('/caregiver_profiles');
      const profile = profilesResponse.data.find(p => p.user_id === Number(id));
      
      // Merge user with profile (if profile exists)
      const caregiverWithProfile = profile ? { ...userResponse.data, ...profile } : userResponse.data;
      
      return { data: caregiverWithProfile };
    } catch (error) {
      console.error('Error in caregiversAPI.getById():', error);
      throw error;
    }
  },
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Skills
export const skillsAPI = {
  getAll: () => api.get('/skills'),
  getById: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
};

// Caregiver Availability
export const caregiverAvailabilityAPI = {
  getAll: () => api.get('/caregiverAvailability'),
  getByUserId: (userId) => api.get(`/caregiverAvailability?user_id=${userId}`),
  create: (data) => api.post('/caregiverAvailability', data),
  update: (id, data) => api.put(`/caregiverAvailability/${id}`, data),
  delete: (id) => api.delete(`/caregiverAvailability/${id}`),
};

// Appointments
export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  getByUserId: (userId) => api.get(`/appointments?user_id=${userId}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// Scheduled Packages (replaces recurringSchedules)
export const scheduledPackagesAPI = {
  getAll: () => api.get('/scheduledPackages'),
  getById: (id) => api.get(`/scheduledPackages/${id}`),
  getByUserId: (userId) => api.get(`/scheduledPackages?user_id=${userId}`),
  create: (data) => api.post('/scheduledPackages', data),
  update: (id, data) => api.put(`/scheduledPackages/${id}`, data),
  delete: (id) => api.delete(`/scheduledPackages/${id}`),
  getOccurrences: (id, from, to) => api.get(`/scheduledPackages/${id}/occurrences?from=${from}&to=${to}`),
  addException: (id, data) => api.post(`/scheduledPackages/${id}/exceptions`, data),
  removeException: (id, date) => api.delete(`/scheduledPackages/${id}/exceptions/${date}`),
  pause: (id) => api.patch(`/scheduledPackages/${id}`, { status: 'paused' }),
  resume: (id) => api.patch(`/scheduledPackages/${id}`, { status: 'active' }),
  cancel: (id) => api.patch(`/scheduledPackages/${id}`, { status: 'cancelled' })
};

// Caregiver Skills
export const caregiverSkillsAPI = {
  getAll: () => api.get('/caregiverSkills'),
  getByUserId: (userId) => api.get(`/caregiverSkills?user_id=${userId}`),
  create: (data) => api.post('/caregiverSkills', data),
  delete: (userId, skillId) => api.delete(`/caregiverSkills?user_id=${userId}&skill_id=${skillId}`),
};

// Payments
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  getByUserId: (userId) => api.get(`/payments?user_id=${userId}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
};

// Addresses
export const addressesAPI = {
  getAll: () => api.get('/addresses'),
  getById: (id) => api.get(`/addresses/${id}`),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
};

// EVV Records
export const evvRecordsAPI = {
  getAll: () => api.get('/evvRecords'),
  getById: (id) => api.get(`/evvRecords/${id}`),
  create: (data) => api.post('/evvRecords', data),
  update: (id, data) => api.put(`/evvRecords/${id}`, data),
  delete: (id) => api.delete(`/evvRecords/${id}`),
};

// Audit Logs
export const auditLogsAPI = {
  getAll: () => api.get('/auditLogs'),
  create: (data) => api.post('/auditLogs', data),
};

// User Requests
export const userRequestsAPI = {
  getAll: () => api.get('/userRequests'),
  getById: (id) => api.get(`/userRequests/${id}`),
  getByUserId: (userId) => api.get(`/userRequests?user_id=${userId}`),
  create: (data) => api.post('/userRequests', data),
  update: (id, data) => api.put(`/userRequests/${id}`, data),
  delete: (id) => api.delete(`/userRequests/${id}`),
  convert: (id) => api.patch(`/userRequests/${id}/convert`),
};

// Departments API
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Administrator Profiles API
export const administratorProfilesAPI = {
  getAll: () => api.get('/administrator_profiles'),
  getById: (id) => api.get(`/administrator_profiles/${id}`),
  create: (data) => api.post('/administrator_profiles', data),
  update: (id, data) => api.put(`/administrator_profiles/${id}`, data),
  delete: (id) => api.delete(`/administrator_profiles/${id}`),
};

export default api;