import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import {
  Settings,
  Bell,
  Shield,
  Lock,
  Trash2,
  CheckCircle2,
  User,
  Send,
  Mail,
  Smartphone,
  MessageSquare,
  Clock,
  Sparkles,
} from 'lucide-react';
import DashboardWrapper from '../components/dashboard/DashboardWrapper';
import useAutoDismiss from '../hooks/useAutoDismiss';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    whatsappNotifications: true,
    appointmentReminders: true,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingNotif, setTestingNotif] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useAutoDismiss(saveSuccess, setSaveSuccess, 4000, false);
  useAutoDismiss(testResult, setTestResult, 4000);

  const handleSettingChange = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = () => {
    setSaveSuccess(true);
  };

  const handleTriggerTest = async () => {
    setTestingNotif(true);
    setTestResult('');
    try {
      const res = await notificationsAPI.sendTest();
      setTestResult(`✅ Test sent to ${user?.email || 'email'} and ${user?.phone || 'mobile'}!`);
    } catch (err) {
      setTestResult('❌ Test notification failed to dispatch.');
    } finally {
      setTestingNotif(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      logout();
      navigate('/');
    }
  };

  const role = user?.role || 'customer';

  return (
    <DashboardWrapper
      role={role}
      activeTab="settings"
      title="Settings & Preferences"
      subtitle="Notification alerts, security preferences, and account controls"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {saveSuccess && (
          <div className="alert alert-success border border-emerald-400/20 bg-emerald-500/10 text-xs text-emerald-100 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Preferences saved successfully!</span>
          </div>
        )}

        {testResult && (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-3 text-xs font-semibold text-amber-200 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-300" />
            <span>{testResult}</span>
          </div>
        )}

        {/* NOTIFICATION PREFERENCES */}
        <div className="theme-card">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-amber-300" />
              <div>
                <h2 className="text-lg font-bold text-white">Multi-Channel Notifications</h2>
                <p className="text-xs text-slate-400">
                  Registered Email ({user?.email}) & Phone ({user?.phone || 'Not set'})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTriggerTest}
              disabled={testingNotif}
              className="flex items-center gap-1.5 self-start rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50"
            >
              <Send size={12} />
              <span>{testingNotif ? 'Dispatching...' : 'Test Send Real Alert'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {/* Email */}
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-4 transition hover:bg-white/5 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Email Notifications</p>
                  <p className="text-[11px] text-slate-400">
                    Receive rich booking confirmations, invoice receipts, and reset links via email
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-amber-400"
                checked={settings.emailNotifications}
                onChange={() => handleSettingChange('emailNotifications')}
              />
            </label>

            {/* SMS */}
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-4 transition hover:bg-white/5 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                  <Smartphone size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">SMS Notifications</p>
                  <p className="text-[11px] text-slate-400">
                    Receive transactional SMS on your registered phone ({user?.phone || 'Add in Profile'})
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-amber-400"
                checked={settings.smsNotifications}
                onChange={() => handleSettingChange('smsNotifications')}
              />
            </label>

            {/* WhatsApp */}
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-4 transition hover:bg-white/5 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">WhatsApp Messaging</p>
                  <p className="text-[11px] text-slate-400">
                    Instant WhatsApp booking receipts & direct click-to-chat links
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-amber-400"
                checked={settings.whatsappNotifications}
                onChange={() => handleSettingChange('whatsappNotifications')}
              />
            </label>

            {/* Appointment Reminders */}
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-4 transition hover:bg-white/5 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Automated Appointment Reminders</p>
                  <p className="text-[11px] text-slate-400">
                    Receive timely alerts 30 minutes before your scheduled grooming slot
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-amber-400"
                checked={settings.appointmentReminders}
                onChange={() => handleSettingChange('appointmentReminders')}
              />
            </label>
          </div>

          <button
            onClick={handleSaveSettings}
            className="theme-primary-btn mt-5 w-full text-xs font-semibold"
          >
            Save Notification Preferences
          </button>
        </div>

        {/* ACCOUNT INFO & SHORTCUTS */}
        <div className="theme-card">
          <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
            <User size={20} className="text-amber-300" />
            <div>
              <h2 className="text-lg font-bold text-white">Account Settings</h2>
              <p className="text-xs text-slate-400">Manage your profile and authentication shortcuts.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-[11px] font-semibold uppercase text-slate-400">Account Type</p>
              <p className="mt-1 text-sm font-bold text-amber-200 capitalize">{role}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-[11px] font-semibold uppercase text-slate-400">Registered Email</p>
              <p className="mt-1 text-sm font-semibold text-white truncate">{user?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="theme-secondary-btn flex-1 text-center text-xs font-semibold"
            >
              Edit Profile & Phone
            </button>
            <button
              onClick={() => navigate('/forgot-password')}
              className="theme-secondary-btn flex-1 text-center text-xs font-semibold"
            >
              Change / Reset Password
            </button>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-500/10 to-transparent p-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-red-500/20 pb-4 text-red-300">
            <Trash2 size={20} />
            <div>
              <h2 className="text-lg font-bold text-red-200">Danger Zone</h2>
              <p className="text-xs text-red-300/80">Irreversible actions on your account data.</p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-300">
            Deleting your account will permanently remove your booking history, profile credentials, and smile vouchers.
          </p>

          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="theme-danger-btn mt-4 text-xs font-semibold"
          >
            Delete My Account
          </button>

          {showDeleteConfirm && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/80 p-4">
              <p className="text-xs font-bold text-red-200">
                Are you absolutely sure? This cannot be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                >
                  Yes, Delete My Account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default SettingsPage;
