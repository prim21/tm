/**
 * Task Model
 * This is a simple in-memory model. Replace with actual database model when integrating a database.
 */

class Task {
    constructor(id, title, description, status = 'todo', priority = 'medium', dueDate = null, category = 'General') {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status; // todo, in-progress, in-review, blocked
        this.priority = priority; // low, medium, high
        this.dueDate = dueDate;
        this.category = category;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // Static method to create a new task
    static create(data) {
        return new Task(
            Date.now().toString(), // Simple ID generation
            data.title,
            data.description,
            data.status,
            data.priority,
            data.dueDate,
            data.category // Ensure category is passed
        );
    }

    // Update task properties
    update(data) {
        if (data.title !== undefined) this.title = data.title;
        if (data.description !== undefined) this.description = data.description;
        if (data.status !== undefined) this.status = data.status;
        if (data.priority !== undefined) this.priority = data.priority;
        if (data.dueDate !== undefined) this.dueDate = data.dueDate;
        if (data.category !== undefined) this.category = data.category;
        this.updatedAt = new Date();
        return this;
    }
}

module.exports = Task;
