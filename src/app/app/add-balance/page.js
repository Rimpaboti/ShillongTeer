

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   addDoc,
//   serverTimestamp,
//   doc,
//   getDoc,
//   updateDoc,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function PlayBoard() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [walletBalance, setWalletBalance] = useState(null);
//   const [betAmount, setBetAmount] = useState('');
//   const [range, setRange] = useState('0-9');
//   const [selectedNumber, setSelectedNumber] = useState(null);
//   const [user, setUser] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [activeGameSlot, setActiveGameSlot] = useState(null);
//   const [role, setRole] = useState(null); // 'user' or 'subadmin'

//   // Deposit
//   const [depositAmount, setDepositAmount] = useState('');
//   const [transactionId, setTransactionId] = useState('');
//   const [depositSubmitting, setDepositSubmitting] = useState(false);

//   // Withdraw
//   const [withdrawAmount, setWithdrawAmount] = useState('');
//   const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
//   const [withdrawError, setWithdrawError] = useState('');

//   const numberOptions =
//     range === '0-9'
//       ? Array.from({ length: 10 }, (_, i) => i)
//       : Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));

//   const gameTimes = [
//     { label: '1:00 PM', resultHour: 13 },
//     { label: '6:00 PM', resultHour: 18 },
//     { label: '8:00 PM', resultHour: 20 },
//   ];

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       setUser(currentUser);

//       if (currentUser) {
//         const walletRef = doc(db, 'subwallets', currentUser.uid);
//         const walletSnap = await getDoc(walletRef);
//         if (walletSnap.exists()) {
//           setWalletBalance(walletSnap.data().balance ?? 0);
//         }

//         // Fetch role
//         const userRef = doc(db, 'users', currentUser.uid);
//         const userSnap = await getDoc(userRef);
//         if (userSnap.exists()) {
//           setRole(userSnap.data().role ?? 'user');
//         } else {
//           setRole('user');
//         }
//       }
//     });

//     const now = new Date();
//     let foundSlot = null;

//     for (let game of gameTimes) {
//       const resultTime = new Date();
//       resultTime.setHours(game.resultHour, 0, 0, 0);
//       const closeTime = new Date(resultTime.getTime() - 15 * 60 * 1000);

//       if (now < closeTime) {
//         foundSlot = {
//           label: game.label,
//           closesAt: closeTime,
//         };
//         break;
//       }
//     }

//     if (!foundSlot) {
//       const nextSlot = gameTimes[0];
//       const resultTime = new Date();
//       resultTime.setDate(now.getDate() + 1);
//       resultTime.setHours(nextSlot.resultHour, 0, 0, 0);
//       const closeTime = new Date(resultTime.getTime() - 15 * 60 * 1000);
//       foundSlot = {
//         label: nextSlot.label + ' (Tomorrow)',
//         closesAt: closeTime,
//       };
//     }

//     setActiveGameSlot(foundSlot);

//     return () => unsubscribe();
//   }, []);

//   const handleDepositSubmit = async () => {
//     if (!user) return alert('Login required.');
//     const amount = parseFloat(depositAmount);
//     if (isNaN(amount) || amount <= 0 || !transactionId.trim()) {
//       return alert('Invalid deposit details.');
//     }

//     setDepositSubmitting(true);
//     try {
//       await addDoc(collection(db, 'depositRequests'), {
//         uid: user.uid,
//         email: user.email,
//         amount,
//         transactionId: transactionId.trim(),
//         createdAt: serverTimestamp(),
//         status: 'pending',
//       });
//       alert('Deposit request submitted.');
//       setDepositAmount('');
//       setTransactionId('');
//     } catch (err) {
//       alert('Deposit failed.');
//     } finally {
//       setDepositSubmitting(false);
//     }
//   };

//   const handleWithdrawSubmit = async () => {
//     if (!user) return alert('Login required.');

//     const amount = parseFloat(withdrawAmount);
//     if (isNaN(amount) || amount < 200) {
//       setWithdrawError('Minimum withdraw amount is ₹200.');
//       return;
//     }
//     if ((walletBalance ?? 0) < amount) {
//       setWithdrawError('Insufficient wallet balance.');
//       return;
//     }

