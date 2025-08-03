// 'use client'

// import React, { useState } from 'react';
// import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
// import firebaseApp from '@/firebase';
// import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// export default function SignupPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const router = useRouter();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const auth = getAuth(firebaseApp);
//     const db = getFirestore(firebaseApp);

//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );

//       // ✅ Add wallet doc for this new user
//       const { uid } = userCredential.user;
//       const walletRef = doc(db, 'wallets', uid);
//       await setDoc(walletRef, {
//         uid: uid,
//         email: email,
//         balance: 0,
//         createdAt: serverTimestamp(),
//       });

//       router.push('/app/play');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-900">
//       <div className="w-full max-w-md p-8 rounded-lg shadow-2xl">
//         <h2 className="text-2xl font-bold mb-6 text-white text-center">
//           Sign Up
//         </h2>
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className="px-4 py-3 border border-gray-300 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             className="px-4 py-3 border border-gray-300 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-3 rounded-md text-white font-semibold transition ${
//               loading
//                 ? 'bg-yellow-100 cursor-not-allowed'
//                 : 'bg-yellow-500 hover:bg-yellow-600'
//             }`}
//           >
//             {loading ? 'Signing up...' : 'Sign Up'}
//           </button>
//           {error && (
//             <div className="text-red-600 text-sm text-center">{error}</div>
//           )}
//         </form>
//         <p className="mt-4 text-sm text-center text-gray-600">
//           Already have an account?{' '}
//           <Link
//             href="/public/login"
//             className="text-yellow-600 hover:underline font-medium"
//           >
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }


// 'use client'

// import React, { useState, useEffect } from 'react';
// import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
// import firebaseApp from '@/firebase';
// import {
//   getFirestore,
//   doc,
//   setDoc,
//   getDocs,
//   query,
//   where,
//   collection,
//   serverTimestamp,
// } from 'firebase/firestore';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import FingerprintJS from '@fingerprintjs/fingerprintjs';

// export default function SignupPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [deviceId, setDeviceId] = useState('');
//   const router = useRouter();

//   // Get device fingerprint on mount
//   useEffect(() => {
//     const loadFingerprint = async () => {
//       const fp = await FingerprintJS.load();
//       const result = await fp.get();
//       setDeviceId(result.visitorId);
//     };
//     loadFingerprint();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const auth = getAuth(firebaseApp);
//     const db = getFirestore(firebaseApp);

//     try {
//       // Check if device already registered
//       const walletQuery = query(
//         collection(db, 'wallets'),
//         where('deviceId', '==', deviceId)
//       );
//       const querySnapshot = await getDocs(walletQuery);

//       if (!deviceId) {
//         throw new Error('Device fingerprint not available. Please try again.');
//       }

//       if (!querySnapshot.empty) {
//         throw new Error('Account already created on this device.');
//       }

//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const { uid } = userCredential.user;

//       // Save user wallet with fingerprint
//       await setDoc(doc(db, 'wallets', uid), {
//         uid,
//         email,
//         balance: 0,
//         deviceId,
//         createdAt: serverTimestamp(),
//       });

//       router.push('/app/play');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-900">
//       <div className="w-full max-w-md p-8 rounded-lg shadow-2xl">
//         <h2 className="text-2xl font-bold mb-6 text-white text-center">
//           Sign Up
//         </h2>
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className="px-4 py-3 border border-gray-300 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             className="px-4 py-3 border border-gray-300 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-3 rounded-md text-white font-semibold transition ${
//               loading
//                 ? 'bg-yellow-100 cursor-not-allowed'
//                 : 'bg-yellow-500 hover:bg-yellow-600'
//             }`}
//           >
//             {loading ? 'Signing up...' : 'Sign Up'}
//           </button>
//           {error && (
//             <div className="text-red-600 text-sm text-center">{error}</div>
//           )}
//         </form>
//         <p className="mt-4 text-sm text-center text-gray-600">
//           Already have an account?{' '}
//           <Link
//             href="/public/login"
//             className="text-yellow-600 hover:underline font-medium"
//           >
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }


'use client'

import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import firebaseApp from '@/firebase';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const router = useRouter();

  const ALLOW_SIGNUP = process.env.NEXT_PUBLIC_ALLOW_SIGNUP === 'true';

  useEffect(() => {
    const loadFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceId(result.visitorId);
    };
    loadFingerprint();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);

    try {
      if (!ALLOW_SIGNUP) {
        throw new Error('Signup is disabled. Please contact an administrator.');
      }

      if (!deviceId) {
        throw new Error('Device fingerprint not available. Please try again.');
      }

      const walletQuery = query(
        collection(db, 'wallets'),
        where('deviceId', '==', deviceId)
      );
      const querySnapshot = await getDocs(walletQuery);
      if (!querySnapshot.empty) {
        throw new Error('Account already created on this device.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // Create user document with role and wallet
      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        role: 'user',
        createdBy: 'admin',
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'wallets', uid), {
        uid,
        email,
        balance: 0,
        deviceId,
        createdAt: serverTimestamp(),
      });

      router.push('/app/play');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Sign Up</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 border border-gray-300 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-3 border border-gray-300 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md text-white font-semibold transition ${
              loading
                ? 'bg-yellow-100 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link
            href="/public/login"
            className="text-yellow-600 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
