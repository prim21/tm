# Task Management Frontend

A modern, responsive task management application built with Next.js 16, React 19, and Tailwind CSS v4.

## Features

✨ **Core Functionality**
- Create, read, update, and delete tasks
- Filter tasks by status and priority
- Real-time task statistics
- Responsive design for all devices

🎨 **Modern UI/UX**
- Clean, intuitive interface with Tailwind CSS
- Smooth animations and transitions
- Toast notifications for user feedback
- Loading states and error handling
- Empty states with helpful messages

📊 **Task Management**
- Three status levels: Pending, In Progress, Completed
- Three priority levels: Low, Medium, High
- Task descriptions with character limits
- Timestamps for creation and updates

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **API Integration**: Fetch API with custom hooks
- **State Management**: React Hooks

## Project Structure

```
frontend/
├── app/
│   ├── globals.css          # Global styles and Tailwind config
│   ├── layout.js            # Root layout with metadata
│   └── page.js              # Main task management page
├── components/
│   ├── FilterBar.js         # Task filtering component
│   ├── StatsCard.js         # Statistics display
│   ├── TaskCard.js          # Individual task card
│   └── TaskForm.js          # Task creation form
├── hooks/
│   └── useTasks.js          # Custom hooks for task operations
├── lib/
│   └── api.js               # API service layer
└── .env.local               # Environment variables
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env.local` file (already created):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

> **Note**: If port 3000 is already in use by the backend, Next.js will automatically use port 3001.

## API Integration

The frontend integrates with the backend API through a service layer (`lib/api.js`) that provides the following functions:

### Available API Functions

```javascript
import * as api from '../lib/api';

// Get all tasks (with optional filters)
const tasks = await api.getAllTasks({ status: 'pending', priority: 'high' });

// Get task by ID
const task = await api.getTaskById('123');

// Create new task
const newTask = await api.createTask({
  title: 'Task title',
  description: 'Task description',
  status: 'pending',
  priority: 'medium'
});

// Update task
const updatedTask = await api.updateTask('123', { status: 'completed' });

// Delete task
await api.deleteTask('123');

// Get statistics
const stats = await api.getTaskStats();
```

### Custom Hooks

The application uses custom React hooks for state management:

```javascript
import { useTasks, useTaskStats, useTaskOperations } from '../hooks/useTasks';

// In your component
const { tasks, loading, error, refetch } = useTasks({ status: 'pending' });
const { stats, loading, error, refetch } = useTaskStats();
const { createTask, updateTask, deleteTask, loading, error } = useTaskOperations();
```

## Components

### TaskForm
Form component for creating new tasks with validation.

**Props:**
- `onSubmit(taskData)` - Callback when form is submitted
- `loading` - Boolean to show loading state

### TaskCard
Displays individual task with inline status updates and delete action.

**Props:**
- `task` - Task object
- `onUpdate(id, updates)` - Callback for task updates
- `onDelete(id)` - Callback for task deletion

### StatsCard
Displays task statistics in a gradient card.

**Props:**
- `stats` - Statistics object from API
- `loading` - Boolean to show loading state

### FilterBar
Provides filtering options for tasks.

**Props:**
- `filters` - Current filter object
- `onFilterChange(newFilters)` - Callback when filters change

## Styling

The application uses Tailwind CSS v4 with a custom color palette:

- **Primary**: Indigo (600, 700)
- **Status Colors**:
  - Pending: Yellow
  - In Progress: Blue
  - Completed: Green
- **Priority Colors**:
  - Low: Gray
  - Medium: Orange
  - High: Red

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000/api` |

## Error Handling

The application includes comprehensive error handling:

- **Network Errors**: Displays error messages with retry options
- **Validation Errors**: Shows inline form validation
- **Empty States**: Helpful messages when no tasks exist
- **Loading States**: Skeleton loaders during data fetching

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Backend Connection Issues

If you see "Error Loading Tasks":

1. Ensure the backend server is running on `http://localhost:3000`
2. Check that CORS is enabled in the backend
3. Verify the `NEXT_PUBLIC_API_URL` in `.env.local`

### Port Conflicts

If Next.js can't start on port 3000:
- The app will automatically use port 3001
- Or specify a custom port: `npm run dev -- -p 3002`

### Build Errors

If you encounter build errors:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancements

- [ ] User authentication
- [ ] Task categories/tags
- [ ] Due dates and reminders
- [ ] Task search functionality
- [ ] Drag-and-drop task reordering
- [ ] Dark mode toggle
- [ ] Export tasks to CSV/PDF
- [ ] Task comments and attachments

## License

This project is part of the Task Management System.

## Support

For issues or questions, please refer to the backend API documentation or create an issue in the repository.