//     setWithdrawError('');
//     setWithdrawSubmitting(true);
//     try {
//       await addDoc(collection(db, 'withdrawRequests'), {
//         uid: user.uid,
//         email: user.email,
//         amount,
//         createdAt: serverTimestamp(),
//         status: 'pending',
//       });
//       alert('Withdraw request submitted.');
//       setWithdrawAmount('');
//     } catch (err) {
//       alert('Withdraw failed.');
//     } finally {
//       setWithdrawSubmitting(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8">
//         <div className="max-w-xl mx-auto bg-gray-800 rounded-lg shadow-2xl p-6">
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold mb-2">Wallet</h1>
//             <p className="text-lg">
//               Current Balance:{' '}
//               <span className="font-bold text-yellow-400">
//                 ₹{walletBalance?.toFixed(2) ?? '...'}
//               </span>
//             </p>
//           </div>

//           {/* ✅ Show Deposit Form only for Subadmin */}
//           {role === 'subadmin' && (
//             <div className="mb-6">
//               <h2 className="text-xl font-bold mb-2">Add Money</h2>
//               <p className="mb-1">Pay using UPI ID:</p>
//               <p className="font-mono text-yellow-400 mb-2">9435153153@ybl</p>
//               <p className="mb-1">Or Google Pay / PhonePe:</p>
//               <p className="font-mono text-yellow-400 mb-4">+91 9435153153</p>

//               <label className="block mb-2">Transaction ID:</label>
//               <input
//                 type="text"
//                 value={transactionId}
//                 onChange={(e) => setTransactionId(e.target.value)}
//                 className="w-full px-4 py-2 mb-4 bg-gray-700 border border-gray-600 rounded"
//               />

//               <label className="block mb-2">Amount Paid (₹):</label>
//               <input
//                 type="number"
//                 min="1"
//                 value={depositAmount}
//                 onChange={(e) => setDepositAmount(e.target.value)}
//                 className="w-full px-4 py-2 mb-4 bg-gray-700 border border-gray-600 rounded"
//               />

//               <button
//                 onClick={handleDepositSubmit}
//                 disabled={depositSubmitting}
//                 className={`w-full py-3 rounded-md text-black font-semibold transition ${depositSubmitting
//                     ? 'bg-yellow-100 cursor-not-allowed'
//                     : 'bg-yellow-500 hover:bg-yellow-600'
//                   }`}
//               >
//                 {depositSubmitting ? 'Submitting...' : 'Submit Deposit Request'}
//               </button>
//             </div>
//           )}

//           {/* ✅ Show Withdraw Form only for User */}
//           {role === 'user' && (
//             <div className="mb-6">
//               <h2 className="text-xl font-bold mb-2">Withdraw Money</h2>
//               <label className="block mb-2">
//                 Withdraw Amount (₹): Minimum withdraw is ₹200
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 value={withdrawAmount}
//                 onChange={(e) => {
//                   setWithdrawAmount(e.target.value);
//                   setWithdrawError('');
//                 }}
//                 className="w-full px-4 py-2 mb-2 bg-gray-700 border border-gray-600 rounded"
//               />
//               {withdrawError && (
//                 <p className="text-red-500 mb-3 text-sm">{withdrawError}</p>
//               )}

//               <button
//                 onClick={handleWithdrawSubmit}
//                 disabled={withdrawSubmitting}
//                 className={`w-full py-3 rounded-md text-black font-semibold transition ${withdrawSubmitting
//                     ? 'bg-yellow-100 cursor-not-allowed'
//                     : 'bg-yellow-500 hover:bg-yellow-600'
//                   }`}
//               >
//                 {withdrawSubmitting ? 'Submitting...' : 'Submit Withdraw Request'}
//               </button>
//             </div>
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
//   addDoc,
//   serverTimestamp,
//   doc,
//   getDoc,
//   updateDoc,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function PlayBoard() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [walletBalance, setWalletBalance] = useState(null);
//   const [betAmount, setBetAmount] = useState('');
//   const [range, setRange] = useState('0-9');
//   const [selectedNumber, setSelectedNumber] = useState(null);
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState('user');
//   const [submitting, setSubmitting] = useState(false);
//   const [activeGameSlot, setActiveGameSlot] = useState(null);

