import api from './config';

export const coursesApi = {
  // Get all assigned courses for the current user
  getAssignedCourses: async () => {
    const response = await api.get('/courses');
    return response.data.courses || [];
  },

  // Get detailed course information
  getCourseDetails: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data.course || null;
  }
};