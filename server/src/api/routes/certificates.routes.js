const router = require('express').Router();
const certificatesController = require('../controllers/certificates.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

// Public routes (no authentication required)
router.get('/verify/:code', certificatesController.verifyCertificate);

// Protected routes (authentication required)
router.use(authMiddleware);
router.get('/', certificatesController.getUserCertificates);
router.get('/:id', certificatesController.getCertificate);
router.get('/:id/download', certificatesController.downloadCertificatePDF);
router.post('/generate', certificatesController.generateCertificate);

module.exports = router;