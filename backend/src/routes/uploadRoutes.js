const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/uploadController');
const { authMiddleware } = require('../middlewares/auth');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
});

/**
 * Upload Routes
 * Base path: /api/upload
 */

// Upload profile picture
router.post(
    '/profile-picture',
    authMiddleware,
    upload.single('image'),
    UploadController.uploadProfilePicture
);

module.exports = router;
