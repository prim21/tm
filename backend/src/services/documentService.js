const { db } = require('../config/firebaseconfig');
const logger = require('../utils/logger');

/**
 * Document Service
 * Business logic for document operations using Firebase Firestore
 */

const COLLECTION_NAME = 'documents';

class DocumentService {
    // Get all documents with filters
    static async getAllDocuments(filters = {}) {
        try {
            let query = db.collection(COLLECTION_NAME);

            // Filters
            if (filters.ownerId) {
                // If filtering by "Shared with me", we might need a separate query or an 'OR' condition (which is hard in Firestore v1)
                // For now, assuming ownerId matches 'ownerId' field.
                // For 'shared', we check if ownerId is in 'sharedWith' array.
                // Firestore doesn't support logical OR directly in one query for different fields easily without fancy indexing.
                // We'll handle 'shared' flag separately or expect the caller to switch context.
                if (filters.tab === 'shared') {
                    query = query.where('sharedWith', 'array-contains', filters.ownerId);
                } else {
                    // Default to own documents unless strictly viewing shared
                    // If complex permissions needed, specific logic applies. 
                    // For simplicity:
                    query = query.where('ownerId', '==', filters.ownerId);
                }
            }

            if (filters.isStarred) {
                query = query.where('isStarred', '==', true);
            }

            if (filters.type) {
                query = query.where('type', '==', filters.type);
            }

            if (filters.isTemplate) {
                query = query.where('isTemplate', '==', true);
            }

            const snapshot = await query.get();
            let documents = [];

            snapshot.forEach(doc => {
                documents.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            // In-memory filters and sorting
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                documents = documents.filter(doc =>
                    (doc.title && doc.title.toLowerCase().includes(searchLower)) ||
                    (doc.content && doc.content.toLowerCase().includes(searchLower))
                );
            }

            // Sorting
            const sortBy = filters.sortBy || 'updatedAt';
            const sortOrder = filters.sortOrder || 'desc';

            documents.sort((a, b) => {
                let aValue, bValue;

                switch (sortBy) {
                    case 'name':
                        aValue = (a.title || '').toLowerCase();
                        bValue = (b.title || '').toLowerCase();
                        break;
                    case 'size':
                        aValue = a.size || 0;
                        bValue = b.size || 0;
                        break;
                    case 'type':
                        aValue = a.type || '';
                        bValue = b.type || '';
                        break;
                    case 'createdAt':
                        aValue = new Date(a.createdAt);
                        bValue = new Date(b.createdAt);
                        break;
                    case 'updatedAt':
                    default:
                        aValue = new Date(a.updatedAt);
                        bValue = new Date(b.updatedAt);
                        break;
                }

                if (sortOrder === 'asc') {
                    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
                } else {
                    return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
                }
            });

            return documents;
        } catch (error) {
            logger.error('Error in getAllDocuments:', error);
            throw error;
        }
    }

    // Get document by ID
    static async getDocumentById(id) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(id);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new Error('Document not found');
            }

            return {
                id: doc.id,
                ...doc.data(),
            };
        } catch (error) {
            logger.error('Error in getDocumentById:', error);
            throw error;
        }
    }

    // Create new document
    static async createDocument(docData) {
        try {
            const newDoc = {
                title: docData.title,
                content: docData.content || '', // content or URL if file
                type: docData.type || 'doc', // doc, spreadsheet, pdf
                size: docData.size || 0, // bytes
                isStarred: docData.isStarred || false,
                isTemplate: docData.isTemplate || false,
                sharedWith: docData.sharedWith || [],
                ownerId: docData.ownerId,

                category: docData.category || 'General',
                linkedEventId: docData.linkedEventId || null,
                linkedTaskId: docData.linkedTaskId || null,

                // Metadata
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const docRef = await db.collection(COLLECTION_NAME).add(newDoc);

            return {
                id: docRef.id,
                ...newDoc,
            };
        } catch (error) {
            logger.error('Error in createDocument:', error);
            throw error;
        }
    }

    // Update document
    static async updateDocument(id, updateData) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(id);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new Error('Document not found');
            }

            const updatedData = {
                ...updateData,
                updatedAt: new Date().toISOString(),
            };

            await docRef.update(updatedData);

            const updatedDoc = await docRef.get();
            return {
                id: updatedDoc.id,
                ...updatedDoc.data(),
            };
        } catch (error) {
            logger.error('Error in updateDocument:', error);
            throw error;
        }
    }

    // Share document
    static async shareDocument(id, email) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(id);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new Error('Document not found');
            }

            const data = doc.data();
            const sharedWith = data.sharedWith || [];

            if (!sharedWith.includes(email)) {
                sharedWith.push(email);
                await docRef.update({ sharedWith, updatedAt: new Date().toISOString() });
            }

            return { id, sharedWith };
        } catch (error) {
            logger.error('Error in shareDocument:', error);
            throw error;
        }
    }

    // Delete document
    static async deleteDocument(id) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(id);
            await docRef.delete();
            return { id };
        } catch (error) {
            logger.error('Error in deleteDocument:', error);
            throw error;
        }
    }

    // Bulk delete
    static async bulkDeleteDocuments(ids) {
        try {
            const batch = db.batch();
            ids.forEach(id => {
                const docRef = db.collection(COLLECTION_NAME).doc(id);
                batch.delete(docRef);
            });
            await batch.commit();
            return { ids };
        } catch (error) {
            logger.error('Error in bulkDeleteDocuments:', error);
            throw error;
        }
    }

    // Storage insights
    static async getStorageInsights(ownerId) {
        try {
            const snapshot = await db.collection(COLLECTION_NAME)
                .where('ownerId', '==', ownerId)
                .get();

            let totalSize = 0;
            const breakdown = {
                docs: 0,
                spreadsheets: 0,
                pdfs: 0,
                other: 0
            };

            snapshot.forEach(doc => {
                const data = doc.data();
                const size = data.size || 0;
                const type = data.type || 'other';

                totalSize += size;
                if (breakdown[type] !== undefined) {
                    breakdown[type] += size;
                } else {
                    breakdown.other += size;
                }
            });

            return {
                totalSize,
                breakdown
            };
        } catch (error) {
            logger.error('Error in getStorageInsights:', error);
            throw error;
        }
    }
}

module.exports = DocumentService;
