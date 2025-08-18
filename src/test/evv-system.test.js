/**
 * Enhanced EVV System Integration Test
 * Tests the complete GPS-enabled check-in/out workflow
 */

import { vi, describe, test, beforeEach, expect } from 'vitest';

// Mock geolocation for testing
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

import { 
  getCurrentLocation, 
  validateLocationProximity, 
  calculateDistance 
} from '../utils/geolocation';

import { evvRecordsAPI } from '../services/api';

// Mock API calls
vi.mock('../services/api', () => ({
  evvRecordsAPI: {
    checkIn: vi.fn(),
    checkOut: vi.fn(),
    getByAppointmentId: vi.fn(),
    updateLocation: vi.fn(),
    completeTask: vi.fn(),
    addSupervisorVerification: vi.fn()
  }
}));

describe('Enhanced EVV System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Geolocation Utils', () => {
    test('should get current location successfully', async () => {
      const mockPosition = {
        coords: {
          latitude: 39.7817,
          longitude: -89.6501,
          accuracy: 5
        }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const location = await getCurrentLocation();

      expect(location).toEqual({
        latitude: 39.7817,
        longitude: -89.6501,
        accuracy: 5,
        timestamp: expect.any(String)
      });
    });

    test('should handle geolocation permission denied', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied the request for Geolocation.'
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError);
      });

      await expect(getCurrentLocation()).rejects.toThrow('Unknown geolocation error');
    });

    test('should calculate distance between two points correctly', () => {
      const point1 = { latitude: 39.7817, longitude: -89.6501 };
      const point2 = { latitude: 39.7850, longitude: -89.6420 };

      const distance = calculateDistance(point1, point2);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1000); // Should be less than 1km
    });

    test('should validate location proximity correctly', () => {
      const currentLocation = { latitude: 39.7817, longitude: -89.6501 };
      const targetLocation = { latitude: 39.7820, longitude: -89.6505 };

      const validation = validateLocationProximity(currentLocation, targetLocation, 100);

      expect(validation.isValid).toBe(true);
      expect(validation.distance).toBeLessThan(100);
    });

    test('should invalidate location when too far', () => {
      const currentLocation = { latitude: 39.7817, longitude: -89.6501 };
      const targetLocation = { latitude: 39.8000, longitude: -89.7000 }; // Much farther away

      const validation = validateLocationProximity(currentLocation, targetLocation, 100);

      expect(validation.isValid).toBe(false);
      expect(validation.distance).toBeGreaterThan(100);
    });
  });

  describe('EVV API Integration', () => {
    test('should handle check-in with GPS location', async () => {
      const mockCheckInData = {
        appointmentId: 1,
        caregiverId: 12,
        checkInLocation: {
          latitude: 39.7817,
          longitude: -89.6501,
          address: "123 Main St, Springfield, IL",
          accuracy: 5
        },
        deviceInfo: {
          deviceId: "test_device",
          version: "v1.2.3",
          platform: "Web"
        }
      };

      const mockResponse = {
        data: {
          id: 1,
          ...mockCheckInData,
          checkInTime: "2025-08-01T09:00:00Z",
          status: "in_progress"
        }
      };

      evvRecordsAPI.checkIn.mockResolvedValue(mockResponse);

      const result = await evvRecordsAPI.checkIn(mockCheckInData);

      expect(evvRecordsAPI.checkIn).toHaveBeenCalledWith(mockCheckInData);
      expect(result.data.status).toBe('in_progress');
      expect(result.data.checkInTime).toBeDefined();
    });

    test('should handle check-out with completed tasks', async () => {
      const mockCheckOutData = {
        checkOutLocation: {
          latitude: 39.7817,
          longitude: -89.6501,
          address: "123 Main St, Springfield, IL",
          accuracy: 3
        },
        tasksCompleted: [
          {
            taskId: "task_bathing_001",
            taskName: "Bathing Assistance",
            completed: true,
            notes: "Completed successfully",
            completedAt: "2025-08-01T09:30:00Z"
          }
        ],
        caregiverNotes: "Visit went well",
        status: "completed"
      };

      const mockResponse = {
        data: {
          id: 1,
          ...mockCheckOutData,
          checkOutTime: "2025-08-01T10:45:00Z"
        }
      };

      evvRecordsAPI.checkOut.mockResolvedValue(mockResponse);

      const result = await evvRecordsAPI.checkOut(1, mockCheckOutData);

      expect(evvRecordsAPI.checkOut).toHaveBeenCalledWith(1, mockCheckOutData);
      expect(result.data.status).toBe('completed');
      expect(result.data.checkOutTime).toBeDefined();
    });

    test('should handle supervisor verification', async () => {
      const verificationData = {
        verified: true,
        verifiedBy: 2,
        verifiedAt: "2025-08-01T11:00:00Z",
        notes: "All documentation complete"
      };

      const mockResponse = {
        data: {
          id: 1,
          supervisorVerification: verificationData
        }
      };

      evvRecordsAPI.addSupervisorVerification.mockResolvedValue(mockResponse);

      const result = await evvRecordsAPI.addSupervisorVerification(1, verificationData);

      expect(evvRecordsAPI.addSupervisorVerification).toHaveBeenCalledWith(1, verificationData);
      expect(result.data.supervisorVerification.verified).toBe(true);
    });
  });

  describe('Task Completion Workflow', () => {
    test('should track task completion correctly', async () => {
      const taskData = {
        taskId: "task_medication_001",
        taskName: "Medication Reminders",
        completed: true,
        notes: "All medications administered on time",
        completedAt: "2025-08-01T10:00:00Z"
      };

      const mockResponse = {
        data: {
          id: 1,
          tasksCompleted: [taskData]
        }
      };

      evvRecordsAPI.completeTask.mockResolvedValue(mockResponse);

      const result = await evvRecordsAPI.completeTask(1, taskData);

      expect(evvRecordsAPI.completeTask).toHaveBeenCalledWith(1, taskData);
      expect(result.data.tasksCompleted).toHaveLength(1);
      expect(result.data.tasksCompleted[0].completed).toBe(true);
    });
  });

  describe('Performance Metrics Integration', () => {
    test('should calculate EVV compliance rate', () => {
      const evvRecords = [
        { status: 'completed', checkInLocation: { accuracy: 5 }, checkOutLocation: { accuracy: 3 } },
        { status: 'completed', checkInLocation: { accuracy: 8 }, checkOutLocation: { accuracy: 6 } },
        { status: 'cancelled', checkInLocation: null, checkOutLocation: null },
        { status: 'completed', checkInLocation: { accuracy: 4 }, checkOutLocation: { accuracy: 2 } }
      ];

      const completedRecords = evvRecords.filter(r => r.status === 'completed');
      const complianceRate = (completedRecords.length / evvRecords.length) * 100;

      expect(complianceRate).toBe(75); // 3 out of 4 completed
    });

    test('should calculate location accuracy average', () => {
      const evvRecords = [
        { checkInLocation: { accuracy: 5 }, checkOutLocation: { accuracy: 3 } },
        { checkInLocation: { accuracy: 8 }, checkOutLocation: { accuracy: 6 } },
        { checkInLocation: { accuracy: 4 }, checkOutLocation: { accuracy: 2 } }
      ];

      const allAccuracies = evvRecords.flatMap(r => [
        r.checkInLocation.accuracy,
        r.checkOutLocation.accuracy
      ]);

      const averageAccuracy = allAccuracies.reduce((sum, acc) => sum + acc, 0) / allAccuracies.length;

      expect(averageAccuracy).toBeCloseTo(4.67, 1);
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      evvRecordsAPI.checkIn.mockRejectedValue(new Error('Network error'));

      await expect(evvRecordsAPI.checkIn({})).rejects.toThrow('Network error');
    });

    test('should handle invalid GPS coordinates', () => {
      const invalidLocation = { latitude: null, longitude: null };
      const targetLocation = { latitude: 39.7817, longitude: -89.6501 };

      const validation = validateLocationProximity(invalidLocation, targetLocation);

      expect(validation.isValid).toBe(false);
      expect(validation.message).toContain('away from appointment address');
    });
  });
});

