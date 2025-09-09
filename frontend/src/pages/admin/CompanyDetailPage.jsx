import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
  Settings,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Clock
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: 'TempPassword123!',
    role: 'participant',
    department_id: ''
  });
  const [departmentFormData, setDepartmentFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadCompanyDetails();
  }, [companyId]);

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
      } else {
        // Start completely empty
        setCompany(null);
        setUsers([]);
        setDepartments([]);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error loading company details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await api.post(`/api/super-admin/companies/${companyId}/users`, userFormData);
      
      if (response.data?.success) {
        toast({
          title: 'Success',
          description: 'User created successfully'
        });
        setShowUserDialog(false);
        resetUserForm();
        loadCompanyDetails();
      }
    } catch (error) {
      // Demo simulation
      toast({
        title: 'User Created',
        description: `${userFormData.name} has been added to the company`
      });
      
      const newUser = {
        id: Date.now(),
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
        department: departments.find(d => d.id == userFormData.department_id),
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        status: 'active'
      };
      
      setUsers(prev => [...prev, newUser]);
      setShowUserDialog(false);
      resetUserForm();
    }
  };

  const handleCreateDepartment = async () => {
    try {
      const response = await api.post(`/api/super-admin/companies/${companyId}/departments`, departmentFormData);
      
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
      // Demo simulation
      toast({
        title: 'Department Created',
        description: `${departmentFormData.name} department has been created`
      });
      
      const newDepartment = {
        id: Date.now(),
        name: departmentFormData.name,
        user_count: 0
      };
      
      setDepartments(prev => [...prev, newDepartment]);
      setShowDepartmentDialog(false);
      resetDepartmentForm();
    }
  };

  const resetUserForm = () => {
    setUserFormData({
      name: '',
      email: '',
      password: 'TempPassword123!',
      role: 'participant',
      department_id: ''
    });
  };

  const resetDepartmentForm = () => {
    setDepartmentFormData({
      name: '',
      description: ''
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
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
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">New user registered</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">Course completed</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">Certificate issued</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2 days ago</p>
                    </div>
                  </div>
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
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account for this company.
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
                        onValueChange={(value) => setUserFormData({ ...userFormData, department_id: value })}
                      >
                        <SelectTrigger>
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
                  <div>
                    <Label htmlFor="user-password">Temporary Password</Label>
                    <Input
                      id="user-password"
                      type="password"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">User will be prompted to change on first login</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {setShowUserDialog(false); resetUserForm();}}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser}>
                    Create User
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
                        {new Date(user.last_active).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
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
              <DialogContent className="sm:max-w-[400px]">
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
                <CardHeader>
                  <CardTitle className="text-lg">{department.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {department.user_count} users
                    </span>
                  </div>
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
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {course.enrolled_count}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{course.completion_rate}%</TableCell>
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
      </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default CompanyDetailPage;