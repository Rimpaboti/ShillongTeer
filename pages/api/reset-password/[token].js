import { db } from '@/firebaseAdmin'; // your Firebase Admin SDK instance
import { getAuth } from 'firebase-admin/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.query;
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }

  try {
    // 1. Look up the reset token in Firestore
    const tokenDoc = await db.collection('resetTokens').doc(token).get();

    if (!tokenDoc.exists) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const { uid, expiresAt } = tokenDoc.data();

    // 2. Check expiration
    if (Date.now() > expiresAt) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    // 3. Update password using Firebase Admin SDK
    await getAuth().updateUser(uid, { password });

    // 4. Delete token to prevent reuse
    await db.collection('resetTokens').doc(token).delete();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
