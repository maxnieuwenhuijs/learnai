import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  CheckCircle, 
  Star,
  Clock,
  Target,
  Award
} from 'lucide-react';

export function CourseCompletionCelebration({ 
  course, 
  courseProgress, 
  onViewCertificate,
  onContinueLearning 
}) {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (courseProgress === 100) {
      setShowCelebration(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [courseProgress]);

  if (!showCelebration || courseProgress !== 100) return null;

  const totalLessons = course?.modules?.reduce((total, module) => 
    total + (module.lessons?.length || 0), 0) || 0;

  const completedLessons = course?.modules?.reduce((total, module) => 
    total + (module.lessons?.filter(lesson => 
      lesson.progress?.status === 'completed'
    )?.length || 0), 0) || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
        <CardContent className="p-6 text-center space-y-6">
          {/* Celebration Animation */}
          <div className="relative">
            <div className="animate-bounce">
              <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
            </div>
            <div className="absolute -top-2 -right-2 animate-pulse">
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 animate-pulse delay-300">
              <Award className="h-6 w-6 text-yellow-400" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-green-600">
              Gefeliciteerd! 🎉
            </h2>
            <p className="text-lg font-semibold text-gray-800">
              Je hebt de cursus afgerond!
            </p>
            <p className="text-muted-foreground">
              <strong>"{course?.title}"</strong>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Voltooid</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {completedLessons}/{totalLessons}
              </div>
              <div className="text-xs text-muted-foreground">lessen</div>
            </div>

            <div className="bg-white/50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Progress</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {courseProgress}%
              </div>
              <div className="text-xs text-muted-foreground">voltooid</div>
            </div>
          </div>

          {/* Certificate Badge */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Certificaat Verdiend!</span>
            </div>
            <p className="text-sm text-yellow-700">
              Je hebt een certificaat verdiend voor het succesvol afronden van deze cursus.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onViewCertificate}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Bekijk Certificaat
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onContinueLearning}
              className="w-full"
            >
              <Clock className="h-4 w-4 mr-2" />
              Ga door met Leren
            </Button>
          </div>

          {/* Auto-close notice */}
          <p className="text-xs text-muted-foreground">
            Dit bericht verdwijnt automatisch in 5 seconden
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
