

'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/app/Components/Layout';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseApp from '@/firebase';

export default function Page() {
  const db = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 's_users', user.uid));
        const data = userDoc.exists() ? userDoc.data() : {};
        const userRole = data?.role || 'user';
        setRole(userRole);

        const walletQuery = userRole === 'admin'
          ? collection(db, 's_subwallets')
          : query(collection(db, 's_subwallets'), where('subAdminId', '==', user.uid));

        const walletsSnap = await getDocs(walletQuery);
        const wallets = walletsSnap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));

        const depositSnap = await getDocs(query(
          collection(db, 's_subdepositRequests'),
          where('status', '==', 'approved'),
          orderBy('approvedAt', 'desc')
        ));

        const withdrawSnap = await getDocs(query(
          collection(db, 's_subwithdrawRequests'),
          where('status', '==', 'approved'),
          orderBy('approvedAt', 'desc')
        ));

        const depositMap = {};
        const withdrawMap = {};

        depositSnap.forEach((doc) => {
          const data = doc.data();
          if (!depositMap[data.uid]) depositMap[data.uid] = [];
          depositMap[data.uid].push({
            amount: data.amount,
            approvedAt: data.approvedAt.toDate(),
          });
        });

        withdrawSnap.forEach((doc) => {
          const data = doc.data();
          if (!withdrawMap[data.uid]) withdrawMap[data.uid] = [];
          withdrawMap[data.uid].push({
            amount: data.amount,
            approvedAt: data.approvedAt.toDate(),
          });
        });

        const userList = await Promise.all(
          wallets.map(async (wallet) => {
            const userDoc = await getDoc(doc(db, 's_users', wallet.uid));
            return {
              uid: wallet.uid,
              email: userDoc.exists() ? userDoc.data().email : 'Unknown',
              balance: wallet.balance || 0,
              deposits: depositMap[wallet.uid] || [],
              withdrawals: withdrawMap[wallet.uid] || [],
            };
          })
        );

        setUsers(userList);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users
    .filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
    .map((user) => {
      const filteredDeposits = dateFilter
        ? user.deposits.filter((d) =>
            d.approvedAt.toLocaleDateString() === new Date(dateFilter).toLocaleDateString()
          )
        : user.deposits;

      const filteredWithdrawals = dateFilter
        ? user.withdrawals.filter((w) =>
            w.approvedAt.toLocaleDateString() === new Date(dateFilter).toLocaleDateString()
          )
        : user.withdrawals;

      return {
        ...user,
        deposits: filteredDeposits,
        withdrawals: filteredWithdrawals,
      };
    });

  const exportCSV = () => {
    const headers = ['Email', 'Balance', 'Deposits', 'Withdrawals'];
    const rows = filteredUsers.map((u) => [
      u.email,
      u.balance,
      u.deposits.map((d) => `${d.amount} on ${d.approvedAt.toLocaleDateString()} ${d.approvedAt.toLocaleTimeString()}`).join('; '),
      u.withdrawals.map((w) => `${w.amount} on ${w.approvedAt.toLocaleDateString()} ${w.approvedAt.toLocaleTimeString()}`).join('; '),
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wallet_report.csv';
    link.click();
  };

  return (
    <Layout>
      <div className="p-4 min-h-screen mx-auto bg-gray-900 text-white">
        <h1 className="text-2xl font-semibold mb-4">Wallet Overview</h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by email"
            className="p-2 border rounded w-full sm:w-1/3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            type="date"
            className="p-2 border rounded w-full sm:w-1/3"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

          <button
            onClick={exportCSV}
            className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Export CSV
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Balance</th>
                  <th className="p-2 border">Deposits</th>
                  <th className="p-2 border">Withdrawals</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => {
                  const totalDeposit = user.deposits.reduce((sum, d) => sum + d.amount, 0);
                  const totalWithdrawal = user.withdrawals.reduce((sum, w) => sum + w.amount, 0);

                  return (
                    <tr key={index} className="border hover:bg-gray-800 align-top">
                      <td className="p-2 border whitespace-nowrap">{user.email}</td>
                      <td className="p-2 border font-semibold">₹{user.balance}</td>

                      <td className="p-2 border">
                        <div className="max-h-28 overflow-y-auto space-y-1">
                          {user.deposits.length > 0 ? (
                            <>
                              {user.deposits.map((d, i) => (
                                <div key={i}>
                                  ₹{d.amount} on {d.approvedAt.toLocaleDateString()} {d.approvedAt.toLocaleTimeString()}
                                </div>
                              ))}
                              <div className="font-medium text-green-600 mt-1">
                                Total: ₹{totalDeposit}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">No deposits</span>
                          )}
                        </div>
                      </td>

                      <td className="p-2 border">
                        <div className="max-h-28 overflow-y-auto space-y-1">
                          {user.withdrawals.length > 0 ? (
                            <>
                              {user.withdrawals.map((w, i) => (
                                <div key={i}>
                                  ₹{w.amount} on {w.approvedAt.toLocaleDateString()} {w.approvedAt.toLocaleTimeString()}
                                </div>
                              ))}
                              <div className="font-medium text-red-600 mt-1">
                                Total: ₹{totalWithdrawal}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">No withdrawals</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

