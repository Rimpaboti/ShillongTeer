// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   orderBy,
// } from 'firebase/firestore';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function Page() {
//   const db = getFirestore(firebaseApp);
//   const auth = getAuth(firebaseApp);

//   const [date, setDate] = useState('');
//   const [slot, setSlot] = useState('4:00 PM'); // default updated
//   const [range, setRange] = useState('0-9');
//   const [numberSummary, setNumberSummary] = useState({});
//   const [userBets, setUserBets] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [role, setRole] = useState(null);
//   const [uid, setUid] = useState(null);
//   const [viewMode, setViewMode] = useState('summary');

//   // Only two slots now
//   const slots = ['4:00 PM', '5:00 PM'];

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setUid(user.uid);
//         const userDocSnap = await getDocs(
//           query(collection(db, 's_users'), where('uid', '==', user.uid))
//         );
//         if (!userDocSnap.empty) {
//           // const userData = userDocSnap.docs.data();
//           const userData = userDocSnap.docs[0].data();
//           setRole(userData.role);
//         }
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleFetchData = async () => {
//     if (!date || !slot || !range || !role) {
//       alert('Please fill all fields and ensure role is loaded.');
//       return;
//     }

//     setLoading(true);
//     setNumberSummary({});
//     setUserBets([]);

//     try {
//       // yyyy-mm-dd -> dd/mm/yyyy for 'day' field
//       const [yyyy, mm, dd] = date.split('-');
//       const formattedDay = `${dd}/${mm}/${yyyy}`; // dd/mm/yyyy

//       const filters = [
//         where('day', '==', formattedDay),
//         where('gameSlot', '==', slot),
//         where('range', '==', range),
//         orderBy('createdAt', 'desc'),
//       ];

//       if (role === 'subadmin') {
//         filters.push(where('subAdminId', '==', uid));
//       }

//       const q = query(collection(db, 's_subbets'), ...filters);
//       const snap = await getDocs(q);
//       const results = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

//       if (viewMode === 'summary') {
//         const numberMap = {};
//         const isDoubleDigit = range === '00-99';
//         const max = isDoubleDigit ? 100 : 10;

//         for (let i = 0; i < max; i++) {
//           const num = isDoubleDigit ? i.toString().padStart(2, '0') : i.toString();
//           numberMap[num] = 0;
//         }

//         for (const bet of results) {
//           const key = isDoubleDigit
//             ? bet.number.toString().padStart(2, '0')
//             : bet.number.toString();
//           if (Object.prototype.hasOwnProperty.call(numberMap, key)) {
//             numberMap[key] += bet.amount || 0;
//           }
//         }

//         setNumberSummary(numberMap);
//       } else {
//         setUserBets(results);
//       }
//     } catch (err) {
//       console.error(err);
//       alert('Error fetching data. Check Firestore indexes.');
//     }

//     setLoading(false);
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
//         <div className="max-w-4xl mx-auto">
//           <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
//             {role === 'subadmin' ? 'Subadmin' : 'Admin'}: Live Bets Dashboard
//           </h1>

//           <div className="flex flex-wrap gap-4 justify-center mb-6">
//             <button
//               onClick={() => setViewMode('summary')}
//               className={`px-4 py-2 rounded font-semibold transition ${
//                 viewMode === 'summary'
//                   ? 'bg-yellow-400 text-black'
//                   : 'bg-gray-700 text-white hover:bg-gray-600'
//               }`}
//             >
//               📊 Live Summary
//             </button>
//             <button
//               onClick={() => setViewMode('user')}
//               className={`px-4 py-2 rounded font-semibold transition ${
//                 viewMode === 'user'
//                   ? 'bg-yellow-400 text-black'
//                   : 'bg-gray-700 text-white hover:bg-gray-600'
//               }`}
//             >
//               👤 User Bets
//             </button>
//           </div>

//           <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl mb-6">
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
//               <div>
//                 <label className="block mb-1">Date:</label>
//                 <input
//                   type="date"
//                   value={date}
//                   onChange={(e) => setDate(e.target.value)}
//                   className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
//                 />
//               </div>
//               <div>
//                 <label className="block mb-1">Slot:</label>
//                 <select
//                   value={slot}
//                   onChange={(e) => setSlot(e.target.value)}
//                   className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
//                 >
//                   {slots.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block mb-1">Range:</label>
//                 <select
//                   value={range}
//                   onChange={(e) => setRange(e.target.value)}
//                   className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
//                 >
//                   <option value="0-9">0 - 9</option>
//                   <option value="00-99">00 - 99</option>
//                 </select>
//               </div>
//             </div>

//             <button
//               onClick={handleFetchData}
//               disabled={loading}
//               className={`w-full py-3 rounded-md text-black font-semibold transition ${
//                 loading
//                   ? 'bg-yellow-100 cursor-not-allowed'
//                   : 'bg-yellow-400 hover:bg-yellow-500'
//               }`}
//             >
//               {loading
//                 ? 'Loading...'
//                 : viewMode === 'summary'
//                 ? 'Show Live Summary'
//                 : 'Show User Bets'}
//             </button>
//           </div>

//           {viewMode === 'summary' && Object.keys(numberSummary).length > 0 && (
//             <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
//               <h2 className="text-xl font-bold mb-4 text-center">
//                 Total Amount Bet Per Number
//               </h2>
//               {(() => {
//                 const entries = Object.entries(numberSummary);
//                 const sorted = entries.sort((a, b) => b[11] - a[11]);
//                 const totalAmount = sorted.reduce((sum, [, amt]) => sum + amt, 0);

//                 return (
//                   <>
//                     <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-4 text-center">
//                       {sorted.map(([num, amount], index) => {
//                         let bgClass = 'bg-gray-700 border-gray-600 text-yellow-400';
//                         if (index === 0 && amount > 0) bgClass = 'bg-red-700 border-red-500 text-white';
//                         else if (index === 1 && amount > 0) bgClass = 'bg-orange-600 border-orange-500 text-white';
//                         else if (index === 2 && amount > 0) bgClass = 'bg-yellow-500 border-yellow-400 text-black';

//                         return (
//                           <div key={num} className={`p-3 rounded border ${bgClass}`}>
//                             <p className="font-bold text-lg">{num}</p>
//                             <p className="font-semibold">₹{amount}</p>
//                           </div>
//                         );
//                       })}
//                     </div>
//                     <div className="mt-6 text-center text-xl font-bold text-green-400">
//                       Total Bet Amount: ₹{totalAmount}
//                     </div>
//                   </>
//                 );
//               })()}
//             </div>
//           )}

//           {viewMode === 'user' && userBets.length > 0 && (
//             <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
//               <h2 className="text-xl font-bold mb-4 text-center">User Bets List</h2>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {userBets.map((bet) => (
//                   <div
//                     key={bet.id}
//                     className="border border-gray-600 p-4 rounded bg-gray-700"
//                   >
//                     <p><span className="font-bold">User:</span> {bet.email || 'N/A'}</p>
//                     <p><span className="font-bold">Number:</span> {bet.number}</p>
//                     <p><span className="font-bold">Amount:</span> ₹{bet.amount}</p>
//                     <p><span className="font-bold">Time:</span> {bet.time || '—'}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {!loading && ((viewMode === 'summary' && Object.keys(numberSummary).length === 0) || (viewMode === 'user' && userBets.length === 0)) && (
//             <p className="text-gray-400 text-center">
//               No data found. Choose filters and click the button above.
//             </p>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseApp from '@/firebase';
import Layout from '@/app/Components/Layout';

export default function Page() {
  const db = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('4:00 PM'); // default
  const [range, setRange] = useState('0-9');
  const [numberSummary, setNumberSummary] = useState({});
  const [userBets, setUserBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null);
  const [uid, setUid] = useState(null);
  const [viewMode, setViewMode] = useState('summary');

  // Only two slots
  const slots = ['4:00 PM', '5:00 PM'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const userSnap = await getDocs(
          query(collection(db, 's_users'), where('uid', '==', user.uid))
        );
        if (!userSnap.empty) {
          // const userData = userSnap.docs.data(); // correct: index then data()
          const userData = userSnap.docs[0].data();
          setRole(userData.role);
        } else {
          setRole(null);
        }
      } else {
        setUid(null);
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  const handleFetchData = async () => {
    if (!date || !slot || !range || !role) {
      alert('Please fill all fields and ensure role is loaded.');
      return;
    }

    setLoading(true);
    setNumberSummary({});
    setUserBets([]);

    try {
      // yyyy-mm-dd -> dd/mm/yyyy
      const [yyyy, mm, dd] = date.split('-');
      const formattedDay = `${dd}/${mm}/${yyyy}`;

      const filters = [
        where('day', '==', formattedDay),
        where('gameSlot', '==', slot),
        where('range', '==', range),
        orderBy('createdAt', 'desc'),
      ];
      if (role === 'subadmin') {
        filters.push(where('subAdminId', '==', uid));
      }

      const qRef = query(collection(db, 's_subbets'), ...filters);
      const snap = await getDocs(qRef);
      const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (viewMode === 'summary') {
        // Build number buckets
        const numberMap = {};
        const isDoubleDigit = range === '00-99';
        const max = isDoubleDigit ? 100 : 10;

        for (let i = 0; i < max; i++) {
          const key = isDoubleDigit ? i.toString().padStart(2, '0') : i.toString();
          numberMap[key] = 0;
        }
        for (const bet of results) {
          const key = isDoubleDigit
            ? bet.number.toString().padStart(2, '0')
            : bet.number.toString();
          if (Object.prototype.hasOwnProperty.call(numberMap, key)) {
            numberMap[key] += bet.amount || 0;
          }
        }
        setNumberSummary(numberMap);
      } else {
        setUserBets(results);
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching data. Check Firestore indexes.');
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
            {role === 'subadmin' ? 'Subadmin' : 'Admin'}: Live Bets Dashboard
          </h1>

          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 rounded font-semibold transition ${
                viewMode === 'summary'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              📊 Live Summary
            </button>
            <button
              onClick={() => setViewMode('user')}
              className={`px-4 py-2 rounded font-semibold transition ${
                viewMode === 'user'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              👤 User Bets
            </button>
          </div>

          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block mb-1">Date:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Slot:</label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                >
                  {slots.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Range:</label>
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                >
                  <option value="0-9">0 - 9</option>
                  <option value="00-99">00 - 99</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleFetchData}
              disabled={loading}
              className={`w-full py-3 rounded-md text-black font-semibold transition ${
                loading
                  ? 'bg-yellow-100 cursor-not-allowed'
                  : 'bg-yellow-400 hover:bg-yellow-500'
              }`}
            >
              {loading
                ? 'Loading...'
                : viewMode === 'summary'
                ? 'Show Live Summary'
                : 'Show User Bets'}
            </button>
          </div>

          {viewMode === 'summary' && Object.keys(numberSummary).length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
              <h2 className="text-xl font-bold mb-4 text-center">
                Total Amount Bet Per Number
              </h2>
              {(() => {
                const entries = Object.entries(numberSummary);
                // Correct comparator: sort by value (amount) descending
                const sorted = entries.sort(([, va], [, vb]) => vb - va);
                const totalAmount = sorted.reduce((sum, [, amt]) => sum + amt, 0);

                return (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-10 gap-4 text-center">
                      {sorted.map(([num, amount], index) => {
                        let bgClass = 'bg-gray-700 border-gray-600 text-yellow-400';
                        if (index === 0 && amount > 0) bgClass = 'bg-red-700 border-red-500 text-white';
                        else if (index === 1 && amount > 0) bgClass = 'bg-orange-600 border-orange-500 text-white';
                        else if (index === 2 && amount > 0) bgClass = 'bg-yellow-500 border-yellow-400 text-black';

                        return (
                          <div key={num} className={`p-3 rounded border ${bgClass}`}>
                            <p className="font-bold text-lg">{num}</p>
                            <p className="font-semibold">₹{amount}</p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6 text-center text-xl font-bold text-green-400">
                      Total Bet Amount: ₹{totalAmount}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {viewMode === 'user' && userBets.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
              <h2 className="text-xl font-bold mb-4 text-center">User Bets List</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userBets.map((bet) => (
                  <div
                    key={bet.id}
                    className="border border-gray-600 p-4 rounded bg-gray-700"
                  >
                    <p><span className="font-bold">User:</span> {bet.email || 'N/A'}</p>
                    <p><span className="font-bold">Number:</span> {bet.number}</p>
                    <p><span className="font-bold">Amount:</span> ₹{bet.amount}</p>
                    <p><span className="font-bold">Time:</span> {bet.time || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && ((viewMode === 'summary' && Object.keys(numberSummary).length === 0) || (viewMode === 'user' && userBets.length === 0)) && (
            <p className="text-gray-400 text-center">
              No data found. Choose filters and click the button above.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
