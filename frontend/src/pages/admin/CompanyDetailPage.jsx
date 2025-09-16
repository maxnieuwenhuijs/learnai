import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getCompanyLogoUrl } from '@/utils/urlUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Building,
  Users,
  BookOpen,
  UserPlus,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import api from '@/api/config';

function CompanyDetailPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [company, setCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showUserDeleteDialog, setShowUserDeleteDialog] = useState(false);
  const [userDeleteConfirmation, setUserDeleteConfirmation] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDepartmentDeleteDialog, setShowDepartmentDeleteDialog] = useState(false);
  const [departmentDeleteConfirmation, setDepartmentDeleteConfirmation] = useState('');
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [departmentError, setDepartmentError] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: 'TempPassword123!',
    password_confirm: 'TempPassword123!',
    role: 'participant',
    department_id: ''
  });
  const [departmentFormData, setDepartmentFormData] = useState({
    name: ''
  });
  const [showEditCompanyDialog, setShowEditCompanyDialog] = useState(false);
  const [editCompanyData, setEditCompanyData] = useState({
    name: '',
    slug: '',
    industry: '',
    country: '',
    size: '',
    description: ''
  });
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [copiedUserPassword, setCopiedUserPassword] = useState(false);

  useEffect(() => {
    loadCompanyDetails();
  }, [companyId]);

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_created': return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'user_updated': return <Edit className="h-4 w-4 text-blue-500" />;
      case 'course_completed': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'certificate_issued': return <Award className="h-4 w-4 text-yellow-500" />;
      case 'user_login': return <Users className="h-4 w-4 text-gray-500" />;
      case 'department_created': return <Building className="h-4 w-4 text-purple-500" />;
      case 'company_created': return <Building className="h-4 w-4 text-green-500" />;
      case 'company_updated': return <Settings className="h-4 w-4 text-blue-500" />;
      case 'prompt_created': return <Plus className="h-4 w-4 text-green-500" />;
      case 'prompt_deleted': return <Trash2 className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format activity timestamp
  const formatActivityTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return activityTime.toLocaleDateString();
  };

  // User password generator (same as company admin)
  const generateUserPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };

  // Handle auto-generate password for user
  const handleGenerateUserPassword = () => {
    const newPassword = generateUserPassword();
    setUserFormData({
      ...userFormData,
      password: newPassword,
      password_confirm: newPassword
    });
    setShowUserPassword(true);
    toast({
      title: "Password Generated",
      description: "A secure password has been generated. Make sure to copy it!",
    });
  };

  // Copy user password to clipboard
  const handleCopyUserPassword = async () => {
    try {
      await navigator.clipboard.writeText(userFormData.password);
      setCopiedUserPassword(true);
      toast({
        title: "Password Copied",
        description: "Password has been copied to clipboard",
      });
      setTimeout(() => setCopiedUserPassword(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy password to clipboard",
        variant: "destructive",
      });
    }
  };

  const loadCompanyDetails = async () => {
    try {
      setLoading(true);
      
      // In real implementation, fetch from /api/super-admin/companies/:id
      const response = await api.get(`/super-admin/companies/${companyId}`);
      
      if (response.data?.company) {
        setCompany(response.data.company);
        setUsers(response.data.company.users || []);
        setDepartments(response.data.company.departments || []);
        setCourses(response.data.company.courses || []);
        setRecentActivity(response.data.company.recent_activity || []);
      } else {
        // Start completely empty
        setCompany(null);
        setUsers([]);
        setDepartments([]);
        setCourses([]);
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Error loading company details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate lesson count from course modules
  const getLessonCount = (course) => {
    if (course.lesson_count !== undefined) {
      return course.lesson_count;
    }
    if (course.modules && Array.isArray(course.modules)) {
      return course.modules.reduce((total, module) => {
        return total + (module.lessons ? module.lessons.length : 0);
      }, 0);
    }
    return 0;
  };

  // Open edit company dialog
  const openEditCompanyDialog = () => {
    setEditCompanyData({
      name: company?.name || '',
      slug: company?.slug || '',
      industry: company?.industry || '',
      country: company?.country || '',
      size: company?.size || '',
      description: company?.description || ''
    });
    setShowEditCompanyDialog(true);
  };

  // Handle edit company
  const handleEditCompany = async () => {
    try {
      const formData = new FormData();
      
      // Add all form fields
      Object.keys(editCompanyData).forEach(key => {
        if (key !== 'logo' && editCompanyData[key]) {
          formData.append(key, editCompanyData[key]);
        }
      });
      
      // Add logo file if provided
      if (editCompanyData.logo) {
        formData.append('logo', editCompanyData.logo);
      }
      
      const response = await api.put(`/super-admin/companies/${companyId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data?.success) {
        toast({
          title: "Company Updated",
          description: "Company information has been updated successfully.",
        });
        setShowEditCompanyDialog(false);
        loadCompanyDetails(); // Reload data
      }
    } catch (error) {
      toast({
        title: "Update Failed", 
        description: error.response?.data?.message || "Failed to update company",
        variant: "destructive",
      });
    }
  };

  // Delete department
  const handleDeleteDepartment = (department) => {
    setDepartmentToDelete(department);
    setDepartmentDeleteConfirmation('');
    setShowDepartmentDeleteDialog(true);
  };

  const confirmDeleteDepartment = async () => {
    if (departmentDeleteConfirmation !== departmentToDelete?.name) {
      toast({
        title: "Confirmation Required",
        description: "Please type the exact department name to confirm deletion",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.delete(`/super-admin/companies/${companyId}/departments/${departmentToDelete.id}`);
      setDepartments(departments.filter(d => d.id !== departmentToDelete.id));
      toast({
        title: "Department Deleted",
        description: "Department has been removed successfully.",
      });
      setShowDepartmentDeleteDialog(false);
      setDepartmentToDelete(null);
      setDepartmentDeleteConfirmation('');
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async () => {
    const isEditing = !!editingUser;
    
    try {
      // Validate passwords match
      if (userFormData.password !== userFormData.password_confirm) {
        toast({
          title: "Password Mismatch",
          description: "Password and confirmation password do not match",
          variant: "destructive",
        });
        return;
      }

      // Validate password strength
      if (userFormData.password.length < 8) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 8 characters long",
          variant: "destructive",
        });
        return;
      }

      // Validate department selection
      if (!userFormData.department_id) {
        setDepartmentError(true);
        toast({
          title: "Department Required",
          description: "Please select a department for the user",
          variant: "destructive",
        });
        return;
      }
      setDepartmentError(false);

      const endpoint = isEditing 
        ? `/super-admin/users/${editingUser.id}` 
        : `/super-admin/companies/${companyId}/users`;
      const method = isEditing ? 'put' : 'post';
      
      // For updates, don't send password fields
      const dataToSend = isEditing 
        ? { name: userFormData.name, email: userFormData.email, role: userFormData.role, department_id: userFormData.department_id || null }
        : userFormData;
      
      const response = await api[method](endpoint, dataToSend);
      
      if (response.data?.success) {
        toast({
          title: 'Success',
          description: isEditing ? 'User updated successfully' : 'User created successfully'
        });
        setShowUserDialog(false);
        resetUserForm();
        setEditingUser(null);
        loadCompanyDetails();
      }
    } catch (error) {
      console.error('Error with user operation:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} user`;
      console.error('Error message to display:', errorMessage);
      
      toast({
        title: isEditing ? "User Update Failed" : "User Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user) => {
    setUserFormData({
      name: user.name,
      email: user.email,
      password: 'TempPassword123!', // Reset to default
      password_confirm: 'TempPassword123!',
      role: user.role,
      department_id: user.department?.id?.toString() || ''
    });
    setEditingUser(user);
    setShowUserDialog(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setUserDeleteConfirmation('');
    setShowUserDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (userDeleteConfirmation !== userToDelete?.name) {
      toast({
        title: "Confirmation Required",
        description: "Please type the exact user name to confirm deletion",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.delete(`/super-admin/users/${userToDelete.id}`);
      toast({
        title: "User Deleted",
        description: "User has been removed successfully.",
      });
      setShowUserDeleteDialog(false);
      setUserToDelete(null);
      setUserDeleteConfirmation('');
      loadCompanyDetails(); // Reload to get updated user list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async () => {
    if (deleteConfirmation !== company?.name) {
      toast({
        title: "Confirmation Required",
        description: "Please type the exact company name to confirm deletion",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.delete(`/super-admin/companies/${companyId}`);
      toast({
        title: "Company Deleted",
        description: "Company and all associated data has been removed successfully.",
      });
      navigate('/admin/companies');
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || "Failed to delete company",
        variant: "destructive",
      });
    }
  };

  const handleCreateDepartment = async () => {
    try {
      const response = await api.post(`/super-admin/companies/${companyId}/departments`, departmentFormData);
      
      if (response.data?.success) {
        toast({
          title: 'Success', 
          description: 'Department created successfully'
        });
        setShowDepartmentDialog(false);
        resetDepartmentForm();
        loadCompanyDetails();
      }
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        title: "Department Creation Failed",
        description: error.response?.data?.message || "Failed to create department",
        variant: "destructive",
      });
    }
  };

  const resetUserForm = () => {
    setUserFormData({
      name: '',
      email: '',
      password: 'TempPassword123!',
      password_confirm: 'TempPassword123!',
      role: 'participant',
      department_id: ''
    });
    setShowUserPassword(false);
    setCopiedUserPassword(false);
    setEditingUser(null);
    setDepartmentError(false);
  };

  const resetDepartmentForm = () => {
    setDepartmentFormData({
      name: ''
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200';
      case 'manager': return 'bg-gray-150 text-gray-800 dark:bg-gray-750 dark:text-gray-300';
      case 'participant': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'inactive': return 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/super-admin/companies')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {company?.logo_url ? (
                <img
                  src={getCompanyLogoUrl(company.logo_url)}
                  alt={`${company.name} logo`}
                  className="h-16 w-16 object-contain rounded border bg-white"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div className={`h-16 w-16 rounded border bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${company?.logo_url ? "hidden" : "flex"}`}>
                <Building className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{company?.name}</h1>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                <span>{company?.industry}</span>
                <span>•</span>
                <span>{company?.country}</span>
                <span>•</span>
                <span>{company?.size} employees</span>
                <Badge className={getStatusColor(company?.status)}>
                  {company?.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openEditCompanyDialog}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Company
            </Button>
          </div>
        </div>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{users.length}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {users.filter(u => u.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{departments.length}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Organizational units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{courses.length}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {courses.filter(c => c.is_published).length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Avg Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + c.completion_rate, 0) / courses.length) : 0}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Industry</Label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{company?.industry}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</Label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{company?.country}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Size</Label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{company?.size}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</Label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{company?.description || 'No description provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</Label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(company?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {getActivityIcon(activity.type)}
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-100">{activity.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatActivityTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                      <p className="text-xs text-gray-400">Activity will appear here as users interact with the platform</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Company Users</h3>
            <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-w-[90vw]">
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Update user account information.' : 'Create a new user account for this company.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="user-name">Name *</Label>
                    <Input
                      id="user-name"
                      value={userFormData.name}
                      onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-email">Email *</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      placeholder="john.doe@company.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="user-role">Role *</Label>
                      <Select 
                        value={userFormData.role}
                        onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="participant">Participant</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="user-department">Department *</Label>
                      <Select 
                        value={userFormData.department_id}
                        onValueChange={(value) => {
                          setUserFormData({ ...userFormData, department_id: value });
                          setDepartmentError(false);
                        }}
                      >
                        <SelectTrigger className={departmentError ? "border-red-500 focus:border-red-500" : ""}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Password Section */}
                  <div className='space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900'>
                    <h4 className='font-medium text-sm text-gray-700 dark:text-gray-300'>
                      User Account Password
                    </h4>
                    <div className='grid grid-cols-1 gap-4'>
                      <div>
                        <Label htmlFor='user-password'>Password *</Label>
                        <div className='flex gap-2'>
                          <Input
                            id='user-password'
                            type={showUserPassword ? 'text' : 'password'}
                            value={userFormData.password}
                            onChange={(e) =>
                              setUserFormData({
                                ...userFormData,
                                password: e.target.value,
                              })
                            }
                            placeholder='Strong password'
                            className='flex-1'
                          />
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => setShowUserPassword(!showUserPassword)}
                            className='flex-shrink-0'
                          >
                            {showUserPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                          </Button>
                          {userFormData.password && (
                            <Button
                              type='button'
                              variant='outline'
                              onClick={handleCopyUserPassword}
                              className='flex-shrink-0'
                            >
                              {copiedUserPassword ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                            </Button>
                          )}
                          <Button
                            type='button'
                            variant='outline'
                            onClick={handleGenerateUserPassword}
                            className='flex-shrink-0'
                          >
                            <RefreshCw className='h-4 w-4 mr-1' />
                            Generate
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor='user-password-confirm'>Confirm Password *</Label>
                        <Input
                          id='user-password-confirm'
                          type={showUserPassword ? 'text' : 'password'}
                          value={userFormData.password_confirm}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              password_confirm: e.target.value,
                            })
                          }
                          placeholder='Repeat password'
                        />
                        {userFormData.password && userFormData.password_confirm && 
                          userFormData.password !== userFormData.password_confirm && (
                          <p className='text-xs text-red-500 mt-1'>
                            Passwords do not match
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">User will be prompted to change password on first login</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {setShowUserDialog(false); resetUserForm(); setEditingUser(null);}}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser}>
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {user.department?.name || 'No department'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Recently'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Departments</h3>
            <Dialog open={showDepartmentDialog} onOpenChange={setShowDepartmentDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-w-[90vw]">
                <DialogHeader>
                  <DialogTitle>Add New Department</DialogTitle>
                  <DialogDescription>
                    Create a new department for this company.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="dept-name">Department Name *</Label>
                    <Input
                      id="dept-name"
                      value={departmentFormData.name}
                      onChange={(e) => setDepartmentFormData({ ...departmentFormData, name: e.target.value })}
                      placeholder="e.g., Marketing"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {setShowDepartmentDialog(false); resetDepartmentForm();}}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDepartment}>
                    Create Department
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((department) => (
              <Card key={department.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">{department.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDepartment(department)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {department.user_count || 0} users
                    </span>
                  </div>
                  {department.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {department.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Company Courses</h3>
            <Button onClick={() => navigate('/admin/courses')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-center">Lessons</TableHead>
                    <TableHead className="text-center">Enrolled</TableHead>
                    <TableHead className="text-center">Completion</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{course.title}</div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{course.category}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{course.difficulty}</TableCell>
                      <TableCell className="text-center">
                        {course.is_assigned ? (
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            Assigned
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Own
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          {getLessonCount(course)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {course.enrolled_count || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{course.completion_rate || 0}%</TableCell>
                      <TableCell>
                        <Badge className={course.is_published ? 'bg-gray-100 text-gray-800' : 'bg-gray-200 text-gray-600'}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Management</CardTitle>
              <CardDescription>
                Manage company lifecycle and advanced operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Danger Zone
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Once you delete a company, there is no going back. Please be certain.
                    </p>
                    <div className="mt-3">
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Company
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Company Dialog */}
      <Dialog open={showEditCompanyDialog} onOpenChange={setShowEditCompanyDialog}>
        <DialogContent className="sm:max-w-[600px] max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update company information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Company Name</Label>
                <Input
                  id="edit-name"
                  value={editCompanyData.name}
                  onChange={(e) => setEditCompanyData({...editCompanyData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Company Slug</Label>
                <Input
                  id="edit-slug"
                  value={editCompanyData.slug}
                  onChange={(e) => setEditCompanyData({...editCompanyData, slug: e.target.value})}
                  placeholder="company-slug"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-industry">Industry</Label>
                <Select
                  value={editCompanyData.industry}
                  onValueChange={(value) => setEditCompanyData({...editCompanyData, industry: value})}
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
              <div>
                <Label htmlFor="edit-country">Country</Label>
                <Select
                  value={editCompanyData.country}
                  onValueChange={(value) => setEditCompanyData({...editCompanyData, country: value})}
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
            </div>
            <div>
              <Label htmlFor="edit-size">Company Size</Label>
              <Select
                value={editCompanyData.size}
                onValueChange={(value) => setEditCompanyData({...editCompanyData, size: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="edit-logo">Company Logo</Label>
            <div className="flex items-center gap-4 mt-2">
              {company?.logo_url && (
                <img
                  src={getCompanyLogoUrl(company.logo_url)}
                  alt={`${company.name} logo`}
                  className="h-12 w-12 object-contain rounded border bg-white"
                />
              )}
              <Input
                id="edit-logo"
                type="file"
                accept="image/*"
                onChange={(e) => setEditCompanyData({...editCompanyData, logo: e.target.files[0]})}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Upload a new logo (PNG, JPG, max 2MB)</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditCompanyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCompany}>Update Company</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Company Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px] max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">Delete Company</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the company and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Warning
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    This will permanently delete:
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 mt-2 ml-4 list-disc">
                    <li>All company users and their data</li>
                    <li>All company courses and content</li>
                    <li>All departments and assignments</li>
                    <li>All company settings and configurations</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">
                Type <strong>{company?.name}</strong> to confirm deletion:
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={`Type "${company?.name}" here`}
                className="border-red-200 dark:border-red-800 focus:border-red-500 dark:focus:border-red-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteCompany}
              disabled={deleteConfirmation !== company?.name}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showUserDeleteDialog} onOpenChange={setShowUserDeleteDialog}>
        <DialogContent className="sm:max-w-[500px] max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">Delete User</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user and all their data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Warning
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    This will permanently delete:
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 mt-2 ml-4 list-disc">
                    <li>User account and profile data</li>
                    <li>All user progress and course completions</li>
                    <li>All user-generated content</li>
                    <li>All user settings and preferences</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-delete-confirmation">
                Type <strong>{userToDelete?.name}</strong> to confirm deletion:
              </Label>
              <Input
                id="user-delete-confirmation"
                value={userDeleteConfirmation}
                onChange={(e) => setUserDeleteConfirmation(e.target.value)}
                placeholder={`Type "${userToDelete?.name}" here`}
                className="border-red-200 dark:border-red-800 focus:border-red-500 dark:focus:border-red-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUserDeleteDialog(false);
                setUserDeleteConfirmation('');
                setUserToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={userDeleteConfirmation !== userToDelete?.name}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Department Dialog */}
      <Dialog open={showDepartmentDeleteDialog} onOpenChange={setShowDepartmentDeleteDialog}>
        <DialogContent className="sm:max-w-[500px] max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">Delete Department</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Users in this department will need to be reassigned.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Warning
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    This will permanently delete:
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 mt-2 ml-4 list-disc">
                    <li>Department and all its data</li>
                    <li>Department assignments and configurations</li>
                    <li>Users will need to be reassigned to other departments</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-delete-confirmation">
                Type <strong>{departmentToDelete?.name}</strong> to confirm deletion:
              </Label>
              <Input
                id="department-delete-confirmation"
                value={departmentDeleteConfirmation}
                onChange={(e) => setDepartmentDeleteConfirmation(e.target.value)}
                placeholder={`Type "${departmentToDelete?.name}" here`}
                className="border-red-200 dark:border-red-800 focus:border-red-500 dark:focus:border-red-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDepartmentDeleteDialog(false);
                setDepartmentDeleteConfirmation('');
                setDepartmentToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteDepartment}
              disabled={departmentDeleteConfirmation !== departmentToDelete?.name}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
    </DashboardLayout>
  );
}

export default CompanyDetailPage;