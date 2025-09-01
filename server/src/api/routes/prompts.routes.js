const express = require('express');
const router = express.Router();
const promptsController = require('../controllers/prompts.controller');
const { authMiddleware, requireRole } = require('../../middleware/auth.middleware');

// Test route without auth
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Prompts API is working!' });
});

// Apply authentication to all other routes
router.use(authMiddleware);

// Prompt Categories Routes
router.get('/categories', promptsController.getCategories);
router.post('/categories', requireRole('admin', 'super_admin'), promptsController.createCategory);

// Prompts Routes
router.get('/', promptsController.getPrompts);
router.get('/:id', promptsController.getPromptById);
router.post('/', promptsController.createPrompt);
router.put('/:id', promptsController.updatePrompt);
router.delete('/:id', promptsController.deletePrompt);

// Prompt Generation & Usage
router.post('/:id/generate', promptsController.generateContent);
router.get('/analytics/usage', promptsController.getPromptAnalytics);

// Approval Workflow Routes
router.get('/approvals/requests', requireRole('manager', 'admin', 'super_admin'), promptsController.getApprovalRequests);
router.put('/approvals/:id', requireRole('manager', 'admin', 'super_admin'), promptsController.processApproval);

module.exports = router;