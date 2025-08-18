import React, { useState, useEffect } from 'react';
import { Heart, Activity, Thermometer, Droplets, Zap, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, User, MapPin, Smartphone, Watch, Plus, Filter, RefreshCw, Download, Bell, Target, BarChart3 } from 'lucide-react';
import { iotDeviceService, iotAnalyticsService } from '../../services/iotServices';

const SmartHealthMonitoring = () => {
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState('CLIENT_001');
  const [healthTrends, setHealthTrends] = useState(null);
  const [predictiveInsights, setPredictiveInsights] = useState(null);
  const [clientDevices, setClientDevices] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('vitals');

  // Mock client data
  const clients = [
    { id: 'CLIENT_001', name: 'Margaret Thompson', age: 78, conditions: ['Diabetes', 'Hypertension'] },
    { id: 'CLIENT_002', name: 'Robert Williams', age: 82, conditions: ['Heart Disease', 'Arthritis'] },
    { id: 'CLIENT_003', name: 'Dorothy Miller', age: 76, conditions: ['COPD', 'Osteoporosis'] },
    { id: 'CLIENT_004', name: 'James Peterson', age: 85, conditions: ['Dementia', 'Hypertension'] }
  ];

  useEffect(() => {
    if (selectedClient) {
      loadHealthData();
    }
  }, [selectedClient, selectedTimeframe]);

  const loadHealthData = async () => {
    setLoading(true);
    try {
      const [trends, insights, devices] = await Promise.all([
        iotAnalyticsService.getHealthTrends(selectedClient, selectedTimeframe),
        iotAnalyticsService.getPredictiveInsights(selectedClient),
        iotDeviceService.getDevicesByClient(selectedClient)
      ]);
      
      setHealthTrends(trends);
      setPredictiveInsights(insights);
      setClientDevices(devices);
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedClient = () => {
    return clients.find(client => client.id === selectedClient);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatLastReading = (device) => {
    const timeDiff = Date.now() - new Date(device.lastReading).getTime();
    const minutes = Math.floor(timeDiff / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (minutes < 1440) {
      return `${Math.floor(minutes / 60)} hours ago`;
    } else {
      return `${Math.floor(minutes / 1440)} days ago`;
    }
  };

  const client = getSelectedClient();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Heart className="w-8 h-8 text-red-600 mr-3" />
                Smart Health Monitoring
              </h1>
              <p className="text-gray-600">Comprehensive health tracking and predictive analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={loadHealthData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading health data...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Client Information */}
            {client && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{client.name}</h2>
                      <p className="text-gray-600">Age: {client.age}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-600 mr-2">Conditions:</span>
                        {client.conditions.map((condition, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-2">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Connected Devices</div>
                    <div className="text-2xl font-bold text-blue-600">{clientDevices.length}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Health Risk Assessment */}
            {predictiveInsights && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Target className="w-5 h-5 text-purple-600 mr-2" />
                  Health Risk Assessment
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {predictiveInsights.healthRiskScore}
                    </div>
                    <div className="text-sm text-gray-600">Overall Risk Score</div>
                    <div className="text-xs text-purple-600 mt-1">Low Risk</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {predictiveInsights.fallRiskPrediction.confidence}%
                    </div>
                    <div className="text-sm text-gray-600">Fall Risk Confidence</div>
                    <div className="text-xs text-green-600 mt-1 capitalize">
                      {predictiveInsights.fallRiskPrediction.risk} Risk
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {predictiveInsights.medicationCompliance.predicted7Day}%
                    </div>
                    <div className="text-sm text-gray-600">Predicted Compliance</div>
                    <div className="text-xs text-blue-600 mt-1">Next 7 Days</div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
                    <div className="space-y-2">
                      {predictiveInsights.fallRiskPrediction.factors.map((factor, index) => (
                        <div key={index} className="flex items-center p-2 bg-green-50 rounded">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm text-gray-700">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {predictiveInsights.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start p-2 bg-blue-50 rounded">
                          <Zap className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                          <span className="text-sm text-gray-700">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vital Signs Trends */}
            {healthTrends && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Heart className="w-5 h-5 text-red-600 mr-2" />
                    Vital Signs
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Heart Rate</div>
                        <div className="text-2xl font-bold text-red-600">
                          {healthTrends.vitals.heartRate.average} BPM
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(healthTrends.vitals.heartRate.trend)}
                        <span className="ml-2 text-sm capitalize text-gray-600">
                          {healthTrends.vitals.heartRate.trend}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Blood Pressure</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {healthTrends.vitals.bloodPressure.systolic.average}/
                          {healthTrends.vitals.bloodPressure.diastolic.average}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(healthTrends.vitals.bloodPressure.systolic.trend)}
                        <span className="ml-2 text-sm capitalize text-gray-600">
                          {healthTrends.vitals.bloodPressure.systolic.trend}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Oxygen Saturation</div>
                        <div className="text-2xl font-bold text-green-600">
                          {healthTrends.vitals.oxygenSaturation.average}%
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(healthTrends.vitals.oxygenSaturation.trend)}
                        <span className="ml-2 text-sm capitalize text-gray-600">
                          {healthTrends.vitals.oxygenSaturation.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Activity className="w-5 h-5 text-purple-600 mr-2" />
                    Activity & Wellness
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">Activity Level</span>
                        <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full capitalize">
                          {healthTrends.activity.activityLevel}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">Based on movement patterns and device data</div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="font-medium text-gray-900 mb-2">Medication Adherence</div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-yellow-600">
                          {healthTrends.medication.adherenceRate}%
                        </span>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Missed: {healthTrends.medication.missedDoses}</div>
                          <div className="text-sm text-gray-600">On-time: {healthTrends.medication.onTimeRate}%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <div className="font-medium text-gray-900 mb-2">Environmental Conditions</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Temperature:</span>
                          <span className="font-medium">{healthTrends.environmental.averageTemperature}°F</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Humidity:</span>
                          <span className="font-medium">{healthTrends.environmental.averageHumidity}%</span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span className="text-gray-600">Air Quality Score:</span>
                          <span className="font-medium text-green-600">{healthTrends.environmental.airQualityScore}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Connected Devices */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
                Connected Health Devices
              </h3>
              
              {clientDevices.length === 0 ? (
                <div className="text-center py-8">
                  <Watch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No devices connected for this client</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add Device
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clientDevices.map((device) => (
                    <div key={device.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Heart className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{device.name}</h4>
                            <p className="text-sm text-gray-600">{device.type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          device.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{device.location}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Battery:</span>
                          <span className={`font-medium ${
                            device.battery < 20 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {device.battery}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Reading:</span>
                          <span className="font-medium">{formatLastReading(device)}</span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded text-sm">
                        <div className="font-medium text-gray-900 mb-1">Current Status:</div>
                        <div className="text-gray-600">
                          {device.type === 'vital_monitor' && (
                            `HR: ${device.readings.heartRate} BPM`
                          )}
                          {device.type === 'glucose_monitor' && (
                            `Glucose: ${device.readings.glucoseLevel} mg/dL`
                          )}
                          {device.type === 'medication_dispenser' && (
                            `${device.readings.pillsRemaining} pills remaining`
                          )}
                          {device.type === 'fall_detector' && (
                            `${device.readings.movementPattern} activity`
                          )}
                          {device.type === 'environmental_sensor' && (
                            `${device.readings.temperature}°F, ${device.readings.humidity}% humidity`
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Health Trend Charts */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
                  Health Trend Analysis
                </h3>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="vitals">Vital Signs</option>
                  <option value="activity">Activity Levels</option>
                  <option value="medication">Medication Adherence</option>
                  <option value="environmental">Environmental</option>
                </select>
              </div>
              
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Interactive health trend charts would be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Integration with charting libraries like Chart.js or D3.js recommended for detailed visualizations
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartHealthMonitoring;
