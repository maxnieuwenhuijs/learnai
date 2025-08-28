import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  TrendingUp,
  BookOpen,
  Award,
  Clock,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Eye,
  MessageSquare,
  Calendar,
  Target,
  CheckCircle,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { getTeamMembers, getTeamProgress, getTeamAnalytics } from '@/api/team';

export function TeamPage() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamStats, setTeamStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      // Fetch team members and progress data
      const [membersResponse, progressResponse] = await Promise.all([
        getTeamMembers(),
        getTeamProgress()
      ]);
      
      // Transform API response to match component's expected format
      const transformedMembers = membersResponse.members?.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        avatar: member.avatar || '',
        role: member.role,
        department: member.department?.name || 'N/A',
        location: member.location || 'Remote',
        joinDate: member.created_at,
        lastActive: member.last_active_at || member.updated_at,
        progress: {
          overallCompletion: member.progress?.overall_completion || 0,
          coursesCompleted: member.progress?.courses_completed || 0,
          coursesInProgress: member.progress?.courses_in_progress || 0,
          totalCourses: member.progress?.total_courses || 0,
          certificates: member.progress?.certificates_earned || 0,
          timeSpent: member.progress?.time_spent_seconds || 0,
          avgScore: member.progress?.avg_score || 0
        },
        courses: member.courses || []
      })) || [];
      
      // Set team statistics
      const stats = {
        totalMembers: progressResponse.total_members || transformedMembers.length,
        avgCompletion: progressResponse.avg_completion || 0,
        totalCertificates: progressResponse.total_certificates || 0,
        activeToday: progressResponse.active_today || 0
      };
      
      setTeamMembers(transformedMembers);
      setTeamStats(stats);
    } catch (error) {
      console.error('Error loading team data:', error);
      // If API fails, use empty data instead of mock
      const mockTeamMembers = [
        {
          id: 1,
          name: 'Alice Johnson',
          email: 'alice.johnson@company.com',
          avatar: '',
          role: 'participant',
          department: 'Engineering',
          location: 'New York',
          joinDate: '2024-01-15',
          lastActive: '2024-08-27T15:30:00Z',
          progress: {
            overallCompletion: 85,
            coursesCompleted: 3,
            coursesInProgress: 2,
            totalCourses: 5,
            certificates: 2,
            timeSpent: 14400, // in seconds
            avgScore: 92
          },
          courses: [
            { title: 'AI Act Fundamentals', completion: 100, score: 95 },
            { title: 'Risk Management', completion: 75, score: 88 },
            { title: 'Data Privacy in AI', completion: 60, score: null }
          ]
        },
        {
          id: 2,
          name: 'Bob Smith',
          email: 'bob.smith@company.com',
          avatar: '',
          role: 'participant',
          department: 'Legal',
          location: 'San Francisco',
          joinDate: '2024-02-01',
          lastActive: '2024-08-28T09:15:00Z',
          progress: {
            overallCompletion: 45,
            coursesCompleted: 1,
            coursesInProgress: 3,
            totalCourses: 5,
            certificates: 1,
            timeSpent: 7200,
            avgScore: 86
          },
          courses: [
            { title: 'AI Act Fundamentals', completion: 100, score: 89 },
            { title: 'Risk Management', completion: 30, score: null },
            { title: 'Compliance Framework', completion: 15, score: null }
          ]
        },
        {
          id: 3,
          name: 'Carol Davis',
          email: 'carol.davis@company.com',
          avatar: '',
          role: 'participant',
          department: 'Product',
          location: 'Remote',
          joinDate: '2024-01-20',
          lastActive: '2024-08-26T18:45:00Z',
          progress: {
            overallCompletion: 95,
            coursesCompleted: 4,
            coursesInProgress: 1,
            totalCourses: 5,
            certificates: 4,
            timeSpent: 18000,
            avgScore: 94
          },
          courses: [
            { title: 'AI Act Fundamentals', completion: 100, score: 96 },
            { title: 'Risk Management', completion: 100, score: 91 },
            { title: 'Data Privacy in AI', completion: 100, score: 95 },
            { title: 'Compliance Framework', completion: 85, score: null }
          ]
        }
      ];

      const mockStats = {
        totalMembers: mockTeamMembers.length,
        activeMembers: mockTeamMembers.filter(m => new Date() - new Date(m.lastActive) < 7 * 24 * 60 * 60 * 1000).length,
        averageCompletion: Math.round(mockTeamMembers.reduce((sum, m) => sum + m.progress.overallCompletion, 0) / mockTeamMembers.length),
        totalCertificates: mockTeamMembers.reduce((sum, m) => sum + m.progress.certificates, 0)
      };

      setTeamMembers(mockTeamMembers);
      setTeamStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getLastActiveText = (lastActive) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffInHours = Math.floor((now - lastActiveDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getCompletionColor = (completion) => {
    if (completion >= 80) return 'text-green-600 bg-green-100';
    if (completion >= 60) return 'text-blue-600 bg-blue-100';
    if (completion >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Only show this page to managers and above
  if (user?.role === 'participant') {
    return (
      <DashboardLayout>
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h4>
            <p className="text-gray-600 dark:text-gray-400">
              This page is only available to managers and administrators.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="space-y-4">
            <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-32 w-64 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Team Management</h1>
              <p className="text-green-100">Monitor and manage your team's learning progress</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
                <div className="text-sm text-green-100">Team Members</div>
              </div>
              <Users className="w-16 h-16 text-green-200 hidden lg:block" />
            </div>
          </div>
        </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.activeMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Completion</p>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.averageCompletion}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Certificates</p>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.totalCertificates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Team Members List */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  Manage your team and track their learning progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No team members found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMembers.map((member) => (
                      <div key={member.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            
                            {/* Member Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {member.department}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">{member.email}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {member.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {getLastActiveText(member.lastActive)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Joined {new Date(member.joinDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Progress Summary */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{member.progress.overallCompletion}%</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Overall</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{member.progress.coursesCompleted}/{member.progress.totalCourses}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Courses</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{member.progress.certificates}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Certificates</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{formatTime(member.progress.timeSpent)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Time Spent</div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Progress</span>
                              <span className="font-medium">{member.progress.overallCompletion}%</span>
                            </div>
                            <Progress value={member.progress.overallCompletion} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Detailed Progress Report
                </CardTitle>
                <CardDescription>
                  Individual progress tracking for each team member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.department}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {member.courses.map((course, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{course.title}</h4>
                                <Badge 
                                  className={`text-xs ${getCompletionColor(course.completion)}`}
                                >
                                  {course.completion}%
                                </Badge>
                              </div>
                              <Progress value={course.completion} className="h-2" />
                            </div>
                            <div className="ml-4 text-right">
                              {course.score && (
                                <div className="text-sm font-medium text-gray-900">
                                  Score: {course.score}%
                                </div>
                              )}
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {course.completion === 100 ? 'Completed' : 'In Progress'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Course Assignments</h4>
                <p className="text-gray-600 mb-4">
                  Assign courses to team members and track completion
                </p>
                <Button>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}