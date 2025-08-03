// 'use client';

// import { useState } from 'react';
// import axios from 'axios';

// export default function CreateUser({ subAdminId }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setLoading(true);

//     try {
//       const res = await axios.post('/app/api/create-user', {
//         email,
//         password,
//         subAdminId,
//       });

//       if (res.data.success) {
//         setMessage('✅ User created successfully');
//         setEmail('');
//         setPassword('');
//       } else {
//         setMessage('❌ ' + res.data.error);
//       }
//     } catch (err) {
//       setMessage('❌ ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
//       <div className="w-full max-w-md bg-gray-800 text-white rounded-lg shadow-lg p-6 sm:p-8">
//         <h2 className="text-xl font-bold mb-6 text-center">Create New User</h2>

//         <form onSubmit={handleCreate} className="flex flex-col gap-4">
//           <input
//             type="email"
//             placeholder="User Email"
//             className="p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             className="p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           {/* Optional: show subAdminId for confirmation/debug */}
//           {subAdminId && (
//             <p className="text-sm text-gray-400">Sub-admin ID: {subAdminId}</p>
//           )}

//           <button
//             type="submit"
//             className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded transition"
//             disabled={loading}
//           >
//             {loading ? 'Creating...' : 'Create User'}
//           </button>
//         </form>

//         {message && <p className="mt-4 text-sm text-center">{message}</p>}
//       </div>
//     </div>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebaseApp from '@/firebase';
import Layout from '@/app/Components/Layout';

export default function CreateUser() {
  const [subAdminId, setSubAdminId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  // 🔐 Detect logged-in subadmin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        const userData = docSnap.data();
        if (userData?.role === 'subadmin') {
          setSubAdminId(user.uid); // ✅ subadmin UID
        } else {
          setMessage('❌ You are not authorized to create users.');
        }
      } else {
        setMessage('❌ Please log in as subadmin first.');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('/app/api/create-user', {
        email,
        password,
        subAdminId,
      });

      if (res.data.success) {
        setMessage('✅ User created successfully');
        setEmail('');
        setPassword('');
      } else {
        setMessage('❌ ' + res.data.error);
      }
    } catch (err) {
      setMessage('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="text-white text-center mt-20">Checking subadmin access...</div>
    );
  }

  if (!subAdminId) {
    return (
      <div className="text-red-500 text-center mt-20">{message || 'Access denied.'}</div>
    );
  }

  return (
    <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 text-white rounded-lg shadow-lg p-6 sm:p-8">
        <h2 className="text-xl font-bold mb-6 text-center">Create New User</h2>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="User Email"
            className="p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded transition"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-center">{message}</p>}
      </div>
    </div>
    </Layout>
    
  );
}
