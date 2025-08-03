// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   query,
//   where,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function AdminUserWalletsPage() {
//   const db = getFirestore(firebaseApp);

//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     fetchUserWalletData();
//   }, []);

//   const fetchUserWalletData = async () => {
//     setLoading(true);

//     try {
//       const walletsSnap = await getDocs(collection(db, 'wallets'));
//       const wallets = walletsSnap.docs.map((doc) => ({
//         uid: doc.id,
//         balance: doc.data().balance || 0,
//         email: doc.data().email || '',
//       }));

//       const depositSnap = await getDocs(
//         query(collection(db, 'depositRequests'), where('status', '==', 'approved'))
//       );

//       const withdrawSnap = await getDocs(
//         query(collection(db, 'withdrawRequests'), where('status', '==', 'approved'))
//       );

//       const depositMap = {};
//       depositSnap.forEach((doc) => {
//         const data = doc.data();
//         if (!depositMap[data.uid]) depositMap[data.uid] = 0;
//         depositMap[data.uid] += data.amount || 0;
//       });

//       const withdrawMap = {};
//       withdrawSnap.forEach((doc) => {
//         const data = doc.data();
//         if (!withdrawMap[data.uid]) withdrawMap[data.uid] = 0;
//         withdrawMap[data.uid] += data.amount || 0;
//       });

//       const finalUsers = wallets.map((user) => ({
//         ...user,
//         totalDeposited: depositMap[user.uid] || 0,
//         totalWithdrawn: withdrawMap[user.uid] || 0,
//       }));

//       setUsers(finalUsers);
//     } catch (error) {
//       console.error('Error fetching user wallet data:', error);
//       alert('Error loading wallet data.');
//     }

//     setLoading(false);
//   };

