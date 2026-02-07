# Authentication Setup Guide

Quick guide to set up and use the authentication system.

## 🎯 What's Included

✅ **User Sign Up** - Create new accounts  
✅ **User Login** - Authenticate users (client-side with Firebase)  
✅ **User Profile** - View and update profile  
✅ **Password Reset** - Send reset emails  
✅ **Logout** - End user sessions  
✅ **Protected Routes** - Secure API endpoints  

---

## 📦 Backend Setup (Already Done!)

The following files have been created:

```
backend/
├── src/
│   ├── services/
│   │   └── authService.js          # Authentication business logic
│   ├── controllers/
│   │   └── authController.js       # HTTP request handlers
│   ├── middlewares/
│   │   └── auth.js                 # Token verification middleware
│   ├── validators/
│   │   └── authValidator.js        # Input validation rules
│   └── routes/
│       ├── authRoutes.js           # Auth API endpoints
│       └── index.js                # Main router (updated)
└── AUTH_API_DOCUMENTATION.md       # Complete API docs
```

---

## 🔧 Configuration

### 1. Firebase is Already Configured

Your `firebaseconfig.js` is already set up with the service account key. No changes needed!

### 2. Environment Variables

Your `.env` file already has Firebase configuration. All set!

---

## 🚀 Available Endpoints

All endpoints are available at: `http://localhost:3000/api/auth`

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/signup` | POST | Public | Create new account |
| `/verify` | POST | Public | Verify token |
| `/profile` | GET | Private | Get user profile |
| `/profile` | PUT | Private | Update profile |
| `/password-reset` | POST | Public | Send reset email |
| `/logout` | POST | Public | Logout user |
| `/account` | DELETE | Private | Delete account |

---

## 📝 Quick Start Examples

### 1. Sign Up a New User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "displayName": "Test User"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "uid": "firebase_user_id",
    "email": "test@example.com",
    "displayName": "Test User",
    "token": "custom_token",
    "createdAt": "2026-02-04T15:22:47.000Z"
  }
}
```

### 2. Get User Profile (Protected Route)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

### 3. Password Reset

```bash
curl -X POST http://localhost:3000/api/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

---

## 🔐 How Authentication Works

### Backend (Server-Side)

1. **Sign Up**: Creates user in Firebase Auth
2. **Verification**: Verifies Firebase ID tokens
3. **Protected Routes**: Uses `authMiddleware` to check tokens
4. **User Data**: Attaches user info to `req.user`

### Frontend (Client-Side)

1. **Login**: Use Firebase SDK to authenticate
2. **Get Token**: Get ID token from Firebase
3. **API Requests**: Include token in Authorization header
4. **Logout**: Clear token and sign out from Firebase

---

## 🎨 Frontend Integration (Next Steps)

### 1. Install Firebase SDK

```bash
cd frontend
npm install firebase
```

### 2. Create Firebase Config

```javascript
// frontend/lib/firebase.js
import { initializeApp } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 3. Create Auth Context

```javascript
// frontend/contexts/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 4. Create Login Page

```javascript
// frontend/app/login/page.js
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to dashboard
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## 🧪 Testing

### Test with cURL

```bash
# 1. Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","displayName":"Test"}'

# 2. Get profile (replace TOKEN with actual token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

### Test with Postman

1. Import endpoints from `AUTH_API_DOCUMENTATION.md`
2. Create a user with `/signup`
3. Use Firebase SDK to login and get token
4. Test protected endpoints with the token

---

## 🔒 Protecting Task Routes

To make tasks user-specific, update `taskRoutes.js`:

```javascript
const { authMiddleware } = require('../middlewares/auth');

// Protect all task routes
router.use(authMiddleware);

// Now all task operations require authentication
// Tasks will be linked to req.user.uid
```

---

## 📚 Full Documentation

See `AUTH_API_DOCUMENTATION.md` for:
- Complete endpoint details
- Request/response examples
- Error handling
- Frontend integration guide
- Security best practices

---

## ✅ What's Next?

1. **Test the endpoints** with cURL or Postman
2. **Build frontend UI** for login/signup
3. **Protect task routes** to make them user-specific
4. **Add email verification** (optional)
5. **Implement social login** (Google, Facebook, etc.)

---

## 🆘 Troubleshooting

### "Module not found: authRoutes"
- Restart the backend server: `npm start`

### "No token provided"
- Include Authorization header: `Bearer <token>`

### "Invalid token"
- Token may be expired, get a new one from Firebase

---

**The authentication backend is ready to use!** 🎉

Start testing the endpoints or begin building the frontend UI.
