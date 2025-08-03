// /pages/api/request-reset.js

import nodemailer from 'nodemailer';
// import { db } from '../../firebaseAdmin'; // if it's at root level

// import { db } from '@/firebaseAdmin'; // use Admin SDK to access Firestore securely
import { db } from '../../src/app/app/lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    // Generate unique reset token
    const token = uuidv4();
    const expiresAt = Date.now() + 1000 * 60 * 15; // 15 minutes

    // Store token in Firestore
    await db.collection('passwordResets').doc(token).set({
      email,
      expiresAt,
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${token}`;

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NEXT_PUBLIC_ADMIN_FORGOT_MAIL,
        pass: process.env.ADMIN_MAIL_PASSWORD, // store this in .env securely
      },
    });

    await transporter.sendMail({
      from: `"Your App" <${process.env.NEXT_PUBLIC_ADMIN_FORGOT_MAIL}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Click below to reset your password:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>This link expires in 15 minutes.</p>`,
    });

    return res.status(200).json({ message: 'Reset link sent!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
