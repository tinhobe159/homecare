import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit
} from 'lucide-react';
import { caregiversAPI, caregiverAvailabilityAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CaregiverAvailability = () => {
  const [caregivers, setCaregivers] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [formData, setFormData] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    is_available: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [caregiversResponse, availabilityResponse] = await Promise.all([
        caregiversAPI.getAll(),
        caregiverAvailabilityAPI.getAll()
      ]);
      setCaregivers(caregiversResponse.data);
      setAvailability(availabilityResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedCaregiver) {
        await caregiverAvailabilityAPI.update(selectedCaregiver.id, formData);
        toast.success('Availability updated successfully');
      } else {
        await caregiverAvailabilityAPI.create(formData);
        toast.success('Availability created successfully');
      }
      
      setShowModal(false);
      setSelectedCaregiver(null);
      setFormData({ 
        day_of_week: '', 
        start_time: '', 
        end_time: '', 
        is_available: true 
      });
      fetchData();
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability');
    }
  };

  const handleEdit = (caregiver) => {
    setSelectedCaregiver(caregiver);
    setFormData({
      day_of_week: caregiver.day_of_week || '',
      start_time: caregiver.start_time || '',
      end_time: caregiver.end_time || '',
      is_available: caregiver.is_available !== false
    });
    setShowModal(true);
  };

  const getAvailabilityForCaregiver = (caregiverId) => {
    return availability.filter(avail => avail.caregiver_id === caregiverId);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'default';
      case 'busy': return 'secondary';
      case 'offline': return 'outline';
      default: return 'outline';
    }
  };

  const getDayColor = (day) => {
    switch (day?.toLowerCase()) {
      case 'monday': return 'default';
      case 'tuesday': return 'secondary';
      case 'wednesday': return 'outline';
      case 'thursday': return 'default';
      case 'friday': return 'secondary';
      case 'saturday': return 'outline';
      case 'sunday': return 'default';
      default: return 'outline';
    }
  };

  const filteredCaregivers = caregivers.filter(caregiver => {
    const fullName = `${caregiver.first_name} ${caregiver.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes((searchTerm || '').toLowerCase()) ||
                         (caregiver.email || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || caregiver.availability === filterStatus;
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
                Caregiver Availability
              </CardTitle>
              <CardDescription>Manage caregiver schedules and availability</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{caregivers.length}</div>
              <div className="text-sm text-muted-foreground">Total Caregivers</div>
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
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
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

      {/* Caregivers Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caregiver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCaregivers.map((caregiver) => {
                  const caregiverAvailability = getAvailabilityForCaregiver(caregiver.id);
                  
                  return (
                    <TableRow key={caregiver.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {caregiver.first_name} {caregiver.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {caregiver.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(caregiver.availability)}>
                          {caregiver.availability}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {caregiverAvailability.length > 0 ? (
                            caregiverAvailability.slice(0, 3).map((avail, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Badge variant={getDayColor(avail.day_of_week)} className="text-xs">
                                  {avail.day_of_week}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {avail.start_time} - {avail.end_time}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No availability set</span>
                          )}
                          {caregiverAvailability.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{caregiverAvailability.length - 3} more days
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {caregiverAvailability.filter(avail => avail.is_available).length} days
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {caregiverAvailability.reduce((total, avail) => {
                              if (avail.is_available) {
                                const start = new Date(`2000-01-01T${avail.start_time}`);
                                const end = new Date(`2000-01-01T${avail.end_time}`);
                                return total + (end - start) / (1000 * 60 * 60);
                              }
                              return total;
                            }, 0).toFixed(1)} hours/week
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(caregiver)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
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
            <DialogTitle>
              {selectedCaregiver ? 'Edit Availability' : 'Add Availability'}
            </DialogTitle>
            <DialogDescription>
              {selectedCaregiver ? 'Update caregiver availability' : 'Set caregiver availability'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="day_of_week">Day of Week</Label>
                <Select name="day_of_week" value={formData.day_of_week} onValueChange={(value) => setFormData(prev => ({ ...prev, day_of_week: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="is_available">Available</Label>
                <Select name="is_available" value={formData.is_available.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, is_available: value === 'true' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Available</SelectItem>
                    <SelectItem value="false">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                />
              </div>
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
                {selectedCaregiver ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaregiverAvailability; 