const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware');

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

// Routes
router.get('/dashboard', superAdminController.getDashboardStats);
router.get('/companies', superAdminController.getCompanies);
router.post('/companies', createCompanyValidation, superAdminController.createCompany);
router.put('/companies/:id', updateCompanyValidation, superAdminController.updateCompany);
router.delete('/companies/:id', superAdminController.deleteCompany);
router.get('/companies/:id', superAdminController.getCompanyDetails);

// Development/testing utilities
router.post('/reset-database', superAdminController.resetDatabase);
router.post('/seed-data', superAdminController.createSeedData);

module.exports = router;