// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/router';

// export default function ResetPasswordPage() {
//   const router = useRouter();
//   const { token } = router.query;

//   const [password, setPassword] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleReset = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await fetch('/api/reset-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token, newPassword: password }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);
//       setSuccess(true);
//     } catch (err) {
//       setError(err.message || 'Failed to reset password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-8 max-w-md mx-auto mt-20 bg-white rounded shadow">
//       <h2 className="text-xl font-bold mb-4">Set New Password</h2>
//       <input
//         type="password"
//         placeholder="Enter new password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         className="border px-3 py-2 w-full mb-4"
//       />
//       <button
//         onClick={handleReset}
//         className="bg-blue-600 text-white py-2 px-4 rounded w-full"
//         disabled={loading}
//       >
//         {loading ? 'Resetting...' : 'Reset Password'}
//       </button>
//       {error && <p className="text-red-500 mt-2">{error}</p>}
//       {success && <p className="text-green-600 mt-2">Password reset successfully.</p>}
//     </div>
//   );
// }


// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// export default function ResetPasswordPage() {
//   const router = useRouter();
//   const { token } = router.query;

//   const [password, setPassword] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Optional: Wait until token is available
//   if (!token) {
//     return <div className="text-center mt-20 text-gray-600">Loading reset link...</div>;
//   }

//   const handleReset = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await fetch('/api/reset-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token, newPassword: password }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);
//       setSuccess(true);
//     } catch (err) {
//       setError(err.message || 'Failed to reset password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-8 max-w-md mx-auto mt-20 bg-white rounded shadow">
//       <h2 className="text-xl font-bold mb-4">Set New Password</h2>

//       <input
//         type="password"
//         placeholder="Enter new password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         className="border px-3 py-2 w-full mb-4"
//       />

//       <button
//         onClick={handleReset}
//         className="bg-blue-600 text-white py-2 px-4 rounded w-full"
//         disabled={loading || !token}
//       >
//         {loading ? 'Resetting...' : 'Reset Password'}
//       </button>

//       {error && <p className="text-red-500 mt-2">{error}</p>}
//       {success && <p className="text-green-600 mt-2">Password reset successfully.</p>}
//     </div>
//   );
// }

// import { useRouter } from 'next/router';
// import React, { useState } from 'react';
// import axios from 'axios';

// const ResetPasswordPage = () => {
//   const router = useRouter();
//   const { token } = router.query; // ✅ Correct way in Pages Router

//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');

//   const handleReset = async () => {
//     if (!password || !confirmPassword) return setMessage("All fields required");
//     if (password !== confirmPassword) return setMessage("Passwords do not match");

//     try {
//       const res = await axios.post('/api/reset-password', {
//         token,
//         password,
//       });
//       setMessage("Password updated successfully. Redirecting...");
//       setTimeout(() => router.push('/login'), 2000);
//     } catch (err) {
//       setMessage("Something went wrong.");
//       console.error(err);
//     }
//   };

//   return (
//     <div>
//       <h2>Reset Password</h2>
//       <input
//         type="password"
//         placeholder="New password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <input
//         type="password"
//         placeholder="Confirm new password"
//         value={confirmPassword}
//         onChange={(e) => setConfirmPassword(e.target.value)}
//       />
//       <button onClick={handleReset}>Reset Password</button>
//       <p>{message}</p>
//     </div>
//   );
// };

// export default ResetPasswordPage;

// src/app/reset-password/[token]/page.js

// 'use client';

// import React, { useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';

// const ResetPasswordPage = ({ params }) => {
//   const router = useRouter();
//   const token = params?.token;

//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     if (password !== confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     try {
//       const response = await axios.post('/api/reset-password', { token, password });
//       setSuccess(response.data.message);
//       setTimeout(() => router.push('/login'), 3000); // Redirect to login after success
//     } catch (err) {
//       setError(err.response?.data?.error || 'Something went wrong.');
//     }
//   };

//   return (
//     <div style={{ maxWidth: 400, margin: 'auto', padding: '2rem' }}>
//       <h1>Reset Your Password</h1>

//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       {success && <p style={{ color: 'green' }}>{success}</p>}

//       <form onSubmit={handleSubmit}>
//         <input
//           type="password"
//           placeholder="New password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           style={{ display: 'block', width: '100%', marginBottom: '1rem' }}
//         />
//         <input
//           type="password"
//           placeholder="Confirm new password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           required
//           style={{ display: 'block', width: '100%', marginBottom: '1rem' }}
//         />
//         <button type="submit" style={{ width: '100%' }}>Reset Password</button>
//       </form>
//     </div>
//   );
// };

// export default ResetPasswordPage;


// 'use client';

// import { useParams, useRouter } from 'next/navigation';
// import { useState } from 'react';

// const ResetPasswordPage = () => {
//   const router = useRouter();
//   const params = useParams(); // 👈 instead of receiving params as prop
//   const token = params?.token;

//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       alert('Passwords do not match!');
//       return;
//     }

//     try {
//       const res = await fetch(`/api/reset-password/${token}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ password }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         alert('Password reset successful!');
//         router.push('/login');
//       } else {
//         alert(data.message || 'Failed to reset password');
//       }
//     } catch (err) {
//       console.error(err);
//       alert('Something went wrong!');
//     }
//   };

//   return (
//     <div>
//       <h2>Reset Your Password</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="password"
//           placeholder="New Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         /><br />
//         <input
//           type="password"
//           placeholder="Confirm Password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           required
//         /><br />
//         <button type="submit">Reset Password</button>
//       </form>
//     </div>
//   );
// };

// export default ResetPasswordPage;

// 'use client';

// import { useParams, useRouter } from 'next/navigation';
// import { useState } from 'react';

// const ResetPasswordPage = () => {
//   const router = useRouter();
//   const { token } = useParams();

//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       setError('Passwords do not match!');
//       return;
//     }

//     try {
//       const res = await fetch(`/api/reset-password/${token}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || 'Failed to reset password');
//       }

//       setSuccess('Password reset successful!');
//       setTimeout(() => router.push('/login'), 2000);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div style={{ padding: '2rem' }}>
//       <h2>Reset Your Password</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="password"
//           placeholder="New Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           style={{ display: 'block', margin: '10px 0', padding: '8px' }}
//         />
//         <input
//           type="password"
//           placeholder="Confirm Password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           required
//           style={{ display: 'block', margin: '10px 0', padding: '8px' }}
//         />
//         <button type="submit">Reset Password</button>
//       </form>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       {success && <p style={{ color: 'green' }}>{success}</p>}
//     </div>
//   );
// };

// // no export here


'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      const res = await fetch(`/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess('Password reset successful!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Reset Your Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: 'block', margin: '10px 0', padding: '8px' }}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ display: 'block', margin: '10px 0', padding: '8px' }}
        />
        <button type="submit">Reset Password</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default ResetPasswordPage;