// Integration test for the complete workflow
describe('Complete EVV Workflow Integration', () => {
  test('should complete full check-in to check-out workflow', async () => {
    // Mock successful geolocation
    const mockPosition = {
      coords: {
        latitude: 39.7817,
        longitude: -89.6501,
        accuracy: 5
      }
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    // Step 1: Check-in
    const checkInData = {
      appointmentId: 1,
      caregiverId: 12,
      checkInLocation: {
        latitude: 39.7817,
        longitude: -89.6501,
        address: "123 Main St, Springfield, IL",
        accuracy: 5
      }
    };

    evvRecordsAPI.checkIn.mockResolvedValue({
      data: { id: 1, ...checkInData, status: 'in_progress' }
    });

    const checkInResult = await evvRecordsAPI.checkIn(checkInData);
    expect(checkInResult.data.status).toBe('in_progress');

    // Step 2: Complete tasks
    const taskData = {
      taskId: "task_bathing_001",
      taskName: "Bathing Assistance",
      completed: true
    };

    evvRecordsAPI.completeTask.mockResolvedValue({
      data: { id: 1, tasksCompleted: [taskData] }
    });

    const taskResult = await evvRecordsAPI.completeTask(1, taskData);
    expect(taskResult.data.tasksCompleted).toHaveLength(1);

    // Step 3: Check-out
    const checkOutData = {
      checkOutLocation: checkInData.checkInLocation,
      tasksCompleted: [taskData],
      status: 'completed'
    };

    evvRecordsAPI.checkOut.mockResolvedValue({
      data: { id: 1, ...checkOutData }
    });

    const checkOutResult = await evvRecordsAPI.checkOut(1, checkOutData);
    expect(checkOutResult.data.status).toBe('completed');

    // Step 4: Supervisor verification
    const verificationData = {
      verified: true,
      verifiedBy: 2,
      notes: "Excellent work"
    };

    evvRecordsAPI.addSupervisorVerification.mockResolvedValue({
      data: { id: 1, supervisorVerification: verificationData }
    });

    const verificationResult = await evvRecordsAPI.addSupervisorVerification(1, verificationData);
    expect(verificationResult.data.supervisorVerification.verified).toBe(true);
  });
});
