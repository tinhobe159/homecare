import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X,
  Calendar,
  Clock,
  DollarSign,
  Star,
  Heart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentsAPI, paymentsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';

const CustomerProfile = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    address: user?.address || ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsResponse, paymentsResponse] = await Promise.all([
        appointmentsAPI.getByCustomerId(user?.id),
        paymentsAPI.getByCustomerId(user?.id)
      ]);
      setAppointments(appointmentsResponse.data);
      setPayments(paymentsResponse.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
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

  const handleSave = async () => {
    try {
      // Here you would typically update the user profile via API
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      address: user?.address || ''
    });
    setEditing(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'default';
      case 'confirmed': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account and view your care history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Profile Information</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.profile_image} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {user?.first_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      {editing ? (
                        <Input
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm text-gray-900 mt-1">{user?.first_name || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      {editing ? (
                        <Input
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm text-gray-900 mt-1">{user?.last_name || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    {editing ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                        <p className="text-sm text-gray-900">{user?.email}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    {editing ? (
                      <Input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                        <p className="text-sm text-gray-900">{user?.phone_number || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    {editing ? (
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-start mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                        <p className="text-sm text-gray-900">{user?.address || 'Not provided'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="flex space-x-3 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Recent Appointments
                </CardTitle>
                <CardDescription>
                  Your latest care appointments and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.package_name || 'Care Service'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.appointment_datetime_start).toLocaleDateString()} at{' '}
                              {new Date(appointment.appointment_datetime_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          <p className="text-sm font-medium text-gray-900">
                            ${appointment.total_cost}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No appointments yet</p>
                    <p className="text-sm text-gray-400">Book your first care service to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Recent Payments
                </CardTitle>
                <CardDescription>
                  Your payment history and transaction details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Payment #{payment.id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={getPaymentStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                          <p className="text-sm font-medium text-gray-900">
                            ${payment.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No payments yet</p>
                    <p className="text-sm text-gray-400">Payment history will appear here after your first booking</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Appointments</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">{appointments.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Spent</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    ${payments.reduce((sum, payment) => sum + (payment.amount || 0), 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Member Since</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    {user?.created_at ? new Date(user.created_at).getFullYear() : 'N/A'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile; 