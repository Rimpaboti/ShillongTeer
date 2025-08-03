// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   doc,
//   getDoc,
//   updateDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function ReferralPage() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [user, setUser] = useState(null);
//   const [wallet, setWallet] = useState(null);
//   const [referralCode, setReferralCode] = useState('');
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);

//         // Get current user wallet
//         const walletRef = doc(db, 'wallets', currentUser.uid);
//         const walletSnap = await getDoc(walletRef);

//         if (walletSnap.exists()) {
//           setWallet(walletSnap.data());
//         } else {
//           // Create wallet if doesn't exist
//           await updateDoc(walletRef, {
//             uid: currentUser.uid,
//             email: currentUser.email,
//             balance: 0,
//             createdAt: serverTimestamp(),
//           }).catch(() => {});
//           setWallet({ balance: 0 });
//         }
//       }
//     });

//     return () => unsubscribe();
//   }, [auth, db]);

//   const handleApplyReferral = async () => {
//     if (!user) {
//       setMessage('Please log in.');
//       return;
//     }

//     if (wallet?.referralUsed) {
//       setMessage('You have already used a referral code.');
//       return;
//     }

//     if (referralCode === user.uid) {
//       setMessage('You cannot use your own code.');
//       return;
//     }

//     const referrerWalletRef = doc(db, 'wallets', referralCode);
//     const referrerSnap = await getDoc(referrerWalletRef);

//     if (!referrerSnap.exists()) {
//       setMessage('Invalid referral code.');
//       return;
//     }

//     try {
//       // Credit referrer +50
//       const referrerData = referrerSnap.data();
//       await updateDoc(referrerWalletRef, {
//         balance: (referrerData.balance ?? 0) + 50,
//         updatedAt: serverTimestamp(),
//       });

//       // Credit current user +50 & mark as used
//       const myWalletRef = doc(db, 'wallets', user.uid);
//       await updateDoc(myWalletRef, {
//         balance: (wallet?.balance ?? 0) + 50,
//         referralUsed: true,
//         updatedAt: serverTimestamp(),
//       });

//       setWallet((prev) => ({
//         ...prev,
//         balance: (prev?.balance ?? 0) + 50,
//         referralUsed: true,
//       }));

//       setMessage('Referral applied! ₹50 added to you and your referrer.');
//     } catch (error) {
//       console.error(error);
//       setMessage('Something went wrong.');
//     }
//   };

//   return (
//     <Layout>
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
//       <div className="bg-gray-800 p-6 rounded shadow w-full max-w-md">
//         <h1 className="text-xl font-bold mb-4">Refer & Earn</h1>

//         <p className="mb-2">
//           Your Referral Code:{' '}
//           <span className="text-yellow-400">{user?.uid}</span>
//         </p>

//         <label className="block mb-2">Have a referral code?</label>
//         <input
//           type="text"
//           value={referralCode}
//           onChange={(e) => setReferralCode(e.target.value)}
//           placeholder="Enter referral code"
//           className="w-full px-4 py-2 bg-gray-700 border border-gray-600 mb-4 rounded"
//         />

//         <button
//           onClick={handleApplyReferral}
//           className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded"
//         >
//           Apply Code
//         </button>

//         <p className="mt-4 text-sm">{message}</p>
//       </div>
//     </div>
//     </Layout>
//   );
// }

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   doc,
//   getDoc,
//   updateDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import firebaseApp from '@/firebase';
// import Layout from '@/app/Components/Layout';

// export default function ReferralPage() {
//   const auth = getAuth(firebaseApp);
//   const db = getFirestore(firebaseApp);

//   const [user, setUser] = useState(null);
//   const [wallet, setWallet] = useState(null);
//   const [referralCode, setReferralCode] = useState('');
//   const [message, setMessage] = useState('');
//   const [copySuccess, setCopySuccess] = useState('');

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);

//         const walletRef = doc(db, 'wallets', currentUser.uid);
//         const walletSnap = await getDoc(walletRef);

//         if (walletSnap.exists()) {
//           setWallet(walletSnap.data());
//         } else {
//           // If wallet doesn't exist, create a new one
//           await updateDoc(walletRef, {
//             uid: currentUser.uid,
//             email: currentUser.email,
//             balance: 0,
//             createdAt: serverTimestamp(),
//           }).catch(() => {});
//           setWallet({ balance: 0 });
//         }
//       }
//     });

//     return () => unsubscribe();
//   }, [auth, db]);

//   const handleApplyReferral = async () => {
//     if (!user) {
//       setMessage('Please log in.');
//       return;
//     }

//     if (wallet?.referralUsed) {
//       setMessage('You have already used a referral code.');
//       return;
//     }

//     if (referralCode === user.uid) {
//       setMessage('You cannot use your own code.');
//       return;
//     }

//     const referrerWalletRef = doc(db, 'wallets', referralCode);
//     const referrerSnap = await getDoc(referrerWalletRef);

//     if (!referrerSnap.exists()) {
//       setMessage('Invalid referral code.');
//       return;
//     }

//     // 🔒 Prevent mutual referral abuse
//     if (referrerSnap.data()?.referredBy === user.uid) {
//       setMessage('Mutual referrals are not allowed.');
//       return;
//     }

