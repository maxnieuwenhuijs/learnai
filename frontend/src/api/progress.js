import api from './config';

export const progressApi = {
  // Get user's progress across all courses
  getUserProgress: async () => {
    const response = await api.get('/progress/me');
    return response.data.progress || [];
  },

  // Track a learning event
  trackEvent: async (lessonId, eventType, details = {}) => {
    const response = await api.post('/progress/event', {
      lessonId,
      eventType,
      details
    });
    return response.data;
  },

  // Helper methods for common events
  startLesson: async (lessonId) => {
    return progressApi.trackEvent(lessonId, 'LESSON_STARTED');
  },

  updateTimeSpent: async (lessonId, seconds) => {
    return progressApi.trackEvent(lessonId, 'TIME_SPENT_UPDATE', { seconds });
  },

  completeLesson: async (lessonId, quizScore = null) => {
    const details = {};
    if (quizScore !== null) {
      details.quizScore = quizScore;
    }
    return progressApi.trackEvent(lessonId, 'LESSON_COMPLETED', details);
  }
};