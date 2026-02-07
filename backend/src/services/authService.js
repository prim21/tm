const { admin, db } = require('../config/firebaseconfig');
const logger = require('../utils/logger');
const EmailService = require('./emailService');

/**
 * Authentication Service
 * Handles user authentication operations using Firebase Auth
 */

class AuthService {
    /**
     * Create a new user account
     */
    static async signup(email, password, displayName) {
        try {
            // Create user in Firebase Auth
            const userRecord = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: displayName,
                emailVerified: false,
            });

            // Create custom token for immediate login
            const customToken = await admin.auth().createCustomToken(userRecord.uid);

            // Initialize User Document in Firestore with default preferences
            const defaultPreferences = {
                colorMode: 'none',
                cardOptions: {
                    showDescription: true,
                    showPriority: true,
                    showDate: true,
                    showCategory: true
                }
            };

            await db.collection('users').doc(userRecord.uid).set({
                email: email,
                displayName: displayName,
                preferences: defaultPreferences,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            logger.info(`User created successfully: ${userRecord.uid}`);

            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                token: customToken,
                preferences: defaultPreferences,
                createdAt: userRecord.metadata.creationTime,
            };
        } catch (error) {
            logger.error('Error in signup:', error);
            throw error;
        }
    }

    /**
     * Verify user token
     */
    static async verifyToken(idToken) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            return decodedToken;
        } catch (error) {
            logger.error('Error verifying token:', error);
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Get user profile by UID
     */
    static async getUserProfile(uid) {
        try {
            const userRecord = await admin.auth().getUser(uid);

            // Fetch additional data from Firestore
            const doc = await db.collection('users').doc(uid).get();
            const firestoreData = doc.exists ? doc.data() : {};

            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
                emailVerified: userRecord.emailVerified,
                disabled: userRecord.disabled,
                createdAt: userRecord.metadata.creationTime,
                lastSignInTime: userRecord.metadata.lastSignInTime,
                preferences: firestoreData.preferences || {}, // Include preferences
            };
        } catch (error) {
            logger.error('Error getting user profile:', error);
            throw new Error('User not found');
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(uid, updates) {
        try {
            // 1. Update basic Auth profile
            const allowedAuthUpdates = {};
            if (updates.displayName !== undefined) allowedAuthUpdates.displayName = updates.displayName;
            if (updates.photoURL !== undefined) allowedAuthUpdates.photoURL = updates.photoURL;

            if (Object.keys(allowedAuthUpdates).length > 0) {
                await admin.auth().updateUser(uid, allowedAuthUpdates);
            }

            // 2. Update Firestore preferences
            if (updates.preferences) {
                await db.collection('users').doc(uid).set({
                    preferences: updates.preferences,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            }

            // Return full updated profile
            return await this.getUserProfile(uid);
        } catch (error) {
            logger.error('Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Send password reset email
     */
    static async sendPasswordResetEmail(email) {
        try {
            // Generate password reset link
            const link = await admin.auth().generatePasswordResetLink(email);

            logger.info(`Password reset link generated for: ${email}`);

            // In production, you would send this via email service
            // For now, we'll return the link
            return {
                message: 'Password reset email sent',
                resetLink: link, // Remove this in production
            };
        } catch (error) {
            logger.error('Error sending password reset email:', error);
            throw error;
        }
    }

    /**
     * Delete user account
     */
    static async deleteUser(uid) {
        try {
            await admin.auth().deleteUser(uid);
            logger.info(`User deleted: ${uid}`);
            return { message: 'User account deleted successfully' };
        } catch (error) {
            logger.error('Error deleting user:', error);
            throw error;
        }
    }

    /**
     * Get user by email
     */
    static async getUserByEmail(email) {
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
            };
        } catch (error) {
            logger.error('Error getting user by email:', error);
            throw new Error('User not found');
        }
    }

    /**
     * List all users (admin only, with pagination)
     */
    static async listUsers(maxResults = 10, pageToken = null) {
        try {
            const listUsersResult = await admin.auth().listUsers(maxResults, pageToken);

            const users = listUsersResult.users.map(userRecord => ({
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                emailVerified: userRecord.emailVerified,
                disabled: userRecord.disabled,
            }));

            return {
                users,
                pageToken: listUsersResult.pageToken,
            };
        } catch (error) {
            logger.error('Error listing users:', error);
            throw error;
        }
    }

    /**
     * Create invitation
     */
    static async createInvitation(email, inviterId) {
        try {
            const invitation = {
                email,
                inviterId,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            await db.collection('invitations').add(invitation);
            logger.info(`Invitation created for ${email} by ${inviterId}`);

            // Send email
            const inviter = await this.getUserProfile(inviterId);
            await EmailService.sendInvitationEmail(email, inviter.displayName || 'A colleague');

            return { message: 'Invitation created and email sent successfully' };
        } catch (error) {
            logger.error('Error creating invitation:', error);
            throw error;
        }
    }

    /**
     * Get invitations by inviter ID
     */
    static async getInvitations(inviterId) {
        try {
            const snapshot = await db.collection('invitations')
                .where('inviterId', '==', inviterId)
                .get();

            if (snapshot.empty) {
                return [];
            }

            const invitations = [];
            snapshot.forEach(doc => {
                invitations.push({ id: doc.id, ...doc.data() });
            });

            return invitations;
        } catch (error) {
            logger.error('Error getting invitations:', error);
            throw error;
        }
    }
}

module.exports = AuthService;
