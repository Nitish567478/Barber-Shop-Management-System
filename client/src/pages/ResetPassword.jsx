import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAutoDismiss from '../hooks/useAutoDismiss';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Auto-dismiss error messages after 4 seconds
  useAutoDismiss(error, setError, 4000);
  const [loading, setLoading] = useState(false);
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordRegex.test(password)) {
      setError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await authAPI.resetPassword(token, { password });
      navigate('/login', {
        state: { message: response.data.message || 'Password reset successful.' },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-page flex items-center justify-center px-6 py-10">
      <div className="theme-card w-full max-w-md">
        <p className="theme-subtitle text-center">Reset Password</p>
        <h1 className="mt-4 text-center text-3xl font-semibold text-white">Create a new password</h1>
        <p className="mt-2 text-center text-xs text-slate-400">
          Must be at least 8 characters with uppercase, lowercase, number, and special character.
        </p>

        {error && <div className="alert alert-error mt-4">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-200">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="theme-input"
            required
            minLength={8}
            placeholder="e.g. Barber@2026"
          />

          <label className="mb-2 mt-4 block text-sm font-medium text-slate-200">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="theme-input"
            required
            minLength={8}
            placeholder="Repeat new password"
          />

          <button type="submit" disabled={loading} className="theme-primary-btn mt-6 w-full">
            {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
