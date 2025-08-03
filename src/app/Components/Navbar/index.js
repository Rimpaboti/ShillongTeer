'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import firebaseApp from '@/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [role, setRole] = useState('user'); // default role

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);

    if (currentUser) {
      console.log('Logged in as:', currentUser.email);

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      let detectedRole = 'user';
      if (userSnap.exists()) {
        const data = userSnap.data();
        detectedRole = data.role || 'user';
        setRole(detectedRole);
        console.log('Detected role:', detectedRole);
      }

      const collectionName = detectedRole === 'admin' ? 'adminwallets' : 'subwallets';
      const walletRef = doc(db, collectionName, currentUser.uid);
      const walletSnap = await getDoc(walletRef);

      if (walletSnap.exists()) {
        const balance = walletSnap.data().balance ?? 0;
        setWalletBalance(balance);
        console.log(`Wallet found in "${collectionName}" with balance:`, balance);
      } else {
        setWalletBalance(0);
        console.warn(`No wallet found in "${collectionName}" for UID:`, currentUser.uid);
      }
    } else {
      setWalletBalance(null);
      setRole('user');
    }
  });

  return () => unsubscribe();
}, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/public/login');
  };

  const isActive = (href) => pathname === href;

  // Block subadmin from accessing admin-only pages
  useEffect(() => {
    if (role === 'subadmin' && pathname.includes('/admin/') &&
        !pathname.includes('/admin/user-bets') &&
        !pathname.includes('/admin/wallet')) {
      router.push('/app/play');
    }
  }, [role]);

  const linkClass = (href) =>
    `text-sm font-semibold transition ${
      isActive(href) ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
    }`;

const renderLinks = () => {
  const userLinks = (
    <>
      <Link href="/app/play" className={linkClass('/app/play')}>Play</Link>
      <Link href="/app/add-balance" className={linkClass('/app/add-balance')}>Balance</Link>
      <Link href="/app/bet-history" className={linkClass('/app/bet-history')}>Bet History</Link>
      <Link href="/app/results" className={linkClass('/app/results')}>Results</Link>
    </>
  );

  const subAdminLinks = (
    <>
      <Link href="/app/results" className={linkClass('/app/results')}>Results</Link>
      <Link href="/app/admin/wallet" className={linkClass('/app/admin/wallet')}>Add Balance</Link>
      <Link href="/app/admin/user-bets" className={linkClass('/app/admin/user-bets')}>User Bets</Link>
      <Link href="/app/user-details" className={linkClass('/app/user-details')}>User Details</Link>
    </>
  );

  const subAdminUserLinks = (
    <>
      <Link href="/app/sub-admin/add-users" className={linkClass('/app/sub-admin/add-users')}>Add Users</Link>
    </>
  );

  const adminLinks = (
    <>
      {subAdminLinks}
      <Link href="/app/admin/declare-result" className={linkClass('/app/admin/declare-result')}>Declare Result</Link>
      <Link href="/app/admin/sub-users" className={linkClass('/app/admin/sub-users')}>Add Sub-User</Link>
    </>
  );

  if (role === 'admin') return adminLinks;
  if (role === 'subadmin') return (
    <>
      {subAdminLinks}
      {subAdminUserLinks}
    </>
  );

  return userLinks;
};


  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/app/play">
          <div className="text-white font-bold text-lg hover:text-yellow-400 transition">
            Nagaland Lottery Sambad
          </div>
        </Link>

        {/* Hamburger */}
        <button onClick={() => setIsOpen(!isOpen)} className="text-white md:hidden">
          <Menu size={24} />
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6 items-center">
          {renderLinks()}
          {user && (
            <span className="text-yellow-400 text-sm font-semibold">
              ₹{walletBalance?.toFixed(2)}
            </span>
          )}
          {!user ? (
            <>
              <Link href="/public/login" className={linkClass('/public/login')}>Login</Link>
              <Link href="/public/signup" className={linkClass('/public/signup')}>Signup</Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="text-white text-sm font-semibold hover:text-yellow-400 bg-red-600 px-3 py-1 rounded"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile Links */}
      {isOpen && (
        <div className="md:hidden mt-4 flex flex-col space-y-2">
          {renderLinks()}
          {user && (
            <span className="text-yellow-400 text-sm font-semibold">
              Wallet: ₹{walletBalance?.toFixed(2)}
            </span>
          )}
          {!user ? (
            <>
              <Link href="/public/login" className={linkClass('/public/login')}>Login</Link>
              <Link href="/public/signup" className={linkClass('/public/signup')}>Signup</Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="text-white text-sm font-semibold hover:text-yellow-400 bg-red-600 px-3 py-1 rounded text-left"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
