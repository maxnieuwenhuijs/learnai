const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const { authMiddleware, requireRole } = require('../../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/email/test-connection
 * @desc    Test email service connection
 * @access  Private - Admin only
 */
router.get('/test-connection',
  requireRole('admin', 'super_admin'),
  emailController.testConnection
);

/**
 * @route   POST /api/email/send-test
 * @desc    Send a test email
 * @access  Private - Admin only
 * @body    {string} email - Email address to send test to (optional, defaults to user's email)
 */
router.post('/send-test',
  requireRole('admin', 'super_admin'),
  emailController.sendTestEmail
);

/**
 * @route   GET /api/email/queue-status
 * @desc    Get email queue status
 * @access  Private - Admin only
 */
router.get('/queue-status',
  requireRole('admin', 'super_admin'),
  emailController.getQueueStatus
);

/**
 * @route   POST /api/email/queue-clear
 * @desc    Clear the email queue
 * @access  Private - Admin only
 */
router.post('/queue-clear',
  requireRole('admin', 'super_admin'),
  emailController.clearQueue
);

/**
 * @route   POST /api/email/send-welcome/:userId
 * @desc    Send welcome email to a specific user
 * @access  Private - Admin only
 * @param   {number} userId - User ID to send welcome email to
 */
router.post('/send-welcome/:userId',
  requireRole('admin', 'super_admin'),
  emailController.sendWelcomeEmail
);

/**
 * @route   POST /api/email/send-certificate
 * @desc    Send certificate email to a user
 * @access  Private - Admin only
 * @body    {number} userId - User ID
 * @body    {number} certificateId - Certificate ID
 */
router.post('/send-certificate',
  requireRole('admin', 'super_admin'),
  emailController.sendCertificateEmail
);

/**
 * @route   POST /api/email/send-deadline-reminders
 * @desc    Trigger deadline reminder emails for all users
 * @access  Private - Admin only
 */
router.post('/send-deadline-reminders',
  requireRole('admin', 'super_admin'),
  emailController.sendDeadlineReminders
);

/**
 * @route   POST /api/email/send-team-reports
 * @desc    Trigger team report emails for all managers
 * @access  Private - Admin only
 */
router.post('/send-team-reports',
  requireRole('admin', 'super_admin'),
  emailController.sendTeamReports
);

module.exports = router;