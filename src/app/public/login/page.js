'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import firebaseApp from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const role = userSnap.data().role;
        if (role === 'admin') {
          router.push('/app/play');
        } else if (role === 'subadmin') {
          router.push('/app/play');
        } else {
          router.push('/app/play');
        }
      } else {
        setError('User role not found.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 rounded-lg shadow-2xl bg-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-4 py-3 border border-gray-300 text-white rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="px-4 py-3 border border-gray-300 text-white rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-md transition"
          >
            Login
          </button>
        </form>

        {/* <div className="mt-4 text-sm text-center">
          <Link href="/public/forgot-password" className="text-yellow-400 hover:underline">
            Forgot Password?
          </Link>
        </div>
        <p className="mt-4 text-sm text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/public/signup" className="text-yellow-600 hover:underline font-medium">
            Sign up
          </Link>
        </p> */}
      </div>
    </div>
  );
}