//   const exportToCSV = () => {
//     const headers = ['Email', 'Balance', 'Deposited', 'Withdrawn'];
//     const rows = users.map(u => [u.email, u.balance, u.totalDeposited, u.totalWithdrawn]);
//     const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.setAttribute('href', url);
//     link.setAttribute('download', 'user_wallets.csv');
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const filteredUsers = users.filter(u =>
//     u.email.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8">
//         <div className="max-w-5xl mx-auto">
//           <h1 className="text-3xl font-bold mb-6">Admin: User Wallet Overview</h1>

//           <div className="flex items-center gap-4 mb-6">
//             <input
//               type="text"
//               placeholder="Search by email..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
//             />
//             <button
//               onClick={exportToCSV}
//               className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-semibold"
//             >
//               Export CSV
//             </button>
//           </div>

//           {loading ? (
//             <p className="text-yellow-300">Loading...</p>
//           ) : filteredUsers.length === 0 ? (
//             <p className="text-gray-400">No users found.</p>
//           ) : (
//             <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl">
//               <table className="w-full text-left table-auto">
//                 <thead className="bg-gray-700 text-sm uppercase text-gray-300">
//                   <tr>
//                     <th className="p-3">Email</th>
//                     <th className="p-3">Balance</th>
//                     <th className="p-3">Deposited</th>
//                     <th className="p-3">Withdrawn</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredUsers.map((user) => (
//                     <tr key={user.uid} className="border-t border-gray-700">
//                       <td className="p-3">{user.email || 'N/A'}</td>
//                       <td className="p-3">₹{user.balance}</td>
//                       <td className="p-3">₹{user.totalDeposited}</td>
//                       <td className="p-3">₹{user.totalWithdrawn}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }


// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   query,
//   where,
//   Timestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function AdminUserWalletsPage() {
//   const db = getFirestore(firebaseApp);

//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     fetchUserWalletData();
//   }, []);

//   const fetchUserWalletData = async () => {
//     setLoading(true);

//     try {
//       const walletsSnap = await getDocs(collection(db, 'wallets'));
//       const wallets = walletsSnap.docs.map((doc) => ({
//         uid: doc.id,
//         balance: doc.data().balance || 0,
//         email: doc.data().email || '',
//       }));

//       const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

//       const depositSnap = await getDocs(
//         query(
//           collection(db, 'depositRequests'),
//           where('status', '==', 'approved'),
//           where('createdAt', '>=', oneWeekAgo)
//         )
//       );

//       const withdrawSnap = await getDocs(
//         query(
//           collection(db, 'withdrawRequests'),
//           where('status', '==', 'approved'),
//           where('createdAt', '>=', oneWeekAgo)
//         )
//       );

//       const depositMap = {};
//       depositSnap.forEach((doc) => {
//         const data = doc.data();
//         if (!depositMap[data.uid]) depositMap[data.uid] = 0;
//         depositMap[data.uid] += data.amount || 0;
//       });

//       const withdrawMap = {};
//       withdrawSnap.forEach((doc) => {
//         const data = doc.data();
//         if (!withdrawMap[data.uid]) withdrawMap[data.uid] = 0;
//         withdrawMap[data.uid] += data.amount || 0;
//       });

//       const finalUsers = wallets.map((user) => ({
//         ...user,
//         totalDeposited: depositMap[user.uid] || 0,
//         totalWithdrawn: withdrawMap[user.uid] || 0,
//       }));

//       setUsers(finalUsers);
//     } catch (error) {
//       console.error('Error fetching user wallet data:', error);
//       alert('Error loading wallet data.');
//     }

//     setLoading(false);
//   };

//   const exportToCSV = () => {
//     const headers = ['Email', 'Balance', 'Deposited (7 days)', 'Withdrawn (7 days)'];
//     const rows = users.map(u => [u.email, u.balance, u.totalDeposited, u.totalWithdrawn]);
//     const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.setAttribute('href', url);
//     link.setAttribute('download', 'user_wallets.csv');
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const filteredUsers = users.filter(u =>
//     u.email.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8">
//         <div className="max-w-5xl mx-auto">
//           <h1 className="text-3xl font-bold mb-6">Admin: User Wallet Overview</h1>

//           <div className="flex items-center gap-4 mb-6">
//             <input
//               type="text"
//               placeholder="Search by email..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
//             />
//             <button
//               onClick={exportToCSV}
//               className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-semibold"
//             >
//               Export CSV
//             </button>
//           </div>

//           {loading ? (
//             <p className="text-yellow-300">Loading...</p>
//           ) : filteredUsers.length === 0 ? (
//             <p className="text-gray-400">No users found.</p>
//           ) : (
//             <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl">
//               <table className="w-full text-left table-auto">
//                 <thead className="bg-gray-700 text-sm uppercase text-gray-300">
//                   <tr>
//                     <th className="p-3">Email</th>
//                     <th className="p-3">Balance</th>
//                     <th className="p-3">Deposited (7d)</th>
//                     <th className="p-3">Withdrawn (7d)</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredUsers.map((user) => (
//                     <tr key={user.uid} className="border-t border-gray-700">
//                       <td className="p-3">{user.email || 'N/A'}</td>
//                       <td className="p-3">₹{user.balance}</td>
//                       <td className="p-3">₹{user.totalDeposited}</td>
//                       <td className="p-3">₹{user.totalWithdrawn}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }


// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   query,
//   where,
//   Timestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function AdminUserWalletsPage() {
//   const db = getFirestore(firebaseApp);

//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [history, setHistory] = useState({ deposits: [], withdrawals: [] });
//   const [historyLoading, setHistoryLoading] = useState(false);

//   useEffect(() => {
//     fetchUserWalletData();
//   }, []);

//   const fetchUserWalletData = async () => {
//     setLoading(true);

//     try {
//       const walletsSnap = await getDocs(collection(db, 'wallets'));
//       const wallets = walletsSnap.docs.map((doc) => ({
//         uid: doc.id,
//         balance: doc.data().balance || 0,
//         email: doc.data().email || '',
//       }));

//       const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

//       const depositSnap = await getDocs(
//         query(
//           collection(db, 'depositRequests'),
//           where('status', '==', 'approved'),
//           where('createdAt', '>=', oneWeekAgo)
//         )
//       );

//       const withdrawSnap = await getDocs(
//         query(
//           collection(db, 'withdrawRequests'),
//           where('status', '==', 'approved'),
//           where('createdAt', '>=', oneWeekAgo)
//         )
//       );

//       const depositMap = {};
//       depositSnap.forEach((doc) => {
//         const data = doc.data();
//         if (!depositMap[data.uid]) depositMap[data.uid] = 0;
//         depositMap[data.uid] += data.amount || 0;
//       });

//       const withdrawMap = {};
//       withdrawSnap.forEach((doc) => {
//         const data = doc.data();
//         if (!withdrawMap[data.uid]) withdrawMap[data.uid] = 0;
//         withdrawMap[data.uid] += data.amount || 0;
//       });

//       const finalUsers = wallets.map((user) => ({
//         ...user,
//         totalDeposited: depositMap[user.uid] || 0,
//         totalWithdrawn: withdrawMap[user.uid] || 0,
//       }));

//       setUsers(finalUsers);
//     } catch (error) {
//       console.error('Error fetching user wallet data:', error);
//       alert('Error loading wallet data.');
//     }

//     setLoading(false);
//   };

//   const fetchUserHistory = async (uid) => {
//     setHistoryLoading(true);
//     try {
//       const depositsSnap = await getDocs(
//         query(collection(db, 'depositRequests'), where('uid', '==', uid))
//       );
//       const withdrawalsSnap = await getDocs(
//         query(collection(db, 'withdrawRequests'), where('uid', '==', uid))
//       );

//       const deposits = depositsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       const withdrawals = withdrawalsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

//       setHistory({ deposits, withdrawals });
//     } catch (error) {
//       console.error('Error loading history:', error);
//     }
//     setHistoryLoading(false);
//   };

//   const exportToCSV = () => {
//     const headers = ['Email', 'Balance', 'Deposited (7 days)', 'Withdrawn (7 days)'];
//     const rows = users.map(u => [u.email, u.balance, u.totalDeposited, u.totalWithdrawn]);
//     const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.setAttribute('href', url);
//     link.setAttribute('download', 'user_wallets.csv');
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const filteredUsers = users.filter(u =>
//     u.email.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8">
//         <div className="max-w-6xl mx-auto">
//           <h1 className="text-3xl font-bold mb-6">Admin: User Wallet Overview</h1>

//           <div className="flex items-center gap-4 mb-6">
//             <input
//               type="text"
//               placeholder="Search by email..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
//             />
//             <button
//               onClick={exportToCSV}
//               className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-semibold"
//             >
//               Export CSV
//             </button>
//           </div>

//           {loading ? (
//             <p className="text-yellow-300">Loading...</p>
//           ) : filteredUsers.length === 0 ? (
//             <p className="text-gray-400">No users found.</p>
//           ) : (
//             <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl">
//               <table className="w-full text-left table-auto">
//                 <thead className="bg-gray-700 text-sm uppercase text-gray-300">
//                   <tr>
//                     <th className="p-3">Email</th>
//                     <th className="p-3">Balance</th>
//                     <th className="p-3">Deposited (7d)</th>
//                     <th className="p-3">Withdrawn (7d)</th>
//                     <th className="p-3">History</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredUsers.map((user) => (
//                     <tr key={user.uid} className="border-t border-gray-700">
//                       <td className="p-3">{user.email || 'N/A'}</td>
//                       <td className="p-3">₹{user.balance}</td>
//                       <td className="p-3">₹{user.totalDeposited}</td>
//                       <td className="p-3">₹{user.totalWithdrawn}</td>
//                       <td className="p-3">
//                         <button
//                           className="text-blue-400 underline"
//                           onClick={() => {
//                             setSelectedUser(user);
//                             fetchUserHistory(user.uid);
//                           }}
//                         >
//                           View
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Transaction history modal */}
//           {selectedUser && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-gray-900 p-6 rounded-lg w-full max-w-3xl relative">
//                 <h2 className="text-2xl font-bold mb-4">
//                   {selectedUser.email} - Transaction History
//                 </h2>
//                 <button
//                   className="absolute top-3 right-3 text-gray-400 hover:text-white"
//                   onClick={() => setSelectedUser(null)}
//                 >
//                   ✕
//                 </button>

//                 {historyLoading ? (
//                   <p className="text-yellow-300">Loading history...</p>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <h3 className="text-lg font-semibold mb-2">Deposits</h3>
//                       {history.deposits.length === 0 ? (
//                         <p className="text-gray-400">No deposit history.</p>
//                       ) : (
//                         <ul className="space-y-2 text-sm">
//                           {history.deposits.map((d) => (
//                             <li key={d.id} className="bg-gray-800 p-2 rounded">
//                               ₹{d.amount} - {d.status} - {d.createdAt?.toDate().toLocaleString()}
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-semibold mb-2">Withdrawals</h3>
//                       {history.withdrawals.length === 0 ? (
//                         <p className="text-gray-400">No withdrawal history.</p>
//                       ) : (
//                         <ul className="space-y-2 text-sm">
//                           {history.withdrawals.map((w) => (
//                             <li key={w.id} className="bg-gray-800 p-2 rounded">
//                               ₹{w.amount} - {w.status} - {w.createdAt?.toDate().toLocaleString()}
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }


// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   query,
//   where,
//   Timestamp,
//   doc,
//   getDoc,
// } from 'firebase/firestore';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function AdminUserWalletsPage() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [currentUser, setCurrentUser] = useState(null);
//   const [role, setRole] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setCurrentUser(user);
//       if (user) {
//         const userRef = doc(db, 'users', user.uid);
//         const userSnap = await getDoc(userRef);
//         const data = userSnap.data();
//         const userRole = data?.role || 'user';
//         setRole(userRole);

//         if (userRole === 'admin' || userRole === 'subadmin') {
//           await fetchUserWalletData(user.uid, userRole);
//         } else {
//           setUsers([]);
//           setLoading(false);
//         }
//       } else {
//         setLoading(false);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const fetchUserWalletData = async (uid, role) => {
//     setLoading(true);

//     try {
//       const walletCol = collection(db, 'subwallets');
//       let walletQuery;

//       if (role === 'admin') {
//         walletQuery = walletCol; // get all
//       } else {
//         walletQuery = query(walletCol, where('subAdminId', '==', uid)); // only their users
//       }

//       const walletsSnap = await getDocs(walletQuery);

//       const wallets = walletsSnap.docs.map((doc) => ({
//         uid: doc.id,
//         balance: doc.data().balance || 0,
//         email: doc.data().email || '',
//       }));

//       const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

//       const depositSnap = await getDocs(
//         query(
//           collection(db, 'depositRequests'),
//           where('status', '==', 'approved'),
//           where('createdAt', '>=', oneWeekAgo)
//         )
//       );

//       const withdrawSnap = await getDocs(
//         query(
//           collection(db, 'withdrawRequests'),
//           where('status', '==', 'approved'),
//           where('createdAt', '>=', oneWeekAgo)
//         )
//       );

//       const depositMap = {};
//       depositSnap.forEach((doc) => {
//         const data = doc.data();
//         if (!depositMap[data.uid]) depositMap[data.uid] = 0;
//         depositMap[data.uid] += data.amount || 0;
//       });

//       const withdrawMap = {};
//       withdrawSnap.forEach((doc) => {
//         const data = doc.data();
//         if (!withdrawMap[data.uid]) withdrawMap[data.uid] = 0;
//         withdrawMap[data.uid] += data.amount || 0;
//       });

//       const finalUsers = wallets.map((user) => ({
//         ...user,
//         totalDeposited: depositMap[user.uid] || 0,
//         totalWithdrawn: withdrawMap[user.uid] || 0,
//       }));

//       setUsers(finalUsers);
//     } catch (error) {
//       console.error('Error fetching user wallet data:', error);
//       alert('Error loading wallet data.');
//     }

//     setLoading(false);
//   };

//   const exportToCSV = () => {
//     const headers = ['Email', 'Balance', 'Deposited (7 days)', 'Withdrawn (7 days)'];
//     const rows = users.map((u) => [u.email, u.balance, u.totalDeposited, u.totalWithdrawn]);
//     const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.setAttribute('href', url);
//     link.setAttribute('download', 'user_wallets.csv');
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const filteredUsers = users.filter((u) =>
//     u.email.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8">
//         <div className="max-w-5xl mx-auto">
//           <h1 className="text-3xl font-bold mb-6">
//             {role === 'admin'
//               ? 'Admin: All Subadmin & User Wallets'
//               : 'Subadmin: Your User Wallets'}
//           </h1>

//           <div className="flex items-center gap-4 mb-6">
//             <input
//               type="text"
//               placeholder="Search by email..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
//             />
//             <button
//               onClick={exportToCSV}
//               className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-semibold"
//             >
//               Export CSV dk
//             </button>
//           </div>

//           {loading ? (
//             <p className="text-yellow-300">Loading...</p>
//           ) : filteredUsers.length === 0 ? (
//             <p className="text-gray-400">No users found.</p>
//           ) : (
//             <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl">
//               <table className="w-full text-left table-auto">
//                 <thead className="bg-gray-700 text-sm uppercase text-gray-300">
//                   <tr>
//                     <th className="p-3">Email</th>
//                     <th className="p-3">Balance</th>
//                     <th className="p-3">Deposited (7d)</th>
//                     <th className="p-3">Withdrawn (7d)</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredUsers.map((user) => (
//                     <tr key={user.uid} className="border-t border-gray-700">
//                       <td className="p-3">{user.email || 'N/A'}</td>
//                       <td className="p-3">₹{user.balance}</td>
//                       <td className="p-3">₹{user.totalDeposited}</td>
//                       <td className="p-3">₹{user.totalWithdrawn}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }


// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   query,
//   where,
//   Timestamp,
//   doc,
//   getDoc,
// } from 'firebase/firestore';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function AdminUserWalletsPage() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [currentUser, setCurrentUser] = useState(null);
//   const [role, setRole] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setCurrentUser(user);
//       if (user) {
//         const userRef = doc(db, 'users', user.uid);
//         const userSnap = await getDoc(userRef);
//         const data = userSnap.data();
//         const userRole = data?.role || 'user';
//         setRole(userRole);

//         if (userRole === 'admin' || userRole === 'subadmin') {
//           await fetchUserWalletData(user.uid, userRole);
//         } else {
//           setUsers([]);
//           setLoading(false);
//         }
//       } else {
//         setLoading(false);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const fetchUserWalletData = async (uid, role) => {
//     setLoading(true);

//     try {
//       const walletCol = collection(db, 'subwallets');
//       let walletQuery;

//       if (role === 'admin') {
//         walletQuery = walletCol; // all wallets
//       } else {
//         walletQuery = query(walletCol, where('subAdminId', '==', uid)); // subadmin-specific
//       }

//       const walletsSnap = await getDocs(walletQuery);

//       const wallets = walletsSnap.docs.map((doc) => ({
//         uid: doc.id,
//         balance: doc.data().balance || 0,
//         email: doc.data().email || '',
//       }));

//       const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

//       // Deposit Requests (filtered for subadmin)
//       // const depositSnap = await getDocs(
//       //   // query(
//       //   //   collection(db, 'subdepositRequests'),
//       //   //   where('status', '==', 'approved'),
//       //   //   where('createdAt', '>=', oneWeekAgo),
//       //   //   ...(role === 'subadmin' ? [where('fromUserSubAdminId', '==', uid)] : [])
//       //   // )
//       //   query(
//       //     collection(db, 'subdepositRequests'),
//       //     where('status', '==', 'approved'),
//       //     where('createdAt', '>=', oneWeekAgo),
//       //     where('fromUserSubAdminId', '==', uid)
//       //   )
//       // );
//       const depositSnap = await getDocs(
//   query(
//     collection(db, 'subdepositRequests'),
//     where('status', '==', 'approved'),
//     ...(role === 'subadmin' ? [where('fromUserSubAdminId', '==', uid)] : [])
//   )
// );


//       // Withdraw Requests (filtered for subadmin)
// //       const withdrawSnap = await getDocs(
// //         // query(
// //         //   collection(db, 'subwithdrawRequests'),
// //         //   where('status', '==', 'approved'),
// //         //   where('createdAt', '>=', oneWeekAgo),
// //         //   ...(role === 'subadmin' ? [where('fromUserSubAdminId', '==', uid)] : [])
// //         // )
// //         query(
// //   collection(db, 'subdepositRequests'),
// //   where('status', '==', 'approved'),
// //   where('createdAt', '>=', oneWeekAgo),
// //   where('fromUserSubAdminId', '==', uid)
// // )

// //       );
// const withdrawSnap = await getDocs(
//   query(
//     collection(db, 'subwithdrawRequests'),
//     where('status', '==', 'approved'),
//     ...(role === 'subadmin' ? [where('fromUserSubAdminId', '==', uid)] : [])
//   )
// );

//       // Aggregate deposits
//       const depositMap = {};
//       depositSnap.forEach((doc) => {
//         const data = doc.data();
//         if (!depositMap[data.uid]) depositMap[data.uid] = 0;
//         depositMap[data.uid] += data.amount || 0;
//       });

//       // Aggregate withdrawals
//       // const withdrawMap = {};
//       // withdrawSnap.forEach((doc) => {
//       //   const data = doc.data();
//       //   if (!withdrawMap[data.uid]) withdrawMap[data.uid] = 0;
//       //   withdrawMap[data.uid] += data.amount || 0;
//       // });
// const withdrawMap = {};
// withdrawSnap.forEach((doc) => {
//   const data = doc.data();
//   if (!withdrawMap[data.uid]) withdrawMap[data.uid] = [];
//   withdrawMap[data.uid].push({
//     amount: data.amount,
//     approvedAt: data.approvedAt?.toDate(),
//   });
// });

//       // Final merged user data
//       const finalUsers = wallets.map((user) => ({
//         ...user,
//         totalDeposited: depositMap[user.uid] || 0,
//         // totalWithdrawn: withdrawMap[user.uid] || 0,
//         withdrawals: withdrawMap[user.uid] || [],

//       }));

//       setUsers(finalUsers);
//     } catch (error) {
//       console.error('Error fetching wallet data:', error);
//       alert('Error loading wallet data.');
//     }

//     setLoading(false);
//   };

//   // const exportToCSV = () => {
//   //   const headers = ['Email', 'Balance', 'Deposited (7 days)', 'Withdrawn (7 days)'];
//   //   const rows = users.map((u) => [u.email, u.balance, u.totalDeposited, u.totalWithdrawn]);
//   //   const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');

//   //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   //   const url = URL.createObjectURL(blob);
//   //   const link = document.createElement('a');
//   //   link.setAttribute('href', url);
//   //   link.setAttribute('download', 'user_wallets.csv');
//   //   document.body.appendChild(link);
//   //   link.click();
//   //   document.body.removeChild(link);
//   // };

// // const fetchUserWalletData = async (uid, role) => {
// //   setLoading(true);

// //   try {
// //     const walletCol = collection(db, 'subwallets');
// //     let walletQuery;

// //     if (role === 'admin') {
// //       walletQuery = walletCol; // All wallets
// //     } else {
// //       walletQuery = query(walletCol, where('subAdminId', '==', uid)); // Only subadmin's users
// //     }

// //     const walletsSnap = await getDocs(walletQuery);

// //     const wallets = walletsSnap.docs.map((doc) => ({
// //       uid: doc.id,
// //       balance: doc.data().balance || 0,
// //       email: doc.data().email || '',
// //     }));

// //     const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

// //     // Approved deposits (last 7 days)
// //     const depositSnap = await getDocs(
// //       query(
// //         collection(db, 'subdepositRequests'),
// //         where('status', '==', 'approved'),
// //         where('createdAt', '>=', oneWeekAgo),
// //         ...(role === 'subadmin' ? [where('fromUserSubAdminId', '==', uid)] : [])
// //       )
// //     );

// //     // Approved withdrawals (all time)
// //     const withdrawSnap = await getDocs(
// //       query(
// //         collection(db, 'subwithdrawRequests'),
// //         where('status', '==', 'approved'),
// //         ...(role === 'subadmin' ? [where('fromUserSubAdminId', '==', uid)] : [])
// //       )
// //     );

// //     // Aggregate deposits
// //     const depositMap = {};
// //     depositSnap.forEach((doc) => {
// //       const data = doc.data();
// //       if (!depositMap[data.uid]) depositMap[data.uid] = 0;
// //       depositMap[data.uid] += data.amount || 0;
// //     });

// //     // Group withdrawals per user (all time, with timestamp)
// //     const withdrawMap = {};
// //     withdrawSnap.forEach((doc) => {
// //       const data = doc.data();
// //       if (!withdrawMap[data.uid]) withdrawMap[data.uid] = [];
// //       withdrawMap[data.uid].push({
// //         amount: data.amount,
// //         approvedAt: data.approvedAt?.toDate(),
// //       });
// //     });

// //     // Final user merge
// //     const finalUsers = wallets.map((user) => ({
// //       ...user,
// //       totalDeposited: depositMap[user.uid] || 0,
// //       withdrawals: withdrawMap[user.uid] || [],
// //     }));

// //     setUsers(finalUsers);
// //   } catch (error) {
// //     console.error('Error fetching wallet data:', error);
// //     alert('Error loading wallet data.');
// //   }

// //   setLoading(false);
// // };

//   const exportToCSV = () => {
//   const headers = ['Email', 'Balance', 'Deposited (7 days)', 'Withdrawals (amount + date)'];

//   const rows = users.map((u) => {
//     const withdrawalDetails = (u.withdrawals || [])
//       .map(
//         (w) =>
//           `₹${w.amount} on ${w.approvedAt?.toLocaleDateString()} at ${w.approvedAt?.toLocaleTimeString([], {
//             hour: '2-digit',
//             minute: '2-digit',
//           })}`
//       )
//       .join(' | '); // Use pipe or semicolon to separate multiple withdrawals in one cell

//     return [u.email, u.balance, u.totalDeposited, withdrawalDetails];
//   });

//   const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');

//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.setAttribute('href', url);
//   link.setAttribute('download', 'user_wallets.csv');
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

//   const filteredUsers = users.filter((u) =>
//     u.email.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     // <Layout>
//     //   <div className="min-h-screen bg-gray-900 text-white p-8">
//     //     <div className="max-w-5xl mx-auto">
//     //       <h1 className="text-3xl font-bold mb-6">
//     //         {role === 'admin'
//     //           ? 'Admin: All Subadmin & User Wallets'
//     //           : 'Subadmin: Your User Wallets'}
//     //       </h1>

//     //       <div className="flex items-center gap-4 mb-6">
//     //         <input
//     //           type="text"
//     //           placeholder="Search by email..."
//     //           value={search}
//     //           onChange={(e) => setSearch(e.target.value)}
//     //           className="px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
//     //         />
//     //         <button
//     //           onClick={exportToCSV}
//     //           className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-semibold"
//     //         >
//     //           Export CSV
//     //         </button>
//     //       </div>

//     //       {loading ? (
//     //         <p className="text-yellow-300">Loading...</p>
//     //       ) : filteredUsers.length === 0 ? (
//     //         <p className="text-gray-400">No users found.</p>
//     //       ) : (
//     //         <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl">
//     //           <table className="w-full text-left table-auto">
//     //             <thead className="bg-gray-700 text-sm uppercase text-gray-300">
//     //               <tr>
//     //                 <th className="p-3">Email</th>
//     //                 <th className="p-3">Balance</th>
//     //                 <th className="p-3">Deposited (7d)</th>
//     //                 {/* <th className="p-3">Withdrawn (7d)</th>
//     //               </tr> */}
//     //               <th className="p-3">Withdrawals</th>

//     //             </thead>
//     //             <tbody>
//     //               {filteredUsers.map((user) => (
//     //                 <tr key={user.uid} className="border-t border-gray-700">
//     //                   <td className="p-3">{user.email || 'N/A'}</td>
//     //                   <td className="p-3">₹{user.balance}</td>
//     //                   <td className="p-3">₹{user.totalDeposited}</td>
//     //                   <td className="p-3">₹{user.Withdrawn}</td>
//     //                 </tr>
//     //               ))}
//     //             </tbody>
//     //           </table>
//     //         </div>
//     //       )}
//     //     </div>
//     //   </div>
//     // </Layout>
//     <Layout>
//   <div className="min-h-screen bg-gray-900 text-white p-8">
//     <div className="max-w-5xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">
//         {role === 'admin'
//           ? 'Admin: All Subadmin & User Wallets'
//           : 'Subadmin: Your User Wallets'}
//       </h1>

//       <div className="flex items-center gap-4 mb-6">
//         <input
//           type="text"
//           placeholder="Search by email..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
//         />
//         <button
//           onClick={exportToCSV}
//           className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-semibold"
//         >
//           Export CSV
//         </button>
//       </div>

//       {loading ? (
//         <p className="text-yellow-300">Loading...</p>
//       ) : filteredUsers.length === 0 ? (
//         <p className="text-gray-400">No users found.</p>
//       ) : (
//         <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl">
//           <table className="w-full text-left table-auto">
//             <thead className="bg-gray-700 text-sm uppercase text-gray-300">
//               <tr>
//                 <th className="p-3">Email</th>
//                 <th className="p-3">Balance</th>
//                 <th className="p-3">Deposited (7d)</th>
//                 <th className="p-3">Withdrawals</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredUsers.map((user) => (
//                 <tr key={user.uid} className="border-t border-gray-700 align-top">
//                   <td className="p-3">{user.email || 'N/A'}</td>
//                   <td className="p-3">₹{user.balance}</td>
//                   <td className="p-3">₹{user.totalDeposited}</td>
//                   <td className="p-3 text-sm">
//                     {user.withdrawals?.length > 0 ? (
//                       <ul className="space-y-1">
//                         {user.withdrawals.map((w, idx) => (
//                           <li key={idx}>
//                             ₹{w.amount} on{' '}
//                             {w.approvedAt?.toLocaleDateString()} at{' '}
//                             {w.approvedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                           </li>
//                         ))}
//                       </ul>
//                     ) : (
//                       <span className="text-gray-400">No withdrawals</span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   </div>
// </Layout>

//   );
// }


'use client';

import React, { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseApp from '@/firebase';
import Layout from '@/app/Components/Layout';

export default function AdminUserWalletsPage() {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const data = userSnap.data();
        const userRole = data?.role || 'user';
        setRole(userRole);

        if (userRole === 'admin' || userRole === 'subadmin') {
          await fetchUserWalletData(user.uid, userRole);
        } else {
          setUsers([]);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserWalletData = async (uid, role) => {
    setLoading(true);

    try {
      const walletCol = collection(db, 'subwallets');
      let walletQuery = role === 'admin'
        ? walletCol
        : query(walletCol, where('subAdminId', '==', uid));

      const walletsSnap = await getDocs(walletQuery);
      const wallets = walletsSnap.docs.map((doc) => ({
        uid: doc.id,
        balance: doc.data().balance || 0,
        email: doc.data().email || '',
      }));

      const depositSnap = await getDocs(
        query(
          collection(db, 'subdepositRequests'),
          where('status', '==', 'approved'),
          ...(role === 'subadmin' ? [where('fromUserSubAdminId', '==', uid)] : [])
        )
      );

      const withdrawSnap = await getDocs(
        query(
          collection(db, 'subwithdrawRequests'),
          where('status', '==', 'approved'),
          ...(role === 'subadmin' ? [where('fromUserSubAdminId', '==', uid)] : [])
        )
      );

      const depositMap = {};
      depositSnap.forEach((doc) => {
        const data = doc.data();
        if (!depositMap[data.uid]) depositMap[data.uid] = [];
        depositMap[data.uid].push({
          amount: data.amount,
          approvedAt: data.approvedAt?.toDate(),
        });
      });

      const withdrawMap = {};
      withdrawSnap.forEach((doc) => {
        const data = doc.data();
        if (!withdrawMap[data.uid]) withdrawMap[data.uid] = [];
        withdrawMap[data.uid].push({
          amount: data.amount,
          approvedAt: data.approvedAt?.toDate(),
        });
      });

      const finalUsers = wallets.map((user) => ({
        ...user,
        deposits: depositMap[user.uid] || [],
        withdrawals: withdrawMap[user.uid] || [],
      }));

      setUsers(finalUsers);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      alert('Error loading wallet data.');
    }

    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Balance', 'Deposits (amount + date)', 'Withdrawals (amount + date)'];

    const rows = users.map((u) => {
      const depositDetails = (u.deposits || [])
        .map(
          (d) =>
            `₹${d.amount} on ${d.approvedAt?.toLocaleDateString()} at ${d.approvedAt?.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}`
        )
        .join(' | ');

      const withdrawalDetails = (u.withdrawals || [])
        .map(
          (w) =>
            `₹${w.amount} on ${w.approvedAt?.toLocaleDateString()} at ${w.approvedAt?.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}`
        )
        .join(' | ');

      return [u.email, u.balance, depositDetails, withdrawalDetails];
    });

    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_wallets.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            {role === 'admin'
              ? 'Admin: All Subadmin & User Wallets'
              : 'Subadmin: Your User Wallets'}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
            />
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-semibold"
            >
              Export CSV
            </button>
          </div>

          {loading ? (
            <p className="text-yellow-300">Loading...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-gray-400">No users found.</p>
          ) : (
            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl">
              <table className="w-full text-left table-auto">
                <thead className="bg-gray-700 text-sm uppercase text-gray-300">
                  <tr>
                    <th className="p-3">Email</th>
                    <th className="p-3">Balance</th>
                    <th className="p-3">Deposits</th>
                    <th className="p-3">Withdrawals</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="border-t border-gray-700 align-top">
                      <td className="p-3">{user.email || 'N/A'}</td>
                      <td className="p-3">₹{user.balance}</td>
                      <td className="p-3 text-sm">
                        {user.deposits?.length > 0 ? (
                          <ul className="space-y-1">
                            {user.deposits.map((d, idx) => (
                              <li key={idx}>
                                ₹{d.amount} on{' '}
                                {d.approvedAt?.toLocaleDateString()} at{' '}
                                {d.approvedAt?.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400">No deposits</span>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        {user.withdrawals?.length > 0 ? (
                          <ul className="space-y-1">
                            {user.withdrawals.map((w, idx) => (
                              <li key={idx}>
                                ₹{w.amount} on{' '}
                                {w.approvedAt?.toLocaleDateString()} at{' '}
                                {w.approvedAt?.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400">No withdrawals</span>
                        )}
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
