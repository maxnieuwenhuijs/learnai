const router = require('express').Router();
const searchController = require('../controllers/search.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Routes
router.get('/', searchController.searchAll);

module.exports = router;
