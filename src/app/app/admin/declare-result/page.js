// 'use client';

// import React, { useState } from 'react';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   addDoc,
//   doc,
//   runTransaction,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function DeclareResultPage() {
//   const db = getFirestore(firebaseApp);

//   const [day, setDay] = useState('');
//   const [gameSlot, setGameSlot] = useState('');
//   const [range, setRange] = useState('0-9');
//   const [winningNumber, setWinningNumber] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const handleDeclare = async () => {
//     if (!day || !gameSlot || !range || String(winningNumber).trim() === '') {
//       alert('Please fill all fields.');
//       return;
//     }

//     const winningNum = range === '0-9' ? parseInt(winningNumber) : winningNumber;

//     if (range === '0-9') {
//       if (isNaN(winningNum) || winningNum < 0 || winningNum > 9) {
//         alert('Winning number must be between 0 - 9.');
//         return;
//       }
//     } else {
//       if (!/^\d{2}$/.test(winningNumber)) {
//         alert('Winning number must be two digits (00 - 99).');
//         return;
//       }
//     }

//     setSubmitting(true);

//     try {
//       // Step 1: Check if result already declared
//       const resultsRef = collection(db, 'results');
//       const checkQuery = query(
//         resultsRef,
//         where('day', '==', day),
//         where('gameSlot', '==', gameSlot),
//         where('range', '==', range)
//       );
//       const existing = await getDocs(checkQuery);

//       if (!existing.empty) {
//         alert('Result already declared for this day, slot and range.');
//         setSubmitting(false);
//         return;
//       }

//       // Step 2: Get all bets for this slot
//       const betsRef = collection(db, 'subbets');
//       const betsQuery = query(
//         betsRef,
//         where('day', '==', day),
//         where('gameSlot', '==', gameSlot),
//         where('range', '==', range)
//       );
//       const betsSnap = await getDocs(betsQuery);

//       if (betsSnap.empty) {
//         alert('No bets found for this slot.');
//         setSubmitting(false);
//         return;
//       }

//       console.log('Winning Number:', winningNum);
//       console.log('Bets:', betsSnap.docs.map((doc) => doc.data()));

//       // Step 3: Run transaction
//       // await runTransaction(db, async (transaction) => {
//       //   for (const betDoc of betsSnap.docs) {
//       //     const bet = betDoc.data();
//       //     const isWinner = String(bet.number) === String(winningNum);

//       //     if (!bet.uid) {
//       //       throw new Error(`Missing UID for bet: ${betDoc.id}`);
//       //     }

//       //     const walletRef = doc(db, 'wallets', bet.uid);
//       //     let newBalance = 0;

//       //     if (isWinner) {
//       //       const multiplier = range === '0-9' ? 9 : 60;
//       //       const winAmount = bet.amount * multiplier;

//       //       const walletSnap = await transaction.get(walletRef);
//       //       const currentBal = walletSnap.exists() ? walletSnap.data().balance || 0 : 0;
//       //       newBalance = currentBal + winAmount;

//       //       transaction.set(walletRef, {
//       //         balance: newBalance,
//       //         updatedAt: serverTimestamp(),
//       //       }, { merge: true });

//       //       transaction.update(betDoc.ref, {
//       //         result: 'won',
//       //         winningNumber: winningNum,
//       //         winAmount: winAmount,
//       //         resultDeclaredAt: serverTimestamp(),
//       //       });
//       //     } else {
//       //       transaction.update(betDoc.ref, {
//       //         result: 'lost',
//       //         winningNumber: winningNum,
//       //         resultDeclaredAt: serverTimestamp(),
//       //       });
//       //     }
//       //   }
//       // });
//       await runTransaction(db, async (transaction) => {
//         const walletsToUpdate = new Map();

//         // 1. First read everything
//         for (const betDoc of betsSnap.docs) {
//           const bet = betDoc.data();

//           if (!bet.uid) {
//             throw new Error(`Missing UID for bet: ${betDoc.id}`);
//           }

//           if (String(bet.number) === String(winningNum)) {
//             const walletRef = doc(db, 'wallets', bet.uid);
//             if (!walletsToUpdate.has(bet.uid)) {
//               const walletSnap = await transaction.get(walletRef);
//               walletsToUpdate.set(bet.uid, {
//                 ref: walletRef,
//                 balance: walletSnap.exists() ? walletSnap.data().balance || 0 : 0,
//               });
//             }
//           }
//         }

