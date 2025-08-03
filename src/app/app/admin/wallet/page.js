// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   updateDoc,
//   serverTimestamp,
//   orderBy,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function WalletAdminPage() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [admin, setAdmin] = useState(null);

//   const [targetEmail, setTargetEmail] = useState('');
//   const [targetUid, setTargetUid] = useState('');
//   const [currentBalance, setCurrentBalance] = useState(null);

//   const [amountToAdd, setAmountToAdd] = useState('');
//   const [amountToDeduct, setAmountToDeduct] = useState('');

//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   const [depositRequests, setDepositRequests] = useState([]);
//   const [withdrawRequests, setWithdrawRequests] = useState([]);

//   const [refreshKey, setRefreshKey] = useState(0); // To re-fetch after approve/reject

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setAdmin(user);
//     });
//     return () => unsubscribe();
//   }, [auth]);

//   useEffect(() => {
//     if (!admin) return;

//     const fetchRequests = async () => {
//       // Deposit
//       const depQ = query(
//         collection(db, 'depositRequests'),
//         where('status', '==', 'pending'),
//         orderBy('createdAt', 'desc')
//       );
//       const depSnap = await getDocs(depQ);
//       setDepositRequests(depSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

//       // Withdraw
//       const withQ = query(
//         collection(db, 'withdrawRequests'),
//         where('status', '==', 'pending'),
//         orderBy('createdAt', 'desc')
//       );
//       const withSnap = await getDocs(withQ);
//       setWithdrawRequests(withSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
//     };

//     fetchRequests();
//   }, [admin, db, refreshKey]);

//   const handleSearch = async () => {
//     if (!targetEmail) {
//       alert('Enter a valid email.');
//       return;
//     }
//     setLoading(true);

//     try {
//       const walletQuery = query(
//         collection(db, 'wallets'),
//         where('email', '==', targetEmail)
//       );
//       const walletSnap = await getDocs(walletQuery);

//       if (!walletSnap.empty) {
//         const walletDoc = walletSnap.docs[0];
//         setTargetUid(walletDoc.data().uid);
//         setCurrentBalance(walletDoc.data().balance ?? 0);
//       } else {
//         alert(
//           'Wallet not found. Ask the user to login once so their wallet is auto-created.'
//         );
//         setTargetUid('');
//         setCurrentBalance(null);
//       }
//     } catch (error) {
//       console.error('Error during search:', error);
//       alert('Error searching for wallet.');
//     }

//     setLoading(false);
//   };

//   const handleAddBalance = async () => {
//     if (!targetUid) {
//       alert('Search and select a user first.');
//       return;
//     }
//     const amount = parseFloat(amountToAdd);
//     if (isNaN(amount) || amount <= 0) {
//       alert('Enter a valid positive amount.');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const walletRef = doc(db, 'wallets', targetUid);
//       await updateDoc(walletRef, {
//         balance: (currentBalance ?? 0) + amount,
//         updatedAt: serverTimestamp(),
//       });
//       setCurrentBalance((prev) => (prev ?? 0) + amount);
//       setAmountToAdd('');
//       alert('Wallet balance updated successfully!');
//     } catch (error) {
//       console.error('Error updating wallet:', error);
//       alert('Failed to update wallet.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDeductBalance = async () => {
//     if (!targetUid) {
//       alert('Search and select a user first.');
//       return;
//     }
//     const amount = parseFloat(amountToDeduct);
//     if (isNaN(amount) || amount <= 0) {
//       alert('Enter a valid positive amount.');
//       return;
//     }

//     if (amount > (currentBalance ?? 0)) {
//       alert('Cannot deduct more than the current balance.');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const walletRef = doc(db, 'wallets', targetUid);
//       await updateDoc(walletRef, {
//         balance: (currentBalance ?? 0) - amount,
//         updatedAt: serverTimestamp(),
//       });
//       setCurrentBalance((prev) => (prev ?? 0) - amount);
//       setAmountToDeduct('');
//       alert('Wallet balance deducted successfully!');
//     } catch (error) {
//       console.error('Error deducting wallet:', error);
//       alert('Failed to deduct wallet balance.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleStatusChange = async (collectionName, id, newStatus) => {
//     try {
//       const ref = doc(db, collectionName, id);
//       await updateDoc(ref, {
//         status: newStatus,
//         updatedAt: serverTimestamp(),
//       });
//       alert(`Request marked as ${newStatus}`);
//       setRefreshKey((prev) => prev + 1);
//     } catch (error) {
//       console.error('Error updating status:', error);
//       alert('Failed to update status.');
//     }
//   };

//   if (!admin) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
//         <p>Please login as admin to manage wallets.</p>
//       </div>
//     );
//   }

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start p-8 space-y-8">
//         <div className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full">
//           <h1 className="text-2xl font-bold mb-6 text-center">
//             Admin: Manage Wallet
//           </h1>

//           <div className="mb-4">
//             <label className="block mb-2">User Email</label>
//             <input
//               type="email"
//               value={targetEmail}
//               onChange={(e) => setTargetEmail(e.target.value)}
//               placeholder="Enter user email"
//               className="w-full px-4 py-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//             <button
//               onClick={handleSearch}
//               disabled={loading}
//               className={`mt-2 w-full py-3 rounded-md font-semibold text-black ${
//                 loading
//                   ? 'bg-yellow-100 cursor-not-allowed'
//                   : 'bg-yellow-400 hover:bg-yellow-500'
//               }`}
//             >
//               {loading ? 'Searching...' : 'Find Wallet'}
//             </button>
//           </div>

//           {targetUid && (
//             <div className="mb-4">
//               <p className="text-sm mb-1 text-gray-400 break-all">
//                 UID: <span className="font-medium">{targetUid}</span>
//               </p>
//               <p className="text-lg mb-4">
//                 Current Balance:{' '}
//                 <span className="text-yellow-400 font-semibold">
//                   ₹{currentBalance?.toFixed(2)}
//                 </span>
//               </p>

//               <label className="block mb-2">Add Balance</label>
//               <input
//                 type="number"
//                 min="0"
//                 step="0.01"
//                 value={amountToAdd}
//                 onChange={(e) => setAmountToAdd(e.target.value)}
//                 placeholder="Enter amount to add"
//                 className="w-full px-4 py-3 mb-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//               />
//               <button
//                 onClick={handleAddBalance}
//                 disabled={submitting}
//                 className={`w-full py-3 rounded-md font-semibold text-black ${
//                   submitting
//                     ? 'bg-yellow-100 cursor-not-allowed'
//                     : 'bg-yellow-400 hover:bg-yellow-500'
//                 }`}
//               >
//                 {submitting ? 'Updating...' : 'Add Balance'}
//               </button>

//               <label className="block mb-2 mt-6">Deduct Balance</label>
//               <input
//                 type="number"
//                 min="0"
//                 step="0.01"
//                 value={amountToDeduct}
//                 onChange={(e) => setAmountToDeduct(e.target.value)}
//                 placeholder="Enter amount to deduct"
//                 className="w-full px-4 py-3 mb-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-400"
//               />
//               <button
//                 onClick={handleDeductBalance}
//                 disabled={submitting}
//                 className={`w-full py-3 rounded-md font-semibold text-black ${
//                   submitting
//                     ? 'bg-red-100 cursor-not-allowed'
//                     : 'bg-red-500 hover:bg-red-600'
//                 }`}
//               >
//                 {submitting ? 'Updating...' : 'Deduct Balance'}
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Deposit Requests */}
//         <div className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full">
//           <h2 className="text-xl font-bold mb-4">Deposit Requests</h2>
//           {depositRequests.length === 0 && (
//             <p className="text-gray-400">No deposit requests found.</p>
//           )}
//           {depositRequests.map((req) => (
//             <div
//               key={req.id}
//               className="mb-4 border-b border-gray-600 pb-2 text-sm"
//             >
//               <p>Email: {req.email}</p>
//               <p>Amount: ₹{req.amount}</p>
//               <p>Txn ID: {req.transactionId}</p>
//               <p>Status: <span className="font-bold">{req.status}</span></p>
//               <p>
//                 Date:{' '}
//                 {req.createdAt?.toDate
//                   ? req.createdAt.toDate().toLocaleString()
//                   : 'N/A'}
//               </p>
//               <div className="mt-2 flex gap-2">
//                 <button
//                   onClick={() => handleStatusChange('depositRequests', req.id, 'approved')}
//                   className="bg-green-500 hover:bg-green-600 text-black font-semibold py-1 px-3 rounded"
//                 >
//                   Approve
//                 </button>
//                 <button
//                   onClick={() => handleStatusChange('depositRequests', req.id, 'rejected')}
//                   className="bg-red-500 hover:bg-red-600 text-black font-semibold py-1 px-3 rounded"
//                 >
//                   Reject
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Withdraw Requests */}
//         {/* <div className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full">
//           <h2 className="text-xl font-bold mb-4">Withdraw Requests</h2>
//           {withdrawRequests.length === 0 && (
//             <p className="text-gray-400">No withdraw requests found.</p>
//           )}
//           {withdrawRequests.map((req) => (
//             <div
//               key={req.id}
//               className="mb-4 border-b border-gray-600 pb-2 text-sm"
//             >
//               <p>Email: {req.email}</p>
//               <p>Amount: ₹{req.amount}</p>
//               <p>Status: <span className="font-bold">{req.status}</span></p>
//               <p>
//                 Date:{' '}
//                 {req.createdAt?.toDate
//                   ? req.createdAt.toDate().toLocaleString()
//                   : 'N/A'}
//               </p>
//               <div className="mt-2 flex gap-2">
//                 <button
//                   onClick={() => handleStatusChange('withdrawRequests', req.id, 'approved')}
//                   className="bg-green-500 hover:bg-green-600 text-black font-semibold py-1 px-3 rounded"
//                 >
//                   Approve
//                 </button>
//                 <button
//                   onClick={() => handleStatusChange('withdrawRequests', req.id, 'rejected')}
//                   className="bg-red-500 hover:bg-red-600 text-black font-semibold py-1 px-3 rounded"
//                 >
//                   Reject
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div> */}
//         <div className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full">
//   <h2 className="text-xl font-bold mb-4">Withdraw Requests</h2>
//   {withdrawRequests.length === 0 && (
//     <p className="text-gray-400">No withdraw requests found.</p>
//   )}
//   {withdrawRequests.map((req) => (
//     <div
//       key={req.id}
//       className="mb-4 border-b border-gray-600 pb-3 text-sm"
//     >
//       <p><span className="font-semibold">Email:</span> {req.email}</p>
//       <p><span className="font-semibold">Amount:</span> ₹{req.amount}</p>
//       <p><span className="font-semibold">Status:</span> <span className="font-bold">{req.status}</span></p>
//       <p>
//         <span className="font-semibold">Date:</span>{' '}
//         {req.createdAt?.toDate
//           ? req.createdAt.toDate().toLocaleString()
//           : 'N/A'}
//       </p>
//       <p><span className="font-semibold">Method:</span> {req.method || 'N/A'}</p>
//       <p><span className="font-semibold">Address:</span> {req.address || 'N/A'}</p>

