'use client';

import React, { useState } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseApp from '@/firebase';
import Layout from '@/app/Components/Layout';

export default function DeclareResultPage() {
  const db = getFirestore(firebaseApp);

  const [day, setDay] = useState('');
  const [gameSlot, setGameSlot] = useState('');
  const [range, setRange] = useState('0-9');
  const [winningNumber, setWinningNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Normalize values for comparison based on range
  const normalizeNumber = (val, rng) => {
    if (rng === '00-99') {
      return String(val).padStart(2, '0'); // "05", "23"
    }
    // 0-9: keep as string of integer (no leading zero)
    return String(parseInt(val, 10));
  };

  const handleDeclare = async () => {
    if (!day || !gameSlot || !range || String(winningNumber).trim() === '') {
      alert('Please fill all fields.');
      return;
    }

    // Validate and normalize winning number
    let winningNorm;
    if (range === '0-9') {
      const n = parseInt(winningNumber, 10);
      if (isNaN(n) || n < 0 || n > 9) {
        alert('Winning number must be between 0 - 9.');
        return;
      }
      winningNorm = String(n); // "0".."9"
    } else {
      if (!/^\d{2}$/.test(winningNumber)) {
        alert('Winning number must be two digits (00 - 99).');
        return;
      }
      winningNorm = String(winningNumber).padStart(2, '0'); // ensure "0X" form
    }

    setSubmitting(true);

    try {
      const resultsRef = collection(db, 's_subresults');

      // Prevent duplicate declaration for same day/slot/range
      const checkQuery = query(
        resultsRef,
        where('day', '==', day),
        where('gameSlot', '==', gameSlot),
        where('range', '==', range)
      );
      const existing = await getDocs(checkQuery);
      if (!existing.empty) {
        alert('Result already declared for this day, slot and range.');
        setSubmitting(false);
        return;
      }

      // Fetch all bets for this selection
      const betsRef = collection(db, 's_subbets');
      const betsQuery = query(
        betsRef,
        where('day', '==', day),
        where('gameSlot', '==', gameSlot),
        where('range', '==', range)
      );
      const betsSnap = await getDocs(betsQuery);

      if (betsSnap.empty) {
        alert('No bets found, but result will still be declared.');
      }

      // Apply winnings atomically
      await runTransaction(db, async (transaction) => {
        // Preload wallets for only the winners to read balance once per user
        const walletsToUpdate = new Map();

        // First pass: discover winners and preload their wallets
        for (const betDoc of betsSnap.docs) {
          const bet = betDoc.data();
          if (!bet?.uid) throw new Error(`Missing UID for bet: ${betDoc.id}`);

          const betNorm = normalizeNumber(bet.number, range);
          const isWinner = betNorm === winningNorm;

          if (isWinner) {
            const walletRef = doc(db, 's_subwallets', bet.uid);
            if (!walletsToUpdate.has(bet.uid)) {
              const walletSnap = await transaction.get(walletRef);
              walletsToUpdate.set(bet.uid, {
                ref: walletRef,
                balance: walletSnap.exists() ? walletSnap.data().balance || 0 : 0,
              });
            }
          }
        }

        // Second pass: update bets and wallets
        for (const betDoc of betsSnap.docs) {
          const bet = betDoc.data();
          if (!bet?.uid) throw new Error(`Missing UID for bet: ${betDoc.id}`);

          const betNorm = normalizeNumber(bet.number, range);
          const isWinner = betNorm === winningNorm;

          if (isWinner) {
            const multiplier = range === '0-9' ? 8 : 80;
            const amount = Number(bet.amount) || 0;
            const winAmount = amount * multiplier;

            const walletData = walletsToUpdate.get(bet.uid);
            const newBalance = (walletData?.balance || 0) + winAmount;

            if (!walletData?.ref) {
              // if wallet wasn't preloaded (shouldn't happen), create ref now
              walletData.ref = doc(db, 's_subwallets', bet.uid);
            }

            transaction.set(
              walletData.ref,
              { balance: newBalance, updatedAt: serverTimestamp() },
              { merge: true }
            );

            transaction.update(betDoc.ref, {
              result: 'won',
              winningNumber: range === '00-99' ? winningNorm : Number(winningNorm),
              winAmount,
              resultDeclaredAt: serverTimestamp(),
            });
          } else {
            transaction.update(betDoc.ref, {
              result: 'lost',
              winningNumber: range === '00-99' ? winningNorm : Number(winningNorm),
              resultDeclaredAt: serverTimestamp(),
            });
          }
        }
      });

      // Record the declared result
      await addDoc(resultsRef, {
        day,
        gameSlot,
        range,
        winningNumber: range === '00-99' ? winningNorm : Number(winningNorm),
        declaredAt: serverTimestamp(),
      });

      alert('Result declared & winnings distributed!');
      setWinningNumber('');
    } catch (error) {
      console.error('Error declaring result:', error);
      alert('Error declaring result.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateChange = (e) => {
    const iso = e.target.value;
    const [yyyy, mm, dd] = iso.split('-');
    setDay(`${dd}/${mm}/${yyyy}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6">Admin: Declare Result</h1>

          <div className="mb-4">
            <label className="block mb-1">Day</label>
            <input
              type="date"
              value={day ? day.split('/').reverse().join('-') : ''}
              onChange={handleDateChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Game Slot</label>
            <select
              value={gameSlot}
              onChange={(e) => setGameSlot(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded"
            >
              <option value="">Select Game Slot</option>
              <option value="4:00 PM">4:00 PM</option>
              <option value="5:00 PM">5:00 PM</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Range</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded"
            >
              <option value="0-9">0-9</option>
              <option value="00-99">00-99</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block mb-1">Winning Number</label>
            <input
              type="text"
              value={winningNumber}
              onChange={(e) => setWinningNumber(e.target.value)}
              placeholder={range === '0-9' ? '0 - 9' : '00 - 99'}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded"
            />
          </div>

          <button
            onClick={handleDeclare}
            disabled={submitting}
            className={`w-full py-3 rounded-md font-semibold text-black ${
              submitting
                ? 'bg-yellow-100 cursor-not-allowed'
                : 'bg-yellow-400 hover:bg-yellow-500'
            }`}
          >
            {submitting ? 'Declaring...' : 'Declare Result'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
