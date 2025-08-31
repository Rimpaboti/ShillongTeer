
'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseApp from '@/firebase';
import Layout from '@/app/Components/Layout';

export default function PlayBoard() {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [role, setRole] = useState('user');

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const [depositAmount, setDepositAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [depositSubmitting, setDepositSubmitting] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState('');
const [paymentDetails, setPaymentDetails] = useState('');


  // 🔍 Get user, role, and wallet
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Get role
        const userRef = doc(db, 's_users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        let userRole = 'user';

        if (userSnap.exists()) {
          userRole = userSnap.data()?.role || 'user';
        }
        setRole(userRole);

        // Get wallet
        const walletRef = doc(db, 's_subwallets', currentUser.uid);
        const walletSnap = await getDoc(walletRef);

        if (walletSnap.exists()) {
          setWalletBalance(walletSnap.data().balance ?? 0);
        } else {
          // If wallet doesn't exist, create it
          await updateDoc(walletRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            balance: 0,
            createdAt: serverTimestamp(),
          }).catch(() => {});
          setWalletBalance(0);
        }
      }
    });

    return () => unsubscribe();
  }, []);

const handleWithdrawSubmit = async () => {
  if (!user) return alert('Login required.');

  const amount = parseFloat(withdrawAmount);
  if (isNaN(amount) || amount <= 0) return setWithdrawError('Enter a valid amount.');
  if (amount < 200) return setWithdrawError('Minimum withdraw amount is ₹200.');
  if (!selectedMethod || !paymentDetails.trim()) return setWithdrawError('Please select a method and enter your ID.');
  if ((walletBalance ?? 0) < amount) return setWithdrawError('Insufficient wallet balance.');

  setWithdrawError('');
  setWithdrawSubmitting(true);

  try {
    const userDoc = await getDoc(doc(db, 's_users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    const isSubadmin = userData.role === 'subadmin';

    const fromSubAdminId = isSubadmin ? user.uid : userData.subAdminId || '';
    const fromUserSubAdminId = isSubadmin ? '' : userData.subAdminId || '';

    // Deduct from wallet
    const walletRef = doc(db, 's_subwallets', user.uid);
    await updateDoc(walletRef, {
      balance: walletBalance - amount,
      updatedAt: serverTimestamp(),
    });

    setWalletBalance((prev) => prev - amount);

    // Add withdraw request
    await addDoc(collection(db, 's_subwithdrawRequests'), {
      uid: user.uid,
      email: user.email,
      amount,
      method: selectedMethod,
      paymentId: paymentDetails.trim(),
      createdAt: serverTimestamp(),
      status: 'pending',
      fromSubAdminId,
      fromUserSubAdminId
    });

    alert('Withdraw request submitted!');
    setWithdrawAmount('');
    setSelectedMethod('');
    setPaymentDetails('');
  } catch (err) {
    console.error('Withdraw error:', err);
    alert('Failed to submit withdraw request.');
  } finally {
    setWithdrawSubmitting(false);
  }
};


  // ✅ Deposit function (for subadmin)
  const handleDepositSubmit = async () => {
    if (!user) return alert('Login required.');

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      return alert('Enter a valid deposit amount.');
    }

    if (!transactionId.trim()) {
      return alert('Enter transaction ID.');
    }

    setDepositSubmitting(true);

    try {
      await addDoc(collection(db, 's_subdepositRequests'), {
        uid: user.uid,
        email: user.email,
        amount,
        transactionId: transactionId.trim(),
        createdAt: serverTimestamp(),
        status: 'pending',
      });

      alert('Deposit request submitted!');
      setDepositAmount('');
      setTransactionId('');
    } catch (err) {
      console.error('Deposit error:', err);
      alert('Failed to submit deposit request.');
    } finally {
      setDepositSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded shadow-lg">

          {/* ✅ Wallet Balance */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Wallet</h2>
            <p>Current Balance: <span className="text-yellow-400 font-semibold">₹{walletBalance?.toFixed(2)}</span></p>
          </div>

<div className="mb-6">
  <h3 className="text-xl font-bold mb-2">Withdraw Money</h3>

  <label className="block mb-2">Withdraw Amount (Min ₹200)</label>
  <input
    type="number"
    placeholder="Withdraw Amount"
    value={withdrawAmount}
    onChange={(e) => {
      setWithdrawAmount(e.target.value);
      if (withdrawError) setWithdrawError('');
    }}
    className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded"
  />

  <label className="block mb-2">Select Payment Method</label>
  <select
    value={selectedMethod}
    onChange={(e) => setSelectedMethod(e.target.value)}
    className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded"
  >
    <option value="">-- Select Method --</option>
    <option value="UPI">UPI</option>
    <option value="PhonePe">PhonePe</option>
    <option value="Google Pay">Google Pay</option>
    <option value="Paytm">Paytm</option>
  </select>

  <label className="block mb-2">Your {selectedMethod || 'Payment'} ID</label>
  <input
    type="text"
    placeholder={`Enter your ${selectedMethod || 'Payment'} ID`}
    value={paymentDetails}
    onChange={(e) => setPaymentDetails(e.target.value)}
    className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded"
  />

  {withdrawError && (
    <p className="text-red-500 text-sm mb-3">{withdrawError}</p>
  )}

  <button
    onClick={handleWithdrawSubmit}
    disabled={withdrawSubmitting}
    className={`w-full py-3 font-semibold text-black rounded ${withdrawSubmitting ? 'bg-yellow-200' : 'bg-yellow-500 hover:bg-yellow-600'}`}
  >
    {withdrawSubmitting ? 'Submitting...' : 'Submit Withdraw Request'}
  </button>
</div>

        </div>
      </div>
    </Layout>
  );
}

