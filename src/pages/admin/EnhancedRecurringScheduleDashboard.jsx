import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Repeat, Users, MapPin, AlertCircle, CheckCircle, Settings, Plus, Edit, Trash2, Copy, Filter, Download, RefreshCw, ArrowRight, Zap, Target } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

const EnhancedRecurringScheduleDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Mock recurring schedule data
  const mockScheduleData = {
    overview: {
      totalRecurringSchedules: 142,
      activeSchedules: 128,
      schedulingEfficiency: 94.7,
      clientSatisfaction: 4.6,
      conflictRate: 2.3,
      optimizationScore: 91.2
    },
    scheduleTypes: [
      {
        id: 1,
        name: 'Daily Care Visits',
        frequency: 'daily',
        count: 45,
        averageDuration: 120,
        successRate: 97.8,
        conflicts: 2
      },
      {
        id: 2,
        name: 'Weekly Wellness Checks',
        frequency: 'weekly',
        count: 32,
        averageDuration: 90,
        successRate: 98.5,
        conflicts: 0
      },
      {
        id: 3,
        name: 'Bi-weekly Medication Management',
        frequency: 'bi-weekly',
        count: 28,
        averageDuration: 60,
        successRate: 99.1,
        conflicts: 1
      },
      {
        id: 4,
        name: 'Monthly Health Assessments',
        frequency: 'monthly',
        count: 23,
        averageDuration: 150,
        successRate: 96.2,
        conflicts: 0
      }
    ],
    recentSchedules: [
      {
        id: 'SCH_001',
        clientName: 'Margaret Thompson',
        caregiverName: 'Maria Garcia',
        type: 'Daily Care',
        nextVisit: '2025-08-19 09:00',
        pattern: 'Mon-Fri 9:00 AM',
        status: 'active',
        lastOptimized: '2025-08-15',
        efficiency: 95.2
      },
      {
        id: 'SCH_002',
        clientName: 'Robert Williams',
        caregiverName: 'James Wilson',
        type: 'Weekly Wellness',
        nextVisit: '2025-08-20 14:00',
        pattern: 'Tuesdays 2:00 PM',
        status: 'active',
        lastOptimized: '2025-08-14',
        efficiency: 98.1
      },
      {
        id: 'SCH_003',
        clientName: 'Dorothy Miller',
        caregiverName: 'Lisa Chen',
        type: 'Bi-weekly Medication',
        nextVisit: '2025-08-21 10:30',
        pattern: 'Every other Wednesday 10:30 AM',
        status: 'needs_review',
        lastOptimized: '2025-08-10',
        efficiency: 87.3
      }
    ],
    optimizationSuggestions: [
      {
        id: 'OPT_001',
        type: 'route_optimization',
        priority: 'high',
        title: 'Route Optimization Opportunity',
        description: 'Grouping Maria Garcia\'s Tuesday visits could save 45 minutes travel time',
        impact: 'Time savings: 45 minutes, Cost reduction: $23',
        scheduleIds: ['SCH_001', 'SCH_004'],
        estimatedSavings: 45
      },
      {
        id: 'OPT_002',
        type: 'conflict_resolution',
        priority: 'medium',
        title: 'Schedule Conflict Prevention',
        description: 'Adjusting Dorothy Miller\'s appointment by 30 minutes prevents future conflicts',
        impact: 'Prevents 3 potential conflicts over next month',
        scheduleIds: ['SCH_003'],
        estimatedSavings: 0
      },
      {
        id: 'OPT_003',
        type: 'efficiency_improvement',
        priority: 'low',
        title: 'Caregiver Load Balancing',
        description: 'Redistributing some appointments could improve overall team efficiency',
        impact: 'Efficiency improvement: 3.2%, Better work-life balance',
        scheduleIds: ['SCH_002', 'SCH_005'],
        estimatedSavings: 0
      }
    ],
    analytics: {
      weeklyPerformance: [
        { week: 'Week 1', efficiency: 92.1, conflicts: 5, satisfaction: 4.5 },
        { week: 'Week 2', efficiency: 93.8, conflicts: 3, satisfaction: 4.6 },
        { week: 'Week 3', efficiency: 94.2, conflicts: 4, satisfaction: 4.7 },
        { week: 'Week 4', efficiency: 94.7, conflicts: 2, satisfaction: 4.6 }
      ],
      patternAnalysis: {
        mostEfficient: 'Weekly patterns',
        leastEfficient: 'Complex multi-day patterns',
        peakDemandHours: '9:00 AM - 11:00 AM',
        optimalDuration: '90-120 minutes'
      }
    }
  };

  useEffect(() => {
    loadScheduleData();
  }, [selectedTimeframe]);

  const loadScheduleData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setScheduleData(mockScheduleData);
    } catch (error) {
      console.error('Error loading schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'needs_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFrequency = (frequency) => {
    return frequency.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleOptimizationApply = (optimizationId) => {
    // In a real implementation, this would apply the optimization
    console.log('Applying optimization:', optimizationId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Repeat className="w-8 h-8 text-blue-600 mr-3" />
                Enhanced Recurring Schedule Engine
              </h1>
              <p className="text-gray-600">Intelligent scheduling optimization and pattern management</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="overview">Overview</option>
                <option value="schedules">Active Schedules</option>
                <option value="optimization">Optimization</option>
                <option value="analytics">Analytics</option>
              </select>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Schedule
              </button>
              <button
                onClick={loadScheduleData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
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
            <span className="ml-3 text-gray-600">Loading schedule data...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Metrics */}
            {selectedView === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {scheduleData?.overview.totalRecurringSchedules}
                    </div>
                    <div className="text-sm text-gray-600">Total Schedules</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {scheduleData?.overview.activeSchedules}
                    </div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {scheduleData?.overview.schedulingEfficiency}%
                    </div>
                    <div className="text-sm text-gray-600">Efficiency</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {scheduleData?.overview.clientSatisfaction}/5
                    </div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {scheduleData?.overview.conflictRate}%
                    </div>
                    <div className="text-sm text-gray-600">Conflicts</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">
                      {scheduleData?.overview.optimizationScore}%
                    </div>
                    <div className="text-sm text-gray-600">Optimization</div>
                  </div>
                </div>

                {/* Schedule Types */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Schedule Type Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {scheduleData?.scheduleTypes.map((type) => (
                      <div key={type.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{type.name}</h4>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {formatFrequency(type.frequency)}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Count:</span>
                            <span className="text-sm font-medium">{type.count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Avg Duration:</span>
                            <span className="text-sm font-medium">{type.averageDuration}min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Success Rate:</span>
                            <span className="text-sm font-medium text-green-600">{type.successRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Conflicts:</span>
                            <span className={`text-sm font-medium ${type.conflicts === 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {type.conflicts}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Schedules */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Schedule Activity</h3>
                    <button
                      onClick={() => setSelectedView('schedules')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                    >
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Caregiver</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Pattern</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Next Visit</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Efficiency</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduleData?.recentSchedules.map((schedule) => (
                          <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{schedule.clientName}</div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{schedule.caregiverName}</td>
                            <td className="py-3 px-4 text-gray-600">{schedule.type}</td>
                            <td className="py-3 px-4 text-gray-600">{schedule.pattern}</td>
                            <td className="py-3 px-4 text-gray-600">{schedule.nextVisit}</td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${
                                schedule.efficiency >= 95 ? 'text-green-600' : 
                                schedule.efficiency >= 90 ? 'text-blue-600' : 'text-yellow-600'
                              }`}>
                                {schedule.efficiency}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(schedule.status)}`}>
                                {schedule.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Optimization View */}
            {selectedView === 'optimization' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                      Optimization Suggestions
                    </h3>
                    <div className="text-sm text-gray-600">
                      Potential savings: <span className="font-medium text-green-600">68 minutes/day</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {scheduleData?.optimizationSuggestions.map((suggestion) => (
                      <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="font-medium text-gray-900 mr-3">{suggestion.title}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                                {suggestion.priority} priority
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{suggestion.description}</p>
                            <p className="text-sm text-blue-600">{suggestion.impact}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleOptimizationApply(suggestion.id)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Apply
                            </button>
                            <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200">
                              Review
                            </button>
                          </div>
                        </div>
                        
                        {suggestion.estimatedSavings > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded p-2">
                            <div className="flex items-center">
                              <Target className="w-4 h-4 text-green-600 mr-2" />
                              <span className="text-sm text-green-800">
                                Estimated time savings: {suggestion.estimatedSavings} minutes
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pattern Analysis */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Pattern Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Efficiency Insights</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Most Efficient:</span>
                          <span className="font-medium text-green-600">{scheduleData?.analytics.patternAnalysis.mostEfficient}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Least Efficient:</span>
                          <span className="font-medium text-red-600">{scheduleData?.analytics.patternAnalysis.leastEfficient}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Peak Demand:</span>
                          <span className="font-medium text-blue-600">{scheduleData?.analytics.patternAnalysis.peakDemandHours}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Optimal Duration:</span>
                          <span className="font-medium text-purple-600">{scheduleData?.analytics.patternAnalysis.optimalDuration}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Weekly Performance Trend</h4>
                      <div className="space-y-2">
                        {scheduleData?.analytics.weeklyPerformance.map((week, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">{week.week}</span>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-green-600">{week.efficiency}%</span>
                              <span className="text-sm text-red-600">{week.conflicts} conflicts</span>
                              <span className="text-sm text-blue-600">{week.satisfaction}/5</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics View */}
            {selectedView === 'analytics' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Schedule Analytics & Insights</h3>
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Advanced analytics charts and insights would be displayed here.</p>
                  <p className="text-sm text-gray-500 mt-2">Integration with charting libraries like Chart.js or D3.js recommended.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Recurring Schedule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Select client...</option>
                  <option>Margaret Thompson</option>
                  <option>Robert Williams</option>
                  <option>Dorothy Miller</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caregiver</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Select caregiver...</option>
                  <option>Maria Garcia</option>
                  <option>James Wilson</option>
                  <option>Lisa Chen</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Pattern</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                  <option>Monthly</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRecurringScheduleDashboard;
