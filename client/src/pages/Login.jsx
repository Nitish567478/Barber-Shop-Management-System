import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/globals.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      // Redirect to the page they were trying to access, or dashboard if direct login
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error ||
                      err.message || 
                      'Login failed';
      setError(errorMsg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-page flex items-center justify-center px-6 py-10">
      <div className="theme-card w-full max-w-md">
        <p className="theme-subtitle text-center">Welcome Back</p>
        <h1 className="mt-4 text-center text-3xl font-semibold text-white">
          Login to Barber Shop
        </h1>
        <p className="mt-3 text-center text-sm text-slate-300">
          Access your appointments, invoices, and grooming dashboard.
        </p>

        {location.state?.message && (
          <div className="alert alert-success mb-4">{location.state.message}</div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="theme-input"
              required
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="theme-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="theme-primary-btn w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-slate-300">
          Don't have an account?{' '}
          <Link to="/register" className="text-amber-300 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
