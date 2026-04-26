import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  appointmentsAPI,
  barbersAPI,
  invoicesAPI,
  reportsAPI,
  servicesAPI,
} from '../services/api';
import {
  AlertTriangle,
  Award,
  CalendarCheck,
  Clock,
  Eye,
  IndianRupee,
  Loader2,
  Mail,
  Moon,
  Phone,
  Scissors,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Sun,
  Sunrise,
  TrendingUp,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import BarberShopLoader from '../components/BarberShopLoader';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'N/A');
const getSuspensionLabel = (barber) => {
  if (!barber?.suspendedUntil) {
    return '';
  }

  const until = new Date(barber.suspendedUntil);
  if (Number.isNaN(until.getTime()) || until <= new Date()) {
    return '';
  }

  const days = Math.max(1, Math.ceil((until - new Date()) / (1000 * 60 * 60 * 24)));
  return `${days} day${days === 1 ? '' : 's'} suspended`;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { label: 'Good morning', Icon: Sunrise };
  if (hour < 17) return { label: 'Good afternoon', Icon: Sun };
  if (hour < 21) return { label: 'Good evening', Icon: Moon };
  return { label: 'Good night', Icon: Moon };
};

const StarRating = ({ rating = 0, count }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={15}
        className={star <= Math.round(Number(rating || 0)) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
      />
    ))}
    <span className="ml-1 text-sm font-semibold text-amber-200">
      {Number(rating || 0).toFixed(1)}{count !== undefined ? ` (${count})` : ''}
    </span>
  </div>
);

