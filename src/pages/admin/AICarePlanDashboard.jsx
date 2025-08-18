import React, { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, User, Activity, Heart, Lightbulb, Star, Zap, ArrowRight, RefreshCw, Download, Share } from 'lucide-react';
import { carePlanAI, healthPredictionAI, riskAssessmentAI, aiInsights } from '../../services/aiServices';

const AICarePlanDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState('C001');
  const [activeTab, setActiveTab] = useState('optimization');
  const [insights, setInsights] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);
  const [healthRisks, setHealthRisks] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);

  // Mock client data
  const clients = [
    { id: 'C001', name: 'Eleanor Johnson', age: 78, riskLevel: 'moderate', lastOptimized: '2 days ago' },
    { id: 'C015', name: 'Robert Williams', age: 82, riskLevel: 'high', lastOptimized: '5 days ago' },
    { id: 'C008', name: 'Dorothy Miller', age: 75, riskLevel: 'low', lastOptimized: '1 day ago' },
    { id: 'C023', name: 'Harold Davis', age: 79, riskLevel: 'moderate', lastOptimized: '3 days ago' }
  ];

  useEffect(() => {
    if (selectedClient) {
      loadClientData();
    }
  }, [selectedClient]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      const clientInsights = await aiInsights.getClientInsights(selectedClient);
      setInsights(clientInsights.data);
      setOptimizationData(clientInsights.data.carePlanOptimization);
      setHealthRisks(clientInsights.data.healthRiskAnalysis);
      setRiskAssessment(clientInsights.data.riskAssessment);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeCarePlan = async () => {
    setLoading(true);
    try {
      const result = await carePlanAI.optimizeCarePlan({ clientId: selectedClient });
      setOptimizationData(result.data);
    } catch (error) {
      console.error('Error optimizing care plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const tabs = [
    { id: 'optimization', label: 'Care Plan Optimization', icon: Target },
    { id: 'health-risks', label: 'Health Risk Analysis', icon: Heart },
    { id: 'risk-assessment', label: 'Risk Assessment', icon: AlertTriangle },
    { id: 'insights', label: 'AI Insights', icon: Brain }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="w-8 h-8 text-blue-600 mr-3" />
                AI Care Plan Optimization
              </h1>
              <p className="text-gray-600">Intelligent care planning powered by machine learning</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadClientData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Client Selector Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Client</h3>
              <div className="space-y-3">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedClient === client.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{client.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getRiskLevelColor(client.riskLevel)}`}>
                        {client.riskLevel}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Age: {client.age}</p>
                      <p>Last optimized: {client.lastOptimized}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleOptimizeCarePlan}
                  disabled={loading}
                  className="w-full flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Optimize Care Plan
                </button>
                <button className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>
                <button className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Share className="w-4 h-4 mr-2" />
                  Share Insights
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Processing AI analysis...</span>
                  </div>
                ) : (
                  <>
                    {/* Care Plan Optimization Tab */}
                    {activeTab === 'optimization' && optimizationData && (
                      <div className="space-y-6">
                        {/* Optimization Summary */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Optimization Results</h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {Math.round(optimizationData.confidence * 100)}% Confidence
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {Math.round(optimizationData.metrics.currentEffectiveness * 100)}%
                              </div>
                              <div className="text-sm text-gray-600">Current Effectiveness</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {Math.round(optimizationData.metrics.predictedEffectiveness * 100)}%
                              </div>
                              <div className="text-sm text-gray-600">Predicted Effectiveness</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-indigo-600">
                                +{Math.round(optimizationData.metrics.improvementPotential * 100)}%
                              </div>
                              <div className="text-sm text-gray-600">Improvement Potential</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                -{Math.round(optimizationData.metrics.riskReduction * 100)}%
                              </div>
                              <div className="text-sm text-gray-600">Risk Reduction</div>
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
                          <div className="space-y-4">
                            {optimizationData.recommendations.map((rec) => (
                              <div key={rec.id} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center">
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(rec.priority)}`}>
                                      {rec.priority}
                                    </div>
                                    <h4 className="font-semibold text-gray-900 ml-3">{rec.title}</h4>
                                  </div>
                                  <span className="text-sm text-gray-500">{rec.costImpact}</span>
                                </div>
                                <p className="text-gray-700 mb-3">{rec.description}</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-700">Expected Outcome:</span>
                                    <p className="text-gray-600">{rec.expectedOutcome}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Implementation:</span>
                                    <p className="text-gray-600">{rec.implementationEffort}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Risk Level:</span>
                                    <p className="text-gray-600">{rec.riskLevel}</p>
                                  </div>
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                  <span className="font-medium text-blue-900">AI Rationale:</span>
                                  <p className="text-blue-800 text-sm mt-1">{rec.rationale}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Health Risk Analysis Tab */}
                    {activeTab === 'health-risks' && healthRisks && (
                      <div className="space-y-6">
                        {/* Risk Overview */}
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Health Risk Overview</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(healthRisks.riskLevel)}`}>
                              {healthRisks.riskLevel} Risk
                            </span>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-red-600 mb-2">
                              {Math.round(healthRisks.overallRiskScore * 100)}%
                            </div>
                            <div className="text-gray-600">Overall Risk Score</div>
                          </div>
                        </div>

                        {/* Predictions */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Predictions</h3>
                          <div className="space-y-4">
                            {healthRisks.predictions.map((prediction, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-semibold text-gray-900">{prediction.condition.replace(/_/g, ' ').toUpperCase()}</h4>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-orange-600">
                                      {Math.round(prediction.probability * 100)}%
                                    </div>
                                    <div className="text-sm text-gray-500">Probability</div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <span className="font-medium text-gray-700">Timeframe:</span>
                                    <p className="text-gray-600">{prediction.timeframe}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Confidence:</span>
                                    <p className="text-gray-600">{Math.round(prediction.confidence * 100)}%</p>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <span className="font-medium text-gray-700">Key Indicators:</span>
                                  <ul className="mt-2 space-y-1">
                                    {prediction.indicators.map((indicator, idx) => (
                                      <li key={idx} className="text-gray-600 text-sm flex items-center">
                                        <AlertTriangle className="w-3 h-3 text-yellow-500 mr-2" />
                                        {indicator}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Recommended Actions:</span>
                                  <ul className="mt-2 space-y-1">
                                    {prediction.recommendations.map((rec, idx) => (
                                      <li key={idx} className="text-gray-600 text-sm flex items-center">
                                        <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Risk Assessment Tab */}
                    {activeTab === 'risk-assessment' && riskAssessment && (
                      <div className="space-y-6">
                        {/* Risk Categories */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Categories</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {riskAssessment.riskCategories.map((category) => (
                              <div key={category.category} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-gray-900">
                                    {category.category.replace(/_/g, ' ').toUpperCase()}
                                  </h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(category.level)}`}>
                                    {category.level}
                                  </span>
                                </div>
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Risk Score</span>
                                    <span className="font-bold">{Math.round(category.score * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        category.level === 'high' ? 'bg-red-500' :
                                        category.level === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                                      }`}
                                      style={{ width: `${category.score * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <span className="font-medium text-gray-700 text-sm">Key Factors:</span>
                                  {category.factors.slice(0, 3).map((factor, idx) => (
                                    <p key={idx} className="text-gray-600 text-sm">• {factor}</p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Intervention Priorities */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Intervention Priorities</h3>
                          <div className="space-y-3">
                            {riskAssessment.interventionPriority.map((intervention, index) => (
                              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium mr-3 ${getPriorityColor(intervention.priority)}`}>
                                      {intervention.priority}
                                    </span>
                                    <span className="font-medium text-gray-900">{intervention.intervention}</span>
                                  </div>
                                  <p className="text-gray-600 text-sm">{intervention.description}</p>
                                  <p className="text-gray-500 text-xs mt-1">Expected timeframe: {intervention.timeframe}</p>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-green-600">
                                    -{Math.round(intervention.expectedImpact * 100)}%
                                  </div>
                                  <div className="text-xs text-gray-500">Risk Reduction</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Insights Tab */}
                    {activeTab === 'insights' && insights && (
                      <div className="space-y-6">
                        {/* AI Confidence Score */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">AI Analysis Confidence</h3>
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                              {Math.round(insights.confidenceScore * 100)}% Accurate
                            </span>
                          </div>
                          <p className="text-gray-600">
                            Our AI system has analyzed {selectedClient} with high confidence, processing multiple data points 
                            including care history, health metrics, and risk factors.
                          </p>
                        </div>

                        {/* Recommendations by Timeline */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations by Timeline</h3>
                          <div className="space-y-6">
                            {Object.entries(insights.aiRecommendations).map(([timeline, recommendations]) => (
                              <div key={timeline} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                                  <h4 className="font-semibold text-gray-900 capitalize">
                                    {timeline.replace(/([A-Z])/g, ' $1')}
                                  </h4>
                                </div>
                                <div className="space-y-2">
                                  {recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-center">
                                      <ArrowRight className="w-4 h-4 text-blue-500 mr-3" />
                                      <span className="text-gray-700">{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICarePlanDashboard;
