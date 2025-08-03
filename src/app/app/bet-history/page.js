'use client';

import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';
import firebaseApp from '@/firebase';
import Layout from '@/app/Components/Layout';

export default function BetHistoryPage() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchBets(currentUser.uid);
      } else {
        setUser(null);
        setBets([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchBets = async (uid) => {
    console.log(uid)
    try {
      const q = query(
        collection(db, 'subbets'),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const betsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBets(betsList);
    } catch (err) {
      console.error('Error fetching bets:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading bet history...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Please log in to view your bet history.
      </div>
    );
  }

  return (
    <Layout>
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-2xl p-6 overflow-x-auto">
        <h1 className="text-2xl font-bold mb-4">Your Bet History</h1>

        {bets.length === 0 ? (
          <p>No bets found.</p>
        ) : (
          <table className="min-w-full text-left border border-gray-700">
            <thead>
              <tr className="bg-gray-700 text-sm uppercase text-gray-300">
                <th className="px-4 py-2 border border-gray-700">Number</th>
                <th className="px-4 py-2 border border-gray-700">Range</th>
                <th className="px-4 py-2 border border-gray-700">Amount</th>
                <th className="px-4 py-2 border border-gray-700">Game Slot</th>
                <th className="px-4 py-2 border border-gray-700">Date</th>
                <th className="px-4 py-2 border border-gray-700">Time</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet.id} className="border-t border-gray-700">
                  <td className="px-4 py-2">{bet.number}</td>
                  <td className="px-4 py-2">{bet.range}</td>
                  <td className="px-4 py-2">₹{bet.amount ?? 'N/A'}</td>
                  <td className="px-4 py-2">{bet.gameSlot}</td>
                  <td className="px-4 py-2">{bet.day}</td>
                  <td className="px-4 py-2">{bet.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </Layout>
  );
}
