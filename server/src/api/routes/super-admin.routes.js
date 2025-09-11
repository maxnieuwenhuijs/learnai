const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const { companyLogoUpload } = require('../../services/file-upload.service');

// Import controllers individually to avoid import issues
const superAdminController = require('../controllers/super-admin.controller');

// Middleware to check super admin role
const superAdminOnly = (req, res, next) => {
    if (req.user && req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super admin role required.'
        });
    }
    next();
};

// Apply authentication and super admin check to all routes
router.use(authMiddleware);
router.use(superAdminOnly);

// Validation rules
const createCompanyValidation = [
    body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Company name must be between 2 and 255 characters'),
    body('industry').trim().notEmpty().withMessage('Industry is required'),
    body('country').trim().notEmpty().withMessage('Country is required'),
    body('size').trim().notEmpty().withMessage('Company size is required'),
    body('admin_name').trim().isLength({ min: 2, max: 255 }).withMessage('Admin name must be between 2 and 255 characters'),
    body('admin_email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('admin_password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const updateCompanyValidation = [
    body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Company name must be between 2 and 255 characters'),
    body('industry').trim().notEmpty().withMessage('Industry is required'),
    body('country').trim().notEmpty().withMessage('Country is required'),
    body('size').trim().notEmpty().withMessage('Company size is required')
];

const createManagerValidation = [
    body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Manager name must be between 2 and 255 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('department_id').optional().isInt().withMessage('Department ID must be a valid integer')
];

const createUserValidation = [
    body('name').trim().isLength({ min: 2, max: 255 }).withMessage('User name must be between 2 and 255 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['participant', 'manager', 'admin', 'super_admin']).withMessage('Invalid role'),
    body('company_id').optional().isInt().withMessage('Company ID must be a valid integer'),
    body('department_id').optional().isInt().withMessage('Department ID must be a valid integer')
];

// Routes
router.get('/dashboard', superAdminController.getDashboardStats);
router.get('/companies', superAdminController.getCompanies);
router.post('/companies', companyLogoUpload.single('logo'), createCompanyValidation, superAdminController.createCompany);
router.put('/companies/:id', updateCompanyValidation, superAdminController.updateCompany);
router.delete('/companies/:id', superAdminController.deleteCompany);
router.get('/companies/:id', superAdminController.getCompanyDetails);
router.post('/companies/:companyId/managers', createManagerValidation, superAdminController.createCompanyManager);

// Super Admin Prompt Management Routes
router.get('/prompts', superAdminController.getAllPrompts);
router.get('/prompts/analytics', superAdminController.getPromptAnalytics);
router.get('/prompts/by-company', superAdminController.getPromptsByCompany);
router.delete('/prompts/:id', superAdminController.deletePrompt);
router.put('/prompts/:id/status', superAdminController.updatePromptStatus);

// Super Admin User Management Routes
router.get('/users', superAdminController.getAllUsers);
router.get('/users/analytics', superAdminController.getUserAnalytics);
router.post('/users', createUserValidation, superAdminController.createUser);

// Super Admin Analytics Routes
router.get('/analytics/overview', superAdminController.getAnalyticsOverview);
router.get('/analytics/trends', superAdminController.getAnalyticsTrends);
router.get('/analytics/performance', superAdminController.getPerformanceMetrics);

// Super Admin Audit & Monitoring Routes
router.get('/audit-logs', superAdminController.getAuditLogs);
router.get('/system-metrics', superAdminController.getSystemMetrics);
router.get('/system-health', superAdminController.getSystemHealth);

// Development/testing utilities
router.post('/reset-database', superAdminController.resetDatabase);
router.post('/seed-data', superAdminController.createSeedData);

module.exports = router;