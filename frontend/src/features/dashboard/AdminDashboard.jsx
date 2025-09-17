import { useState, useEffect } from 'react';
import { reportsApi } from '@/api/reports';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award,
  Activity,
  Calendar,
  ChevronRight,
  MoreVertical,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCourses: 0,
    completionRate: 0,
    certificates: 0,
    totalPrompts: 0,
    promptUsage: 0
  });
  const [loading, setLoading] = useState(true);

  const recentActivities = [];
  const topCourses = [];

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Get dashboard stats from super admin API
      const data = await reportsApi.getDashboardStats();
      
      if (data.success && data.data) {
        setStats({
          totalUsers: data.data.totalUsers || 0,
          activeCourses: data.data.totalCourses || 0,
          completionRate: 0, // Will be calculated separately
          certificates: data.data.totalCertificates || 0,
          totalPrompts: 0, // Will be added later
          promptUsage: 0 // Will be added later
        });
      } else {
        console.error('Failed to load dashboard stats:', data.message);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor platform performance and user engagement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Platform wide</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{stats.activeCourses}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Currently published</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{stats.completionRate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Average across platform</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Certificates Issued</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{stats.certificates}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total earned</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prompt Templates</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{stats.totalPrompts}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{stats.promptUsage} total uses</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Courses */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Courses</CardTitle>
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {topCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No courses created yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Create your first course to see statistics</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topCourses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{course.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{course.enrolled} enrolled</p>
                      </div>
                      <div className="w-32">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Completion</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{course.completion}%</span>
                        </div>
                        <Progress value={course.completion} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Activity will appear as users engage with courses</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          <span className="font-medium">{activity.user}</span>{' '}
                          <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>{' '}
                          <span className="font-medium">{activity.course}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" className="w-full mt-4">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Quick Actions</h3>
              <p className="text-gray-600 dark:text-gray-400">Manage courses, users, and platform settings</p>
            </div>
            <div className="flex gap-3">
              <Button variant="default">
                Add Course
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Manage Prompts
              </Button>
              <Button variant="outline">
                Invite Users
              </Button>
              <Button variant="outline">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}