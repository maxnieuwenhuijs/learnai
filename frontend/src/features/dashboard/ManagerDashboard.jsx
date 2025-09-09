import { useState, useEffect } from 'react';
import { reportsApi } from '@/api/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  BookOpen,
  Activity,
  BarChart3,
  ChevronRight,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ManagerDashboard() {
  const [teamData, setTeamData] = useState({
    totalMembers: 0,
    activeMembers: 0,
    avgCompletion: 0,
    totalCertificates: 0
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getTeamProgress();
      
      if (response?.data) {
        setTeamData(response.data.stats || {
          totalMembers: 0,
          activeMembers: 0,
          avgCompletion: 0,
          totalCertificates: 0
        });
        setTeamMembers(response.data.members || []);
      } else {
        // Start completely empty
        setTeamData({
          totalMembers: 0,
          activeMembers: 0,
          avgCompletion: 0,
          totalCertificates: 0
        });
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      // Start completely empty
      setTeamData({
        totalMembers: 0,
        activeMembers: 0,
        avgCompletion: 0,
        totalCertificates: 0
      });
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (progress) => {
    if (progress >= 100) return <Badge variant="default">Completed</Badge>;
    if (progress >= 75) return <Badge variant="secondary">Almost Done</Badge>;
    if (progress >= 50) return <Badge variant="outline">In Progress</Badge>;
    if (progress > 0) return <Badge variant="outline">Started</Badge>;
    return <Badge variant="outline">Not Started</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-100">Manager Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor your team's learning progress and performance</p>
      </div>

      {/* Team Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{teamData.totalMembers}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{teamData.activeMembers} active</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Completion</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{teamData.avgCompletion}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Team average</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Certificates</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{teamData.totalCertificates}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Earned by team</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">0</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">In progress</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team Progress</CardTitle>
            <CardDescription>Individual progress for each team member</CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No team members yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Add team members to track their progress</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{member.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{member.progress}%</p>
                      {getStatusBadge(member.progress)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
            <CardDescription>Manage your team and courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="default" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              View All Team Members
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="w-4 h-4 mr-2" />
              Assign Courses
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Reports
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Target className="w-4 h-4 mr-2" />
              Set Goals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}