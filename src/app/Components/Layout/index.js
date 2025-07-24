"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../Navbar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseApp from '@/firebase'; // adjust this import to your setup

export default function Layout({ children }) {
  const router = useRouter();
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/public/login'); 
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
