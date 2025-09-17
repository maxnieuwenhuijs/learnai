import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  CheckCircle, 
  TrendingUp,
  Clock
} from 'lucide-react';
import api from '@/api/config';

export function CourseProgressAnalytics({ courseId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [courseId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/super-admin/courses/${courseId}/analytics`);
      setAnalytics(response.data.analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-64 bg-muted rounded-lg mt-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const { 
    courseTitle, 
    totalLessons, 
    totalUsers, 
    averageCompletionRate, 
    completionByLesson, 
    completionByUser,
    totalCompletions 
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Lessons</p>
                <p className="text-2xl font-bold">{totalLessons}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">{averageCompletionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Completions</p>
                <p className="text-2xl font-bold">{totalCompletions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Completion Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Lesson Completion Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(completionByLesson).map(([lessonId, stats]) => (
              <div key={lessonId} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Lesson {lessonId}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {stats.completed}/{stats.total} users
                    </Badge>
                    <span className="text-sm font-medium">{stats.completionRate}%</span>
                  </div>
                </div>
                <Progress value={stats.completionRate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completionByUser.slice(0, 10).map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{user.completed}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">User {index + 1}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.completed} of {user.total} lessons completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={user.completionRate} className="w-20 h-2" />
                  <span className="text-sm font-medium w-12 text-right">{user.completionRate}%</span>
                </div>
              </div>
            ))}
            {completionByUser.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing first 10 users of {completionByUser.length} total
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
