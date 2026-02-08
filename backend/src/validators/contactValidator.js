const { body, validationResult } = require('express-validator');

/**
 * Contact Form Validators
 */

const contactValidators = {
    submitContact: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required')
            .isLength({ min: 2, max: 100 })
            .withMessage('Name must be between 2 and 100 characters'),
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Please provide a valid email address')
            .normalizeEmail(),
        body('message')
            .trim()
            .notEmpty()
            .withMessage('Message is required')
            .isLength({ min: 10, max: 1000 })
            .withMessage('Message must be between 10 and 1000 characters')
    ]
};

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation Errors:', JSON.stringify(errors.array(), null, 2));
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    contactValidators,
    handleValidationErrors
};
