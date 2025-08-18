import React, { useState, useEffect } from 'react';
import { insuranceAPI, billingAPI, complianceAPI, revenueUtils, billingAutomationUtils } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  DollarSign, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Download,
  Plus,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

const InsuranceBillingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data state
  const [claims, setClaims] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [complianceDocuments, setComplianceDocuments] = useState([]);
  
  // Filters
  const [claimFilter, setClaimFilter] = useState('all');
  const [invoiceFilter, setInvoiceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [claimsRes, invoicesRes, providersRes, complianceRes] = await Promise.all([
        insuranceAPI.getClaims(),
        billingAPI.getInvoices(),
        insuranceAPI.getProviders(),
        complianceAPI.getDocuments()
      ]);

      setClaims(claimsRes.data);
      setInvoices(invoicesRes.data);
      setProviders(providersRes.data);
      setComplianceDocuments(complianceRes.data);
    } catch (err) {
      setError('Failed to load insurance and billing data');
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateClaimFromEVV = async (evvRecordId) => {
    try {
      const claimData = await billingAutomationUtils.generateClaimFromEVV({ 
        id: evvRecordId,
        customerId: 3, // Example
        service_date: '2025-08-18',
        appointmentId: 1,
        caregiverId: 11,
        checkInTime: '2025-08-18T09:00:00Z',
        checkOutTime: '2025-08-18T11:00:00Z'
      });
      
      await insuranceAPI.createClaim(claimData);
      await loadData();
    } catch (err) {
      setError('Failed to generate claim from EVV record');
    }
  };

  const generateInvoiceFromEVV = async (evvRecordId) => {
    try {
      const invoiceData = await billingAutomationUtils.generateInvoiceFromEVV({
        id: evvRecordId,
        customerId: 3,
        service_date: '2025-08-18',
        appointmentId: 1,
        checkInTime: '2025-08-18T09:00:00Z',
        checkOutTime: '2025-08-18T11:00:00Z'
      });
      
      await billingAPI.createInvoice(invoiceData);
      await loadData();
    } catch (err) {
      setError('Failed to generate invoice from EVV record');
    }
  };

  const submitClaim = async (claimId) => {
    try {
      await insuranceAPI.submitClaim(claimId);
      await loadData();
    } catch (err) {
      setError('Failed to submit claim');
    }
  };

  const markInvoiceAsPaid = async (invoiceId) => {
    try {
      await billingAPI.markAsPaid(invoiceId, { method: 'check' });
      await loadData();
    } catch (err) {
      setError('Failed to mark invoice as paid');
    }
  };

  // Calculate metrics
  const metrics = {
    totalRevenue: revenueUtils.calculateTotalRevenue(invoices),
    totalClaimed: claims.reduce((sum, claim) => sum + claim.amount_claimed, 0),
    totalApproved: claims.reduce((sum, claim) => sum + (claim.amount_approved || 0), 0),
    denialRate: revenueUtils.calculateDenialRate(claims),
    reimbursementRate: revenueUtils.calculateReimbursementRate(claims),
    avgProcessingTime: revenueUtils.calculateAverageProcessingTime(claims),
    pendingClaims: claims.filter(c => c.status === 'submitted').length,
    overdueInvoices: invoices.filter(i => i.status === 'overdue').length
  };

  // Filter data
  const filteredClaims = claims.filter(claim => {
    if (claimFilter !== 'all' && claim.status !== claimFilter) return false;
    if (searchTerm && !claim.id.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !claim.insurance_provider.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const filteredInvoices = invoices.filter(invoice => {
    if (invoiceFilter !== 'all' && invoice.status !== invoiceFilter) return false;
    if (searchTerm && !invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) return <LoadingSpinner size="lg" className="mx-auto mt-8" />;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Insurance & Billing Management</h1>
        <p className="text-gray-600 mt-1">Manage insurance claims, billing, and compliance documentation</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'claims', label: 'Insurance Claims', icon: FileText },
            { id: 'billing', label: 'Billing & Invoices', icon: DollarSign },
            { id: 'compliance', label: 'Compliance', icon: CheckCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {revenueUtils.formatMetric(metrics.totalRevenue, 'currency')}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Claims Submitted</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {revenueUtils.formatMetric(metrics.totalClaimed, 'currency')}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Claims</p>
                  <p className="text-2xl font-bold text-yellow-600">{metrics.pendingClaims}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Invoices</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.overdueInvoices}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reimbursement Rate</span>
                  <span className="font-semibold text-green-600">
                    {revenueUtils.formatMetric(metrics.reimbursementRate, 'percentage')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Denial Rate</span>
                  <span className="font-semibold text-red-600">
                    {revenueUtils.formatMetric(metrics.denialRate, 'percentage')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Processing Time</span>
                  <span className="font-semibold text-blue-600">
                    {revenueUtils.formatMetric(metrics.avgProcessingTime, 'days')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => generateClaimFromEVV('evv_sample')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Claim from EVV
                </button>
                <button
                  onClick={() => generateInvoiceFromEVV('evv_sample')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Invoice from EVV
                </button>
                <button
                  onClick={loadData}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div className="space-y-6">
          {/* Claims Filters */}
          <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={claimFilter}
                onChange={(e) => setClaimFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Claims</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="partial_approved">Partially Approved</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              />
            </div>
          </div>

          {/* Claims List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Insurance Claims</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Claim ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClaims.map(claim => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {claim.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {claim.insurance_provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(claim.service_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {revenueUtils.formatMetric(claim.amount_claimed, 'currency')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          claim.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : claim.status === 'denied'
                            ? 'bg-red-100 text-red-800'
                            : claim.status === 'submitted'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {claim.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {claim.status === 'draft' && (
                          <button
                            onClick={() => submitClaim(claim.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Submit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Invoice Filters */}
          <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={invoiceFilter}
                onChange={(e) => setInvoiceFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Invoices</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Invoices List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.issued_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {revenueUtils.formatMetric(invoice.total_amount, 'currency')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.status === 'pending' && (
                          <button
                            onClick={() => markInvoiceAsPaid(invoice.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Compliance Documents</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {complianceDocuments.map(doc => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{doc.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        doc.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : doc.status === 'expiring_soon'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doc.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        Expires: {new Date(doc.expirationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceBillingDashboard;
