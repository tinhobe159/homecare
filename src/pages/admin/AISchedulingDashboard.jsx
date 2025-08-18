import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Zap, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Settings, Download, Filter, User, Route, Target } from 'lucide-react';
import { schedulingAI, riskAssessmentAI } from '../../services/aiServices';

const AISchedulingDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [optimizedSchedule, setOptimizedSchedule] = useState(null);
  const [conflictAnalysis, setConflictAnalysis] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [optimizationMode, setOptimizationMode] = useState('balanced');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadScheduleData();
  }, [selectedDate, optimizationMode]);

  const loadScheduleData = async () => {
    setLoading(true);
    try {
      const [scheduleResult, conflictResult] = await Promise.all([
        schedulingAI.optimizeSchedules([], [], { mode: optimizationMode }),
        schedulingAI.predictConflicts({ date: selectedDate })
      ]);
      setOptimizedSchedule(scheduleResult.data);
      setConflictAnalysis(conflictResult.data);
    } catch (error) {
      console.error('Error loading schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeSchedule = async () => {
    setLoading(true);
    try {
      const result = await schedulingAI.optimizeSchedules([], [], { 
        mode: optimizationMode,
        date: selectedDate 
      });
      setOptimizedSchedule(result.data);
    } catch (error) {
      console.error('Error optimizing schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const optimizationModes = [
    { id: 'efficiency', label: 'Efficiency First', description: 'Minimize travel time and maximize utilization' },
    { id: 'balanced', label: 'Balanced', description: 'Balance efficiency with caregiver satisfaction' },
    { id: 'satisfaction', label: 'Satisfaction First', description: 'Prioritize caregiver and client preferences' },
    { id: 'emergency', label: 'Emergency Mode', description: 'Optimize for urgent care and flexibility' }
  ];

  const getUtilizationColor = (rate) => {
    if (rate >= 0.9) return 'text-green-600 bg-green-50';
    if (rate >= 0.75) return 'text-blue-600 bg-blue-50';
    if (rate >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Zap className="w-8 h-8 text-blue-600 mr-3" />
                AI Scheduling Optimization
              </h1>
              <p className="text-gray-600">Intelligent scheduling powered by machine learning algorithms</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              <button
                onClick={handleOptimizeSchedule}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Re-optimize
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="pb-6 border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Optimization Mode</label>
                  <select
                    value={optimizationMode}
                    onChange={(e) => setOptimizationMode(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {optimizationModes.map((mode) => (
                      <option key={mode.id} value={mode.id}>{mode.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={loadScheduleData}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Optimizing schedules with AI...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Optimization Summary */}
            {optimizedSchedule && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Optimization Results</h2>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {Math.round(optimizedSchedule.optimizationScore * 100)}% Optimized
                    </span>
                    <button className="text-blue-600 hover:text-blue-800">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{optimizedSchedule.totalTravelTimeReduced}</div>
                    <div className="text-sm text-gray-600">Travel Time Saved</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{optimizedSchedule.efficiencyGain}</div>
                    <div className="text-sm text-gray-600">Efficiency Gain</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{optimizedSchedule.assignments.length}</div>
                    <div className="text-sm text-gray-600">Caregivers Scheduled</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">
                      {optimizedSchedule.assignments.reduce((sum, a) => sum + a.dailySchedule.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Appointments</div>
                  </div>
                </div>

                {/* Optimization Insights */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Optimization Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {optimizedSchedule.optimizationInsights.map((insight, index) => (
                      <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                        <span className="text-blue-800 text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Mitigation */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Risk Mitigation Strategies</h3>
                  <div className="space-y-2">
                    {optimizedSchedule.riskMitigation.map((strategy, index) => (
                      <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-green-600 mr-3" />
                        <span className="text-green-800 text-sm">{strategy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Caregiver Schedules */}
            {optimizedSchedule && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Optimized Caregiver Schedules</h2>
                
                <div className="space-y-6">
                  {optimizedSchedule.assignments.map((assignment) => (
                    <div key={assignment.caregiver_id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <User className="w-6 h-6 text-blue-600 mr-3" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{assignment.caregiverName}</h3>
                            <p className="text-sm text-gray-600">ID: {assignment.caregiverId}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getUtilizationColor(assignment.utilizationRate)}`}>
                              {Math.round(assignment.utilizationRate * 100)}% Utilization
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              Satisfaction: {Math.round(assignment.satisfactionPrediction * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Total: {assignment.totalHours}h</span>
                        </div>
                        <div className="flex items-center">
                          <Route className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Travel: {assignment.totalTravelTime}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">{assignment.dailySchedule.length} appointments</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {assignment.dailySchedule.map((appointment, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className="font-medium text-gray-900">{appointment.timeSlot}</span>
                                <span className="mx-2 text-gray-400">•</span>
                                <span className="text-gray-700">{appointment.clientName}</span>
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {appointment.priority}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span className="mr-4">Travel: {appointment.travelTime}</span>
                                <span>{appointment.services.join(', ')}</span>
                              </div>
                              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                                AI Optimization: {appointment.aiOptimization}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conflict Analysis */}
            {conflictAnalysis && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Conflict Risk Analysis</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    conflictAnalysis.conflictRisk > 0.5 ? 'bg-red-100 text-red-800' :
                    conflictAnalysis.conflictRisk > 0.3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {Math.round(conflictAnalysis.conflictRisk * 100)}% Risk Level
                  </span>
                </div>

                {conflictAnalysis.potentialIssues.length > 0 ? (
                  <div className="space-y-4">
                    {conflictAnalysis.potentialIssues.map((issue, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${getRiskColor(issue.impact)}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{issue.type.replace(/_/g, ' ').toUpperCase()}</h4>
                            <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {Math.round(issue.probability * 100)}% Probability
                            </div>
                            <div className="text-xs text-gray-500 capitalize">{issue.impact} Impact</div>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                          <span className="font-medium text-gray-700">AI Recommendation:</span>
                          <p className="text-gray-600 text-sm mt-1">{issue.mitigation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Conflicts Detected</h3>
                    <p className="text-gray-600">AI analysis shows minimal risk of scheduling conflicts for the selected date.</p>
                  </div>
                )}

                {/* Recommendations */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Recommendations</h3>
                  <div className="space-y-2">
                    {conflictAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-blue-600 mr-3" />
                        <span className="text-blue-800 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISchedulingDashboard;
