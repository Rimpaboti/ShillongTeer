'use client';

import { useState } from 'react';
import axios from 'axios';
import Layout from '@/app/Components/Layout';

export default function CreateSubAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('/app/api/create-subadmin', { email, password });
      if (res.data.success) {
        setMessage('✅ Sub-admin created successfully');
        setEmail('');
        setPassword('');
      } else {
        setMessage('❌ ' + res.data.error);
      }
    } catch (err) {
      setMessage('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-md text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Sub-Admin</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Sub-admin Email"
              className="p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Sub-Admin'}
            </button>
          </form>
          {message && (
            <p className={`mt-4 text-sm ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
