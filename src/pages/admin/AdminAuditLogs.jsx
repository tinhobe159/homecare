import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Eye, Calendar, Clock, 
  Activity, Star, TrendingUp, BarChart3, 
  Shield, Users, AlertTriangle
} from 'lucide-react';
import { auditLogsAPI, usersAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [metrics, setMetrics] = useState({
    total: 0,
    today: 0,
    critical: 0,
    averagePerDay: 0,
    topAction: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateMetrics();
  }, [auditLogs]);

  const fetchData = async () => {
    try {
      const [logsResponse, usersResponse] = await Promise.all([
        auditLogsAPI.getAll(),
        usersAPI.getAll()
      ]);
      setAuditLogs(logsResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (user_id) => {
    const user = users.find(u => u.id === user_id);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  };

  // Utility to parse details JSON safely
  const parseDetails = (details) => {
    if (!details) return '';
    try {
      const parsed = JSON.parse(details);
      // If details is an object, join key-value pairs for display
      return Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(', ');
    } catch {
      return details;
    }
  };

  const calculateMetrics = () => {
    const total = auditLogs.length;
    const today = new Date().toDateString();
    const todayLogs = auditLogs.filter(log => {
      const logDate = new Date(log.timestamp || new Date()).toDateString();
      return logDate === today;
    }).length;

    const critical = auditLogs.filter(log => {
      const actionType = (log.action || '').toUpperCase();
      return actionType === 'DELETE' || actionType === 'SECURITY' || actionType === 'ERROR';
    }).length;

    const averagePerDay = total > 0 ? Math.round(total / 30) : 0; // Assuming 30 days

    // Find most common action
    const actionCounts = {};
    auditLogs.forEach(log => {
      const actionType = (log.action || 'UNKNOWN').toUpperCase();
      actionCounts[actionType] = (actionCounts[actionType] || 0) + 1;
    });
    const topAction = Object.keys(actionCounts).reduce((a, b) =>
      actionCounts[a] > actionCounts[b] ? a : b, 'UNKNOWN'
    );

    setMetrics({
      total,
      today: todayLogs,
      critical,
      averagePerDay,
      topAction
    });
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (actionType) => {
    switch ((actionType || '').toUpperCase()) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800';
      case 'SECURITY':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (actionType) => {
    switch ((actionType || '').toUpperCase()) {
      case 'CREATE':
        return <Activity className="h-4 w-4" />;
      case 'UPDATE':
        return <TrendingUp className="h-4 w-4" />;
      case 'DELETE':
        return <AlertTriangle className="h-4 w-4" />;
      case 'LOGIN':
        return <Shield className="h-4 w-4" />;
      case 'SECURITY':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = getUserName(log.user_id).toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (log.action || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (log.entity || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (parseDetails(log.details) || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesAction = filterAction === 'all' || (log.action || '').toUpperCase() === filterAction;
    const matchesUser = filterUser === 'all' || getUserName(log.user_id) === filterUser;
    return matchesSearch && matchesAction && matchesUser;
  });

  const uniqueUsers = [...new Set(auditLogs.map(log => getUserName(log.user_id)).filter(Boolean))];
  const uniqueActions = [...new Set(auditLogs.map(log => (log.action || '').toUpperCase()).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/admin" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Audit Logs</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Logs</h1>
              <p className="text-gray-600">Monitor system activities and security events</p>
            </div>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.total}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.today}</p>
                <p className="text-sm text-green-600 mt-1">New entries</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.critical}</p>
                <p className="text-sm text-red-600 mt-1">Security events</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg/Day</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.averagePerDay}</p>
                <p className="text-sm text-purple-600 mt-1">Entries per day</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Action</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.topAction}</p>
                <p className="text-sm text-yellow-600 mt-1">Most common</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-action="search"
              />
            </div>
            <div>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">
                {filteredLogs.length} of {auditLogs.length} logs
              </span>
            </div>
          </div>
        </div>

        {/* Audit Logs List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            {getActionIcon(log.action)}
                          </div>
                        </div>
                        <div className="ml-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                            {(log.action || '').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{getUserName(log.user_id)}</div>
                          <div className="text-sm text-gray-500">ID: {log.user_id || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.entity || 'Unknown Table'}</div>
                      <div className="text-sm text-gray-500">ID: {log.entity_id || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={parseDetails(log.details) || 'No description'}>
                        {parseDetails(log.details) || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(log)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No audit logs found</p>
            <p className="text-gray-400">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedLog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Log Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Action Type</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded-md">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(selectedLog.action)}`}>
                          {(selectedLog.action || '').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded-md">
                        {getUserName(selectedLog.user_id)} (ID: {selectedLog.user_id})
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Table</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded-md">
                        {selectedLog.entity}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Record ID</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded-md">
                        {selectedLog.entity_id}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded-md">
                        {formatTimestamp(selectedLog.timestamp)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IP Address</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded-md">
                        {selectedLog.ip_address || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                      {parseDetails(selectedLog.details)}
                    </div>
                  </div>
                  {/* old_values and new_values are not present in db.json, so skip them */}
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Close
                    </button>
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

export default AdminAuditLogs; 