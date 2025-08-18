import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Calendar, Filter, Eye, Settings, Database, BarChart, PieChart, LineChart, Save, Share, Trash2 } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

const CustomReportBuilder = () => {
  const [reports, setReports] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [reportConfig, setReportConfig] = useState({
    title: '',
    description: '',
    dateRange: '30d',
    dataSource: 'all',
    metrics: [],
    filters: [],
    chartTypes: [],
    schedule: 'manual'
  });

  const availableMetrics = [
    { id: 'revenue', label: 'Revenue', category: 'Financial' },
    { id: 'appointments', label: 'Appointments', category: 'Operations' },
    { id: 'client_satisfaction', label: 'Client Satisfaction', category: 'Quality' },
    { id: 'caregiver_hours', label: 'Caregiver Hours', category: 'Operations' },
    { id: 'billing_rate', label: 'Billing Rate', category: 'Financial' },
    { id: 'client_retention', label: 'Client Retention', category: 'Quality' },
    { id: 'medication_adherence', label: 'Medication Adherence', category: 'Clinical' },
    { id: 'safety_incidents', label: 'Safety Incidents', category: 'Quality' },
    { id: 'cost_per_hour', label: 'Cost per Hour', category: 'Financial' },
    { id: 'utilization_rate', label: 'Utilization Rate', category: 'Operations' }
  ];

  const availableFilters = [
    { id: 'date_range', label: 'Date Range', type: 'daterange' },
    { id: 'service_type', label: 'Service Type', type: 'select', options: ['Personal Care', 'Skilled Nursing', 'Companion Care', 'Respite Care'] },
    { id: 'caregiver', label: 'Caregiver', type: 'multiselect' },
    { id: 'client_location', label: 'Client Location', type: 'select', options: ['North Region', 'South Region', 'East Region', 'West Region'] },
    { id: 'insurance_type', label: 'Insurance Type', type: 'select', options: ['Medicare', 'Medicaid', 'Private', 'Self-Pay'] },
    { id: 'client_age_group', label: 'Client Age Group', type: 'select', options: ['Under 65', '65-80', '80-90', 'Over 90'] }
  ];

  const chartTypes = [
    { id: 'bar', label: 'Bar Chart', icon: BarChart },
    { id: 'line', label: 'Line Chart', icon: LineChart },
    { id: 'pie', label: 'Pie Chart', icon: PieChart },
    { id: 'table', label: 'Data Table', icon: Database }
  ];

  const mockReports = [
    {
      id: 'report_001',
      title: 'Monthly Revenue Analysis',
      description: 'Comprehensive revenue breakdown by service type and region',
      lastGenerated: '2025-08-17T14:30:00Z',
      schedule: 'monthly',
      status: 'active'
    },
    {
      id: 'report_002',
      title: 'Caregiver Performance Report',
      description: 'Performance metrics and client satisfaction by caregiver',
      lastGenerated: '2025-08-16T09:15:00Z',
      schedule: 'weekly',
      status: 'active'
    },
    {
      id: 'report_003',
      title: 'Quality Metrics Dashboard',
      description: 'Safety incidents, medication adherence, and outcome metrics',
      lastGenerated: '2025-08-15T16:45:00Z',
      schedule: 'daily',
      status: 'active'
    }
  ];

  useEffect(() => {
    setReports(mockReports);
  }, []);

  const handleMetricToggle = (metricId) => {
    setReportConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(id => id !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const handleFilterAdd = (filterId) => {
    if (!reportConfig.filters.find(f => f.id === filterId)) {
      const filterTemplate = availableFilters.find(f => f.id === filterId);
      setReportConfig(prev => ({
        ...prev,
        filters: [...prev.filters, { ...filterTemplate, value: '' }]
      }));
    }
  };

  const handleFilterRemove = (filterId) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId)
    }));
  };

  const handleFilterValueChange = (filterId, value) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.map(f => 
        f.id === filterId ? { ...f, value } : f
      )
    }));
  };

  const handleChartTypeToggle = (chartId) => {
    setReportConfig(prev => ({
      ...prev,
      chartTypes: prev.chartTypes.includes(chartId)
        ? prev.chartTypes.filter(id => id !== chartId)
        : [...prev.chartTypes, chartId]
    }));
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const report = await analyticsAPI.generateCustomReport(reportConfig);
      setCurrentReport(report.data);
      
      // Add to reports list if saving
      if (reportConfig.title) {
        const newReport = {
          id: `report_${Date.now()}`,
          title: reportConfig.title,
          description: reportConfig.description,
          lastGenerated: new Date().toISOString(),
          schedule: reportConfig.schedule,
          status: 'active'
        };
        setReports(prev => [newReport, ...prev]);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetBuilder = () => {
    setReportConfig({
      title: '',
      description: '',
      dateRange: '30d',
      dataSource: 'all',
      metrics: [],
      filters: [],
      chartTypes: [],
      schedule: 'manual'
    });
    setCurrentReport(null);
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Custom Report Builder</h1>
              <p className="text-gray-600">Create and manage custom analytics reports</p>
            </div>
            <button
              onClick={() => setShowBuilder(!showBuilder)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showBuilder ? (
          /* Report Builder Interface */
          <div className="space-y-8">
            {/* Report Configuration */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Report Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Title</label>
                  <input
                    type="text"
                    value={reportConfig.title}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter report title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={reportConfig.dateRange}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                    <option value="custom">Custom range</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={reportConfig.description}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the report"
                />
              </div>
            </div>

            {/* Metrics Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableMetrics.map((metric) => (
                  <label key={metric.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportConfig.metrics.includes(metric.id)}
                      onChange={() => handleMetricToggle(metric.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{metric.label}</p>
                      <p className="text-xs text-gray-500">{metric.category}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <select
                  onChange={(e) => e.target.value && handleFilterAdd(e.target.value)}
                  value=""
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Add Filter</option>
                  {availableFilters
                    .filter(filter => !reportConfig.filters.find(f => f.id === filter.id))
                    .map((filter) => (
                      <option key={filter.id} value={filter.id}>{filter.label}</option>
                    ))}
                </select>
              </div>

              <div className="space-y-4">
                {reportConfig.filters.map((filter) => (
                  <div key={filter.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {filter.label}
                      </label>
                      {filter.type === 'select' ? (
                        <select
                          value={filter.value}
                          onChange={(e) => handleFilterValueChange(filter.id, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select...</option>
                          {filter.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : filter.type === 'daterange' ? (
                        <input
                          type="date"
                          value={filter.value}
                          onChange={(e) => handleFilterValueChange(filter.id, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={filter.value}
                          onChange={(e) => handleFilterValueChange(filter.id, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Enter ${filter.label.toLowerCase()}`}
                        />
                      )}
                    </div>
                    <button
                      onClick={() => handleFilterRemove(filter.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Types */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualization Types</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {chartTypes.map((chart) => {
                  const Icon = chart.icon;
                  return (
                    <label
                      key={chart.id}
                      className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        reportConfig.chartTypes.includes(chart.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={reportConfig.chartTypes.includes(chart.id)}
                        onChange={() => handleChartTypeToggle(chart.id)}
                        className="sr-only"
                      />
                      <Icon className={`w-8 h-8 mb-2 ${reportConfig.chartTypes.includes(chart.id) ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${reportConfig.chartTypes.includes(chart.id) ? 'text-blue-600' : 'text-gray-700'}`}>
                        {chart.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Schedule</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'manual', label: 'Manual' },
                  { id: 'daily', label: 'Daily' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' }
                ].map((schedule) => (
                  <label key={schedule.id} className="flex items-center">
                    <input
                      type="radio"
                      name="schedule"
                      value={schedule.id}
                      checked={reportConfig.schedule === schedule.id}
                      onChange={(e) => setReportConfig(prev => ({ ...prev, schedule: e.target.value }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">{schedule.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleResetBuilder}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowBuilder(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={loading || reportConfig.metrics.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Generate Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Report Preview */}
            {currentReport && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Report Preview</h3>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                      <Share className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-2">{currentReport.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">Generated: {new Date(currentReport.generatedAt).toLocaleString()}</p>
                  <p className="text-gray-700">Report contains {currentReport.data.charts.length} charts and {currentReport.data.tables.length} data tables.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Existing Reports List */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{report.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Last generated: {formatTimeAgo(report.lastGenerated)}</span>
                        <span className="capitalize">Schedule: {report.schedule}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomReportBuilder;
