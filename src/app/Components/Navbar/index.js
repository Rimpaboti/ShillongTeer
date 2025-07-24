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
  const [isAdmin, setIsAdmin] = useState(true);

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if(process?.env.NEXT_PUBLIC_ADMIN_MAIL === currentUser.email){
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
        // Fetch wallet balance
        const walletRef = doc(db, 'wallets', currentUser.uid);
        const walletSnap = await getDoc(walletRef);
        if (walletSnap.exists()) {
          setWalletBalance(walletSnap.data().balance ?? 0);
        } else {
          setWalletBalance(0);
        }
      } else {
        setWalletBalance(null);
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/public/login');
  };

  const isActive = (href) => pathname === href;

  useEffect(() => {
    const getAdmin = window.location.pathname.includes('/admin/');
    if(!isAdmin && getAdmin){
      router.push('/app/play')
    }
  },[isAdmin])

  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/app/play">
          <div className="text-white font-bold text-lg hover:text-yellow-400 transition">
            Nagaland Lottery Sambad
          </div>
        </Link>

        {/* Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white md:hidden"
        >
          <Menu size={24} />
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 items-center">
          <Link
            href="/app/play"
            className={`text-sm font-semibold transition ${
              isActive('/app/play')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Play
          </Link>
          <Link
            href="/app/add-balance"
            className={`text-sm font-semibold transition ${
              isActive('/app/add-balance')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Balance
          </Link>
          <Link
            href="/app/bet-history"
            className={`text-sm font-semibold transition ${
              isActive('/app/bet-history')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Bet History
          </Link>
          <Link
            href="/app/results"
            className={`text-sm font-semibold transition ${
              isActive('/app/results')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Results
          </Link>
          <Link
            href="/app/referral"
            className={`text-sm font-semibold transition ${
              isActive('/app/admin/wallet')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Refer & Earn
          </Link>
          {isAdmin && (
          <>
          <Link
            href="/app/admin/wallet"
            className={`text-sm font-semibold transition ${
              isActive('/app/admin/wallet')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Admin: Add Balance
          </Link>
          <Link
            href="/app/admin/user-bets"
            className={`text-sm font-semibold transition ${
              isActive('/app/admin/user-bets')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Admin: User bets
          </Link>
          <Link
            href="/app/admin/declare-result"
            className={`text-sm font-semibold transition ${
              isActive('/app/admin/declare-result')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Admin: Declare Result
          </Link>
          </>
          )}

          {user && (
            <span className="text-yellow-400 text-sm font-semibold">
              ₹{walletBalance?.toFixed(2)}
            </span>
          )}

          {/* Auth Buttons */}
          {!user ? (
            <>
              <Link
                href="/auth/login"
                className={`text-sm font-semibold transition ${
                  isActive('/auth/login')
                    ? 'text-yellow-400'
                    : 'text-white hover:text-yellow-400'
                }`}
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className={`text-sm font-semibold transition ${
                  isActive('/auth/signup')
                    ? 'text-yellow-400'
                    : 'text-white hover:text-yellow-400'
                }`}
              >
                Signup
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="text-white text-sm font-semibold hover:text-yellow-400 transition bg-red-600 p-2 rounded cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile Links */}
      {isOpen && (
        <div className="md:hidden mt-4 flex flex-col space-y-2">
          <Link
            href="/app/play"
            className={`text-sm font-semibold transition ${
              isActive('/app/play')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Play
          </Link>
          <Link
            href="/app/add-balance"
            className={`text-sm font-semibold transition ${
              isActive('/app/add-balance')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Balance
          </Link>
          <Link
            href="/app/referral"
            className={`text-sm font-semibold transition ${
              isActive('/app/admin/wallet')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Refer & Earn
          </Link>
          {isAdmin && (
          <>
          <Link
            href="/app/admin/wallet"
            className={`text-sm font-semibold transition ${
              isActive('/app/admin/wallet')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Admin Add Balance
          </Link>
          <Link
            href="/app/admin/user-bets"
            className={`text-sm font-semibold transition ${
              isActive('/app/admin/user-bets')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Admin: User bets
          </Link>
          <Link
            href="/app/admin/declare-result"
            className={`text-sm font-semibold transition ${
              isActive('/app/admin/declare-result')
                ? 'text-yellow-400'
                : 'text-white hover:text-yellow-400'
            }`}
          >
            Admin Declare Result
          </Link>
          </>
          )}

          {user && (
            <span className="text-yellow-400 text-sm font-semibold">
              Wallet: ₹{walletBalance?.toFixed(2)}
            </span>
          )}

          {!user ? (
            <>
              <Link
                href="/public/login"
                className={`text-sm font-semibold transition ${
                  isActive('/public/login')
                    ? 'text-yellow-400'
                    : 'text-white hover:text-yellow-400'
                }`}
              >
                Login
              </Link>
              <Link
                href="/public/signup"
                className={`text-sm font-semibold transition ${
                  isActive('/public/signup')
                    ? 'text-yellow-400'
                    : 'text-white hover:text-yellow-400'
                }`}
              >
                Signup
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="text-white text-sm font-semibold hover:text-yellow-400 transition text-left bg-red-600 p-2 rounded cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
