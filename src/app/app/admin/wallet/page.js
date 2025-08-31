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
        const userRef = doc(db, 's_users', user.uid);
        const snap = await getDoc(userRef);
        const userData = snap.exists() ? snap.data() : {};
        const userRole = userData.role || 'user';
        setRole(userRole);

        const walletCol = userRole === 'admin' ? 's_adminwallets' : 's_subwallets';
        const walletRef = doc(db, walletCol, user.uid);
        const walletSnap = await getDoc(walletRef);
        const balance = walletSnap.exists() ? walletSnap.data().balance ?? 0 : 0;
        setCurrentBalance(balance);

        loadWithdrawRequests(user.uid, userRole);
      }
    });
    return () => unsubscribe();
  }, []);

const loadWithdrawRequests = async (uid, userRole) => {
  let q;

  if (userRole === 'admin') {
    // Show only subadmin → admin withdraws
    q = query(
      collection(db, 's_subwithdrawRequests'),
      where('fromUserSubAdminId', '==', ''), // 🔍 Must be from a subadmin
      where('status', '==', 'pending')
    );
  } else if (userRole === 'subadmin') {
    // Show user → subadmin withdraws
    q = query(
      collection(db, 's_subwithdrawRequests'),
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
      const q = query(collection(db, 's_subwallets'), where('email', '==', targetEmail));
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

  
const handleAddBalance = async () => {
  if (!targetUid || !amountToAdd) return;

  const amount = parseFloat(amountToAdd);
  if (isNaN(amount) || amount <= 0) return setMessage('❌ Invalid amount.');
  if (amount > currentBalance) return setMessage('❌ Insufficient balance.');

  try {
    const fromWalletCol = role === 'admin' ? 's_adminwallets' : 's_subwallets';
    const toWalletCol = 's_subwallets';

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
    const depositRef = doc(collection(db, 's_subdepositRequests')); // auto-id
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
      // receiverUid = fromSubAdminId  ;
      receiverUid = currentUser.uid  ;
    } else if (role === 'subadmin') {
      // Subadmin is approving user → subadmin request
      // receiverUid = currentUser.uid;
      receiverUid = fromSubAdminId;
    } else {
      return alert('Unauthorized');
    }

    // Approver's wallet (who gets money added back)
    const receiverWalletRef = doc(db, role === 'admin' ? 's_adminwallets' : 's_subwallets', receiverUid);
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
    await updateDoc(doc(db, 's_subwithdrawRequests', id), {
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


