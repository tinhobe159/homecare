import React, { useState, useEffect } from 'react';
import { payrollAPI, timeCalculationUtils } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PayrollDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [payPeriods, setPayPeriods] = useState([]);
  const [timeSheets, setTimeSheets] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payrollSummary, setPayrollSummary] = useState(null);

  useEffect(() => {
    loadPayrollData();
  }, []);

  const loadPayrollData = async () => {
    try {
      setLoading(true);
      const [periodsRes, timeSheetsRes, disputesRes] = await Promise.all([
        payrollAPI.getPayPeriods(),
        payrollAPI.getTimeSheets(),
        payrollAPI.getDisputes()
      ]);

      setPayPeriods(periodsRes.data);
      setTimeSheets(timeSheetsRes.data);
      setDisputes(disputesRes.data);

      // Set current pay period
      const currentPeriod = periodsRes.data.find(p => p.status === 'active') || periodsRes.data[0];
      setSelectedPayPeriod(currentPeriod);

      // Calculate payroll summary
      calculatePayrollSummary(timeSheetsRes.data, currentPeriod);

    } catch (err) {
      setError('Failed to load payroll data');
      console.error('Payroll data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePayrollSummary = (allTimeSheets, payPeriod) => {
    if (!payPeriod) return;

    const periodTimeSheets = allTimeSheets.filter(ts => ts.pay_period_id === payPeriod.id);
    
    const summary = {
      totalCaregivers: periodTimeSheets.length,
      totalHours: periodTimeSheets.reduce((sum, ts) => sum + (ts.total_hours || 0), 0),
      totalGrossPay: periodTimeSheets.reduce((sum, ts) => sum + (ts.gross_pay || 0), 0),
      totalNetPay: periodTimeSheets.reduce((sum, ts) => sum + (ts.net_pay || 0), 0),
      totalDeductions: periodTimeSheets.reduce((sum, ts) => sum + (ts.deductions?.total || 0), 0),
      overtimeHours: periodTimeSheets.reduce((sum, ts) => sum + (ts.overtime_hours || 0), 0),
      pendingApprovals: periodTimeSheets.filter(ts => ts.status === 'calculated').length,
      averageHours: periodTimeSheets.length > 0 ? 
        periodTimeSheets.reduce((sum, ts) => sum + (ts.total_hours || 0), 0) / periodTimeSheets.length : 0
    };

    setPayrollSummary(summary);
  };

  const handlePayPeriodChange = (payPeriod) => {
    setSelectedPayPeriod(payPeriod);
    const periodTimeSheets = timeSheets.filter(ts => ts.pay_period_id === payPeriod.id);
    calculatePayrollSummary(timeSheets, payPeriod);
  };

  const handleApproveTimeSheet = async (time_sheet_id) => {
    try {
      await payrollAPI.approveTimeSheet(time_sheet_id);
      
      // Update local state
      setTimeSheets(prev => prev.map(ts => 
        ts.id === time_sheet_id 
          ? { ...ts, status: 'approved', approved_at: new Date().toISOString() }
          : ts
      ));
      
      // Recalculate summary
      calculatePayrollSummary(timeSheets, selectedPayPeriod);
    } catch (err) {
      setError('Failed to approve timesheet');
    }
  };

  const handleClosePayPeriod = async (pay_period_id) => {
    try {
      await payrollAPI.closePayPeriod(pay_period_id);
      
      setPayPeriods(prev => prev.map(pp => 
        pp.id === pay_period_id 
          ? { ...pp, status: 'closed' }
          : pp
      ));
    } catch (err) {
      setError('Failed to close pay period');
    }
  };

  const generatePayrollReport = async () => {
    try {
      if (selectedPayPeriod) {
        await payrollAPI.generatePayrollReport(selectedPayPeriod.id);
        // Handle report generation success
      }
    } catch (err) {
      setError('Failed to generate payroll report');
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="mx-auto mt-8" />;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
        <p className="text-gray-600 mt-1">Manage timesheets, pay periods, and payroll processing</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Pay Period Selector */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Pay Period
        </label>
        <select
          value={selectedPayPeriod?.id || ''}
          onChange={(e) => {
            const period = payPeriods.find(p => p.id === e.target.value);
            handlePayPeriodChange(period);
          }}
          className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {payPeriods.map(period => (
            <option key={period.id} value={period.id}>
              {period.name} ({period.startDate} to {period.endDate}) - {period.status}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'timesheets', name: 'Timesheets' },
            { id: 'disputes', name: 'Disputes' },
            { id: 'reports', name: 'Reports' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && payrollSummary && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Total Caregivers</h3>
              <p className="text-3xl font-bold text-blue-600">{payrollSummary.totalCaregivers}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Total Hours</h3>
              <p className="text-3xl font-bold text-green-600">
                {timeCalculationUtils.formatHours(payrollSummary.totalHours)}
              </p>
              <p className="text-sm text-gray-500">
                Avg: {timeCalculationUtils.formatHours(payrollSummary.averageHours)} hrs/caregiver
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Gross Pay</h3>
              <p className="text-3xl font-bold text-purple-600">
                {timeCalculationUtils.formatCurrency(payrollSummary.totalGrossPay)}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Net Pay</h3>
              <p className="text-3xl font-bold text-indigo-600">
                {timeCalculationUtils.formatCurrency(payrollSummary.totalNetPay)}
              </p>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Overtime Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Overtime Hours:</span>
                  <span className="font-medium">{timeCalculationUtils.formatHours(payrollSummary.overtimeHours)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime Rate:</span>
                  <span className="font-medium">1.5x Regular Rate</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Approvals Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Pending Approvals:</span>
                  <span className="font-medium text-yellow-600">{payrollSummary.pendingApprovals}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Deductions:</span>
                  <span className="font-medium">{timeCalculationUtils.formatCurrency(payrollSummary.totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payroll Actions</h3>
            <div className="flex space-x-4">
              <button
                onClick={generatePayrollReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Generate Report
              </button>
              
              {selectedPayPeriod?.status === 'pending_approval' && (
                <button
                  onClick={() => handleClosePayPeriod(selectedPayPeriod.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Close Pay Period
                </button>
              )}
              
              <button
                onClick={() => payrollAPI.exportPayroll(selectedPayPeriod?.id)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Export to CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timesheets Tab */}
      {activeTab === 'timesheets' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Timesheets for {selectedPayPeriod?.name}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caregiver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Regular Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overtime Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
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
                {timeSheets
                  .filter(ts => ts.pay_period_id === selectedPayPeriod?.id)
                  .map(timeSheet => (
                    <tr key={timeSheet.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Caregiver #{timeSheet.caregiver_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timeCalculationUtils.formatHours(timeSheet.regular_hours)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timeCalculationUtils.formatHours(timeSheet.overtime_hours)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timeCalculationUtils.formatCurrency(timeSheet.gross_pay)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timeCalculationUtils.formatCurrency(timeSheet.net_pay)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          timeSheet.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : timeSheet.status === 'calculated'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {timeSheet.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {timeSheet.status === 'calculated' && (
                          <button
                            onClick={() => handleApproveTimeSheet(timeSheet.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disputes Tab */}
      {activeTab === 'disputes' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Time Disputes</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {disputes.map(dispute => (
              <div key={dispute.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">
                      {dispute.dispute_type.replace('_', ' ').toUpperCase()}
                    </h4>
                    <p className="text-gray-600 mt-1">{dispute.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Submitted: {new Date(dispute.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    dispute.status === 'resolved' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {dispute.status}
                  </span>
                </div>
                
                {dispute.status === 'pending' && (
                  <div className="mt-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2">
                      Review Dispute
                    </button>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                      View Details
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 text-left">
                <h4 className="font-medium">Payroll Summary Report</h4>
                <p className="text-sm text-gray-600">Complete payroll summary for selected period</p>
              </button>
              
              <button className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 text-left">
                <h4 className="font-medium">Time & Attendance Report</h4>
                <p className="text-sm text-gray-600">Detailed time tracking and attendance data</p>
              </button>
              
              <button className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 text-left">
                <h4 className="font-medium">Overtime Analysis</h4>
                <p className="text-sm text-gray-600">Overtime trends and cost analysis</p>
              </button>
              
              <button className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 text-left">
                <h4 className="font-medium">Compliance Report</h4>
                <p className="text-sm text-gray-600">EVV compliance and audit documentation</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollDashboard;
