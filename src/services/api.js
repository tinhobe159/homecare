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

// Customers
export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Caregivers
export const caregiversAPI = {
  getAll: () => api.get('/caregivers'),
  getById: (id) => api.get(`/caregivers/${id}`),
  create: (data) => api.post('/caregivers', data),
  update: (id, data) => api.put(`/caregivers/${id}`, data),
  delete: (id) => api.delete(`/caregivers/${id}`),
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
  getByCaregiverId: (caregiverId) => api.get(`/caregiverAvailability?caregiver_id=${caregiverId}`),
  create: (data) => api.post('/caregiverAvailability', data),
  update: (id, data) => api.put(`/caregiverAvailability/${id}`, data),
  delete: (id) => api.delete(`/caregiverAvailability/${id}`),
};

// Appointments
export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  getByCustomerId: (customerId) => api.get(`/appointments?customer_id=${customerId}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// Recurring Schedules
export const recurringSchedulesAPI = {
  getAll: () => api.get('/recurringSchedules'),
  getById: (id) => api.get(`/recurringSchedules/${id}`),
  getByCustomerId: (customerId) => api.get(`/recurringSchedules?customer_id=${customerId}`),
  create: (data) => api.post('/recurringSchedules', data),
  update: (id, data) => api.put(`/recurringSchedules/${id}`, data),
  delete: (id) => api.delete(`/recurringSchedules/${id}`),
};

// Caregiver Skills
export const caregiverSkillsAPI = {
  getAll: () => api.get('/caregiverSkills'),
  getByCaregiverId: (caregiverId) => api.get(`/caregiverSkills?caregiver_id=${caregiverId}`),
  create: (data) => api.post('/caregiverSkills', data),
  delete: (caregiverId, skillId) => api.delete(`/caregiverSkills?caregiver_id=${caregiverId}&skill_id=${skillId}`),
};

// Payments
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  getByCustomerId: (customerId) => api.get(`/payments?customer_id=${customerId}`),
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

// Users
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
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
  getByCustomerId: (customerId) => api.get(`/userRequests?customer_id=${customerId}`),
  create: (data) => api.post('/userRequests', data),
  update: (id, data) => api.put(`/userRequests/${id}`, data),
  delete: (id) => api.delete(`/userRequests/${id}`),
  convert: (id) => api.patch(`/userRequests/${id}/convert`),
};

export default api;