//         // 2. Then perform writes
//         for (const betDoc of betsSnap.docs) {
//           const bet = betDoc.data();
//           const isWinner = String(bet.number) === String(winningNum);

//           if (!bet.uid) {
//             throw new Error(`Missing UID for bet: ${betDoc.id}`);
//           }

//           if (isWinner) {
//             const multiplier = range === '0-9' ? 9 : 60;
//             const winAmount = bet.amount * multiplier;
//             const walletData = walletsToUpdate.get(bet.uid);

//             const newBalance = walletData.balance + winAmount;

//             transaction.set(walletData.ref, {
//               balance: newBalance,
//               updatedAt: serverTimestamp(),
//             }, { merge: true });

//             transaction.update(betDoc.ref, {
//               result: 'won',
//               winningNumber: winningNum,
//               winAmount: winAmount,
//               resultDeclaredAt: serverTimestamp(),
//             });
//           } else {
//             transaction.update(betDoc.ref, {
//               result: 'lost',
//               winningNumber: winningNum,
//               resultDeclaredAt: serverTimestamp(),
//             });
//           }
//         }
//       });

//       // Step 4: Store declared result
//       await addDoc(resultsRef, {
//         day: day,
//         gameSlot: gameSlot,
//         range: range,
//         winningNumber: winningNum,
//         declaredAt: serverTimestamp(),
//       });

//       alert('Result declared & winnings distributed!');
//       setWinningNumber('');
//     } catch (error) {
//       console.error('Error declaring result:', error);
//       alert('Error declaring result.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDateChange = (e) => {
//     const iso = e.target.value;
//     const [yyyy, mm, dd] = iso.split('-');
//     const formatted = `${dd}/${mm}/${yyyy}`;
//     setDay(formatted);
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
//         <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
//           <h1 className="text-2xl font-bold mb-6">Admin: Declare Result</h1>

//           <div className="mb-4">
//             <label className="block mb-1">Day (dd/mm/yyyy)</label>
//             <input
//               type="date"
//               value={day ? day.split('/').reverse().join('-') : ''}
//               onChange={handleDateChange}
//               className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block mb-1">Game Slot</label>
//             <select
//               value={gameSlot}
//               onChange={(e) => setGameSlot(e.target.value)}
//               className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
//             >
//               <option value="">Select Game Slot</option>
//               <option value="1:00 PM">1:00 PM</option>
//               <option value="6:00 PM">6:00 PM</option>
//               <option value="8:00 PM">8:00 PM</option>
//             </select>
//           </div>

//           <div className="mb-4">
//             <label className="block mb-1">Range</label>
//             <select
//               value={range}
//               onChange={(e) => setRange(e.target.value)}
//               className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
//             >
//               <option value="0-9">0-9</option>
//               <option value="00-99">00-99</option>
//             </select>
//           </div>

//           <div className="mb-6">
//             <label className="block mb-1">Winning Number</label>
//             <input
//               type="text"
//               value={winningNumber}
//               onChange={(e) => setWinningNumber(e.target.value)}
//               placeholder={range === '0-9' ? '0 - 9' : '00 - 99'}
//               className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
//             />
//           </div>

//           <button
//             onClick={handleDeclare}
//             disabled={submitting}
//             className={`w-full py-3 rounded-md font-semibold text-black ${submitting
//                 ? 'bg-yellow-100 cursor-not-allowed'
//                 : 'bg-yellow-400 hover:bg-yellow-500'
//               }`}
//           >
//             {submitting ? 'Declaring...' : 'Declare Result'}
//           </button>
//         </div>
//       </div>
//     </Layout>
//   );
// }


// 'use client';

// import React, { useState } from 'react';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   addDoc,
//   doc,
//   runTransaction,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function DeclareResultPage() {
//   const db = getFirestore(firebaseApp);

//   const [day, setDay] = useState('');
//   const [gameSlot, setGameSlot] = useState('');
//   const [range, setRange] = useState('0-9');
//   const [winningNumber, setWinningNumber] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const handleDeclare = async () => {
//     if (!day || !gameSlot || !range || String(winningNumber).trim() === '') {
//       alert('Please fill all fields.');
//       return;
//     }

//     const winningNum = range === '0-9' ? parseInt(winningNumber) : winningNumber;

