import React, { useState, useEffect } from "react";
import { performanceMetricsAPI, caregiversAPI } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const PerformanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [caregivers, setCaregivers] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('2025-07');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
    loadCaregivers();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await performanceMetricsAPI.getByPeriod(selectedPeriod);
      setDashboardData(response.data);
    } catch (error) {
      setError('Failed to load performance data');
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCaregivers = async () => {
    try {
      const response = await caregiversAPI.getAll();
      setCaregivers(response.data);
    } catch (error) {
      console.error('Error loading caregivers:', error);
    }
  };

  const calculateOverallStats = () => {
    if (!dashboardData || dashboardData.length === 0) return null;

    const totalCaregivers = dashboardData.length;
    const avgSatisfaction = dashboardData.reduce((sum, metric) => sum + metric.customerSatisfactionScore, 0) / totalCaregivers;
    const avgCompliance = dashboardData.reduce((sum, metric) => sum + metric.evvComplianceRate, 0) / totalCaregivers;
    const avgPunctuality = dashboardData.reduce((sum, metric) => sum + metric.timePunctuality, 0) / totalCaregivers;
    const totalAppointments = dashboardData.reduce((sum, metric) => sum + metric.totalAppointments, 0);
    const totalCompleted = dashboardData.reduce((sum, metric) => sum + metric.completedAppointments, 0);

    return {
      totalCaregivers,
      avgSatisfaction: avgSatisfaction.toFixed(1),
      avgCompliance: avgCompliance.toFixed(1),
      avgPunctuality: avgPunctuality.toFixed(1),
      completionRate: ((totalCompleted / totalAppointments) * 100).toFixed(1)
    };
  };

  const getPerformanceColor = (score, isPercentage = false) => {
    const threshold = isPercentage ? 90 : 4.5;
    const goodThreshold = isPercentage ? 95 : 4.7;
    
    if (score >= goodThreshold) return 'text-green-600';
    if (score >= threshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (metric) => {
    const overall = metric.overallRating;
    if (overall >= 4.7) return { color: 'bg-green-100 text-green-800', label: 'Excellent' };
    if (overall >= 4.3) return { color: 'bg-yellow-100 text-yellow-800', label: 'Good' };
    if (overall >= 4.0) return { color: 'bg-orange-100 text-orange-800', label: 'Needs Improvement' };
    return { color: 'bg-red-100 text-red-800', label: 'Poor' };
  };

  const handleCaregiverSelect = async (caregiverId) => {
    try {
      const response = await performanceMetricsAPI.getByCaregiverId(caregiverId);
      setSelectedCaregiver(response.data[0]);
    } catch (error) {
      console.error('Error loading caregiver performance:', error);
    }
  };

  const overallStats = calculateOverallStats();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
        
        {/* Period Selection */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Reporting Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2025-07">July 2025</option>
            <option value="2025-06">June 2025</option>
            <option value="2025-05">May 2025</option>
          </select>
        </div>
      </div>

      {/* Overall Statistics */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Caregivers</p>
                <p className="text-2xl font-semibold text-gray-900">{overallStats.totalCaregivers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">⭐</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Satisfaction</p>
                <p className={`text-2xl font-semibold ${getPerformanceColor(overallStats.avgSatisfaction)}`}>
                  {overallStats.avgSatisfaction}/5.0
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">EVV Compliance</p>
                <p className={`text-2xl font-semibold ${getPerformanceColor(overallStats.avgCompliance, true)}`}>
                  {overallStats.avgCompliance}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold">⏰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Punctuality</p>
                <p className={`text-2xl font-semibold ${getPerformanceColor(overallStats.avgPunctuality, true)}`}>
                  {overallStats.avgPunctuality}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <p className={`text-2xl font-semibold ${getPerformanceColor(overallStats.completionRate, true)}`}>
                  {overallStats.completionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Caregiver Performance List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Caregiver Performance Rankings
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Performance metrics for {selectedPeriod}
          </p>
        </div>
        
        {dashboardData && dashboardData.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {dashboardData
              .sort((a, b) => b.overallRating - a.overallRating)
              .map((metric, index) => {
                const caregiver = caregivers.find(c => c.id === metric.caregiver_id);
                const badge = getPerformanceBadge(metric);
                
                return (
                  <li key={metric.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-500">
                            #{index + 1}
                          </div>
                          <img
                            className="h-10 w-10 rounded-full"
                            src={caregiver?.avatar_url || 'https://via.placeholder.com/40'}
                            alt=""
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {caregiver?.first_name} {caregiver?.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {metric.totalAppointments} appointments this period
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                          <div className="text-right">
                            <p className={`text-lg font-semibold ${getPerformanceColor(metric.overallRating)}`}>
                              {metric.overallRating}/5.0
                            </p>
                            <p className="text-sm text-gray-500">Overall Rating</p>
                          </div>
                          <button
                            onClick={() => handleCaregiverSelect(metric.caregiver_id)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                      
                      {/* Quick Metrics */}
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-6 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Satisfaction:</span>{' '}
                          <span className={getPerformanceColor(metric.customerSatisfactionScore)}>
                            {metric.customerSatisfactionScore}/5.0
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Task Completion:</span>{' '}
                          <span className={getPerformanceColor(metric.averageTaskCompletionRate, true)}>
                            {metric.averageTaskCompletionRate}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Punctuality:</span>{' '}
                          <span className={getPerformanceColor(metric.timePunctuality, true)}>
                            {metric.timePunctuality}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">EVV Compliance:</span>{' '}
                          <span className={getPerformanceColor(metric.evvComplianceRate, true)}>
                            {metric.evvComplianceRate}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Location Accuracy:</span>{' '}
                          <span className="text-gray-600">±{metric.locationAccuracyAverage}m</span>
                        </div>
                        <div>
                          <span className="font-medium">Late Arrivals:</span>{' '}
                          <span className={metric.lateArrivals > 2 ? 'text-red-600' : 'text-green-600'}>
                            {metric.lateArrivals}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No performance data available</div>
            <p className="text-gray-400 mt-2">Performance metrics will appear here once calculated</p>
          </div>
        )}
      </div>

      {/* Detailed Caregiver View Modal */}
      {selectedCaregiver && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-semibold">Performance Details</h3>
              <button
                onClick={() => setSelectedCaregiver(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-4 space-y-6">
              {/* Caregiver Info */}
              <div className="flex items-center space-x-4">
                <img
                  className="h-16 w-16 rounded-full"
                  src={caregivers.find(c => c.id === selectedCaregiver.caregiver_id)?.avatar_url || 'https://via.placeholder.com/64'}
                  alt=""
                />
                <div>
                  <h4 className="text-xl font-semibold">
                    {caregivers.find(c => c.id === selectedCaregiver.caregiver_id)?.first_name}{' '}
                    {caregivers.find(c => c.id === selectedCaregiver.caregiver_id)?.last_name}
                  </h4>
                  <p className="text-gray-600">Performance Period: {selectedCaregiver.reportingPeriod}</p>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Appointment Statistics</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Appointments:</span>
                      <span className="font-medium">{selectedCaregiver.totalAppointments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-medium text-green-600">{selectedCaregiver.completedAppointments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelled:</span>
                      <span className="font-medium text-red-600">{selectedCaregiver.cancelledAppointments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Late Arrivals:</span>
                      <span className="font-medium text-yellow-600">{selectedCaregiver.lateArrivals}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Quality Metrics</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Customer Satisfaction:</span>
                      <span className={`font-medium ${getPerformanceColor(selectedCaregiver.customerSatisfactionScore)}`}>
                        {selectedCaregiver.customerSatisfactionScore}/5.0
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Task Completion Rate:</span>
                      <span className={`font-medium ${getPerformanceColor(selectedCaregiver.averageTaskCompletionRate, true)}`}>
                        {selectedCaregiver.averageTaskCompletionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>EVV Compliance:</span>
                      <span className={`font-medium ${getPerformanceColor(selectedCaregiver.evvComplianceRate, true)}`}>
                        {selectedCaregiver.evvComplianceRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Punctuality:</span>
                      <span className={`font-medium ${getPerformanceColor(selectedCaregiver.timePunctuality, true)}`}>
                        {selectedCaregiver.timePunctuality}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location Accuracy:</span>
                      <span className="font-medium">±{selectedCaregiver.locationAccuracyAverage}m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supervisor Notes */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Supervisor Notes</h5>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-700 text-sm">
                    {selectedCaregiver.supervisorNotes || 'No notes available'}
                  </p>
                </div>
              </div>

              {/* Overall Rating */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2">
                  <span className="text-gray-600">Overall Performance Rating:</span>
                  <span className={`text-2xl font-bold ${getPerformanceColor(selectedCaregiver.overallRating)}`}>
                    {selectedCaregiver.overallRating}/5.0
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceBadge(selectedCaregiver).color}`}>
                    {getPerformanceBadge(selectedCaregiver).label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
