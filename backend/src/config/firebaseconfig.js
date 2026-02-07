/**
 * Firebase Admin SDK Configuration
 * For backend/server-side operations with Firestore
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase Admin using service account key
if (!admin.apps.length) {
    const serviceAccount = require('./ServiceAccountKey.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
    });
}

// Get Firestore instance
const db = admin.firestore();

module.exports = {
    admin,
    db,
    firebaseConfig,
};