// IoT Services for HomeCare Platform
// Phase 4: IoT Integration & Smart Healthcare

class IoTDeviceService {
  constructor() {
    this.devices = new Map();
    this.deviceTypes = {
      VITAL_MONITOR: 'vital_monitor',
      MEDICATION_DISPENSER: 'medication_dispenser',
      FALL_DETECTOR: 'fall_detector',
      SMART_WATCH: 'smart_watch',
      GLUCOSE_MONITOR: 'glucose_monitor',
      BLOOD_PRESSURE: 'blood_pressure',
      PULSE_OXIMETER: 'pulse_oximeter',
      SMART_SCALE: 'smart_scale',
      ENVIRONMENTAL_SENSOR: 'environmental_sensor',
      EMERGENCY_BUTTON: 'emergency_button'
    };
    
    this.initializeMockDevices();
  }

  initializeMockDevices() {
    // Mock IoT devices for demonstration
    const mockDevices = [
      {
        id: 'DEV_001',
        client_id: 'CLIENT_001',
        client_name: 'Margaret Thompson',
        type: this.deviceTypes.VITAL_MONITOR,
        name: 'PhilipsHealth Monitor Pro',
        status: 'online',
        battery: 85,
        lastReading: new Date('2025-08-18T09:30:00'),
        location: 'Bedroom',
        firmware: '2.1.4',
        connectivity: 'WiFi',
        readings: {
          heartRate: 72,
          bloodPressure: { systolic: 125, diastolic: 80 },
          temperature: 98.6,
          oxygenSaturation: 98
        }
      },
      {
        id: 'DEV_002',
        client_id: 'CLIENT_002',
        client_name: 'Robert Williams',
        type: this.deviceTypes.MEDICATION_DISPENSER,
        name: 'MedSafe Smart Dispenser',
        status: 'online',
        battery: 92,
        lastReading: new Date('2025-08-18T08:00:00'),
        location: 'Kitchen',
        firmware: '1.8.2',
        connectivity: 'WiFi',
        readings: {
          lastDispense: new Date('2025-08-18T08:00:00'),
          pillsRemaining: 28,
          nextDose: new Date('2025-08-18T20:00:00'),
          adherenceRate: 95.2
        }
      },
      {
        id: 'DEV_003',
        client_id: 'CLIENT_003',
        client_name: 'Dorothy Miller',
        type: this.deviceTypes.FALL_DETECTOR,
        name: 'SafeGuard Fall Sensor',
        status: 'online',
        battery: 78,
        lastReading: new Date('2025-08-18T10:15:00'),
        location: 'Living Room',
        firmware: '3.0.1',
        connectivity: 'Bluetooth',
        readings: {
          movementPattern: 'normal',
          lastActivity: new Date('2025-08-18T10:15:00'),
          fallRisk: 'low',
          activityLevel: 'moderate'
        }
      },
      {
        id: 'DEV_004',
        client_id: 'CLIENT_001',
        client_name: 'Margaret Thompson',
        type: this.deviceTypes.GLUCOSE_MONITOR,
        name: 'FreeStyle Libre',
        status: 'online',
        battery: 65,
        lastReading: new Date('2025-08-18T09:45:00'),
        location: 'Portable',
        firmware: '4.2.1',
        connectivity: 'Bluetooth',
        readings: {
          glucoseLevel: 108,
          trend: 'stable',
          lastMeal: new Date('2025-08-18T07:30:00'),
          averageGlucose: 115
        }
      },
      {
        id: 'DEV_005',
        client_id: 'CLIENT_004',
        client_name: 'James Peterson',
        type: this.deviceTypes.ENVIRONMENTAL_SENSOR,
        name: 'AirSense Environmental Monitor',
        status: 'online',
        battery: 88,
        lastReading: new Date('2025-08-18T10:30:00'),
        location: 'Living Room',
        firmware: '1.5.3',
        connectivity: 'WiFi',
        readings: {
          temperature: 72.5,
          humidity: 45,
          airQuality: 'good',
          noiseLevel: 35
        }
      }
    ];

    mockDevices.forEach(device => {
      this.devices.set(device.id, device);
    });
  }

  async getAllDevices() {
    return Array.from(this.devices.values());
  }

  async getDevicesByClient(client_id) {
    return Array.from(this.devices.values()).filter(device => device.client_id === client_id);
  }

  async getDevicesByType(deviceType) {
    return Array.from(this.devices.values()).filter(device => device.type === deviceType);
  }

  async getDeviceById(deviceId) {
    return this.devices.get(deviceId);
  }

  async getDeviceStatus(deviceId) {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    return {
      id: deviceId,
      status: device.status,
      battery: device.battery,
      lastReading: device.lastReading,
      connectivity: device.connectivity,
      isHealthy: device.status === 'online' && device.battery > 20
    };
  }

  async updateDeviceReading(deviceId, newReading) {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    device.readings = { ...device.readings, ...newReading };
    device.lastReading = new Date();
    
    // Trigger alerts if necessary
    await this.checkForAlerts(device);
    
    return true;
  }

