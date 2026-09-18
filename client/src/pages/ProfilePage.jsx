import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Mail, Phone, Image as ImageIcon, Shield, Calendar, CheckCircle2 } from 'lucide-react';
import BarberShopLoader from '../components/BarberShopLoader';
import DashboardWrapper from '../components/dashboard/DashboardWrapper';
import useAutoDismiss from '../hooks/useAutoDismiss';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-dismiss error/fail and success alerts after 4 seconds
  useAutoDismiss(error, setError, 4000);
  useAutoDismiss(success, setSuccess, 4000);

  useEffect(() => {
    if (user) {
      let rawPhone = user.phone || '';
      let clean10 = rawPhone.replace(/\D/g, '');
      if (clean10.length === 12 && clean10.startsWith('91')) {
        clean10 = clean10.slice(2);
      }
      clean10 = clean10.slice(0, 10);

      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: clean10,
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digits }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateProfile({
        ...formData,
        phone: cleanPhone,
      });
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-amber-400"></div>
          <div className="mt-4 text-sm uppercase tracking-[0.35em] text-slate-300">
            <BarberShopLoader />
          </div>
        </div>
      </div>
    );
  }

  const role = user?.role || 'customer';

  return (
    <DashboardWrapper
      role={role}
      activeTab={role === 'barber' ? 'user-profile' : 'profile'}
      title="My Profile"
      subtitle="Manage your personal account credentials & identity"
    >
      <div className="mx-auto max-w-3xl">
        <div className="theme-card">
          <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-amber-300/30 bg-amber-400/10 text-2xl font-bold text-amber-200">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt={formData.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                  formData.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{formData.name || 'Your Name'}</h2>
                <p className="text-xs text-slate-400">{formData.email}</p>
                <span className="mt-1 inline-block rounded-full border border-amber-300/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                  {role} Account
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error mb-6 border border-red-400/20 bg-red-500/10 text-xs text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success mb-6 border border-emerald-400/20 bg-emerald-500/10 text-xs text-emerald-100 flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-200">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="theme-input text-xs"
                placeholder="Full Name"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-200">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="theme-input text-xs opacity-70 cursor-not-allowed"
                required
                disabled
              />
              <p className="mt-1 text-[11px] text-slate-500">Email address cannot be changed directly.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-200">Profile Photo URL</label>
              <input
                type="url"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                className="theme-input text-xs"
                placeholder="https://example.com/profile.jpg"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Direct image URL for your avatar.{' '}
                <a
                  href="https://image-to-url-iota.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline"
                >
                  Convert photo to URL
                </a>
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-slate-200">
                Mobile Number
              </label>
              <div className="flex rounded-xl border border-white/10 bg-slate-900/80 transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400">
                <span className="flex items-center border-r border-white/10 bg-white/5 px-3 text-xs font-semibold text-amber-300 select-none rounded-l-xl">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="w-full bg-transparent px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none tracking-wider rounded-r-xl"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Account Role</span>
                <span className="font-semibold text-amber-200 capitalize">{role}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Registered Since</span>
                <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="theme-primary-btn text-xs font-semibold flex-1"
              >
                {loading ? 'Saving Changes...' : 'Save Profile'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="theme-secondary-btn text-xs font-semibold"
              >
                Back to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default ProfilePage;
