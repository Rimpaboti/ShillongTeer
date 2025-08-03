'use client';

import React, { useState } from 'react';
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

export default function AdminBetsLookupPage() {
  const db = getFirestore(firebaseApp);

  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('1:00 PM');
  const [range, setRange] = useState('0-9');
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);

  const slots = ['1:00 PM', '6:00 PM', '8:00 PM'];

  const handleSearch = async () => {
    if (!date || !slot || !range) {
      alert('Please fill all fields.');
      return;
    }

    setLoading(true);
    setBets([]);

    try {
      const [yyyy, mm, dd] = date.split('-');
      const formattedDay = `${dd}/${mm}/${yyyy}`;
      console.log('Searching for:', formattedDay, slot, range);

      // const q = query(
      //   collection(db, 'bets'),
      //   where('day', '==', formattedDay),
      //   where('gameSlot', '==', slot),
      //   where('range', '==', range),
      //   orderBy('createdAt', 'desc')
      // );
      const q = query(
  collection(db, 'subbets'), // ✅ use subbets collection
  where('day', '==', formattedDay),
  where('gameSlot', '==', slot),
  where('range', '==', range),
  orderBy('createdAt', 'desc')
);

      const snap = await getDocs(q);
      const results = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setBets(results);
    } catch (err) {
      console.error(err);
      alert('Error fetching bets.');
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Admin: Bets Lookup</h1>

          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl mb-8">
            <div className="mb-4">
              <label className="block mb-2">Select Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">Select Slot:</label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
              >
                {slots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Select Range:</label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
              >
                <option value="0-9">0 - 9</option>
                <option value="00-99">00 - 99</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className={`w-full py-3 rounded-md text-black font-semibold transition ${
                loading
                  ? 'bg-yellow-100 cursor-not-allowed'
                  : 'bg-yellow-400 hover:bg-yellow-500'
              }`}
            >
              {loading ? 'Searching...' : 'Search Bets'}
            </button>
          </div>

          {bets.length === 0 && !loading && (
            <p className="text-gray-400">No bets found for this filter.</p>
          )}

          {bets.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
              <h2 className="text-xl font-bold mb-4">Matching Bets:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bets.map((bet) => (
                  <div
                    key={bet.id}
                    className="border border-gray-600 p-4 rounded"
                  >
                    <p>
                      <span className="font-bold">User:</span> {bet.email || 'N/A'}
                    </p>
                    <p>
                      <span className="font-bold">Number:</span> {bet.number}
                    </p>
                    <p>
                      <span className="font-bold">Amount:</span> ₹{bet.amount}
                    </p>
                    <p>
                      <span className="font-bold">Time:</span> {bet.time || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}


