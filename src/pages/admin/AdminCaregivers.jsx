import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { caregiversAPI } from '../../services/api';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AdminCaregivers = () => {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    hourly_rate: '',
    specializations: [],
    availability: 'available',
    status: 'active',
    bio: '',
    experience_years: '',
    certifications: []
  });

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    try {
      const response = await caregiversAPI.getAll();
      setCaregivers(response.data);
    } catch (error) {
      console.error('Error fetching caregivers:', error);
      toast.error('Failed to load caregivers');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCaregiver) {
        await caregiversAPI.update(editingCaregiver.id, formData);
        toast.success('Caregiver updated successfully');
      } else {
        await caregiversAPI.create(formData);
        toast.success('Caregiver created successfully');
      }
      
      setShowModal(false);
      setEditingCaregiver(null);
      setFormData({ 
        first_name: '', 
        last_name: '', 
        email: '', 
        phone_number: '', 
        hourly_rate: '',
        specializations: [],
        availability: 'available',
        status: 'active',
        bio: '',
        experience_years: '',
        certifications: []
      });
      fetchCaregivers();
    } catch (error) {
      console.error('Error saving caregiver:', error);
      toast.error('Failed to save caregiver');
    }
  };

  const handleEdit = (caregiver) => {
    setEditingCaregiver(caregiver);
    setFormData({
      first_name: caregiver.first_name || '',
      last_name: caregiver.last_name || '',
      email: caregiver.email || '',
      phone_number: caregiver.phone_number || '',
      hourly_rate: caregiver.hourly_rate || '',
      specializations: caregiver.specializations || [],
      availability: caregiver.availability || 'available',
      status: caregiver.status || 'active',
      bio: caregiver.bio || '',
      experience_years: caregiver.experience_years || '',
      certifications: caregiver.certifications || []
    });
    setShowModal(true);
  };

  const handleDelete = async (caregiverId) => {
    if (window.confirm('Are you sure you want to delete this caregiver?')) {
      try {
        await caregiversAPI.delete(caregiverId);
        toast.success('Caregiver deleted successfully');
        fetchCaregivers();
      } catch (error) {
        console.error('Error deleting caregiver:', error);
        toast.error('Failed to delete caregiver');
      }
    }
  };

  const getCaregiverName = (caregiver) => {
    if (caregiver.first_name && caregiver.last_name) {
      return `${caregiver.first_name} ${caregiver.last_name}`;
    } else if (caregiver.first_name) {
      return caregiver.first_name;
    } else if (caregiver.last_name) {
      return caregiver.last_name;
    } else {
      return 'Unknown Caregiver';
    }
  };

  const getCaregiverInitial = (caregiver) => {
    if (caregiver.first_name) {
      return caregiver.first_name.charAt(0).toUpperCase();
    }
    return getCaregiverName(caregiver).charAt(0).toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability?.toLowerCase()) {
      case 'available': return 'default';
      case 'busy': return 'secondary';
      case 'offline': return 'outline';
      default: return 'outline';
    }
  };

  const filteredCaregivers = caregivers.filter(caregiver => {
    const fullName = getCaregiverName(caregiver).toLowerCase();
    const matchesSearch = fullName.includes((searchTerm || '').toLowerCase()) ||
                         (caregiver.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (caregiver.phone_number || '').includes(searchTerm || '');
    const matchesFilter = filterStatus === 'all' || caregiver.status === filterStatus;
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
                <UserCheck className="h-6 w-6 mr-2" />
                Caregiver Management
              </CardTitle>
              <CardDescription>Manage your caregiver team</CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingCaregiver(null);
                setFormData({ 
                  first_name: '', 
                  last_name: '', 
                  email: '', 
                  phone_number: '', 
                  hourly_rate: '',
                  specializations: [],
                  availability: 'available',
                  status: 'active',
                  bio: '',
                  experience_years: '',
                  certifications: []
                });
                setShowModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Caregiver
            </Button>
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
                placeholder="Search caregivers..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">
                {filteredCaregivers.length} of {caregivers.length} caregivers
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Caregivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCaregivers.map((caregiver) => (
          <Card key={caregiver.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={caregiver.profile_image} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getCaregiverInitial(caregiver)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{getCaregiverName(caregiver)}</CardTitle>
                    <div className="flex space-x-2 mt-1">
                      <Badge variant={getStatusColor(caregiver.status)}>
                        {caregiver.status}
                      </Badge>
                      <Badge variant={getAvailabilityColor(caregiver.availability)}>
                        {caregiver.availability}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(caregiver)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(caregiver.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-3 w-3 mr-2" />
                    {caregiver.email}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-3 w-3 mr-2" />
                    {caregiver.phone_number}
                  </div>
                  {caregiver.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-2" />
                      {caregiver.location}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      ${caregiver.hourly_rate}/hr
                    </div>
                    <div className="text-xs text-muted-foreground">Hourly Rate</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {caregiver.experience_years || 0}y
                    </div>
                    <div className="text-xs text-muted-foreground">Experience</div>
                  </div>
                </div>

                {caregiver.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {caregiver.bio}
                  </p>
                )}

                {caregiver.specializations && caregiver.specializations.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Specializations:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {caregiver.specializations.slice(0, 3).map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {caregiver.specializations.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{caregiver.specializations.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="ml-1">{caregiver.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCaregiver ? 'Edit Caregiver' : 'Add New Caregiver'}
            </DialogTitle>
            <DialogDescription>
              {editingCaregiver ? 'Update caregiver information' : 'Add a new caregiver to your team'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
                <Input
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="experience_years">Experience (years)</Label>
                <Input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Select name="availability" value={formData.availability} onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="3"
                placeholder="Tell us about the caregiver's experience and background..."
              />
            </div>

            <div>
              <Label htmlFor="specializations">Specializations</Label>
              <Input
                type="text"
                name="specializations"
                value={formData.specializations.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  specializations: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                }))}
                placeholder="Elderly care, Dementia care, Medication management..."
              />
              <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
            </div>

            <div>
              <Label htmlFor="certifications">Certifications</Label>
              <Input
                type="text"
                name="certifications"
                value={formData.certifications.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  certifications: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                }))}
                placeholder="CPR, First Aid, Nursing License..."
              />
              <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCaregiver ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCaregivers; 