const { admin, firebaseConfig } = require('../config/firebaseconfig');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');
const path = require('path');
const crypto = require('crypto');

/**
 * Upload Controller
 * Handles file uploads to Firebase Storage
 */

class UploadController {
    /**
     * Upload Profile Picture
     * POST /api/upload/profile-picture
     */
    static async uploadProfilePicture(req, res, next) {
        try {
            if (!req.file) {
                // Check if file is missing
                logger.warn('Upload attempt with no file');
                return ApiResponse.badRequest(res, 'No file uploaded');
            }

            const file = req.file;
            const uid = req.user.uid;

            // Create a unique filename
            const fileExtension = path.extname(file.originalname);
            const fileName = `users/${uid}/profile-${Date.now()}${fileExtension}`;

            // Explicitly use the bucket from config
            const bucketName = firebaseConfig.storageBucket;

            if (!bucketName) {
                logger.error('Firebase storage bucket is not configured');
                return ApiResponse.internalError(res, 'Server configuration error');
            }

            logger.info(`Using storage bucket: ${bucketName}`);

            const bucket = admin.storage().bucket(bucketName);
            const fileRef = bucket.file(fileName);

            // Upload the file with a download token
            const downloadToken = crypto.randomUUID();

            await fileRef.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                    metadata: {
                        firebaseStorageDownloadTokens: downloadToken
                    }
                },
            });

            // Construct the Firebase Storage download URL manually
            // This works like the client SDK and robustly avoids signing permission issues
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(fileName)}?alt=media&token=${downloadToken}`;

            logger.info(`Generated public URL: ${publicUrl}`);

            // Optional: Update user profile immediately
            await admin.auth().updateUser(uid, {
                photoURL: publicUrl
            });

            return ApiResponse.success(res, { url: publicUrl }, 'File uploaded successfully');
        } catch (error) {
            logger.error('Error in uploadProfilePicture:', error);
            next(error);
        }
    }
}

module.exports = UploadController;
