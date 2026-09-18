import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, couponsAPI, invoicesAPI } from '../services/api';
import {
  Scissors,
  Calendar,
  Receipt,
  Gift,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  UserCheck,
  Copy,
  Check,
  CalendarCheck,
  ChevronRight,
} from 'lucide-react';

import BarberShopLoader from '../components/BarberShopLoader';
import DashboardWrapper from '../components/dashboard/DashboardWrapper';
import useAutoDismiss from '../hooks/useAutoDismiss';

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
const PAGE_SIZE = 6;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalSpent: 0,
    totalAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const [error, setError] = useState('');

  // Auto-dismiss error messages after 4 seconds
  useAutoDismiss(error, setError, 4000);
  const [vouchers, setVouchers] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');
  const [appointmentsPage, setAppointmentsPage] = useState(1);

  // Read activeTab from location state when navigating from subpages
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const fetchStats = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');

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

      const upcoming = appointments.filter((apt) => apt.status === 'scheduled').length;
      const completed = appointments.filter((apt) => apt.status === 'completed').length;
      const paidInvoices = invoices.filter((inv) => !inv.paymentStatus || inv.paymentStatus === 'completed');
      const invoicedAppointmentIds = new Set(
        paidInvoices.map((inv) => String(inv.appointmentId?._id || inv.appointmentId)).filter(Boolean)
      );
      const paidInvoiceTotal = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const completedAppointmentTotal = appointments
        .filter((apt) => apt.status === 'completed' && !invoicedAppointmentIds.has(String(apt._id)))
        .reduce((sum, apt) => sum + Number(apt.price || 0), 0);
      const totalSpent = paidInvoiceTotal + completedAppointmentTotal;

      setVouchers(nextVouchers);
      setRecentAppointments(appointments);
      setStats({
        upcomingAppointments: upcoming,
        completedAppointments: completed,
        totalSpent: totalSpent,
        totalAppointments: appointments.length,
      });
      setLastRefreshedAt(new Date());
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 4000);
  };

  if (loading) {
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

  // Next upcoming appointment
  const nextUpcoming = recentAppointments.find((apt) => apt.status === 'scheduled');

  const statCards = [
    {
      label: 'Upcoming Visits',
      value: stats.upcomingAppointments,
      note: 'Scheduled sessions ahead',
      icon: Clock,
      ring: 'border-sky-400/25 bg-slate-900/80',
      valueClass: 'text-sky-300',
      action: () => navigate('/my-appointments'),
    },
    {
      label: 'Completed Visits',
      value: stats.completedAppointments,
      note: 'Finished grooming sessions',
      icon: CheckCircle2,
      ring: 'border-emerald-400/25 bg-slate-900/80',
      valueClass: 'text-emerald-300',
      action: () => navigate('/my-appointments'),
    },
    {
      label: 'Total Grooming Spend',
      value: formatCurrency(stats.totalSpent),
      note: 'Paid bills & appointments',
      icon: Receipt,
      ring: 'border-rose-400/25 bg-slate-900/80',
      valueClass: 'text-rose-300',
      action: () => navigate('/my-invoices'),
    },
    {
      label: 'Active Smile Vouchers',
      value: vouchers.length,
      note: 'Loyalty reward discounts',
      icon: Gift,
      ring: 'border-amber-400/25 bg-slate-900/80',
      valueClass: 'text-amber-300',
      action: () => setActiveTab('vouchers'),
    },
  ];

  const totalAppointmentPages = Math.max(1, Math.ceil(recentAppointments.length / PAGE_SIZE));
  const currentAppointmentPage = Math.min(appointmentsPage, totalAppointmentPages);
  const paginatedAppointments = recentAppointments.slice(
    (currentAppointmentPage - 1) * PAGE_SIZE,
    currentAppointmentPage * PAGE_SIZE
  );

  return (
    <DashboardWrapper
      role="customer"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={activeTab === 'vouchers' ? 'Smile Vouchers' : 'Customer Workspace'}
      subtitle={
        activeTab === 'vouchers'
          ? 'Special customer discount codes and vouchers'
          : 'Welcome to your grooming account portal'
      }
      badges={{ vouchersCount: vouchers.length }}
      notificationsData={{
        upcomingCount: stats.upcomingAppointments,
        vouchersCount: vouchers.length,
      }}
      onRefresh={() => fetchStats({ silent: true })}
      isRefreshing={refreshing}
      lastUpdated={lastRefreshedAt}
      headerActions={
        <button
          type="button"
          onClick={() => navigate('/barbers')}
          className="theme-primary-btn flex items-center gap-2 text-xs font-semibold"
        >
          <Scissors size={14} />
          <span>Book Appointment</span>
        </button>
      }
    >
      {error && (
        <div className="alert alert-error mb-6 border border-red-400/20 bg-red-500/10 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* HERO BANNER */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-400/15 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-300/30 bg-amber-400/10 text-2xl font-bold text-amber-200 shadow-inner">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user?.name || 'Profile'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200">
                    <Sparkles size={12} className="text-amber-300" />
                    Verified Customer
                  </span>
                  <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                    Welcome back, {user?.name || 'Customer'}
                  </h1>
                  <p className="mt-1 text-xs text-slate-300">
                    Track sessions, invoices, and vouchers in one place.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => navigate('/barbers')}
                  className="theme-primary-btn flex items-center gap-2 text-xs font-semibold"
                >
                  <Scissors size={14} />
                  <span>Book Now</span>
                </button>
                <button
                  onClick={() => navigate('/my-appointments')}
                  className="theme-secondary-btn flex items-center gap-2 text-xs font-semibold"
                >
                  <Calendar size={14} />
                  <span>My Appointments</span>
                </button>
              </div>
            </div>
          </div>

          {/* UPCOMING APPOINTMENT ALERT (IF ANY) */}
          {nextUpcoming && (
            <div className="rounded-3xl border border-sky-400/30 bg-gradient-to-r from-sky-400/15 via-slate-900 to-slate-900 p-5 shadow-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-400/20 text-sky-300 border border-sky-400/30">
                    <Clock size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-sky-300">
                      Next Scheduled Visit
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {nextUpcoming.barberId?.shopName || 'Barber Shop'}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {new Date(nextUpcoming.appointmentDate).toLocaleDateString()} at{' '}
                      {nextUpcoming.appointmentTime} · {nextUpcoming.duration} mins
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-amber-200">Rs. {nextUpcoming.price}</span>
                  <button
                    onClick={() => navigate('/my-appointments')}
                    className="theme-primary-btn text-xs font-semibold py-2 px-3.5"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4 STAT CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  onClick={card.action}
                  className={`relative cursor-pointer overflow-hidden rounded-3xl border ${card.ring} p-5 shadow-xl transition hover:-translate-y-1 hover:border-amber-300/40`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        {card.label}
                      </p>
                      <p className={`mt-2 text-2xl font-bold ${card.valueClass}`}>{card.value}</p>
                      <p className="mt-1 text-xs text-slate-400">{card.note}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-slate-300">
                      <Icon size={18} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RECENT BOOKINGS & VOUCHERS GRID */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Appointments */}
            <section className="theme-card">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3.5">
                <div>
                  <h2 className="text-lg font-bold text-white">Recent Appointments</h2>
                  <p className="text-xs text-slate-400">Your latest booking history & status.</p>
                </div>
                <button
                  onClick={() => navigate('/my-appointments')}
                  className="text-xs font-semibold text-amber-300 hover:underline flex items-center gap-1"
                >
                  <span>All ({recentAppointments.length})</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {paginatedAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3.5 transition hover:border-white/20"
                  >
                    <div>
                      <p className="font-bold text-xs text-white">
                        {appointment.barberId?.shopName || 'Barber Shop'}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                        {appointment.appointmentTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          appointment.status === 'completed'
                            ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/20'
                            : appointment.status === 'scheduled'
                            ? 'bg-sky-400/15 text-sky-300 border border-sky-400/20'
                            : 'bg-red-400/15 text-red-300 border border-red-400/20'
                        }`}
                      >
                        {appointment.status}
                      </span>
                      <button
                        onClick={() => navigate('/my-appointments')}
                        className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}

                {recentAppointments.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <Calendar size={28} className="mx-auto mb-2 text-slate-600" />
                    <p>No bookings yet.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Smile Vouchers Preview */}
            <section className="theme-card">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3.5">
                <div>
                  <h2 className="text-lg font-bold text-white">Smile Vouchers</h2>
                  <p className="text-xs text-slate-400">Loyalty discounts from your barbers.</p>
                </div>
                {vouchers.length > 0 && (
                  <button
                    onClick={() => setActiveTab('vouchers')}
                    className="text-xs font-semibold text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <span>View All ({vouchers.length})</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {vouchers.slice(0, 3).map((voucher) => (
                  <div
                    key={voucher._id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-amber-300/20 bg-gradient-to-r from-amber-400/10 to-transparent p-3.5"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-white">{voucher.title}</h4>
                      <p className="text-[11px] text-amber-200">
                        {voucher.discountType === 'flat'
                          ? `Rs. ${voucher.discountValue} OFF`
                          : `${voucher.discountValue}% OFF`}
                        {voucher.minSpend ? ` (Min Rs. ${voucher.minSpend})` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyCode(voucher.code)}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-300/30 bg-slate-950 px-3 py-1.5 font-mono text-xs font-bold text-amber-200 transition hover:bg-amber-400/20"
                    >
                      {copiedCode === voucher.code ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>{voucher.code}</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}

                {vouchers.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <Gift size={28} className="mx-auto mb-2 text-slate-600" />
                    <p>No active vouchers. Complete bookings to unlock regular client rewards.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: SMILE VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="space-y-6">
          <div className="theme-card">
            <div className="mb-6 flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Your Smile Vouchers</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Exclusive loyalty coupon codes. Click to copy and apply during appointment booking.
                </p>
              </div>
              <button
                onClick={() => navigate('/barbers')}
                className="theme-primary-btn text-xs font-semibold"
              >
                Book Appointment
              </button>
            </div>

            {vouchers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-400">
                <Gift size={40} className="mx-auto mb-3 text-slate-600" />
                <h3 className="text-lg font-bold text-white">No active vouchers yet</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Complete appointments to receive regular customer discount codes from your barbers.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vouchers.map((voucher) => (
                  <div
                    key={voucher._id}
                    className="rounded-2xl border border-amber-300/25 bg-gradient-to-b from-amber-400/10 via-slate-900 to-slate-950 p-5 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          Smile Voucher
                        </span>
                        <h3 className="mt-2 text-base font-bold text-white">{voucher.title}</h3>
                        <p className="text-xs text-slate-300">
                          {voucher.barberId?.shopName || 'Barber Shop'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyCode(voucher.code)}
                        className="flex items-center gap-1 rounded-xl border border-amber-300/40 bg-slate-950 px-2.5 py-1.5 font-mono text-xs font-bold text-amber-200 hover:bg-amber-400/20"
                      >
                        {copiedCode === voucher.code ? (
                          <span className="text-emerald-300">Copied!</span>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>{voucher.code}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-amber-200 font-semibold">
                      {voucher.discountType === 'flat'
                        ? `Rs. ${voucher.discountValue} OFF`
                        : `${voucher.discountValue}% OFF`}
                      {voucher.minSpend ? ` (Min spend Rs. ${voucher.minSpend})` : ''}
                    </div>

                    <div className="mt-3 text-[11px] text-slate-400">
                      Valid until: {new Date(voucher.validUntil).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
};

export default Dashboard;