//     if (range === '0-9') {
//       if (isNaN(winningNum) || winningNum < 0 || winningNum > 9) {
//         alert('Winning number must be between 0 - 9.');
//         return;
//       }
//     } else {
//       if (!/^\d{2}$/.test(winningNumber)) {
//         alert('Winning number must be two digits (00 - 99).');
//         return;
//       }
//     }

//     setSubmitting(true);

//     try {
//       const resultsRef = collection(db, 'results');
//       const checkQuery = query(
//         resultsRef,
//         where('day', '==', day),
//         where('gameSlot', '==', gameSlot),
//         where('range', '==', range)
//       );
//       const existing = await getDocs(checkQuery);

//       if (!existing.empty) {
//         alert('Result already declared for this day, slot and range.');
//         setSubmitting(false);
//         return;
//       }

//       const betsRef = collection(db, 'subbets');
//       const betsQuery = query(
//         betsRef,
//         where('day', '==', day),
//         where('gameSlot', '==', gameSlot),
//         where('range', '==', range)
//       );
//       const betsSnap = await getDocs(betsQuery);

//       if (betsSnap.empty) {
//         alert('No bets found for this slot.');
//         setSubmitting(false);
//         return;
//       }

//       await runTransaction(db, async (transaction) => {
//         const walletsToUpdate = new Map();

//         // 1. First read all winning wallets
//         for (const betDoc of betsSnap.docs) {
//           const bet = betDoc.data();
//           if (!bet.uid) throw new Error(`Missing UID for bet: ${betDoc.id}`);

//           if (String(bet.number) === String(winningNum)) {
//             const walletRef = doc(db, 'subwallets', bet.uid);
//             if (!walletsToUpdate.has(bet.uid)) {
//               const walletSnap = await transaction.get(walletRef);
//               walletsToUpdate.set(bet.uid, {
//                 ref: walletRef,
//                 balance: walletSnap.exists() ? walletSnap.data().balance || 0 : 0,
//               });
//             }
//           }
//         }

//         // 2. Perform wallet updates + bet updates
//         for (const betDoc of betsSnap.docs) {
//           const bet = betDoc.data();
//           const isWinner = String(bet.number) === String(winningNum);
//           if (!bet.uid) throw new Error(`Missing UID for bet: ${betDoc.id}`);

//           if (isWinner) {
//             const multiplier = range === '0-9' ? 9 : 60;
//             const winAmount = bet.amount * multiplier;
//             const walletData = walletsToUpdate.get(bet.uid);
//             const newBalance = walletData.balance + winAmount;

//             transaction.set(walletData.ref, {
//               balance: newBalance,
//               updatedAt: serverTimestamp(),
//             }, { merge: true });

//             transaction.update(betDoc.ref, {
//               result: 'won',
//               winningNumber: winningNum,
//               winAmount: winAmount,
//               resultDeclaredAt: serverTimestamp(),
//             });
//           } else {
//             transaction.update(betDoc.ref, {
//               result: 'lost',
//               winningNumber: winningNum,
//               resultDeclaredAt: serverTimestamp(),
//             });
//           }
//         }
//       });

//       await addDoc(resultsRef, {
//         day: day,
//         gameSlot: gameSlot,
//         range: range,
//         winningNumber: winningNum,
//         declaredAt: serverTimestamp(),
//       });

//       alert('Result declared & winnings distributed!');
//       setWinningNumber('');
//     } catch (error) {
//       console.error('Error declaring result:', error);
//       alert('Error declaring result.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDateChange = (e) => {
//     const iso = e.target.value;
//     const [yyyy, mm, dd] = iso.split('-');
//     const formatted = `${dd}/${mm}/${yyyy}`;
//     setDay(formatted);
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
//         <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
//           <h1 className="text-2xl font-bold mb-6">Admin: Declare Result</h1>

//           <div className="mb-4">
//             <label className="block mb-1">Day (dd/mm/yyyy)</label>
//             <input
//               type="date"
//               value={day ? day.split('/').reverse().join('-') : ''}
//               onChange={handleDateChange}
//               className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block mb-1">Game Slot</label>
//             <select
//               value={gameSlot}
//               onChange={(e) => setGameSlot(e.target.value)}
//               className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
//             >
//               <option value="">Select Game Slot</option>
//               <option value="1:00 PM">1:00 PM</option>
//               <option value="6:00 PM">6:00 PM</option>
//               <option value="8:00 PM">8:00 PM</option>
//             </select>
//           </div>

