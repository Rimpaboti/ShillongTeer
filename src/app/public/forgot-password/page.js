'use client'

import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import firebaseApp from '@/firebase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    const auth = getAuth(firebaseApp);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-4 py-3 border text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition ${
              loading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Sending...' : 'Send Reset Email'}
          </button>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-center">
              Password reset email sent! Check your inbox or spam folder.
            </div>
          )}
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Remembered your password?{' '}
          <Link
            href="/public/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
} 

// 'use client';
// import React, { useState } from 'react';
// import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
// import firebaseApp from '@/firebase';
// import Link from 'next/link';

// export default function ForgotPasswordPage() {
//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess(false);
//     const auth = getAuth(firebaseApp);

//     try {
//       await sendPasswordResetEmail(auth, email);
//       setSuccess(true);
//     } catch (err) {
//       // Handle Firebase errors
//       if (err.code === 'auth/user-not-found') {
//         setError('No account found with this email.');
//       } else if (err.code === 'auth/invalid-email') {
//         setError('Invalid email format.');
//       } else {
//         setError('Something went wrong. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100">
//       <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
//         <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <input
//             type="email"
//             placeholder="Enter your registered email"
//             value={email}
//             onChange={e => setEmail(e.target.value)}
//             required
//             className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-3 rounded-md text-white font-semibold transition ${
//               loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
//             }`}
//           >
//             {loading ? 'Sending...' : 'Send Reset Email'}
//           </button>
//           {error && <div className="text-red-600 text-sm text-center">{error}</div>}
//           {success && (
//             <div className="text-green-600 text-sm text-center">
//               Password reset email sent! Check your inbox.
//             </div>
//           )}
//         </form>
//         <p className="mt-4 text-sm text-center text-gray-600">
//           Remembered your password?{' '}
//           <Link href="/public/login" className="text-blue-600 hover:underline font-medium">
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// 'use client'

// import React, { useState } from 'react';
// import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
// import firebaseApp from '@/firebase';
// import Link from 'next/link';

// export default function ForgotPasswordPage() {
//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setLoading(true);
//   //   setError('');
//   //   setSuccess(false);

//   //   const auth = getAuth(firebaseApp);
//   //   try {
//   //     await sendPasswordResetEmail(auth, email);
//   //     setSuccess(true);
//   //   } catch (err) {
//   //     if (err.code === 'auth/user-not-found') {
//   //       setError('No user found with this email.');
//   //     } else if (err.code === 'auth/invalid-email') {
//   //       setError('Please enter a valid email address.');
//   //     } else {
//   //       setError('Something went wrong. Please try again.');
//   //     }
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setLoading(true);
//   setError('');
//   setSuccess(false);

//   try {
//     const res = await fetch('/api/request-reset', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.error || 'Failed to send reset email');
//     }

//     setSuccess(true);
//   } catch (err) {
//     setError(err.message || 'Something went wrong. Please try again.');
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100">
//       <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
//         <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <input
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={e => setEmail(e.target.value)}
//             required
//             className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-3 rounded-md text-white font-semibold transition ${
//               loading
//                 ? 'bg-blue-300 cursor-not-allowed'
//                 : 'bg-blue-600 hover:bg-blue-700'
//             }`}
//           >
//             {loading ? 'Sending...' : 'Send Reset Email'}
//           </button>
//           {error && (
//             <div className="text-red-600 text-sm text-center">{error}</div>
//           )}
//           {success && (
//             <div className="text-green-600 text-sm text-center">
//               Password reset email sent! Check your inbox.
//             </div>
//           )}
//         </form>
//         <p className="mt-4 text-sm text-center text-gray-600">
//           Remembered your password?{' '}
//           <Link
//             href="/public/login"
//             className="text-blue-600 hover:underline font-medium"
//           >
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }


