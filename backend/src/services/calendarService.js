const { db } = require('../config/firebaseconfig');
const logger = require('../utils/logger');

/**
 * Calendar Service
 * Business logic for calendar events
 */

const COLLECTION_NAME = 'events';

class CalendarService {
    // Get events with date range filter
    static async getEvents(filters = {}) {
        try {
            let query = db.collection(COLLECTION_NAME);

            if (filters.ownerId) {
                query = query.where('ownerId', '==', filters.ownerId);
            }

            // Note: In real app, we query by start/end range. 
            // Firestore needs composite index for range filter on different field than equality filter (ownerId).
            // For simplicity, we fetch info for owner and filter in memory if needed, or assume basic query is fine.

            const snapshot = await query.get();
            let events = [];

            snapshot.forEach(doc => {
                events.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            // Date filtering
            if (filters.startDate && filters.endDate) {
                const start = new Date(filters.startDate);
                const end = new Date(filters.endDate);
                events = events.filter(event => {
                    const eventStart = new Date(event.startDate);
                    return eventStart >= start && eventStart <= end;
                });
            }

            return events;
        } catch (error) {
            logger.error('Error in getEvents:', error);
            throw error;
        }
    }

    // Create event
    static async createEvent(eventData) {
        try {
            const newEvent = {
                title: eventData.title,
                description: eventData.description || '',
                startDate: eventData.startDate, // ISO string
                endDate: eventData.endDate, // ISO string
                allDay: eventData.allDay || false,
                type: eventData.type || 'event', // meeting, deadline, personal, focus
                color: eventData.color || '#3788d8',
                location: eventData.location || '',

                // Linked items
                linkedDocumentIds: eventData.linkedDocumentIds || [],
                linkedTaskIds: eventData.linkedTaskIds || [],

                ownerId: eventData.ownerId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const docRef = await db.collection(COLLECTION_NAME).add(newEvent);

            return {
                id: docRef.id,
                ...newEvent,
            };
        } catch (error) {
            logger.error('Error in createEvent:', error);
            throw error;
        }
    }

    // Update event
    static async updateEvent(id, updateData) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(id);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new Error('Event not found');
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
            logger.error('Error in updateEvent:', error);
            throw error;
        }
    }

    // Delete event
    static async deleteEvent(id) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(id);
            await docRef.delete();
            return { id };
        } catch (error) {
            logger.error('Error in deleteEvent:', error);
            throw error;
        }
    }

    // Suggest meeting times
    static async suggestSlots(ownerId, durationMinutes, startDate, endDate) {
        try {
            // Get existing events in range
            const filters = { ownerId, startDate, endDate };
            const events = await this.getEvents(filters);

            // Sort events by start time
            events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            const suggestions = [];
            const searchStart = new Date(startDate);
            const searchEnd = new Date(endDate);
            const durationMs = durationMinutes * 60 * 1000;

            let currentPointer = searchStart;

            // Simplified linear search for gaps
            // This does not account for complex overlaps, just finds gaps between sorted events
            // In a real app, you'd merge overlapping events first.

            for (const event of events) {
                const eventStart = new Date(event.startDate);
                const eventEnd = new Date(event.endDate);

                if (eventStart > currentPointer) {
                    const gap = eventStart - currentPointer;
                    if (gap >= durationMs) {
                        suggestions.push({
                            start: currentPointer.toISOString(),
                            end: new Date(currentPointer.getTime() + durationMs).toISOString(),
                            availableDuration: gap / (60 * 1000)
                        });
                    }
                }

                if (eventEnd > currentPointer) {
                    currentPointer = eventEnd;
                }
            }

            // Check gap after last event
            if (searchEnd > currentPointer) {
                const gap = searchEnd - currentPointer;
                if (gap >= durationMs) {
                    suggestions.push({
                        start: currentPointer.toISOString(),
                        end: new Date(currentPointer.getTime() + durationMs).toISOString(),
                        availableDuration: gap / (60 * 1000)
                    });
                }
            }

            return suggestions.slice(0, 5); // Return top 5 slots
        } catch (error) {
            logger.error('Error in suggestSlots:', error);
            throw error;
        }
    }
}

module.exports = CalendarService;
