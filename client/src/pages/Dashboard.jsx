import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, couponsAPI, invoicesAPI } from '../services/api';

import BarberShopLoader from "../components/BarberShopLoader";

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalSpent: 0,
    totalAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);

  const statCards = [
    {
      label: 'Total Appointments',
      value: stats.totalAppointments,
      note: 'All booking history',
      accent: 'from-amber-400/20 via-amber-300/10 to-transparent',
      ring: 'border-amber-300/20',
      valueClass: 'text-amber-200',
    },
    {
      label: 'Upcoming Visits',
      value: stats.upcomingAppointments,
      note: 'Scheduled sessions ahead',
      accent: 'from-sky-400/20 via-sky-300/10 to-transparent',
      ring: 'border-sky-300/20',
      valueClass: 'text-sky-200',
    },
    {
      label: 'Completed Visits',
      value: stats.completedAppointments,
      note: 'Finished appointments',
      accent: 'from-emerald-400/20 via-emerald-300/10 to-transparent',
      ring: 'border-emerald-300/20',
      valueClass: 'text-emerald-200',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(stats.totalSpent),
      note: 'Investment in grooming',
      accent: 'from-rose-400/20 via-rose-300/10 to-transparent',
      ring: 'border-rose-300/20',
      valueClass: 'text-rose-200',
    },
  ];

  const quickActions = [
    { label: 'Book Appointment', path: '/barbers', primary: true },
    { label: 'My Appointments', path: '/my-appointments' },
    { label: 'My Invoices', path: '/my-invoices' },
    { label: 'Services', path: '/services' },
    { label: 'Our Barbers', path: '/barbers' },
    { label: 'My Profile', path: '/profile' },
    { label: 'Settings', path: '/settings' },
    { label: 'Help & Support', path: '/help' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [appointmentsRes, invoicesRes, vouchersRes] = await Promise.allSettled([
          appointmentsAPI.getUserAppointments(),
          invoicesAPI.getUserInvoices(),
          couponsAPI.getMyVouchers(),
        ]);

        const appointments =
          appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data.appointments || [] : [];
        const invoices =
          invoicesRes.status === 'fulfilled' ? invoicesRes.value.data.invoices || [] : [];
        const nextVouchers =
          vouchersRes.status === 'fulfilled' ? vouchersRes.value.data.coupons || [] : [];

        const upcoming = appointments.filter(
          (apt) => apt.status === 'scheduled'
        ).length;
        const completed = appointments.filter(
          (apt) => apt.status === 'completed'
        ).length;
        const paidInvoices = invoices.filter((inv) => !inv.paymentStatus || inv.paymentStatus === 'completed');
        const invoicedAppointmentIds = new Set(
          paidInvoices.map((inv) => String(inv.appointmentId?._id || inv.appointmentId)).filter(Boolean)
        );
        const paidInvoiceTotal = paidInvoices
          .reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const completedAppointmentTotal = appointments
          .filter((apt) => apt.status === 'completed' && !invoicedAppointmentIds.has(String(apt._id)))
          .reduce((sum, apt) => sum + Number(apt.price || 0), 0);
        const totalSpent = paidInvoiceTotal + completedAppointmentTotal;

        setVouchers(nextVouchers);
        setRecentAppointments(appointments.slice(0, 4));
        setStats({
          upcomingAppointments: upcoming,
          completedAppointments: completed,
          totalSpent: totalSpent,
          totalAppointments: appointments.length,
        });
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-amber-400"></div>
          <p className="mt-4 text-sm uppercase tracking-[0.35em] text-slate-300"><BarberShopLoader /></p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page">
      <main className="theme-shell">
        <div className="theme-hero mb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-amber-300/20 bg-amber-400/10 text-3xl font-semibold text-amber-100">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user?.name || 'Profile'} className="h-full w-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div>
              <p className="theme-subtitle">Customer Dashboard</p>
              <h1 className="mt-4 text-4xl font-semibold text-white">Welcome back, {user?.name}</h1>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Track appointments, see how much you have spent so far, and access your complete grooming account in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
              Premium account overview
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              Fast access to bookings and invoices
            </span>
          </div>
        </div>
        {error && <div className="alert alert-error mb-6 border border-red-400/20 bg-red-500/10 text-red-200">{error}</div>}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-[1.75rem] border ${card.ring} bg-slate-950/70 p-6 shadow-xl shadow-black/20`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
              <div className="relative">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{card.label}</p>
                <p className={`mt-4 text-3xl font-semibold ${card.valueClass}`}>{card.value}</p>
                <p className="mt-3 text-sm text-slate-300">{card.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="theme-card">
              <div className="mb-6 flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Quick Actions</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Move through your most-used customer tools instantly.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
                  Menu
                </span>
              </div>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className={
                      action.primary
                        ? 'theme-primary-btn w-full text-left'
                        : 'w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left font-medium text-slate-100 transition hover:border-amber-300/30 hover:bg-white/10'
                    }
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="theme-card overflow-hidden">
              <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Profile Summary</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Your account details and personal dashboard identity.
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                  Account ready for booking and support
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Full Name</p>
                  <p className="mt-3 text-lg font-semibold text-slate-100">{user?.name}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Email Address</p>
                  <p className="mt-3 text-lg font-semibold text-slate-100">{user?.email}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Phone Number</p>
                  <p className="mt-3 text-lg font-semibold text-slate-100">{user?.phone || 'N/A'}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Account Type</p>
                  <p className="mt-3">
                    <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-sm font-medium capitalize text-amber-200">
                      {user?.role}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="theme-secondary-btn mt-6 w-full md:w-auto"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="theme-card">
            <div className="mb-5 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Smile Vouchers</h2>
              <p className="mt-2 text-sm text-slate-400">Regular customer coupons from your barbers.</p>
            </div>
            {vouchers.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-400">
                No active voucher yet. Complete more bookings to unlock regular customer offers.
              </p>
            ) : (
              <div className="grid gap-3">
                {vouchers.slice(0, 4).map((voucher) => (
                  <div key={voucher._id} className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-amber-200">Smile Voucher</p>
                        <h3 className="mt-2 font-semibold text-white">{voucher.title}</h3>
                        <p className="mt-1 text-sm text-slate-300">{voucher.barberId?.shopName || 'Barber shop'}</p>
                      </div>
                      <span className="rounded-xl bg-slate-950/70 px-3 py-2 font-semibold text-amber-100">{voucher.code}</span>
                    </div>
                    <p className="mt-3 text-sm text-amber-100">
                      {voucher.discountType === 'flat' ? formatCurrency(voucher.discountValue) : `${voucher.discountValue}%`} off
                      {voucher.minSpend ? ` on min ${formatCurrency(voucher.minSpend)}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Valid until {new Date(voucher.validUntil).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="theme-card">
            <div className="mb-5 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Recent Booking Details</h2>
              <p className="mt-2 text-sm text-slate-400">Quick view of your latest appointments.</p>
            </div>
            <div className="space-y-3">
              {recentAppointments.map((appointment) => (
                <div key={appointment._id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{appointment.barberId?.shopName || appointment.barberId?.userId?.name || 'Barber shop'}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">Status: {appointment.status}</p>
                    </div>
                    <button onClick={() => navigate('/my-appointments')} className="theme-secondary-btn text-sm">
                      Detail
                    </button>
                  </div>
                </div>
              ))}
              {recentAppointments.length === 0 && <p className="text-sm text-slate-400">No booking details yet.</p>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
