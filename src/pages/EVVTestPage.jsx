import React, { useState } from 'react';
import EnhancedEVVSystem from '../components/common/EnhancedEVVSystem';

/**
 * Test page for Phase 1 EVV System components
 */
const EVVTestPage = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  // Mock appointment data for testing
  const mockAppointment = {
    id: 'apt_test_001',
    customerId: 'customer_001',
    customerName: 'John Smith',
    customerAddress: '123 Main St, New York, NY 10001',
    customerLocation: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    scheduledStartTime: new Date().toISOString(),
    scheduledEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    services: ['Personal Care', 'Medication Reminder'],
    tasks: [
      {
        id: 'task_001',
        name: 'Medication Reminder',
        description: 'Remind patient to take morning medications',
        required: true
      },
      {
        id: 'task_002',
        name: 'Personal Care',
        description: 'Assist with daily hygiene activities',
        required: true
      },
      {
        id: 'task_003',
        name: 'Vital Signs Check',
        description: 'Check and record blood pressure and temperature',
        required: false
      }
    ]
  };

  const mockCaregiver = {
    id: 'cg_001',
    name: 'Sarah Johnson',
    role: 'caregiver'
  };

  const runAutomatedTests = async () => {
    setIsRunningTests(true);
    try {
      // Phase1TestSuite not available - tests moved to vitest
      console.log('✅ Tests should be run via: npm test');
      setTestResults({ message: 'Tests moved to Vitest framework. Run: npm test' });
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Phase 1 EVV System Testing
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Enhanced EVV System Component Test
          </h2>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">Test Scenario:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Caregiver: {mockCaregiver.name}</li>
              <li>• Customer: {mockAppointment.customerName}</li>
              <li>• Location: {mockAppointment.customerAddress}</li>
              <li>• Tasks: {mockAppointment.tasks.length} tasks to complete</li>
              <li>• GPS Validation: Will check proximity to customer location</li>
            </ul>
          </div>

          <EnhancedEVVSystem 
            appointment={mockAppointment}
            caregiver={mockCaregiver}
          />
        </div>

        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-medium text-yellow-900 mb-2">Testing Instructions:</h3>
          <ol className="text-sm text-yellow-800 space-y-2">
            <li>1. <strong>GPS Permission:</strong> Allow location access when prompted</li>
            <li>2. <strong>Check-in:</strong> Click "Check In" to start EVV session</li>
            <li>3. <strong>Location Validation:</strong> System will verify you're at the customer location</li>
            <li>4. <strong>Task Completion:</strong> Mark tasks as complete and add notes</li>
            <li>5. <strong>Check-out:</strong> Click "Check Out" to end session</li>
            <li>6. <strong>Verification:</strong> EVV record will be created for supervisor review</li>
          </ol>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h4 className="font-medium text-green-900 mb-2">✅ Manual Test Checklist</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>□ GPS permission granted</li>
              <li>□ Check-in successful</li>
              <li>□ Location validated</li>
              <li>□ Tasks marked complete</li>
              <li>□ Notes added</li>
              <li>□ Check-out successful</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <h4 className="font-medium text-purple-900 mb-2">🔧 Admin Tests</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li><a href="/admin/supervisor-verification" className="underline">Supervisor Dashboard</a></li>
              <li><a href="/admin/performance-dashboard" className="underline">Performance Dashboard</a></li>
              <li><a href="/admin/dashboard" className="underline">Admin Dashboard</a></li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-medium text-blue-900 mb-2">📊 API Tests</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><a href="http://localhost:3001/evvRecords" target="_blank" className="underline">EVV Records API</a></li>
              <li><a href="http://localhost:3001/performanceMetrics" target="_blank" className="underline">Performance API</a></li>
              <li><a href="http://localhost:3001" target="_blank" className="underline">All Endpoints</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-indigo-900">🤖 Automated Test Suite</h3>
            <button
              onClick={runAutomatedTests}
              disabled={isRunningTests}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isRunningTests 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isRunningTests ? 'Running Tests...' : 'Run Automated Tests'}
            </button>
          </div>
          
          {testResults && (
            <div className="mt-4 p-4 bg-white border border-indigo-200 rounded-md">
              <h4 className="font-medium text-indigo-900 mb-2">Test Results:</h4>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-96">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
          
          <p className="text-sm text-indigo-800 mt-2">
            This will test all Phase 1 APIs, components, and functionality automatically.
            Check the browser console for detailed test output.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EVVTestPage;
