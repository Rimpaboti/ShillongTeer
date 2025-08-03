// lib/firebaseAdmin.js
import * as admin from 'firebase-admin';

// Prevent re-initialization during hot reloads in dev
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Export Firestore and Auth from Firebase Admin SDK
const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
