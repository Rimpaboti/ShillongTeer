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

  const [walletBalance, setWalletBalance] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [range, setRange] = useState('0-9');
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeGameSlot, setActiveGameSlot] = useState(null);

  // Deposit states
  const [depositAmount, setDepositAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [depositSubmitting, setDepositSubmitting] = useState(false);

  // Withdraw states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

  const numberOptions =
   range === '0-9'
    ? Array.from({ length: 10 }, (_, i) => i) // generates [0,1,2,...,9]
    : Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));


  const gameTimes = [
    { label: '1:00 PM', resultHour: 13 },
    { label: '6:00 PM', resultHour: 18 },
    { label: '8:00 PM', resultHour: 20 },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const walletRef = doc(db, 'wallets', currentUser.uid);
        const walletSnap = await getDoc(walletRef);
        if (walletSnap.exists()) {
          const bal = walletSnap.data().balance ?? 0;
          setWalletBalance(bal);
        } else {
          await updateDoc(walletRef, {
            email: currentUser.email,
            uid: currentUser.uid,
            balance: 0,
            createdAt: serverTimestamp(),
          }).catch(() => {});
          setWalletBalance(0);
        }
      }
    });

    const now = new Date();
    let foundSlot = null;

    for (let game of gameTimes) {
      const resultTime = new Date();
      resultTime.setHours(game.resultHour, 0, 0, 0);
      const closeTime = new Date(resultTime.getTime() - 15 * 60 * 1000);

      if (now < closeTime) {
        foundSlot = {
          label: game.label,
          closesAt: closeTime,
        };
        break;
      }
    }

    if (!foundSlot) {
      const nextSlot = gameTimes[0];
      const resultTime = new Date();
      resultTime.setDate(now.getDate() + 1);
      resultTime.setHours(nextSlot.resultHour, 0, 0, 0);
      const closeTime = new Date(resultTime.getTime() - 15 * 60 * 1000);
      foundSlot = {
        label: nextSlot.label + ' (Tomorrow)',
        closesAt: closeTime,
      };
    }

    setActiveGameSlot(foundSlot);

    return () => unsubscribe();
  }, [auth, db]);

  const handleBetSubmit = async () => {
    if (!user) {
      alert('You must be logged in to play.');
      return;
    }
    if (!selectedNumber) {
      alert('Please select a number.');
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount < 10 || amount > 20000) {
      alert('Enter valid bet amount (10 - 20000).');
      return;
    }

    if ((walletBalance ?? 0) < amount) {
      alert('Insufficient wallet balance.');
      return;
    }

    const now = new Date();

    const bet = {
      uid: user.uid,
      email: user.email,
      number: selectedNumber,
      amount: amount,
      range,
      createdAt: serverTimestamp(),
      day: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      gameSlot: activeGameSlot?.label || 'Unknown',
    };

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'bets'), bet);
      const walletRef = doc(db, 'wallets', user.uid);
      await updateDoc(walletRef, {
        balance: (walletBalance ?? 0) - amount,
        updatedAt: serverTimestamp(),
      });
      setWalletBalance((prev) => (prev ?? 0) - amount);

      alert('Bet placed successfully!');
      setSelectedNumber(null);
      setBetAmount('');
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDepositSubmit = async () => {
    if (!user) {
      alert('You must be logged in to submit a deposit request.');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Enter valid deposit amount.');
      return;
    }

    if (!transactionId.trim()) {
      alert('Enter valid transaction ID.');
      return;
    }

    setDepositSubmitting(true);

    try {
      await addDoc(collection(db, 'depositRequests'), {
        uid: user.uid,
        email: user.email,
        amount: amount,
        transactionId: transactionId.trim(),
        createdAt: serverTimestamp(),
        status: 'pending',
      });
      alert('Deposit request submitted! Admin will verify shortly.');
      setDepositAmount('');
      setTransactionId('');
    } catch (error) {
      console.error('Error submitting deposit request:', error);
      alert('Failed to submit deposit request.');
    } finally {
      setDepositSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!user) {
      alert('You must be logged in to submit a withdrawal request.');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Enter valid withdrawal amount.');
      return;
    }

    if ((walletBalance ?? 0) < amount) {
      alert('Insufficient wallet balance for withdrawal.');
      return;
    }

    setWithdrawSubmitting(true);

    try {
      await addDoc(collection(db, 'withdrawRequests'), {
        uid: user.uid,
        email: user.email,
        amount: amount,
        createdAt: serverTimestamp(),
        status: 'pending',
      });
      alert('Withdraw request submitted! Admin will process it shortly.');
      setWithdrawAmount('');
    } catch (error) {
      console.error('Error submitting withdraw request:', error);
      alert('Failed to submit withdraw request.');
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-xl mx-auto bg-gray-800 rounded-lg shadow-2xl p-6">

          {/* Wallet Balance */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Wallet</h1>
            <p className="text-lg">
              Current Balance:{' '}
              <span className="font-bold text-yellow-400">
                ₹{walletBalance?.toFixed(2) ?? '...'}
              </span>
            </p>
          </div>

          {/* Deposit Form */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Add Money</h2>
            <p className="mb-1">Pay using UPI ID:</p>
            <p className="font-mono text-yellow-400 mb-2">exampleupi@okbank</p>
            <p className="mb-1">Or Google Pay / PhonePe:</p>
            <p className="font-mono text-yellow-400 mb-4">+91 9876543210</p>

            <label className="block mb-2">Transaction ID:</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Transaction ID"
              className="w-full px-4 py-2 mb-4 bg-gray-700 border border-gray-600 rounded focus:outline-none"
            />

            <label className="block mb-2">Amount Paid (₹):</label>
            <input
              type="number"
              min="1"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount"
              className="w-full px-4 py-2 mb-4 bg-gray-700 border border-gray-600 rounded focus:outline-none"
            />

            <button
              onClick={handleDepositSubmit}
              disabled={depositSubmitting}
              className={`w-full py-3 rounded-md text-black font-semibold transition ${
                depositSubmitting
                  ? 'bg-yellow-100 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {depositSubmitting ? 'Submitting...' : 'Submit Deposit Request'}
            </button>
          </div>

          {/* Withdraw Form */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Withdraw Money</h2>

            <label className="block mb-2">Withdraw Amount (₹):</label>
            <input
              type="number"
              min="1"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Withdraw Amount"
              className="w-full px-4 py-2 mb-4 bg-gray-700 border border-gray-600 rounded focus:outline-none"
            />

            <button
              onClick={handleWithdrawSubmit}
              disabled={withdrawSubmitting}
              className={`w-full py-3 rounded-md text-black font-semibold transition ${
                withdrawSubmitting
                  ? 'bg-yellow-100 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {withdrawSubmitting ? 'Submitting...' : 'Submit Withdraw Request'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
