import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-page">
      <main className="theme-shell max-w-2xl">
        <div className="theme-card">
          <p className="theme-subtitle">Profile</p>
          <h1 className="mb-8 mt-4 text-3xl font-semibold text-white">My Profile</h1>

          {error && <div className="alert alert-error mb-6">{error}</div>}
          {success && <div className="alert alert-success mb-6">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="theme-input w-full"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="theme-input w-full"
                required
                disabled
              />
              <p className="mt-2 text-xs text-slate-400">Email cannot be changed</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="theme-input w-full"
                required
              />
            </div>

            <div className="theme-soft-card">
              <p className="text-sm text-slate-300">
                <strong>Account Info:</strong>
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Account Type: <span className="rounded-full bg-white/5 px-3 py-1 font-semibold text-amber-300">{user?.role}</span>
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Member Since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="theme-primary-btn flex-1"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="theme-danger-btn flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
