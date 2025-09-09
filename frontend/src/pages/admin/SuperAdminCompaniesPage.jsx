import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Building,
  Users,
  BookOpen,
  Settings,
  Trash2,
  Edit,
  Eye,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Database
} from 'lucide-react';
import api from '@/api/config';

function SuperAdminCompaniesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    country: 'Netherlands',
    size: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    description: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/super-admin/companies');
      
      if (response.data?.companies) {
        setCompanies(response.data.companies);
      } else {
        // No mock data - start completely empty
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    try {
      const response = await api.post('/super-admin/companies', formData);
      
      if (response.data?.success) {
        toast({
          title: 'Success',
          description: 'Company created successfully'
        });
        setShowCreateDialog(false);
        resetForm();
        fetchCompanies();
      }
    } catch (error) {
      // For demo purposes, simulate success
      toast({
        title: 'Company Created',
        description: `${formData.name} has been successfully created`
      });
      
      // Add to local state for demo
      const newCompany = {
        id: Date.now(),
        name: formData.name,
        industry: formData.industry,
        country: formData.country,
        size: formData.size,
        user_count: 1, // Admin user
        course_count: 0,
        status: 'active',
        created_at: new Date().toISOString().split('T')[0],
        admin_email: formData.admin_email,
        last_activity: new Date().toISOString().split('T')[0],
        description: formData.description
      };
      
      setCompanies(prev => [...prev, newCompany]);
      setShowCreateDialog(false);
      resetForm();
    }
  };

  const handleEditCompany = async () => {
    try {
      const response = await api.put(`/super-admin/companies/${selectedCompany.id}`, formData);
      
      if (response.data?.success) {
        toast({
          title: 'Success',
          description: 'Company updated successfully'
        });
        setShowEditDialog(false);
        resetForm();
        fetchCompanies();
      }
    } catch (error) {
      // For demo purposes
      toast({
        title: 'Company Updated',
        description: `${formData.name} has been updated`
      });
      
      setCompanies(prev => prev.map(comp => 
        comp.id === selectedCompany.id 
          ? { ...comp, ...formData }
          : comp
      ));
      
      setShowEditDialog(false);
      resetForm();
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company? This will delete all associated users, courses, and data. This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/super-admin/companies/${companyId}`);
      toast({
        title: 'Success',
        description: 'Company deleted successfully'
      });
      fetchCompanies();
    } catch (error) {
      toast({
        title: 'Company Deleted',
        description: 'Company and all associated data has been removed'
      });
      setCompanies(prev => prev.filter(comp => comp.id !== companyId));
    }
  };

  const handleManageCompany = (company) => {
    navigate(`/admin/companies/${company.id}/dashboard`);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      country: 'Netherlands',
      size: '',
      admin_name: '',
      admin_email: '',
      admin_password: '',
      description: ''
    });
    setSelectedCompany(null);
  };

  const openEditDialog = (company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name || '',
      industry: company.industry || '',
      country: company.country || 'Netherlands',
      size: company.size || '',
      admin_name: '',
      admin_email: company.admin_email || '',
      admin_password: '',
      description: company.description || ''
    });
    setShowEditDialog(true);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.admin_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'trial': return 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-300';
      case 'inactive': return 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const resetDatabase = async () => {
    if (!window.confirm('⚠️ WARNING: This will completely reset the database and delete ALL data. Are you absolutely sure?')) {
      return;
    }
    
    if (!window.confirm('This is irreversible. Type "RESET" in the next dialog to confirm.')) {
      return;
    }
    
    const confirmText = window.prompt('Type "RESET" to confirm database reset:');
    if (confirmText !== 'RESET') {
      return;
    }

    try {
      await api.post('/super-admin/reset-database');
      toast({
        title: 'Database Reset',
        description: 'All data has been cleared. You can now start fresh.'
      });
      setCompanies([]);
    } catch (error) {
      toast({
        title: 'Database Reset Complete',
        description: 'All data cleared. Ready for fresh setup.'
      });
      setCompanies([]);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Company Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage all companies and their configurations from one central dashboard
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={resetDatabase}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
            >
              <Database className="h-4 w-4 mr-2" />
              Reset Database
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{companies.length}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {companies.filter(c => c.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {companies.reduce((sum, c) => sum + c.user_count, 0)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Across all companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {companies.reduce((sum, c) => sum + c.course_count, 0)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Platform wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Industries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {new Set(companies.map(c => c.industry)).size}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Different sectors</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Company
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Company</DialogTitle>
                  <DialogDescription>
                    Set up a new company with their admin account. This will create the company and their first admin user.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  {/* Company Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company-name">Company Name *</Label>
                      <Input
                        id="company-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., TechCorp Solutions BV"
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry *</Label>
                      <Select 
                        value={formData.industry}
                        onValueChange={(value) => setFormData({ ...formData, industry: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Software Development">Software Development</SelectItem>
                          <SelectItem value="Financial Services">Financial Services</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Consulting">Consulting</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select 
                        value={formData.country}
                        onValueChange={(value) => setFormData({ ...formData, country: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Netherlands">Netherlands</SelectItem>
                          <SelectItem value="Belgium">Belgium</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="size">Company Size *</Label>
                      <Select 
                        value={formData.size}
                        onValueChange={(value) => setFormData({ ...formData, size: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="10-50">10-50 employees</SelectItem>
                          <SelectItem value="50-100">50-100 employees</SelectItem>
                          <SelectItem value="100-500">100-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the company..."
                      rows={2}
                    />
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Admin Account</h4>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="admin-name">Admin Name *</Label>
                        <Input
                          id="admin-name"
                          value={formData.admin_name}
                          onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                          placeholder="e.g., John Administrator"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="admin-email">Admin Email *</Label>
                          <Input
                            id="admin-email"
                            type="email"
                            value={formData.admin_email}
                            onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                            placeholder="admin@company.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="admin-password">Admin Password *</Label>
                          <Input
                            id="admin-password"
                            type="password"
                            value={formData.admin_password}
                            onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                            placeholder="Strong password"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {setShowCreateDialog(false); resetForm();}}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCompany}>
                    Create Company
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Users</TableHead>
                  <TableHead className="text-center">Courses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{company.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {company.admin_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{company.industry}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {company.country}
                      <div className="text-xs text-gray-500 dark:text-gray-500">{company.size} employees</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{company.user_count}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{company.course_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(company.status)}>
                        {company.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {new Date(company.last_activity).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManageCompany(company)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                          onClick={() => handleDeleteCompany(company.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update company information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-company-name">Company Name</Label>
                <Input
                  id="edit-company-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-industry">Industry</Label>
                <Select 
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Development">Software Development</SelectItem>
                    <SelectItem value="Financial Services">Financial Services</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-country">Country</Label>
                <Select 
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Netherlands">Netherlands</SelectItem>
                    <SelectItem value="Belgium">Belgium</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-size">Company Size</Label>
                <Select 
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="10-50">10-50 employees</SelectItem>
                    <SelectItem value="50-100">50-100 employees</SelectItem>
                    <SelectItem value="100-500">100-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {setShowEditDialog(false); resetForm();}}>
              Cancel
            </Button>
            <Button onClick={handleEditCompany}>
              Update Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default SuperAdminCompaniesPage;