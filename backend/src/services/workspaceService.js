const { db } = require('../config/firebaseconfig');
const logger = require('../utils/logger');

class WorkspaceService {
    /**
     * Create a new workspace
     * @param {string} userId - The ID of the user creating the workspace
     * @param {string} name - The name of the workspace
     * @returns {Object} The created workspace
     */
    static async createWorkspace(userId, name) {
        try {
            const docRef = db.collection('workspaces').doc();
            const workspace = {
                id: docRef.id,
                ownerId: userId,
                name: name,
                createdAt: new Date().toISOString()
            };
            await docRef.set(workspace);
            logger.info(`Workspace created: ${workspace.id} for user ${userId}`);
            return workspace;
        } catch (error) {
            logger.error('Error creating workspace:', error);
            throw error;
        }
    }

    /**
     * Get all workspaces for a user
     * @param {string} userId - The ID of the user
     * @returns {Array} List of workspaces
     */
    static async getWorkspaces(userId) {
        try {
            const snapshot = await db.collection('workspaces')
                .where('ownerId', '==', userId)
                .get();

            const workspaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort in memory to avoid Firestore index requirement
            return workspaces.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            logger.error('Error fetching workspaces:', error);
            throw error;
        }
    }

    /**
     * Delete a workspace
     * @param {string} userId - Owner ID
     * @param {string} workspaceId - Workspace ID
     */
    static async deleteWorkspace(userId, workspaceId) {
        try {
            const docRef = db.collection('workspaces').doc(workspaceId);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new Error('Workspace not found');
            }

            if (doc.data().ownerId !== userId) {
                throw new Error('Unauthorized');
            }

            await docRef.delete();
            return { message: 'Workspace deleted' };
        } catch (error) {
            logger.error('Error deleting workspace:', error);
            throw error;
        }
    }
}

module.exports = WorkspaceService;
