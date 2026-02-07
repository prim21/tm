const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            logger.warn('SMTP configuration not found. Emails will be logged to console only.');
        }
    }

    async sendInvitationEmail(to, inviterName) {
        const subject = 'You have been invited to join a workspace';
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Welcome!</h2>
                <p>You have been invited by <strong>${inviterName}</strong> to join their workspace on Task Management App.</p>
                <p>Please log in or sign up to view the workspace.</p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">Join Now</a>
            </div>
        `;

        return this.sendEmail(to, subject, html);
    }

    async sendEmail(to, subject, html) {
        if (this.transporter) {
            try {
                const info = await this.transporter.sendMail({
                    from: process.env.SMTP_FROM || '"Task App" <noreply@taskapp.com>',
                    to,
                    subject,
                    html,
                });
                logger.info(`Email sent: ${info.messageId}`);
                return true;
            } catch (error) {
                logger.error('Error sending email:', error);
                return false;
            }
        } else {
            // Mock send
            logger.info('---------------------------------------------------');
            logger.info(`[MOCK EMAIL] To: ${to}`);
            logger.info(`[MOCK EMAIL] Subject: ${subject}`);
            logger.info(`[MOCK EMAIL] Body: ${html}`);
            logger.info('---------------------------------------------------');
            return true;
        }
    }
}

module.exports = new EmailService();
