import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesApi } from '@/api/courses';
import { progressApi } from '@/api/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Award, 
  Play,
  Calendar,
  Target,
  ChevronRight,
  Star
} from 'lucide-react';

export function ParticipantDashboard() {
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, progressResponse] = await Promise.all([
        coursesApi.getAssignedCourses(),
        progressApi.getUserProgress()
      ]);

      // Ensure courses is always an array
      const coursesData = Array.isArray(coursesResponse) ? coursesResponse : [];
      setCourses(coursesData);
      setUserProgress(progressResponse || null);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Start completely empty
      setCourses([]);
      setUserProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallProgress = () => {
    if (!Array.isArray(courses) || !courses.length) return 0;
    const totalProgress = courses.reduce((sum, course) => sum + (course.progress || 0), 0);
    return Math.round(totalProgress / courses.length);
  };

  const getTotalTimeSpent = () => {
    if (!userProgress?.totalTimeSpent) return 0;
    return userProgress.totalTimeSpent;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getNextCourse = () => {
    if (!Array.isArray(courses)) return null;
    return courses.find(course => (course.progress || 0) > 0 && (course.progress || 0) < 100) 
      || courses.find(course => (course.progress || 0) === 0);
  };

  const getCourseStatus = (progress) => {
    if (progress === 0) return { label: 'Not Started', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' };
    if (progress < 50) return { label: 'In Progress', color: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' };
    if (progress < 100) return { label: 'Almost Done', color: 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100' };
    return { label: 'Completed', color: 'bg-gray-400 dark:bg-gray-500 text-gray-900 dark:text-gray-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  const nextCourse = getNextCourse();
  const overallProgress = calculateOverallProgress();
  const totalTimeSpent = getTotalTimeSpent();
  const completedCourses = Array.isArray(courses) ? courses.filter(c => (c.progress || 0) === 100).length : 0;
  const certificatesEarned = Array.isArray(courses) ? courses.filter(c => c.certificateEarned).length : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-100">Welcome back!</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Continue your learning journey</p>
      </div>

      {/* Continue Learning Section */}
      <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {nextCourse ? 'Continue Learning' : 'Ready to Start Learning?'}
              </h2>
              {nextCourse ? (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{nextCourse.title}</p>
                  <div className="flex items-center gap-4">
                    <Progress value={nextCourse.progress || 0} className="flex-1 max-w-xs" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {nextCourse.progress || 0}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">You don't have any assigned courses yet. Check with your manager or admin.</p>
              )}
            </div>
            <div>
              {nextCourse ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate(`/course/${nextCourse.id}`)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Continue Course
                </Button>
              ) : (
                <Button 
                  size="lg"
                  variant="outline" 
                  onClick={() => navigate('/courses')}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  View All Courses
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Array.isArray(courses) ? courses.length : 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Assigned Courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedCourses}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{certificatesEarned}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Certificates</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatTime(totalTimeSpent)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Courses</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {!Array.isArray(courses) || courses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No courses assigned yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Contact your manager to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(courses) ? courses.slice(0, 3).map((course) => {
                    const status = getCourseStatus(course.progress || 0);
                    return (
                      <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{course.title}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={status.color}>{status.label}</Badge>
                            <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{course.duration}</span>
                          </div>
                        </div>
                        <div className="w-32 ml-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{course.progress || 0}%</span>
                          </div>
                          <Progress value={course.progress || 0} className="h-2" />
                        </div>
                      </div>
                    );
                  }) : []}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Personal Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overallProgress}%</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completed Courses</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{completedCourses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Certificates Earned</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{certificatesEarned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Time Learning</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatTime(totalTimeSpent)}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => navigate('/certificates')}>
                <Award className="w-4 h-4 mr-2" />
                View Certificates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Quick Actions</h3>
              <p className="text-gray-600 dark:text-gray-400">Access your learning tools and resources</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="default" onClick={() => navigate('/courses')}>
                <BookOpen className="w-4 h-4 mr-2" />
                My Courses
              </Button>
              <Button variant="outline" onClick={() => navigate('/calendar')}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button variant="outline" onClick={() => navigate('/certificates')}>
                <Award className="w-4 h-4 mr-2" />
                Certificates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}