//           <div className="mb-4">
//             <label className="block mb-1">Range</label>
//             <select
//               value={range}
//               onChange={(e) => setRange(e.target.value)}
//               className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
//             >
//               <option value="0-9">0-9</option>
//               <option value="00-99">00-99</option>
//             </select>
//           </div>

//           <div className="mb-6">
//             <label className="block mb-1">Winning Number</label>
//             <input
//               type="text"
//               value={winningNumber}
//               onChange={(e) => setWinningNumber(e.target.value)}
//               placeholder={range === '0-9' ? '0 - 9' : '00 - 99'}
//               className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
//             />
//           </div>

//           <button
//             onClick={handleDeclare}
//             disabled={submitting}
//             className={`w-full py-3 rounded-md font-semibold text-black ${
//               submitting
//                 ? 'bg-yellow-100 cursor-not-allowed'
//                 : 'bg-yellow-400 hover:bg-yellow-500'
//             }`}
//           >
//             {submitting ? 'Declaring...' : 'Declare Result'}
//           </button>
//         </div>
//       </div>
//     </Layout>
//   );
// }

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

  const handleDeclare = async () => {
    if (!day || !gameSlot || !range || String(winningNumber).trim() === '') {
      alert('Please fill all fields.');
      return;
    }

    const winningNum = range === '0-9' ? parseInt(winningNumber) : winningNumber;

    if (range === '0-9') {
      if (isNaN(winningNum) || winningNum < 0 || winningNum > 9) {
        alert('Winning number must be between 0 - 9.');
        return;
      }
    } else {
      if (!/^\d{2}$/.test(winningNumber)) {
        alert('Winning number must be two digits (00 - 99).');
        return;
      }
    }

    setSubmitting(true);

    try {
      // const resultsRef = collection(db, 'results');
      const resultsRef = collection(db, 'subresults');
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

      const betsRef = collection(db, 'subbets'); // 👈 updated collection
      const betsQuery = query(
        betsRef,
        where('day', '==', day),
        where('gameSlot', '==', gameSlot),
        where('range', '==', range)
      );
      const betsSnap = await getDocs(betsQuery);

      if (betsSnap.empty) {
        alert('No bets found for this slot.');
        setSubmitting(false);
        return;
      }

      await runTransaction(db, async (transaction) => {
        const walletsToUpdate = new Map();

        for (const betDoc of betsSnap.docs) {
          const bet = betDoc.data();
          if (!bet.uid) throw new Error(`Missing UID for bet: ${betDoc.id}`);

          if (String(bet.number) === String(winningNum)) {
            const walletRef = doc(db, 'subwallets', bet.uid); // 👈 updated collection
            if (!walletsToUpdate.has(bet.uid)) {
              const walletSnap = await transaction.get(walletRef);
              walletsToUpdate.set(bet.uid, {
                ref: walletRef,
                balance: walletSnap.exists() ? walletSnap.data().balance || 0 : 0,
              });
            }
          }
        }

        for (const betDoc of betsSnap.docs) {
          const bet = betDoc.data();
          const isWinner = String(bet.number) === String(winningNum);

          if (!bet.uid) throw new Error(`Missing UID for bet: ${betDoc.id}`);

          if (isWinner) {
            const multiplier = range === '0-9' ? 9 : 60;
            const winAmount = bet.amount * multiplier;
            const walletData = walletsToUpdate.get(bet.uid);
            const newBalance = walletData.balance + winAmount;

            transaction.set(walletData.ref, {
              balance: newBalance,
              updatedAt: serverTimestamp(),
            }, { merge: true });

            transaction.update(betDoc.ref, {
              result: 'won',
              winningNumber: winningNum,
              winAmount,
              resultDeclaredAt: serverTimestamp(),
            });
          } else {
            transaction.update(betDoc.ref, {
              result: 'lost',
              winningNumber: winningNum,
              resultDeclaredAt: serverTimestamp(),
            });
          }
        }
      });

      await addDoc(resultsRef, {
        day,
        gameSlot,
        range,
        winningNumber: winningNum,
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
              <option value="1:00 PM">1:00 PM</option>
              <option value="6:00 PM">6:00 PM</option>
              <option value="8:00 PM">8:00 PM</option>
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
