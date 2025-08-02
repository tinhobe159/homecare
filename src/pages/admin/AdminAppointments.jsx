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
  Phone,
  Mail,
  MapPin,
  Package,
  DollarSign,
  Plus,
  X
} from 'lucide-react';
import { appointmentsAPI, packagesAPI, customersAPI, userRequestsAPI, caregiversAPI } from '../../services/api';
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

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });
  const [createFormData, setCreateFormData] = useState({
    customer_id: '',
    caregiver_id: '',
    package_id: '',
    appointment_datetime_start: '',
    appointment_datetime_end: '',
    duration_minutes: '',
    status: 'Pending',
    booking_notes: '',
    total_cost: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsResponse, packagesResponse, customersResponse, caregiversResponse, userRequestsResponse] = await Promise.all([
        appointmentsAPI.getAll(),
        packagesAPI.getAll(),
        customersAPI.getAll(),
        caregiversAPI.getAll(),
        userRequestsAPI.getAll()
      ]);
      setAppointments(appointmentsResponse.data);
      setPackages(packagesResponse.data);
      setCustomers(customersResponse.data);
      setCaregivers(caregiversResponse.data);
      setUserRequests(userRequestsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load appointments');
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

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    
    try {
      // Calculate end time if not provided
      let endTime = createFormData.appointment_datetime_end;
      if (!endTime && createFormData.appointment_datetime_start && createFormData.duration_minutes) {
        const startTime = new Date(createFormData.appointment_datetime_start);
        const endTimeDate = new Date(startTime.getTime() + (parseInt(createFormData.duration_minutes) * 60 * 1000));
        endTime = endTimeDate.toISOString();
      }

      const appointmentData = {
        ...createFormData,
        appointment_datetime_end: endTime,
        created_at: new Date().toISOString()
      };

      await appointmentsAPI.create(appointmentData);
      toast.success('Appointment created successfully');
      setShowCreateModal(false);
      setCreateFormData({
        customer_id: '',
        caregiver_id: '',
        package_id: '',
        appointment_datetime_start: '',
        appointment_datetime_end: '',
        duration_minutes: '',
        status: 'Pending',
        booking_notes: '',
        total_cost: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  const handlePackageChange = (packageId) => {
    const selectedPackage = packages.find(pkg => pkg.id === parseInt(packageId));
    if (selectedPackage) {
      setCreateFormData(prev => ({
        ...prev,
        package_id: packageId,
        total_cost: selectedPackage.total_cost,
        duration_minutes: selectedPackage.duration_hours * 60
      }));
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await appointmentsAPI.update(appointmentId, { status: newStatus });
      toast.success(`Appointment ${newStatus} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      status: appointment.status,
      notes: appointment.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await appointmentsAPI.update(selectedAppointment.id, formData);
      toast.success('Appointment updated successfully');
      setShowModal(false);
      setSelectedAppointment(null);
      fetchData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const getPackageById = (packageId) => {
    return packages.find(pkg => pkg.id === packageId);
  };

  const getCustomerById = (customerId) => {
    return customers.find(customer => customer.id === customerId);
  };

  const getCaregiverById = (caregiverId) => {
    return caregivers.find(caregiver => caregiver.id === caregiverId);
  };

  const getUserRequestById = (requestId) => {
    return userRequests.find(request => request.id === requestId);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const customer = getCustomerById(appointment.customer_id);
    const pkg = getPackageById(appointment.package_id);
    
    const matchesSearch = 
      (customer?.name?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (customer?.email?.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
      (pkg?.name?.toLowerCase().includes((searchTerm || '').toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
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
                Appointment Management
              </CardTitle>
              <CardDescription>Manage and track all appointments</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{appointments.length}</div>
                <div className="text-sm text-muted-foreground">Total Appointments</div>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Appointment
              </Button>
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
                placeholder="Search appointments..."
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
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">
                {filteredAppointments.length} of {appointments.length} appointments
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => {
          const customer = getCustomerById(appointment.customer_id);
          const pkg = getPackageById(appointment.package_id);
          
          return (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Appointment #{appointment.id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.appointment_datetime_start).toLocaleDateString()} at{' '}
                        {new Date(appointment.appointment_datetime_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={appointment.status === 'Confirmed' ? 'default' : 
                                   appointment.status === 'Pending' ? 'secondary' : 
                                   appointment.status === 'Cancelled' ? 'destructive' : 'outline'}>
                      {appointment.status}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(appointment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {appointment.status === 'Pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusUpdate(appointment.id, 'Confirmed')}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusUpdate(appointment.id, 'Cancelled')}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {appointment.status === 'Confirmed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(appointment.id, 'Completed')}
                        >
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Customer
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown'}</p>
                      <p className="text-muted-foreground flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {customer?.email || appointment.customer_email}
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {customer?.phone || appointment.customer_phone}
                      </p>
                      {appointment.address && (
                        <p className="text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {appointment.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Package Info */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Package
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{pkg?.name || 'Unknown Package'}</p>
                      <p className="text-muted-foreground">{pkg?.description || 'No description'}</p>
                      <p className="text-primary font-semibold flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        ${pkg?.total_cost || appointment.total_cost || 0}
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {pkg?.duration_hours || appointment.duration || 0} hours
                      </p>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium">Date:</span> {' '}
                        {new Date(appointment.appointment_datetime_start).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Time:</span> {' '}
                        {new Date(appointment.appointment_datetime_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                        {new Date(appointment.appointment_datetime_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Duration:</span> {' '}
                        {appointment.duration_minutes || pkg?.duration_hours * 60 || 0} minutes
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Created:</span> {' '}
                        {new Date(appointment.created_at).toLocaleDateString()}
                      </p>
                      {appointment.user_request_id && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md">
                          <p className="text-xs text-blue-800 font-medium">
                            From User Request #{appointment.user_request_id}
                          </p>
                          {getUserRequestById(appointment.user_request_id)?.notes && (
                            <p className="text-xs text-blue-700 mt-1">
                              {getUserRequestById(appointment.user_request_id).notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                {appointment.special_instructions && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <h5 className="font-medium mb-1">Special Instructions:</h5>
                    <p className="text-sm text-muted-foreground">{appointment.special_instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Appointment Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Appointment</DialogTitle>
            <DialogDescription>Add a new appointment to the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Selection */}
              <div>
                <Label htmlFor="customer_id">Customer *</Label>
                <Select name="customer_id" value={createFormData.customer_id} onValueChange={(value) => setCreateFormData(prev => ({ ...prev, customer_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.first_name} {customer.last_name} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Caregiver Selection */}
              <div>
                <Label htmlFor="caregiver_id">Caregiver *</Label>
                <Select name="caregiver_id" value={createFormData.caregiver_id} onValueChange={(value) => setCreateFormData(prev => ({ ...prev, caregiver_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Caregiver" />
                  </SelectTrigger>
                  <SelectContent>
                    {caregivers.map(caregiver => (
                      <SelectItem key={caregiver.id} value={caregiver.id.toString()}>
                        {caregiver.first_name} {caregiver.last_name} - ${caregiver.hourlyRate}/hr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Package Selection */}
              <div>
                <Label htmlFor="package_id">Package *</Label>
                <Select 
                  name="package_id" 
                  value={createFormData.package_id} 
                  onValueChange={(value) => {
                    setCreateFormData(prev => ({ ...prev, package_id: value }));
                    handlePackageChange(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id.toString()}>
                        {pkg.name} - ${pkg.total_cost} ({pkg.duration_hours}h)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" value={createFormData.status} onValueChange={(value) => setCreateFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date & Time */}
              <div>
                <Label htmlFor="appointment_datetime_start">Start Date & Time *</Label>
                <Input
                  type="datetime-local"
                  name="appointment_datetime_start"
                  value={createFormData.appointment_datetime_start}
                  onChange={handleCreateInputChange}
                  required
                />
              </div>

              {/* End Date & Time */}
              <div>
                <Label htmlFor="appointment_datetime_end">End Date & Time</Label>
                <Input
                  type="datetime-local"
                  name="appointment_datetime_end"
                  value={createFormData.appointment_datetime_end}
                  onChange={handleCreateInputChange}
                />
                <p className="text-xs text-muted-foreground mt-1">Leave empty to auto-calculate based on duration</p>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  type="number"
                  name="duration_minutes"
                  value={createFormData.duration_minutes}
                  onChange={handleCreateInputChange}
                  placeholder="Auto-filled from package"
                />
              </div>

              {/* Total Cost */}
              <div>
                <Label htmlFor="total_cost">Total Cost ($)</Label>
                <Input
                  type="number"
                  name="total_cost"
                  value={createFormData.total_cost}
                  onChange={handleCreateInputChange}
                  step="0.01"
                  placeholder="Auto-filled from package"
                />
              </div>
            </div>

            {/* Booking Notes */}
            <div>
              <Label htmlFor="booking_notes">Booking Notes</Label>
              <Textarea
                name="booking_notes"
                value={createFormData.booking_notes}
                onChange={handleCreateInputChange}
                rows="3"
                placeholder="Add any special instructions or notes for this appointment..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Appointment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details - #{selectedAppointment?.id}</DialogTitle>
            <DialogDescription>Update appointment information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select name="status" value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Add any notes about this appointment..."
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
                Update Appointment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAppointments;