//       <div className="mt-2 flex gap-2">
//         <button
//           onClick={() => handleStatusChange('withdrawRequests', req.id, 'approved')}
//           className="bg-green-500 hover:bg-green-600 text-black font-semibold py-1 px-3 rounded"
//         >
//           Approve
//         </button>
//         <button
//           onClick={() => handleStatusChange('withdrawRequests', req.id, 'rejected')}
//           className="bg-red-500 hover:bg-red-600 text-black font-semibold py-1 px-3 rounded"
//         >
//           Reject
//         </button>
//       </div>
//     </div>
//   ))}
// </div>
//       </div>
//     </Layout>
//   );
// }


// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   updateDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function WalletAdminPage() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [subadmin, setSubadmin] = useState(null);

//   const [targetEmail, setTargetEmail] = useState('');
//   const [targetUid, setTargetUid] = useState('');
//   const [currentBalance, setCurrentBalance] = useState(null);
//   const [amountToAdd, setAmountToAdd] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setSubadmin(user);
//     });
//     return () => unsubscribe();
//   }, [auth]);

//   const handleSearch = async () => {
//     setLoading(true);
//     setMessage('');
//     setTargetUid('');
//     setCurrentBalance(null);

//     try {
//       const walletQuery = query(
//         collection(db, 'wallets'),
//         where('email', '==', targetEmail)
//       );
//       const snapshot = await getDocs(walletQuery);

//       if (snapshot.empty) {
//         setMessage('❌ Wallet not found. Ask user to log in once.');
//         return;
//       }

//       const wallet = snapshot.docs[0].data();

//       // ✅ Allow only if wallet.subAdminId matches current subadmin.uid
//       if (wallet.subAdminId !== subadmin?.uid) {
//         setMessage('❌ Access denied. This user was not created by you.');
//         return;
//       }

//       setTargetUid(wallet.uid);
//       setCurrentBalance(wallet.balance ?? 0);
//       setMessage('✅ Wallet found and verified.');
//     } catch (error) {
//       console.error('Search error:', error);
//       setMessage('❌ Failed to search wallet.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddBalance = async () => {
//     if (!targetUid || !amountToAdd) return;

//     const amount = parseFloat(amountToAdd);
//     if (isNaN(amount) || amount <= 0) {
//       setMessage('❌ Enter valid amount.');
//       return;
//     }

//     try {
//       const walletRef = doc(db, 'wallets', targetUid);
//       await updateDoc(walletRef, {
//         balance: (currentBalance ?? 0) + amount,
//         updatedAt: serverTimestamp(),
//       });
//       setCurrentBalance((prev) => (prev ?? 0) + amount);
//       setAmountToAdd('');
//       setMessage('✅ Balance added.');
//     } catch (err) {
//       console.error('Add error:', err);
//       setMessage('❌ Failed to add balance.');
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8 flex justify-center">
//         <div className="w-full max-w-xl bg-gray-800 p-6 rounded shadow-lg">
//           <h1 className="text-2xl font-bold mb-6 text-center">Subadmin: Add Balance</h1>

//           <input
//             type="email"
//             placeholder="User email"
//             className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//             value={targetEmail}
//             onChange={(e) => setTargetEmail(e.target.value)}
//           />

//           <button
//             onClick={handleSearch}
//             disabled={loading}
//             className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded mb-4"
//           >
//             {loading ? 'Searching...' : 'Find Wallet'}
//           </button>

//           {message && (
//             <p className="text-center text-sm mb-4 text-yellow-400">{message}</p>
//           )}

//           {targetUid && (
//             <>
//               <p className="mb-2">Current Balance: ₹{currentBalance?.toFixed(2)}</p>

//               <input
//                 type="number"
//                 placeholder="Amount to add"
//                 className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//                 value={amountToAdd}
//                 onChange={(e) => setAmountToAdd(e.target.value)}
//               />

//               <button
//                 onClick={handleAddBalance}
//                 className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded"
//               >
//                 Add Balance
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }


// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   updateDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function WalletAdminPage() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [admin, setAdmin] = useState(null);

//   const [targetEmail, setTargetEmail] = useState('');
//   const [targetUid, setTargetUid] = useState('');
//   const [currentBalance, setCurrentBalance] = useState(null);
//   const [amountToAdd, setAmountToAdd] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setAdmin(user);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleSearch = async () => {
//     setLoading(true);
//     setMessage('');
//     setTargetUid('');
//     setCurrentBalance(null);

//     try {
//       const q = query(
//         collection(db, 'wallets'),
//         where('email', '==', targetEmail)
//       );
//       const snap = await getDocs(q);

//       if (snap.empty) {
//         setMessage('❌ Wallet not found. Ask user to login once.');
//         return;
//       }

//       const wallet = snap.docs[0].data();
//       setTargetUid(wallet.uid);
//       setCurrentBalance(wallet.balance ?? 0);
//       setMessage('✅ Sub-admin wallet found.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Error fetching wallet.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddBalance = async () => {
//     if (!targetUid || !amountToAdd) return;

//     const amount = parseFloat(amountToAdd);
//     if (isNaN(amount) || amount <= 0) {
//       setMessage('❌ Enter a valid amount.');
//       return;
//     }

//     try {
//       const walletRef = doc(db, 'wallets', targetUid);
//       await updateDoc(walletRef, {
//         balance: (currentBalance ?? 0) + amount,
//         updatedAt: serverTimestamp(),
//       });

//       setCurrentBalance((prev) => (prev ?? 0) + amount);
//       setAmountToAdd('');
//       setMessage('✅ Balance successfully added to subadmin.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Failed to update wallet.');
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8 flex justify-center">
//         <div className="w-full max-w-xl bg-gray-800 p-6 rounded shadow-lg">
//           <h1 className="text-2xl font-bold mb-6 text-center">Admin: Fund Sub-admin</h1>

//           <input
//             type="email"
//             placeholder="Sub-admin email"
//             className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//             value={targetEmail}
//             onChange={(e) => setTargetEmail(e.target.value)}
//           />

//           <button
//             onClick={handleSearch}
//             disabled={loading}
//             className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded mb-4"
//           >
//             {loading ? 'Searching...' : 'Find Wallet'}
//           </button>

//           {message && (
//             <p className="text-center text-sm mb-4 text-yellow-400">{message}</p>
//           )}

//           {targetUid && (
//             <>
//               <p className="mb-2">Current Balance: ₹{currentBalance?.toFixed(2)}</p>

//               <input
//                 type="number"
//                 placeholder="Amount to add"
//                 className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//                 value={amountToAdd}
//                 onChange={(e) => setAmountToAdd(e.target.value)}
//               />

//               <button
//                 onClick={handleAddBalance}
//                 className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded"
//               >
//                 Add Balance
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }



// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   updateDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function WalletAdminPage() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [admin, setAdmin] = useState(null);

//   const [targetEmail, setTargetEmail] = useState('');
//   const [targetUid, setTargetUid] = useState('');
//   const [currentBalance, setCurrentBalance] = useState(null);
//   const [amountToAdd, setAmountToAdd] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setAdmin(user);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleSearch = async () => {
//     setLoading(true);
//     setMessage('');
//     setTargetUid('');
//     setCurrentBalance(null);

//     try {
//       const q = query(
//         collection(db, 'subwallets'), // ✅ Use 'subwallets' here
//         where('email', '==', targetEmail)
//       );
//       const snap = await getDocs(q);

//       if (snap.empty) {
//         setMessage('❌ Subadmin wallet not found. Ask them to login once.');
//         return;
//       }

//       const wallet = snap.docs[0].data();
//       setTargetUid(wallet.uid);
//       setCurrentBalance(wallet.balance ?? 0);
//       setMessage('✅ Subadmin wallet found.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Error fetching subadmin wallet.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddBalance = async () => {
//     if (!targetUid || !amountToAdd) return;

//     const amount = parseFloat(amountToAdd);
//     if (isNaN(amount) || amount <= 0) {
//       setMessage('❌ Enter a valid amount.');
//       return;
//     }

//     try {
//       const walletRef = doc(db, 'subwallets', targetUid); // ✅ Use 'subwallets'
//       await updateDoc(walletRef, {
//         balance: (currentBalance ?? 0) + amount,
//         updatedAt: serverTimestamp(),
//       });

//       setCurrentBalance((prev) => (prev ?? 0) + amount);
//       setAmountToAdd('');
//       setMessage('✅ Balance successfully added to subadmin.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Failed to update subadmin wallet.');
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8 flex justify-center">
//         <div className="w-full max-w-xl bg-gray-800 p-6 rounded shadow-lg">
//           <h1 className="text-2xl font-bold mb-6 text-center">Admin: Fund Sub-admin Wallet</h1>

//           <input
//             type="email"
//             placeholder="Subadmin Email"
//             className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//             value={targetEmail}
//             onChange={(e) => setTargetEmail(e.target.value)}
//           />

//           <button
//             onClick={handleSearch}
//             disabled={loading}
//             className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded mb-4"
//           >
//             {loading ? 'Searching...' : 'Find Subadmin Wallet'}
//           </button>

//           {message && (
//             <p className="text-center text-sm mb-4 text-yellow-400">{message}</p>
//           )}

//           {targetUid && (
//             <>
//               <p className="mb-2">Current Balance: ₹{currentBalance?.toFixed(2)}</p>

//               <input
//                 type="number"
//                 placeholder="Amount to add"
//                 className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//                 value={amountToAdd}
//                 onChange={(e) => setAmountToAdd(e.target.value)}
//               />

//               <button
//                 onClick={handleAddBalance}
//                 className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded"
//               >
//                 Add Balance
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }


// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   getDoc,
//   updateDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function WalletAdminPage() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [admin, setAdmin] = useState(null);
//   const [adminBalance, setAdminBalance] = useState(0);

