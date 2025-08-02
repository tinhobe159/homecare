import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Package,
  DollarSign,
  MapPin,
  Plus,
  AlertCircle
} from 'lucide-react';
import { scheduledPackagesAPI, packagesAPI, customersAPI, caregiversAPI } from '../../services/api';
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

const AdminScheduledPackages = () => {
  const [scheduledPackages, setScheduledPackages] = useState([]);
  const [packages, setPackages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    assigned_caregiver_id: 'none'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesResponse, packagesResponse, customersResponse, caregiversResponse] = await Promise.all([
        scheduledPackagesAPI.getAll(),
        packagesAPI.getAll(),
        customersAPI.getAll(),
        caregiversAPI.getAll()
      ]);
      setScheduledPackages(schedulesResponse.data);
      setPackages(packagesResponse.data);
      setCustomers(customersResponse.data);
      setCaregivers(caregiversResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load scheduled packages');
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

  const handleStatusUpdate = async (scheduleId, newStatus) => {
    try {
      await scheduledPackagesAPI.update(scheduleId, { status: newStatus });
      toast.success(`Schedule ${newStatus} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule status');
    }
  };

  const handleViewDetails = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      status: schedule.status,
      notes: schedule.notes || '',
      assigned_caregiver_id: schedule.assigned_caregiver_id || 'none'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await scheduledPackagesAPI.update(selectedSchedule.id, formData);
      toast.success('Schedule updated successfully');
      setShowModal(false);
      setSelectedSchedule(null);
      fetchData();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const getPackageById = (packageId) => {
    return packages.find(pkg => pkg.id === packageId);
  };

  const getCustomerById = (customerId) => {
    return customers.find(customer => customer.id === customerId);
  };

  const getCaregiverById = (caregiverId) => {
    if (!caregiverId || caregiverId === 'none') {
      return null;
    }
    return caregivers.find(caregiver => caregiver.id === caregiverId);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency?.toLowerCase()) {
      case 'daily': return 'destructive';
      case 'weekly': return 'secondary';
      case 'monthly': return 'outline';
      default: return 'outline';
    }
  };

  const filteredSchedules = scheduledPackages.filter(schedule => {
    const customer = getCustomerById(schedule.customer_id);
    const pkg = getPackageById(schedule.package_id);

    const matchesSearch =
      (customer?.first_name?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (customer?.last_name?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (customer?.email?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (pkg?.name?.toLowerCase().includes((searchTerm || '').toLowerCase()));

    const matchesFilter = filterStatus === 'all' || schedule.status === filterStatus;
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
                <Calendar className="h-6 w-6 mr-2" />
                Scheduled Packages
              </CardTitle>
              <CardDescription>Manage recurring package schedules</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{scheduledPackages.length}</div>
              <div className="text-sm text-muted-foreground">Total Schedules</div>
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
                placeholder="Search schedules..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">
                {filteredSchedules.length} of {scheduledPackages.length} schedules
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedules Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Visit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => {
                  const customer = getCustomerById(schedule.customer_id);
                  const pkg = getPackageById(schedule.package_id);
                  const caregiver = getCaregiverById(schedule.assigned_caregiver_id);

                  return (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              Schedule #{schedule.id}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {schedule.start_date && new Date(schedule.start_date).toLocaleDateString()}
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
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">
                              {pkg?.name || 'Unknown Package'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${pkg?.total_cost || 0}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(schedule.status)}>
                          {schedule.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getFrequencyColor(schedule.frequency)}>
                          {schedule.frequency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {schedule.next_visit_date ?
                              new Date(schedule.next_visit_date).toLocaleDateString() :
                              'Not scheduled'
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(schedule)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {schedule.status === 'active' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(schedule.id, 'paused')}
                              >
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(schedule.id, 'completed')}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            </>
                          )}
                          {schedule.status === 'paused' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(schedule.id, 'active')}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(schedule.id, 'cancelled')}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {schedule.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(schedule.id, 'active')}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(schedule.id, 'cancelled')}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
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
            <DialogTitle>Schedule Details - #{selectedSchedule?.id}</DialogTitle>
            <DialogDescription>Update schedule information and assign caregiver</DialogDescription>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
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
                                        <SelectItem value="none">No assignment</SelectItem>
                  {caregivers.map(caregiver => (
                    <SelectItem key={caregiver.id} value={caregiver.id.toString()}>
                      {caregiver.first_name} {caregiver.last_name} - ${caregiver.hourly_rate}/hr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Add notes about this schedule..."
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
                Update Schedule
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminScheduledPackages; 