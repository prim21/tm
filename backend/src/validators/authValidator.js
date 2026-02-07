const { body, validationResult } = require('express-validator');

/**
 * Validation rules for authentication endpoints
 */

const authValidators = {
    // Signup validation
    signup: [
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email address')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
            .matches(/\d/)
            .withMessage('Password must contain at least one number'),
        body('displayName')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Display name must be between 2 and 50 characters')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Display name can only contain letters and spaces'),
    ],

    // Token verification validation
    verifyToken: [
        body('token')
            .notEmpty()
            .withMessage('Token is required')
            .isString()
            .withMessage('Token must be a string'),
    ],

    // Password reset validation
    passwordReset: [
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email address')
            .normalizeEmail(),
    ],

    // Profile update validation
    updateProfile: [
        body('displayName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Display name must be between 2 and 50 characters')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Display name can only contain letters and spaces'),
        body('photoURL')
            .optional()
            .isURL()
            .withMessage('Photo URL must be a valid URL'),
    ],
};

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }

    next();
};

module.exports = {
    authValidators,
    handleValidationErrors,
};