//   const [targetEmail, setTargetEmail] = useState('');
//   const [targetUid, setTargetUid] = useState('');
//   const [subadminBalance, setSubadminBalance] = useState(null);
//   const [amountToAdd, setAmountToAdd] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   // ✅ Get current admin
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setAdmin(user);
//       if (user) {
//         const adminWalletRef = doc(db, 'adminwallets', user.uid);
//         const adminWalletSnap = await getDoc(adminWalletRef);
//         if (adminWalletSnap.exists()) {
//           const data = adminWalletSnap.data();
//           setAdminBalance(data.balance ?? 0);
//         }
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleSearch = async () => {
//     setLoading(true);
//     setMessage('');
//     setTargetUid('');
//     setSubadminBalance(null);

//     try {
//       const q = query(
//         collection(db, 'subwallets'),
//         where('email', '==', targetEmail)
//       );
//       const snap = await getDocs(q);

//       if (snap.empty) {
//         setMessage('❌ Subadmin wallet not found.');
//         return;
//       }

//       const wallet = snap.docs[0].data();
//       setTargetUid(wallet.uid);
//       setSubadminBalance(wallet.balance ?? 0);
//       setMessage('✅ Subadmin wallet found.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Error fetching subadmin wallet.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddBalance = async () => {
//     if (!targetUid || !amountToAdd) return;

//     const amount = parseFloat(amountToAdd);
//     if (isNaN(amount) || amount <= 0) {
//       setMessage('❌ Enter a valid amount.');
//       return;
//     }

//     if (amount > adminBalance) {
//       setMessage('❌ Insufficient admin balance.');
//       return;
//     }

//     try {
//       const subRef = doc(db, 'subwallets', targetUid);
//       const adminRef = doc(db, 'adminwallets', admin.uid);

//       // ✅ Update both wallets
//       await updateDoc(subRef, {
//         balance: (subadminBalance ?? 0) + amount,
//         updatedAt: serverTimestamp(),
//       });

//       await updateDoc(adminRef, {
//         balance: adminBalance - amount,
//         updatedAt: serverTimestamp(),
//       });

//       setSubadminBalance((prev) => (prev ?? 0) + amount);
//       setAdminBalance((prev) => prev - amount);
//       setAmountToAdd('');
//       setMessage('✅ Transfer successful.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Failed to update balances.');
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8 flex justify-center">
//         <div className="w-full max-w-xl bg-gray-800 p-6 rounded shadow-lg">
//           <h1 className="text-2xl font-bold mb-6 text-center">Admin: Fund Sub-admin Wallet</h1>

//           <p className="mb-4 text-green-400">Your Balance: ₹{adminBalance.toFixed(2)}</p>

//           <input
//             type="email"
//             placeholder="Subadmin Email"
//             className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//             value={targetEmail}
//             onChange={(e) => setTargetEmail(e.target.value)}
//           />

//           <button
//             onClick={handleSearch}
//             disabled={loading}
//             className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded mb-4"
//           >
//             {loading ? 'Searching...' : 'Find Subadmin Wallet'}
//           </button>

//           {message && (
//             <p className="text-center text-sm mb-4 text-yellow-400">{message}</p>
//           )}

//           {targetUid && (
//             <>
//               <p className="mb-2">Subadmin Balance: ₹{subadminBalance?.toFixed(2)}</p>

//               <input
//                 type="number"
//                 placeholder="Amount to transfer"
//                 className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//                 value={amountToAdd}
//                 onChange={(e) => setAmountToAdd(e.target.value)}
//               />

//               <button
//                 onClick={handleAddBalance}
//                 className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded"
//               >
//                 Transfer Funds
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }


// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   getDoc,
//   updateDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function WalletAdminPage() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [currentUser, setCurrentUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [currentBalance, setCurrentBalance] = useState(0);

//   const [targetEmail, setTargetEmail] = useState('');
//   const [targetUid, setTargetUid] = useState('');
//   const [targetBalance, setTargetBalance] = useState(null);
//   const [amountToAdd, setAmountToAdd] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   // ✅ Get current user, role, and wallet balance
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setCurrentUser(user);
//       if (user) {
//         const userRef = doc(db, 'users', user.uid);
//         const snap = await getDoc(userRef);
//         const userData = snap.exists() ? snap.data() : {};
//         const userRole = userData.role || 'user';
//         setRole(userRole);

//         const walletCol = userRole === 'admin' ? 'adminwallets' : 'subwallets';
//         const walletRef = doc(db, walletCol, user.uid);
//         const walletSnap = await getDoc(walletRef);
//         const balance = walletSnap.exists() ? walletSnap.data().balance ?? 0 : 0;
//         setCurrentBalance(balance);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleSearch = async () => {
//     setLoading(true);
//     setMessage('');
//     setTargetUid('');
//     setTargetBalance(null);

//     try {
//       const targetWalletCol = role === 'admin' ? 'subwallets' : 'subwallets'; // subadmins & users
//       const q = query(
//         collection(db, targetWalletCol),
//         where('email', '==', targetEmail)
//       );
//       const snap = await getDocs(q);

//       if (snap.empty) {
//         setMessage('❌ Wallet not found.');
//         return;
//       }

//       const wallet = snap.docs[0].data();
//       const uid = wallet.uid;

//       // ✅ If subadmin: only allow depositing to their own users
//       if (role === 'subadmin' && wallet.subAdminId !== currentUser.uid) {
//         setMessage('❌ You can only fund users created by you.');
//         return;
//       }

//       setTargetUid(uid);
//       setTargetBalance(wallet.balance ?? 0);
//       setMessage('✅ Wallet found.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Error fetching wallet.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddBalance = async () => {
//     if (!targetUid || !amountToAdd) return;

//     const amount = parseFloat(amountToAdd);
//     if (isNaN(amount) || amount <= 0) {
//       setMessage('❌ Enter a valid amount.');
//       return;
//     }

//     if (amount > currentBalance) {
//       setMessage('❌ Insufficient balance.');
//       return;
//     }

//     try {
//       const fromWalletCol = role === 'admin' ? 'adminwallets' : 'subwallets';
//       const toWalletCol = 'subwallets'; // All receivers are in subwallets

//       const fromRef = doc(db, fromWalletCol, currentUser.uid);
//       const toRef = doc(db, toWalletCol, targetUid);

//       // ✅ Transfer funds
//       await updateDoc(toRef, {
//         balance: (targetBalance ?? 0) + amount,
//         updatedAt: serverTimestamp(),
//       });

//       await updateDoc(fromRef, {
//         balance: currentBalance - amount,
//         updatedAt: serverTimestamp(),
//       });

//       setTargetBalance((prev) => (prev ?? 0) + amount);
//       setCurrentBalance((prev) => prev - amount);
//       setAmountToAdd('');
//       setMessage('✅ Transfer successful.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Failed to update balances.');
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8 flex justify-center">
//         <div className="w-full max-w-xl bg-gray-800 p-6 rounded shadow-lg">
//           <h1 className="text-2xl font-bold mb-6 text-center">
//             {role === 'admin' ? 'Admin: Fund Subadmin' : 'Subadmin: Fund User'}
//           </h1>

//           <p className="mb-4 text-green-400">
//             Your Balance: ₹{currentBalance.toFixed(2)}
//           </p>

//           <input
//             type="email"
//             placeholder={
//               role === 'admin' ? 'Subadmin Email' : 'User Email'
//             }
//             className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//             value={targetEmail}
//             onChange={(e) => setTargetEmail(e.target.value)}
//           />

//           <button
//             onClick={handleSearch}
//             disabled={loading}
//             className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded mb-4"
//           >
//             {loading ? 'Searching...' : 'Find Wallet'}
//           </button>

//           {message && (
//             <p className="text-center text-sm mb-4 text-yellow-400">
//               {message}
//             </p>
//           )}

//           {targetUid && (
//             <>
//               <p className="mb-2">
//                 Recipient Balance: ₹{targetBalance?.toFixed(2)}
//               </p>

//               <input
//                 type="number"
//                 placeholder="Amount to transfer"
//                 className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//                 value={amountToAdd}
//                 onChange={(e) => setAmountToAdd(e.target.value)}
//               />

//               <button
//                 onClick={handleAddBalance}
//                 className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded"
//               >
//                 Transfer Funds
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }


// 'use client';

// import React, { useEffect, useState } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   getDoc,
//   updateDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function WalletAdminPage() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [currentUser, setCurrentUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setCurrentUser(user);

//         const userSnap = await getDoc(doc(db, 'users', user.uid));
//         const userData = userSnap.exists() ? userSnap.data() : {};
//         const userRole = userData.role || 'user';
//         setRole(userRole);

//         fetchWithdrawRequests(user.uid, userRole);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const fetchWithdrawRequests = async (uid, userRole) => {
//     try {
//       const colRef = collection(db, 'subwithdrawRequests');

//       let q = null;
//       if (userRole === 'admin') {
//         // Admin sees requests from subadmins
//         const subadminSnap = await getDocs(
//           query(collection(db, 'users'), where('role', '==', 'subadmin'))
//         );
//         const subadminIds = subadminSnap.docs.map((doc) => doc.id);

//         q = query(colRef, where('uid', 'in', subadminIds));
//       } else if (userRole === 'subadmin') {
//         // Subadmin sees requests from users they created
//         const userSnap = await getDocs(
//           query(collection(db, 'subwallets'), where('subAdminId', '==', uid))
//         );
//         const userIds = userSnap.docs.map((doc) => doc.id);

//         if (userIds.length === 0) {
//           setRequests([]);
//           setLoading(false);
//           return;
//         }

//         q = query(colRef, where('uid', 'in', userIds));
//       }

//       const reqSnap = await getDocs(q);
//       const formatted = reqSnap.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setRequests(formatted);
//     } catch (error) {
//       console.error('Error fetching withdrawal requests:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApprove = async (request) => {
//     const confirm = window.confirm(`Approve withdrawal of ₹${request.amount}?`);
//     if (!confirm) return;

//     try {
//       const requestRef = doc(db, 'subwithdrawRequests', request.id);

//       // Deduct from user's wallet
//       const userWalletRef = doc(db, 'subwallets', request.uid);
//       const userSnap = await getDoc(userWalletRef);
//       const userBal = userSnap.data().balance ?? 0;

//       if (userBal < request.amount) {
//         alert('Insufficient user balance.');
//         return;
//       }

//       // Credit to subadmin wallet (if subadmin)
//       if (role === 'subadmin') {
//         const subWalletRef = doc(db, 'subwallets', currentUser.uid);
//         const subSnap = await getDoc(subWalletRef);
//         const subBal = subSnap.data().balance ?? 0;

//         await updateDoc(subWalletRef, {
//           balance: subBal + request.amount,
//           updatedAt: serverTimestamp(),
//         });
//       }

//       // Update user wallet and mark request as approved
//       await updateDoc(userWalletRef, {
//         balance: userBal - request.amount,
//         updatedAt: serverTimestamp(),
//       });

//       await updateDoc(requestRef, {
//         status: 'approved',
//         updatedAt: serverTimestamp(),
//       });

//       alert('Withdrawal approved!');
//       setRequests((prev) =>
//         prev.map((r) =>
//           r.id === request.id ? { ...r, status: 'approved' } : r
//         )
//       );
//     } catch (err) {
//       console.error(err);
//       alert('Error approving request.');
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-6">
//         <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-6 shadow">
//           <h2 className="text-2xl font-bold mb-4">
//             {role === 'admin' ? 'Subadmin Withdraw Requests' : 'User Withdraw Requests'}
//           </h2>

