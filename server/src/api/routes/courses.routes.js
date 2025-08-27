const router = require('express').Router();
const coursesController = require('../controllers/courses.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Routes
router.get('/', coursesController.getAssignedCourses);
router.get('/:courseId', coursesController.getCourseDetails);

module.exports = router;