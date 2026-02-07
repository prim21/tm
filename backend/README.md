# Task Management Backend API

A RESTful API built with Express.js and Firebase Firestore for managing tasks with a clean, scalable architecture.

## 📁 Project Structure

```
src/
 ├── controllers/     # Request handlers
 ├── routes/          # API route definitions
 ├── services/        # Business logic layer
 ├── models/          # Data models
 ├── middlewares/     # Custom middleware functions
 ├── validators/      # Input validation rules
 ├── utils/           # Utility functions
 ├── config/          # Configuration files
 ├── tests/           # Test files
 └── app.js           # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))
- Google Cloud SDK (for local development authentication)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your `.env` file with appropriate values

4. **Set up Firebase** (IMPORTANT):
   - See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase configuration
   - You need to authenticate with Firebase using one of these methods:
     - Run `gcloud auth application-default login` (recommended for development)
     - OR download a service account key from Firebase Console
   - Make sure Firestore is enabled in your Firebase project

### Running the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file)

## 📚 API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Tasks
- `GET /api/tasks` - Get all tasks (supports filtering by status and priority)
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/tasks/stats` - Get task statistics

### Example Request

**Create a task:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "pending",
    "priority": "high"
  }'
```

**Get all tasks:**
```bash
curl http://localhost:3000/api/tasks
```

**Filter tasks by status:**
```bash
curl http://localhost:3000/api/tasks?status=pending
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

Watch mode:
```bash
npm run test:watch
```

## 🏗️ Architecture

### Layered Architecture

1. **Routes Layer** (`routes/`)
   - Defines API endpoints
   - Applies validation middleware
   - Routes requests to controllers

2. **Controllers Layer** (`controllers/`)
   - Handles HTTP requests/responses
   - Validates input
   - Calls service layer
   - Formats responses

3. **Services Layer** (`services/`)
   - Contains business logic
   - Interacts with models/database
   - Reusable across controllers

4. **Models Layer** (`models/`)
   - Data structure definitions
   - Database schema (when using a database)

### Key Features

- ✅ **Firebase Firestore**: Cloud-based NoSQL database for persistent storage
- ✅ **Validation**: Input validation using express-validator
- ✅ **Error Handling**: Centralized error handling middleware
- ✅ **Logging**: Custom logger utility
- ✅ **Security**: Helmet.js for security headers
- ✅ **CORS**: Configurable CORS support
- ✅ **Testing**: Jest and Supertest for API testing
- ✅ **Standardized Responses**: Consistent API response format

## 🔧 Configuration

Edit `src/config/index.js` to modify:
- Server port
- CORS settings
- Database configuration (when integrated)
- JWT settings (when implementing authentication)

## 📝 Environment Variables

```env
PORT=3000
NODE_ENV=development
```

See `.env.example` for all available options.

## 🗄️ Database - Firebase Firestore

This project uses **Firebase Firestore** as the database. All tasks are stored in the cloud and persist across server restarts.

**Collection Structure:**
- Collection: `tasks`
- Documents: Auto-generated IDs
- Fields: `title`, `description`, `status`, `priority`, `createdAt`, `updatedAt`

**Setup Instructions:**
See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete Firebase configuration guide.

**Switching to Another Database:**
If you want to use PostgreSQL, MongoDB, or MySQL instead:
1. Install the appropriate driver
2. Update `src/config/index.js` with database credentials
3. Modify `src/services/taskService.js` to use the new database
4. Update models in `src/models/`

## 🔐 Adding Authentication

To add JWT authentication:

1. Uncomment JWT configuration in `src/config/index.js`
2. Install `jsonwebtoken`: `npm install jsonwebtoken`
3. Create auth middleware in `src/middlewares/auth.js`
4. Create auth routes and controllers
5. Apply auth middleware to protected routes

## 📦 Adding New Features

To add a new resource (e.g., Users):

1. Create model: `src/models/User.js`
2. Create service: `src/services/userService.js`
3. Create validators: `src/validators/userValidator.js`
4. Create controller: `src/controllers/userController.js`
5. Create routes: `src/routes/userRoutes.js`
6. Register routes in `src/routes/index.js`
7. Add tests: `src/tests/user.test.js`

## 🤝 Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Update documentation as needed
4. Follow consistent naming conventions

## 📄 License

ISC

## 👨‍💻 Author

Your Name

---

**Happy Coding! 🚀**
