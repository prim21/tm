const express = require('express');
const CalendarController = require('../controllers/calendarController');
// const validate = require('../middlewares/validate');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication
router.use(authMiddleware);

/**
 * Calendar Routes
 * @route /api/calendar
 */

// Get events
router.get('/events', CalendarController.getEvents);

// Suggest slots
router.get('/suggest-slots', CalendarController.suggestSlots);

// Create event
router.post('/events', CalendarController.createEvent);

// Update event
router.put('/events/:id', CalendarController.updateEvent);

// Delete event
router.delete('/events/:id', CalendarController.deleteEvent);

module.exports = router;
