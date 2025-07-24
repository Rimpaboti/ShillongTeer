'use client';

import React, { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import firebaseApp from '@/firebase';
import Layout from '@/app/Components/Layout';

export default function ResultsPage() {
  const db = getFirestore(firebaseApp);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const resultsQuery = query(
          collection(db, 'results'),
          orderBy('declaredAt', 'desc'),
          limit(30)
        );
        const querySnapshot = await getDocs(resultsQuery);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setResults(data);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [db]);

  return (
    <Layout>
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Last 30 Days Results</h1>

        {loading ? (
          <p className="text-gray-400">Loading results...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-400">No results declared yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Game Slot</th>
                  <th className="px-4 py-2 text-left">Winning Number</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-t border-gray-700">
                    <td className="px-4 py-2">
                      {result.day || 'Unknown'}
                    </td>
                    <td className="px-4 py-2">
                      {result.gameSlot || 'Unknown'}
                    </td>
                    <td className="px-4 py-2 font-bold text-yellow-400">
                      {result.winningNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}
