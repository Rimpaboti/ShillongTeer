// import Layout from '@/app/Components/Layout'
// import PlayBoard from '@/app/Components/PlayBoard'
// import React from 'react'

// export default function page() {
//   return (
//     <Layout>
//       <PlayBoard/>
//     </Layout>
//   )
// }


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/Components/Layout';
import PlayBoard from '@/app/Components/PlayBoard';
import firebaseApp from '@/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default function Page() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 's_users', user.uid);
        const userSnap = await getDoc(userRef);
        const roleFromDb = userSnap.exists() ? userSnap.data().role || 'user' : 'user';
        setRole(roleFromDb);

        // Redirect if admin/subadmin
        if (roleFromDb === 'admin' || roleFromDb === 'subadmin') {
          router.push('/app/results'); // ✅ redirect to results page
        }
      } else {
        setRole('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-white">
          Loading...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {role === 'user' && <PlayBoard />} {/* ✅ Show only to users */}
    </Layout>
  );
}