//     try {
//       // Credit referrer +50
//       const referrerData = referrerSnap.data();
//       await updateDoc(referrerWalletRef, {
//         balance: (referrerData.balance ?? 0) + 50,
//         updatedAt: serverTimestamp(),
//       });

//       // Credit current user +50, mark referral used, and store who referred
//       const myWalletRef = doc(db, 'wallets', user.uid);
//       await updateDoc(myWalletRef, {
//         balance: (wallet?.balance ?? 0) + 50,
//         referralUsed: true,
//         referredBy: referralCode,
//         updatedAt: serverTimestamp(),
//       });

//       setWallet((prev) => ({
//         ...prev,
//         balance: (prev?.balance ?? 0) + 50,
//         referralUsed: true,
//         referredBy: referralCode,
//       }));

//       setMessage('Referral applied! ₹50 added to you and your referrer.');
//     } catch (error) {
//       console.error(error);
//       setMessage('Something went wrong.');
//     }
//   };

//   const copyToClipboard = async () => {
//     try {
//       await navigator.clipboard.writeText(user?.uid);
//       setCopySuccess('Copied!');
//       setTimeout(() => setCopySuccess(''), 2000);
//     } catch (err) {
//       setCopySuccess('Failed to copy!');
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
//         <div className="bg-gray-800 p-6 rounded shadow w-full max-w-md">
//           <h1 className="text-xl font-bold mb-4">Refer & Earn</h1>

//           {user && (
//             <div className="mb-4">
//               <p className="mb-1 font-medium">Your Referral Code:</p>
//               <div className="flex items-center gap-2">
//                 <span className="text-yellow-400 font-mono bg-gray-700 px-2 py-1 rounded">
//                   {user.uid}
//                 </span>
//                 <button
//                   onClick={copyToClipboard}
//                   className="text-sm bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-white"
//                 >
//                   Copy
//                 </button>
//               </div>
//               {copySuccess && (
//                 <p className="text-green-400 text-sm mt-1">{copySuccess}</p>
//               )}
//             </div>
//           )}

//           <label className="block mb-2">Have a referral code?</label>
//           <input
//             type="text"
//             value={referralCode}
//             onChange={(e) => setReferralCode(e.target.value)}
//             placeholder="Enter referral code"
//             className="w-full px-4 py-2 bg-gray-700 border border-gray-600 mb-4 rounded"
//           />

//           <button
//             onClick={handleApplyReferral}
//             className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded"
//           >
//             Apply Code
//           </button>

//           <p className="mt-4 text-sm">{message}</p>
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

  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [message, setMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const walletRef = doc(db, 'wallets', currentUser.uid);
        const walletSnap = await getDoc(walletRef);

        if (walletSnap.exists()) {
          setWallet(walletSnap.data());
        } else {
          await updateDoc(walletRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            balance: 0,
            createdAt: serverTimestamp(),
          }).catch(() => {});
          setWallet({ balance: 0 });
        }
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const handleApplyReferral = async () => {
    if (!user) {
      setMessage('Please log in.');
      return;
    }

    if (wallet?.referralUsed) {
      setMessage('You have already used a referral code.');
      return;
    }

    if (referralCode === user.uid) {
      setMessage('You cannot use your own code.');
      return;
    }

    const referrerWalletRef = doc(db, 'wallets', referralCode);
    const referrerSnap = await getDoc(referrerWalletRef);

    if (!referrerSnap.exists()) {
      setMessage('Invalid referral code.');
      return;
    }

    if (referrerSnap.data()?.referredBy === user.uid) {
      setMessage('Mutual referrals are not allowed.');
      return;
    }

    try {
      const referrerData = referrerSnap.data();
      await updateDoc(referrerWalletRef, {
        balance: (referrerData.balance ?? 0) + 50,
        updatedAt: serverTimestamp(),
      });

      const myWalletRef = doc(db, 'wallets', user.uid);
      await updateDoc(myWalletRef, {
        balance: (wallet?.balance ?? 0) + 50,
        referralUsed: true,
        referredBy: referralCode,
        updatedAt: serverTimestamp(),
      });

      setWallet((prev) => ({
        ...prev,
        balance: (prev?.balance ?? 0) + 50,
        referralUsed: true,
        referredBy: referralCode,
      }));

      setMessage('Referral applied! ₹50 added to you and your referrer.');
    } catch (error) {
      console.error(error);
      setMessage('Something went wrong.');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(user?.uid);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy!');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <div className="bg-gray-800 p-6 rounded shadow w-full max-w-md">
          <h1 className="text-xl font-bold mb-4">Refer & Earn</h1>

          {user && (
            <div className="mb-4">
              <p className="mb-1 font-medium">Your Referral Code:</p>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-mono bg-gray-700 px-2 py-1 rounded">
                  {user.uid}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="text-sm bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-white"
                >
                  Copy
                </button>
              </div>
              {copySuccess && (
                <p className="text-green-400 text-sm mt-1">{copySuccess}</p>
              )}
            </div>
          )}

          <label className="block mb-2">Have a referral code?</label>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="Enter referral code"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 mb-4 rounded"
          />

          <button
            onClick={handleApplyReferral}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded"
          >
            Apply Code
          </button>

          <p className="mt-4 text-sm">{message}</p>
        </div>
      </div>
    </Layout>
  );
}
