const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contactController');
const { contactValidators, handleValidationErrors } = require('../validators/contactValidator');

/**
 * Contact Routes
 * Base path: /api/contact
 */

/**
 * @route   POST /api/contact
 * @desc    Submit a contact form message
 * @access  Public
 */
router.post(
    '/',
    contactValidators.submitContact,
    handleValidationErrors,
    ContactController.submitContact
);

module.exports = router;
