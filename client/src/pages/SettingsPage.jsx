import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSettingChange = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = () => {
    alert('Settings saved successfully!');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="theme-page">
      <main className="theme-shell max-w-2xl">
        <div className="theme-hero mb-8">
          <p className="theme-subtitle">Settings</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Manage your preferences</h1>
        </div>

        <div className="theme-card mb-6">
          <h2 className="mb-6 border-b border-white/10 pb-4 text-xl font-bold text-white">Notification Preferences</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-slate-900/80 p-3">
              <div>
                <p className="font-semibold text-slate-100">Email Notifications</p>
                <p className="text-sm text-slate-400">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.emailNotifications}
                onChange={() => handleSettingChange('emailNotifications')}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-900/80 p-3">
              <div>
                <p className="font-semibold text-slate-100">SMS Notifications</p>
                <p className="text-sm text-slate-400">Receive updates via SMS</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.smsNotifications}
                onChange={() => handleSettingChange('smsNotifications')}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-900/80 p-3">
              <div>
                <p className="font-semibold text-slate-100">Appointment Reminders</p>
                <p className="text-sm text-slate-400">Get reminders before appointments</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.appointmentReminders}
                onChange={() => handleSettingChange('appointmentReminders')}
              />
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="theme-primary-btn mt-6 w-full"
          >
            Save Notification Settings
          </button>
        </div>

        <div className="theme-card mb-6">
          <h2 className="mb-6 border-b border-white/10 pb-4 text-xl font-bold text-white">Account Settings</h2>

          <div className="space-y-4">
            <div className="theme-soft-card">
              <p className="text-sm font-semibold text-amber-300">Account Type</p>
              <p className="mt-1 text-lg text-white">{user?.role}</p>
            </div>

            <div className="theme-soft-card">
              <p className="text-sm font-semibold text-amber-300">Member Since</p>
              <p className="mt-1 text-lg text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => navigate('/profile')}
              className="theme-secondary-btn flex-1 text-center"
            >
              Edit Profile
            </button>
            <div className="theme-secondary-btn pointer-events-none flex-1 text-center opacity-70">
              Password reset coming soon
            </div>
          </div>
        </div>

        <div className="theme-card border-red-400/30">
          <h2 className="mb-4 border-b pb-4 text-xl font-bold text-red-600">Danger Zone</h2>

          <div className="mb-4 rounded-lg bg-red-500/10 p-4">
            <p className="text-sm text-slate-300">
              Deleting your account is permanent and cannot be undone. All your data will be lost.
            </p>
          </div>

          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="theme-danger-btn w-full"
          >
            Delete Account
          </button>

          {showDeleteConfirm && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-100 p-4">
              <p className="mb-3 text-sm font-semibold text-red-800">
                Are you sure you want to delete your account?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  className="theme-danger-btn flex-1"
                >
                  Yes, Delete My Account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="theme-danger-btn flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
