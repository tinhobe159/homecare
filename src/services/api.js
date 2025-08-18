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
  getAll: () => api.get('/package_services'),
  getByPackageId: (packageId) => api.get(`/package_services?package_id=${packageId}`),
  create: (data) => api.post('/package_services', data),
  deleteByPackageId: (packageId) => api.delete(`/package_services?package_id=${packageId}`),
};

// Task Packages (Care Plan Packages)
export const taskPackagesAPI = {
  getAll: () => api.get('/task_packages'),
  getById: (id) => api.get(`/task_packages/${id}`),
  getByCustomerId: (customerId) => api.get(`/task_packages?customer_id=${customerId}`),
  create: (data) => api.post('/task_packages', data),
  update: (id, data) => api.put(`/task_packages/${id}`, data),
  delete: (id) => api.delete(`/task_packages/${id}`),
};

// Task Package Services (Care Plan Task Services)
export const taskPackageServicesAPI = {
  getAll: () => api.get('/task_package_services'),
  getByTaskPackageId: (taskPackageId) => api.get(`/task_package_services?task_package_id=${taskPackageId}`),
  create: (data) => api.post('/task_package_services', data),
  deleteByTaskPackageId: (taskPackageId) => api.delete(`/task_package_services?task_package_id=${taskPackageId}`),
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
  getByUserId: (user_id) => api.get(`/user_roles?user_id=${user_id}`),
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
  getAll: async () => {
    try {
      // Get all users
      const usersResponse = await api.get('/users');
      // Get customer roles (role_id: 3 = customer)
      const rolesResponse = await api.get('/user_roles?role_id=3');
      const customer_user_ids = rolesResponse.data.map(role => role.user_id);
      // Filter users who are customers
      const customerUsers = usersResponse.data.filter(user => customer_user_ids.includes(user.id));
      // Get customer profiles (additional data)
      const profilesResponse = await api.get('/customer_profiles');
      // Merge customers with their profiles (if profile exists)
      const customersWithProfiles = customerUsers.map(user => {
        const profile = profilesResponse.data.find(p => p.user_id === user.id);
        if (profile) {
          const { id: profileId, ...profileData } = profile;
          return { ...user, ...profileData };
        }
        return user;
      });
      return { data: customersWithProfiles };
    } catch (error) {
      console.error('Error in customersAPI.getAll():', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      // Get the specific user
      const userResponse = await api.get(`/users/${id}`);
      // Check if user has customer role
      const rolesResponse = await api.get('/user_roles?role_id=3');
      const customer_user_ids = rolesResponse.data.map(role => role.user_id);
      if (!customer_user_ids.includes(Number(id))) {
        throw new Error('User is not a customer');
      }
      // Get customer profile (additional data)
      const profilesResponse = await api.get('/customer_profiles');
      const profile = profilesResponse.data.find(p => p.user_id === Number(id));
      if (profile) {
        const { id: profileId, ...profileData } = profile;
        const customerWithProfile = { ...userResponse.data, ...profileData };
        return { data: customerWithProfile };
      }
      return { data: userResponse.data };
    } catch (error) {
      console.error('Error in customersAPI.getById():', error);
      throw error;
    }
  },
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
      const caregiver_user_ids = rolesResponse.data.map(role => role.user_id);
      
      // Filter users who are caregivers
      const caregiverUsers = usersResponse.data.filter(user => caregiver_user_ids.includes(user.id));
      
      // Get caregiver profiles (additional data)
      const profilesResponse = await api.get('/caregiver_profiles');
      
      // Merge caregivers with their profiles (if profile exists)
      const caregiversWithProfiles = caregiverUsers.map(user => {
        const profile = profilesResponse.data.find(p => p.user_id === user.id);
        // If profile exists, merge it with user data, but preserve user.id
        if (profile) {
          const { id: profileId, ...profileData } = profile; // Remove profile.id to avoid conflict
          return { ...user, ...profileData };
        }
        return user;
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
      
      // Get caregiver profile (additional data)
      const profilesResponse = await api.get('/caregiver_profiles');
      const profile = profilesResponse.data.find(p => p.user_id === Number(id));
      
      // Merge user with profile (if profile exists)
      const caregiverWithProfile = profile ? { ...userResponse.data, ...profile } : userResponse.data;
      
      // Remove profile.id to avoid conflict with user.id
      if (profile) {
        const { id: profileId, ...profileData } = profile;
        const caregiverWithProfile = { ...userResponse.data, ...profileData };
        return { data: caregiverWithProfile };
      }
      
      return { data: userResponse.data };
    } catch (error) {
      console.error('Error in caregiversAPI.getById():', error);
      throw error;
    }
  },
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Caregiver Profiles
export const caregiverProfilesAPI = {
  getAll: () => api.get('/caregiver_profiles'),
  getById: (id) => api.get(`/caregiver_profiles/${id}`),
  getByUserId: (user_id) => api.get(`/caregiver_profiles?user_id=${user_id}`),
  create: (data) => api.post('/caregiver_profiles', data),
  update: (id, data) => api.put(`/caregiver_profiles/${id}`, data),
  delete: (id) => api.delete(`/caregiver_profiles/${id}`),
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
  getAll: () => api.get('/caregiver_availability'),
  getByUserId: (user_id) => api.get(`/caregiver_availability?caregiver_id=${user_id}`),
  create: (data) => api.post('/caregiver_availability', data),
  update: (id, data) => api.put(`/caregiver_availability/${id}`, data),
  delete: (id) => api.delete(`/caregiver_availability/${id}`),
};

// Appointments
export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  getByUserId: (user_id) => api.get(`/appointments?user_id=${user_id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// Scheduled Packages (replaces recurringSchedules)
export const scheduledPackagesAPI = {
  getAll: () => api.get('/scheduled_packages'),
  getById: (id) => api.get(`/scheduled_packages/${id}`),
  getByUserId: (user_id) => api.get(`/scheduled_packages?user_id=${user_id}`),
  create: (data) => api.post('/scheduled_packages', data),
  update: (id, data) => api.put(`/scheduled_packages/${id}`, data),
  delete: (id) => api.delete(`/scheduled_packages/${id}`),
  getOccurrences: (id, from, to) => api.get(`/scheduled_packages/${id}/occurrences?from=${from}&to=${to}`),
  addException: (id, data) => api.post(`/scheduled_packages/${id}/exceptions`, data),
  removeException: (id, date) => api.delete(`/scheduled_packages/${id}/exceptions/${date}`),
  pause: (id) => api.patch(`/scheduled_packages/${id}`, { status: 'paused' }),
  resume: (id) => api.patch(`/scheduled_packages/${id}`, { status: 'active' }),
  cancel: (id) => api.patch(`/scheduled_packages/${id}`, { status: 'cancelled' })
};

// Caregiver Skills
export const caregiverSkillsAPI = {
  getAll: () => api.get('/caregiver_skills'),
  getByUserId: (user_id) => api.get(`/caregiver_skills?user_id=${user_id}`),
  create: (data) => api.post('/caregiver_skills', data),
  delete: (user_id, skill_id) => api.delete(`/caregiver_skills?user_id=${user_id}&skill_id=${skill_id}`),
};

// Payments
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  getByUserId: (user_id) => api.get(`/payments?user_id=${user_id}`),
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

// Allergies API
export const allergiesAPI = {
  getAll: () => api.get('/allergies'),
  getById: (id) => api.get(`/allergies/${id}`),
  getByCustomerId: (customer_id) => api.get(`/allergies?customer_id=${customer_id}`),
  create: (data) => api.post('/allergies', data),
  update: (id, data) => api.put(`/allergies/${id}`, data),
  delete: (id) => api.delete(`/allergies/${id}`),
};

// Medications API
export const medicationsAPI = {
  getAll: () => api.get('/medications'),
  getById: (id) => api.get(`/medications/${id}`),
  getByCustomerId: (customer_id) => api.get(`/medications?customer_id=${customer_id}`),
  create: (data) => api.post('/medications', data),
  update: (id, data) => api.put(`/medications/${id}`, data),
  delete: (id) => api.delete(`/medications/${id}`),
};

// Medical Conditions API
export const medicalConditionsAPI = {
  getAll: () => api.get('/medical_conditions'),
  getById: (id) => api.get(`/medical_conditions/${id}`),
  getByCustomerId: (customer_id) => api.get(`/medical_conditions?customer_id=${customer_id}`),
  create: (data) => api.post('/medical_conditions', data),
  update: (id, data) => api.put(`/medical_conditions/${id}`, data),
  delete: (id) => api.delete(`/medical_conditions/${id}`),
};

// Health Records API
export const healthRecordsAPI = {
  getAll: () => api.get('/health_records'),
  getById: (id) => api.get(`/health_records/${id}`),
  getByCustomerId: (customer_id) => api.get(`/health_records?customer_id=${customer_id}`),
  create: (data) => api.post('/health_records', data),
  update: (id, data) => api.put(`/health_records/${id}`, data),
  delete: (id) => api.delete(`/health_records/${id}`),
};

// Emergency Contacts API
export const emergencyContactsAPI = {
  getAll: () => api.get('/emergency_contacts'),
  getById: (id) => api.get(`/emergency_contacts/${id}`),
  getByCustomerId: (customer_id) => api.get(`/emergency_contacts?customer_id=${customer_id}`),
  create: (data) => api.post('/emergency_contacts', data),
  update: (id, data) => api.put(`/emergency_contacts/${id}`, data),
  delete: (id) => api.delete(`/emergency_contacts/${id}`),
};

// Feedback API
export const feedbackAPI = {
  getAll: () => api.get('/feedback'),
  getById: (id) => api.get(`/feedback/${id}`),
  getByCustomerId: (customer_id) => api.get(`/feedback?customer_id=${customer_id}`),
  getByCaregiverId: (caregiver_id) => api.get(`/feedback?caregiver_id=${caregiver_id}`),
  create: (data) => api.post('/feedback', data),
  update: (id, data) => api.put(`/feedback/${id}`, data),
  delete: (id) => api.delete(`/feedback/${id}`),
};

// Invoice Line Items API
export const invoiceLineItemsAPI = {
  getAll: () => api.get('/invoice_line_items'),
  getById: (id) => api.get(`/invoice_line_items/${id}`),
  getByInvoiceId: (invoice_id) => api.get(`/invoice_line_items?invoice_id=${invoice_id}`),
  create: (data) => api.post('/invoice_line_items', data),
  update: (id, data) => api.put(`/invoice_line_items/${id}`, data),
  delete: (id) => api.delete(`/invoice_line_items/${id}`),
};

// Time Off Requests API
export const timeOffRequestsAPI = {
  getAll: () => api.get('/time_off_requests'),
  getById: (id) => api.get(`/time_off_requests/${id}`),
  getByCaregiverId: (caregiver_id) => api.get(`/time_off_requests?caregiver_id=${caregiver_id}`),
  getByStatus: (status) => api.get(`/time_off_requests?status=${status}`),
  create: (data) => api.post('/time_off_requests', data),
  update: (id, data) => api.put(`/time_off_requests/${id}`, data),
  approve: (id) => api.patch(`/time_off_requests/${id}`, { status: 'approved' }),
  deny: (id) => api.patch(`/time_off_requests/${id}`, { status: 'denied' }),
  delete: (id) => api.delete(`/time_off_requests/${id}`),
};

// EVV Records
export const evvRecordsAPI = {
  getAll: () => api.get('/evv_records'),
  getById: (id) => api.get(`/evv_records/${id}`),
  getByAppointmentId: (appointmentId) => api.get(`/evv_records?appointment_id=${appointmentId}`),
  getByCaregiverId: (caregiverId) => api.get(`/evv_records?caregiverId=${caregiverId}`),
  create: (data) => api.post('/evv_records', data),
  update: (id, data) => api.put(`/evv_records/${id}`, data),
  delete: (id) => api.delete(`/evv_records/${id}`),
  
  // Enhanced EVV functions for GPS tracking and task completion
  checkIn: async (data) => {
    const checkInData = {
      ...data,
      check_in_time: new Date().toISOString(),
      status: 'in_progress'
    };
    return api.post('/evv_records', checkInData);
  },
  
  checkOut: async (id, data) => {
    const checkOutData = {
      ...data,
      check_out_time: new Date().toISOString(),
      status: 'completed'
    };
    return api.put(`/evv_records/${id}`, checkOutData);
  },
  
  updateLocation: (id, locationData) => {
    return api.patch(`/evv_records/${id}/location`, locationData);
  },
  
  completeTask: (id, taskData) => {
    return api.patch(`/evv_records/${id}/tasks`, taskData);
  },
  
  addSupervisorVerification: (id, verificationData) => {
    return api.patch(`/evv_records/${id}/supervisor-verification`, verificationData);
  },
  
  // GPS and compliance validations
  validateLocation: (appointmentId, currentLocation) => {
    return api.post(`/evv_records/validate-location`, {
      appointment_id: appointmentId,
      currentLocation
    });
  },
  
  // Performance and compliance reports
  getComplianceReport: (startDate, endDate, caregiverId = null) => {
    const params = new URLSearchParams({ startDate, endDate });
    if (caregiverId) params.append('caregiverId', caregiverId);
    return api.get(`/evv_records/compliance-report?${params.toString()}`);
  },
  
  getPendingVerifications: () => {
    return api.get('/evv_records?supervisorVerification.verified=false');
  }
};

// Audit Logs
export const auditLogsAPI = {
  getAll: () => api.get('/audit_logs'),
  create: (data) => api.post('/audit_logs', data),
};

// User Requests
export const userRequestsAPI = {
  getAll: () => api.get('/user_requests'),
  getById: (id) => api.get(`/user_requests/${id}`),
  getByUserId: (user_id) => api.get(`/user_requests?user_id=${user_id}`),
  create: (data) => api.post('/user_requests', data),
  update: (id, data) => api.put(`/user_requests/${id}`, data),
  delete: (id) => api.delete(`/user_requests/${id}`),
  convert: (id) => api.patch(`/user_requests/${id}/convert`),
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

// Performance Metrics API
export const performanceMetricsAPI = {
  getAll: () => api.get('/performance_metrics'),
  getById: (id) => api.get(`/performance_metrics/${id}`),
  getByCaregiverId: (caregiverId) => api.get(`/performance_metrics?caregiverId=${caregiverId}`),
  getByPeriod: (period) => api.get(`/performance_metrics?reportingPeriod=${period}`),
  create: (data) => api.post('/performance_metrics', data),
  update: (id, data) => api.put(`/performance_metrics/${id}`, data),
  delete: (id) => api.delete(`/performance_metrics/${id}`),
  
  // Calculate performance metrics for a caregiver
  calculateMetrics: (caregiverId, startDate, endDate) => {
    return api.post('/performance_metrics/calculate', {
      caregiverId,
      startDate,
      endDate
    });
  },
  
  // Generate performance reports
  getPerformanceReport: (caregiverId, period) => {
    return api.get(`/performance_metrics/report/${caregiverId}?period=${period}`);
  },
  
  // Get performance dashboard data
  getDashboardData: (dateRange = 'month') => {
    return api.get(`/performance_metrics/dashboard?range=${dateRange}`);
  },
  
  // Compare caregiver performance
  comparePerformance: (caregiverIds, period) => {
    return api.post('/performance_metrics/compare', {
      caregiverIds,
      period
    });
  }
};

// Payroll API Services
export const payrollAPI = {
  // Pay Periods
  getPayPeriods: () => api.get('/pay_periods'),
  getPayPeriod: (id) => api.get(`/pay_periods/${id}`),
  createPayPeriod: (data) => api.post('/pay_periods', data),
  updatePayPeriod: (id, data) => api.put(`/pay_periods/${id}`, data),
  closePayPeriod: (id) => api.patch(`/pay_periods/${id}`, { status: 'closed', approved_at: new Date().toISOString() }),
  
  // Time Sheets
  getTimeSheets: (pay_period_id = null) => {
    const url = pay_period_id ? `/time_sheets?pay_period_id=${pay_period_id}` : '/time_sheets';
    return api.get(url);
  },
  getTimeSheet: (id) => api.get(`/time_sheets/${id}`),
  createTimeSheet: (data) => api.post('/time_sheets', data),
  updateTimeSheet: (id, data) => api.put(`/time_sheets/${id}`, data),
  approveTimeSheet: (id) => api.patch(`/time_sheets/${id}`, { 
    status: 'approved', 
    approved_at: new Date().toISOString() 
  }),
  
  // Calculate timesheet from EVV records
  calculateTimeFromEVV: (caregiverId, pay_period_id) => {
    return api.post('/time_sheets/calculate', {
      caregiverId,
      pay_period_id
    });
  },
  
  // Payroll Adjustments
  getAdjustments: (time_sheet_id = null) => {
    const url = time_sheet_id ? `/payroll_adjustments?time_sheet_id=${time_sheet_id}` : '/payroll_adjustments';
    return api.get(url);
  },
  addAdjustment: (data) => api.post('/payroll_adjustments', data),
  updateAdjustment: (id, data) => api.put(`/payroll_adjustments/${id}`, data),
  deleteAdjustment: (id) => api.delete(`/payroll_adjustments/${id}`),
  
  // Time Disputes
  getDisputes: (status = null) => {
    const url = status ? `/time_disputes?status=${status}` : '/time_disputes';
    return api.get(url);
  },
  getDispute: (id) => api.get(`/time_disputes/${id}`),
  createDispute: (data) => api.post('/time_disputes', data),
  resolveDispute: (id, resolution) => api.patch(`/time_disputes/${id}`, {
    status: 'resolved',
    resolution,
    resolvedAt: new Date().toISOString()
  }),
  
  // Payroll Reports
  getPayrollReports: () => api.get('/payroll_reports'),
  generatePayrollReport: (pay_period_id) => api.post('/payroll_reports', { pay_period_id }),
  
  // Payroll calculations
  calculatePayroll: (caregiverId, startDate, endDate) => {
    return api.post('/payroll/calculate', {
      caregiverId,
      startDate,
      endDate
    });
  },
  
  // Export payroll data
  exportPayroll: (pay_period_id, format = 'csv') => {
    return api.get(`/payroll/export/${pay_period_id}?format=${format}`);
  }
};

// Time Calculation Utilities
export const timeCalculationUtils = {
  // Calculate total hours from EVV records
  calculateHoursFromEVV: (evv_records) => {
    return evv_records.reduce((total, record) => {
      if (record.check_in_time && record.check_out_time) {
        const checkIn = new Date(record.check_in_time);
        const checkOut = new Date(record.check_out_time);
        const hours = (checkOut - checkIn) / (1000 * 60 * 60); // Convert ms to hours
        return total + hours;
      }
      return total;
    }, 0);
  },
  
  // Calculate overtime hours (over 40 hours per week)
  calculateOvertime: (hoursWorked, regularHoursLimit = 40) => {
    return Math.max(0, hoursWorked - regularHoursLimit);
  },
  
  // Calculate gross pay with overtime
  calculateGrossPay: (regularHours, overtimeHours, hourly_rate, overtime_rate = null) => {
    const overtimeMultiplier = overtime_rate || (hourly_rate * 1.5);
    return (regularHours * hourly_rate) + (overtimeHours * overtimeMultiplier);
  },
  
  // Calculate deductions (simplified)
  calculateDeductions: (gross_pay) => {
    const federalTaxRate = 0.12; // 12%
    const stateTaxRate = 0.05; // 5%
    const socialSecurityRate = 0.062; // 6.2%
    const medicareRate = 0.0145; // 1.45%
    
    return {
      federalTax: gross_pay * federalTaxRate,
      stateTax: gross_pay * stateTaxRate,
      socialSecurity: gross_pay * socialSecurityRate,
      medicare: gross_pay * medicareRate,
      get total() {
        return this.federalTax + this.stateTax + this.socialSecurity + this.medicare;
      }
    };
  },
  
  // Format currency for display
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },
  
  // Format hours for display
  formatHours: (hours) => {
    return parseFloat(hours).toFixed(2);
  }
};

// Insurance & Billing Integration API - Phase 2.2
export const insuranceAPI = {
  // Get all insurance providers
  getInsuranceProviders: async () => {
    try {
      // Mock data for testing when server is unavailable
      const mockProviders = [
        {
          id: "ip_001",
          name: "Blue Cross Blue Shield",
          providerType: "Medicare",
          contact_phone: "1-800-555-0123",
          contact_email: "provider@bcbs.com",
          address: "123 Insurance Ave, Healthcare City, HC 12345",
          claim_submission_url: "https://api.bcbs.com/claims",
          authorization_required: true,
          coverage_types: ["Home Health", "Personal Care", "Skilled Nursing"],
          max_session_length: 8,
          max_daily_hours: 16,
          prior_auth_days: 30,
          reimbursement_rate: 45.50,
          is_active: true,
          created_at: "2025-08-01T00:00:00Z",
          updated_at: "2025-08-15T00:00:00Z"
        },
        {
          id: "ip_002",
          name: "United Healthcare",
          providerType: "Medicare Advantage",
          contact_phone: "1-800-555-0456",
          contact_email: "claims@uhc.com",
          address: "456 Coverage Blvd, Benefits Town, BT 67890",
          claim_submission_url: "https://api.uhc.com/submissions",
          authorization_required: true,
          coverage_types: ["Personal Care", "Companion Care", "Respite Care"],
          max_session_length: 6,
          max_daily_hours: 12,
          prior_auth_days: 14,
          reimbursement_rate: 42.75,
          is_active: true,
          created_at: "2025-08-01T00:00:00Z",
          updated_at: "2025-08-15T00:00:00Z"
        },
        {
          id: "ip_003",
          name: "Medicaid State Program",
          providerType: "Medicaid",
          contact_phone: "1-800-555-0789",
          contact_email: "claims@statemedicaid.gov",
          address: "789 State Benefits Dr, Capitol City, CC 13579",
          claim_submission_url: "https://api.medicaid.state.gov/claims",
          authorization_required: false,
          coverage_types: ["Home Health", "Personal Care", "Medical Transportation"],
          max_session_length: 12,
          max_daily_hours: 24,
          prior_auth_days: 0,
          reimbursement_rate: 38.25,
          is_active: true,
          created_at: "2025-08-01T00:00:00Z",
          updated_at: "2025-08-15T00:00:00Z"
        }
      ];
      
      return { data: mockProviders };
    } catch (error) {
      console.error('Error fetching insurance providers:', error);
      throw error;
    }
  },
  
  // Auto-generate claims from EVV records
  generateClaimFromEVV: (evv_record_id) => {
    return api.post('/insurance_claims/generate', { evv_record_id });
  },
  
  // Batch claim submission
  submitClaimsBatch: (claimIds) => {
    return api.post('/insurance_claims/batch-submit', { claimIds });
  },
  
  // Get all claims
  getClaims: () => api.get('/insurance_claims'),
  
  // Claim status tracking
  getClaimsByProvider: (providerId) => api.get(`/insurance_claims?insurance_provider=${providerId}`),
  getClaimsByDateRange: (startDate, endDate) => {
    return api.get(`/insurance_claims?service_date_gte=${startDate}&service_date_lte=${endDate}`);
  },
  
  // Insurance Providers
  getProviders: () => api.get('/insurance_providers'),
  getProvider: (id) => api.get(`/insurance_providers/${id}`),
  updateProvider: (id, data) => api.put(`/insurance_providers/${id}`, data),
  
  // Service Codes
  getServiceCodes: () => api.get('/service_codes'),
  getServiceCode: (code) => api.get(`/service_codes/${code}`),
  validateServiceCode: (code, insurance_provider) => {
    return api.post('/service_codes/validate', { code, insurance_provider });
  }
};

export const billingAPI = {
  // Invoices
  getInvoices: (status = null) => {
    const url = status ? `/invoices?status=${status}` : '/invoices';
    return api.get(url);
  },
  getInvoice: (id) => api.get(`/invoices/${id}`),
  createInvoice: (data) => api.post('/invoices', data),
  updateInvoice: (id, data) => api.put(`/invoices/${id}`, data),
  
  // Generate invoice from EVV record
  generateInvoiceFromEVV: (evv_record_id) => {
    return api.post('/invoices/generate', { evv_record_id });
  },
  
  // Invoice processing
  markAsPaid: (id, paymentData) => api.patch(`/invoices/${id}`, {
    status: 'paid',
    paidDate: new Date().toISOString(),
    paymentMethod: paymentData.method,
    ...paymentData
  }),
  markAsOverdue: (id) => api.patch(`/invoices/${id}`, { status: 'overdue' }),
  
  // Billing reports
  getRevenueReport: (startDate, endDate) => {
    return api.get(`/invoices/revenue-report?start=${startDate}&end=${endDate}`);
  },
  getAgingreport: () => api.get('/invoices/aging-report'),
  getCollectionsReport: (period) => api.get(`/invoices/collections-report?period=${period}`),
  
  // Customer billing
  getCustomerInvoices: (customerId) => api.get(`/invoices?customerId=${customerId}`),
  getOutstandingBalance: (customerId) => api.get(`/invoices/outstanding/${customerId}`),
  
  // Payment processing
  processPayment: (invoiceId, paymentData) => {
    return api.post(`/invoices/${invoiceId}/payments`, paymentData);
  },
  
  // Insurance coordination
  submitToInsurance: (invoiceId) => {
    return api.post(`/invoices/${invoiceId}/submit-insurance`);
  },
  processInsurancePayment: (invoiceId, insurancePayment) => {
    return api.post(`/invoices/${invoiceId}/insurance-payment`, insurancePayment);
  }
};

export const complianceAPI = {
  // Compliance Documents
  getDocuments: (customerId = null) => {
    const url = customerId ? `/compliance_documents?customerId=${customerId}` : '/compliance_documents';
    return api.get(url);
  },
  getDocument: (id) => api.get(`/compliance_documents/${id}`),
  createDocument: (data) => api.post('/compliance_documents', data),
  updateDocument: (id, data) => api.put(`/compliance_documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/compliance_documents/${id}`),
  
  // Document status management
  markAsActive: (id) => api.patch(`/compliance_documents/${id}`, { status: 'active' }),
  markAsExpired: (id) => api.patch(`/compliance_documents/${id}`, { status: 'expired' }),
  markAsExpiringSoon: (id) => api.patch(`/compliance_documents/${id}`, { status: 'expiring_soon' }),
  
  // Compliance reporting
  getComplianceReport: (startDate, endDate) => {
    return api.get(`/compliance_documents/report?start=${startDate}&end=${endDate}`);
  },
  getExpiringDocuments: (daysAhead = 30) => {
    return api.get(`/compliance_documents/expiring?days=${daysAhead}`);
  },
  getDocumentsByType: (documentType) => {
    return api.get(`/compliance_documents?documentType=${documentType}`);
  },
  
  // EVV compliance validation
  validateEVVCompliance: (evv_record_id) => {
    return api.post('/compliance_documents/validate-evv', { evv_record_id });
  },
  
  // Generate compliance packages
  generateCompliancePackage: (customerId, startDate, endDate) => {
    return api.post('/compliance_documents/generate-package', {
      customerId,
      startDate,
      endDate
    });
  }
};

// Revenue Management Utilities
export const revenueUtils = {
  // Calculate revenue from invoices
  calculateTotalRevenue: (invoices) => {
    return invoices.reduce((total, invoice) => total + (invoice.total_amount || 0), 0);
  },
  
  // Calculate collections efficiency
  calculateCollectionsRate: (totalBilled, totalCollected) => {
    return totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;
  },
  
  // Calculate average processing time
  calculateAverageProcessingTime: (claims) => {
    const processedClaims = claims.filter(claim => claim.processed_at && claim.submitted_at);
    if (processedClaims.length === 0) return 0;
    
    const totalDays = processedClaims.reduce((total, claim) => {
      const submitted = new Date(claim.submitted_at);
      const processed = new Date(claim.processed_at);
      const days = (processed - submitted) / (1000 * 60 * 60 * 24);
      return total + days;
    }, 0);
    
    return totalDays / processedClaims.length;
  },
  
  // Calculate denial rate
  calculateDenialRate: (claims) => {
    const totalClaims = claims.length;
    const deniedClaims = claims.filter(claim => claim.status === 'denied').length;
    return totalClaims > 0 ? (deniedClaims / totalClaims) * 100 : 0;
  },
  
  // Calculate reimbursement rate
  calculateReimbursementRate: (claims) => {
    const totalClaimed = claims.reduce((total, claim) => total + claim.amount_claimed, 0);
    const totalApproved = claims.reduce((total, claim) => total + (claim.amount_approved || 0), 0);
    return totalClaimed > 0 ? (totalApproved / totalClaimed) * 100 : 0;
  },
  
  // Format financial metrics
  formatMetric: (value, type = 'currency') => {
    // Handle null, undefined, or NaN values
    if (value === null || value === undefined || isNaN(value)) {
      value = 0;
    }
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'percentage':
        return `${parseFloat(value).toFixed(1)}%`;
      case 'days':
        return `${parseFloat(value).toFixed(1)} days`;
      default:
        return parseFloat(value).toFixed(2);
    }
  }
};

// Billing Automation Utilities
export const billingAutomationUtils = {
  // Auto-generate invoice from EVV record
  generateInvoiceFromEVV: async (evvRecord) => {
    try {
      // Get customer and service information
      const customer = await api.get(`/users/${evvRecord.customer_id}`);
      const appointment = await api.get(`/appointments/${evvRecord.appointment_id}`);
      
      // Calculate service duration and cost
      const checkIn = new Date(evvRecord.check_in_time);
      const checkOut = new Date(evvRecord.check_out_time);
      const hours = (checkOut - checkIn) / (1000 * 60 * 60);
      
      // Determine service code and rate based on appointment type
      const serviceMapping = {
        'personal_care': { code: 'T1019', rate: 25.0 },
        'skilled_care': { code: 'T1020', rate: 35.0 },
        'attendant_care': { code: 'S5125', rate: 22.5 },
        'companion_care': { code: 'SELF_PAY', rate: 30.0 }
      };
      
      const service = serviceMapping[appointment.serviceType] || serviceMapping['personal_care'];
      const amount = hours * service.rate;
      
      // Check for insurance coverage
      const insuranceInfo = customer.data.insurance_provider ? {
        insuranceCoverage: amount * 0.9, // Assume 90% coverage
        copay: amount * 0.1
      } : {
        insuranceCoverage: 0,
        copay: 0
      };
      
      const invoiceData = {
        customerId: evvRecord.customer_id,
        customerName: `${customer.data.first_name} ${customer.data.last_name}`,
        invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        service_date: evvRecord.service_date,
        services: [{
          description: service.code === 'SELF_PAY' ? 'Companion Care Services' : 'Personal Care Services',
          serviceCode: service.code,
          hours: parseFloat(hours.toFixed(2)),
          rate: service.rate,
          amount: amount,
          evv_record_id: evvRecord.id
        }],
        subtotal: amount,
        tax: service.code === 'SELF_PAY' ? amount * 0.08 : 0, // 8% tax for self-pay
        ...insuranceInfo,
        total: amount - insuranceInfo.insuranceCoverage + (service.code === 'SELF_PAY' ? amount * 0.08 : 0),
        amount_due: amount - insuranceInfo.insuranceCoverage + (service.code === 'SELF_PAY' ? amount * 0.08 : 0),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        status: 'pending',
        notes: customer.data.insurance_provider ? `Covered by ${customer.data.insurance_provider}` : 'Self-pay customer',
        created_at: new Date().toISOString()
      };
      
      return invoiceData;
    } catch (error) {
      console.error('Error generating invoice from EVV:', error);
      throw error;
    }
  },
  
  // Auto-generate insurance claim from EVV record
  generateClaimFromEVV: async (evvRecord) => {
    try {
      const customer = await api.get(`/users/${evvRecord.customer_id}`);
      const appointment = await api.get(`/appointments/${evvRecord.appointment_id}`);
      
      if (!customer.data.insurance_provider) {
        throw new Error('Customer does not have insurance coverage');
      }
      
      // Calculate service duration
      const checkIn = new Date(evvRecord.check_in_time);
      const checkOut = new Date(evvRecord.check_out_time);
      const hours = (checkOut - checkIn) / (1000 * 60 * 60);
      const units = Math.ceil(hours * 4); // Convert to 15-minute units
      
      // Get insurance provider info
      const provider = await api.get(`/insuranceProviders/${customer.data.insurance_provider.toLowerCase().replace(' ', '_')}`);
      
      // Determine service code
      const serviceMapping = {
        'personal_care': 'T1019',
        'skilled_care': 'T1020',
        'attendant_care': 'S5125'
      };
      
      const serviceCode = serviceMapping[appointment.serviceType] || 'T1019';
      const unitRate = provider.data.reimbursement_rates[serviceCode] || 25.0;
      
      const claimData = {
        customerId: evvRecord.customer_id,
        insurance_provider: customer.data.insurance_provider,
        providerNumber: "1234567890", // Your provider number
        member_number: customer.data.memberNumber || `${customer.data.insurance_provider.substring(0,3).toUpperCase()}${customer.data.id}${Math.random().toString(36).substring(2,8).toUpperCase()}`,
        service_date: evvRecord.service_date,
        services: [{
          serviceCode: serviceCode,
          description: appointment.serviceType.replace('_', ' ').toUpperCase(),
          units: units,
          unitRate: unitRate,
          total_amount: units * unitRate,
          modifiers: provider.data.requiredModifiers || ["U1"]
        }],
        evv_record_id: evvRecord.id,
        caregiverId: evvRecord.caregiver_id,
        total_amount: units * unitRate,
        approvedAmount: units * unitRate, // Initial amount, may be adjusted by insurance
        status: 'draft',
        created_at: new Date().toISOString()
      };
      
      return claimData;
    } catch (error) {
      console.error('Error generating claim from EVV:', error);
      throw error;
    }
  }
};

// === FAMILY PORTAL API - PHASE 2.3 ===
export const familyPortalAPI = {
  // Get family members for a customer
  getFamilyMembers: async (customerId) => {
    try {
      const mockMembers = [
        {
          id: "fm_001",
          customerId: customerId,
          name: "Sarah Johnson",
          relationship: "Daughter",
          email: "sarah.johnson@email.com",
          phone: "(555) 123-4567",
          is_emergency_contact: true,
          is_primary_contact: true,
          receive_updates: true,
          receive_photos: true,
          receive_reports: true,
          created_at: "2025-08-01T00:00:00Z",
          last_login_at: "2025-08-17T14:30:00Z"
        },
        {
          id: "fm_002",
          customerId: customerId,
          name: "Michael Johnson",
          relationship: "Son",
          email: "michael.johnson@email.com",
          phone: "(555) 234-5678",
          is_emergency_contact: false,
          is_primary_contact: false,
          receive_updates: true,
          receive_photos: false,
          receive_reports: true,
          created_at: "2025-08-01T00:00:00Z",
          last_login_at: "2025-08-16T09:15:00Z"
        }
      ];
      return { data: mockMembers };
    } catch (error) {
      console.error('Error fetching family members:', error);
      throw error;
    }
  },

  // Get care updates for a customer
  getCareUpdates: async (customerId, limit = 10) => {
    try {
      const mockUpdates = [
        {
          id: "cu_001",
          customerId: customerId,
          caregiverId: 12,
          caregiverName: "Maria Garcia",
          updateType: "care_note",
          title: "Morning Care Completed",
          message: "Assisted with morning routine, medication reminder completed. Patient was in good spirits and enjoyed breakfast.",
          timestamp: "2025-08-18T09:30:00Z",
          photos: [
            {
              id: "photo_001",
              url: "/photos/morning_care_001.jpg",
              caption: "Enjoying breakfast",
              uploadedAt: "2025-08-18T09:35:00Z"
            }
          ],
          vitals: {
            bloodPressure: "120/80",
            heartRate: 72,
            temperature: 98.6
          },
          mood: "Good",
          activities: ["Breakfast", "Medication", "Light Exercise"],
          isRead: false
        },
        {
          id: "cu_002",
          customerId: customerId,
          caregiverId: 14,
          caregiverName: "James Wilson",
          updateType: "medication",
          title: "Medication Administered",
          message: "All scheduled medications administered on time. Blood pressure medication taken with breakfast.",
          timestamp: "2025-08-18T08:00:00Z",
          medications: [
            {
              name: "Lisinopril",
              dosage: "10mg",
              administeredAt: "2025-08-18T08:00:00Z"
            },
            {
              name: "Metformin",
              dosage: "500mg",
              administeredAt: "2025-08-18T08:00:00Z"
            }
          ],
          isRead: true
        },
        {
          id: "cu_003",
          customerId: customerId,
          caregiverId: 12,
          caregiverName: "Maria Garcia",
          updateType: "emergency",
          title: "Minor Fall - No Injury",
          message: "Client experienced a minor stumble in the bathroom but caught themselves. No injuries sustained. Reviewed safety protocols.",
          timestamp: "2025-08-17T15:45:00Z",
          severity: "Low",
          actionTaken: "Safety review completed, no medical attention required",
          emergencyContactNotified: true,
          isRead: true
        }
      ];
      return { data: mockUpdates.slice(0, limit) };
    } catch (error) {
      console.error('Error fetching care updates:', error);
      throw error;
    }
  },

  // Get communication messages
  getMessages: async (customerId) => {
    try {
      const mockMessages = [
        {
          id: "msg_001",
          customerId: customerId,
          senderId: 12,
          senderName: "Maria Garcia",
          senderType: "caregiver",
          recipientId: "fm_001",
          recipientName: "Sarah Johnson",
          recipientType: "family",
          subject: "Weekly Care Summary",
          message: "Hi Sarah, I wanted to give you a quick update on your mother's week. She's been doing very well with her physical therapy exercises and has been more social during meal times.",
          timestamp: "2025-08-17T16:00:00Z",
          isRead: false,
          threadId: "thread_001"
        },
        {
          id: "msg_002",
          customerId: customerId,
          senderId: "fm_001",
          senderName: "Sarah Johnson",
          senderType: "family",
          recipientId: 12,
          recipientName: "Maria Garcia",
          recipientType: "caregiver",
          subject: "Re: Weekly Care Summary",
          message: "Thank you so much for the update, Maria! It's wonderful to hear she's doing well. Please let me know if there's anything specific we should focus on this week.",
          timestamp: "2025-08-17T18:30:00Z",
          isRead: true,
          threadId: "thread_001"
        }
      ];
      return { data: mockMessages };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (messageData) => {
    try {
      const mockResponse = {
        id: `msg_${Date.now()}`,
        ...messageData,
        timestamp: new Date().toISOString(),
        isRead: false,
        status: 'sent'
      };
      return { data: mockResponse };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get care photos
  getCarePhotos: async (customerId, limit = 20) => {
    try {
      const mockPhotos = [
        {
          id: "photo_001",
          customerId: customerId,
          caregiverId: 12,
          caregiverName: "Maria Garcia",
          url: "/photos/morning_care_001.jpg",
          caption: "Enjoying breakfast with a big smile",
          tags: ["breakfast", "happy", "nutrition"],
          uploadedAt: "2025-08-18T09:35:00Z",
          approved: true,
          approved_by: "admin",
          approved_at: "2025-08-18T10:00:00Z"
        },
        {
          id: "photo_002",
          customerId: customerId,
          caregiverId: 14,
          caregiverName: "James Wilson",
          url: "/photos/exercise_session_001.jpg",
          caption: "Completing daily physical therapy exercises",
          tags: ["exercise", "physical-therapy", "wellness"],
          uploadedAt: "2025-08-17T14:20:00Z",
          approved: true,
          approved_by: "admin",
          approved_at: "2025-08-17T15:00:00Z"
        },
        {
          id: "photo_003",
          customerId: customerId,
          caregiverId: 12,
          caregiverName: "Maria Garcia",
          url: "/photos/social_activity_001.jpg",
          caption: "Playing cards with other residents",
          tags: ["social", "games", "engagement"],
          uploadedAt: "2025-08-16T16:45:00Z",
          approved: true,
          approved_by: "admin",
          approved_at: "2025-08-16T17:30:00Z"
        }
      ];
      return { data: mockPhotos.slice(0, limit) };
    } catch (error) {
      console.error('Error fetching care photos:', error);
      throw error;
    }
  },

  // Submit family satisfaction survey
  submitSatisfactionSurvey: async (surveyData) => {
    try {
      const mockResponse = {
        id: `survey_${Date.now()}`,
        ...surveyData,
        submitted_at: new Date().toISOString(),
        status: 'completed'
      };
      return { data: mockResponse };
    } catch (error) {
      console.error('Error submitting satisfaction survey:', error);
      throw error;
    }
  },

  // Get emergency contacts
  getEmergencyContacts: async (customerId) => {
    try {
      const mockContacts = [
        {
          id: "ec_001",
          customerId: customerId,
          name: "Sarah Johnson",
          relationship: "Daughter",
          phone: "(555) 123-4567",
          email: "sarah.johnson@email.com",
          is_primary: true,
          is_active: true,
          lastContactedAt: "2025-08-17T15:45:00Z"
        },
        {
          id: "ec_002",
          customerId: customerId,
          name: "Dr. Robert Smith",
          relationship: "Primary Physician",
          phone: "(555) 987-6543",
          email: "dr.smith@healthclinic.com",
          is_primary: false,
          is_active: true,
          lastContactedAt: null
        }
      ];
      return { data: mockContacts };
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      throw error;
    }
  }
};

// === ADVANCED ANALYTICS & REPORTING API - PHASE 3.1 ===
export const analyticsAPI = {
  // Business Intelligence Dashboard
  getBusinessMetrics: async (dateRange = '30d') => {
    try {
      const mockMetrics = {
        overview: {
          total_revenue: 485750.50,
          total_hours: 15240,
          active_clients: 147,
          active_caregivers: 23,
          satisfaction_score: 4.7,
          revenue_growth: 12.5,
          client_retention: 94.2,
          avg_hourly_rate: 31.85
        },
        revenue: {
          monthly: [
            { month: 'Jan', revenue: 425000, target: 450000 },
            { month: 'Feb', revenue: 438000, target: 460000 },
            { month: 'Mar', revenue: 452000, target: 470000 },
            { month: 'Apr', revenue: 461000, target: 480000 },
            { month: 'May', revenue: 478000, target: 490000 },
            { month: 'Jun', revenue: 485750, target: 500000 }
          ],
          byService: [
            { service: 'Personal Care', revenue: 185250, percentage: 38.1 },
            { service: 'Skilled Nursing', revenue: 145800, percentage: 30.0 },
            { service: 'Companion Care', revenue: 97162, percentage: 20.0 },
            { service: 'Respite Care', revenue: 57537, percentage: 11.9 }
          ]
        },
        operational: {
          utilizationRate: 87.5,
          avgSessionLength: 4.2,
          clientSatisfaction: 4.7,
          caregiverRetention: 89.3,
          missedAppointments: 3.2,
          emergencyCallouts: 12
        }
      };
      return { data: mockMetrics };
    } catch (error) {
      console.error('Error fetching business metrics:', error);
      throw error;
    }
  },

  // Predictive Analytics
  getPredictiveInsights: async () => {
    try {
      const mockInsights = {
        revenueForecasting: {
          nextMonth: { predicted: 512000, confidence: 92 },
          nextQuarter: { predicted: 1585000, confidence: 87 },
          nextYear: { predicted: 6240000, confidence: 78 }
        },
        clientChurnPrediction: {
          highRisk: [
            { clientId: 'C001', name: 'Johnson Family', riskScore: 0.85, factors: ['Late Payments', 'Missed Appointments'] },
            { clientId: 'C015', name: 'Williams Care', riskScore: 0.72, factors: ['Low Satisfaction', 'Frequent Complaints'] }
          ],
          mediumRisk: [
            { clientId: 'C023', name: 'Davis Household', riskScore: 0.55, factors: ['Schedule Changes'] },
            { clientId: 'C008', name: 'Miller Family', riskScore: 0.48, factors: ['Price Sensitivity'] }
          ]
        },
        caregiverWorkload: {
          overutilized: [
            { caregiverId: 12, name: 'Maria Garcia', utilizationRate: 0.95, burnoutRisk: 'High' },
            { caregiverId: 14, name: 'James Wilson', utilizationRate: 0.92, burnoutRisk: 'High' }
          ],
          underutilized: [
            { caregiverId: 18, name: 'Lisa Chen', utilizationRate: 0.65, potential: 'Additional 15 hours/week' },
            { caregiverId: 21, name: 'Robert Taylor', utilizationRate: 0.58, potential: 'Additional 18 hours/week' }
          ]
        },
        marketTrends: {
          demandForecast: {
            personalCare: { trend: 'increasing', growth: 8.5 },
            skilledNursing: { trend: 'stable', growth: 2.1 },
            companionCare: { trend: 'increasing', growth: 12.3 },
            respiteCare: { trend: 'increasing', growth: 15.7 }
          }
        }
      };
      return { data: mockInsights };
    } catch (error) {
      console.error('Error fetching predictive insights:', error);
      throw error;
    }
  },

  // Quality Metrics & KPIs
  getQualityMetrics: async (dateRange = '30d') => {
    try {
      const mockQuality = {
        careQuality: {
          overallScore: 4.7,
          trends: [
            { date: '2025-08-01', score: 4.5 },
            { date: '2025-08-08', score: 4.6 },
            { date: '2025-08-15', score: 4.7 },
            { date: '2025-08-18', score: 4.7 }
          ],
          byCategory: [
            { category: 'Medication Management', score: 4.8, target: 4.5 },
            { category: 'Personal Hygiene', score: 4.9, target: 4.7 },
            { category: 'Mobility Assistance', score: 4.6, target: 4.5 },
            { category: 'Communication', score: 4.5, target: 4.6 },
            { category: 'Punctuality', score: 4.8, target: 4.7 }
          ]
        },
        safetyMetrics: {
          incidents: {
            total: 3,
            severity: { low: 2, medium: 1, high: 0 },
            types: [
              { type: 'Minor Fall', count: 2, trend: 'stable' },
              { type: 'Medication Error', count: 1, trend: 'decreasing' }
            ]
          },
          complianceRate: 98.5,
          trainingCompletion: 95.2
        },
        outcomeMetrics: {
          clientImprovement: [
            { metric: 'Mobility Improvement', percentage: 78 },
            { metric: 'Medication Adherence', percentage: 94 },
            { metric: 'Social Engagement', percentage: 85 },
            { metric: 'Nutritional Status', percentage: 89 }
          ],
          familySatisfaction: 4.6,
          caregiverSatisfaction: 4.4
        }
      };
      return { data: mockQuality };
    } catch (error) {
      console.error('Error fetching quality metrics:', error);
      throw error;
    }
  },

  // Financial Analytics
  getFinancialAnalytics: async (dateRange = '30d') => {
    try {
      const mockFinancial = {
        profitability: {
          grossMargin: 42.5,
          operatingMargin: 18.3,
          netMargin: 12.7,
          ebitda: 89250
        },
        costAnalysis: {
          laborCosts: 278405, // 57.3%
          overhead: 73162, // 15.1%
          supplies: 31985, // 6.6%
          insurance: 24378, // 5.0%
          other: 77820 // 16.0%
        },
        billingMetrics: {
          averageCollectionPeriod: 32, // days
          badDebtRate: 1.8,
          insurancereimbursement_rate: 94.2,
          privatePayRate: 98.7
        },
        budgetVariance: [
          { category: 'Revenue', budget: 500000, actual: 485750, variance: -2.9 },
          { category: 'Labor', budget: 280000, actual: 278405, variance: -0.6 },
          { category: 'Overhead', budget: 75000, actual: 73162, variance: -2.4 },
          { category: 'Marketing', budget: 25000, actual: 28500, variance: 14.0 }
        ]
      };
      return { data: mockFinancial };
    } catch (error) {
      console.error('Error fetching financial analytics:', error);
      throw error;
    }
  },

  // Operational Analytics
  getOperationalAnalytics: async (dateRange = '30d') => {
    try {
      const mockOperational = {
        efficiency: {
          caregiverUtilization: 87.5,
          schedulingEfficiency: 92.3,
          travelTimeOptimization: 78.9,
          clientToCaregriverRatio: 6.4
        },
        scheduling: {
          fillRate: 96.8,
          lastMinuteCancellations: 4.2,
          overtimeHours: 245,
          emergencyCoverage: 100
        },
        resources: {
          equipmentUtilization: 84.3,
          vehicleEfficiency: 89.7,
          supplyTurnover: 12.5,
          facilityCosts: 15250
        },
        productivity: [
          { caregiver: 'Maria Garcia', hoursWorked: 168, efficiency: 95.2, clientSatisfaction: 4.9 },
          { caregiver: 'James Wilson', hoursWorked: 172, efficiency: 93.8, clientSatisfaction: 4.7 },
          { caregiver: 'Lisa Chen', hoursWorked: 142, efficiency: 91.5, clientSatisfaction: 4.8 },
          { caregiver: 'Robert Taylor', hoursWorked: 138, efficiency: 88.9, clientSatisfaction: 4.6 }
        ]
      };
      return { data: mockOperational };
    } catch (error) {
      console.error('Error fetching operational analytics:', error);
      throw error;
    }
  },

  // Custom Reports Generation
  generateCustomReport: async (reportConfig) => {
    try {
      const mockReport = {
        reportId: `RPT_${Date.now()}`,
        title: reportConfig.title || 'Custom Analytics Report',
        generatedAt: new Date().toISOString(),
        parameters: reportConfig,
        data: {
          summary: {
            totalRecords: 1247,
            dateRange: reportConfig.dateRange,
            filters: reportConfig.filters
          },
          charts: [
            {
              type: 'line',
              title: 'Revenue Trend',
              data: [
                { x: '2025-07-01', y: 425000 },
                { x: '2025-07-15', y: 438000 },
                { x: '2025-08-01', y: 452000 },
                { x: '2025-08-15', y: 485750 }
              ]
            },
            {
              type: 'bar',
              title: 'Service Distribution',
              data: [
                { category: 'Personal Care', value: 38.1 },
                { category: 'Skilled Nursing', value: 30.0 },
                { category: 'Companion Care', value: 20.0 },
                { category: 'Respite Care', value: 11.9 }
              ]
            }
          ],
          tables: [
            {
              title: 'Top Performing Caregivers',
              headers: ['Name', 'Hours', 'Satisfaction', 'Efficiency'],
              rows: [
                ['Maria Garcia', '168', '4.9', '95.2%'],
                ['James Wilson', '172', '4.7', '93.8%'],
                ['Lisa Chen', '142', '4.8', '91.5%']
              ]
            }
          ]
        },
        exportFormats: ['PDF', 'Excel', 'CSV']
      };
      return { data: mockReport };
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  },

  // Real-time Analytics Stream
  getRealtimeMetrics: async () => {
    try {
      const mockRealtime = {
        currentStats: {
          activeAppointments: 23,
          onlineCaregiver: 18,
          emergencyAlerts: 0,
          systemLoad: 67.3,
          apiResponseTime: 145 // milliseconds
        },
        liveUpdates: [
          {
            timestamp: new Date().toISOString(),
            type: 'appointment_completed',
            message: 'Maria Garcia completed appointment with Johnson Family',
            priority: 'normal'
          },
          {
            timestamp: new Date(Date.now() - 300000).toISOString(),
            type: 'new_booking',
            message: 'New appointment scheduled for tomorrow',
            priority: 'normal'
          },
          {
            timestamp: new Date(Date.now() - 600000).toISOString(),
            type: 'payment_received',
            message: 'Payment received from Williams Care - $1,250',
            priority: 'positive'
          }
        ],
        alerts: [
          {
            id: 'alert_001',
            type: 'capacity_warning',
            message: 'Caregiver utilization above 90% - consider hiring',
            severity: 'medium',
            timestamp: new Date().toISOString()
          }
        ]
      };
      return { data: mockRealtime };
    } catch (error) {
      console.error('Error fetching realtime metrics:', error);
      throw error;
    }
  }
};

export default api;