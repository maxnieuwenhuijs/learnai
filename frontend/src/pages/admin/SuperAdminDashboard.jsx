import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Activity,
  Database,
  Settings,
  Plus,
  Eye,
  BarChart3,
  Clock
} from 'lucide-react';
import api from '@/api/config';

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    totalCourses: 0,
    totalCertificates: 0,
    activeCompanies: 0,
    trialCompanies: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from /api/super-admin/dashboard
      const response = await api.get('/super-admin/dashboard');
      
      if (response.data?.stats) {
        setStats(response.data.stats);
      } else {
        // Start completely empty
        setStats({
          totalCompanies: 0,
          totalUsers: 0,
          totalCourses: 0,
          totalCertificates: 0,
          activeCompanies: 0,
          trialCompanies: 0,
          recentActivity: []
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Start completely empty on error too
      setStats({
        totalCompanies: 0,
        totalUsers: 0,
        totalCourses: 0,
        totalCertificates: 0,
        activeCompanies: 0,
        trialCompanies: 0,
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'company_created': return Building;
      case 'user_completed_course': return BookOpen;
      case 'course_created': return Plus;
      case 'certificate_issued': return Award;
      default: return Activity;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'company_created': return 'text-gray-600 dark:text-gray-400';
      case 'user_completed_course': return 'text-gray-700 dark:text-gray-300';
      case 'course_created': return 'text-gray-600 dark:text-gray-400';
      case 'certificate_issued': return 'text-gray-700 dark:text-gray-300';
      default: return 'text-gray-500 dark:text-gray-400';
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
        <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Platform overview and management center
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{stats.totalCompanies}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stats.activeCompanies} active • {stats.trialCompanies} trial
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Platform Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{stats.totalUsers}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Across all companies</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{stats.totalCourses}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Global + company courses</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certificates Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{stats.totalCertificates}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">This month</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple" 
              onClick={() => navigate('/admin/super-admin/companies')}>
          <CardContent className="p-6 text-center">
            <Building className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Manage Companies</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create, edit and manage company accounts
            </p>
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple" 
              onClick={() => navigate('/admin/courses')}>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Global Courses</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Manage courses available to all companies
            </p>
            <Button variant="outline" className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple" 
              onClick={() => navigate('/admin/super-admin/analytics')}>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Platform Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              View platform-wide statistics and insights
            </p>
            <Button variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Recent Platform Activity
          </CardTitle>
          <CardDescription>
            Latest actions across all companies and users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            ) : (
              stats.recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="mt-1">
                      <Icon className={`h-5 w-5 ${getActivityColor(activity.type)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.company}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}

export default SuperAdminDashboard;