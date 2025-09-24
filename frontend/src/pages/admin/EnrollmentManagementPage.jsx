import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Users, BookOpen, Calendar, Trash2, Edit, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/config';

const statusColors = {
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

const statusIcons = {
  assigned: Clock,
  in_progress: BookOpen,
  completed: CheckCircle,
  overdue: AlertCircle,
  cancelled: XCircle
};

export function EnrollmentManagementPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUnenrollDialogOpen, setIsUnenrollDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignmentType, setAssignmentType] = useState('user'); // 'user' | 'department'
  const [updateData, setUpdateData] = useState({
    status: '',
    completionPercentage: '',
    notes: ''
  });
  const [assignData, setAssignData] = useState({
    userId: '',
    courseId: '',
    dueDate: '',
    notes: '',
    departmentId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEnrollments(),
        loadCourses(),
        loadUsers(),
        loadDepartments()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async () => {
    try {
      const response = await api.get('/admin/enrollments');
      if (response.data.success) {
        setEnrollments(response.data.enrollments);
      }
    } catch (error) {
      console.error('Error loading enrollments:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      if (response.data.success) {
        setCourses(response.data.data.courses);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await api.get('/admin/departments');
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleUpdateEnrollment = async () => {
    try {
      const response = await api.put(`/admin/enrollments/${selectedEnrollment.id}`, {
        status: updateData.status,
        completionPercentage: parseFloat(updateData.completionPercentage),
        notes: updateData.notes
      });

      if (response.data.success) {
        await loadEnrollments();
        setIsUpdateDialogOpen(false);
        setSelectedEnrollment(null);
        setUpdateData({ status: '', completionPercentage: '', notes: '' });
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
    }
  };

  const handleUnenroll = async () => {
    try {
      const response = await api.delete(`/admin/enrollments/${selectedEnrollment.id}`);

      if (response.data.success) {
        await loadEnrollments();
        setIsUnenrollDialogOpen(false);
        setSelectedEnrollment(null);
      }
    } catch (error) {
      console.error('Error unenrolling user:', error);
    }
  };

  const openAssignDialog = () => {
    setAssignmentType('user');
    setAssignData({ userId: '', courseId: '', departmentId: '', dueDate: '', notes: '' });
    setIsAssignDialogOpen(true);
  };

  const handleAssignEnrollment = async () => {
    try {
      if (!assignData.courseId) return;

      let response;

      if (assignmentType === 'department') {
        if (!assignData.departmentId) return;
        const departmentIds = [parseInt(assignData.departmentId, 10)];
        response = await api.post(`/admin/courses/${parseInt(assignData.courseId, 10)}/assign`, {
          userIds: [],
          departmentIds
        });
      } else {
        if (!assignData.userId) return;
        const payload = {
          userId: parseInt(assignData.userId, 10),
          courseId: parseInt(assignData.courseId, 10),
          dueDate: assignData.dueDate || null,
          notes: assignData.notes || ''
        };
        response = await api.post('/admin/enrollments', payload);
      }
      if (response.data.success) {
        await loadEnrollments();
        setIsAssignDialogOpen(false);
        setAssignData({ userId: '', courseId: '', departmentId: '', dueDate: '', notes: '' });
      }
    } catch (error) {
      console.error('Error assigning enrollment:', error);
    }
  };

  const openUpdateDialog = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setUpdateData({
      status: enrollment.status,
      completionPercentage: enrollment.completion_percentage.toString(),
      notes: enrollment.notes || ''
    });
    setIsUpdateDialogOpen(true);
  };

  const openUnenrollDialog = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsUnenrollDialogOpen(true);
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || enrollment.course_id.toString() === courseFilter;

    return matchesSearch && matchesStatus && matchesCourse;
  });

  const getStatusIcon = (status) => {
    const IconComponent = statusIcons[status] || Clock;
    return <IconComponent className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading enrollments...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Enrollment Management</h1>
            <p className="text-muted-foreground">
              Manage user course enrollments and track progress
            </p>
          </div>
          <div>
            <Button onClick={openAssignDialog} className="flex items-center gap-2">
              Assign Enrollment
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search users or courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="course">Course</Label>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={loadEnrollments} variant="outline" className="w-full">
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollments ({filteredEnrollments.length})</CardTitle>
            <CardDescription>
              Manage user course enrollments and track their progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{enrollment.user?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {enrollment.user?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{enrollment.course?.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {enrollment.course?.difficulty} • {enrollment.course?.duration_hours}h
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[enrollment.status]}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(enrollment.status)}
                          {enrollment.status.replace('_', ' ')}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${enrollment.completion_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{enrollment.completion_percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(enrollment.assigned_at)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        by {enrollment.assigner?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {enrollment.due_date ? (
                        <div className="text-sm">
                          {formatDate(enrollment.due_date)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No due date</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUpdateDialog(enrollment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openUnenrollDialog(enrollment)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredEnrollments.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No enrollments found</h3>
                <p className="text-muted-foreground">
                  No enrollments match your current filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Enrollment Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Enrollment</DialogTitle>
              <DialogDescription>
                Update the status and progress for {selectedEnrollment?.user?.name}'s enrollment in {selectedEnrollment?.course?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={updateData.status} 
                  onValueChange={(value) => setUpdateData({...updateData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="completion">Completion Percentage</Label>
                <Input
                  id="completion"
                  type="number"
                  min="0"
                  max="100"
                  value={updateData.completionPercentage}
                  onChange={(e) => setUpdateData({...updateData, completionPercentage: e.target.value})}
                  placeholder="0-100"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={updateData.notes}
                  onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                  placeholder="Add notes about this enrollment..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateEnrollment}>
                Update Enrollment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unenroll Dialog */}
        <Dialog open={isUnenrollDialogOpen} onOpenChange={setIsUnenrollDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unenroll User</DialogTitle>
              <DialogDescription>
                Are you sure you want to unenroll {selectedEnrollment?.user?.name} from {selectedEnrollment?.course?.title}? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUnenrollDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleUnenroll}>
                Unenroll User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Enrollment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Enrollment</DialogTitle>
              <DialogDescription>
                Select a user and a course to create a new enrollment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Assign to</Label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="assignmentType"
                      value="user"
                      checked={assignmentType === 'user'}
                      onChange={() => setAssignmentType('user')}
                    />
                    Single user
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="assignmentType"
                      value="department"
                      checked={assignmentType === 'department'}
                      onChange={() => setAssignmentType('department')}
                    />
                    Entire department
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="assign-course">Course</Label>
                <Select 
                  value={assignData.courseId}
                  onValueChange={(value) => setAssignData({ ...assignData, courseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {assignmentType === 'user' && (
                <>
                  <div>
                    <Label htmlFor="assign-user">User</Label>
                    <Select 
                      value={assignData.userId}
                      onValueChange={(value) => setAssignData({ ...assignData, userId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id.toString()}>
                            {u.name} ({u.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assign-due">Due date (optional)</Label>
                    <Input
                      id="assign-due"
                      type="date"
                      value={assignData.dueDate}
                      onChange={(e) => setAssignData({ ...assignData, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assign-notes">Notes (optional)</Label>
                    <Textarea
                      id="assign-notes"
                      value={assignData.notes}
                      onChange={(e) => setAssignData({ ...assignData, notes: e.target.value })}
                      rows={3}
                      placeholder="Any additional context..."
                    />
                  </div>
                </>
              )}

              {assignmentType === 'department' && (
                <div>
                  <Label htmlFor="assign-dept">Department</Label>
                  <Select 
                    value={assignData.departmentId || 'none'}
                    onValueChange={(value) => setAssignData({ ...assignData, departmentId: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select a department</SelectItem>
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignEnrollment} 
                disabled={
                  !assignData.courseId || 
                  (assignmentType === 'user' && !assignData.userId) ||
                  (assignmentType === 'department' && !assignData.departmentId)
                }>
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
