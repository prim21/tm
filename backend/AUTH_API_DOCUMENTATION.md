# Authentication API Documentation

Complete API documentation for user authentication endpoints.

## Base URL
```
http://localhost:3000/api/auth
```

## Table of Contents
1. [Authentication Flow](#authentication-flow)
2. [Endpoints](#endpoints)
3. [Error Handling](#error-handling)
4. [Examples](#examples)

---

## Authentication Flow

### 1. Sign Up
User creates an account → Receives custom token

### 2. Login (Client-Side)
User logs in with Firebase SDK → Receives ID token

### 3. Protected Requests
Include ID token in Authorization header: `Bearer <token>`

### 4. Token Verification
Backend verifies token on each protected request

---

## Endpoints

### 1. Sign Up

Create a new user account.

**Endpoint:** `POST /api/auth/signup`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Validation Rules:**
- `email`: Valid email address (required)
- `password`: Minimum 6 characters, must contain at least one number (required)
- `displayName`: 2-50 characters, letters and spaces only (required)

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "uid": "firebase_user_id",
    "email": "user@example.com",
    "displayName": "John Doe",
    "token": "custom_token_for_immediate_login",
    "createdAt": "2026-02-04T15:22:47.000Z"
  }
}
```

**Error Responses:**
- `400`: Email already in use / Invalid email / Weak password
- `500`: Server error

---

### 2. Verify Token

Verify a Firebase ID token and get user information.

**Endpoint:** `POST /api/auth/verify`

**Access:** Public

**Request Body:**
```json
{
  "token": "firebase_id_token"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token verified successfully",
  "data": {
    "uid": "firebase_user_id",
    "email": "user@example.com",
    "displayName": "John Doe",
    "photoURL": null,
    "emailVerified": false,
    "disabled": false,
    "createdAt": "2026-02-04T15:22:47.000Z",
    "lastSignInTime": "2026-02-04T15:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Token is required
- `401`: Invalid or expired token

---

### 3. Get User Profile

Get the authenticated user's profile information.

**Endpoint:** `GET /api/auth/profile`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "uid": "firebase_user_id",
    "email": "user@example.com",
    "displayName": "John Doe",
    "photoURL": "https://example.com/photo.jpg",
    "emailVerified": true,
    "disabled": false,
    "createdAt": "2026-02-04T15:22:47.000Z",
    "lastSignInTime": "2026-02-04T15:30:00.000Z"
  }
}
```

**Error Responses:**
- `401`: No token provided / Invalid token
- `404`: User not found

---

### 4. Update User Profile

Update the authenticated user's profile information.

**Endpoint:** `PUT /api/auth/profile`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Request Body:**
```json
{
  "displayName": "Jane Doe",
  "photoURL": "https://example.com/new-photo.jpg"
}
```

**Validation Rules:**
- `displayName`: 2-50 characters, letters and spaces only (optional)
- `photoURL`: Valid URL (optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "uid": "firebase_user_id",
    "email": "user@example.com",
    "displayName": "Jane Doe",
    "photoURL": "https://example.com/new-photo.jpg",
    "emailVerified": true,
    "disabled": false,
    "createdAt": "2026-02-04T15:22:47.000Z",
    "lastSignInTime": "2026-02-04T15:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation errors
- `401`: Unauthorized

---

### 5. Send Password Reset Email

Send a password reset email to the user.

**Endpoint:** `POST /api/auth/password-reset`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent",
  "data": {
    "message": "Password reset email sent",
    "resetLink": "https://firebase-reset-link.com/..."
  }
}
```

**Note:** In production, the `resetLink` should not be returned. It's only included for development/testing.

**Error Responses:**
- `400`: Email is required / Invalid email
- `404`: No user found with this email

---

### 6. Logout

Logout the current user (primarily a client-side operation).

**Endpoint:** `POST /api/auth/logout`

**Access:** Public (optional authentication)

**Headers (Optional):**
```
Authorization: Bearer <firebase_id_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

### 7. Delete Account

Delete the authenticated user's account permanently.

**Endpoint:** `DELETE /api/auth/account`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully",
  "data": null
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Server error

---

### 8. Get User by Email (Admin)

Get user information by email address.

**Endpoint:** `GET /api/auth/user/:email`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**URL Parameters:**
- `email`: User's email address

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "uid": "firebase_user_id",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: User not found

---

### 9. List All Users (Admin)

List all users with pagination.

**Endpoint:** `GET /api/auth/users`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Query Parameters:**
- `maxResults`: Number of users to return (default: 10)
- `pageToken`: Token for pagination (optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "uid": "user_id_1",
        "email": "user1@example.com",
        "displayName": "User One",
        "emailVerified": true,
        "disabled": false
      },
      {
        "uid": "user_id_2",
        "email": "user2@example.com",
        "displayName": "User Two",
        "emailVerified": false,
        "disabled": false
      }
    ],
    "pageToken": "next_page_token"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Server error

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation errors |
| 401 | Unauthorized - Invalid or missing token |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Examples

### Complete Authentication Flow

#### 1. Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "displayName": "John Doe"
  }'
```

#### 2. Login (Client-Side with Firebase SDK)
```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
const userCredential = await signInWithEmailAndPassword(
  auth,
  'john@example.com',
  'password123'
);

const idToken = await userCredential.user.getIdToken();
```

#### 3. Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <firebase_id_token>"
```

#### 4. Update Profile
```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <firebase_id_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Smith"
  }'
```

#### 5. Password Reset
```bash
curl -X POST http://localhost:3000/api/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

#### 6. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <firebase_id_token>"
```

---

## Frontend Integration

### Setting Up Firebase (Client-Side)

```javascript
// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Login Example

```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    
    // Store token for API requests
    localStorage.setItem('authToken', idToken);
    
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

### Making Authenticated Requests

```javascript
async function getProfile() {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('http://localhost:3000/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (httpOnly cookies recommended)
3. **Implement token refresh** for long-lived sessions
4. **Validate all inputs** on both client and server
5. **Use Firebase Security Rules** to protect Firestore data
6. **Implement rate limiting** to prevent abuse
7. **Log authentication events** for security monitoring

---

## Testing

### Test User Creation
```bash
npm test -- auth.test.js
```

### Manual Testing with Postman
1. Import the authentication endpoints
2. Create environment variables for tokens
3. Test the complete flow: signup → login → profile → logout

---

## Troubleshooting

### "No token provided"
- Ensure the Authorization header is included
- Check token format: `Bearer <token>`

### "Invalid or expired token"
- Token may have expired (default: 1 hour)
- Refresh the token using Firebase SDK

### "Email already in use"
- User already exists with this email
- Use password reset or login instead

---

## Next Steps

1. Implement email verification
2. Add social authentication (Google, Facebook, etc.)
3. Implement multi-factor authentication
4. Add role-based access control (RBAC)
5. Set up email service for password resets

---

**Last Updated:** February 4, 2026
