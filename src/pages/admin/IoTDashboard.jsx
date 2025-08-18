import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Battery, BatteryLow, Activity, Heart, Thermometer, Droplets, AlertTriangle, CheckCircle, Clock, Users, BarChart3, TrendingUp, TrendingDown, RefreshCw, Settings, Plus, Filter, Download, Bell, BellRing } from 'lucide-react';
import { iotDeviceService, iotAnalyticsService, iotAlertService } from '../../services/iotServices';

const IoTDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [systemOverview, setSystemOverview] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadDashboardData();
    loadActiveAlerts();

    // Subscribe to real-time alerts
    iotAlertService.subscribe(handleNewAlert);

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (selectedView === 'overview') {
        loadDashboardData();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [selectedView]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [devicesData, overviewData] = await Promise.all([
        iotDeviceService.getAllDevices(),
        iotAnalyticsService.getSystemOverview()
      ]);
      
      setDevices(devicesData);
      setSystemOverview(overviewData);
    } catch (error) {
      console.error('Error loading IoT dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveAlerts = async () => {
    try {
      const alerts = await iotAlertService.getActiveAlerts();
      setActiveAlerts(alerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const handleNewAlert = (alert) => {
    setActiveAlerts(prev => [alert, ...prev]);
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await iotAlertService.acknowledgeAlert(alertId, 'current_user');
      setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getDeviceIcon = (deviceType) => {
    const iconMap = {
      vital_monitor: Heart,
      medication_dispenser: Activity,
      fall_detector: AlertTriangle,
      smart_watch: Activity,
      glucose_monitor: Droplets,
      blood_pressure: Heart,
      pulse_oximeter: Activity,
      smart_scale: Activity,
      environmental_sensor: Thermometer,
      emergency_button: Bell
    };
    return iconMap[deviceType] || Activity;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50 border-green-200';
      case 'offline': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBatteryIcon = (battery) => {
    return battery < 20 ? BatteryLow : Battery;
  };

  const formatDeviceType = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatReading = (device) => {
    switch (device.type) {
      case 'vital_monitor':
        return `${device.readings.heartRate} BPM, ${device.readings.bloodPressure.systolic}/${device.readings.bloodPressure.diastolic} mmHg`;
      case 'glucose_monitor':
        return `${device.readings.glucoseLevel} mg/dL (${device.readings.trend})`;
      case 'medication_dispenser':
        return `${device.readings.pillsRemaining} pills remaining, ${device.readings.adherenceRate}% adherence`;
      case 'fall_detector':
        return `${device.readings.movementPattern} activity, ${device.readings.fallRisk} risk`;
      case 'environmental_sensor':
        return `${device.readings.temperature}°F, ${device.readings.humidity}% humidity`;
      default:
        return 'Active monitoring';
    }
  };

  const filteredDevices = filterType === 'all' 
    ? devices 
    : devices.filter(device => device.type === filterType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Wifi className="w-8 h-8 text-blue-600 mr-3" />
                IoT Healthcare Dashboard
              </h1>
              <p className="text-gray-600">Real-time monitoring and smart healthcare devices</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="overview">Overview</option>
                <option value="devices">Device Management</option>
                <option value="alerts">Alert Center</option>
                <option value="analytics">Analytics</option>
              </select>
              
              {activeAlerts.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setSelectedView('alerts')}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <BellRing className="w-4 h-4 mr-2" />
                    {activeAlerts.length}
                  </button>
                </div>
              )}
              
              <button
                onClick={loadDashboardData}
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
            <span className="ml-3 text-gray-600">Loading IoT dashboard...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview */}
            {selectedView === 'overview' && systemOverview && (
              <>
                {/* System Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {systemOverview.totalDevices}
                    </div>
                    <div className="text-sm text-gray-600">Total Devices</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {systemOverview.statusCounts.online}
                    </div>
                    <div className="text-sm text-gray-600">Online</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {systemOverview.statusCounts.offline}
                    </div>
                    <div className="text-sm text-gray-600">Offline</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {systemOverview.statusCounts.warning}
                    </div>
                    <div className="text-sm text-gray-600">Warnings</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {Math.round(systemOverview.averageBattery)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Battery</div>
                  </div>
                </div>

                {/* Active Alerts */}
                {activeAlerts.length > 0 && (
                  <div className="bg-white border border-red-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-red-900 flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                        Active Alerts ({activeAlerts.length})
                      </h3>
                      <button
                        onClick={() => setSelectedView('alerts')}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        View All
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {activeAlerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <span className={`px-2 py-1 text-xs rounded-full mr-2 ${getSeverityColor(alert.severity)}`}>
                                {alert.severity}
                              </span>
                              <span className="text-sm font-medium text-red-900">{alert.client}</span>
                            </div>
                            <p className="text-sm text-red-700">{alert.message}</p>
                          </div>
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Acknowledge
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Device Type Distribution */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Device Distribution</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Object.entries(systemOverview.typeDistribution).map(([type, count]) => {
                      const Icon = getDeviceIcon(type);
                      return (
                        <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                          <Icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <div className="text-lg font-semibold text-gray-900">{count}</div>
                          <div className="text-xs text-gray-600">{formatDeviceType(type)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Device Activity */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Device Activity</h3>
                    <button
                      onClick={() => setSelectedView('devices')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Manage Devices
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Device</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Battery</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Last Reading</th>
                        </tr>
                      </thead>
                      <tbody>
                        {devices.slice(0, 5).map((device) => {
                          const Icon = getDeviceIcon(device.type);
                          const BatteryIcon = getBatteryIcon(device.battery);
                          
                          return (
                            <tr key={device.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <Icon className="w-5 h-5 text-blue-600 mr-3" />
                                  <span className="font-medium text-gray-900">{device.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600">{device.clientName}</td>
                              <td className="py-3 px-4 text-gray-600">{formatDeviceType(device.type)}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  {device.status === 'online' ? (
                                    <Wifi className="w-4 h-4 text-green-600 mr-1" />
                                  ) : (
                                    <WifiOff className="w-4 h-4 text-red-600 mr-1" />
                                  )}
                                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(device.status)}`}>
                                    {device.status}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <BatteryIcon className={`w-4 h-4 mr-1 ${
                                    device.battery < 20 ? 'text-red-600' : 'text-green-600'
                                  }`} />
                                  <span className={`text-sm ${
                                    device.battery < 20 ? 'text-red-600' : 'text-gray-600'
                                  }`}>
                                    {device.battery}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm">
                                {new Date(device.lastReading).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Device Management */}
            {selectedView === 'devices' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Device Management</h3>
                    <div className="flex items-center space-x-4">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Types</option>
                        <option value="vital_monitor">Vital Monitors</option>
                        <option value="medication_dispenser">Medication Dispensers</option>
                        <option value="fall_detector">Fall Detectors</option>
                        <option value="glucose_monitor">Glucose Monitors</option>
                        <option value="environmental_sensor">Environmental Sensors</option>
                      </select>
                      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Device
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDevices.map((device) => {
                      const Icon = getDeviceIcon(device.type);
                      const BatteryIcon = getBatteryIcon(device.battery);
                      
                      return (
                        <div key={device.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <Icon className="w-6 h-6 text-blue-600 mr-3" />
                              <div>
                                <h4 className="font-medium text-gray-900">{device.name}</h4>
                                <p className="text-sm text-gray-600">{device.clientName}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {device.status === 'online' ? (
                                <Wifi className="w-4 h-4 text-green-600" />
                              ) : (
                                <WifiOff className="w-4 h-4 text-red-600" />
                              )}
                              <BatteryIcon className={`w-4 h-4 ${
                                device.battery < 20 ? 'text-red-600' : 'text-green-600'
                              }`} />
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Type:</span>
                              <span className="font-medium">{formatDeviceType(device.type)}</span>
                            </div>
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
                          </div>
                          
                          <div className="p-3 bg-gray-50 rounded mb-4">
                            <div className="text-xs text-gray-600 mb-1">Latest Reading:</div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatReading(device)}
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <button
                              onClick={() => setSelectedDevice(device)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View Details
                            </button>
                            <button className="text-gray-600 hover:text-gray-700">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Alert Center */}
            {selectedView === 'alerts' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Alert Center</h3>
                
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active alerts</p>
                    <p className="text-sm text-gray-500 mt-2">All systems are functioning normally</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeAlerts.map((alert) => (
                      <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full mr-3 ${getSeverityColor(alert.severity)}`}>
                                {alert.severity.toUpperCase()}
                              </span>
                              <span className="font-medium text-gray-900">{alert.client}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                {new Date(alert.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{alert.message}</p>
                            <p className="text-sm text-gray-500">Device: {alert.device}</p>
                          </div>
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Acknowledge
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analytics */}
            {selectedView === 'analytics' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">IoT Analytics & Insights</h3>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Advanced IoT analytics and predictive insights</p>
                  <p className="text-sm text-gray-500 mt-2">Integration with machine learning models for health predictions</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IoTDashboard;
