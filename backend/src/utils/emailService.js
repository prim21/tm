const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('./logger');

/**
 * Create a transporter for sending emails
 */
const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: parseInt(config.email.port, 10),
    secure: config.email.port == 465, // true for 465, false for other ports
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

/**
 * Send an email notification for contact form submission
 * 
 * @param {Object} data - Contact form data
 * @param {string} data.name - Sender's name
 * @param {string} data.email - Sender's email
 * @param {string} data.message - Message content
 * @returns {Promise<void>}
 */
exports.sendContactEmail = async ({ name, email, message }) => {
    try {
        if (!config.email.user || !config.email.pass) {
            logger.warn('Email credentials not configured. Skipping email notification.');
            return;
        }

        const mailOptions = {
            from: config.email.from,
            to: config.email.user, // Send to admin or configured email
            subject: `New Contact Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `,
            replyTo: email,
        };

        const result = await transporter.sendMail(mailOptions);
        logger.info(`Contact email sent successfully: ${result.messageId}`);
    } catch (error) {
        logger.error('Error sending contact email:', error);
        // We log the error but don't re-throw it so the API response isn't blocked 
        // if email fails (e.g. invalid credentials)
    }
};
