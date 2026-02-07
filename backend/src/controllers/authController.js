const AuthService = require('../services/authService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Authentication Controller
 * Handles HTTP requests for authentication operations
 */

class AuthController {
    /**
     * Sign up a new user
     * POST /api/auth/signup
     */
    static async signup(req, res, next) {
        try {
            const { email, password, displayName } = req.body;

            const user = await AuthService.signup(email, password, displayName);

            return ApiResponse.created(res, user, 'User registered successfully');
        } catch (error) {
            if (error.code === 'auth/email-already-exists') {
                return ApiResponse.badRequest(res, 'Email already in use');
            }
            if (error.code === 'auth/invalid-email') {
                return ApiResponse.badRequest(res, 'Invalid email address');
            }
            if (error.code === 'auth/weak-password') {
                return ApiResponse.badRequest(res, 'Password is too weak');
            }
            logger.error('Error in signup:', error);
            next(error);
        }
    }

    /**
     * Verify user token and return user info
     * POST /api/auth/verify
     */
    static async verifyToken(req, res, next) {
        try {
            const { token } = req.body;

            if (!token) {
                return ApiResponse.badRequest(res, 'Token is required');
            }

            const decodedToken = await AuthService.verifyToken(token);
            const userProfile = await AuthService.getUserProfile(decodedToken.uid);

            return ApiResponse.success(res, userProfile, 'Token verified successfully');
        } catch (error) {
            return ApiResponse.unauthorized(res, 'Invalid or expired token');
        }
    }

    /**
     * Get user profile
     * GET /api/auth/profile
     */
    static async getProfile(req, res, next) {
        try {
            // User ID comes from auth middleware
            const uid = req.user.uid;

            const userProfile = await AuthService.getUserProfile(uid);

            return ApiResponse.success(res, userProfile, 'Profile retrieved successfully');
        } catch (error) {
            logger.error('Error in getProfile:', error);
            next(error);
        }
    }

    /**
     * Update user profile
     * PUT /api/auth/profile
     */
    static async updateProfile(req, res, next) {
        try {
            const uid = req.user.uid;
            const updates = req.body;

            const updatedProfile = await AuthService.updateProfile(uid, updates);

            return ApiResponse.success(res, updatedProfile, 'Profile updated successfully');
        } catch (error) {
            logger.error('Error in updateProfile:', error);
            next(error);
        }
    }

    /**
     * Send password reset email
     * POST /api/auth/password-reset
     */
    static async sendPasswordReset(req, res, next) {
        try {
            const { email } = req.body;

            if (!email) {
                return ApiResponse.badRequest(res, 'Email is required');
            }

            const result = await AuthService.sendPasswordResetEmail(email);

            return ApiResponse.success(res, result, 'Password reset email sent');
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                return ApiResponse.notFound(res, 'No user found with this email');
            }
            logger.error('Error in sendPasswordReset:', error);
            next(error);
        }
    }

    /**
     * Delete user account
     * DELETE /api/auth/account
     */
    static async deleteAccount(req, res, next) {
        try {
            const uid = req.user.uid;

            await AuthService.deleteUser(uid);

            return ApiResponse.success(res, null, 'Account deleted successfully');
        } catch (error) {
            logger.error('Error in deleteAccount:', error);
            next(error);
        }
    }

    /**
     * Get user by email (admin only)
     * GET /api/auth/user/:email
     */
    static async getUserByEmail(req, res, next) {
        try {
            const { email } = req.params;

            const user = await AuthService.getUserByEmail(email);

            return ApiResponse.success(res, user, 'User retrieved successfully');
        } catch (error) {
            return ApiResponse.notFound(res, 'User not found');
        }
    }

    /**
     * List all users (admin only)
     * GET /api/auth/users
     */
    static async listUsers(req, res, next) {
        try {
            const { maxResults = 10, pageToken } = req.query;

            const result = await AuthService.listUsers(parseInt(maxResults), pageToken);

            return ApiResponse.success(res, result, 'Users retrieved successfully');
        } catch (error) {
            logger.error('Error in listUsers:', error);
            next(error);
        }
    }

    /**
     * Logout (client-side operation, but we can log it)
     * POST /api/auth/logout
     */
    /**
     * Logout (client-side operation, but we can log it)
     * POST /api/auth/logout
     */
    static async logout(req, res, next) {
        try {
            const uid = req.user?.uid;

            if (uid) {
                logger.info(`User logged out: ${uid}`);
            }

            return ApiResponse.success(res, null, 'Logged out successfully');
        } catch (error) {
            logger.error('Error in logout:', error);
            next(error);
        }
    }

    /**
     * Invite User
     * POST /api/auth/invite
     */
    static async inviteUser(req, res, next) {
        try {
            const { email } = req.body;
            const inviterId = req.user.uid;

            if (!email) {
                return ApiResponse.badRequest(res, 'Email is required');
            }

            await AuthService.createInvitation(email, inviterId);

            return ApiResponse.success(res, null, 'Invitation sent successfully');
        } catch (error) {
            logger.error('Error in inviteUser:', error);
            next(error);
        }
    }

    /**
     * Get Invitations
     * GET /api/auth/invites
     */
    static async getInvitations(req, res, next) {
        try {
            const inviterId = req.user.uid;

            const invitations = await AuthService.getInvitations(inviterId);

            return ApiResponse.success(res, invitations, 'Invitations retrieved successfully');
        } catch (error) {
            logger.error('Error in getInvitations:', error);
            next(error);
        }
    }
}

module.exports = AuthController;
