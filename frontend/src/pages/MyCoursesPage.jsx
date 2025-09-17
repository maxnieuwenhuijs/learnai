import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, Award, Play, Search, Filter, Calendar, Target, TrendingUp, Users, BookMarked, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { coursesApi } from '@/api/courses';

export function MyCoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [activeTab, setActiveTab] = useState('in-progress');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesApi.getAssignedCourses();
      
      // Transform API response to match expected format
      const transformedCourses = response.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category || 'general',
        duration: course.estimatedDuration || '0 hours',
        modules: course.totalLessons || 0,
        completedModules: course.completedLessons || 0,
        progress: course.progressPercentage || 0,
        status: course.status || 'not-started',
        deadline: course.deadline,
        instructor: course.instructor,
        difficulty: course.difficulty || 'beginner',
        lastAccessed: course.lastAccessed,
        nextLesson: course.nextLesson,
        estimatedCompletion: course.estimatedCompletion,
        thumbnail: course.thumbnail,
        enrolled: course.enrolledCount || 0,
        rating: course.rating || 0,
        certificate: course.hasCertificate || false,
        certificateEarned: course.certificateEarned || false,
        finalScore: course.finalScore,
        quizScore: course.quizScore,
        completedDate: course.completedDate
      }));

      setCourses(transformedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
      // Fallback to empty array on error
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'in-progress' && course.status === 'in-progress') ||
                      (activeTab === 'completed' && course.status === 'completed') ||
                      (activeTab === 'not-started' && course.status === 'not-started');
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastAccessed || b.deadline) - new Date(a.lastAccessed || a.deadline);
      case 'deadline':
        return new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31');
      case 'progress':
        return b.progress - a.progress;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100';
      case 'in-progress': return 'bg-gray-150 dark:bg-gray-750 text-gray-800 dark:text-gray-200';
      case 'not-started': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      case 'intermediate': return 'bg-gray-150 dark:bg-gray-750 text-gray-800 dark:text-gray-200';
      case 'advanced': return 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'compliance': return <BookMarked className="h-4 w-4" />;
      case 'technical': return <Target className="h-4 w-4" />;
      case 'ethics': return <Users className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const stats = {
    totalCourses: courses.length,
    completedCourses: courses.filter(c => c.status === 'completed').length,
    inProgressCourses: courses.filter(c => c.status === 'in-progress').length,
    totalHours: courses.reduce((sum, c) => sum + parseFloat(c.duration), 0),
    averageProgress: Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length),
    certificatesEarned: courses.filter(c => c.certificateEarned).length
  };

  const handleStartCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleViewCertificate = (courseId) => {
    navigate(`/certificates?courseId=${courseId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-8 tracking-tight">My Learning Journey</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Total Courses</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalCourses}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Completed</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.completedCourses}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">In Progress</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.inProgressCourses}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Total Hours</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalHours.toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Avg Progress</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.averageProgress}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Certificates</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.certificatesEarned}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 ease-apple focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-[200px] rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-650 transition-all duration-200 ease-apple">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-gray-200 dark:border-gray-600">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="ethics">Ethics</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px] rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-650 transition-all duration-200 ease-apple">
              <TrendingUp className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-gray-200 dark:border-gray-600">
              <SelectItem value="recent">Recently Accessed</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-4">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="not-started">Not Started</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {sortedCourses.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search terms</p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription className="mt-2">{course.description}</CardDescription>
                        </div>
                        {course.certificateEarned && (
                          <Award className="h-5 w-5 text-yellow-500 ml-2" />
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge className={getStatusColor(course.status)}>
                          {course.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getCategoryIcon(course.category)}
                          {course.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <span>{course.completedModules}/{course.modules} modules</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{course.duration}</span>
                          </div>
                          {course.deadline && (
                            <div className="flex items-center gap-1 col-span-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>Due: {new Date(course.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {course.status === 'in-progress' && course.nextLesson && (
                          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Next lesson:</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100">{course.nextLesson}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">~{course.estimatedCompletion} to complete</p>
                          </div>
                        )}

                        {course.status === 'completed' && (
                          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Completed on</p>
                                <p className="text-sm text-gray-900 dark:text-gray-100">{new Date(course.completedDate).toLocaleDateString()}</p>
                              </div>
                              {course.finalScore && (
                                <div className="text-right">
                                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Final Score</p>
                                  <p className="text-sm text-gray-900 dark:text-gray-100 font-bold">{course.finalScore}%</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>By {course.instructor}</span>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{course.enrolled}</span>
                            <span>•</span>
                            <span>⭐ {course.rating}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {course.status === 'completed' && course.certificateEarned ? (
                        <Button 
                          onClick={() => handleViewCertificate(course.id)} 
                          className="w-full"
                          variant="outline"
                        >
                          <Award className="mr-2 h-4 w-4" />
                          View Certificate
                        </Button>
                      ) : course.status === 'not-started' ? (
                        <Button 
                          onClick={() => handleStartCourse(course.id)} 
                          className="w-full"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Course
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleStartCourse(course.id)} 
                          className="w-full"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Continue Learning
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}