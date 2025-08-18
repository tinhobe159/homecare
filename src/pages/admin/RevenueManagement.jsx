import React, { useState, useEffect } from 'react';
import { billingAPI, insuranceAPI, revenueUtils } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart,
  Calendar,
  Download
} from 'lucide-react';

const RevenueManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  
  // Data state
  const [invoices, setInvoices] = useState([]);
  const [claims, setClaims] = useState([]);
  const [revenueData, setRevenueData] = useState({});

  useEffect(() => {
    loadRevenueData();
  }, [dateRange]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const [invoicesRes, claimsRes] = await Promise.all([
        billingAPI.getInvoices(),
        insuranceAPI.getClaims()
      ]);

      const filteredInvoices = invoicesRes.data.filter(invoice => {
        const invoiceDate = new Date(invoice.service_date);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });

      const filteredClaims = claimsRes.data.filter(claim => {
        const claimDate = new Date(claim.service_date);
        return claimDate >= startDate && claimDate <= endDate;
      });

      setInvoices(filteredInvoices);
      setClaims(filteredClaims);
      
      // Calculate revenue metrics
      const revenue = calculateRevenueMetrics(filteredInvoices, filteredClaims);
      setRevenueData(revenue);

    } catch (err) {
      setError('Failed to load revenue data');
      console.error('Revenue data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenueMetrics = (invoices, claims) => {
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalCollected = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const totalPending = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount_due, 0);
    const totalOverdue = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount_due, 0);

    const insuranceBilled = claims.reduce((sum, claim) => sum + claim.totalAmount, 0);
    const insuranceReceived = claims
      .filter(claim => claim.status === 'approved')
      .reduce((sum, claim) => sum + (claim.approvedAmount || 0), 0);

    const collectionsRate = revenueUtils.calculateCollectionsRate(totalBilled, totalCollected);
    const denialRate = revenueUtils.calculateDenialRate(claims);
    const reimbursementRate = revenueUtils.calculateReimbursementRate(claims);

    // Revenue by service type
    const revenueByService = invoices.reduce((acc, invoice) => {
      invoice.services.forEach(service => {
        const serviceType = service.serviceCode === 'SELF_PAY' ? 'Self-Pay' : 
                           service.serviceCode === 'T1019' ? 'Personal Care' :
                           service.serviceCode === 'T1020' ? 'Skilled Care' :
                           service.serviceCode === 'S5125' ? 'Attendant Care' : 'Other';
        acc[serviceType] = (acc[serviceType] || 0) + service.amount;
      });
      return acc;
    }, {});

    // Revenue by payment method
    const revenueByPayment = invoices.reduce((acc, invoice) => {
      const method = invoice.insuranceCoverage > 0 ? 'Insurance' : 'Self-Pay';
      acc[method] = (acc[method] || 0) + invoice.total;
      return acc;
    }, {});

    return {
      totalBilled,
      totalCollected,
      totalPending,
      totalOverdue,
      insuranceBilled,
      insuranceReceived,
      collectionsRate,
      denialRate,
      reimbursementRate,
      revenueByService,
      revenueByPayment,
      netRevenue: totalCollected + insuranceReceived
    };
  };

  const exportReport = () => {
    // In a real app, this would generate and download a report
    const reportData = {
      dateRange,
      metrics: revenueData,
      invoices: invoices.length,
      claims: claims.length,
      generatedAt: new Date().toISOString()
    };
    
    console.log('Revenue Report:', reportData);
    alert('Revenue report generated (check console for demo data)');
  };

  if (loading) return <LoadingSpinner size="lg" className="mx-auto mt-8" />;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Management</h1>
          <p className="text-gray-600 mt-1">Financial analytics and revenue tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last 12 Months</option>
          </select>
          <button
            onClick={exportReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {revenueUtils.formatMetric(revenueData.netRevenue, 'currency')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Collected + Insurance
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collections Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {revenueUtils.formatMetric(revenueData.collectionsRate, 'percentage')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Of total billed
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Revenue</p>
              <p className="text-2xl font-bold text-yellow-600">
                {revenueUtils.formatMetric(revenueData.totalPending, 'currency')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Outstanding invoices
              </p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-600">
                {revenueUtils.formatMetric(revenueData.totalOverdue, 'currency')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Requires follow-up
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue by Service Type */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Revenue by Service Type
          </h3>
          <div className="space-y-4">
            {Object.entries(revenueData.revenueByService || {}).map(([service, amount]) => {
              const percentage = (amount / revenueData.totalBilled) * 100;
              return (
                <div key={service} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{service}</span>
                      <span className="text-sm text-gray-500">
                        {revenueUtils.formatMetric(amount, 'currency')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insurance Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Insurance Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Claims Submitted</span>
              <span className="font-semibold">
                {revenueUtils.formatMetric(revenueData.insuranceBilled, 'currency')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Received</span>
              <span className="font-semibold text-green-600">
                {revenueUtils.formatMetric(revenueData.insuranceReceived, 'currency')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Reimbursement Rate</span>
              <span className="font-semibold text-blue-600">
                {revenueUtils.formatMetric(revenueData.reimbursementRate, 'percentage')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Denial Rate</span>
              <span className="font-semibold text-red-600">
                {revenueUtils.formatMetric(revenueData.denialRate, 'percentage')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {revenueUtils.formatMetric(revenueData.totalBilled, 'currency')}
            </p>
            <p className="text-sm text-gray-600">Total Billed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {revenueUtils.formatMetric(revenueData.totalCollected, 'currency')}
            </p>
            <p className="text-sm text-gray-600">Collected (Direct Pay)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {revenueUtils.formatMetric(revenueData.insuranceReceived, 'currency')}
            </p>
            <p className="text-sm text-gray-600">Insurance Received</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueManagement;