  async checkForAlerts(device) {
    const alerts = [];

    switch (device.type) {
      case this.deviceTypes.VITAL_MONITOR:
        if (device.readings.heartRate > 100 || device.readings.heartRate < 60) {
          alerts.push({
            type: 'vital_alert',
            severity: 'medium',
            message: `Abnormal heart rate detected: ${device.readings.heartRate} BPM`,
            device: device.id,
            client: device.client_name
          });
        }
        break;

      case this.deviceTypes.GLUCOSE_MONITOR:
        if (device.readings.glucoseLevel > 180 || device.readings.glucoseLevel < 70) {
          alerts.push({
            type: 'glucose_alert',
            severity: 'high',
            message: `Critical glucose level: ${device.readings.glucoseLevel} mg/dL`,
            device: device.id,
            client: device.client_name
          });
        }
        break;

      case this.deviceTypes.FALL_DETECTOR:
        if (device.readings.fallRisk === 'high') {
          alerts.push({
            type: 'fall_risk_alert',
            severity: 'medium',
            message: `High fall risk detected for ${device.client_name}`,
            device: device.id,
            client: device.client_name
          });
        }
        break;
    }

    // In a real implementation, these alerts would be sent to caregivers/family
    if (alerts.length > 0) {
      console.log('IoT Alerts Generated:', alerts);
    }

    return alerts;
  }
}

class IoTAnalyticsService {
  constructor(deviceService) {
    this.deviceService = deviceService;
  }

  async getHealthTrends(client_id, timeframe = '7d') {
    const devices = await this.deviceService.getDevicesByClient(client_id);
    
    // Mock trend data
    return {
      vitals: {
        heartRate: {
          average: 72,
          trend: 'stable',
          data: this.generateMockTrendData(70, 75, 7)
        },
        bloodPressure: {
          systolic: { average: 125, trend: 'improving' },
          diastolic: { average: 80, trend: 'stable' }
        },
        oxygenSaturation: {
          average: 98,
          trend: 'stable',
          data: this.generateMockTrendData(97, 99, 7)
        }
      },
      activity: {
        dailySteps: this.generateMockTrendData(2000, 5000, 7),
        sleepQuality: this.generateMockTrendData(70, 85, 7),
        activityLevel: 'moderate'
      },
      medication: {
        adherenceRate: 95.2,
        missedDoses: 2,
        onTimeRate: 88.5
      },
      environmental: {
        averageTemperature: 72.5,
        averageHumidity: 45,
        airQualityScore: 85
      }
    };
  }

  async getSystemOverview() {
    const allDevices = await this.deviceService.getAllDevices();
    
    const statusCounts = {
      online: allDevices.filter(d => d.status === 'online').length,
      offline: allDevices.filter(d => d.status === 'offline').length,
      warning: allDevices.filter(d => d.battery < 20).length
    };

    const typeDistribution = {};
    allDevices.forEach(device => {
      typeDistribution[device.type] = (typeDistribution[device.type] || 0) + 1;
    });

    return {
      totalDevices: allDevices.length,
      statusCounts,
      typeDistribution,
      averageBattery: allDevices.reduce((sum, d) => sum + d.battery, 0) / allDevices.length,
      lastUpdated: new Date(),
      alertsCount: 3, // Mock alert count
      efficiency: 94.2
    };
  }

  async getPredictiveInsights(client_id) {
    // Mock predictive analytics based on IoT data
    return {
      healthRiskScore: 23, // Low risk
      fallRiskPrediction: {
        risk: 'low',
        confidence: 87,
        factors: ['Good mobility', 'Stable vitals', 'Regular activity']
      },
      medicationCompliance: {
        predicted7Day: 94.8,
        riskFactors: ['Evening dose timing']
      },
      emergencyProbability: {
        next24Hours: 2.1,
        next7Days: 8.3,
        primaryConcerns: ['Blood pressure monitoring', 'Activity levels']
      },
      recommendations: [
        'Continue current medication schedule',
        'Increase evening activity for better sleep',
        'Monitor blood pressure trends weekly'
      ]
    };
  }

  generateMockTrendData(min, max, days) {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * (max - min + 1)) + min
    }));
  }
}

class IoTAlertService {
  constructor() {
    this.alertQueue = [];
    this.alertHistory = [];
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  async createAlert(alert) {
    const newAlert = {
      id: `ALERT_${Date.now()}`,
      timestamp: new Date(),
      acknowledged: false,
      ...alert
    };

    this.alertQueue.push(newAlert);
    this.notifySubscribers(newAlert);
    
    return newAlert;
  }

  async acknowledgeAlert(alertId, user_id) {
    const alert = this.alertQueue.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = user_id;
      alert.acknowledgedAt = new Date();
      
      // Move to history
      this.alertHistory.push(alert);
      this.alertQueue = this.alertQueue.filter(a => a.id !== alertId);
    }
    return alert;
  }

  async getActiveAlerts() {
    return this.alertQueue;
  }

  async getAlertHistory(limit = 50) {
    return this.alertHistory.slice(-limit);
  }

  notifySubscribers(alert) {
    this.subscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error notifying alert subscriber:', error);
      }
    });
  }
}

// Initialize services
export const iotDeviceService = new IoTDeviceService();
export const iotAnalyticsService = new IoTAnalyticsService(iotDeviceService);
export const iotAlertService = new IoTAlertService();

// Mock some alerts for demonstration
setTimeout(() => {
  iotAlertService.createAlert({
    type: 'device_battery_low',
    severity: 'low',
    message: 'Glucose monitor battery below 20%',
    device: 'DEV_004',
    client: 'Margaret Thompson'
  });
}, 2000);

export default {
  iotDeviceService,
  iotAnalyticsService,
  iotAlertService
};
