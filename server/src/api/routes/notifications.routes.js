const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { authMiddleware, requireRole } = require('../../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for the authenticated user
 * @access  Private
 * @query   {string} type - Filter by notification type (optional)
 * @query   {boolean} isRead - Filter by read status (optional)
 * @query   {number} limit - Limit number of results (optional, default: 50)
 */
router.get('/', notificationsController.getNotifications);

/**
 * @route   POST /api/notifications/:notificationId/read
 * @desc    Mark a specific notification as read
 * @access  Private
 * @param   {string} notificationId - The ID of the notification to mark as read
 */
router.post('/:notificationId/read', notificationsController.markAsRead);

/**
 * @route   POST /api/notifications/mark-all-read
 * @desc    Mark all notifications as read for the authenticated user
 * @access  Private
 */
router.post('/mark-all-read', notificationsController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete a specific notification
 * @access  Private
 * @param   {string} notificationId - The ID of the notification to delete
 */
router.delete('/:notificationId', notificationsController.deleteNotification);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics for the authenticated user
 * @access  Private
 */
router.get('/stats', notificationsController.getNotificationStats);

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification (Admin/Manager only)
 * @access  Private - Admin/Manager
 * @body    {string} title - Notification title
 * @body    {string} message - Notification message
 * @body    {string} type - Notification type (system, course, deadline, achievement, team)
 * @body    {number} userId - Target user ID (optional, null for global notifications)
 * @body    {string} actionUrl - Action URL (optional)
 */
router.post('/', 
  requireRole('admin', 'manager'), 
  notificationsController.createNotification
);

/**
 * @route   POST /api/notifications/bulk
 * @desc    Create notifications for multiple users (Admin/Manager only)
 * @access  Private - Admin/Manager
 * @body    {string} title - Notification title
 * @body    {string} message - Notification message
 * @body    {string} type - Notification type
 * @body    {number[]} userIds - Array of target user IDs
 * @body    {string} actionUrl - Action URL (optional)
 */
router.post('/bulk', 
  requireRole('admin', 'manager'), 
  notificationsController.bulkCreateNotifications
);

module.exports = router;