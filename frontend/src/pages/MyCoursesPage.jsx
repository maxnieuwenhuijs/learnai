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
      // This would be replaced with actual API call
      // const response = await api.getCourses();
      
      // Mock data for demonstration
      const mockCourses = [
        {
          id: 1,
          title: 'EU AI Act Fundamentals',
          description: 'Complete introduction to the European AI Act regulations and compliance requirements',
          category: 'compliance',
          duration: '4 hours',
          modules: 12,
          completedModules: 8,
          progress: 67,
          status: 'in-progress',
          deadline: '2024-09-15',
          instructor: 'Dr. Sarah Johnson',
          difficulty: 'beginner',
          lastAccessed: '2024-08-27',
          nextLesson: 'Module 9: Risk Assessment Framework',
          estimatedCompletion: '1.5 hours',
          thumbnail: '/api/placeholder/400/200',
          enrolled: 325,
          rating: 4.8,
          certificate: true,
          quizScore: 85
        },
        {
          id: 2,
          title: 'Risk Assessment for AI Systems',
          description: 'Learn to identify, evaluate and mitigate risks in AI implementations',
          category: 'technical',
          duration: '6 hours',
          modules: 15,
          completedModules: 15,
          progress: 100,
          status: 'completed',
          completedDate: '2024-08-20',
          instructor: 'Prof. Michael Chen',
          difficulty: 'intermediate',
          lastAccessed: '2024-08-20',
          thumbnail: '/api/placeholder/400/200',
          enrolled: 280,
          rating: 4.9,
          certificate: true,
          certificateEarned: true,
          finalScore: 92
        },
        {
          id: 3,
          title: 'Data Governance and AI Ethics',
          description: 'Comprehensive guide to ethical AI development and data management',
          category: 'ethics',
          duration: '5 hours',
          modules: 10,
          completedModules: 3,
          progress: 30,
          status: 'in-progress',
          deadline: '2024-10-01',
          instructor: 'Emma Williams',
          difficulty: 'intermediate',
          lastAccessed: '2024-08-25',
          nextLesson: 'Module 4: Privacy by Design',
          estimatedCompletion: '3.5 hours',
          thumbnail: '/api/placeholder/400/200',
          enrolled: 412,
          rating: 4.7,
          certificate: true,
          quizScore: null
        },
        {
          id: 4,
          title: 'Technical Documentation for AI Systems',
          description: 'Master the art of creating comprehensive technical documentation for AI projects',
          category: 'technical',
          duration: '3 hours',
          modules: 8,
          completedModules: 0,
          progress: 0,
          status: 'not-started',
          deadline: '2024-11-01',
          instructor: 'James Anderson',
          difficulty: 'advanced',
          thumbnail: '/api/placeholder/400/200',
          enrolled: 156,
          rating: 4.6,
          certificate: true
        },
        {
          id: 5,
          title: 'AI Act Compliance for Healthcare',
          description: 'Specialized training for AI compliance in healthcare applications',
          category: 'compliance',
          duration: '4.5 hours',
          modules: 11,
          completedModules: 11,
          progress: 100,
          status: 'completed',
          completedDate: '2024-08-10',
          instructor: 'Dr. Lisa Martinez',
          difficulty: 'advanced',
          thumbnail: '/api/placeholder/400/200',
          enrolled: 198,
          rating: 4.9,
          certificate: true,
          certificateEarned: true,
          finalScore: 88
        },
        {
          id: 6,
          title: 'Introduction to Machine Learning Safety',
          description: 'Foundational concepts in ML safety and robustness',
          category: 'technical',
          duration: '7 hours',
          modules: 18,
          completedModules: 5,
          progress: 28,
          status: 'in-progress',
          deadline: '2024-09-30',
          instructor: 'Dr. Robert Kim',
          difficulty: 'beginner',
          lastAccessed: '2024-08-26',
          nextLesson: 'Module 6: Adversarial Testing',
          estimatedCompletion: '5 hours',
          thumbnail: '/api/placeholder/400/200',
          enrolled: 567,
          rating: 4.8,
          certificate: true,
          quizScore: 78
        }
      ];

      setCourses(mockCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-6">My Learning Journey</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <p className="text-blue-100">Total Courses</p>
              <p className="text-2xl font-bold">{stats.totalCourses}</p>
            </div>
            <div>
              <p className="text-blue-100">Completed</p>
              <p className="text-2xl font-bold">{stats.completedCourses}</p>
            </div>
            <div>
              <p className="text-blue-100">In Progress</p>
              <p className="text-2xl font-bold">{stats.inProgressCourses}</p>
            </div>
            <div>
              <p className="text-blue-100">Total Hours</p>
              <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-blue-100">Avg Progress</p>
              <p className="text-2xl font-bold">{stats.averageProgress}%</p>
            </div>
            <div>
              <p className="text-blue-100">Certificates</p>
              <p className="text-2xl font-bold">{stats.certificatesEarned}</p>
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
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="ethics">Ethics</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <TrendingUp className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
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
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
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
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 font-medium">Next lesson:</p>
                            <p className="text-sm text-blue-900">{course.nextLesson}</p>
                            <p className="text-xs text-blue-600 mt-1">~{course.estimatedCompletion} to complete</p>
                          </div>
                        )}

                        {course.status === 'completed' && (
                          <div className="p-2 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-green-600 font-medium">Completed on</p>
                                <p className="text-sm text-green-900">{new Date(course.completedDate).toLocaleDateString()}</p>
                              </div>
                              {course.finalScore && (
                                <div className="text-right">
                                  <p className="text-xs text-green-600 font-medium">Final Score</p>
                                  <p className="text-sm text-green-900 font-bold">{course.finalScore}%</p>
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