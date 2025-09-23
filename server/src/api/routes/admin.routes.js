const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { authMiddleware, requireRole } = require('../../middleware/auth.middleware');

// Import controllers
const adminController = require('../controllers/admin.controller');

// Apply authentication and admin role check to all routes
router.use(authMiddleware);
router.use(requireRole('admin', 'super_admin'));

// Admin Dashboard Routes
router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);

// Company Management Routes (admin can only see their own company)
router.get('/company', adminController.getCompany);
router.put('/company', adminController.updateCompany);

// User Management Routes (admin can only manage users in their company)
router.get('/users', adminController.getCompanyUsers);
router.get('/users/analytics', adminController.getUserAnalytics);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Course Management Routes (admin can only manage courses for their company)
router.get('/courses', adminController.getCompanyCourses);
router.get('/courses/:id', adminController.getCourse);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);
router.post('/courses/:id/assign', adminController.assignCourseToTeam);
router.get('/courses/:id/statistics', adminController.getCourseStatistics);

// Department Management Routes
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.createDepartment);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

// Reports Routes
router.get('/reports/team', adminController.getTeamReports);
router.get('/reports/courses', adminController.getCourseReports);
router.get('/reports/users', adminController.getUserReports);

// Company Prompt Management Routes
router.get('/prompts', adminController.getCompanyPrompts);
router.get('/prompts/:id', adminController.getPrompt);
router.post('/prompts', adminController.createPrompt);
router.put('/prompts/:id', adminController.updatePrompt);
router.delete('/prompts/:id', adminController.deletePrompt);
router.put('/prompts/:id/approve', adminController.approvePrompt);
router.put('/prompts/:id/reject', adminController.rejectPrompt);
router.get('/prompts/categories', adminController.getPromptCategories);
router.post('/prompts/categories', adminController.createPromptCategory);

module.exports = router;
