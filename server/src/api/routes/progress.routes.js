const router = require('express').Router();
const { body } = require('express-validator');
const progressController = require('../controllers/progress.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Validation middleware
const trackEventValidation = [
    body('lessonId').isInt(),
    body('eventType').isIn(['LESSON_STARTED', 'TIME_SPENT_UPDATE', 'LESSON_COMPLETED']),
    body('details').optional().isObject()
];

// Routes
router.get('/me', progressController.getUserProgress);
router.post('/event', trackEventValidation, progressController.trackEvent);

module.exports = router;