//           {loading ? (
//             <p>Loading requests...</p>
//           ) : requests.length === 0 ? (
//             <p>No withdrawal requests found.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse">
//                 <thead className="bg-gray-700">
//                   <tr>
//                     <th className="p-2">Email</th>
//                     <th className="p-2">Amount</th>
//                     <th className="p-2">Method</th>
//                     <th className="p-2">Details</th>
//                     <th className="p-2">Status</th>
//                     <th className="p-2">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {requests.map((req) => (
//                     <tr key={req.id} className="border-t border-gray-600">
//                       <td className="p-2">{req.email}</td>
//                       <td className="p-2">₹{req.amount}</td>
//                       <td className="p-2">{req.method}</td>
//                       <td className="p-2">{req.methodDetails}</td>
//                       <td className="p-2 capitalize">{req.status}</td>
//                       <td className="p-2">
//                         {req.status === 'pending' ? (
//                           <button
//                             onClick={() => handleApprove(req)}
//                             className="px-3 py-1 bg-green-500 hover:bg-green-600 text-black font-semibold rounded"
//                           >
//                             Approve
//                           </button>
//                         ) : (
//                           <span className="text-green-400">✔️</span>
//                         )}
//                       </td>
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
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   getDoc,
//   doc,
//   updateDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function WalletAdminPage() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [currentUser, setCurrentUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [depositRequests, setDepositRequests] = useState([]);
//   const [currentBalance, setCurrentBalance] = useState(0);

//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setCurrentUser(user);
//         const userSnap = await getDoc(doc(db, 'users', user.uid));
//         const userData = userSnap.exists() ? userSnap.data() : {};
//         const userRole = userData.role || 'user';
//         setRole(userRole);

//         const walletCol = userRole === 'admin' ? 'adminwallets' : 'subwallets';
//         const walletRef = doc(db, walletCol, user.uid);
//         const walletSnap = await getDoc(walletRef);
//         setCurrentBalance(walletSnap.exists() ? walletSnap.data().balance ?? 0 : 0);

//         fetchDepositRequests(user.uid, userRole);
//       }
//     });

//     return () => unsub();
//   }, []);

//   const fetchDepositRequests = async (uid, userRole) => {
//     try {
//       const colRef = collection(db, 'subdepositRequests');

//       let q;
//       if (userRole === 'admin') {
//         q = query(colRef, where('role', '==', 'subadmin'));
//       } else if (userRole === 'subadmin') {
//         const userWallets = await getDocs(
//           query(collection(db, 'subwallets'), where('subAdminId', '==', uid))
//         );
//         const userIds = userWallets.docs.map((doc) => doc.id);
//         if (userIds.length === 0) return;

//         q = query(colRef, where('uid', 'in', userIds));
//       }

//       const snap = await getDocs(q);
//       const formatted = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setDepositRequests(formatted);
//     } catch (err) {
//       console.error('Fetch failed', err);
//     }
//   };

//   const handleApprove = async (req) => {
//     const confirm = window.confirm(`Approve ₹${req.amount} deposit from ${req.email}?`);
//     if (!confirm) return;

//     try {
//       const fromRole = req.role;
//       const toUid = currentUser.uid;

//       const fromRef = doc(db, 'subwallets', req.uid);
//       const toCol = role === 'admin' ? 'adminwallets' : 'subwallets';
//       const toRef = doc(db, toCol, toUid);

//       const toSnap = await getDoc(toRef);
//       const toBalance = toSnap.exists() ? toSnap.data().balance ?? 0 : 0;

//       // ✅ Update recipient wallet (admin or subadmin)
//       await updateDoc(toRef, {
//         balance: toBalance + req.amount,
//         updatedAt: serverTimestamp(),
//       });

//       // ✅ Mark request as approved
//       await updateDoc(doc(db, 'subdepositRequests', req.id), {
//         status: 'approved',
//         updatedAt: serverTimestamp(),
//       });

//       alert('Deposit approved!');
//       setDepositRequests((prev) =>
//         prev.map((r) => (r.id === req.id ? { ...r, status: 'approved' } : r))
//       );
//     } catch (err) {
//       console.error('Approval failed', err);
//       alert('Something went wrong.');
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-6">
//         <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded shadow-lg">
//           <h2 className="text-2xl font-bold mb-4">
//             {role === 'admin' ? 'Subadmin Deposit Requests' : 'User Deposit Requests'}
//           </h2>

//           <p className="text-green-400 mb-4">Your Balance: ₹{currentBalance.toFixed(2)}</p>

//           {depositRequests.length === 0 ? (
//             <p>No deposit requests found.</p>
//           ) : (
//             <table className="w-full border-collapse text-sm">
//               <thead className="bg-gray-700">
//                 <tr>
//                   <th className="p-2">Email</th>
//                   <th className="p-2">Amount</th>
//                   <th className="p-2">Method</th>
//                   <th className="p-2">Details</th>
//                   <th className="p-2">Status</th>
//                   <th className="p-2">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {depositRequests.map((req) => (
//                   <tr key={req.id} className="border-t border-gray-600">
//                     <td className="p-2">{req.email}</td>
//                     <td className="p-2">₹{req.amount}</td>
//                     <td className="p-2">{req.method}</td>
//                     <td className="p-2">{req.methodDetails}</td>
//                     <td className="p-2 capitalize">{req.status}</td>
//                     <td className="p-2">
//                       {req.status === 'pending' ? (
//                         <button
//                           onClick={() => handleApprove(req)}
//                           className="px-3 py-1 bg-green-500 hover:bg-green-600 text-black font-semibold rounded"
//                         >
//                           Approve
//                         </button>
//                       ) : (
//                         <span className="text-green-400">✔️</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }



// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   getDoc,
//   updateDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function Page() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [currentUser, setCurrentUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [currentBalance, setCurrentBalance] = useState(0);

//   const [targetEmail, setTargetEmail] = useState('');
//   const [targetUid, setTargetUid] = useState('');
//   const [targetBalance, setTargetBalance] = useState(null);
//   const [amountToAdd, setAmountToAdd] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const [withdrawRequests, setWithdrawRequests] = useState([]);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setCurrentUser(user);
//       if (user) {
//         const userRef = doc(db, 'users', user.uid);
//         const snap = await getDoc(userRef);
//         const userData = snap.exists() ? snap.data() : {};
//         const userRole = userData.role || 'user';
//         setRole(userRole);

//         const walletCol = userRole === 'admin' ? 'adminwallets' : 'subwallets';
//         const walletRef = doc(db, walletCol, user.uid);
//         const walletSnap = await getDoc(walletRef);
//         const balance = walletSnap.exists() ? walletSnap.data().balance ?? 0 : 0;
//         setCurrentBalance(balance);

//         loadWithdrawRequests(user.uid, userRole);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const loadWithdrawRequests = async (uid, userRole) => {
//     const field = userRole === 'admin' ? 'fromSubAdminId' : 'fromUserSubAdminId';
//     const q = query(collection(db, 'subwithdrawRequests'), where(field, '==', uid));
//     const snap = await getDocs(q);
//     const results = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     setWithdrawRequests(results);
//   };

//   const handleSearch = async () => {
//     setLoading(true);
//     setMessage('');
//     setTargetUid('');
//     setTargetBalance(null);

//     try {
//       const q = query(collection(db, 'subwallets'), where('email', '==', targetEmail));
//       const snap = await getDocs(q);

//       if (snap.empty) {
//         setMessage('❌ Wallet not found.');
//         return;
//       }

//       const wallet = snap.docs[0].data();
//       const uid = wallet.uid;

//       if (role === 'subadmin' && wallet.subAdminId !== currentUser.uid) {
//         setMessage('❌ Not your user.');
//         return;
//       }

//       setTargetUid(uid);
//       setTargetBalance(wallet.balance ?? 0);
//       setMessage('✅ Wallet found.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Error searching.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddBalance = async () => {
//     if (!targetUid || !amountToAdd) return;

//     const amount = parseFloat(amountToAdd);
//     if (isNaN(amount) || amount <= 0) {
//       setMessage('❌ Invalid amount.');
//       return;
//     }

//     if (amount > currentBalance) {
//       setMessage('❌ Insufficient balance.');
//       return;
//     }

//     try {
//       const fromWalletCol = role === 'admin' ? 'adminwallets' : 'subwallets';
//       const toWalletCol = 'subwallets';

//       const fromRef = doc(db, fromWalletCol, currentUser.uid);
//       const toRef = doc(db, toWalletCol, targetUid);

//       await updateDoc(toRef, {
//         balance: (targetBalance ?? 0) + amount,
//         updatedAt: serverTimestamp(),
//       });

//       await updateDoc(fromRef, {
//         balance: currentBalance - amount,
//         updatedAt: serverTimestamp(),
//       });

//       setTargetBalance((prev) => (prev ?? 0) + amount);
//       setCurrentBalance((prev) => prev - amount);
//       setAmountToAdd('');
//       setMessage('✅ Transfer successful.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Failed to transfer.');
//     }
//   };

//   // const handleAcceptWithdraw = async (req) => {
//   //   const amount = req.amount;
//   //   const fromWalletCol = role === 'admin' ? 'adminwallets' : 'subwallets';
//   //   const toWalletCol = 'subwallets';

//   //   const toRef = doc(db, toWalletCol, req.fromUid);
//   //   const fromRef = doc(db, fromWalletCol, currentUser.uid);

//   //   const toSnap = await getDoc(toRef);
//   //   const fromSnap = await getDoc(fromRef);

//   //   if (!toSnap.exists() || !fromSnap.exists()) {
//   //     setMessage('❌ Wallet not found.');
//   //     return;
//   //   }

//   //   const fromBalance = fromSnap.data().balance ?? 0;
//   //   if (fromBalance < amount) {
//   //     setMessage('❌ Not enough balance.');
//   //     return;
//   //   }

//   //   await updateDoc(toRef, {
//   //     balance: (toSnap.data().balance ?? 0) + amount,
//   //   });

//   //   await updateDoc(fromRef, {
//   //     balance: fromBalance - amount,
//   //   });

//   //   await updateDoc(doc(db, 'subwithdrawRequests', req.id), {
//   //     status: 'accepted',
//   //     approvedAt: serverTimestamp(),
//   //   });

//   //   setWithdrawRequests((prev) => prev.filter((r) => r.id !== req.id));
//   //   setMessage('✅ Withdraw accepted.');
//   // };
// const handleAcceptWithdraw = async (withdraw) => {
//   try {
//     if (!withdraw || typeof withdraw !== 'object') {
//       console.error('❌ Invalid withdraw object:', withdraw);
//       return alert('Invalid request.');
//     }

//     const { uid, amount, id, fromSubAdminId } = withdraw;

//     if (!uid || typeof uid !== 'string') {
//       console.error('❌ Missing or invalid UID in withdraw:', withdraw);
//       return alert('Withdraw UID is missing.');
//     }

//     if (!id) {
//       console.error('❌ Missing Firestore document ID of withdraw request');
//       return alert('Withdraw request ID missing.');
//     }

//     // Define references
//     const userWalletRef = doc(db, 'subwallets', uid); // user wallet
//     const subAdminWalletRef = doc(db, 'subwallets', fromSubAdminId); // subadmin wallet
//     const withdrawRef = doc(db, 'subwithdrawRequests', id);

