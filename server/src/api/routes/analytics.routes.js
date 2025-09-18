const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authMiddleware, requireRole } = require('../../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get prompt analytics
router.get('/prompts', analyticsController.getPromptAnalytics);

// Get company-level analytics (super admin only)
router.get('/company', requireRole('super_admin'), analyticsController.getCompanyAnalytics);

module.exports = router;
