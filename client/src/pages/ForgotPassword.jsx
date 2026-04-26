import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setMessage('');
      setPreviewUrl('');
      const response = await authAPI.forgotPassword({ email });
      setMessage(response.data.message || 'Reset link sent successfully.');
      setPreviewUrl(response.data.previewUrl || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-page flex items-center justify-center px-6 py-10">
      <div className="theme-card w-full max-w-md">
        <p className="theme-subtitle text-center">Forgot Password</p>
        <h1 className="mt-4 text-center text-3xl font-semibold text-white">Reset your password</h1>
        <p className="mt-3 text-center text-sm text-slate-300">
          Enter your confirmation email and we will send a reset link valid for 15 minutes.
        </p>

        {error && <div className="alert alert-error mt-4">{error}</div>}
        {message && <div className="alert alert-success mt-4">{message}</div>}
        {previewUrl && (
          <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            Development preview link: <a href={previewUrl} className="underline">{previewUrl}</a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="theme-input"
            required
          />

          <button type="submit" disabled={loading} className="theme-primary-btn mt-6 w-full">
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-4 text-center text-slate-300">
          <Link to="/login" className="text-amber-300 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
