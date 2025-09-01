import { useState, useEffect } from 'react';
import { reportsApi } from '@/api/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Activity,
  BarChart3,
  ChevronRight,
  Target,
  Filter,
  Download,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export function ManagerDashboard() {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedMember, setExpandedMember] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      const response = await reportsApi.getTeamProgress();
      setTeamData(response);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberExpansion = (memberId) => {
    setExpandedMember(expandedMember === memberId ? null : memberId);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressIcon = (progress) => {
    if (progress >= 100) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (progress > 0) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = (progress) => {
    if (progress >= 100) return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
    if (progress >= 75) return <Badge className="bg-blue-100 text-blue-700">Almost Done</Badge>;
    if (progress >= 50) return <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>;
    if (progress > 0) return <Badge className="bg-orange-100 text-orange-700">Started</Badge>;
    return <Badge className="bg-gray-100 text-gray-700">Not Started</Badge>;
  };

  // Sample chart data - replace with actual data from API
  const progressChartData = [
    { name: 'Week 1', progress: 20, completed: 2 },
    { name: 'Week 2', progress: 35, completed: 5 },
    { name: 'Week 3', progress: 50, completed: 8 },
    { name: 'Week 4', progress: 65, completed: 12 },
    { name: 'Current', progress: 78, completed: 15 },
  ];

  const courseDistributionData = [
    { name: 'Completed', value: 35, color: '#22c55e' },
    { name: 'In Progress', value: 45, color: '#3b82f6' },
    { name: 'Not Started', value: 20, color: '#e5e7eb' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4">
          <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-32 w-64 rounded"></div>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No team data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Team Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Monitor your team's learning progress</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Team Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{teamData.aggregates.totalMembers}</p>
                <p className="text-xs text-gray-500 mt-2">Active learners</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{teamData.aggregates.averageProgress}%</p>
                <Progress value={teamData.aggregates.averageProgress} className="mt-3 h-2" />
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{teamData.aggregates.totalTimeSpentFormatted}</p>
                <p className="text-xs text-gray-500 mt-2">Combined learning</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{teamData.aggregates.totalCoursesCompleted}</p>
                <p className="text-xs text-gray-500 mt-2">Courses finished</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Prompts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">7</p>
                <p className="text-xs text-gray-500 mt-2">Available templates</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Progress Trend Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Team Progress Trend</CardTitle>
            <CardDescription>Weekly progress and completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={progressChartData}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorProgress)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Distribution Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Course Distribution</CardTitle>
            <CardDescription>Team course completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={courseDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {courseDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Individual progress and performance metrics</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamData.members.map((member) => (
              <div key={member.userId} className="border border-gray-200 rounded-lg hover:shadow-md transition-all">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.profilePicture} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {member.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {member.department}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {getProgressIcon(member.statistics.overallProgress)}
                          <span className={`text-xl font-bold ${getProgressColor(member.statistics.overallProgress)}`}>
                            {member.statistics.overallProgress}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {member.statistics.completedLessons}/{member.statistics.totalLessons} lessons completed
                        </p>
                      </div>

                      {getStatusBadge(member.statistics.overallProgress)}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMemberExpansion(member.userId)}
                      >
                        {expandedMember === member.userId ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </div>
                </div>
                
                {expandedMember === member.userId && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-600">Time Spent</p>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{member.statistics.totalTimeSpentFormatted}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-600">In Progress</p>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{member.statistics.coursesInProgress} courses</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-600">Completed</p>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{member.statistics.coursesCompleted} courses</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-600">Avg Score</p>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {member.statistics.averageQuizScore ? 
                            `${member.statistics.averageQuizScore}%` : 
                            'N/A'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {member.courses.length > 0 && (
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Course Progress</p>
                        <div className="space-y-3">
                          {member.courses.map((course) => (
                            <div key={course.courseId} className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                <BookOpen className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{course.courseTitle}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Progress 
                                  value={course.progressPercentage} 
                                  className="w-32 h-2"
                                />
                                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                                  {course.progressPercentage}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-6 text-center">
            <Button variant="outline" className="w-full max-w-xs">
              View All Team Members
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}