const StatCard = ({ title, value, helper, icon: Icon, tone }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-[1.35rem] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-slate-950/20"
  >
    <div className="flex items-center justify-between gap-4">
      <div className={cn('rounded-2xl p-3', tone)}>
        <Icon size={22} />
      </div>
      <p className="text-right text-xs uppercase tracking-[0.22em] text-slate-400">{title}</p>
    </div>
    <p className="mt-5 text-3xl font-semibold text-white">{value}</p>
    <p className="mt-2 text-sm text-slate-400">{helper}</p>
  </motion.div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState('overview');
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [pendingBarbers, setPendingBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [reports, setReports] = useState([]);

  const fetchDashboard = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');

      const [appointmentsRes, invoicesRes, barbersRes, pendingRes, servicesRes, reportsRes] =
        await Promise.allSettled([
          appointmentsAPI.getAll(),
          invoicesAPI.getAll(),
          barbersAPI.getAdminAll(),
          barbersAPI.getPending(),
          servicesAPI.getAll(),
          reportsAPI.getAdminReports(),
        ]);

      setAppointments(appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data?.appointments || [] : []);
      setInvoices(invoicesRes.status === 'fulfilled' ? invoicesRes.value.data?.invoices || [] : []);
      setBarbers(barbersRes.status === 'fulfilled' ? barbersRes.value.data?.barbers || [] : []);
      setPendingBarbers(pendingRes.status === 'fulfilled' ? pendingRes.value.data?.pendingBarbers || [] : []);
      setServices(servicesRes.status === 'fulfilled' ? servicesRes.value.data?.services || [] : []);
      setReports(reportsRes.status === 'fulfilled' ? reportsRes.value.data?.reports || [] : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = window.setInterval(() => fetchDashboard({ silent: true }), 25000);
    return () => window.clearInterval(interval);
  }, []);

  const analytics = useMemo(() => {
    const paidInvoices = invoices.filter((invoice) => invoice.paymentStatus === 'completed');
    const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
    const completedAppointments = appointments.filter((appointment) => appointment.status === 'completed');
    const scheduledAppointments = appointments.filter((appointment) => appointment.status === 'scheduled');
    const reviews = appointments.filter((appointment) => appointment.feedback?.submittedAt);
    const averageRating = reviews.length
      ? reviews.reduce((sum, appointment) => sum + Number(appointment.feedback.rating || 0), 0) / reviews.length
      : 0;
    const customerMap = new Map();
    appointments.forEach((appointment) => {
      if (appointment.customerId?._id) {
        customerMap.set(appointment.customerId._id, appointment.customerId);
      }
    });

    const barberRankings = barbers
      .map((barber) => {
        const barberAppointments = appointments.filter((appointment) => appointment.barberId?._id === barber._id);
        const barberReviews = barberAppointments.filter((appointment) => appointment.feedback?.submittedAt);
        const revenue = barberAppointments
          .filter((appointment) => appointment.status === 'completed')
          .reduce((sum, appointment) => sum + Number(appointment.price || 0), 0);
        const rating = barberReviews.length
          ? barberReviews.reduce((sum, appointment) => sum + Number(appointment.feedback.rating || 0), 0) / barberReviews.length
          : 0;
        const score = revenue + barberAppointments.length * 120 + rating * 250 + barberReviews.length * 80;
        return {
          ...barber,
          appointmentCount: barberAppointments.length,
          feedbackCount: barberReviews.length,
          customerCount: new Set(barberAppointments.map((appointment) => appointment.customerId?._id).filter(Boolean)).size,
          revenue,
          rating,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);

    return {
      totalRevenue,
      completedAppointments: completedAppointments.length,
      scheduledAppointments: scheduledAppointments.length,
      customers: Array.from(customerMap.values()),
      reviews,
      averageRating,
      barberRankings,
      openReports: reports.filter((report) => report.status === 'open').length,
      verifiedReports: reports.filter((report) => report.status === 'verified').length,
      suspendedBarbers: barbers.filter((barber) => getSuspensionLabel(barber)).length,
    };
  }, [appointments, barbers, invoices, reports]);

  const q = search.trim().toLowerCase();
  const filteredPending = pendingBarbers.filter((barber) =>
    !q || barber.userId?.name?.toLowerCase().includes(q) || barber.shopName?.toLowerCase().includes(q)
  );
  const filteredReports = reports.filter((report) =>
    !q ||
    report.customerId?.name?.toLowerCase().includes(q) ||
    report.barberId?.shopName?.toLowerCase().includes(q) ||
    report.message?.toLowerCase().includes(q)
  );

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await barbersAPI.approve(id);
      await fetchDashboard({ silent: true });
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id);
      await barbersAPI.reject(id);
      await fetchDashboard({ silent: true });
    } finally {
      setActionLoading('');
    }
  };

  const handleReportAction = async (reportId, payload) => {
    try {
      setActionLoading(reportId);
      await reportsAPI.verify(reportId, payload);
      await fetchDashboard({ silent: true });
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <BarberShopLoader />
      </div>
    );
  }

  const greeting = getGreeting();
  const GreetingIcon = greeting.Icon;
  const navItems = [
    ['overview', 'Overview'],
    ['reports', 'Reports'],
    ['barbers', 'Barbers'],
    ['customers', 'Customers'],
    ['services', 'Services'],
    ['finance', 'Finance'],
    ['settings', 'Settings'],
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1f2937,#020617_42%,#111827)] text-white">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-amber-100">
              <GreetingIcon size={18} />
              <span>{greeting.label}, {user?.name || 'Admin'}</span>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-white">
              Barabar Shop Control Center
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Manage barber shops, customers, services, reports, feedback, rankings, and money flow from one real-time admin workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-amber-300/50 sm:w-72"
                placeholder="Search reports, shops, users"
              />
            </div>
            <button onClick={() => fetchDashboard({ silent: true })} className="theme-secondary-btn">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-200">{error}</div>}

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {navItems.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm transition',
                activeView === key
                  ? 'border-amber-300/40 bg-amber-400/15 text-amber-100'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Revenue" value={formatCurrency(analytics.totalRevenue)} helper="Completed paid invoices" icon={IndianRupee} tone="bg-emerald-400/10 text-emerald-200" />
          <StatCard title="Appointments" value={appointments.length} helper={`${analytics.completedAppointments} completed, ${analytics.scheduledAppointments} scheduled`} icon={CalendarCheck} tone="bg-sky-400/10 text-sky-200" />
          <StatCard title="Barbers" value={barbers.length} helper={`${pendingBarbers.length} pending, ${analytics.suspendedBarbers} suspended`} icon={Scissors} tone="bg-violet-400/10 text-violet-200" />
          <StatCard title="Reports" value={analytics.openReports} helper={`${analytics.verifiedReports} verified actions`} icon={AlertTriangle} tone="bg-rose-400/10 text-rose-200" />
        </section>

        {activeView === 'overview' && (
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Top Ranked Barbers</h2>
                <Award className="text-amber-300" />
              </div>
              <div className="space-y-3">
                {analytics.barberRankings.slice(0, 6).map((barber, index) => (
                  <button
                    key={barber._id}
                    onClick={() => setSelectedBarber(barber)}
                    className="grid w-full gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:border-amber-300/30 md:grid-cols-[auto_1fr_auto]"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/15 font-semibold text-amber-100">#{index + 1}</span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{barber.shopName || 'Unnamed shop'}</p>
                        {getSuspensionLabel(barber) && (
                          <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-200">
                            {getSuspensionLabel(barber)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{barber.userId?.name || 'Unknown barber'} · {barber.customerCount} customers · {barber.appointmentCount} bookings</p>
                      {barber.suspensionReason && (
                        <p className="mt-1 text-sm text-red-200">Reason: {barber.suspensionReason}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-200">{formatCurrency(barber.revenue)}</p>
                      <StarRating rating={barber.rating} count={barber.feedbackCount} />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
              <h2 className="text-2xl font-semibold">Feedback & Suggestions</h2>
              <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
                <StarRating rating={analytics.averageRating} count={analytics.reviews.length} />
                <p className="mt-2 text-sm text-amber-100">System-wide customer satisfaction score.</p>
              </div>
              <div className="mt-5 space-y-3">
                {analytics.reviews.slice(0, 5).map((appointment) => (
                  <div key={appointment._id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{appointment.customerId?.name || 'Customer'}</p>
                        <p className="text-sm text-slate-400">{appointment.barberId?.shopName || 'Barber shop'}</p>
                      </div>
                      <StarRating rating={appointment.feedback.rating} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{appointment.feedback.comment || 'No written suggestion.'}</p>
                  </div>
                ))}
                {analytics.reviews.length === 0 && <p className="text-sm text-slate-400">Feedback submit hone ke baad yahan suggestions show honge.</p>}
              </div>
            </section>
          </div>
        )}

        {activeView === 'reports' && (
          <section className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
            <h2 className="text-2xl font-semibold">User Reports Verification</h2>
            <div className="mt-5 space-y-4">
              {filteredReports.map((report) => (
                <div key={report._id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-100">{report.status}</span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{report.category}</span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{report.priority} priority</span>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold">{report.barberId?.shopName || 'Unknown shop'}</h3>
                      <p className="mt-1 text-sm text-slate-400">Reported by {report.customerId?.name || 'Customer'} on {formatDate(report.createdAt)}</p>
                      <p className="mt-4 text-sm leading-6 text-slate-200">{report.message}</p>
                      {report.adminNote && <p className="mt-3 text-sm text-amber-100">Admin note: {report.adminNote}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 lg:flex-col">
                      <button disabled={actionLoading === report._id} onClick={() => handleReportAction(report._id, { status: 'verified', actionType: 'suspended', suspendedDays: 3, adminNote: 'Verified by admin. Shop suspended for 3 days.' })} className="theme-danger-btn text-sm">
                        Suspend 3 Days
                      </button>
                      <button disabled={actionLoading === report._id} onClick={() => handleReportAction(report._id, { status: 'verified', actionType: 'suspended', suspendedDays: 7, adminNote: 'Verified by admin. Shop suspended for 7 days.' })} className="theme-danger-btn text-sm">
                        Suspend 7 Days
                      </button>
                      <button disabled={actionLoading === report._id} onClick={() => handleReportAction(report._id, { status: 'rejected', adminNote: 'Report rejected after verification.' })} className="theme-secondary-btn text-sm">
                        Reject Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredReports.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-400">No reports found.</p>}
            </div>
          </section>
        )}

        {activeView === 'barbers' && (
          <section className="mt-8 grid gap-6 xl:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
              <h2 className="text-2xl font-semibold">Pending Barber Approvals</h2>
              <div className="mt-5 space-y-3">
                {filteredPending.map((barber) => (
                  <div key={barber._id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold">{barber.shopName || 'Unnamed shop'}</p>
                        <p className="text-sm text-slate-400">{barber.userId?.name || 'Unknown'} · {barber.location || 'No location'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button disabled={actionLoading === barber._id} onClick={() => handleApprove(barber._id)} className="theme-primary-btn text-sm">Approve</button>
                        <button disabled={actionLoading === barber._id} onClick={() => handleReject(barber._id)} className="theme-danger-btn text-sm">Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredPending.length === 0 && <p className="text-sm text-slate-400">No pending barber listing.</p>}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
              <h2 className="text-2xl font-semibold">Active Barber Shops</h2>
              <div className="mt-5 space-y-3">
                {analytics.barberRankings.map((barber) => (
                  <button key={barber._id} onClick={() => setSelectedBarber(barber)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{barber.shopName || 'Unnamed shop'}</p>
                        {getSuspensionLabel(barber) && (
                          <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-200">
                            {getSuspensionLabel(barber)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{barber.userId?.email || 'No email'} · {barber.location || 'No location'}</p>
                    </div>
                    <Eye size={18} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeView === 'customers' && (
          <section className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
            <h2 className="text-2xl font-semibold">Customer Management</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {analytics.customers.map((customer) => {
                const customerAppointments = appointments.filter((appointment) => appointment.customerId?._id === customer._id);
                return (
                  <div key={customer._id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                    <h3 className="text-lg font-semibold">{customer.name}</h3>
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><Mail size={14} /> {customer.email}</p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><Phone size={14} /> {customer.phone || 'No phone'}</p>
                    <p className="mt-4 text-sm text-slate-300">{customerAppointments.length} total bookings</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeView === 'services' && (
          <section className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
            <h2 className="text-2xl font-semibold">Service Management</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <div key={service._id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-amber-300">{service.category}</p>
                  <h3 className="mt-2 text-lg font-semibold">{service.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">{service.description || 'No description'}</p>
                  <p className="mt-4 font-semibold text-emerald-200">{formatCurrency(service.price)} · {service.duration} mins</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeView === 'finance' && (
          <section className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
              <h2 className="text-2xl font-semibold">Financial Report</h2>
              <div className="mt-5 space-y-4">
                <p className="rounded-2xl bg-slate-950/60 p-4 text-emerald-200">Revenue: {formatCurrency(analytics.totalRevenue)}</p>
                <p className="rounded-2xl bg-slate-950/60 p-4 text-sky-200">Invoices: {invoices.length}</p>
                <p className="rounded-2xl bg-slate-950/60 p-4 text-amber-200">Average order: {formatCurrency(analytics.completedAppointments ? analytics.totalRevenue / analytics.completedAppointments : 0)}</p>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
              <h2 className="flex items-center gap-2 text-2xl font-semibold"><TrendingUp className="text-emerald-300" /> Recent Money Flow</h2>
              <div className="mt-5 space-y-3">
                {invoices.slice(0, 8).map((invoice) => (
                  <div key={invoice._id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div>
                      <p className="font-semibold">{invoice.invoiceNumber || 'Invoice'}</p>
                      <p className="text-sm text-slate-400">{formatDate(invoice.invoiceDate)} · {invoice.paymentStatus}</p>
                    </div>
                    <p className="font-semibold text-emerald-200">{formatCurrency(invoice.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeView === 'settings' && (
          <section className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold"><Settings className="text-slate-300" /> Admin Settings</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <ShieldCheck className="text-emerald-300" />
                <h3 className="mt-4 font-semibold">Approval control</h3>
                <p className="mt-2 text-sm text-slate-400">New barber shops stay hidden until admin approval.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <AlertTriangle className="text-rose-300" />
                <h3 className="mt-4 font-semibold">Report action</h3>
                <p className="mt-2 text-sm text-slate-400">Verified reports can suspend a shop for 3 or 7 days.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <Clock className="text-sky-300" />
                <h3 className="mt-4 font-semibold">Realtime refresh</h3>
                <p className="mt-2 text-sm text-slate-400">Dashboard refreshes automatically every 25 seconds.</p>
              </div>
            </div>
          </section>
        )}

        {selectedBarber && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
              <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl rounded-[1.5rem] border border-white/10 bg-slate-950 p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Barber details</p>
                    <h2 className="mt-2 text-2xl font-semibold">{selectedBarber.shopName || 'Unnamed shop'}</h2>
                    <p className="mt-1 text-slate-400">{selectedBarber.userId?.name || 'Unknown barber'}</p>
                  </div>
                  <button onClick={() => setSelectedBarber(null)} className="rounded-full bg-white/10 p-2"><X size={18} /></button>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/5 p-4"><p className="text-sm text-slate-400">Revenue</p><p className="mt-1 font-semibold text-emerald-200">{formatCurrency(selectedBarber.revenue)}</p></div>
                  <div className="rounded-2xl bg-white/5 p-4"><p className="text-sm text-slate-400">Bookings</p><p className="mt-1 font-semibold text-sky-200">{selectedBarber.appointmentCount}</p></div>
                  <div className="rounded-2xl bg-white/5 p-4"><p className="text-sm text-slate-400">Customers</p><p className="mt-1 font-semibold text-violet-200">{selectedBarber.customerCount}</p></div>
                </div>
                <div className="mt-5 space-y-3 text-sm text-slate-300">
                  <p>Email: {selectedBarber.userId?.email || 'N/A'}</p>
                  <p>Phone: {selectedBarber.userId?.phone || 'N/A'}</p>
                  <p>Location: {selectedBarber.location || 'N/A'}</p>
                  <p>Hours: {selectedBarber.openingTime || '09:00'} - {selectedBarber.closingTime || '18:00'}</p>
                  <p>Bio: {selectedBarber.bio || 'No bio added.'}</p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
