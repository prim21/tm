const express = require('express');
const DocumentController = require('../controllers/documentController');
// const validate = require('../middlewares/validate'); // Skipping validation for now as no validators are defined
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication to all document routes
router.use(authMiddleware);

/**
 * Document Routes
 * @route /api/documents
 */

// Storage insights
router.get('/insights', DocumentController.getStorageInsights);

// Get all documents (with filters)
router.get('/', DocumentController.getAllDocuments);

// Get document by ID
router.get('/:id', DocumentController.getDocumentById);

// Create new document
router.post('/', DocumentController.createDocument);

// Bulk delete documents
router.post('/bulk-delete', DocumentController.bulkDeleteDocuments);

// Update document
router.put('/:id', DocumentController.updateDocument);

// Toggle star
router.put('/:id/star', DocumentController.toggleStar);

// Share document
router.post('/:id/share', DocumentController.shareDocument);

// Delete document
router.delete('/:id', DocumentController.deleteDocument);

module.exports = router;
