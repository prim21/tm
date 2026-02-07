const TaskService = require('../services/taskService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Task Controller
 * Handles HTTP requests and responses for task operations
 */

class TaskController {
    // Get all tasks
    static async getAllTasks(req, res, next) {
        try {
            const { status, priority, category, search, sortBy, sortOrder, projectId } = req.query;
            const ownerId = req.user.uid;

            // Note: workspaceId is removed from filters as we are moving to single-user mode
            const filters = { status, priority, category, search, sortBy, sortOrder, ownerId, projectId };

            const tasks = await TaskService.getAllTasks(filters);

            return ApiResponse.success(res, tasks, 'Tasks retrieved successfully');
        } catch (error) {
            logger.error('Error in getAllTasks:', error);
            next(error);
        }
    }

    // Get task by ID
    static async getTaskById(req, res, next) {
        try {
            const { id } = req.params;
            const task = await TaskService.getTaskById(id);

            return ApiResponse.success(res, task, 'Task retrieved successfully');
        } catch (error) {
            if (error.message === 'Task not found') {
                return ApiResponse.notFound(res, error.message);
            }
            logger.error('Error in getTaskById:', error);
            next(error);
        }
    }

    // Create new task
    static async createTask(req, res, next) {
        try {
            const taskData = { ...req.body, ownerId: req.user.uid };
            const newTask = await TaskService.createTask(taskData);

            return ApiResponse.created(res, newTask, 'Task created successfully');
        } catch (error) {
            logger.error('Error in createTask:', error);
            next(error);
        }
    }

    // Update task
    static async updateTask(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const updatedTask = await TaskService.updateTask(id, updateData);

            return ApiResponse.success(res, updatedTask, 'Task updated successfully');
        } catch (error) {
            if (error.message === 'Task not found') {
                return ApiResponse.notFound(res, error.message);
            }
            logger.error('Error in updateTask:', error);
            next(error);
        }
    }

    // Delete task
    static async deleteTask(req, res, next) {
        try {
            const { id } = req.params;
            await TaskService.deleteTask(id);

            return ApiResponse.success(res, null, 'Task deleted successfully');
        } catch (error) {
            if (error.message === 'Task not found') {
                return ApiResponse.notFound(res, error.message);
            }
            logger.error('Error in deleteTask:', error);
            next(error);
        }
    }

    // Get task statistics
    static async getTaskStats(req, res, next) {
        try {
            const stats = await TaskService.getTaskStats();

            return ApiResponse.success(res, stats, 'Task statistics retrieved successfully');
        } catch (error) {
            logger.error('Error in getTaskStats:', error);
            next(error);
        }
    }
}

module.exports = TaskController;
