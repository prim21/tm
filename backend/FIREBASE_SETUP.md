# Firebase Setup Guide

This guide will help you set up Firebase for your Task Management backend.

## Prerequisites

- A Google account
- Firebase project created at [Firebase Console](https://console.firebase.google.com/)

## Setup Steps

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Your project is already created: `task-management-1329b`
3. Navigate to **Project Settings** > **Service Accounts**

### 2. Generate Service Account Key (For Production)

For production deployment, you need a service account key:

1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file
4. **IMPORTANT**: Never commit this file to Git!
5. Save it as `serviceAccountKey.json` in your project root (it's already in .gitignore)

### 3. Local Development Setup

For local development, you have two options:

#### Option A: Using Application Default Credentials (Recommended for Development)

1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Run authentication:
   ```bash
   gcloud auth application-default login
   ```
3. Select your Google account
4. Your app will now use these credentials automatically

#### Option B: Using Service Account Key

1. Download the service account key (see step 2 above)
2. Update `src/config/firebaseconfig.js`:
   ```javascript
   const serviceAccount = require('../../serviceAccountKey.json');
   
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
     projectId: firebaseConfig.projectId,
   });
   ```

### 4. Firestore Database Setup

1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (for development) or **Start in production mode**
4. Select a location (e.g., `us-central1`)
5. Click **Enable**

### 5. Firestore Security Rules

For development, you can use these rules (in Firebase Console > Firestore > Rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents (DEVELOPMENT ONLY!)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**For production**, use proper authentication:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      // Allow authenticated users to read/write their own tasks
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6. Environment Variables

Your `.env` file should have these variables (already configured):

```env
FIREBASE_API_KEY=AIzaSyD-c0yH2iFj_kXxsVa1qKuiRCJRIKdENBw
FIREBASE_AUTH_DOMAIN=task-management-1329b.firebaseapp.com
FIREBASE_PROJECT_ID=task-management-1329b
FIREBASE_STORAGE_BUCKET=task-management-1329b.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=75344587674
FIREBASE_APP_ID=1:75344587674:web:c6a48a326a26dab2e26823
```

## Testing the Connection

Run your server:
```bash
npm run dev
```

Test creating a task:
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Firebase Task",
    "description": "Testing Firestore integration",
    "status": "pending",
    "priority": "high"
  }'
```

Check Firestore Console to see if the task was created!

## Troubleshooting

### Error: "Could not load the default credentials"

**Solution**: Run `gcloud auth application-default login` or use a service account key.

### Error: "PERMISSION_DENIED"

**Solution**: Check your Firestore security rules. For development, allow all access (see step 5).

### Error: "Project ID not found"

**Solution**: Make sure `FIREBASE_PROJECT_ID` is set in your `.env` file.

## Production Deployment

For production (e.g., on Heroku, Vercel, or Google Cloud):

1. **Never commit** your service account key
2. Use environment variables for the service account key:
   ```javascript
   const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
   ```
3. Set the `FIREBASE_SERVICE_ACCOUNT` environment variable with the JSON content
4. Update Firestore security rules to require authentication

## Next Steps

- [ ] Set up Firebase Authentication for user management
- [ ] Add user-specific task filtering
- [ ] Implement real-time listeners for live updates
- [ ] Add file upload support with Firebase Storage

## Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
