import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award,
  Activity,
  Calendar,
  ChevronRight,
  MoreVertical
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
    totalUsers: 1234,
    activeCourses: 42,
    completionRate: 78,
    certificates: 856
  });

  const recentActivities = [
    {
      id: 1,
      user: 'John Doe',
      action: 'completed',
      course: 'EU AI Act Fundamentals',
      time: '2 hours ago'
    },
    {
      id: 2,
      user: 'Sarah Smith',
      action: 'started',
      course: 'Data Privacy Regulations',
      time: '3 hours ago'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'earned certificate',
      course: 'Compliance Training',
      time: '5 hours ago'
    }
  ];

  const topCourses = [
    { name: 'EU AI Act Fundamentals', enrolled: 450, completion: 85 },
    { name: 'Data Privacy Regulations', enrolled: 380, completion: 72 },
    { name: 'Compliance Training', enrolled: 320, completion: 90 },
    { name: 'Risk Management', enrolled: 280, completion: 68 }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor platform performance and user engagement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+12% from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activeCourses}</p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+3 new this week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completionRate}%</p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+5% improvement</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificates Issued</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.certificates}</p>
                <div className="flex items-center mt-2 text-sm">
                  <Award className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600">124 this month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Courses */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Top Courses</CardTitle>
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{course.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{course.enrolled} enrolled</p>
                    </div>
                    <div className="w-32">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Completion</span>
                        <span className="font-medium">{course.completion}%</span>
                      </div>
                      <Progress value={course.completion} className="h-2" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-4">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Course</DropdownMenuItem>
                        <DropdownMenuItem>View Reports</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-gray-600">{activity.action}</span>{' '}
                        <span className="font-medium">{activity.course}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-500 to-purple-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-2">Quick Actions</h3>
              <p className="text-indigo-100">Manage courses, users, and platform settings</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100">
                Add Course
              </Button>
              <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100">
                Invite Users
              </Button>
              <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}