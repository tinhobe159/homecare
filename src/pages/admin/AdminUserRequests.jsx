import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Plus,
  AlertCircle
} from 'lucide-react';
import { userRequestsAPI, customersAPI, caregiversAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminUserRequests = () => {
  const [userRequests, setUserRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    admin_notes: '',
    assigned_caregiver_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsResponse, customersResponse, caregiversResponse] = await Promise.all([
        userRequestsAPI.getAll(),
        customersAPI.getAll(),
        caregiversAPI.getAll()
      ]);
      setUserRequests(requestsResponse.data);
      setCustomers(customersResponse.data);
      setCaregivers(caregiversResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load user requests');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await userRequestsAPI.update(requestId, { status: newStatus });
      toast.success(`Request ${newStatus} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request status');
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setFormData({
      status: request.status,
      admin_notes: request.admin_notes || '',
      assigned_caregiver_id: request.assigned_caregiver_id || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await userRequestsAPI.update(selectedRequest.id, formData);
      toast.success('Request updated successfully');
      setShowModal(false);
      setSelectedRequest(null);
      fetchData();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const getCustomerById = (customerId) => {
    return customers.find(customer => customer.id === customerId);
  };

  const getCaregiverById = (caregiverId) => {
    return caregivers.find(caregiver => caregiver.id === caregiverId);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      case 'assigned': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const filteredRequests = userRequests.filter(request => {
    const customer = getCustomerById(request.customer_id);
    const matchesSearch = 
      (customer?.first_name?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (customer?.last_name?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (customer?.email?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (request.notes?.toLowerCase().includes((searchTerm || '').toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <MessageSquare className="h-6 w-6 mr-2" />
                User Requests
              </CardTitle>
              <CardDescription>Manage customer service requests and inquiries</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{userRequests.length}</div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">
                {filteredRequests.length} of {userRequests.length} requests
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => {
                  const customer = getCustomerById(request.customer_id);
                  const caregiver = getCaregiverById(request.assigned_caregiver_id);
                  
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              Request #{request.id}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {request.notes}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">
                              {customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {customer?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(request.priority)}>
                          {request.priority || 'Normal'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(request.id, 'in_progress')}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(request.id, 'cancelled')}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {request.status === 'in_progress' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(request.id, 'completed')}
                            >
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details - #{selectedRequest?.id}</DialogTitle>
            <DialogDescription>Update request information and assign caregiver</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="assigned_caregiver_id">Assign Caregiver</Label>
              <Select 
                name="assigned_caregiver_id" 
                value={formData.assigned_caregiver_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_caregiver_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select caregiver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No assignment</SelectItem>
                  {caregivers.map(caregiver => (
                    <SelectItem key={caregiver.id} value={caregiver.id.toString()}>
                      {caregiver.first_name} {caregiver.last_name} - ${caregiver.hourly_rate}/hr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="admin_notes">Admin Notes</Label>
              <Textarea
                name="admin_notes"
                value={formData.admin_notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Add internal notes about this request..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Close
              </Button>
              <Button type="submit">
                Update Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserRequests; 