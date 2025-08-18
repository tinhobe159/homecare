import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, DollarSign, Users, Clock, Target, AlertTriangle, Download, Filter, RefreshCw, Calendar, Eye, Brain, TrendingDown, Award, Zap } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

const AdvancedAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [businessMetrics, setBusinessMetrics] = useState(null);
  const [predictiveInsights, setPredictiveInsights] = useState(null);
  const [qualityMetrics, setQualityMetrics] = useState(null);
  const [financialAnalytics, setFinancialAnalytics] = useState(null);
  const [operationalAnalytics, setOperationalAnalytics] = useState(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    
    // Setup auto-refresh for real-time metrics
    if (autoRefresh) {
      const interval = setInterval(() => {
        if (activeTab === 'realtime') {
          loadRealtimeData();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, dateRange, autoRefresh]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [business, predictive, quality, financial, operational, realtime] = await Promise.all([
        analyticsAPI.getBusinessMetrics(dateRange),
        analyticsAPI.getPredictiveInsights(),
        analyticsAPI.getQualityMetrics(dateRange),
        analyticsAPI.getFinancialAnalytics(dateRange),
        analyticsAPI.getOperationalAnalytics(dateRange),
        analyticsAPI.getRealtimeMetrics()
      ]);

      setBusinessMetrics(business.data);
      setPredictiveInsights(predictive.data);
      setQualityMetrics(quality.data);
      setFinancialAnalytics(financial.data);
      setOperationalAnalytics(operational.data);
      setRealtimeMetrics(realtime.data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeData = async () => {
    try {
      const realtime = await analyticsAPI.getRealtimeMetrics();
      setRealtimeMetrics(realtime.data);
    } catch (error) {
      console.error('Error loading realtime data:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trend)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </div>
    );
  };

  const ChartCard = ({ title, children, actions }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
              <p className="text-gray-600">Business intelligence and predictive insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg border ${autoRefresh ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
              >
                <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Business Overview', icon: TrendingUp },
              { id: 'predictive', label: 'Predictive Analytics', icon: Brain },
              { id: 'quality', label: 'Quality Metrics', icon: Award },
              { id: 'financial', label: 'Financial Analytics', icon: DollarSign },
              { id: 'operational', label: 'Operations', icon: Clock },
              { id: 'realtime', label: 'Real-time', icon: Zap }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Overview Tab */}
        {activeTab === 'overview' && businessMetrics && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(businessMetrics.overview.total_revenue)}
                subtitle="This period"
                icon={DollarSign}
                trend={businessMetrics.overview.revenue_growth}
                color="green"
              />
              <MetricCard
                title="Active Clients"
                value={businessMetrics.overview.active_clients}
                subtitle={`${businessMetrics.overview.client_retention}% retention`}
                icon={Users}
                trend={5.2}
                color="blue"
              />
              <MetricCard
                title="Total Hours"
                value={businessMetrics.overview.total_hours.toLocaleString()}
                subtitle={`Avg: ${businessMetrics.overview.avg_hourly_rate}/hr`}
                icon={Clock}
                trend={8.1}
                color="purple"
              />
              <MetricCard
                title="Satisfaction Score"
                value={`${businessMetrics.overview.satisfaction_score}/5`}
                subtitle="Client satisfaction"
                icon={Award}
                trend={2.3}
                color="yellow"
              />
            </div>

            {/* Revenue Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartCard title="Monthly Revenue Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={businessMetrics.revenue.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="target" stroke="#10B981" fill="transparent" strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Revenue by Service Type">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={businessMetrics.revenue.byService}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {businessMetrics.revenue.byService.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Operational Metrics */}
            <ChartCard title="Operational Performance">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Utilization Rate', value: businessMetrics.operational.utilizationRate, suffix: '%', target: 85 },
                  { label: 'Avg Session Length', value: businessMetrics.operational.avgSessionLength, suffix: 'hrs', target: 4 },
                  { label: 'Client Satisfaction', value: businessMetrics.operational.clientSatisfaction, suffix: '/5', target: 4.5 },
                  { label: 'Caregiver Retention', value: businessMetrics.operational.caregiverRetention, suffix: '%', target: 90 },
                  { label: 'Missed Appointments', value: businessMetrics.operational.missedAppointments, suffix: '%', target: 5 },
                  { label: 'Emergency Callouts', value: businessMetrics.operational.emergencyCallouts, suffix: '', target: 15 }
                ].map((metric, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}{metric.suffix}</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${metric.value >= metric.target ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Target: {metric.target}{metric.suffix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        )}

        {/* Predictive Analytics Tab */}
        {activeTab === 'predictive' && predictiveInsights && (
          <div className="space-y-8">
            {/* Revenue Forecasting */}
            <ChartCard title="Revenue Forecasting">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Next Month</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(predictiveInsights.revenueForecasting.nextMonth.predicted)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {predictiveInsights.revenueForecasting.nextMonth.confidence}% confidence
                  </p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Next Quarter</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(predictiveInsights.revenueForecasting.nextQuarter.predicted)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {predictiveInsights.revenueForecasting.nextQuarter.confidence}% confidence
                  </p>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Next Year</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(predictiveInsights.revenueForecasting.nextYear.predicted)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {predictiveInsights.revenueForecasting.nextYear.confidence}% confidence
                  </p>
                </div>
              </div>
            </ChartCard>

            {/* Client Churn Prediction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartCard title="High-Risk Clients">
                <div className="space-y-4">
                  {predictiveInsights.clientChurnPrediction.highRisk.map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <h4 className="font-semibold text-gray-900">{client.name}</h4>
                        <p className="text-sm text-gray-600">Risk Score: {(client.riskScore * 100).toFixed(0)}%</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {client.factors.map((factor, idx) => (
                            <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                  ))}
                </div>
              </ChartCard>

              <ChartCard title="Caregiver Workload Analysis">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Overutilized (Burnout Risk)</h4>
                    {predictiveInsights.caregiverWorkload.overutilized.map((caregiver, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{caregiver.name}</p>
                          <p className="text-sm text-gray-600">Utilization: {formatPercentage(caregiver.utilizationRate * 100)}</p>
                        </div>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          {caregiver.burnoutRisk} Risk
                        </span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Underutilized (Growth Potential)</h4>
                    {predictiveInsights.caregiverWorkload.underutilized.map((caregiver, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{caregiver.name}</p>
                          <p className="text-sm text-gray-600">Utilization: {formatPercentage(caregiver.utilizationRate * 100)}</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {caregiver.potential}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Market Trends */}
            <ChartCard title="Market Demand Forecast">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(predictiveInsights.marketTrends.demandForecast).map(([service, data], index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">{service.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.growth)}</p>
                    <p className="text-sm text-gray-600 capitalize">{data.trend}</p>
                    <div className="mt-2">
                      {data.trend === 'increasing' && (
                        <TrendingUp className="w-5 h-5 text-green-500 mx-auto" />
                      )}
                      {data.trend === 'stable' && (
                        <div className="w-5 h-1 bg-yellow-500 mx-auto rounded"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        )}

        {/* Additional tabs will be implemented in the next step... */}
        {activeTab !== 'overview' && activeTab !== 'predictive' && (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Analytics
            </h3>
            <p className="text-gray-600">This section is being implemented...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
