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
  setDoc,
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
  const [countdown, setCountdown] = useState('');

  const numberOptions =
    range === '0-9'
      ? Array.from({ length: 10 }, (_, i) => i)
      : Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));

  // const getGameSlot = () => {
  //   const now = new Date();
  //   const currentTime = now.getTime();

  //   const today = new Date();
  //   const cutoff1 = new Date(today.setHours(12, 45, 0, 0)).getTime();
  //   const cutoff2 = new Date(today.setHours(17, 45, 0, 0)).getTime();
  //   const cutoff3 = new Date(today.setHours(19, 45, 0, 0)).getTime();

  //   let slotLabel = '';
  //   let closesAt;

  //   if (currentTime < cutoff1) {
  //     slotLabel = '1:00 PM';
  //     closesAt = new Date(cutoff1);
  //   } else if (currentTime < cutoff2) {
  //     slotLabel = '6:00 PM';
  //     closesAt = new Date(cutoff2);
  //   } else if (currentTime < cutoff3) {
  //     slotLabel = '8:00 PM';
  //     closesAt = new Date(cutoff3);
  //   } else {
  //     const tomorrow = new Date();
  //     tomorrow.setDate(now.getDate() + 1);
  //     tomorrow.setHours(12, 45, 0, 0);
  //     slotLabel = '1:00 PM';
  //     closesAt = tomorrow;
  //   }

  //   return { label: slotLabel, closesAt };
  // };

  // ⏱️ Countdown effect
  const getGameSlot = () => {
  const now = new Date();
  const currentTime = now.getTime();

  const today = new Date();
  const cutoff1 = new Date(today.setHours(15, 45, 0, 0)).getTime(); // 3:45 PM
  const cutoff2 = new Date(today.setHours(16, 45, 0, 0)).getTime(); // 4:45 PM

  let slotLabel = '';
  let closesAt;

  if (currentTime < cutoff1) {
    slotLabel = '4:00 PM';
    closesAt = new Date(cutoff1);
  } else if (currentTime < cutoff2) {
    slotLabel = '5:00 PM';
    closesAt = new Date(cutoff2);
  } else {
    // After last slot → next day's 4:00 PM
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(15, 45, 0, 0); // 3:45 PM
    slotLabel = '4:00 PM';
    closesAt = tomorrow;
  }

  return { label: slotLabel, closesAt };
};

  useEffect(() => {
    const updateCountdown = () => {
      if (!activeGameSlot?.closesAt) return;

      const now = new Date().getTime();
      const closeTime = activeGameSlot.closesAt.getTime();
      const distance = closeTime - now;

      if (distance <= 0) {
        setCountdown('00:00:00');
        setActiveGameSlot(getGameSlot()); // refresh next slot
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
          seconds
        ).padStart(2, '0')}`
      );
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown(); // initial call

    return () => clearInterval(timer);
  }, [activeGameSlot]);

  // 🔁 Load user + wallet + slot
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // const walletRef = doc(db, 'wallets', currentUser.uid);
        const walletRef = doc(db, 's_subwallets', currentUser.uid);
        const walletSnap = await getDoc(walletRef);
        if (walletSnap.exists()) {
          setWalletBalance(walletSnap.data().balance ?? 0);
        } else {
          await setDoc(walletRef, {
            email: currentUser.email,
            uid: currentUser.uid,
            balance: 0,
            createdAt: serverTimestamp(),
          });
          setWalletBalance(0);
        }
      }
    });

    setActiveGameSlot(getGameSlot());

    return () => unsubscribe();
  }, []);

  // 🟡 Submit Bet
  const handleSubmit = async () => {
    if (!user) return alert('You must be logged in to play.');
    if (selectedNumber === null || selectedNumber === undefined) return alert('Please select a number.');

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
    const gameSlot = getGameSlot();

    if (now.getTime() > gameSlot.closesAt.getTime()) {
      alert(`This game slot (${gameSlot.label}) is already closed. Try the next one.`);
      setActiveGameSlot(getGameSlot());
      return;
    }
    const slotDate = gameSlot.closesAt;
    const userDoc = await getDoc(doc(db, 's_users', user.uid));
    const subAdminId = userDoc.exists() ? userDoc.data().subAdminId || null : null;
    const bet = {
      uid: user.uid,
      email: user.email,
      number: selectedNumber,
      amount: amount,
      range,
      subAdminId,
      createdAt: serverTimestamp(),
      // day: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`,
      day: `${String(slotDate.getDate()).padStart(2, '0')}/${String(slotDate.getMonth() + 1).padStart(2, '0')}/${slotDate.getFullYear()}`,
      time: now.toLocaleTimeString(),
      gameSlot: gameSlot.label,
    };

    setSubmitting(true);
    try {
      // await addDoc(collection(db, 'bets'), bet);
      await addDoc(collection(db, 's_subbets'), bet);

      const walletRef = doc(db, 's_subwallets', user.uid);
      await updateDoc(walletRef, {
        balance: (walletBalance ?? 0) - amount,
        updatedAt: serverTimestamp(),
      });
      setWalletBalance((prev) => (prev ?? 0) - amount);

      alert('Bet placed successfully!');
      setSelectedNumber(null);
      setBetAmount('');
      setActiveGameSlot(getGameSlot());
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">🎯 Play Board</h1>

        {/* Wallet Info */}
        <div className="mb-6 text-sm sm:text-base">
          <p className="mb-1">
            Wallet Balance:{' '}
            <span className="font-bold text-yellow-400">
              ₹{walletBalance?.toFixed(2) ?? '...'}
            </span>
          </p>
          <p className="text-gray-400">
            {user ? `Logged in as: ${user.email}` : 'Not logged in'}
          </p>
          <p className="text-gray-400 mt-2">
            Current Game Slot:{' '}
            <span className="font-bold text-yellow-300">
              {activeGameSlot
                ? `${activeGameSlot.label} (Closes at ${activeGameSlot.closesAt.toLocaleTimeString()} on ${activeGameSlot.closesAt.toLocaleDateString('en-GB')})`
                : 'Calculating...'}
            </span>
          </p>
          {countdown && (
            <p className="text-sm mt-1 text-green-400 font-mono">
              ⏳ Closes in: {countdown}
            </p>
          )}
        </div>

        {/* Range Selector */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Number Range:</label>
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
        <div className="mb-6">
          <label className="block mb-2 font-medium">Pick a Number:</label>
          <div className={`grid gap-2 ${range === '0-9' ? 'grid-cols-5' : 'grid-cols-6 sm:grid-cols-8 md:grid-cols-10'}`}>
            {numberOptions.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedNumber(num)}
                className={`px-3 py-2 rounded text-sm sm:text-base text-center transition ${
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
          <label className="block mb-2 font-medium">Bet Amount (₹):</label>
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

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting || selectedNumber === null}
          className={`w-full py-3 rounded-md text-black font-semibold transition ${
            submitting || selectedNumber == null
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
