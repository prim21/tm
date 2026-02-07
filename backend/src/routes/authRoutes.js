const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware, optionalAuth } = require('../middlewares/auth');
const { authValidators, handleValidationErrors } = require('../validators/authValidator');

/**
 * Authentication Routes
 * Base path: /api/auth
 */

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post(
    '/signup',
    authValidators.signup,
    handleValidationErrors,
    AuthController.signup
);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify user token
 * @access  Public
 */
router.post(
    '/verify',
    authValidators.verifyToken,
    handleValidationErrors,
    AuthController.verifyToken
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get(
    '/profile',
    authMiddleware,
    AuthController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
    '/profile',
    authMiddleware,
    authValidators.updateProfile,
    handleValidationErrors,
    AuthController.updateProfile
);

/**
 * @route   POST /api/auth/password-reset
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
    '/password-reset',
    authValidators.passwordReset,
    handleValidationErrors,
    AuthController.sendPasswordReset
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side operation)
 * @access  Private
 */
router.post(
    '/logout',
    optionalAuth,
    AuthController.logout
);

/**
 * @route   POST /api/auth/invite
 * @desc    Invite a user
 * @access  Private
 */
router.post(
    '/invite',
    authMiddleware,
    AuthController.inviteUser
);

/**
 * @route   GET /api/auth/invites
 * @desc    Get sent invitations
 * @access  Private
 */
router.get(
    '/invites',
    authMiddleware,
    AuthController.getInvitations
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
    '/account',
    authMiddleware,
    AuthController.deleteAccount
);

/**
 * @route   GET /api/auth/user/:email
 * @desc    Get user by email (admin only)
 * @access  Private
 */
router.get(
    '/user/:email',
    authMiddleware,
    AuthController.getUserByEmail
);

/**
 * @route   GET /api/auth/users
 * @desc    List all users (admin only)
 * @access  Private
 */
router.get(
    '/users',
    authMiddleware,
    AuthController.listUsers
);

module.exports = router;
