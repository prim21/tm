const express = require('express');
const ProjectController = require('../controllers/projectController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', ProjectController.getProjects);
router.post('/', ProjectController.createProject);
router.delete('/:id', ProjectController.deleteProject);

module.exports = router;
