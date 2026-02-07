const { body, param, query } = require('express-validator');

/**
 * Validation rules for task operations
 */

const taskValidators = {
    // Validation for creating a task
    createTask: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required')
            .isLength({ min: 3, max: 100 })
            .withMessage('Title must be between 3 and 100 characters'),

        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description must not exceed 500 characters'),

        body('status')
            .optional()
            .isIn(['todo', 'in-progress', 'in-review', 'blocked'])
            .withMessage('Status must be one of: todo, in-progress, in-review, blocked'),

        body('priority')
            .optional()
            .isIn(['low', 'medium', 'high'])
            .withMessage('Priority must be one of: low, medium, high'),

        body('dueDate')
            .optional()
            .isISO8601()
            .withMessage('Due date must be a valid ISO8601 date'),

        body('category')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('Category must not exceed 50 characters'),
    ],

    // Validation for updating a task
    updateTask: [
        param('id')
            .notEmpty()
            .withMessage('Task ID is required'),

        body('title')
            .optional()
            .trim()
            .isLength({ min: 3, max: 100 })
            .withMessage('Title must be between 3 and 100 characters'),

        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description must not exceed 500 characters'),

        body('status')
            .optional()
            .isIn(['todo', 'in-progress', 'in-review', 'blocked'])
            .withMessage('Status must be one of: todo, in-progress, in-review, blocked'),

        body('priority')
            .optional()
            .isIn(['low', 'medium', 'high'])
            .withMessage('Priority must be one of: low, medium, high'),

        body('dueDate')
            .optional()
            .isISO8601()
            .withMessage('Due date must be a valid ISO8601 date'),

        body('category')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('Category must not exceed 50 characters'),
    ],

    // Validation for getting a task by ID
    getTaskById: [
        param('id')
            .notEmpty()
            .withMessage('Task ID is required'),
    ],

    // Validation for deleting a task
    deleteTask: [
        param('id')
            .notEmpty()
            .withMessage('Task ID is required'),
    ],

    // Validation for query filters
    getTasks: [
        query('status')
            .optional()
            .isIn(['todo', 'in-progress', 'in-review', 'blocked'])
            .withMessage('Status must be one of: todo, in-progress, in-review, blocked'),

        query('priority')
            .optional()
            .isIn(['low', 'medium', 'high'])
            .withMessage('Priority must be one of: low, medium, high'),
        query('category')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('Category must not exceed 50 characters'),

        query('search')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Search term too long'),

        query('sortBy')
            .optional()
            .isIn(['title', 'dueDate', 'createdAt', 'priority', 'status', 'category'])
            .withMessage('Invalid sort field'),

        query('sortOrder')
            .optional()
            .isIn(['asc', 'desc'])
            .withMessage('Sort order must be asc or desc'),
    ],
};

module.exports = taskValidators;
