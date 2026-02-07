const DocumentService = require('../services/documentService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

class DocumentController {
    static async getAllDocuments(req, res, next) {
        try {
            const { tab, type, search, isStarred, isTemplate } = req.query;
            const ownerId = req.user.uid;

            const filters = { tab, type, search, isStarred, isTemplate, ownerId };
            const documents = await DocumentService.getAllDocuments(filters);

            return ApiResponse.success(res, documents, 'Documents retrieved successfully');
        } catch (error) {
            logger.error('Error in getAllDocuments:', error);
            next(error);
        }
    }

    static async getDocumentById(req, res, next) {
        try {
            const { id } = req.params;
            console.log('=== GET DOCUMENT BY ID ===');
            console.log('Document ID:', id);
            console.log('User UID:', req.user?.uid);

            const document = await DocumentService.getDocumentById(id);

            console.log('Document found:', {
                id: document.id,
                title: document.title,
                contentLength: document.content?.length || 0,
                type: document.type
            });

            return ApiResponse.success(res, document, 'Document retrieved successfully');
        } catch (error) {
            console.error('ERROR in getDocumentById:', error.message);
            logger.error('Error in getDocumentById:', error);
            next(error);
        }
    }

    static async createDocument(req, res, next) {
        try {
            console.log('=== CREATE DOCUMENT REQUEST ===');
            console.log('Request Body:', JSON.stringify(req.body, null, 2));
            console.log('Title value:', req.body.title);
            console.log('Title type:', typeof req.body.title);
            console.log('User UID:', req.user?.uid);

            if (!req.body.title || req.body.title.trim() === '') {
                console.log('ERROR: Title validation failed');
                return ApiResponse.badRequest(res, 'Title is required and cannot be empty');
            }

            const docData = { ...req.body, ownerId: req.user.uid };
            console.log('Creating document with data:', docData);

            const newDoc = await DocumentService.createDocument(docData);
            console.log('Document created successfully:', newDoc.id);

            return ApiResponse.created(res, newDoc, 'Document created successfully');
        } catch (error) {
            logger.error('Error in createDocument:', error);
            next(error);
        }
    }

    static async updateDocument(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            console.log('=== UPDATE DOCUMENT ===');
            console.log('Document ID:', id);
            console.log('User UID:', req.user?.uid);
            console.log('Update data:', {
                title: updateData.title,
                contentLength: updateData.content?.length || 0,
                size: updateData.size,
                type: updateData.type
            });

            const updatedDoc = await DocumentService.updateDocument(id, updateData);

            console.log('Document updated successfully:', {
                id: updatedDoc.id,
                title: updatedDoc.title,
                updatedAt: updatedDoc.updatedAt
            });

            return ApiResponse.success(res, updatedDoc, 'Document updated successfully');
        } catch (error) {
            console.error('ERROR in updateDocument:', error.message);
            logger.error('Error in updateDocument:', error);
            next(error);
        }
    }

    static async deleteDocument(req, res, next) {
        try {
            const { id } = req.params;
            await DocumentService.deleteDocument(id);
            return ApiResponse.success(res, null, 'Document deleted successfully');
        } catch (error) {
            logger.error('Error in deleteDocument:', error);
            next(error);
        }
    }

    static async bulkDeleteDocuments(req, res, next) {
        try {
            const { ids } = req.body;
            await DocumentService.bulkDeleteDocuments(ids);
            return ApiResponse.success(res, null, 'Documents deleted successfully');
        } catch (error) {
            logger.error('Error in bulkDeleteDocuments:', error);
            next(error);
        }
    }

    static async getStorageInsights(req, res, next) {
        try {
            const ownerId = req.user.uid;
            const insights = await DocumentService.getStorageInsights(ownerId);
            return ApiResponse.success(res, insights, 'Storage insights retrieved successfully');
        } catch (error) {
            logger.error('Error in getStorageInsights:', error);
            next(error);
        }
    }

    static async toggleStar(req, res, next) {
        try {
            const { id } = req.params;
            const { isStarred } = req.body;

            const updatedDoc = await DocumentService.updateDocument(id, { isStarred });
            return ApiResponse.success(res, updatedDoc, 'Document star status updated');
        } catch (error) {
            logger.error('Error in toggleStar:', error);
            next(error);
        }
    }

    static async shareDocument(req, res, next) {
        try {
            const { id } = req.params;
            const { email } = req.body;

            if (!email) {
                return ApiResponse.error(res, 'Email is required', 400);
            }

            const result = await DocumentService.shareDocument(id, email);
            return ApiResponse.success(res, result, 'Document shared successfully');
        } catch (error) {
            logger.error('Error in shareDocument:', error);
            next(error);
        }
    }
}

module.exports = DocumentController;
