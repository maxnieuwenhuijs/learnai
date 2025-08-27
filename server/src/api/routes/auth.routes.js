const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

// Validation middleware
const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().isLength({ min: 6 })
];

const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().trim(),
    body('company_id').isInt(),
    body('department_id').optional().isInt(),
    body('role').optional().isIn(['participant', 'manager', 'admin', 'super_admin'])
];

// Routes
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);
router.get('/me', authMiddleware, authController.getMe);

// OAuth routes will be added here later
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/google/callback', ...);
// router.get('/microsoft', passport.authenticate('microsoft', { scope: ['profile', 'email'] }));
// router.get('/microsoft/callback', ...);

module.exports = router;