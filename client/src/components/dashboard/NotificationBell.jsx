import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../services/api';
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  Gift,
  AlertTriangle,
  Scissors,
  Sparkles,
  X,
  CheckCheck,
  Clock,
  CheckCircle2,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  ExternalLink,
  RefreshCw,
  Volume2,
} from 'lucide-react';
import { playNotificationSound } from '../../utils/notificationSound';
import useAutoDismiss from '../../hooks/useAutoDismiss';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  try {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 30) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return 'Recently';
  }
};

const getIconForType = (type) => {
  switch (type) {
    case 'booking_confirmed':
      return { icon: Calendar, color: 'text-amber-300 bg-amber-400/10' };
    case 'reminder':
      return { icon: Clock, color: 'text-cyan-300 bg-cyan-400/10' };
    case 'booking_completed':
      return { icon: CheckCircle2, color: 'text-emerald-300 bg-emerald-400/10' };
    case 'booking_cancelled':
      return { icon: AlertTriangle, color: 'text-rose-300 bg-rose-500/15' };
    case 'voucher':
      return { icon: Gift, color: 'text-purple-300 bg-purple-400/10' };
    case 'barber_approval':
      return { icon: Scissors, color: 'text-sky-300 bg-sky-400/10' };
    case 'account':
      return { icon: Sparkles, color: 'text-amber-300 bg-amber-400/10' };
    default:
      return { icon: Bell, color: 'text-slate-300 bg-white/10' };
  }
};

const NotificationBell = ({ role = 'customer', notificationsData = null }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testFeedback, setTestFeedback] = useState('');
  useAutoDismiss(testFeedback, setTestFeedback, 4000);
  const dropdownRef = useRef(null);
  const prevUnreadRef = useRef(null);

  // Fetch real notifications from database API
  const fetchNotifications = useCallback(async ({ silent = false } = {}) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!user || !token) return;
    try {
      if (!silent) setLoading(true);
      const res = await notificationsAPI.getAll({ limit: 25 });
      if (res.data?.success) {
        const fetched = res.data.notifications || [];
        const newUnread = res.data.unreadCount || 0;
        setNotifications(fetched);
        setUnreadCount(newUnread);

        // Chime when new unread notification arrives
        if (prevUnreadRef.current !== null && newUnread > prevUnreadRef.current) {
          playNotificationSound();
        }
        prevUnreadRef.current = newUnread;
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.warn('Could not fetch notifications from API:', err.message);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  // Initial load & periodic background sync (every 20s)
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications({ silent: true });
    }, 20000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Handle dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (item) => {
    if (!item.isRead) {
      try {
        await notificationsAPI.markAsRead(item._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      fetchNotifications({ silent: true });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAllRead = async () => {
    try {
      await notificationsAPI.clearAll();
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (err) {
      console.error('Error clearing read notifications:', err);
    }
  };

  const handleNotificationClick = async (item) => {
    await handleMarkAsRead(item);
    setIsOpen(false);
    if (item.link) {
      navigate(item.link, { state: { activeTab: item.tab } });
    }
  };

  const handleSendTestNotification = async () => {
    setSendingTest(true);
    setTestFeedback('');
    try {
      playNotificationSound();
      const res = await notificationsAPI.sendTest();
      setTestFeedback('✅ Test sent! Dispatched to Email & Mobile.');
      fetchNotifications({ silent: true });
    } catch (err) {
      setTestFeedback('❌ Failed to trigger test notification');
    } finally {
      setSendingTest(false);
    }
  };

  // Click-to-WhatsApp link for quick mobile sharing
  const getWhatsAppShareLink = (item) => {
    if (!user?.phone) return null;
    const cleanPhone = String(user.phone).replace(/\D/g, '');
    const text = encodeURIComponent(`*Barabar Shop Update:*\n${item.title}\n${item.message}`);
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BELL TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications({ silent: true });
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-amber-300/40 hover:bg-white/10 hover:text-white shadow-sm"
        aria-label="View Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-950 shadow-md animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* NOTIFICATIONS DROPDOWN MODAL */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-[420px] rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-2xl">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-amber-300" />
              <h3 className="text-sm font-bold text-white">Live Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => playNotificationSound()}
                title="Test notification chime sound"
                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-amber-200 text-xs flex items-center gap-1 font-medium transition"
              >
                <Volume2 size={13} className="text-amber-300" />
                <span className="text-[11px] hidden sm:inline">Sound</span>
              </button>
              <button
                type="button"
                onClick={() => fetchNotifications()}
                title="Refresh notifications"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="rounded-lg px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-amber-200 text-xs flex items-center gap-1 font-medium transition"
                >
                  <CheckCheck size={13} />
                  <span className="text-[11px]">Read all</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* TEST DISPATCH BUTTON BANNER */}
          <div className="my-2.5 flex items-center justify-between rounded-2xl border border-amber-300/20 bg-gradient-to-r from-amber-400/10 via-slate-900 to-slate-900 p-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Smartphone size={14} className="text-amber-300" />
              <span className="text-[11px]">Email, SMS & WhatsApp active</span>
            </div>
            <button
              type="button"
              onClick={handleSendTestNotification}
              disabled={sendingTest}
              className="flex items-center gap-1 rounded-xl bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50"
            >
              <Send size={11} />
              <span>{sendingTest ? 'Sending...' : 'Test Send'}</span>
            </button>
          </div>

          {testFeedback && (
            <div className="mb-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-2 text-center text-xs font-semibold text-emerald-200 animate-fadeIn">
              {testFeedback}
            </div>
          )}

          {/* NOTIFICATION LIST */}
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {notifications.map((item) => {
              const { icon: Icon, color } = getIconForType(item.type);
              const waLink = getWhatsAppShareLink(item);

              return (
                <div
                  key={item._id || item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all ${
                    item.isRead
                      ? 'border-white/5 bg-slate-900/40 opacity-75 hover:opacity-100 hover:bg-slate-900'
                      : 'border-amber-300/30 bg-amber-400/10 shadow-md hover:border-amber-300/50 hover:bg-amber-400/15'
                  }`}
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${color}`}>
                    <Icon size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-bold truncate ${item.isRead ? 'text-slate-200' : 'text-white'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-300">
                      {item.message}
                    </p>

                    {/* Delivery Channels Tags */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
                          <Mail size={10} /> Email
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-sky-400 font-medium">
                          <Smartphone size={10} /> SMS
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-green-400 font-medium">
                          <MessageSquare size={10} /> WA
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Open in WhatsApp"
                            className="rounded-lg p-1 text-green-400 hover:bg-green-500/20"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNotification(e, item._id)}
                          title="Delete notification"
                          className="rounded-lg p-1 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {!item.isRead && (
                    <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-slate-950" />
                  )}
                </div>
              );
            })}

            {notifications.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                <Bell size={28} className="mx-auto mb-2 text-slate-600" />
                <p>No new notifications right now</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Bookings, invoice updates & vouchers will appear here.
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          {notifications.some((n) => n.isRead) && (
            <div className="mt-3 border-t border-white/10 pt-2.5 text-right">
              <button
                type="button"
                onClick={handleClearAllRead}
                className="text-[11px] font-medium text-slate-400 hover:text-amber-200 transition"
              >
                Clear read notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