//   const [depositAmount, setDepositAmount] = useState('');
//   const [transactionId, setTransactionId] = useState('');
//   const [depositSubmitting, setDepositSubmitting] = useState(false);

//   const [withdrawAmount, setWithdrawAmount] = useState('');
//   const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
//   const [withdrawError, setWithdrawError] = useState('');

//   const numberOptions =
//     range === '0-9'
//       ? Array.from({ length: 10 }, (_, i) => i)
//       : Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));

//   const gameTimes = [
//     { label: '1:00 PM', resultHour: 13 },
//     { label: '6:00 PM', resultHour: 18 },
//     { label: '8:00 PM', resultHour: 20 },
//   ];

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       setUser(currentUser);
//       if (currentUser) {
//         // Get role from 'users' collection
//         const userRef = doc(db, 'users', currentUser.uid);
//         const userSnap = await getDoc(userRef);
//         let detectedRole = 'user';

//         if (userSnap.exists()) {
//           const data = userSnap.data();
//           detectedRole = data.role || 'user';
//           setRole(detectedRole);
//         }

//         // Fetch balance from subwallets
//         const walletRef = doc(db, 'subwallets', currentUser.uid);
//         const walletSnap = await getDoc(walletRef);

//         if (walletSnap.exists()) {
//           const bal = walletSnap.data().balance ?? 0;
//           setWalletBalance(bal);
//         } else {
//           await updateDoc(walletRef, {
//             email: currentUser.email,
//             uid: currentUser.uid,
//             balance: 0,
//             createdAt: serverTimestamp(),
//           }).catch(() => {});
//           setWalletBalance(0);
//         }
//       }
//     });

//     const now = new Date();
//     let foundSlot = null;

//     for (let game of gameTimes) {
//       const resultTime = new Date();
//       resultTime.setHours(game.resultHour, 0, 0, 0);
//       const closeTime = new Date(resultTime.getTime() - 15 * 60 * 1000);

//       if (now < closeTime) {
//         foundSlot = {
//           label: game.label,
//           closesAt: closeTime,
//         };
//         break;
//       }
//     }

//     if (!foundSlot) {
//       const nextSlot = gameTimes[0];
//       const resultTime = new Date();
//       resultTime.setDate(now.getDate() + 1);
//       resultTime.setHours(nextSlot.resultHour, 0, 0, 0);
//       const closeTime = new Date(resultTime.getTime() - 15 * 60 * 1000);
//       foundSlot = {
//         label: nextSlot.label + ' (Tomorrow)',
//         closesAt: closeTime,
//       };
//     }

//     setActiveGameSlot(foundSlot);

//     return () => unsubscribe();
//   }, [auth, db]);

//   const handleWithdrawSubmit = async () => {
//     if (!user) {
//       alert('You must be logged in to submit a withdrawal request.');
//       return;
//     }

//     const amount = parseFloat(withdrawAmount);
//     if (isNaN(amount) || amount <= 0) {
//       setWithdrawError('Enter a valid withdraw amount.');
//       return;
//     }

//     if (amount < 200) {
//       setWithdrawError('Minimum withdraw amount is ₹200.');
//       return;
//     }

//     if ((walletBalance ?? 0) < amount) {
//       setWithdrawError('Insufficient wallet balance for withdraw.');
//       return;
//     }

//     setWithdrawError('');
//     setWithdrawSubmitting(true);

//     try {
//       await addDoc(collection(db, 'withdrawRequests'), {
//         uid: user.uid,
//         email: user.email,
//         amount: amount,
//         createdAt: serverTimestamp(),
//         status: 'pending',
//       });
//       alert('Withdraw request submitted! Admin will process it shortly.');
//       setWithdrawAmount('');
//     } catch (error) {
//       console.error('Error submitting withdraw request:', error);
//       alert('Failed to submit withdraw request.');
//     } finally {
//       setWithdrawSubmitting(false);
//     }
//   };

//   const handleDepositSubmit = async () => {
//     if (!user) {
//       alert('You must be logged in to submit a deposit request.');
//       return;
//     }

