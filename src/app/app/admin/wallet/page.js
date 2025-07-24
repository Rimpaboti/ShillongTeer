'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import firebaseApp from '@/firebase';
import Layout from '@/app/Components/Layout';

export default function WalletAdminPage() {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const [admin, setAdmin] = useState(null);

  const [targetEmail, setTargetEmail] = useState('');
  const [targetUid, setTargetUid] = useState('');
  const [currentBalance, setCurrentBalance] = useState(null);

  const [amountToAdd, setAmountToAdd] = useState('');
  const [amountToDeduct, setAmountToDeduct] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [depositRequests, setDepositRequests] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);

  const [refreshKey, setRefreshKey] = useState(0); // To re-fetch after approve/reject

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAdmin(user);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!admin) return;

    const fetchRequests = async () => {
      // Deposit
      const depQ = query(
        collection(db, 'depositRequests'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const depSnap = await getDocs(depQ);
      setDepositRequests(depSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      // Withdraw
      const withQ = query(
        collection(db, 'withdrawRequests'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const withSnap = await getDocs(withQ);
      setWithdrawRequests(withSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchRequests();
  }, [admin, db, refreshKey]);

  const handleSearch = async () => {
    if (!targetEmail) {
      alert('Enter a valid email.');
      return;
    }
    setLoading(true);

    try {
      const walletQuery = query(
        collection(db, 'wallets'),
        where('email', '==', targetEmail)
      );
      const walletSnap = await getDocs(walletQuery);

      if (!walletSnap.empty) {
        const walletDoc = walletSnap.docs[0];
        setTargetUid(walletDoc.data().uid);
        setCurrentBalance(walletDoc.data().balance ?? 0);
      } else {
        alert(
          'Wallet not found. Ask the user to login once so their wallet is auto-created.'
        );
        setTargetUid('');
        setCurrentBalance(null);
      }
    } catch (error) {
      console.error('Error during search:', error);
      alert('Error searching for wallet.');
    }

    setLoading(false);
  };

  const handleAddBalance = async () => {
    if (!targetUid) {
      alert('Search and select a user first.');
      return;
    }
    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      alert('Enter a valid positive amount.');
      return;
    }

    setSubmitting(true);
    try {
      const walletRef = doc(db, 'wallets', targetUid);
      await updateDoc(walletRef, {
        balance: (currentBalance ?? 0) + amount,
        updatedAt: serverTimestamp(),
      });
      setCurrentBalance((prev) => (prev ?? 0) + amount);
      setAmountToAdd('');
      alert('Wallet balance updated successfully!');
    } catch (error) {
      console.error('Error updating wallet:', error);
      alert('Failed to update wallet.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeductBalance = async () => {
    if (!targetUid) {
      alert('Search and select a user first.');
      return;
    }
    const amount = parseFloat(amountToDeduct);
    if (isNaN(amount) || amount <= 0) {
      alert('Enter a valid positive amount.');
      return;
    }

    if (amount > (currentBalance ?? 0)) {
      alert('Cannot deduct more than the current balance.');
      return;
    }

    setSubmitting(true);
    try {
      const walletRef = doc(db, 'wallets', targetUid);
      await updateDoc(walletRef, {
        balance: (currentBalance ?? 0) - amount,
        updatedAt: serverTimestamp(),
      });
      setCurrentBalance((prev) => (prev ?? 0) - amount);
      setAmountToDeduct('');
      alert('Wallet balance deducted successfully!');
    } catch (error) {
      console.error('Error deducting wallet:', error);
      alert('Failed to deduct wallet balance.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (collectionName, id, newStatus) => {
    try {
      const ref = doc(db, collectionName, id);
      await updateDoc(ref, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      alert(`Request marked as ${newStatus}`);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Please login as admin to manage wallets.</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start p-8 space-y-8">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Admin: Manage Wallet
          </h1>

          <div className="mb-4">
            <label className="block mb-2">User Email</label>
            <input
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="Enter user email"
              className="w-full px-4 py-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`mt-2 w-full py-3 rounded-md font-semibold text-black ${
                loading
                  ? 'bg-yellow-100 cursor-not-allowed'
                  : 'bg-yellow-400 hover:bg-yellow-500'
              }`}
            >
              {loading ? 'Searching...' : 'Find Wallet'}
            </button>
          </div>

          {targetUid && (
            <div className="mb-4">
              <p className="text-sm mb-1 text-gray-400 break-all">
                UID: <span className="font-medium">{targetUid}</span>
              </p>
              <p className="text-lg mb-4">
                Current Balance:{' '}
                <span className="text-yellow-400 font-semibold">
                  ₹{currentBalance?.toFixed(2)}
                </span>
              </p>

              <label className="block mb-2">Add Balance</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
                placeholder="Enter amount to add"
                className="w-full px-4 py-3 mb-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={handleAddBalance}
                disabled={submitting}
                className={`w-full py-3 rounded-md font-semibold text-black ${
                  submitting
                    ? 'bg-yellow-100 cursor-not-allowed'
                    : 'bg-yellow-400 hover:bg-yellow-500'
                }`}
              >
                {submitting ? 'Updating...' : 'Add Balance'}
              </button>

              <label className="block mb-2 mt-6">Deduct Balance</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountToDeduct}
                onChange={(e) => setAmountToDeduct(e.target.value)}
                placeholder="Enter amount to deduct"
                className="w-full px-4 py-3 mb-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button
                onClick={handleDeductBalance}
                disabled={submitting}
                className={`w-full py-3 rounded-md font-semibold text-black ${
                  submitting
                    ? 'bg-red-100 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {submitting ? 'Updating...' : 'Deduct Balance'}
              </button>
            </div>
          )}
        </div>

        {/* Deposit Requests */}
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-4">Deposit Requests</h2>
          {depositRequests.length === 0 && (
            <p className="text-gray-400">No deposit requests found.</p>
          )}
          {depositRequests.map((req) => (
            <div
              key={req.id}
              className="mb-4 border-b border-gray-600 pb-2 text-sm"
            >
              <p>Email: {req.email}</p>
              <p>Amount: ₹{req.amount}</p>
              <p>Txn ID: {req.transactionId}</p>
              <p>Status: <span className="font-bold">{req.status}</span></p>
              <p>
                Date:{' '}
                {req.createdAt?.toDate
                  ? req.createdAt.toDate().toLocaleString()
                  : 'N/A'}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleStatusChange('depositRequests', req.id, 'approved')}
                  className="bg-green-500 hover:bg-green-600 text-black font-semibold py-1 px-3 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange('depositRequests', req.id, 'rejected')}
                  className="bg-red-500 hover:bg-red-600 text-black font-semibold py-1 px-3 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Withdraw Requests */}
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-4">Withdraw Requests</h2>
          {withdrawRequests.length === 0 && (
            <p className="text-gray-400">No withdraw requests found.</p>
          )}
          {withdrawRequests.map((req) => (
            <div
              key={req.id}
              className="mb-4 border-b border-gray-600 pb-2 text-sm"
            >
              <p>Email: {req.email}</p>
              <p>Amount: ₹{req.amount}</p>
              <p>Status: <span className="font-bold">{req.status}</span></p>
              <p>
                Date:{' '}
                {req.createdAt?.toDate
                  ? req.createdAt.toDate().toLocaleString()
                  : 'N/A'}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleStatusChange('withdrawRequests', req.id, 'approved')}
                  className="bg-green-500 hover:bg-green-600 text-black font-semibold py-1 px-3 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange('withdrawRequests', req.id, 'rejected')}
                  className="bg-red-500 hover:bg-red-600 text-black font-semibold py-1 px-3 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
