

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
  getDoc,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import firebaseApp from '@/firebase';
import Layout from '@/app/Components/Layout';

export default function Page() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // editing state
  const [editingBetId, setEditingBetId] = useState(null);
  const [editNumber, setEditNumber] = useState('');
  const [editAmount, setEditAmount] = useState('');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBets = async (uid) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 's_subbets'),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const betsList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBets(betsList);
    } catch (err) {
      console.error('Error fetching bets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Normalize slot so we accept '4PM', '4 PM', '4pm', and '5PM' variants, or gameSlot.
  const normalizeSlot = (raw) => {
    if (!raw) return null;
    const s = String(raw).replace(/\s+/g, '').toUpperCase(); // "4PM", "5PM"
    if (s.startsWith('4')) return '4PM';
    if (s.startsWith('5')) return '5PM';
    return null;
  };

  // Configure cutoffs for the two slots
  // Example: lock edits 15 minutes before the hour
  const slotCutoffs = {
    '4PM': { hour: 15, minute: 45 }, // 3:45 PM cutoff (no edits at/after this time)
    '5PM': { hour: 16, minute: 45 }, // 4:45 PM cutoff
  };

  const getCutoffDate = (slot) => {
    const normalized = normalizeSlot(slot);
    if (!normalized || !slotCutoffs[normalized]) return null;
    const c = slotCutoffs[normalized];
    const cutoff = new Date();
    cutoff.setHours(c.hour, c.minute, 0, 0); // today at cutoff hh:mm:00.000
    return cutoff;
  }; // Uses Date.setHours(hours, minutes, seconds, ms). [MDN]

  // helper: check if date is today
  const isToday = (date) => {
    const d = date?.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  // Only editable if created today AND before that slot's cutoff
  const canEditBet = (bet) => {
    if (!isToday(bet.createdAt)) return false;
    const slot = bet.slot || bet.gameSlot;
    const cutoff = getCutoffDate(slot);
    if (!cutoff) return false;
    return new Date() < cutoff;
  };

  // Returns seconds left (>=0) or 0 if expired or invalid slot
  const secondsLeftForEdit = (bet) => {
    const slot = bet.slot || bet.gameSlot;
    const cutoff = getCutoffDate(slot);
    if (!cutoff) return 0;
    const diffMs = cutoff - new Date();
    return Math.max(0, Math.floor(diffMs / 1000));
  };

  // Start editing a bet
  const startEditing = (bet) => {
    if (!canEditBet(bet)) return;
    setEditingBetId(bet.id);
    setEditNumber(bet.number ?? '');
    setEditAmount(bet.amount ?? '');
  };

  const cancelEdit = () => {
    setEditingBetId(null);
    setEditNumber('');
    setEditAmount('');
  };

  const saveEdit = async (betId) => {
    if (!editNumber || editNumber.toString().trim() === '') {
      alert('Enter a valid number.');
      return;
    }

    const amountNum = Number(editAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Enter a valid amount (> 0).');
      return;
    }

    // Minimum bet check
    if (amountNum < 10) {
      alert('Minimum bet amount is ₹10.');
      return;
    }

    try {
      // find the bet
      const oldBet = bets.find((b) => b.id === betId);
      if (!oldBet) {
        alert('Bet not found.');
        return;
      }

      // Check wallet balance before increasing bet
      if (amountNum > oldBet.amount) {
        const diff = amountNum - oldBet.amount;
        const walletRef = doc(db, 's_subwallets', user.uid);
        const walletSnap = await getDoc(walletRef);

        if (!walletSnap.exists()) {
          alert('Wallet not found.');
          return;
        }

        const currentBalance = walletSnap.data().balance || 0;
        if (currentBalance < diff) {
          alert('Insufficient balance to increase bet.');
          return;
        }
      }

      // Update bet
      const betRef = doc(db, 's_subbets', betId);
      await updateDoc(betRef, {
        number: editNumber,
        amount: amountNum,
      });

      // Adjust wallet if amount changed
      if (amountNum !== oldBet.amount) {
        const diff = amountNum - oldBet.amount;
        const walletRef = doc(db, 's_subwallets', user.uid);

        if (diff > 0) {
          // amount increased → deduct from wallet
          await updateDoc(walletRef, {
            balance: increment(-diff),
          });
        } else {
          // amount decreased → credit wallet
          await updateDoc(walletRef, {
            balance: increment(Math.abs(diff)),
          });
        }
      }

      // Update local state
      setBets((prev) =>
        prev.map((b) =>
          b.id === betId
            ? { ...b, number: editNumber, amount: amountNum }
            : b
        )
      );

      cancelEdit();
    } catch (err) {
      console.error('Error updating bet:', err);
      alert('Failed to save changes. Try again.');
    }
  };

  const TimerCell = ({ bet }) => {
    const [secsLeft, setSecsLeft] = useState(secondsLeftForEdit(bet));

    useEffect(() => {
      setSecsLeft(secondsLeftForEdit(bet));
      const interval = setInterval(() => {
        setSecsLeft(secondsLeftForEdit(bet));
      }, 1000);
      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bet]);

    if (secsLeft <= 0) {
      return <span className="text-red-400 text-sm">Time up</span>;
    }

    const hrs = Math.floor(secsLeft / 3600);
    const mins = Math.floor((secsLeft % 3600) / 60);
    const secs = secsLeft % 60;
    const parts = [];
    if (hrs) parts.push(`${hrs}h`);
    if (mins || hrs) parts.push(`${mins}m`);
    parts.push(`${secs}s`);

    return <span className="text-green-300 text-sm">{parts.join(' ')}</span>;
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
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Your Bet History</h1>

          {bets.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 shadow-sm">
              <p className="text-gray-300">No bets found.</p>
            </div>
          ) : (
            <>
              {/* Table view for medium+ screens */}
              <div className="hidden md:block bg-gray-800 rounded-lg p-4 shadow-sm overflow-x-auto">
                <table className="w-full text-left table-auto border-collapse">
                  <thead>
                    <tr className="text-sm text-gray-300 uppercase">
                      <th className="px-3 py-2 border-b border-gray-700">#</th>
                      <th className="px-3 py-2 border-b border-gray-700">Number</th>
                      <th className="px-3 py-2 border-b border-gray-700">Range</th>
                      <th className="px-3 py-2 border-b border-gray-700">Amount</th>
                      <th className="px-3 py-2 border-b border-gray-700">Slot</th>
                      <th className="px-3 py-2 border-b border-gray-700">Date</th>
                      <th className="px-3 py-2 border-b border-gray-700">Cutoff Timer</th>
                      <th className="px-3 py-2 border-b border-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bets.map((bet, i) => {
                      const editable = canEditBet(bet);
                      const isEditing = editingBetId === bet.id;
                      return (
                        <tr key={bet.id} className="align-top border-b border-gray-700">
                          <td className="px-3 py-2">{i + 1}</td>

                          {/* Number (editable) */}
                          <td className="px-3 py-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editNumber}
                                onChange={(e) => setEditNumber(e.target.value)}
                                className="w-24 bg-gray-700 text-white p-1 rounded border border-gray-600"
                              />
                            ) : (
                              bet.number ?? '-'
                            )}
                          </td>

                          <td className="px-3 py-2">{bet.range ?? '-'}</td>

                          {/* Amount (editable) */}
                          <td className="px-3 py-2">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="w-28 bg-gray-700 text-white p-1 rounded border border-gray-600"
                              />
                            ) : (
                              `₹${bet.amount ?? 'N/A'}`
                            )}
                          </td>

                          <td className="px-3 py-2">{bet.slot ?? bet.gameSlot ?? '-'}</td>
                          <td className="px-3 py-2">
                            {bet.day ?? '-'} {bet.time ? <span className="text-xs text-gray-400">({bet.time})</span> : ''}
                          </td>

                          <td className="px-3 py-2">
                            <TimerCell bet={bet} />
                          </td>

                          <td className="px-3 py-2">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEdit(bet.id)}
                                  className="bg-green-500 text-black px-3 py-1 rounded hover:brightness-95"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="bg-gray-600 px-3 py-1 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={() => startEditing(bet)}
                                  disabled={!editable}
                                  className={`px-3 py-1 rounded ${
                                    editable
                                      ? 'bg-yellow-400 text-black hover:brightness-95'
                                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  Edit
                                </button>

                                {!editable && (
                                  <span className="text-xs text-gray-400">Locked</span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Card view for small screens */}
              <div className="md:hidden space-y-3">
                {bets.map((bet) => {
                  const editable = canEditBet(bet);
                  const isEditing = editingBetId === bet.id;
                  return (
                    <div key={bet.id} className="bg-gray-800 rounded-md p-3 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-gray-300">
                            Slot:{' '}
                            <span className="font-medium text-white">
                              {bet.slot ?? bet.gameSlot ?? '-'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {bet.day} {bet.time}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm">{isEditing ? '' : `₹${bet.amount ?? 'N/A'}`}</div>
                          <div className="text-xs mt-1"><TimerCell bet={bet} /></div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-400">Number</div>
                          {isEditing ? (
                            <input
                              className="w-full bg-gray-700 p-1 rounded border border-gray-600"
                              value={editNumber}
                              onChange={(e) => setEditNumber(e.target.value)}
                            />
                          ) : (
                            <div className="text-white">{bet.number ?? '-'}</div>
                          )}
                        </div>

                        <div>
                          <div className="text-xs text-gray-400">Amount</div>
                          {isEditing ? (
                            <input
                              className="w-full bg-gray-700 p-1 rounded border border-gray-600"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              type="number"
                            />
                          ) : (
                            <div className="text-white">₹{bet.amount ?? 'N/A'}</div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(bet.id)}
                              className="flex-1 bg-green-500 text-black px-3 py-1 rounded"
                            >
                              Save
                            </button>
                            <button onClick={cancelEdit} className="flex-1 bg-gray-600 px-3 py-1 rounded">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(bet)}
                              disabled={!editable}
                              className={`flex-1 px-3 py-1 rounded ${
                                editable ? 'bg-yellow-400 text-black' : 'bg-red-600 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {editable ? 'Edit' : 'Locked'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

