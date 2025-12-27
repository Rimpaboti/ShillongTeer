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

// lib/firebaseAdmin.js
// lib/firebaseAdmin.js
// import admin from 'firebase-admin';

// // Prevent re-initialization
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//     }),
//   });
// }

// // ✅ EXPORT adminApp (THIS WAS MISSING)
// export const adminApp = admin.app();


// export { admin, db, auth };
// lib/firebaseAdmin.js
// import admin from 'firebase-admin';

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//     }),
//   });
// }

// // ✅ Explicitly export adminApp
// export const admin = admin.app();
// export const auth = admin.auth();
// export const db = admin.firestore();



// import * as admin from 'firebase-admin';

// // Prevent re-initialization during hot reloads in dev
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//     }),
//   });
// }

// // Get initialized app instance
// const adminApp = admin.app();

// // Export Firestore and Auth from Firebase Admin SDK
// const db = admin.firestore();
// const auth = admin.auth();

// export { admin, adminApp, db, auth };
