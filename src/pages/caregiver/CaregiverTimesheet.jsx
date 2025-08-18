import React, { useState, useEffect } from 'react';
import { payrollAPI, timeCalculationUtils } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CaregiverTimesheet = ({ caregiverId = 11 }) => { // Default for demo
  const [timeSheets, setTimeSheets] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [selectedTimeSheet, setSelectedTimeSheet] = useState(null);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    dispute_type: '',
    description: '',
    requestedAdjustment: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCaregiverData();
  }, [caregiverId]);

  const loadCaregiverData = async () => {
    try {
      setLoading(true);
      const [timeSheetsRes, disputesRes] = await Promise.all([
        payrollAPI.getTimeSheets(),
        payrollAPI.getDisputes()
      ]);

      // Filter for current caregiver
      const caregiverTimeSheets = timeSheetsRes.data.filter(ts => ts.caregiver_id === caregiverId);
      const caregiverDisputes = disputesRes.data.filter(d => d.caregiver_id === caregiverId);

      setTimeSheets(caregiverTimeSheets);
      setDisputes(caregiverDisputes);

      // Set most recent timesheet as selected
      if (caregiverTimeSheets.length > 0) {
        setSelectedTimeSheet(caregiverTimeSheets[0]);
      }

    } catch (err) {
      setError('Failed to load timesheet data');
      console.error('Timesheet data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDispute = async (e) => {
    e.preventDefault();
    
    try {
      const disputeData = {
        time_sheet_id: selectedTimeSheet.id,
        caregiverId: caregiverId,
        dispute_type: disputeForm.dispute_type,
        description: disputeForm.description,
        requestedAdjustment: disputeForm.requestedAdjustment,
        original_hours: selectedTimeSheet.total_hours,
        requested_hours: selectedTimeSheet.total_hours, // This would be calculated based on dispute type
        status: 'pending',
        submitted_at: new Date().toISOString(),
        supportingDocuments: [],
        created_at: new Date().toISOString(),
        deleted_at: null
      };

      await payrollAPI.createDispute(disputeData);
      
      // Add to local state
      setDisputes(prev => [...prev, disputeData]);
      
      // Reset form
      setDisputeForm({
        dispute_type: '',
        description: '',
        requestedAdjustment: ''
      });
      setShowDisputeForm(false);
      
    } catch (err) {
      setError('Failed to submit dispute');
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="mx-auto mt-8" />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Timesheet</h1>
        <p className="text-gray-600 mt-1">View your work hours and submit time disputes</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timesheet List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pay Periods</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {timeSheets.map(timeSheet => (
                <button
                  key={timeSheet.id}
                  onClick={() => setSelectedTimeSheet(timeSheet)}
                  className={`w-full text-left p-4 hover:bg-gray-50 ${
                    selectedTimeSheet?.id === timeSheet.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        Pay Period {timeSheet.pay_period_id.split('_')[1]}
                      </p>
                      <p className="text-sm text-gray-600">
                        {timeCalculationUtils.formatHours(timeSheet.total_hours)} hours
                      </p>
                      <p className="text-sm text-gray-500">
                        {timeCalculationUtils.formatCurrency(timeSheet.gross_pay)}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      timeSheet.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : timeSheet.status === 'calculated'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {timeSheet.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timesheet Details */}
        <div className="lg:col-span-2">
          {selectedTimeSheet ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900">Total Hours</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {timeCalculationUtils.formatHours(selectedTimeSheet.total_hours)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Regular: {timeCalculationUtils.formatHours(selectedTimeSheet.regular_hours)} | 
                    Overtime: {timeCalculationUtils.formatHours(selectedTimeSheet.overtime_hours)}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900">Gross Pay</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {timeCalculationUtils.formatCurrency(selectedTimeSheet.gross_pay)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Rate: {timeCalculationUtils.formatCurrency(selectedTimeSheet.hourly_rate)}/hr
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900">Net Pay</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {timeCalculationUtils.formatCurrency(selectedTimeSheet.net_pay)}
                  </p>
                  <p className="text-sm text-gray-500">
                    After deductions
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Pay Details</h3>
                    <button
                      onClick={() => setShowDisputeForm(true)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-sm"
                    >
                      Report Issue
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hours Breakdown */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Hours Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Regular Hours:</span>
                          <span>{timeCalculationUtils.formatHours(selectedTimeSheet.regular_hours)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overtime Hours:</span>
                          <span>{timeCalculationUtils.formatHours(selectedTimeSheet.overtime_hours)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-2">
                          <span>Total Hours:</span>
                          <span>{timeCalculationUtils.formatHours(selectedTimeSheet.total_hours)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pay Breakdown */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Pay Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Regular Pay:</span>
                          <span>
                            {timeCalculationUtils.formatCurrency(
                              selectedTimeSheet.regular_hours * selectedTimeSheet.hourly_rate
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overtime Pay:</span>
                          <span>
                            {timeCalculationUtils.formatCurrency(
                              selectedTimeSheet.overtime_hours * selectedTimeSheet.overtime_rate
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-2">
                          <span>Gross Pay:</span>
                          <span>{timeCalculationUtils.formatCurrency(selectedTimeSheet.gross_pay)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Deductions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Federal Tax</p>
                        <p className="font-medium">{timeCalculationUtils.formatCurrency(selectedTimeSheet.deductions.federal_tax)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">State Tax</p>
                        <p className="font-medium">{timeCalculationUtils.formatCurrency(selectedTimeSheet.deductions.state_tax)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Social Security</p>
                        <p className="font-medium">{timeCalculationUtils.formatCurrency(selectedTimeSheet.deductions.social_security)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Medicare</p>
                        <p className="font-medium">{timeCalculationUtils.formatCurrency(selectedTimeSheet.deductions.medicare)}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded flex justify-between font-medium">
                      <span>Total Deductions:</span>
                      <span>{timeCalculationUtils.formatCurrency(selectedTimeSheet.deductions.total)}</span>
                    </div>
                  </div>

                  {/* Manual Adjustments */}
                  {selectedTimeSheet?.manual_adjustments && selectedTimeSheet.manual_adjustments.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Adjustments</h4>
                      <div className="space-y-2">
                        {selectedTimeSheet.manual_adjustments.map(adjustment => (
                          <div key={adjustment.id} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                            <div>
                              <p className="font-medium">{adjustment.description}</p>
                              <p className="text-sm text-gray-600">Type: {adjustment.type}</p>
                            </div>
                            <span className={`font-medium ${
                              adjustment.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {adjustment.amount > 0 ? '+' : ''}{timeCalculationUtils.formatCurrency(adjustment.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* EVV Records Reference */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Related EVV Records</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-3">
                    This timesheet is calculated from {selectedTimeSheet?.evv_records?.length || 0} EVV records.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedTimeSheet?.evv_records || []).map(recordId => (
                      <span key={recordId} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        EVV #{recordId.split('_')[1]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">Select a pay period to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Time Disputes */}
      {disputes.length > 0 && (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">My Time Disputes</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {disputes.map(dispute => (
                <div key={dispute.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {dispute.dispute_type.replace('_', ' ').toUpperCase()}
                      </h4>
                      <p className="text-gray-600 mt-1">{dispute.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Submitted: {new Date(dispute.submitted_at).toLocaleDateString()}
                      </p>
                      {dispute.resolution && (
                        <p className="text-sm text-green-600 mt-2">
                          Resolution: {dispute.resolution}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      dispute.status === 'resolved' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {dispute.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dispute Form Modal */}
      {showDisputeForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Time Issue</h3>
            
            <form onSubmit={handleSubmitDispute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Type
                </label>
                <select
                  value={disputeForm.dispute_type}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, dispute_type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select issue type</option>
                  <option value="missed_punch">Missed Check-in/out</option>
                  <option value="incorrect_hours">Incorrect Hours Calculated</option>
                  <option value="overtime_calculation">Overtime Calculation Error</option>
                  <option value="break_deduction">Incorrect Break Deduction</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={disputeForm.description}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the issue in detail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Adjustment
                </label>
                <textarea
                  value={disputeForm.requestedAdjustment}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, requestedAdjustment: e.target.value }))}
                  rows="2"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What adjustment are you requesting?"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Submit Dispute
                </button>
                <button
                  type="button"
                  onClick={() => setShowDisputeForm(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaregiverTimesheet;