//     // Fetch current balances
//     const [userSnap, subAdminSnap] = await Promise.all([
//       getDoc(userWalletRef),
//       getDoc(subAdminWalletRef),
//     ]);

//     const userBalance = userSnap.exists() ? userSnap.data()?.balance ?? 0 : 0;
//     const subAdminBalance = subAdminSnap.exists() ? subAdminSnap.data()?.balance ?? 0 : 0;

//     if (subAdminBalance < amount) {
//       return alert('Subadmin has insufficient balance to approve this withdrawal.');
//     }

//     // ✅ Update user wallet (add funds)
//     await updateDoc(userWalletRef, {
//       balance: userBalance + amount,
//       updatedAt: serverTimestamp(),
//     });

//     // ✅ Deduct from subadmin wallet
//     await updateDoc(subAdminWalletRef, {
//       balance: subAdminBalance - amount,
//       updatedAt: serverTimestamp(),
//     });

//     // ✅ Update withdraw request status
//     await updateDoc(withdrawRef, {
//       status: 'approved',
//       updatedAt: serverTimestamp(),
//     });

//     alert('✅ Withdraw approved and funds added to user wallet.');
//   } catch (err) {
//     console.error('❌ handleAcceptWithdraw error:', err);
//     alert('Something went wrong while accepting the withdraw.');
//   }
// };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8">
//         <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded shadow-lg">
//           <h1 className="text-2xl font-bold mb-6 text-center">
//             {role === 'admin' ? 'Admin: Fund Subadmin' : 'Subadmin: Fund User'}
//           </h1>

//           <p className="mb-4 text-green-400">Your Balance: ₹{currentBalance.toFixed(2)}</p>

//           <input
//             type="email"
//             placeholder={role === 'admin' ? 'Subadmin Email' : 'User Email'}
//             className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//             value={targetEmail}
//             onChange={(e) => setTargetEmail(e.target.value)}
//           />

//           <button
//             onClick={handleSearch}
//             disabled={loading}
//             className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded mb-4"
//           >
//             {loading ? 'Searching...' : 'Find Wallet'}
//           </button>

//           {message && <p className="text-center text-sm mb-4 text-yellow-400">{message}</p>}

//           {targetUid && (
//             <>
//               <p className="mb-2">Recipient Balance: ₹{targetBalance?.toFixed(2)}</p>
//               <input
//                 type="number"
//                 placeholder="Amount to transfer"
//                 className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//                 value={amountToAdd}
//                 onChange={(e) => setAmountToAdd(e.target.value)}
//               />
//               <button
//                 onClick={handleAddBalance}
//                 className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded"
//               >
//                 Transfer Funds
//               </button>
//             </>
//           )}
//         </div>

//         {/* Withdraw Requests */}
//         {withdrawRequests.length > 0 && (
//           <div className="max-w-2xl mx-auto mt-10 bg-gray-800 p-6 rounded shadow-lg">
//             <h2 className="text-xl font-semibold mb-4">Pending Withdraw Requests</h2>
//             {withdrawRequests.map((req) => (
//               <div key={req.id} className="bg-gray-700 p-3 mb-3 rounded">
//                 <p><strong>From:</strong> {req.fromEmail}</p>
//                 <p><strong>Amount:</strong> ₹{req.amount}</p>
//                 <p><strong>Method:</strong> {req.method} ({req.details})</p>
//                 <button
//                   className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
//                   onClick={() => handleAcceptWithdraw(req)}
//                 >
//                   Accept
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// }

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   getDoc,
//   updateDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function Page() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [currentUser, setCurrentUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [currentBalance, setCurrentBalance] = useState(0);

//   const [targetEmail, setTargetEmail] = useState('');
//   const [targetUid, setTargetUid] = useState('');
//   const [targetBalance, setTargetBalance] = useState(null);
//   const [amountToAdd, setAmountToAdd] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const [withdrawRequests, setWithdrawRequests] = useState([]);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setCurrentUser(user);
//       if (user) {
//         const userRef = doc(db, 'users', user.uid);
//         const snap = await getDoc(userRef);
//         const userData = snap.exists() ? snap.data() : {};
//         const userRole = userData.role || 'user';
//         setRole(userRole);

//         const walletCol = userRole === 'admin' ? 'adminwallets' : 'subwallets';
//         const walletRef = doc(db, walletCol, user.uid);
//         const walletSnap = await getDoc(walletRef);
//         const balance = walletSnap.exists() ? walletSnap.data().balance ?? 0 : 0;
//         setCurrentBalance(balance);

//         loadWithdrawRequests(user.uid, userRole);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const loadWithdrawRequests = async (uid, userRole) => {
//     const field = userRole === 'admin' ? 'fromSubAdminId' : 'fromUserSubAdminId';
//     const q = query(collection(db, 'subwithdrawRequests'), where(field, '==', uid));
//     const snap = await getDocs(q);
//     const results = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     setWithdrawRequests(results);
//   };

//   const handleSearch = async () => {
//     setLoading(true);
//     setMessage('');
//     setTargetUid('');
//     setTargetBalance(null);

//     try {
//       const q = query(collection(db, 'subwallets'), where('email', '==', targetEmail));
//       const snap = await getDocs(q);

//       if (snap.empty) {
//         setMessage('❌ Wallet not found.');
//         return;
//       }

//       const wallet = snap.docs[0].data();
//       const uid = wallet.uid;

//       if (role === 'subadmin' && wallet.subAdminId !== currentUser.uid) {
//         setMessage('❌ Not your user.');
//         return;
//       }

//       setTargetUid(uid);
//       setTargetBalance(wallet.balance ?? 0);
//       setMessage('✅ Wallet found.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Error searching.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddBalance = async () => {
//     if (!targetUid || !amountToAdd) return;

//     const amount = parseFloat(amountToAdd);
//     if (isNaN(amount) || amount <= 0) {
//       setMessage('❌ Invalid amount.');
//       return;
//     }

//     if (amount > currentBalance) {
//       setMessage('❌ Insufficient balance.');
//       return;
//     }

//     try {
//       const fromWalletCol = role === 'admin' ? 'adminwallets' : 'subwallets';
//       const toWalletCol = 'subwallets';

//       const fromRef = doc(db, fromWalletCol, currentUser.uid);
//       const toRef = doc(db, toWalletCol, targetUid);

//       await updateDoc(toRef, {
//         balance: (targetBalance ?? 0) + amount,
//         updatedAt: serverTimestamp(),
//       });

//       await updateDoc(fromRef, {
//         balance: currentBalance - amount,
//         updatedAt: serverTimestamp(),
//       });

//       setTargetBalance((prev) => (prev ?? 0) + amount);
//       setCurrentBalance((prev) => prev - amount);
//       setAmountToAdd('');
//       setMessage('✅ Transfer successful.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Failed to transfer.');
//     }
//   };

//   const handleAcceptWithdraw = async (withdraw) => {
//     try {
//       if (!withdraw || typeof withdraw !== 'object') {
//         console.error('❌ Invalid withdraw object:', withdraw);
//         return alert('Invalid request.');
//       }

//       const { uid, amount, id, fromSubAdminId } = withdraw;

//       if (!uid || typeof uid !== 'string') {
//         console.error('❌ Missing or invalid UID in withdraw:', withdraw);
//         return alert('Withdraw UID is missing.');
//       }

//       if (!id) {
//         console.error('❌ Missing Firestore document ID of withdraw request');
//         return alert('Withdraw request ID missing.');
//       }

//       const userWalletRef = doc(db, 'subwallets', uid);
//       const subAdminWalletRef = doc(db, 'subwallets', fromSubAdminId);
//       const withdrawRef = doc(db, 'subwithdrawRequests', id);

//       const [userSnap, subAdminSnap] = await Promise.all([
//         getDoc(userWalletRef),
//         getDoc(subAdminWalletRef),
//       ]);

//       const userBalance = userSnap.exists() ? userSnap.data()?.balance ?? 0 : 0;
//       const subAdminBalance = subAdminSnap.exists() ? subAdminSnap.data()?.balance ?? 0 : 0;

//       if (subAdminBalance < amount) {
//         return alert('Subadmin has insufficient balance to approve this withdrawal.');
//       }

//       await updateDoc(userWalletRef, {
//         balance: userBalance + amount,
//         updatedAt: serverTimestamp(),
//       });

//       await updateDoc(subAdminWalletRef, {
//         balance: subAdminBalance - amount,
//         updatedAt: serverTimestamp(),
//       });

//       await updateDoc(withdrawRef, {
//         status: 'approved',
//         updatedAt: serverTimestamp(),
//       });

//       setWithdrawRequests((prev) => prev.filter((r) => r.id !== id));
//       alert('✅ Withdraw approved and funds added to user wallet.');
//     } catch (err) {
//       console.error('❌ handleAcceptWithdraw error:', err);
//       alert('Something went wrong while accepting the withdraw.');
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8">
//         <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded shadow-lg">
//           <h1 className="text-2xl font-bold mb-6 text-center">
//             {role === 'admin' ? 'Admin: Fund Subadmin' : 'Subadmin: Fund User'}
//           </h1>

//           <p className="mb-4 text-green-400">Your Balance: ₹{currentBalance.toFixed(2)}</p>

//           <input
//             type="email"
//             placeholder={role === 'admin' ? 'Subadmin Email' : 'User Email'}
//             className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//             value={targetEmail}
//             onChange={(e) => setTargetEmail(e.target.value)}
//           />

//           <button
//             onClick={handleSearch}
//             disabled={loading}
//             className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded mb-4"
//           >
//             {loading ? 'Searching...' : 'Find Wallet'}
//           </button>

//           {message && <p className="text-center text-sm mb-4 text-yellow-400">{message}</p>}

//           {targetUid && (
//             <>
//               <p className="mb-2">Recipient Balance: ₹{targetBalance?.toFixed(2)}</p>
//               <input
//                 type="number"
//                 placeholder="Amount to transfer"
//                 className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//                 value={amountToAdd}
//                 onChange={(e) => setAmountToAdd(e.target.value)}
//               />
//               <button
//                 onClick={handleAddBalance}
//                 className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded"
//               >
//                 Transfer Funds
//               </button>
//             </>
//           )}
//         </div>

//         {/* ✅ Withdraw Requests */}
//         {withdrawRequests.length > 0 && (
//           <div className="max-w-2xl mx-auto mt-10 bg-gray-800 p-6 rounded shadow-lg">
//             <h2 className="text-xl font-semibold mb-4">Pending Withdraw Requests</h2>
//             {withdrawRequests.map((req) => (
//               <div key={req.id} className="bg-gray-700 p-3 mb-3 rounded">
//                 <p><strong>User:</strong> {req.email}</p>
//                 <p><strong>Amount:</strong> ₹{req.amount}</p>
//                 <p><strong>Method:</strong> {req.method} ({req.paymentId})</p>
//                 <p><strong>Requested:</strong> {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
//                 <button
//                   className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
//                   onClick={() => handleAcceptWithdraw(req)}
//                 >
//                   Accept
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// }

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   getDoc,
//   updateDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function Page() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [currentUser, setCurrentUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [currentBalance, setCurrentBalance] = useState(0);

