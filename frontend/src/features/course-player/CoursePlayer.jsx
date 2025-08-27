import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesApi } from '@/api/courses';
import { progressApi } from '@/api/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, PlayCircle, ChevronLeft, ChevronRight, BookOpen, Video, FileText, FlaskConical } from 'lucide-react';
import { CourseSidebar } from './components/CourseSidebar';
import { LessonContent } from './components/LessonContent';
import { useCourseTracking } from './hooks/useCourseTracking';

export function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { startLesson, completeLesson, updateTimeSpent } = useCourseTracking(currentLesson?.id);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    if (currentLesson) {
      startLesson();
    }
  }, [currentLesson]);

  const loadCourse = async () => {
    try {
      const response = await coursesApi.getCourseDetails(courseId);
      setCourse(response.course);
      
      // Find the first incomplete lesson or start from beginning
      const firstIncompleteLesson = findFirstIncompleteLesson(response.course);
      if (firstIncompleteLesson) {
        setCurrentLesson(firstIncompleteLesson);
      } else if (response.course.modules[0]?.lessons[0]) {
        setCurrentLesson(response.course.modules[0].lessons[0]);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const findFirstIncompleteLesson = (course) => {
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.progress.status !== 'completed') {
          return { ...lesson, moduleId: module.id, moduleTitle: module.title };
        }
      }
    }
    return null;
  };

  const handleLessonSelect = (lesson, moduleId, moduleTitle) => {
    setCurrentLesson({ ...lesson, moduleId, moduleTitle });
  };

  const handleLessonComplete = async (quizScore = null) => {
    await completeLesson(quizScore);
    
    // Reload course to update progress
    await loadCourse();
    
    // Move to next lesson
    const nextLesson = findNextLesson();
    if (nextLesson) {
      setCurrentLesson(nextLesson);
    }
  };

  const findNextLesson = () => {
    if (!currentLesson || !course) return null;

    let foundCurrent = false;
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (foundCurrent) {
          return { ...lesson, moduleId: module.id, moduleTitle: module.title };
        }
        if (lesson.id === currentLesson.id) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };

  const findPreviousLesson = () => {
    if (!currentLesson || !course) return null;

    let previousLesson = null;
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.id === currentLesson.id) {
          return previousLesson;
        }
        previousLesson = { ...lesson, moduleId: module.id, moduleTitle: module.title };
      }
    }
    return null;
  };

  const calculateCourseProgress = () => {
    if (!course) return 0;
    
    let totalLessons = 0;
    let completedLessons = 0;
    
    course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        totalLessons++;
        if (lesson.progress.status === 'completed') {
          completedLessons++;
        }
      });
    });
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Course not found</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)] relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Hidden on mobile, toggle on desktop */}
      <div className={`${sidebarOpen ? 'w-full sm:w-80 lg:w-80' : 'w-0'} fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto transition-all duration-300 border-r bg-card lg:bg-background overflow-hidden h-full`}>
        <CourseSidebar
          course={course}
          currentLesson={currentLesson}
          onLessonSelect={handleLessonSelect}
          courseProgress={calculateCourseProgress()}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Course Header */}
        <div className="border-b bg-background px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <BookOpen className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-bold truncate">{course.title}</h1>
                {currentLesson && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {currentLesson.moduleTitle} • {currentLesson.title}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <Progress value={calculateCourseProgress()} className="w-24 sm:w-32" />
                <span className="text-xs sm:text-sm font-medium">{calculateCourseProgress()}%</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Exit Course</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {currentLesson ? (
            <LessonContent
              lesson={currentLesson}
              onComplete={handleLessonComplete}
              onTimeUpdate={updateTimeSpent}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Select a lesson to begin</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Footer */}
        {currentLesson && (
          <div className="border-t bg-background px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prev = findPreviousLesson();
                  if (prev) setCurrentLesson(prev);
                }}
                disabled={!findPreviousLesson()}
                className="text-xs sm:text-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              
              <Button
                size="sm"
                onClick={() => {
                  const next = findNextLesson();
                  if (next) {
                    setCurrentLesson(next);
                  } else {
                    navigate('/dashboard');
                  }
                }}
                className="text-xs sm:text-sm"
              >
                {findNextLesson() ? (
                  <>
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
                  </>
                ) : (
                  'Finish Course'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}