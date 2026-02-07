# Task Management API Documentation

## Base URL
```
http://localhost:3000/api
```

## Table of Contents
- [Overview](#overview)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Get All Tasks](#get-all-tasks)
  - [Get Task by ID](#get-task-by-id)
  - [Create Task](#create-task)
  - [Update Task](#update-task)
  - [Delete Task](#delete-task)
  - [Get Task Statistics](#get-task-statistics)
- [Data Models](#data-models)
- [Frontend Integration Examples](#frontend-integration-examples)

---

## Overview

The Task Management API is a RESTful API built with Express.js and Firebase. It provides endpoints for managing tasks with full CRUD operations and filtering capabilities.

**Version:** 1.0.0  
**Environment:** Development  
**Port:** 3000

---

## Response Format

All API responses follow a consistent JSON structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors if applicable */ ]
}
```

---

## Error Handling

### HTTP Status Codes
- `200 OK` - Successful GET, PUT, DELETE requests
- `201 Created` - Successful POST request
- `400 Bad Request` - Validation errors or malformed request
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Common Error Messages
- `Task not found` - When requesting a task that doesn't exist
- `Title is required` - When creating a task without a title
- `Invalid status/priority` - When providing invalid enum values

---

## Endpoints

### Health Check

Check if the API server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-04T02:35:26.000Z"
}
```

---

### Get All Tasks

Retrieve all tasks with optional filtering.

**Endpoint:** `GET /tasks`

**Query Parameters:**
| Parameter | Type | Required | Description | Valid Values |
|-----------|------|----------|-------------|--------------|
| `status` | string | No | Filter by task status | `pending`, `in-progress`, `completed` |
| `priority` | string | No | Filter by task priority | `low`, `medium`, `high` |

**Example Requests:**
```bash
# Get all tasks
GET /api/tasks

# Get only pending tasks
GET /api/tasks?status=pending

# Get high priority tasks
GET /api/tasks?priority=high

# Get pending high priority tasks
GET /api/tasks?status=pending&priority=high
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": "1707012926000",
      "title": "Complete project documentation",
      "description": "Write API documentation for frontend integration",
      "status": "in-progress",
      "priority": "high",
      "createdAt": "2026-02-04T02:35:26.000Z",
      "updatedAt": "2026-02-04T02:35:26.000Z"
    }
  ]
}
```

---

### Get Task by ID

Retrieve a specific task by its ID.

**Endpoint:** `GET /tasks/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID |

**Example Request:**
```bash
GET /api/tasks/1707012926000
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "id": "1707012926000",
    "title": "Complete project documentation",
    "description": "Write API documentation for frontend integration",
    "status": "in-progress",
    "priority": "high",
    "createdAt": "2026-02-04T02:35:26.000Z",
    "updatedAt": "2026-02-04T02:35:26.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

### Create Task

Create a new task.

**Endpoint:** `POST /tasks`

**Request Body:**
| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `title` | string | Yes | Task title | 3-100 characters |
| `description` | string | No | Task description | Max 500 characters |
| `status` | string | No | Task status (default: `pending`) | `pending`, `in-progress`, `completed` |
| `priority` | string | No | Task priority (default: `medium`) | `low`, `medium`, `high` |

**Example Request:**
```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write API documentation for frontend integration",
  "status": "in-progress",
  "priority": "high"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "1707012926000",
    "title": "Complete project documentation",
    "description": "Write API documentation for frontend integration",
    "status": "in-progress",
    "priority": "high",
    "createdAt": "2026-02-04T02:35:26.000Z",
    "updatedAt": "2026-02-04T02:35:26.000Z"
  }
}
```

**Validation Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

---

### Update Task

Update an existing task.

**Endpoint:** `PUT /tasks/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID |

**Request Body:**
All fields are optional. Only include fields you want to update.

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `title` | string | No | Task title | 3-100 characters |
| `description` | string | No | Task description | Max 500 characters |
| `status` | string | No | Task status | `pending`, `in-progress`, `completed` |
| `priority` | string | No | Task priority | `low`, `medium`, `high` |

**Example Request:**
```bash
PUT /api/tasks/1707012926000
Content-Type: application/json

{
  "status": "completed"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "1707012926000",
    "title": "Complete project documentation",
    "description": "Write API documentation for frontend integration",
    "status": "completed",
    "priority": "high",
    "createdAt": "2026-02-04T02:35:26.000Z",
    "updatedAt": "2026-02-04T03:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

### Delete Task

Delete a task by ID.

**Endpoint:** `DELETE /tasks/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID |

**Example Request:**
```bash
DELETE /api/tasks/1707012926000
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": null
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

### Get Task Statistics

Get statistics about all tasks (counts by status and priority).

**Endpoint:** `GET /tasks/stats`

**Example Request:**
```bash
GET /api/tasks/stats
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Task statistics retrieved successfully",
  "data": {
    "total": 10,
    "byStatus": {
      "pending": 3,
      "in-progress": 5,
      "completed": 2
    },
    "byPriority": {
      "low": 2,
      "medium": 5,
      "high": 3
    }
  }
}
```

---

## Data Models

### Task Object

```typescript
interface Task {
  id: string;                    // Unique identifier (timestamp-based)
  title: string;                 // Task title (3-100 chars)
  description?: string;          // Task description (max 500 chars)
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;            // ISO 8601 date string
  updatedAt: string;            // ISO 8601 date string
}
```

### Task Statistics Object

```typescript
interface TaskStats {
  total: number;
  byStatus: {
    pending: number;
    'in-progress': number;
    completed: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}
```

---

## Frontend Integration Examples

### Using Fetch API

#### Get All Tasks
```javascript
async function getAllTasks(filters = {}) {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `http://localhost:3000/api/tasks${queryParams ? '?' + queryParams : ''}`;
  
  try {
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

// Usage
const tasks = await getAllTasks({ status: 'pending', priority: 'high' });
```

#### Create Task
```javascript
async function createTask(taskData) {
  try {
    const response = await fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

// Usage
const newTask = await createTask({
  title: 'New Task',
  description: 'Task description',
  status: 'pending',
  priority: 'medium'
});
```

#### Update Task
```javascript
async function updateTask(taskId, updates) {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

// Usage
const updatedTask = await updateTask('1707012926000', { status: 'completed' });
```

#### Delete Task
```javascript
async function deleteTask(taskId) {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

// Usage
await deleteTask('1707012926000');
```

#### Get Task Statistics
```javascript
async function getTaskStats() {
  try {
    const response = await fetch('http://localhost:3000/api/tasks/stats');
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error fetching task stats:', error);
    throw error;
  }
}

// Usage
const stats = await getTaskStats();
console.log(`Total tasks: ${stats.total}`);
console.log(`Pending: ${stats.byStatus.pending}`);
```

### Using Axios

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all tasks
export const getAllTasks = async (filters = {}) => {
  const response = await api.get('/tasks', { params: filters });
  return response.data.data;
};

// Get task by ID
export const getTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data.data;
};

// Create task
export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data.data;
};

// Update task
export const updateTask = async (id, updates) => {
  const response = await api.put(`/tasks/${id}`, updates);
  return response.data.data;
};

// Delete task
export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

// Get task statistics
export const getTaskStats = async () => {
  const response = await api.get('/tasks/stats');
  return response.data.data;
};
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(filters).toString();
        const url = `http://localhost:3000/api/tasks${queryParams ? '?' + queryParams : ''}`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
          setTasks(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [JSON.stringify(filters)]);

  return { tasks, loading, error };
}

// Usage in component
function TaskList() {
  const { tasks, loading, error } = useTasks({ status: 'pending' });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

---

## CORS Configuration

The API is configured to accept requests from all origins in development mode. If you need to restrict this in production, update the CORS configuration in the backend.

---

## Notes

1. **Authentication**: Currently, the API does not require authentication. You may want to add authentication middleware for production use.

2. **Database**: The current implementation uses an in-memory data store. Data will be lost when the server restarts. Consider integrating Firebase Firestore for persistent storage.

3. **Validation**: All endpoints include input validation. Check the error responses for detailed validation messages.

4. **Rate Limiting**: No rate limiting is currently implemented. Consider adding rate limiting for production use.

5. **Timestamps**: All timestamps are in ISO 8601 format (e.g., `2026-02-04T02:35:26.000Z`).

---

## Support

For issues or questions, please refer to the backend README.md or contact the development team.
