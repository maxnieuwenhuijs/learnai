import { useEffect, useRef } from 'react';
import { progressApi } from '@/api/progress';

export function useCourseTracking(lessonId, isPreviewMode = false) {
  const intervalRef = useRef(null);
  const timeSpentRef = useRef(0);

  useEffect(() => {
    // Clear any existing interval when lesson changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reset time spent
    timeSpentRef.current = 0;

    // Skip progress tracking in preview mode
    if (isPreviewMode) {
      return;
    }

    // Start heartbeat for time tracking if lesson is active
    if (lessonId) {
      intervalRef.current = setInterval(async () => {
        try {
          await progressApi.updateTimeSpent(lessonId, 60); // Update every 60 seconds
          timeSpentRef.current += 60;
        } catch (error) {
          console.error('Error updating time spent:', error);
        }
      }, 60000); // 60 seconds
    }

    // Cleanup on unmount or lesson change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lessonId, isPreviewMode]);

  const startLesson = async () => {
    if (!lessonId || isPreviewMode) return;

    try {
      await progressApi.startLesson(lessonId);
    } catch (error) {
      console.error('Error starting lesson:', error);
    }
  };

  const completeLesson = async (quizScore = null) => {
    if (!lessonId || isPreviewMode) return true; // Return true in preview mode

    console.log(`🎯 Frontend: Attempting to complete lesson ${lessonId} with quiz score:`, quizScore);

    try {
      // Clear interval before completing
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      await progressApi.completeLesson(lessonId, quizScore);
      console.log(`✅ Frontend: Successfully completed lesson ${lessonId}`);
      return true;
    } catch (error) {
      console.error('❌ Frontend: Error completing lesson:', error);
      return false;
    }
  };

  const updateTimeSpent = async (seconds) => {
    if (!lessonId || isPreviewMode) return;

    try {
      await progressApi.updateTimeSpent(lessonId, seconds);
      timeSpentRef.current += seconds;
    } catch (error) {
      console.error('Error updating time spent:', error);
    }
  };

  return {
    startLesson,
    completeLesson,
    updateTimeSpent
  };
}