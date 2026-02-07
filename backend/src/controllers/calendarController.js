const CalendarService = require('../services/calendarService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

class CalendarController {
    static async getEvents(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const ownerId = req.user.uid;

            const filters = { startDate, endDate, ownerId };
            const events = await CalendarService.getEvents(filters);

            return ApiResponse.success(res, events, 'Events retrieved successfully');
        } catch (error) {
            logger.error('Error in getEvents:', error);
            next(error);
        }
    }

    static async createEvent(req, res, next) {
        try {
            const eventData = { ...req.body, ownerId: req.user.uid };
            const newEvent = await CalendarService.createEvent(eventData);
            return ApiResponse.created(res, newEvent, 'Event created successfully');
        } catch (error) {
            logger.error('Error in createEvent:', error);
            next(error);
        }
    }

    static async updateEvent(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedEvent = await CalendarService.updateEvent(id, updateData);
            return ApiResponse.success(res, updatedEvent, 'Event updated successfully');
        } catch (error) {
            logger.error('Error in updateEvent:', error);
            next(error);
        }
    }

    static async deleteEvent(req, res, next) {
        try {
            const { id } = req.params;
            await CalendarService.deleteEvent(id);
            return ApiResponse.success(res, null, 'Event deleted successfully');
        } catch (error) {
            logger.error('Error in deleteEvent:', error);
            next(error);
        }
    }

    static async suggestSlots(req, res, next) {
        try {
            const { duration = 30, startDate, endDate } = req.query;
            const ownerId = req.user.uid;

            if (!startDate || !endDate) {
                return ApiResponse.badRequest(res, 'Start date and end date are required');
            }

            const suggestions = await CalendarService.suggestSlots(ownerId, parseInt(duration), startDate, endDate);
            return ApiResponse.success(res, suggestions, 'Scheduling suggestions retrieved successfully');
        } catch (error) {
            logger.error('Error in suggestSlots:', error);
            next(error);
        }
    }
}

module.exports = CalendarController;
