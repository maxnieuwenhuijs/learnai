import api from './config';

// Get upcoming deadlines and events
export const getUpcomingEvents = async () => {
  try {
    const response = await api.get('/calendar/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

// Get course deadlines
export const getCourseDeadlines = async () => {
  try {
    const response = await api.get('/calendar/deadlines');
    return response.data;
  } catch (error) {
    console.error('Error fetching course deadlines:', error);
    throw error;
  }
};

// Get scheduled sessions
export const getScheduledSessions = async () => {
  try {
    const response = await api.get('/calendar/sessions');
    return response.data;
  } catch (error) {
    console.error('Error fetching scheduled sessions:', error);
    throw error;
  }
};

// Create a new calendar event
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/calendar/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.put(`/calendar/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/calendar/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get events for a specific date range
export const getEventsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get('/calendar/events/range', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events by date range:', error);
    throw error;
  }
};

// Schedule a learning session
export const scheduleLearningSession = async (courseId, dateTime, duration) => {
  try {
    const response = await api.post('/calendar/schedule-session', {
      courseId,
      dateTime,
      duration
    });
    return response.data;
  } catch (error) {
    console.error('Error scheduling session:', error);
    throw error;
  }
};

// Get reminders
export const getReminders = async () => {
  try {
    const response = await api.get('/calendar/reminders');
    return response.data;
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
};

// Set a reminder
export const setReminder = async (eventId, reminderTime) => {
  try {
    const response = await api.post('/calendar/reminders', {
      eventId,
      reminderTime
    });
    return response.data;
  } catch (error) {
    console.error('Error setting reminder:', error);
    throw error;
  }
};