//     const amount = parseFloat(depositAmount);
//     if (isNaN(amount) || amount <= 0) {
//       alert('Enter valid deposit amount.');
//       return;
//     }

//     if (!transactionId.trim()) {
//       alert('Enter valid transaction ID.');
//       return;
//     }

//     setDepositSubmitting(true);

//     try {
//       await addDoc(collection(db, 'depositRequests'), {
//         uid: user.uid,
//         email: user.email,
//         amount: amount,
//         transactionId: transactionId.trim(),
//         createdAt: serverTimestamp(),
//         status: 'pending',
//       });
//       alert('Deposit request submitted! Admin will verify shortly.');
//       setDepositAmount('');
//       setTransactionId('');
//     } catch (error) {
//       console.error('Error submitting deposit request:', error);
//       alert('Failed to submit deposit request.');
//     } finally {
//       setDepositSubmitting(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-8">
//         <div className="max-w-xl mx-auto bg-gray-800 rounded-lg shadow-2xl p-6">
//           {/* Wallet Balance */}
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold mb-2">Wallet</h1>
//             <p className="text-lg">
//               Current Balance:{' '}
//               <span className="font-bold text-yellow-400">
//                 ₹{walletBalance?.toFixed(2) ?? '...'}
//               </span>
//             </p>
//           </div>

//           {/* Deposit Form (only for subadmin) */}
//           {role === 'subadmin' && (
//             <div className="mb-6">
//               <h2 className="text-xl font-bold mb-2">Add Money</h2>
//               <p className="mb-1">Pay using UPI ID:</p>
//               <p className="font-mono text-yellow-400 mb-2">9435153153@ybl</p>
//               <p className="mb-1">Or Google Pay / PhonePe:</p>
//               <p className="font-mono text-yellow-400 mb-4">+91 9435153153</p>

//               <label className="block mb-2">Transaction ID:</label>
//               <input
//                 type="text"
//                 value={transactionId}
//                 onChange={(e) => setTransactionId(e.target.value)}
//                 className="w-full px-4 py-2 mb-4 bg-gray-700 border border-gray-600 rounded"
//               />

//               <label className="block mb-2">Amount Paid (₹):</label>
//               <input
//                 type="number"
//                 min="1"
//                 value={depositAmount}
//                 onChange={(e) => setDepositAmount(e.target.value)}
//                 className="w-full px-4 py-2 mb-4 bg-gray-700 border border-gray-600 rounded"
//               />

//               <button
//                 onClick={handleDepositSubmit}
//                 disabled={depositSubmitting}
//                 className={`w-full py-3 rounded-md text-black font-semibold transition ${depositSubmitting
//                   ? 'bg-yellow-100 cursor-not-allowed'
//                   : 'bg-yellow-500 hover:bg-yellow-600'
//                   }`}
//               >
//                 {depositSubmitting ? 'Submitting...' : 'Submit Deposit Request'}
//               </button>
//             </div>
//           )}

//           {/* Withdraw Form (all roles) */}
//           <div className="mb-6">
//             <h2 className="text-xl font-bold mb-2">Withdraw Money</h2>
//             <label className="block mb-2">Withdraw Amount (₹): Minimum ₹200</label>
//             <input
//               type="number"
//               min="1"
//               value={withdrawAmount}
//               onChange={(e) => {
//                 setWithdrawAmount(e.target.value);
//                 if (withdrawError) setWithdrawError('');
//               }}
//               className="w-full px-4 py-2 mb-2 bg-gray-700 border border-gray-600 rounded"
//             />
//             {withdrawError && <p className="text-red-500 text-sm mb-2">{withdrawError}</p>}
//             <button
//               onClick={handleWithdrawSubmit}
//               disabled={withdrawSubmitting}
//               className={`w-full py-3 rounded-md text-black font-semibold transition ${withdrawSubmitting
//                 ? 'bg-yellow-100 cursor-not-allowed'
//                 : 'bg-yellow-500 hover:bg-yellow-600'
//                 }`}
//             >
//               {withdrawSubmitting ? 'Submitting...' : 'Submit Withdraw Request'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }

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
} from 'firebase/firestore';
import firebaseApp from '@/firebase';
import Layout from '@/app/Components/Layout';

