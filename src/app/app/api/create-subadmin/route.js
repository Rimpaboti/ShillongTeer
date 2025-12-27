// import { NextResponse } from 'next/server';
// import { db, auth } from '@/lib/firebaseAdmin';

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { email, password } = body;

//     if (!email || !password) {
//       return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
//     }

//     // Create user with Firebase Admin
//     const userRecord = await auth.createUser({
//       email,
//       password,
//     });

//     // Save role in Firestore
//     await db.collection('users').doc(userRecord.uid).set({
//       uid: userRecord.uid,
//       email,
//       role: 'subadmin',
//       createdAt: new Date(),
//     });

//     return NextResponse.json({ success: true, message: 'Sub-admin created successfully' });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }


// // File: /pages/api/create-subadmin.ts (Next.js API Route)
// import { NextApiRequest, NextApiResponse } from 'next';
// import { initializeApp, cert, getApps } from 'firebase-admin/app';
// import { getAuth } from 'firebase-admin/auth';
// import { getFirestore } from 'firebase-admin/firestore';

// // Initialize Admin SDK (only once)
// if (!getApps().length) {
//   initializeApp({
//     credential: cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//     }),
//   });
// }

// const auth = getAuth();
// const db = getFirestore();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

//   const { email, password } = req.body;

//   try {
//     // 1. Create user in Firebase Auth
//     const userRecord = await auth.createUser({ email, password });

//     // 2. Store role as 'subadmin' in Firestore
//     await db.collection('users').doc(userRecord.uid).set({
//       email,
//       role: 'subadmin',
//       createdAt: new Date(),
//     });

//     return res.status(200).json({ success: true, message: 'Sub-admin created' });
//   } catch (error) {
//     return res.status(400).json({ success: false, error: error.message });
//   }
// }


// import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
// import { getFirestore, doc, setDoc } from 'firebase/firestore';
// import firebaseApp from '@/firebase'; // Make sure this exports initialized app

// const auth = getAuth(firebaseApp);
// const db = getFirestore(firebaseApp);

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).end('Method Not Allowed');
//   }

//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ success: false, error: 'Email and password are required.' });
//   }

//   try {
//     // Create Firebase Auth user
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     // Store sub-admin user data in Firestore
//     const userRef = doc(db, 'users', user.uid);
//     await setDoc(userRef, {
//       uid: user.uid,
//       email,
//       role: 'subadmin',
//       createdAt: new Date().toISOString(),
//     });

//     return res.status(200).json({ success: true });
//   } catch (error) {
//     console.error('Error creating sub-admin:', error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// }

// import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
// import { getFirestore, doc, setDoc } from 'firebase/firestore';
// import firebaseApp from '@/firebase';

// const auth = getAuth(firebaseApp);
// const db = getFirestore(firebaseApp);

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { email, password } = body;

//     if (!email || !password) {
//       return new Response(JSON.stringify({ success: false, error: 'Email and password are required.' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     const userRef = doc(db, 'users', user.uid);
//     await setDoc(userRef, {
//       uid: user.uid,
//       email,
//       role: 'subadmin',
//       createdAt: new Date().toISOString(),
//     });

//     return new Response(JSON.stringify({ success: true }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });

//   } catch (error) {
//     console.error('Error creating sub-admin:', error);
//     return new Response(JSON.stringify({ success: false, error: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }


// import { getAuth } from 'firebase-admin/auth';
// import { getFirestore } from 'firebase-admin/firestore';
// import { adminApp } from '@/lib/firebaseAdmin';

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { email, password } = body;

//     if (!email || !password) {
//       return new Response(JSON.stringify({ success: false, error: 'Email and password are required.' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const auth = getAuth(adminApp);
//     const db = getFirestore(adminApp);

//     // ✅ Create sub-admin user
//     const userRecord = await auth.createUser({ email, password });

//     // ✅ Add to 'users' collection
//     await db.collection('users').doc(userRecord.uid).set({
//       uid: userRecord.uid,
//       email,
//       role: 'subadmin',
//       createdAt: new Date().toISOString(),
//     });

//     // ✅ Auto-create wallet for subadmin
//     await db.collection('subwallets').doc(userRecord.uid).set({
//       uid: userRecord.uid,
//       email,
//       balance: 0,
//       createdAt: new Date().toISOString(),
//     });

//     return new Response(JSON.stringify({ success: true }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });

//   } catch (error) {
//     console.error('Error creating sub-admin:', error);
//     return new Response(JSON.stringify({ success: false, error: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }


import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebaseAdmin';
export const runtime = 'nodejs';
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Email and password are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const auth = getAuth(adminApp);
    const db = getFirestore(adminApp);

    // ✅ Create sub-admin user
    const userRecord = await auth.createUser({ email, password });

    // ✅ Add to 'users' collection
    await db.collection('s_users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      role: 'subadmin',
      createdAt: new Date().toISOString(),
    });

    // ✅ Auto-create wallet for subadmin
    await db.collection('s_subwallets').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      balance: 0,
      createdAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating sub-admin:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
