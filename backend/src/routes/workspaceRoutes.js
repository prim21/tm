const express = require('express');
const router = express.Router();
const WorkspaceController = require('../controllers/workspaceController');
const { authMiddleware } = require('../middlewares/auth');

// All workspace routes require authentication
router.use(authMiddleware);

// Routes
router.get('/', WorkspaceController.getWorkspaces);
router.post('/', WorkspaceController.createWorkspace);
router.delete('/:id', WorkspaceController.deleteWorkspace);

module.exports = router;
