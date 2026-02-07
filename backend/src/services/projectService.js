const { db } = require('../config/firebaseconfig');
const logger = require('../utils/logger');

const COLLECTION_NAME = 'projects';

class ProjectService {
    /**
     * Create a new project
     * @param {string} userId
     * @param {string} name
     */
    static async createProject(userId, name) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc();
            const project = {
                id: docRef.id,
                ownerId: userId,
                name: name,
                createdAt: new Date().toISOString()
            };
            await docRef.set(project);
            return project;
        } catch (error) {
            logger.error('Error creating project:', error);
            throw error;
        }
    }

    /**
     * Get projects for a user
     * @param {string} userId 
     */
    static async getProjects(userId) {
        try {
            const snapshot = await db.collection(COLLECTION_NAME)
                .where('ownerId', '==', userId)
                .get();

            const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            logger.error('Error fetching projects:', error);
            throw error;
        }
    }

    /**
     * Delete a project
     */
    static async deleteProject(userId, projectId) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(projectId);
            const doc = await docRef.get();

            if (!doc.exists) throw new Error('Project not found');
            if (doc.data().ownerId !== userId) throw new Error('Unauthorized');

            await docRef.delete();
            return { message: 'Project deleted' };
        } catch (error) {
            logger.error('Error deleting project:', error);
            throw error;
        }
    }
}

module.exports = ProjectService;
