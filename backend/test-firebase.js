#!/usr/bin/env node

/**
 * Firebase Setup Helper Script
 * This script helps you verify your Firebase configuration
 */

require('dotenv').config();
const { db, firebaseConfig } = require('./src/config/firebaseconfig');

console.log('🔥 Firebase Configuration Check\n');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('\n📊 Testing Firestore Connection...\n');

async function testFirestore() {
    try {
        // Try to read from Firestore
        const testCollection = db.collection('tasks');
        const snapshot = await testCollection.limit(1).get();

        console.log('✅ Successfully connected to Firestore!');
        console.log(`📝 Found ${snapshot.size} task(s) in the database`);

        if (snapshot.size > 0) {
            console.log('\nSample task:');
            snapshot.forEach(doc => {
                console.log(JSON.stringify({ id: doc.id, ...doc.data() }, null, 2));
            });
        } else {
            console.log('\n💡 Tip: Create your first task using the API:');
            console.log('   POST http://localhost:3000/api/tasks');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error connecting to Firestore:');
        console.error(error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure you have authenticated with Firebase:');
        console.log('   Run: gcloud auth application-default login');
        console.log('2. Or download a service account key from Firebase Console');
        console.log('3. Make sure Firestore is enabled in your Firebase project');
        console.log('4. Check your .env file has the correct FIREBASE_PROJECT_ID');
        console.log('\nSee FIREBASE_SETUP.md for detailed instructions.');
        process.exit(1);
    }
}

testFirestore();
