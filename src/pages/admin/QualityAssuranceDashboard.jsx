import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, TrendingUp, Activity, Clock, Users, FileText, Star, Target, Zap, RefreshCw, Download, Filter } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

const QualityAssuranceDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [qualityMetrics, setQualityMetrics] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock quality assurance data
  const mockQualityData = {
    overallScore: 92.5,
    complianceRate: 98.2,
    satisfactionScore: 4.6,
    incidentRate: 0.03,
    auditResults: {
      lastAudit: '2025-08-15',
      score: 94.5,
      status: 'excellent',
      nextAudit: '2025-11-15'
    },
    metrics: {
      documentationQuality: {
        score: 95.8,
        trend: 'improving',
        benchmarkComparison: 'above_average',
        issues: [
          { type: 'missing_vitals', count: 3, severity: 'low' },
          { type: 'incomplete_notes', count: 1, severity: 'medium' }
        ]
      },
      caregiverPerformance: {
        score: 89.3,
        trend: 'stable',
        benchmarkComparison: 'excellent',
        topPerformers: [
          { id: 12, name: 'Maria Garcia', score: 97.2, improvements: '+2.1%' },
          { id: 14, name: 'James Wilson', score: 94.8, improvements: '+1.5%' },
          { id: 18, name: 'Lisa Chen', score: 92.4, improvements: '+3.2%' }
        ],
        improvementAreas: [
          { caregiver: 'Robert Taylor', area: 'Documentation Timeliness', score: 78.5 },
          { caregiver: 'Sarah Johnson', area: 'Client Communication', score: 82.1 }
        ]
      },
      clientSatisfaction: {
        score: 4.6,
        trend: 'improving',
        responseRate: 87.3,
        categories: [
          { category: 'Care Quality', score: 4.7, target: 4.5 },
          { category: 'Punctuality', score: 4.8, target: 4.6 },
          { category: 'Communication', score: 4.4, target: 4.5 },
          { category: 'Professionalism', score: 4.9, target: 4.7 }
        ],
        recentFeedback: [
          { client: 'Eleanor Johnson', rating: 5, comment: 'Maria is absolutely wonderful and professional' },
          { client: 'Robert Williams', rating: 4, comment: 'Good care, would like more communication about schedule changes' },
          { client: 'Dorothy Miller', rating: 5, comment: 'Excellent service, very satisfied with the care provided' }
        ]
      },
      safetyMetrics: {
        score: 96.7,
        incidentRate: 0.03,
        trend: 'improving',
        incidents: [
          {
            id: 'INC_001',
            date: '2025-08-12',
            type: 'Minor Fall',
            severity: 'low',
            resolution: 'No injury, safety protocols reviewed',
            preventiveMeasures: 'Added grab bars, improved lighting'
          },
          {
            id: 'INC_002',
            date: '2025-08-10',
            type: 'Medication Error',
            severity: 'medium',
            resolution: 'Doctor notified, medication schedule adjusted',
            preventiveMeasures: 'Enhanced medication tracking system'
          }
        ],
        safetyTraining: {
          completion: 98.5,
          upToDate: 94.2,
          nextReview: '2025-09-01'
        }
      }
    }
  };

  const mockPerformanceData = {
    systemPerformance: {
      uptime: 99.97,
      averageResponseTime: 180, // milliseconds
      peakLoadHandling: 95.2,
      databasePerformance: 98.5
    },
    operationalEfficiency: {
      schedulingEfficiency: 94.3,
      resourceUtilization: 87.8,
      appointmentFillRate: 96.7,
      cancellationRate: 3.2
    },
    dataQuality: {
      completeness: 97.8,
      accuracy: 99.2,
      consistency: 96.5,
      timeliness: 94.7
    }
  };

  useEffect(() => {
    loadQualityData();
  }, [selectedTimeframe, selectedCategory]);

  const loadQualityData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQualityMetrics(mockQualityData);
      setPerformanceData(mockPerformanceData);
    } catch (error) {
      console.error('Error loading quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 95) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 85) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
                <Shield className="w-8 h-8 text-green-600 mr-3" />
                Quality Assurance Dashboard
              </h1>
              <p className="text-gray-600">Comprehensive quality monitoring and performance optimization</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={loadQualityData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Loading quality metrics...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quality Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {qualityMetrics?.overallScore}%
                </div>
                <div className="text-sm text-gray-600">Overall Quality Score</div>
                <div className="mt-2 flex items-center justify-center">
                  {getTrendIcon('improving')}
                  <span className="text-xs text-green-600 ml-1">+2.3%</span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {qualityMetrics?.complianceRate}%
                </div>
                <div className="text-sm text-gray-600">Compliance Rate</div>
                <div className="mt-2 flex items-center justify-center">
                  {getTrendIcon('stable')}
                  <span className="text-xs text-blue-600 ml-1">+0.1%</span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {qualityMetrics?.satisfactionScore}/5
                </div>
                <div className="text-sm text-gray-600">Client Satisfaction</div>
                <div className="mt-2 flex items-center justify-center">
                  {getTrendIcon('improving')}
                  <span className="text-xs text-purple-600 ml-1">+0.2</span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {qualityMetrics?.incidentRate}%
                </div>
                <div className="text-sm text-gray-600">Incident Rate</div>
                <div className="mt-2 flex items-center justify-center">
                  {getTrendIcon('improving')}
                  <span className="text-xs text-green-600 ml-1">-0.01%</span>
                </div>
              </div>
            </div>

            {/* Audit Results */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Audit Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${getScoreColor(qualityMetrics?.auditResults.score).split(' ')[0]}`}>
                    {qualityMetrics?.auditResults.score}%
                  </div>
                  <div className="text-sm text-gray-600">Audit Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                    {qualityMetrics?.auditResults.status}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {qualityMetrics?.auditResults.lastAudit}
                  </div>
                  <div className="text-sm text-gray-600">Last Audit</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {qualityMetrics?.auditResults.nextAudit}
                  </div>
                  <div className="text-sm text-gray-600">Next Audit</div>
                </div>
              </div>
            </div>

            {/* Quality Metrics Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Documentation Quality */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Documentation Quality</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(qualityMetrics?.metrics.documentationQuality.score)}`}>
                    {qualityMetrics?.metrics.documentationQuality.score}%
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Trend:</span>
                    <div className="flex items-center">
                      {getTrendIcon(qualityMetrics?.metrics.documentationQuality.trend)}
                      <span className="ml-2 text-sm capitalize">{qualityMetrics?.metrics.documentationQuality.trend}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 block mb-2">Recent Issues:</span>
                    <div className="space-y-2">
                      {qualityMetrics?.metrics.documentationQuality.issues.map((issue, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{issue.type.replace(/_/g, ' ')}</span>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2">{issue.count}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Caregiver Performance */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Caregiver Performance</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(qualityMetrics?.metrics.caregiverPerformance.score)}`}>
                    {qualityMetrics?.metrics.caregiverPerformance.score}%
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-600 block mb-2">Top Performers:</span>
                    <div className="space-y-2">
                      {qualityMetrics?.metrics.caregiverPerformance.topPerformers.slice(0, 3).map((performer, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm text-gray-900 font-medium">{performer.name}</span>
                          <div className="flex items-center">
                            <span className="text-sm text-green-600 mr-2">{performer.score}%</span>
                            <span className="text-xs text-green-600">{performer.improvements}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 block mb-2">Improvement Areas:</span>
                    <div className="space-y-2">
                      {qualityMetrics?.metrics.caregiverPerformance.improvementAreas.map((area, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <div>
                            <div className="text-sm text-gray-900 font-medium">{area.caregiver}</div>
                            <div className="text-xs text-gray-600">{area.area}</div>
                          </div>
                          <span className="text-sm text-yellow-600">{area.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Satisfaction */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Client Satisfaction</h3>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`w-4 h-4 ${
                          index < Math.floor(qualityMetrics?.metrics.clientSatisfaction.score)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium">{qualityMetrics?.metrics.clientSatisfaction.score}/5</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {qualityMetrics?.metrics.clientSatisfaction.categories.map((category, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{category.category}</span>
                          <span className="text-sm text-gray-600">{category.score}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              category.score >= category.target ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${(category.score / 5) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Target: {category.target}/5</div>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <span className="text-gray-600 block mb-2">Recent Feedback:</span>
                    <div className="space-y-2">
                      {qualityMetrics?.metrics.clientSatisfaction.recentFeedback.slice(0, 2).map((feedback, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{feedback.client}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, starIndex) => (
                                <Star
                                  key={starIndex}
                                  className={`w-3 h-3 ${
                                    starIndex < feedback.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-700">"{feedback.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Metrics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Safety Metrics</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(qualityMetrics?.metrics.safetyMetrics.score)}`}>
                    {qualityMetrics?.metrics.safetyMetrics.score}%
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{qualityMetrics?.metrics.safetyMetrics.incidentRate}%</div>
                      <div className="text-xs text-gray-600">Incident Rate</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{qualityMetrics?.metrics.safetyMetrics.safetyTraining.completion}%</div>
                      <div className="text-xs text-gray-600">Training Complete</div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 block mb-2">Recent Incidents:</span>
                    <div className="space-y-2">
                      {qualityMetrics?.metrics.safetyMetrics.incidents.map((incident, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">{incident.type}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(incident.severity)}`}>
                              {incident.severity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{incident.resolution}</p>
                          <p className="text-xs text-blue-600">Prevention: {incident.preventiveMeasures}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">System Performance Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">System Performance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="font-medium text-green-600">{performanceData?.systemPerformance.uptime}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="font-medium text-blue-600">{performanceData?.systemPerformance.averageResponseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Peak Load</span>
                      <span className="font-medium text-purple-600">{performanceData?.systemPerformance.peakLoadHandling}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Operational Efficiency</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Scheduling Efficiency</span>
                      <span className="font-medium text-green-600">{performanceData?.operationalEfficiency.schedulingEfficiency}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Resource Utilization</span>
                      <span className="font-medium text-blue-600">{performanceData?.operationalEfficiency.resourceUtilization}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fill Rate</span>
                      <span className="font-medium text-purple-600">{performanceData?.operationalEfficiency.appointmentFillRate}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Data Quality</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completeness</span>
                      <span className="font-medium text-green-600">{performanceData?.dataQuality.completeness}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Accuracy</span>
                      <span className="font-medium text-blue-600">{performanceData?.dataQuality.accuracy}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Timeliness</span>
                      <span className="font-medium text-purple-600">{performanceData?.dataQuality.timeliness}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityAssuranceDashboard;
