const express = require('express');
const TaskController = require('../controllers/taskController');
const taskValidators = require('../validators/taskValidator');
const validate = require('../middlewares/validate');

const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication to all task routes
router.use(authMiddleware);

/**
 * Task Routes
 * @route /api/tasks
 */

// Get task statistics
router.get('/stats', TaskController.getTaskStats);

// Get all tasks (with optional filters)
router.get(
    '/',
    taskValidators.getTasks,
    validate,
    TaskController.getAllTasks
);

// Get task by ID
router.get(
    '/:id',
    taskValidators.getTaskById,
    validate,
    TaskController.getTaskById
);

// Create new task
router.post(
    '/',
    taskValidators.createTask,
    validate,
    TaskController.createTask
);

// Update task
router.put(
    '/:id',
    taskValidators.updateTask,
    validate,
    TaskController.updateTask
);

// Delete task
router.delete(
    '/:id',
    taskValidators.deleteTask,
    validate,
    TaskController.deleteTask
);

module.exports = router;
