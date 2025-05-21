// Simple test script to verify Firebase authentication
console.log('Testing Firebase authentication...');

// Import Firebase
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } = require('firebase/auth');
require('dotenv').config();

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Log Firebase config for debugging (without sensitive values)
console.log('Firebase config loaded:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Test email/password authentication
async function testEmailAuth() {
  try {
    console.log('Testing email/password authentication...');
    // Replace with test credentials
    const email = 'test@example.com';
    const password = 'password123';
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Email authentication successful:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Email authentication error:', error.code, error.message);
    return null;
  }
}

// Test Google authentication (this won't work in Node.js environment, just for reference)
async function testGoogleAuth() {
  try {
    console.log('Testing Google authentication...');
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    
    // This will fail in Node.js environment as it requires a browser
    console.log('Note: Google authentication requires a browser environment');
    console.log('This is just to verify the Firebase configuration is correct');
    
    return null;
  } catch (error) {
    console.error('Google authentication error:', error.code, error.message);
    return null;
  }
}

// Run tests
async function runTests() {
  console.log('Firebase initialized with project:', firebaseConfig.projectId);
  
  // Test email authentication
  const emailUser = await testEmailAuth();
  
  // Test Google authentication (will fail in Node.js)
  await testGoogleAuth();
  
  console.log('Authentication tests completed');
}

runTests().catch(console.error);