export default function PlayBoard() {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [role, setRole] = useState('user');

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const [depositAmount, setDepositAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [depositSubmitting, setDepositSubmitting] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState('');
const [paymentDetails, setPaymentDetails] = useState('');


  // 🔍 Get user, role, and wallet
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Get role
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        let userRole = 'user';

        if (userSnap.exists()) {
          userRole = userSnap.data()?.role || 'user';
        }
        setRole(userRole);

        // Get wallet
        const walletRef = doc(db, 'subwallets', currentUser.uid);
        const walletSnap = await getDoc(walletRef);

        if (walletSnap.exists()) {
          setWalletBalance(walletSnap.data().balance ?? 0);
        } else {
          // If wallet doesn't exist, create it
          await updateDoc(walletRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            balance: 0,
            createdAt: serverTimestamp(),
          }).catch(() => {});
          setWalletBalance(0);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Withdraw function
  // const handleWithdrawSubmit = async () => {
  //   if (!user) return alert('Login required.');

  //   const amount = parseFloat(withdrawAmount);
  //   if (isNaN(amount) || amount <= 0) {
  //     return setWithdrawError('Enter a valid amount.');
  //   }

  //   if (amount < 200) {
  //     return setWithdrawError('Minimum withdraw amount is ₹200.');
  //   }

  //   if ((walletBalance ?? 0) < amount) {
  //     return setWithdrawError('Insufficient wallet balance.');
  //   }

  //   setWithdrawError('');
  //   setWithdrawSubmitting(true);

  //   try {
  //     // Deduct from wallet
  //     const walletRef = doc(db, 'subwallets', user.uid);
  //     await updateDoc(walletRef, {
  //       balance: walletBalance - amount,
  //       updatedAt: serverTimestamp(),
  //     });

  //     setWalletBalance((prev) => prev - amount);

  //     // Create withdraw request
  //     await addDoc(collection(db, 'subwithdrawRequests'), {
  //       uid: user.uid,
  //       email: user.email,
  //       amount,
  //       createdAt: serverTimestamp(),
  //       status: 'pending',
  //     });

  //     alert('Withdraw request submitted!');
  //     setWithdrawAmount('');
  //   } catch (err) {
  //     console.error('Withdraw error:', err);
  //     alert('Failed to submit withdraw request.');
  //   } finally {
  //     setWithdrawSubmitting(false);
  //   }
  // };
//     const handleWithdrawSubmit = async () => {
//   if (!user) return alert('Login required.');

//   const amount = parseFloat(withdrawAmount);
//   if (isNaN(amount) || amount <= 0) {
//     return setWithdrawError('Enter a valid amount.');
//   }

//   if (amount < 200) {
//     return setWithdrawError('Minimum withdraw amount is ₹200.');
//   }

//   if (!selectedMethod || !paymentDetails.trim()) {
//     return setWithdrawError('Please select a method and enter your ID.');
//   }

//   if ((walletBalance ?? 0) < amount) {
//     return setWithdrawError('Insufficient wallet balance.');
//   }

//   setWithdrawError('');
//   setWithdrawSubmitting(true);

//   try {
//     const walletRef = doc(db, 'subwallets', user.uid);
//     await updateDoc(walletRef, {
//       balance: walletBalance - amount,
//       updatedAt: serverTimestamp(),
//     });

//     setWalletBalance((prev) => prev - amount);

//     await addDoc(collection(db, 'subwithdrawRequests'), {
//       uid: user.uid,
//       email: user.email,
//       amount,
//       method: selectedMethod,
//       paymentId: paymentDetails.trim(),
//       createdAt: serverTimestamp(),
//       status: 'pending',
//     });

//     alert('Withdraw request submitted!');
//     setWithdrawAmount('');
//     setSelectedMethod('');
//     setPaymentDetails('');
//   } catch (err) {
//     console.error('Withdraw error:', err);
//     alert('Failed to submit withdraw request.');
//   } finally {
//     setWithdrawSubmitting(false);
//   }
// };
// const handleWithdrawSubmit = async () => {
//   if (!user) return alert('Login required.');

//   const amount = parseFloat(withdrawAmount);
//   if (isNaN(amount) || amount <= 0) {
//     return setWithdrawError('Enter a valid amount.');
//   }

//   if (amount < 200) {
//     return setWithdrawError('Minimum withdraw amount is ₹200.');
//   }

//   if (!selectedMethod || !paymentDetails.trim()) {
//     return setWithdrawError('Please select a method and enter your ID.');
//   }

//   if ((walletBalance ?? 0) < amount) {
//     return setWithdrawError('Insufficient wallet balance.');
//   }

//   setWithdrawError('');
//   setWithdrawSubmitting(true);

//   try {
//     // Get subadminId from user profile
//     const userDoc = await getDoc(doc(db, 'users', user.uid));
//     const subAdminId = userDoc.exists() ? userDoc.data().subAdminId || '' : '';

//     // Deduct from wallet
//     const walletRef = doc(db, 'subwallets', user.uid);
//     await updateDoc(walletRef, {
//       balance: walletBalance - amount,
//       updatedAt: serverTimestamp(),
//     });

//     setWalletBalance((prev) => prev - amount);

//     // Add withdraw request
//     await addDoc(collection(db, 'subwithdrawRequests'), {
//       uid: user.uid,
//       email: user.email,
//       amount,
//       method: selectedMethod,
//       paymentId: paymentDetails.trim(),
//       createdAt: serverTimestamp(),
//       status: 'pending',
//       fromSubAdminId: subAdminId  // ✅ important for subadmin to filter
//     });

//     alert('Withdraw request submitted!');
//     setWithdrawAmount('');
//     setSelectedMethod('');
//     setPaymentDetails('');
//   } catch (err) {
//     console.error('Withdraw error:', err);
//     alert('Failed to submit withdraw request.');
//   } finally {
//     setWithdrawSubmitting(false);
//   }
// };

const handleWithdrawSubmit = async () => {
  if (!user) return alert('Login required.');

  const amount = parseFloat(withdrawAmount);
  if (isNaN(amount) || amount <= 0) return setWithdrawError('Enter a valid amount.');
  if (amount < 200) return setWithdrawError('Minimum withdraw amount is ₹200.');
  if (!selectedMethod || !paymentDetails.trim()) return setWithdrawError('Please select a method and enter your ID.');
  if ((walletBalance ?? 0) < amount) return setWithdrawError('Insufficient wallet balance.');

  setWithdrawError('');
  setWithdrawSubmitting(true);

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    const isSubadmin = userData.role === 'subadmin';

    const fromSubAdminId = isSubadmin ? user.uid : userData.subAdminId || '';
    const fromUserSubAdminId = isSubadmin ? '' : userData.subAdminId || '';

    // Deduct from wallet
    const walletRef = doc(db, 'subwallets', user.uid);
    await updateDoc(walletRef, {
      balance: walletBalance - amount,
      updatedAt: serverTimestamp(),
    });

    setWalletBalance((prev) => prev - amount);

    // Add withdraw request
    await addDoc(collection(db, 'subwithdrawRequests'), {
      uid: user.uid,
      email: user.email,
      amount,
      method: selectedMethod,
      paymentId: paymentDetails.trim(),
      createdAt: serverTimestamp(),
      status: 'pending',
      fromSubAdminId,
      fromUserSubAdminId
    });

    alert('Withdraw request submitted!');
    setWithdrawAmount('');
    setSelectedMethod('');
    setPaymentDetails('');
  } catch (err) {
    console.error('Withdraw error:', err);
    alert('Failed to submit withdraw request.');
  } finally {
    setWithdrawSubmitting(false);
  }
};


  // ✅ Deposit function (for subadmin)
  const handleDepositSubmit = async () => {
    if (!user) return alert('Login required.');

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      return alert('Enter a valid deposit amount.');
    }

    if (!transactionId.trim()) {
      return alert('Enter transaction ID.');
    }

    setDepositSubmitting(true);

    try {
      await addDoc(collection(db, 'subdepositRequests'), {
        uid: user.uid,
        email: user.email,
        amount,
        transactionId: transactionId.trim(),
        createdAt: serverTimestamp(),
        status: 'pending',
      });

      alert('Deposit request submitted!');
      setDepositAmount('');
      setTransactionId('');
    } catch (err) {
      console.error('Deposit error:', err);
      alert('Failed to submit deposit request.');
    } finally {
      setDepositSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded shadow-lg">

          {/* ✅ Wallet Balance */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Wallet</h2>
            <p>Current Balance: <span className="text-yellow-400 font-semibold">₹{walletBalance?.toFixed(2)}</span></p>
          </div>

          {/* ✅ Subadmin Deposit */}
          {role === 'subadmin' && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Add Money</h3>
              <p className="mb-1">Pay using UPI ID:</p>
              <p className="text-yellow-400 font-mono mb-2">9435153153@ybl</p>
              <p className="mb-1">Google Pay / PhonePe:</p>
              <p className="text-yellow-400 font-mono mb-4">+91 9435153153</p>

              <input
                type="text"
                placeholder="Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded"
              />

              <input
                type="number"
                placeholder="Amount (₹)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded"
              />

              <button
                onClick={handleDepositSubmit}
                disabled={depositSubmitting}
                className={`w-full py-3 font-semibold text-black rounded ${depositSubmitting ? 'bg-yellow-200' : 'bg-yellow-500 hover:bg-yellow-600'}`}
              >
                {depositSubmitting ? 'Submitting...' : 'Submit Deposit Request'}
              </button>
            </div>
          )}

          {/* ✅ Withdraw Section (All users) */}
          {/* <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">Withdraw Money</h3>

            <label className="block mb-2">Withdraw Amount (Min ₹200)</label>
            <input
              type="number"
              placeholder="Withdraw Amount"
              value={withdrawAmount}
              onChange={(e) => {
                setWithdrawAmount(e.target.value);
                if (withdrawError) setWithdrawError('');
              }}
              className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded"
            />

            {withdrawError && (
              <p className="text-red-500 text-sm mb-2">{withdrawError}</p>
            )}

            <button
              onClick={handleWithdrawSubmit}
              disabled={withdrawSubmitting}
              className={`w-full py-3 font-semibold text-black rounded ${withdrawSubmitting ? 'bg-yellow-200' : 'bg-yellow-500 hover:bg-yellow-600'}`}
            >
              {withdrawSubmitting ? 'Submitting...' : 'Submit Withdraw Request'}
            </button>
          </div> */}
          {/* ✅ Withdraw Section (All users) */}
<div className="mb-6">
  <h3 className="text-xl font-bold mb-2">Withdraw Money</h3>

  <label className="block mb-2">Withdraw Amount (Min ₹200)</label>
  <input
    type="number"
    placeholder="Withdraw Amount"
    value={withdrawAmount}
    onChange={(e) => {
      setWithdrawAmount(e.target.value);
      if (withdrawError) setWithdrawError('');
    }}
    className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded"
  />

  <label className="block mb-2">Select Payment Method</label>
  <select
    value={selectedMethod}
    onChange={(e) => setSelectedMethod(e.target.value)}
    className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded"
  >
    <option value="">-- Select Method --</option>
    <option value="UPI">UPI</option>
    <option value="PhonePe">PhonePe</option>
    <option value="Google Pay">Google Pay</option>
    <option value="Paytm">Paytm</option>
  </select>

  <label className="block mb-2">Your {selectedMethod || 'Payment'} ID</label>
  <input
    type="text"
    placeholder={`Enter your ${selectedMethod || 'Payment'} ID`}
    value={paymentDetails}
    onChange={(e) => setPaymentDetails(e.target.value)}
    className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded"
  />

  {withdrawError && (
    <p className="text-red-500 text-sm mb-3">{withdrawError}</p>
  )}

  <button
    onClick={handleWithdrawSubmit}
    disabled={withdrawSubmitting}
    className={`w-full py-3 font-semibold text-black rounded ${withdrawSubmitting ? 'bg-yellow-200' : 'bg-yellow-500 hover:bg-yellow-600'}`}
  >
    {withdrawSubmitting ? 'Submitting...' : 'Submit Withdraw Request'}
  </button>
</div>

        </div>
      </div>
    </Layout>
  );
}
