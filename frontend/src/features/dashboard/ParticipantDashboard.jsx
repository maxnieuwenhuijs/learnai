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
  Zap,
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
      const [coursesResponse, progressResponse] = await Promise.all([
        coursesApi.getAssignedCourses(),
        progressApi.getUserProgress()
      ]);

      setCourses(coursesResponse.courses || []);
      setUserProgress(progressResponse);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallProgress = () => {
    if (!courses.length) return 0;
    const totalProgress = courses.reduce((sum, course) => sum + course.progressPercentage, 0);
    return Math.round(totalProgress / courses.length);
  };

  const getTotalTimeSpent = () => {
    if (!userProgress?.progress) return 0;
    return userProgress.progress.reduce((sum, course) => sum + course.totalTimeSpent, 0);
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
    return courses.find(course => course.progressPercentage > 0 && course.progressPercentage < 100) 
      || courses.find(course => course.progressPercentage === 0);
  };

  const getCourseStatus = (progress) => {
    if (progress === 0) return { label: 'Not Started', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
    if (progress < 50) return { label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' };
    if (progress < 100) return { label: 'Almost Done', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' };
    return { label: 'Completed', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-48 rounded"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 w-64 rounded"></div>
        </div>
      </div>
    );
  }

  const nextCourse = getNextCourse();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section with Continue Learning */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="w-full lg:w-auto">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Welcome back!</h2>
            <p className="text-sm sm:text-base text-blue-100 mb-4 lg:mb-6">Continue your AI Act compliance training journey</p>
            
            {nextCourse && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 w-full sm:inline-block sm:w-auto">
                <p className="text-xs sm:text-sm text-blue-100 mb-2">Continue where you left off:</p>
                <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 line-clamp-1">{nextCourse.title}</h3>
                <Button 
                  className="bg-white text-indigo-600 hover:bg-gray-100 w-full sm:w-auto text-sm sm:text-base"
                  size="sm"
                  onClick={() => navigate(`/course/${nextCourse.id}`)}
                >
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 lg:w-16 lg:h-16 text-yellow-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-600">
                +5% this week
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{calculateOverallProgress()}%</p>
              <Progress value={calculateOverallProgress()} className="mt-3 h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{courses.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {courses.filter(c => c.progressPercentage === 100).length} completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-600">
                Active
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Invested</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatTime(getTotalTimeSpent())}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total learning time</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Certificates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {userProgress?.certificates?.length || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Achievements earned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Section with Modern Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">My Courses</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Continue your learning journey</p>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Browse Catalog <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {courses.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No courses yet</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Start your learning journey today</p>
              <Button>Browse Available Courses</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courses.map((course) => {
              const status = getCourseStatus(course.progressPercentage);
              return (
                <Card 
                  key={course.id} 
                  className="border-0 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white dark:bg-gray-800"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  {/* Course Image Placeholder */}
                  <div className="h-40 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-t-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                    {course.progressPercentage === 100 && (
                      <div className="absolute top-4 right-4">
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {course.progressPercentage}%
                          </span>
                        </div>
                        <Progress value={course.progressPercentage} className="h-2" />
                      </div>

                      {/* Course Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>~{course.estimatedTime || '2h'}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full group-hover:bg-indigo-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/course/${course.id}`);
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {course.progressPercentage === 0 ? 'Start Course' : 
                         course.progressPercentage === 100 ? 'Review Course' : 'Continue Learning'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificates Section */}
      {userProgress?.certificates && userProgress.certificates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Certificates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your achievements and certifications</p>
            </div>
            <Button variant="outline" size="sm">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {userProgress.certificates.map((cert) => (
              <Card key={cert.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{cert.courseTitle}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Issued on {new Date(cert.issuedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Certificate ID: {cert.certificateUid}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}