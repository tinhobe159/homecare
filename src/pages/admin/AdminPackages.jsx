import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  DollarSign,
  Clock,
  Settings,
  Star
} from 'lucide-react';
import { packagesAPI, servicesAPI } from '../../services/api';
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

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_cost: '',
    duration_hours: '',
    category: '',
    services: [],
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesResponse, servicesResponse] = await Promise.all([
        packagesAPI.getAll(),
        servicesAPI.getAll()
      ]);
      setPackages(packagesResponse.data);
      setServices(servicesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load packages');
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
      if (editingPackage) {
        await packagesAPI.update(editingPackage.id, formData);
        toast.success('Package updated successfully');
      } else {
        await packagesAPI.create(formData);
        toast.success('Package created successfully');
      }
      
      setShowModal(false);
      setEditingPackage(null);
      setFormData({ 
        name: '', 
        description: '', 
        total_cost: '', 
        duration_hours: '', 
        category: '',
        services: [],
        is_active: true 
      });
      fetchData();
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error('Failed to save package');
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      total_cost: pkg.total_cost || '',
      duration_hours: pkg.duration_hours || '',
      category: pkg.category || '',
      services: pkg.services || [],
      is_active: pkg.is_active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await packagesAPI.delete(packageId);
        toast.success('Package deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting package:', error);
        toast.error('Failed to delete package');
      }
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'elite': return 'bg-yellow-100 text-yellow-800';
      case 'custom': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         pkg.description?.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterCategory === 'all' || pkg.category === filterCategory;
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
                <Package className="h-6 w-6 mr-2" />
                Package Management
              </CardTitle>
              <CardDescription>Create and manage service packages</CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingPackage(null);
                setFormData({ 
                  name: '', 
                  description: '', 
                  total_cost: '', 
                  duration_hours: '', 
                  category: '',
                  services: [],
                  is_active: true 
                });
                setShowModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Package
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
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Elite">Elite</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">
                {filteredPackages.length} of {packages.length} packages
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(pkg)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(pkg.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {pkg.description || 'No description available'}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      ${pkg.total_cost}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Cost</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {pkg.duration_hours}h
                    </div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline">{pkg.category || 'Uncategorized'}</Badge>
                  </div>
                  
                  {pkg.services && pkg.services.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Services:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {pkg.services.slice(0, 3).map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service.name}
                          </Badge>
                        ))}
                        {pkg.services.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{pkg.services.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(pkg.created_at).toLocaleDateString()}</span>
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
              {editingPackage ? 'Edit Package' : 'Add New Package'}
            </DialogTitle>
            <DialogDescription>
              {editingPackage ? 'Update package information' : 'Create a new service package'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Elite">Elite</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe the package and its benefits..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_cost">Total Cost ($) *</Label>
                <Input
                  type="number"
                  name="total_cost"
                  value={formData.total_cost}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration_hours">Duration (hours) *</Label>
                <Input
                  type="number"
                  name="duration_hours"
                  value={formData.duration_hours}
                  onChange={handleInputChange}
                  step="0.5"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="services">Services</Label>
              <Select 
                value="" 
                onValueChange={(value) => {
                  const service = services.find(s => s.id.toString() === value);
                  if (service && !formData.services.find(s => s.id === service.id)) {
                    setFormData(prev => ({
                      ...prev,
                      services: [...prev.services, service]
                    }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add services to package" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {formData.services.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.services.map((service, index) => (
                    <Badge key={service.id} variant="secondary" className="text-xs">
                      {service.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          services: prev.services.filter((_, i) => i !== index)
                        }))}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="rounded"
              />
              <Label htmlFor="is_active">Active Package</Label>
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
                {editingPackage ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPackages; 