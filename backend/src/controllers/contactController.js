const { db } = require('../config/firebaseconfig');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Contact Controller
 * Handles HTTP requests for contact form submissions
 */

class ContactController {
    /**
     * Submit a contact form message
     * POST /api/contact
     */
    static async submitContact(req, res, next) {
        try {
            const { name, email, message } = req.body;

            // Store contact message in Firestore
            const contactData = {
                name,
                email,
                message,
                status: 'new',
                createdAt: new Date().toISOString()
            };

            const docRef = await db.collection('contacts').add(contactData);

            logger.info(`Contact form submitted: ${docRef.id} from ${email}`);

            // Send notification email asynchronously
            const { sendContactEmail } = require('../utils/emailService');
            sendContactEmail({ name, email, message }).catch(err => {
                logger.error('Failed to send contact email:', err);
            });

            return ApiResponse.created(res, { id: docRef.id }, 'Thank you for contacting us! We will get back to you soon.');
        } catch (error) {
            logger.error('Error in submitContact:', error);
            next(error);
        }
    }
}

module.exports = ContactController;