//   const [targetEmail, setTargetEmail] = useState('');
//   const [targetUid, setTargetUid] = useState('');
//   const [targetBalance, setTargetBalance] = useState(null);
//   const [amountToAdd, setAmountToAdd] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const [withdrawRequests, setWithdrawRequests] = useState([]);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setCurrentUser(user);
//       if (user) {
//         const userRef = doc(db, 'users', user.uid);
//         const snap = await getDoc(userRef);
//         const userData = snap.exists() ? snap.data() : {};
//         const userRole = userData.role || 'user';
//         setRole(userRole);

//         const walletCol = userRole === 'admin' ? 'adminwallets' : 'subwallets';
//         const walletRef = doc(db, walletCol, user.uid);
//         const walletSnap = await getDoc(walletRef);
//         const balance = walletSnap.exists() ? walletSnap.data().balance ?? 0 : 0;
//         setCurrentBalance(balance);

//         loadWithdrawRequests(user.uid, userRole);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const loadWithdrawRequests = async (uid, userRole) => {
//     const field = userRole === 'admin' ? 'fromSubAdminId' : 'fromUserSubAdminId';
//     const q = query(collection(db, 'subwithdrawRequests'), where(field, '==', uid));
//     const snap = await getDocs(q);
//     const results = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     setWithdrawRequests(results);
//   };

//   const handleSearch = async () => {
//     setLoading(true);
//     setMessage('');
//     setTargetUid('');
//     setTargetBalance(null);

//     try {
//       const q = query(collection(db, 'subwallets'), where('email', '==', targetEmail));
//       const snap = await getDocs(q);

//       if (snap.empty) {
//         setMessage('❌ Wallet not found.');
//         return;
//       }

//       const wallet = snap.docs[0].data();
//       const uid = wallet.uid;

//       if (role === 'subadmin' && wallet.subAdminId !== currentUser.uid) {
//         setMessage('❌ Not your user.');
//         return;
//       }

//       setTargetUid(uid);
//       setTargetBalance(wallet.balance ?? 0);
//       setMessage('✅ Wallet found.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Error searching.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddBalance = async () => {
//     if (!targetUid || !amountToAdd) return;

//     const amount = parseFloat(amountToAdd);
//     if (isNaN(amount) || amount <= 0) {
//       setMessage('❌ Invalid amount.');
//       return;
//     }

//     if (amount > currentBalance) {
//       setMessage('❌ Insufficient balance.');
//       return;
//     }

//     try {
//       const fromWalletCol = role === 'admin' ? 'adminwallets' : 'subwallets';
//       const toWalletCol = 'subwallets';

//       const fromRef = doc(db, fromWalletCol, currentUser.uid);
//       const toRef = doc(db, toWalletCol, targetUid);

//       await updateDoc(toRef, {
//         balance: (targetBalance ?? 0) + amount,
//         updatedAt: serverTimestamp(),
//       });

//       await updateDoc(fromRef, {
//         balance: currentBalance - amount,
//         updatedAt: serverTimestamp(),
//       });

//       setTargetBalance((prev) => (prev ?? 0) + amount);
//       setCurrentBalance((prev) => prev - amount);
//       setAmountToAdd('');
//       setMessage('✅ Transfer successful.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Failed to transfer.');
//     }
//   };

//   const handleAcceptWithdraw = async (withdraw) => {
//     try {
//       if (!withdraw || typeof withdraw !== 'object') return alert('Invalid request.');

//       const { uid, amount, id, fromSubAdminId } = withdraw;
//       if (!uid || !id || !fromSubAdminId) return alert('Missing data in request.');

//       const userWalletRef = doc(db, 'subwallets', uid);
//       const subAdminWalletRef = doc(db, 'subwallets', fromSubAdminId);
//       const withdrawRef = doc(db, 'subwithdrawRequests', id);

//       const [userSnap, subAdminSnap] = await Promise.all([
//         getDoc(userWalletRef),
//         getDoc(subAdminWalletRef),
//       ]);

//       const userBalance = userSnap.exists() ? userSnap.data()?.balance ?? 0 : 0;
//       const subAdminBalance = subAdminSnap.exists() ? subAdminSnap.data()?.balance ?? 0 : 0;

//       if (subAdminBalance < amount) return alert('Insufficient subadmin balance.');

//       await updateDoc(userWalletRef, {
//         balance: userBalance + amount,
//         updatedAt: serverTimestamp(),
//       });

//       await updateDoc(subAdminWalletRef, {
//         balance: subAdminBalance - amount,
//         updatedAt: serverTimestamp(),
//       });

//       await updateDoc(withdrawRef, {
//         status: 'approved',
//         updatedAt: serverTimestamp(),
//       });

//       setWithdrawRequests((prev) => prev.filter((r) => r.id !== id));
//       alert('✅ Withdraw approved.');
//     } catch (err) {
//       console.error('❌ Withdraw approval error:', err);
//       alert('Something went wrong.');
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8">
//         <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded shadow-lg">
//           <h1 className="text-2xl font-bold mb-6 text-center">
//             {role === 'admin' ? 'Admin: Fund Subadmin' : 'Subadmin: Fund User'}
//           </h1>

//           <p className="mb-4 text-green-400">Your Balance: ₹{currentBalance.toFixed(2)}</p>

//           <input
//             type="email"
//             placeholder={role === 'admin' ? 'Subadmin Email' : 'User Email'}
//             className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//             value={targetEmail}
//             onChange={(e) => setTargetEmail(e.target.value)}
//           />

//           <button
//             onClick={handleSearch}
//             disabled={loading}
//             className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded mb-4"
//           >
//             {loading ? 'Searching...' : 'Find Wallet'}
//           </button>

//           {message && <p className="text-center text-sm mb-4 text-yellow-400">{message}</p>}

//           {targetUid && (
//             <>
//               <p className="mb-2">Recipient Balance: ₹{targetBalance?.toFixed(2)}</p>
//               <input
//                 type="number"
//                 placeholder="Amount to transfer"
//                 className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//                 value={amountToAdd}
//                 onChange={(e) => setAmountToAdd(e.target.value)}
//               />
//               <button
//                 onClick={handleAddBalance}
//                 className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded"
//               >
//                 Transfer Funds
//               </button>
//             </>
//           )}
//         </div>

//         {withdrawRequests.length > 0 && (
//           <div className="max-w-2xl mx-auto mt-10 bg-gray-800 p-6 rounded shadow-lg">
//             <h2 className="text-xl font-semibold mb-4">Pending Withdraw Requests</h2>
//             {withdrawRequests.map((req) => (
//               <div key={req.id} className="bg-gray-700 p-3 mb-3 rounded">
//                 <p><strong>User:</strong> {req.email}</p>
//                 <p><strong>Amount:</strong> ₹{req.amount}</p>
//                 <p><strong>Method:</strong> {req.method} ({req.paymentId})</p>
//                 <p><strong>Time:</strong> {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
//                 <button
//                   className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
//                   onClick={() => handleAcceptWithdraw(req)}
//                 >
//                   Accept
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// }



// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   getDoc,
//   updateDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function Page() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [currentUser, setCurrentUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [currentBalance, setCurrentBalance] = useState(0);

//   const [targetEmail, setTargetEmail] = useState('');
//   const [targetUid, setTargetUid] = useState('');
//   const [targetBalance, setTargetBalance] = useState(null);
//   const [amountToAdd, setAmountToAdd] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const [withdrawRequests, setWithdrawRequests] = useState([]);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setCurrentUser(user);
//       if (user) {
//         const userRef = doc(db, 'users', user.uid);
//         const snap = await getDoc(userRef);
//         const userData = snap.exists() ? snap.data() : {};
//         const userRole = userData.role || 'user';
//         setRole(userRole);

//         const walletCol = userRole === 'admin' ? 'adminwallets' : 'subwallets';
//         const walletRef = doc(db, walletCol, user.uid);
//         const walletSnap = await getDoc(walletRef);
//         const balance = walletSnap.exists() ? walletSnap.data().balance ?? 0 : 0;
//         setCurrentBalance(balance);

//         loadWithdrawRequests(user.uid);
//         // loadWithdrawRequests(user.uid, userRole);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   // const loadWithdrawRequests = async (uid) => {
//   //   const q = query(collection(db, 'subwithdrawRequests'), where('fromSubAdminId', '==', uid));
//   //   const snap = await getDocs(q);
//   //   const results = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//   //   setWithdrawRequests(results);
//   // };
//   const loadWithdrawRequests = async (uid, role) => {
//   let q;

//   if (role === 'admin') {
//     // Admin sees withdraws requested by subadmins
//     q = query(collection(db, 'subwithdrawRequests'), where('fromSubAdminId', '==', uid));
//   } else if (role === 'subadmin') {
//     // Subadmin sees withdraws requested by their users
//     q = query(collection(db, 'subwithdrawRequests'), where('fromUserSubAdminId', '==', uid));
//   } else {
//     return; // Do nothing for normal users
//   }

//   const snap = await getDocs(q);
//   const results = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//   setWithdrawRequests(results);
// };


// // const loadWithdrawRequests = async (uid, userRole) => {
// //   let q;

// //   if (userRole === 'admin') {
// //     // Admin should see withdraws made by subadmins
// //     q = query(
// //       collection(db, 'subwithdrawRequests'),
// //       where('fromSubAdminId', '==', uid),
// //       where('status', '==', 'pending')
// //     );
// //   } else if (userRole === 'subadmin') {
// //     // Subadmin should see withdraws made by their users
// //     q = query(
// //       collection(db, 'subwithdrawRequests'),
// //       where('fromUserSubAdminId', '==', uid),
// //       where('status', '==', 'pending')
// //     );
// //   } else {
// //     return; // No access for other roles
// //   }

// //   const snap = await getDocs(q);
// //   const results = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// //   setWithdrawRequests(results);
// // };

//   const handleSearch = async () => {
//     setLoading(true);
//     setMessage('');
//     setTargetUid('');
//     setTargetBalance(null);

//     try {
//       const q = query(collection(db, 'subwallets'), where('email', '==', targetEmail));
//       const snap = await getDocs(q);

//       if (snap.empty) {
//         setMessage('❌ Wallet not found.');
//         return;
//       }

//       const wallet = snap.docs[0].data();
//       const uid = wallet.uid;

//       if (role === 'subadmin' && wallet.subAdminId !== currentUser.uid) {
//         setMessage('❌ Not your user.');
//         return;
//       }

//       setTargetUid(uid);
//       setTargetBalance(wallet.balance ?? 0);
//       setMessage('✅ Wallet found.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Error searching.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddBalance = async () => {
//     if (!targetUid || !amountToAdd) return;

//     const amount = parseFloat(amountToAdd);
//     if (isNaN(amount) || amount <= 0) {
//       setMessage('❌ Invalid amount.');
//       return;
//     }

