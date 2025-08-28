const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');
const { authMiddleware, requireRole } = require('../../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/calendar/events
 * @desc    Get calendar events for the authenticated user
 * @access  Private
 * @query   {string} start - Start date for filtering (ISO format)
 * @query   {string} end - End date for filtering (ISO format)
 * @query   {string} type - Event type filter (deadline, meeting, milestone, reminder, other)
 */
router.get('/events', calendarController.getEvents);

/**
 * @route   GET /api/calendar/upcoming
 * @desc    Get upcoming events for the next 7 days
 * @access  Private
 */
router.get('/upcoming', calendarController.getUpcomingEvents);

/**
 * @route   GET /api/calendar/stats
 * @desc    Get calendar statistics for the authenticated user
 * @access  Private
 */
router.get('/stats', calendarController.getCalendarStats);

/**
 * @route   POST /api/calendar/events
 * @desc    Create a new calendar event
 * @access  Private
 * @body    {string} title - Event title (required)
 * @body    {string} description - Event description
 * @body    {string} eventDate - Event date (ISO format, required)
 * @body    {string} eventTime - Event time (HH:MM format)
 * @body    {string} eventType - Event type (required)
 * @body    {number} courseId - Associated course ID (optional)
 * @body    {boolean} isRecurring - Whether event recurs
 * @body    {string} recurringPattern - Recurrence pattern (daily, weekly, monthly)
 * @body    {boolean} reminderEnabled - Enable reminder
 * @body    {number} reminderTime - Reminder time in hours before event
 * @body    {string} location - Event location
 * @body    {object} metadata - Additional event metadata
 */
router.post('/events', calendarController.createEvent);

/**
 * @route   PUT /api/calendar/events/:eventId
 * @desc    Update a calendar event
 * @access  Private
 * @param   {number} eventId - Event ID to update
 */
router.put('/events/:eventId', calendarController.updateEvent);

/**
 * @route   DELETE /api/calendar/events/:eventId
 * @desc    Delete a calendar event
 * @access  Private
 * @param   {number} eventId - Event ID to delete
 */
router.delete('/events/:eventId', calendarController.deleteEvent);

/**
 * @route   POST /api/calendar/course-events
 * @desc    Create calendar events for course assignments (Admin/Manager only)
 * @access  Private - Admin/Manager
 * @body    {number} courseId - Course ID (required)
 * @body    {number} companyId - Company ID
 * @body    {number} departmentId - Department ID
 * @body    {string} dueDate - Due date for the course (ISO format, required)
 */
router.post('/course-events',
  requireRole('admin', 'super_admin', 'manager'),
  calendarController.createCourseEvents
);

module.exports = router;