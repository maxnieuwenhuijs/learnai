const router = require('express').Router();
const reportsController = require('../controllers/reports.controller');
const { authMiddleware, requireRole } = require('../../middleware/auth.middleware');

// All routes require authentication and manager role or higher
router.use(authMiddleware);

// Routes
router.get('/team', requireRole('manager', 'admin', 'super_admin'), reportsController.getTeamProgress);

module.exports = router;