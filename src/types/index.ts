// User types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'customer' | 'caregiver';
    phone?: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

// Caregiver types
export interface Caregiver extends User {
    role: 'caregiver';
    specialties: string[];
    experience: number;
    hourlyRate: number;
    availability: Availability[];
    rating: number;
    reviewCount: number;
    bio?: string;
    certifications: string[];
}

// Customer types
export interface Customer extends User {
    role: 'customer';
    address: Address;
    emergencyContact: EmergencyContact;
    medicalNotes?: string;
    preferences: CustomerPreferences;
}

// Service types
export interface Service {
    id: string;
    name: string;
    description: string;
    duration: number; // in minutes
    price: number;
    category: ServiceCategory;
    isActive: boolean;
}

// Package types
export interface Package {
    id: string;
    name: string;
    description: string;
    services: Service[];
    totalPrice: number;
    discountPercentage: number;
    isActive: boolean;
}

// Appointment types
export interface Appointment {
    id: string;
    customerId: string;
    caregiverId: string;
    serviceId: string;
    packageId?: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Availability types
export interface Availability {
    id: string;
    caregiverId: string;
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

// Address types
export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

// Emergency contact types
export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
}

// Customer preferences
export interface CustomerPreferences {
    preferredLanguages: string[];
    preferredGender?: 'male' | 'female' | 'any';
    preferredAgeRange?: {
        min: number;
        max: number;
    };
    specialRequirements?: string[];
}

// Enums
export enum ServiceCategory {
    PERSONAL_CARE = 'personal_care',
    MEDICAL = 'medical',
    COMPANIONSHIP = 'companionship',
    HOUSEKEEPING = 'housekeeping',
    TRANSPORTATION = 'transportation',
    OTHER = 'other',
}

export enum AppointmentStatus {
    SCHEDULED = 'scheduled',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    NO_SHOW = 'no_show',
}

// API response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Form types
export interface LoginForm {
    email: string;
    password: string;
}

export interface RegistrationForm {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'customer' | 'caregiver';
}

export interface BookingForm {
    serviceId: string;
    packageId?: string;
    caregiverId: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    notes?: string;
}

// Search and filter types
export interface SearchFilters {
    query?: string;
    category?: ServiceCategory;
    priceRange?: {
        min: number;
        max: number;
    };
    availability?: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    };
    rating?: number;
    experience?: number;
}

// Notification types
export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    createdAt: string;
}