//     if (amount > currentBalance) {
//       setMessage('❌ Insufficient balance.');
//       return;
//     }

//     try {
//       const fromWalletCol = role === 'admin' ? 'adminwallets' : 'subwallets';
//       const toWalletCol = 'subwallets';

//       const fromRef = doc(db, fromWalletCol, currentUser.uid);
//       const toRef = doc(db, toWalletCol, targetUid);

//       await updateDoc(toRef, {
//         balance: (targetBalance ?? 0) + amount,
//         updatedAt: serverTimestamp(),
//       });

//       await updateDoc(fromRef, {
//         balance: currentBalance - amount,
//         updatedAt: serverTimestamp(),
//       });

//       setTargetBalance((prev) => (prev ?? 0) + amount);
//       setCurrentBalance((prev) => prev - amount);
//       setAmountToAdd('');
//       setMessage('✅ Transfer successful.');
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Failed to transfer.');
//     }
//   };

//   // const handleAcceptWithdraw = async (withdraw) => {
//   //   try {
//   //     const { uid, amount, id, fromSubAdminId } = withdraw;
//   //     if (!uid || !id || !fromSubAdminId) {
//   //       return alert('Invalid withdraw request.');
//   //     }

//   //     const userWalletRef = doc(db, 'subwallets', uid);
//   //     const subAdminWalletRef = doc(db, 'subwallets', fromSubAdminId);
//   //     const withdrawRef = doc(db, 'subwithdrawRequests', id);

//   //     const [userSnap, subAdminSnap] = await Promise.all([
//   //       getDoc(userWalletRef),
//   //       getDoc(subAdminWalletRef),
//   //     ]);

//   //     const userBalance = userSnap.exists() ? userSnap.data().balance ?? 0 : 0;
//   //     const subAdminBalance = subAdminSnap.exists() ? subAdminSnap.data().balance ?? 0 : 0;

//   //     if (subAdminBalance < amount) {
//   //       return alert('Subadmin has insufficient balance to approve this withdrawal.');
//   //     }

//   //     await updateDoc(userWalletRef, {
//   //       balance: userBalance + amount,
//   //       updatedAt: serverTimestamp(),
//   //     });

//   //     await updateDoc(subAdminWalletRef, {
//   //       balance: subAdminBalance - amount,
//   //       updatedAt: serverTimestamp(),
//   //     });

//   //     await updateDoc(withdrawRef, {
//   //       status: 'approved',
//   //       updatedAt: serverTimestamp(),
//   //     });

//   //     setWithdrawRequests((prev) => prev.filter((r) => r.id !== id));
//   //     alert('✅ Withdraw approved and funds added to user wallet.');
//   //   } catch (err) {
//   //     console.error('❌ handleAcceptWithdraw error:', err);
//   //     alert('Something went wrong while accepting the withdraw.');
//   //   }
//   // };
//   const handleAcceptWithdraw = async (withdraw) => {
//   try {
//     const { id, amount, fromSubAdminId, status } = withdraw;

//     if (!id || !fromSubAdminId || status !== 'pending') {
//       return alert('Invalid or already processed request.');
//     }

//     // Get subadmin wallet
//     const subAdminWalletRef = doc(db, 'subwallets', fromSubAdminId);
//     const subAdminSnap = await getDoc(subAdminWalletRef);

//     if (!subAdminSnap.exists()) return alert('Subadmin wallet not found.');

//     const subAdminBalance = subAdminSnap.data().balance ?? 0;

//     // ✅ Add amount back to subadmin
//     await updateDoc(subAdminWalletRef, {
//       balance: subAdminBalance + amount,
//       updatedAt: serverTimestamp(),
//     });

//     // ✅ Mark the request as approved
//     await updateDoc(doc(db, 'subwithdrawRequests', id), {
//       status: 'approved',
//       approvedAt: serverTimestamp(),
//     });

//     // ✅ Remove from pending list on screen
//     setWithdrawRequests((prev) =>
//       prev.map((r) =>
//         r.id === id ? { ...r, status: 'approved' } : r
//       )
//     );

//     alert('✅ Withdraw approved. Amount credited back to subadmin.');
//   } catch (err) {
//     console.error('❌ Error approving withdraw:', err);
//     alert('Something went wrong.');
//   }
// };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8">
//         <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded shadow-lg">
//           <h1 className="text-2xl font-bold mb-6 text-center">
//             {role === 'admin' ? 'Admin: Fund Subadmin' : 'Subadmin: Fund User'}
//           </h1>

//           <p className="mb-4 text-green-400">Your Balance: ₹{currentBalance.toFixed(2)}</p>

//           <input
//             type="email"
//             placeholder={role === 'admin' ? 'Subadmin Email' : 'User Email'}
//             className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//             value={targetEmail}
//             onChange={(e) => setTargetEmail(e.target.value)}
//           />

//           <button
//             onClick={handleSearch}
//             disabled={loading}
//             className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded mb-4"
//           >
//             {loading ? 'Searching...' : 'Find Wallet'}
//           </button>

//           {message && <p className="text-center text-sm mb-4 text-yellow-400">{message}</p>}

//           {targetUid && (
//             <>
//               <p className="mb-2">Recipient Balance: ₹{targetBalance?.toFixed(2)}</p>
//               <input
//                 type="number"
//                 placeholder="Amount to transfer"
//                 className="w-full p-3 rounded bg-gray-700 text-white mb-4"
//                 value={amountToAdd}
//                 onChange={(e) => setAmountToAdd(e.target.value)}
//               />
//               <button
//                 onClick={handleAddBalance}
//                 className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded"
//               >
//                 Transfer Funds
//               </button>
//             </>
//           )}
//         </div>

//         {/* Withdraw Requests */}
//         {withdrawRequests.length > 0 && (
//           <div className="max-w-2xl mx-auto mt-10 bg-gray-800 p-6 rounded shadow-lg">
//             <h2 className="text-xl font-semibold mb-4">Pending Withdraw Requests</h2>
//             {withdrawRequests.map((req) => (
//               <div key={req.id} className="bg-gray-700 p-3 mb-3 rounded">
//                 <p><strong>User Email:</strong> {req.email}</p>
//                 <p><strong>Amount:</strong> ₹{req.amount}</p>
//                 <p><strong>Method:</strong> {req.method} ({req.paymentId})</p>
//                 {/* <button
//                   className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
//                   onClick={() => handleAcceptWithdraw(req)}
//                 >
//                   Accept
//                 </button> */}
//                 {req.status === 'pending' ? (
//   <button
//     className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
//     onClick={() => handleAcceptWithdraw(req)}
//   >
//     Accept
//   </button>
// ) : (
//   <span className="inline-block mt-2 text-green-400 font-semibold">
//     Approved
//   </span>
// )}

//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// }


// app/yourPath/page.js

'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseApp from '@/firebase';
import Layout from '@/app/Components/Layout';

export default function Page() {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);

  const [targetEmail, setTargetEmail] = useState('');
  const [targetUid, setTargetUid] = useState('');
  const [targetBalance, setTargetBalance] = useState(null);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [withdrawRequests, setWithdrawRequests] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        const userData = snap.exists() ? snap.data() : {};
        const userRole = userData.role || 'user';
        setRole(userRole);

        const walletCol = userRole === 'admin' ? 'adminwallets' : 'subwallets';
        const walletRef = doc(db, walletCol, user.uid);
        const walletSnap = await getDoc(walletRef);
        const balance = walletSnap.exists() ? walletSnap.data().balance ?? 0 : 0;
        setCurrentBalance(balance);

        loadWithdrawRequests(user.uid, userRole);
      }
    });
    return () => unsubscribe();
  }, []);

  // const loadWithdrawRequests = async (uid, userRole) => {
  //   let q;
  //   if (userRole === 'admin') {
  //     q = query(
  //       collection(db, 'subwithdrawRequests'),
  //       where('fromSubAdminId', '==', uid),
  //       where('status', '==', 'pending')
  //     );
  //   } else if (userRole === 'subadmin') {
  //     q = query(
  //       collection(db, 'subwithdrawRequests'),
  //       where('fromUserSubAdminId', '==', uid),
  //       where('status', '==', 'pending')
  //     );
  //   } else return;

  //   const snap = await getDocs(q);
  //   const results = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  //   setWithdrawRequests(results);
  // };
const loadWithdrawRequests = async (uid, userRole) => {
  let q;

  if (userRole === 'admin') {
    // Show only subadmin → admin withdraws
    q = query(
      collection(db, 'subwithdrawRequests'),
      where('fromUserSubAdminId', '==', ''), // 🔍 Must be from a subadmin
      where('status', '==', 'pending')
    );
  } else if (userRole === 'subadmin') {
    // Show user → subadmin withdraws
    q = query(
      collection(db, 'subwithdrawRequests'),
      where('fromUserSubAdminId', '==', uid),
      where('status', '==', 'pending')
    );
  } else {
    return;
  }

  const snap = await getDocs(q);
  const results = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  setWithdrawRequests(results);
};

  const handleSearch = async () => {
    setLoading(true);
    setMessage('');
    setTargetUid('');
    setTargetBalance(null);

    try {
      const q = query(collection(db, 'subwallets'), where('email', '==', targetEmail));
      const snap = await getDocs(q);
      if (snap.empty) return setMessage('❌ Wallet not found.');

      const wallet = snap.docs[0].data();
      const uid = wallet.uid;
      if (role === 'subadmin' && wallet.subAdminId !== currentUser.uid) {
        return setMessage('❌ Not your user.');
      }

      setTargetUid(uid);
      setTargetBalance(wallet.balance ?? 0);
      setMessage('✅ Wallet found.');
    } catch (err) {
      console.error(err);
      setMessage('❌ Error searching.');
    } finally {
      setLoading(false);
    }
  };

  // const handleAddBalance = async () => {
  //   if (!targetUid || !amountToAdd) return;

  //   const amount = parseFloat(amountToAdd);
  //   if (isNaN(amount) || amount <= 0) return setMessage('❌ Invalid amount.');
  //   if (amount > currentBalance) return setMessage('❌ Insufficient balance.');

  //   try {
  //     const fromWalletCol = role === 'admin' ? 'adminwallets' : 'subwallets';
  //     const toWalletCol = 'subwallets';

  //     const fromRef = doc(db, fromWalletCol, currentUser.uid);
  //     const toRef = doc(db, toWalletCol, targetUid);

  //     await updateDoc(toRef, {
  //       balance: (targetBalance ?? 0) + amount,
  //       updatedAt: serverTimestamp(),
  //     });

  //     await updateDoc(fromRef, {
  //       balance: currentBalance - amount,
  //       updatedAt: serverTimestamp(),
  //     });

  //     setTargetBalance((prev) => (prev ?? 0) + amount);
  //     setCurrentBalance((prev) => prev - amount);
  //     setAmountToAdd('');
  //     setMessage('✅ Transfer successful.');
  //   } catch (err) {
  //     console.error(err);
  //     setMessage('❌ Failed to transfer.');
  //   }
  // };

  // const handleAcceptWithdraw = async (withdraw) => {
  //   try {
  //     const { id, amount, fromSubAdminId, fromUserSubAdminId, uid, status } = withdraw;
  //     if (!id || status !== 'pending') return alert('Invalid request.');

  //     if (role === 'admin') {
  //       const subAdminRef = doc(db, 'subwallets', fromSubAdminId);
  //       const snap = await getDoc(subAdminRef);
  //       const bal = snap.data().balance ?? 0;
  //       await updateDoc(subAdminRef, {
  //         balance: bal + amount,
  //         updatedAt: serverTimestamp(),
  //       });
  //     }

  //     if (role === 'subadmin') {
  //       const userRef = doc(db, 'subwallets', uid);
  //       const subRef = doc(db, 'subwallets', fromUserSubAdminId);
  //       const [userSnap, subSnap] = await Promise.all([getDoc(userRef), getDoc(subRef)]);
  //       const userBal = userSnap.data().balance ?? 0;
  //       const subBal = subSnap.data().balance ?? 0;
  //       if (subBal < amount) return alert('❌ Insufficient balance.');

  //       await updateDoc(userRef, {
  //         balance: userBal + amount,
  //         updatedAt: serverTimestamp(),
  //       });

  //       await updateDoc(subRef, {
  //         balance: subBal - amount,
  //         updatedAt: serverTimestamp(),
  //       });
  //     }

  //     await updateDoc(doc(db, 'subwithdrawRequests', id), {
  //       status: 'approved',
  //       approvedAt: serverTimestamp(),
  //     });

  //     setWithdrawRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved' } : r));
  //     alert('✅ Withdraw approved.');
  //   } catch (err) {
  //     console.error('❌ Error approving withdraw:', err);
  //     alert('Something went wrong.');
  //   }
  // };
