// /pages/api/reset-password.js

import { db } from '@/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';
import firebaseAdmin from '@/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res.status(400).json({ error: 'Missing token or new password' });

  try {
    const resetDoc = await db.collection('passwordResets').doc(token).get();

    if (!resetDoc.exists) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const { email, expiresAt } = resetDoc.data();

    if (Date.now() > expiresAt) {
      return res.status(400).json({ error: 'Token expired' });
    }

    // Update password
    const user = await firebaseAdmin.auth().getUserByEmail(email);
    await firebaseAdmin.auth().updateUser(user.uid, {
      password: newPassword,
    });

    // Delete token after use
    await db.collection('passwordResets').doc(token).delete();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not reset password' });
  }
}
