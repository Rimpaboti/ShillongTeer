'use client'

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

  const numberOptions =
    range === '0-9'
      ? Array.from({ length: 10 }, (_, i) => i)
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
          // Create wallet if doesn't exist
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

    // Determine active slot
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
        label: nextSlot.label,
        closesAt: closeTime,
      };
    }

    setActiveGameSlot(foundSlot);

    return () => unsubscribe();
  }, [auth, db]);

  const handleSubmit = async () => {
    if (!user) {
      alert('You must be logged in to play.');
      return;
    }
    if (selectedNumber === null || undefined) {
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
      // Save bet
      await addDoc(collection(db, 'bets'), bet);
      // Deduct balance
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-xl mx-auto bg-gray-800 rounded-lg shadow-2xl p-6">
        <h1 className="text-2xl font-bold mb-4">Play Board</h1>

        {/* Wallet */}
        <div className="mb-6">
          <p className="text-lg">
            Wallet Balance:{' '}
            <span className="font-bold text-yellow-400">
              ₹{walletBalance?.toFixed(2) ?? '...'}
            </span>
          </p>
          <p className="text-sm text-gray-400">
            {user ? `Logged in as: ${user.email}` : 'Not logged in'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Current Game Slot:{' '}
            <span className="font-bold">
              {activeGameSlot
                ? `${activeGameSlot.label} (Closes at ${activeGameSlot.closesAt.toLocaleTimeString()})`
                : 'Calculating...'}
            </span>
          </p>
        </div>

        {/* Range Selector */}
        <div className="mb-4">
          <label className="block mb-2">Select Number Range:</label>
          <select
            value={range}
            onChange={(e) => {
              setRange(e.target.value);
              setSelectedNumber(null);
            }}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
          >
            <option value="0-9">0 - 9</option>
            <option value="00-99">00 - 99</option>
          </select>
        </div>

        {/* Number Grid */}
        <div className="mb-4">
          <label className="block mb-2">Pick a Number:</label>
          <div className="grid grid-cols-5 gap-2">
            {numberOptions.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedNumber(num)}
                className={`px-4 py-2 rounded text-center ${
                  selectedNumber === num
                    ? 'bg-yellow-500 text-black font-bold'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Bet Amount */}
        <div className="mb-6">
          <label className="block mb-2">Bet Amount (₹):</label>
          <input
            type="number"
            min="10"
            max="20000"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || selectedNumber === null}
          className={`w-full py-3 rounded-md text-black font-semibold transition ${
            submitting || selectedNumber == null || selectedNumber == undefined
              ? 'bg-yellow-100 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Bet'}
        </button>
      </div>
    </div>
  );
}