// const handleAcceptWithdraw = async (withdraw) => {
//   try {
//     const { id, amount, fromSubAdminId, fromUserSubAdminId, status } = withdraw;

//     if (!id || status !== 'pending') {
//       return alert('Invalid or already processed request.');
//     }

//     // Determine if admin is accepting a subadmin's request
//     const isAdmin = role === 'admin' && fromSubAdminId && !fromUserSubAdminId;

//     const payerWalletRef = doc(db, isAdmin ? 'adminwallets' : 'subwallets', currentUser.uid);
//     const receiverWalletRef = doc(db, 'subwallets', withdraw.uid); // Always add to requester wallet

//     const [payerSnap, receiverSnap] = await Promise.all([
//       getDoc(payerWalletRef),
//       getDoc(receiverWalletRef),
//     ]);

//     const payerBalance = payerSnap.exists() ? payerSnap.data().balance ?? 0 : 0;
//     const receiverBalance = receiverSnap.exists() ? receiverSnap.data().balance ?? 0 : 0;

//     if (payerBalance < amount) {
//       return alert('❌ Insufficient balance to approve.');
//     }

//     // Transfer amount
//     await updateDoc(receiverWalletRef, {
//       balance: receiverBalance + amount,
//       updatedAt: serverTimestamp(),
//     });

//     await updateDoc(payerWalletRef, {
//       balance: payerBalance - amount,
//       updatedAt: serverTimestamp(),
//     });

//     // Mark as approved
//     await updateDoc(doc(db, 'subwithdrawRequests', id), {
//       status: 'approved',
//       approvedAt: serverTimestamp(),
//     });

//     // Update local state
//     setWithdrawRequests((prev) =>
//       prev.map((r) =>
//         r.id === id ? { ...r, status: 'approved' } : r
//       )
//     );

//     alert('✅ Withdraw approved and funds transferred.');
//   } catch (err) {
//     console.error('❌ Error approving withdraw:', err);
//     alert('Something went wrong.');
//   }
// };
const handleAddBalance = async () => {
  if (!targetUid || !amountToAdd) return;

  const amount = parseFloat(amountToAdd);
  if (isNaN(amount) || amount <= 0) return setMessage('❌ Invalid amount.');
  if (amount > currentBalance) return setMessage('❌ Insufficient balance.');

  try {
    const fromWalletCol = role === 'admin' ? 'adminwallets' : 'subwallets';
    const toWalletCol = 'subwallets';

    const fromRef = doc(db, fromWalletCol, currentUser.uid);
    const toRef = doc(db, toWalletCol, targetUid);

    // ✅ 1. Update recipient balance
    await updateDoc(toRef, {
      balance: (targetBalance ?? 0) + amount,
      updatedAt: serverTimestamp(),
    });

    // ✅ 2. Update sender balance
    await updateDoc(fromRef, {
      balance: currentBalance - amount,
      updatedAt: serverTimestamp(),
    });

    // ✅ 3. Log transaction in subdepositRequests
    const depositRef = doc(collection(db, 'subdepositRequests')); // auto-id
    await setDoc(depositRef, {
      uid: targetUid,
      email: targetEmail,
      amount,
      status: 'approved',
      method: 'internal transfer',
      paymentId: '',
      createdAt: serverTimestamp(),
      approvedAt: serverTimestamp(),
      fromUserSubAdminId: role === 'subadmin' ? currentUser.uid : '',
      fromAdminId: role === 'admin' ? currentUser.uid : '',
      type: role === 'admin' ? 'admin-to-subadmin' : 'subadmin-to-user',
    });

    // ✅ 4. Update UI
    setTargetBalance((prev) => (prev ?? 0) + amount);
    setCurrentBalance((prev) => prev - amount);
    setAmountToAdd('');
    setMessage('✅ Transfer successful and logged.');
  } catch (err) {
    console.error(err);
    setMessage('❌ Failed to transfer.');
  }
};

const handleAcceptWithdraw = async (withdraw) => {
  try {
    const { id, amount, fromSubAdminId, fromUserSubAdminId, uid, status } = withdraw;

    if (!id || status !== 'pending') {
      return alert('Invalid or already processed request.');
    }

    // Determine the receiver (who gets the money back)
    let receiverUid;
    if (role === 'admin') {
      // Admin is approving subadmin → admin request
      receiverUid = fromSubAdminId;
    } else if (role === 'subadmin') {
      // Subadmin is approving user → subadmin request
      receiverUid = currentUser.uid;
    } else {
      return alert('Unauthorized');
    }

    // Approver's wallet (who gets money added back)
    const receiverWalletRef = doc(db, role === 'admin' ? 'adminwallets' : 'subwallets', receiverUid);
    const receiverSnap = await getDoc(receiverWalletRef);
    const receiverBalance = receiverSnap.exists() ? receiverSnap.data().balance ?? 0 : 0;

    // Add amount back to approver (admin or subadmin)
    await updateDoc(receiverWalletRef, {
      balance: receiverBalance + amount,
      updatedAt: serverTimestamp(),
    });
    

// await setDoc(receiverWalletRef, {
//   balance: receiverBalance + amount,
//   updatedAt: serverTimestamp(),
// }, { merge: true });


    // Mark the request as approved
    await updateDoc(doc(db, 'subwithdrawRequests', id), {
      status: 'approved',
      approvedAt: serverTimestamp(),
    });

    // Update UI
    setWithdrawRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );

    alert('✅ Withdraw approved and funds added to your wallet.');
  } catch (err) {
    console.error('❌ Error approving withdraw:', err);
    alert('Something went wrong.');
  }
};
// const handleAcceptWithdraw = async (withdraw) => {
//   try {
//     const { id, amount, fromSubAdminId, fromUserSubAdminId, uid, status } = withdraw;

//     if (!id || status !== 'pending') {
//       return alert('Invalid or already processed request.');
//     }

//     let receiverWalletRef;

//     if (role === 'admin' && fromSubAdminId && !fromUserSubAdminId) {
//       // Admin is approving subadmin's withdraw request
//       receiverWalletRef = doc(db, 'adminwallets', uid); // subadmin’s uid is the requester
//     } else if (role === 'subadmin' && fromUserSubAdminId) {
//       // Subadmin is approving user's withdraw request
//       receiverWalletRef = doc(db, 'subwallets', uid); // user’s uid is the requester
//     } else {
//       return alert('Unauthorized or malformed withdraw request.');
//     }

//     const receiverSnap = await getDoc(receiverWalletRef);
//     const receiverBalance = receiverSnap.exists() ? receiverSnap.data().balance ?? 0 : 0;

//     // ✅ Credit receiver wallet
//     await setDoc(receiverWalletRef, {
//       balance: receiverBalance + amount,
//       updatedAt: serverTimestamp(),
//     }, { merge: true });

//     // ✅ Mark request as approved
//     await updateDoc(doc(db, 'subwithdrawRequests', id), {
//       status: 'approved',
//       approvedAt: serverTimestamp(),
//     });

//     // ✅ Update state
//     setWithdrawRequests((prev) =>
//       prev.map((r) =>
//         r.id === id ? { ...r, status: 'approved' } : r
//       )
//     );

//     alert('✅ Withdraw approved and amount credited.');
//   } catch (err) {
//     console.error('❌ Error approving withdraw:', err);
//     alert('Something went wrong while approving.');
//   }
// };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {role === 'admin' ? 'Admin: Fund Subadmin' : 'Subadmin: Fund User'}
          </h1>

          <p className="mb-4 text-green-400">Your Balance: ₹{currentBalance.toFixed(2)}</p>

          <input
            type="email"
            placeholder={role === 'admin' ? 'Subadmin Email' : 'User Email'}
            className="w-full p-3 rounded bg-gray-700 text-white mb-4"
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded mb-4"
          >
            {loading ? 'Searching...' : 'Find Wallet'}
          </button>

          {message && <p className="text-center text-sm mb-4 text-yellow-400">{message}</p>}

          {targetUid && (
            <>
              <p className="mb-2">Recipient Balance: ₹{targetBalance?.toFixed(2)}</p>
              <input
                type="number"
                placeholder="Amount to transfer"
                className="w-full p-3 rounded bg-gray-700 text-white mb-4"
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
              />
              <button
                onClick={handleAddBalance}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded"
              >
                Transfer Funds
              </button>
            </>
          )}
        </div>

        {withdrawRequests.length > 0 && (
          <div className="max-w-2xl mx-auto mt-10 bg-gray-800 p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Pending Withdraw Requests</h2>
            {withdrawRequests.map((req) => (
              <div key={req.id} className="bg-gray-700 p-3 mb-3 rounded">
                <p><strong>User Email:</strong> {req.email}</p>
                <p><strong>Amount:</strong> ₹{req.amount}</p>
                <p><strong>Method:</strong> {req.method} ({req.paymentId})</p>
                {req.status === 'pending' ? (
                  <button
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
                    onClick={() => handleAcceptWithdraw(req)}
                  >
                    Accept
                  </button>
                ) : (
                  <span className="inline-block mt-2 text-green-400 font-semibold">
                    Approved
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}


