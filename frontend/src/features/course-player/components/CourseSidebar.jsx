import { CheckCircle, Circle, PlayCircle, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function CourseSidebar({ course, currentLesson, onLessonSelect, courseProgress }) {
  const [expandedModules, setExpandedModules] = useState(
    course.modules.map(m => m.id)
  );

  const toggleModule = (moduleId) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getLessonIcon = (lesson) => {
    if (lesson.progress.status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (lesson.progress.status === 'in_progress') {
      return <PlayCircle className="h-4 w-4 text-yellow-500" />;
    }
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  const getModuleProgress = (module) => {
    const totalLessons = module.lessons.length;
    const completedLessons = module.lessons.filter(
      l => l.progress.status === 'completed'
    ).length;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Course Overview */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg mb-2">{course.title}</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Course Progress</span>
            <span className="font-medium">{courseProgress}%</span>
          </div>
          <Progress value={courseProgress} />
          {course.target_role && (
            <p className="text-xs text-muted-foreground">
              Target Role: {course.target_role}
            </p>
          )}
        </div>
      </div>

      {/* Modules and Lessons */}
      <div className="flex-1 overflow-y-auto">
        {course.modules.map((module, moduleIndex) => (
          <div key={module.id} className="border-b">
            <Button
              variant="ghost"
              className="w-full justify-between p-4 hover:bg-muted/50"
              onClick={() => toggleModule(module.id)}
            >
              <div className="flex items-center gap-2 text-left">
                {expandedModules.includes(module.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <div>
                  <div className="font-medium">
                    Module {moduleIndex + 1}: {module.title}
                  </div>
                  {module.estimated_duration_minutes && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {module.estimated_duration_minutes} min
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={getModuleProgress(module)} className="w-16" />
                <span className="text-xs">{getModuleProgress(module)}%</span>
              </div>
            </Button>

            {expandedModules.includes(module.id) && (
              <div className="bg-muted/20">
                {module.lessons.map((lesson, lessonIndex) => (
                  <button
                    key={lesson.id}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left
                      ${currentLesson?.id === lesson.id ? 'bg-primary/10 border-l-2 border-primary' : ''}
                    `}
                    onClick={() => onLessonSelect(lesson, module.id, module.title)}
                  >
                    {getLessonIcon(lesson)}
                    <div className="flex-1">
                      <div className="text-sm">
                        {lessonIndex + 1}. {lesson.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lesson.content_type.replace('_', ' ')}
                        {lesson.progress.time_spent_seconds > 0 && (
                          <span className="ml-2">
                            • {Math.floor(lesson.progress.time_spent_seconds / 60)}m spent
                          </span>
                        )}
                      </div>
                    </div>
                    {lesson.progress.quiz_score && (
                      <div className="text-xs font-medium">
                        {lesson.progress.quiz_score}%
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}