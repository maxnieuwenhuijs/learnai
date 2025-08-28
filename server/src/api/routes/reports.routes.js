const router = require('express').Router();
const reportsController = require('../controllers/reports.controller');
const { authMiddleware, requireRole } = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// EU AI Act compliance status report - accessible to all authenticated users
router.get('/compliance', reportsController.getComplianceReport);

// Team progress report - managers and above
router.get('/team', requireRole('manager', 'admin', 'super_admin'), reportsController.getTeamProgress);

// Department-wide analytics - admin and above
router.get('/department', requireRole('admin', 'super_admin'), reportsController.getDepartmentAnalytics);

// Export reports as PDF or CSV
router.get('/export/:type', requireRole('manager', 'admin', 'super_admin'), reportsController.exportReport);

// Dashboard statistics - customized by user role
router.get('/dashboard', reportsController.getDashboardStats);

module.exports = router;