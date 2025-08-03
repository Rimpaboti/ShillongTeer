// import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
// import { getFirestore, doc, setDoc } from 'firebase/firestore';
// import firebaseApp from '@/firebase';

// const auth = getAuth(firebaseApp);
// const db = getFirestore(firebaseApp);

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { email, password, subAdminId } = body;

//     if (!email || !password || !subAdminId) {
//       return new Response(
//         JSON.stringify({ success: false, error: 'Email, password, and subAdminId are required.' }),
//         {
//           status: 400,
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
//     }

//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     const userRef = doc(db, 'users', user.uid);
//     await setDoc(userRef, {
//       uid: user.uid,
//       email,
//       role: 'user',
//       subAdminId, // ✅ Track which sub-admin created them
//       createdAt: new Date().toISOString(),
//     });

//     return new Response(JSON.stringify({ success: true }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Error creating user:', error);
//     return new Response(JSON.stringify({ success: false, error: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }



// import { getAuth } from 'firebase-admin/auth';
// import { getFirestore } from 'firebase-admin/firestore';
// import { adminApp } from '@/lib/firebaseAdmin'; // Make sure this path is correct

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { email, password, subAdminId } = body;

//     if (!email || !password || !subAdminId) {
//       return new Response(
//         JSON.stringify({ success: false, error: 'Email, password, and subAdminId are required.' }),
//         {
//           status: 400,
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
//     }

//     const auth = getAuth(adminApp);
//     const db = getFirestore(adminApp);

//     // ✅ Create the user with Admin SDK
//     const userRecord = await auth.createUser({
//       email,
//       password,
//     });

//     // ✅ Save additional user info in Firestore
//     await db.collection('users').doc(userRecord.uid).set({
//       uid: userRecord.uid,
//       email,
//       role: 'user',
//       subAdminId,
//       createdAt: new Date().toISOString(),
//     });

//     return new Response(JSON.stringify({ success: true, uid: userRecord.uid }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });

//   } catch (error) {
//     console.error('Error creating user:', error);
//     return new Response(JSON.stringify({ success: false, error: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }


// import { auth, db } from '@/lib/firebaseAdmin';

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { email, password, subAdminId } = body;

//     if (!email || !password || !subAdminId) {
//       return new Response(
//         JSON.stringify({ success: false, error: 'Email, password, and subAdminId are required.' }),
//         {
//           status: 400,
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
//     }

//     // ✅ Create the user using Firebase Admin SDK
//     const userRecord = await auth.createUser({ email, password });

//     // ✅ Save user data to Firestore
//     await db.collection('users').doc(userRecord.uid).set({
//       uid: userRecord.uid,
//       email,
//       role: 'user',
//       subAdminId,
//       createdAt: new Date().toISOString(),
//     });

//     return new Response(JSON.stringify({ success: true, uid: userRecord.uid }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });

//   } catch (error) {
//     console.error('Error creating user:', error);
//     return new Response(JSON.stringify({ success: false, error: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }


import { auth, db } from '@/lib/firebaseAdmin';
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, subAdminId } = body;

    if (!email || !password || !subAdminId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email, password, and subAdminId are required.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // ✅ Create the user using Firebase Admin SDK
    const userRecord = await auth.createUser({ email, password });

    // ✅ Save user data to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      role: 'user',
      subAdminId,
      createdAt: new Date().toISOString(),
    });
    // ✅ Create wallet for the user
    await db.collection('subwallets').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      balance: 0,
      subAdminId, 
      createdAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, uid: userRecord.uid }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
