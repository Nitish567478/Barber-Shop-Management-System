import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  Mail,
  Phone,
  Scissors,
  Settings,
  ShieldCheck,
  Star,
  TrendingUp,
  X,
  Users,
  Sparkles,
  Download,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Activity,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import BarberShopLoader from '../components/BarberShopLoader';
import DashboardWrapper from '../components/dashboard/DashboardWrapper';
import useAutoDismiss from '../hooks/useAutoDismiss';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'N/A');
const PAGE_SIZE = 10;

const FINANCE_CONFIG = {
  day: { label: 'Today', days: 1 },
  week: { label: 'Last 7 Days', days: 7 },
  month: { label: 'Last 30 Days', days: 30 },
};

const CHART_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

const getSuspensionLabel = (barber) => {
  if (!barber?.suspendedUntil) return '';
  const until = new Date(barber.suspendedUntil);
  if (Number.isNaN(until.getTime()) || until <= new Date()) return '';
  const days = Math.max(1, Math.ceil((until - new Date()) / (1000 * 60 * 60 * 24)));
  return `${days} day${days === 1 ? '' : 's'} suspended`;
};

const StarRating = ({ rating = 0, count }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={14}
        className={star <= Math.round(Number(rating || 0)) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
      />
    ))}
    <span className="ml-1 text-xs font-bold text-amber-200">
      {Number(rating || 0).toFixed(1)}{count !== undefined ? ` (${count})` : ''}
    </span>
  </div>
);

/* CUSTOM CHART TOOLTIP */
const CustomTooltip = ({ active, payload, label, isCurrency = false }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-md">
        <p className="font-semibold text-xs text-slate-300 border-b border-white/10 pb-1 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs py-0.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-slate-400 capitalize">{entry.name}:</span>
            </div>
            <span className="font-bold text-white">
              {entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('amount') || isCurrency
                ? formatCurrency(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, helper, icon: Icon, tone, trend = null, onClick = null }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={cn(
      "rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl transition-all duration-300",
      onClick && "cursor-pointer hover:border-amber-300/40 hover:-translate-y-1 hover:shadow-2xl"
    )}
  >
    <div className="flex items-center justify-between gap-4">
      <div className={cn('rounded-2xl p-3', tone)}>
        <Icon size={22} />
      </div>
      <div className="text-right">
        <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-slate-400">{title}</p>
        {trend && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 mt-0.5">
            <ArrowUpRight size={12} /> {trend}
          </span>
        )}
      </div>
    </div>
    <p className="mt-4 text-3xl font-bold text-white tracking-tight">{value}</p>
    <p className="mt-1.5 text-xs text-slate-400">{helper}</p>
  </motion.div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const [error, setError] = useState('');
  useAutoDismiss(error, setError, 4000);
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveView(location.state.activeTab);
    }
  }, [location.state]);
  const [financeRange, setFinanceRange] = useState('week');
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

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
      setLastRefreshedAt(new Date());
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

  /* COMPREHENSIVE ANALYTICS CALCULATION */
  const analytics = useMemo(() => {
    const paidInvoices = invoices.filter((invoice) => invoice.paymentStatus === 'completed');
    const invoicedAppointmentIds = new Set(
      paidInvoices.map((invoice) => String(invoice.appointmentId?._id || invoice.appointmentId)).filter(Boolean)
    );
    const completedAppointments = appointments.filter((appointment) => appointment.status === 'completed');
    const invoiceRevenue = paidInvoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
    const completedRevenueWithoutInvoice = completedAppointments
      .filter((appointment) => !invoicedAppointmentIds.has(String(appointment._id)))
      .reduce((sum, appointment) => sum + Number(appointment.price || 0), 0);
    const totalRevenue = invoiceRevenue + completedRevenueWithoutInvoice;

    const scheduledAppointments = appointments.filter((appointment) => appointment.status === 'scheduled').length;
    const completedCount = completedAppointments.length;
    const cancelledAppointments = appointments.filter((appointment) => appointment.status === 'cancelled').length;
    const noShowAppointments = appointments.filter((appointment) => appointment.status === 'no-show').length;

    const totalBookings = appointments.length;
    const completionRate = totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0;

    const reviews = appointments.filter((appointment) => appointment.feedback?.submittedAt);
    const averageRating = reviews.length
      ? reviews.reduce((sum, appointment) => sum + Number(appointment.feedback?.rating || 0), 0) / reviews.length
      : 0;

    /* Rating Distribution */
    const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((r) => Math.round(Number(r.feedback?.rating || 0)) === stars).length;
      return {
        stars: `${stars} Star`,
        count,
        percentage: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
      };
    });

    /* Booking Status Distribution Chart Data */
    const bookingStatusData = [
      { name: 'Completed', value: completedCount, color: '#10b981' },
      { name: 'Scheduled', value: scheduledAppointments, color: '#0ea5e9' },
      { name: 'Cancelled', value: cancelledAppointments, color: '#f43f5e' },
      { name: 'No-Show', value: noShowAppointments, color: '#f59e0b' },
    ].filter((item) => item.value > 0);

    /* Category Popularity Data */
    const categoryCountMap = {};
    appointments.forEach((apt) => {
      const cat = apt.serviceId?.category || 'haircut';
      categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;
    });
    const categoryData = Object.entries(categoryCountMap).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      bookings: count,
    }));

    const activeBarbers = barbers.filter((barber) => barber.isApproved && barber.isActive);
    const suspendedBarbers = barbers.filter((barber) => {
      const until = new Date(barber.suspendedUntil || null);
      return until instanceof Date && !Number.isNaN(until.getTime()) && until > new Date();
    }).length;

    const barberRankings = barbers.map((barber) => {
      const barberAppointments = appointments.filter((appointment) => appointment.barberId?._id === barber._id);
      const barberInvoices = invoices.filter((invoice) => {
        const appointment = appointments.find((item) => String(item._id) === String(invoice.appointmentId?._id || invoice.appointmentId));
        return appointment && appointment.barberId?._id === barber._id;
      });

      const barberPaidInvoices = barberInvoices.filter((invoice) => invoice.paymentStatus === 'completed');
      const barberInvoicedAppointmentIds = new Set(
        barberPaidInvoices.map((invoice) => String(invoice.appointmentId?._id || invoice.appointmentId)).filter(Boolean)
      );
      const barberCompletedAppointments = barberAppointments.filter((appointment) => appointment.status === 'completed');
      const barberRevenue = barberPaidInvoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)
        + barberCompletedAppointments
            .filter((appointment) => !barberInvoicedAppointmentIds.has(String(appointment._id)))
            .reduce((sum, appointment) => sum + Number(appointment.price || 0), 0);

      const barberReviews = barberAppointments.filter((appointment) => appointment.feedback?.submittedAt);
      const barberRating = barberReviews.length
        ? barberReviews.reduce((sum, appointment) => sum + Number(appointment.feedback?.rating || 0), 0) / barberReviews.length
        : 0;

      const customerIds = new Set(
        barberAppointments.map((appointment) => appointment.customerId?._id).filter(Boolean)
      );

      const score = barberAppointments.length * 2 + barberRating * 10 + barberRevenue * 0.05;

      return {
        ...barber,
        appointmentCount: barberAppointments.length,
        completedCount: barberCompletedAppointments.length,
        customerCount: customerIds.size,
        revenue: barberRevenue,
        rating: barberRating,
        feedbackCount: barberReviews.length,
        score,
      };
    }).sort((a, b) => b.score - a.score);

    const openReports = reports.filter((report) => report.status === 'open').length;
    const verifiedReports = reports.filter((report) => report.status === 'verified').length;
    const rejectedReports = reports.filter((report) => report.status === 'rejected').length;

    return {
      totalRevenue,
      scheduledAppointments,
      completedAppointments: completedCount,
      cancelledAppointments,
      noShowAppointments,
      completionRate,
      activeBarbers: activeBarbers.length,
      suspendedBarbers,
      barberRankings,
      reviews,
      averageRating,
      ratingBreakdown,
      bookingStatusData,
      categoryData,
      openReports,
      verifiedReports,
      rejectedReports,
    };
  }, [appointments, barbers, invoices, reports]);

  /* TIME-SERIES TREND CHART DATA */
  const financeMetrics = useMemo(() => {
    const days = FINANCE_CONFIG[financeRange]?.days || 7;
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const invoicesInRange = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.invoiceDate || invoice.createdAt || null);
      return (
        invoice.paymentStatus === 'completed' &&
        invoiceDate instanceof Date &&
        !Number.isNaN(invoiceDate.getTime()) &&
        invoiceDate >= start
      );
    });

    const appointmentsInRange = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate || null);
      return (
        appointment.status === 'completed' &&
        appointmentDate instanceof Date &&
        !Number.isNaN(appointmentDate.getTime()) &&
        appointmentDate >= start
      );
    });

    const revenue = invoicesInRange.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)
      + appointmentsInRange
          .filter((appointment) => !invoices.some((invoice) => String(invoice.appointmentId?._id || invoice.appointmentId) === String(appointment._id)))
          .reduce((sum, appointment) => sum + Number(appointment.price || 0), 0);

    const trendChartData = Array.from({ length: days }).map((_, index) => {
      const labelDate = new Date(start);
      labelDate.setDate(start.getDate() + index);
      const label = financeRange === 'day'
        ? `${labelDate.getHours()}:00`
        : labelDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayStart = new Date(labelDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(labelDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayRevenue = invoicesInRange
        .filter((invoice) => {
          const invoiceDate = new Date(invoice.invoiceDate || invoice.createdAt || null);
          return invoiceDate >= dayStart && invoiceDate <= dayEnd;
        })
        .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);

      const dayBookings = appointmentsInRange.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate || null);
        return appointmentDate >= dayStart && appointmentDate <= dayEnd;
      }).length;

      return {
        date: label,
        Revenue: dayRevenue,
        Bookings: dayBookings,
      };
    });

    return {
      revenue,
      bookings: appointmentsInRange.length,
      invoices: invoicesInRange.length,
      trendChartData,
    };
  }, [appointments, financeRange, invoices]);

  /* EXPORT AUDIT CSV FUNCTION */
  const exportToCSV = () => {
    const headers = ['Booking ID,Customer Name,Customer Email,Shop Name,Service,Date,Time,Price,Status\n'];
    const rows = appointments.map((apt) => {
      const custName = `"${apt.customerId?.name || 'Customer'}"`;
      const custEmail = `"${apt.customerId?.email || 'N/A'}"`;
      const shop = `"${apt.barberId?.shopName || 'Shop'}"`;
      const service = `"${apt.serviceId?.name || 'Service'}"`;
      const date = `"${formatDate(apt.appointmentDate)}"`;
      const time = `"${apt.appointmentTime || ''}"`;
      const price = apt.price || 0;
      const status = `"${apt.status || ''}"`;
      return `${apt._id},${custName},${custEmail},${shop},${service},${date},${time},${price},${status}\n`;
    });

    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `barabar_platform_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      const matchSearch =
        search === '' ||
        appointment.barberId?.shopName?.toLowerCase().includes(search.toLowerCase()) ||
        appointment.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        appointment.customerId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        appointment.serviceId?.name?.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchSearch;
    });
  }, [appointments, search, statusFilter]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      return (
        search === '' ||
        report.barberId?.shopName?.toLowerCase().includes(search.toLowerCase()) ||
        report.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        report.message?.toLowerCase().includes(search.toLowerCase()) ||
        report.category?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [reports, search]);

  const filteredPending = useMemo(() => {
    return pendingBarbers.filter((barber) => {
      return (
        search === '' ||
        barber.shopName?.toLowerCase().includes(search.toLowerCase()) ||
        barber.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        barber.location?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [pendingBarbers, search]);

  const filteredActiveBarbers = useMemo(() => {
    return barbers.filter((barber) => {
      return (
        search === '' ||
        barber.shopName?.toLowerCase().includes(search.toLowerCase()) ||
        barber.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        barber.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        barber.location?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [barbers, search]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      return (
        search === '' ||
        service.name?.toLowerCase().includes(search.toLowerCase()) ||
        service.category?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [services, search]);

  const filteredCustomers = useMemo(() => {
    const customerMap = new Map();
    appointments.forEach((appointment) => {
      if (appointment.customerId && !customerMap.has(appointment.customerId._id)) {
        customerMap.set(appointment.customerId._id, appointment.customerId);
      }
    });

    return Array.from(customerMap.values()).filter((customer) => {
      return (
        search === '' ||
        customer.name?.toLowerCase().includes(search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [appointments, search]);

  const totalAppointmentPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE));
  const currentAppointmentPage = Math.min(appointmentsPage, totalAppointmentPages);
  const paginatedAppointments = filteredAppointments.slice(
    (currentAppointmentPage - 1) * PAGE_SIZE,
    currentAppointmentPage * PAGE_SIZE
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

  const getTabTitle = () => {
    switch (activeView) {
      case 'overview':
        return 'Control Center & Analytics';
      case 'bookings':
        return 'Bookings & Orders Database';
      case 'barbers':
        return 'Barber Shop Management & Approvals';
      case 'customers':
        return 'Customer Directory & Profiles';
      case 'services':
        return 'Platform Services Catalog';
      case 'reports':
        return 'Reports & Platform Safety Moderation';
      case 'finance':
        return 'Financial Reports & Revenue Charts';
      case 'settings':
        return 'Platform Rules & System Settings';
      default:
        return 'Admin Master Console';
    }
  };

  return (
    <DashboardWrapper
      role="admin"
      activeTab={activeView}
      onTabChange={setActiveView}
      title={getTabTitle()}
      subtitle="Executive dashboard, real-time charts, partner moderation & audit controls"
      badges={{
        pendingBarbers: pendingBarbers.length,
        openReports: analytics.openReports,
        totalBookings: appointments.length,
        customersCount: filteredCustomers.length,
      }}
      notificationsData={{
        pendingBarbers: pendingBarbers.length,
        openReports: analytics.openReports,
      }}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search shops, bookings, customers..."
      onRefresh={() => fetchDashboard({ silent: true })}
      isRefreshing={refreshing}
      lastUpdated={lastRefreshedAt}
      headerActions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportToCSV}
            title="Download CSV Audit Report"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-amber-300/40 hover:bg-white/10 hover:text-white"
          >
            <Download size={14} className="text-amber-300" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* TOP STAT KPI TILES */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Platform Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          helper="Paid invoices + completed visits"
          icon={IndianRupee}
          tone="bg-emerald-400/15 text-emerald-300"
          trend="+18.4% this month"
          onClick={() => setActiveView('finance')}
        />
        <StatCard
          title="Booking Volume"
          value={appointments.length}
          helper={`${analytics.completionRate}% completion rate (${analytics.completedAppointments} completed)`}
          icon={CalendarCheck}
          tone="bg-sky-400/15 text-sky-300"
          trend={`${analytics.scheduledAppointments} scheduled`}
          onClick={() => setActiveView('bookings')}
        />
        <StatCard
          title="Partner Barbers"
          value={barbers.length}
          helper={`${pendingBarbers.length} pending approval, ${analytics.suspendedBarbers} suspended`}
          icon={Scissors}
          tone="bg-amber-400/15 text-amber-300"
          trend={`${analytics.activeBarbers} online`}
          onClick={() => setActiveView('barbers')}
        />
        <StatCard
          title="Incident Reports"
          value={analytics.openReports}
          helper={`${analytics.verifiedReports} verified, ${analytics.rejectedReports} resolved`}
          icon={AlertTriangle}
          tone="bg-rose-400/15 text-rose-300"
          trend={analytics.openReports > 0 ? `${analytics.openReports} need review` : 'All clean'}
          onClick={() => setActiveView('reports')}
        />
      </section>

      {/* VIEW: OVERVIEW */}
      {activeView === 'overview' && (
        <div className="space-y-8">
          {/* CHARTS GRID 1: REVENUE TREND + BOOKING PIE */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* AREA CHART: Revenue Growth Trends */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl lg:col-span-2">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-300" />
                    <h2 className="text-lg font-bold text-white">Revenue Growth & Volume Trend</h2>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Interactive time-series analysis for {FINANCE_CONFIG[financeRange].label.toLowerCase()}.
                  </p>
                </div>
                <div className="flex gap-1.5 rounded-xl border border-white/10 bg-slate-950 p-1">
                  {['day', 'week', 'month'].map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setFinanceRange(range)}
                      className={cn(
                        'rounded-lg px-3 py-1 text-xs font-semibold transition',
                        financeRange === range
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      {range === 'day' ? 'Day' : range === 'week' ? 'Week' : 'Month'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financeMetrics.trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="Revenue"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Bookings"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#bookingsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DONUT PIE CHART: Booking Status Breakdown */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <PieIcon size={18} className="text-amber-300" />
                    <h2 className="text-lg font-bold text-white">Booking Status</h2>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{appointments.length} total</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">Order distribution across all partner barber studios.</p>
              </div>

              <div className="h-56 w-full relative my-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.bookingStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analytics.bookingStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Stats */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-white">{analytics.completionRate}%</span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Completed</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs">
                {analytics.bookingStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-400">{item.name}:</span>
                    <strong className="text-white">{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CHARTS GRID 2: TOP BARBERS LEADERBOARD + POPULAR SERVICE CATEGORIES */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* BAR CHART: Top Barber Studios by Revenue */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Award size={20} className="text-amber-300" />
                  <div>
                    <h2 className="text-lg font-bold text-white">Top Barber Studios</h2>
                    <p className="text-xs text-slate-400">Revenue leaderboard across top partner shops.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {analytics.barberRankings.slice(0, 5).map((barber, index) => {
                  const maxRev = Math.max(...analytics.barberRankings.map((b) => b.revenue), 1);
                  const widthPercent = Math.max(8, Math.round((barber.revenue / maxRev) * 100));
                  return (
                    <div key={barber._id} className="rounded-2xl border border-white/5 bg-slate-950/60 p-3.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 font-bold text-amber-200 text-[11px]">
                            #{index + 1}
                          </span>
                          <span className="font-bold text-white truncate">{barber.shopName || 'Barber Shop'}</span>
                          <span className="text-slate-400 truncate hidden sm:inline">({barber.userId?.name})</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-emerald-300">{formatCurrency(barber.revenue)}</span>
                          <StarRating rating={barber.rating} />
                        </div>
                      </div>
                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BAR CHART: Service Categories Popularity */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Scissors size={20} className="text-sky-300" />
                  <div>
                    <h2 className="text-lg font-bold text-white">Popular Service Categories</h2>
                    <p className="text-xs text-slate-400">Booking frequency by service types.</p>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="bookings" fill="#0ea5e9" radius={[8, 8, 0, 0]}>
                      {analytics.categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* CUSTOMER SATISFACTION & VERIFIED REVIEWS */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
            <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Customer Satisfaction & Rating Breakdown</h2>
                <p className="text-xs text-slate-400">Ratings submitted by clients after completed services.</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-2">
                <StarRating rating={analytics.averageRating} count={analytics.reviews.length} />
                <span className="text-xs font-bold text-amber-200">
                  {analytics.averageRating.toFixed(1)} / 5 Overall Score
                </span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 items-center">
              {/* Star Rating Bars */}
              <div className="space-y-2.5">
                {analytics.ratingBreakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-3 text-xs">
                    <span className="w-14 font-semibold text-slate-300">{row.stars}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${row.percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-bold text-slate-400">{row.count} ({row.percentage}%)</span>
                  </div>
                ))}
              </div>

              {/* Recent Testimonial Snippets */}
              <div className="space-y-2.5">
                {analytics.reviews.slice(0, 3).map((r) => (
                  <div key={r._id} className="rounded-2xl border border-white/5 bg-slate-950/60 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-white">{r.customerId?.name || 'Customer'}</strong>
                      <StarRating rating={r.feedback?.rating} />
                    </div>
                    <p className="mt-1 text-slate-300 italic">"{r.feedback?.comment || 'Great experience!'}"</p>
                  </div>
                ))}
                {analytics.reviews.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No reviews recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: BOOKINGS */}
      {activeView === 'bookings' && (
        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">All Platform Bookings</h2>
              <p className="mt-0.5 text-xs text-slate-400">Searchable global appointment ledger across all partner salons.</p>
            </div>
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'all', label: 'All' },
                { key: 'completed', label: 'Completed' },
                { key: 'scheduled', label: 'Scheduled' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    'rounded-xl border px-3 py-1 text-xs font-semibold transition',
                    statusFilter === tab.key
                      ? 'border-amber-300 bg-amber-400 text-slate-950 font-bold'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {paginatedAppointments.map((appointment, index) => (
              <div key={appointment._id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-white/20">
                <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/15 font-bold text-amber-100 text-xs">
                    {(currentAppointmentPage - 1) * PAGE_SIZE + index + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-white">{appointment.customerId?.name || 'Customer'}</p>
                      <span className="text-xs text-slate-400">at</span>
                      <strong className="text-xs text-amber-200">{appointment.barberId?.shopName || 'Barber shop'}</strong>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Service: <span className="text-slate-200">{appointment.serviceId?.name || 'Service'}</span> ·{' '}
                      {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {appointment.customerId?.email || 'No email'} · {appointment.customerId?.phone || 'No phone'}
                    </p>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="font-bold text-emerald-300 text-sm">{formatCurrency(appointment.price)}</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        appointment.status === 'completed'
                          ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
                          : appointment.status === 'scheduled'
                          ? 'bg-sky-400/15 text-sky-300 border border-sky-400/30'
                          : 'bg-red-400/15 text-red-300 border border-red-400/30'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredAppointments.length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400">
                No bookings found matching filters.
              </p>
            )}
          </div>

          {filteredAppointments.length > PAGE_SIZE && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {Array.from({ length: totalAppointmentPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setAppointmentsPage(page)}
                  className={cn(
                    'h-9 min-w-[2.25rem] rounded-xl border px-3 text-xs font-bold transition',
                    currentAppointmentPage === page
                      ? 'border-amber-300 bg-amber-400 text-slate-950'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:border-amber-300/40'
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* VIEW: BARBERS */}
      {activeView === 'barbers' && (
        <section className="grid gap-6 xl:grid-cols-2">
          {/* Pending Approvals */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Pending Shop Approvals</h2>
                <p className="mt-0.5 text-xs text-slate-400">Barber shops awaiting review before going public.</p>
              </div>
              <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200 animate-pulse">
                {filteredPending.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {filteredPending.map((barber) => (
                <div key={barber._id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-bold text-white">{barber.shopName || 'Unnamed Shop'}</p>
                      <p className="text-xs text-slate-400">
                        Owner: {barber.userId?.name || 'Unknown'} · Location: {barber.location || 'No location'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={actionLoading === barber._id}
                        onClick={() => handleApprove(barber._id)}
                        className="theme-primary-btn text-xs font-semibold py-1.5 px-3"
                      >
                        Approve
                      </button>
                      <button
                        disabled={actionLoading === barber._id}
                        onClick={() => handleReject(barber._id)}
                        className="theme-danger-btn text-xs font-semibold py-1.5 px-3"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredPending.length === 0 && (
                <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400">
                  No pending barber approvals right now.
                </p>
              )}
            </div>
          </div>

          {/* Active Barber Studios */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Active Barber Studios</h2>
                <p className="mt-0.5 text-xs text-slate-400">Click a shop card to inspect complete details.</p>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">
                {filteredActiveBarbers.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {filteredActiveBarbers.map((barber) => (
                <button
                  key={barber._id}
                  onClick={() => setSelectedBarber(barber)}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:border-amber-300/30"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-white">{barber.shopName || 'Unnamed Shop'}</p>
                      {getSuspensionLabel(barber) && (
                        <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-200">
                          {getSuspensionLabel(barber)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {barber.userId?.email || 'No email'} · {barber.location || 'No location'}
                    </p>
                  </div>
                  <Eye size={18} className="text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIEW: CUSTOMERS */}
      {activeView === 'customers' && (
        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Registered Customer Directory</h2>
              <p className="mt-0.5 text-xs text-slate-400">Customer contact credentials and booking frequency.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {filteredCustomers.length} Customers
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => {
              const customerAppointments = appointments.filter((a) => a.customerId?._id === customer._id);
              return (
                <div key={customer._id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <h3 className="text-sm font-bold text-white">{customer.name}</h3>
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-400 break-all">
                    <Mail size={13} className="shrink-0" /> {customer.email}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <Phone size={13} className="shrink-0" /> {customer.phone || 'No phone'}
                  </p>
                  <div className="mt-3 rounded-xl border border-white/5 bg-white/5 p-2 text-center text-xs font-semibold text-amber-200">
                    {customerAppointments.length} total bookings
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* VIEW: SERVICES */}
      {activeView === 'services' && (
        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Platform Services Catalog</h2>
              <p className="mt-0.5 text-xs text-slate-400">All grooming services currently configured across all salons.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {filteredServices.length} Services
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <div key={service._id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <span className="rounded-md bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  {service.category}
                </span>
                <h3 className="mt-2 text-sm font-bold text-white">{service.name}</h3>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{service.description || 'No description'}</p>
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-xs">
                  <span className="font-bold text-emerald-300">{formatCurrency(service.price)}</span>
                  <span className="text-slate-400">{service.duration} mins</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* VIEW: REPORTS */}
      {activeView === 'reports' && (
        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">User Incident Reports & Safety Moderation</h2>
              <p className="mt-0.5 text-xs text-slate-400">Review reported salon complaints and apply safety penalties.</p>
            </div>
            <span className="rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-200">
              {analytics.openReports} Open
            </span>
          </div>

          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div key={report._id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-200">
                        {report.status}
                      </span>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-slate-300">{report.category}</span>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-slate-300">{report.priority} priority</span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-white">{report.barberId?.shopName || 'Unknown Shop'}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Reported by {report.customerId?.name || 'Customer'} on {formatDate(report.createdAt)}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-slate-200">{report.message}</p>
                    {report.adminNote && <p className="mt-2 text-xs text-amber-200">Admin note: {report.adminNote}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2 lg:flex-col justify-center">
                    {report.status === 'open' ? (
                      <>
                        <button
                          disabled={actionLoading === report._id}
                          onClick={() =>
                            handleReportAction(report._id, {
                              status: 'verified',
                              actionType: 'suspended',
                              suspendedDays: 3,
                              adminNote: 'Verified by admin. Shop suspended for 3 days.',
                            })
                          }
                          className="theme-danger-btn text-xs font-semibold py-1.5 px-3"
                        >
                          Suspend 3 Days
                        </button>
                        <button
                          disabled={actionLoading === report._id}
                          onClick={() =>
                            handleReportAction(report._id, {
                              status: 'verified',
                              actionType: 'suspended',
                              suspendedDays: 7,
                              adminNote: 'Verified by admin. Shop suspended for 7 days.',
                            })
                          }
                          className="theme-danger-btn text-xs font-semibold py-1.5 px-3"
                        >
                          Suspend 7 Days
                        </button>
                        <button
                          disabled={actionLoading === report._id}
                          onClick={() =>
                            handleReportAction(report._id, {
                              status: 'rejected',
                              adminNote: 'Report rejected after investigation.',
                            })
                          }
                          className="theme-secondary-btn text-xs font-semibold py-1.5 px-3"
                        >
                          Reject Report
                        </button>
                      </>
                    ) : (
                      <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-xs font-semibold text-slate-300">
                        {report.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredReports.length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400">
                No reports found matching your search.
              </p>
            )}
          </div>
        </section>
      )}

      {/* VIEW: FINANCE */}
      {activeView === 'finance' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white">Financial Ledger Summary</h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-slate-950/60 p-4">
                  <p className="text-xs text-slate-400">Total System Revenue</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-300">{formatCurrency(analytics.totalRevenue)}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/60 p-4">
                  <p className="text-xs text-slate-400">Invoices Generated</p>
                  <p className="mt-1 text-xl font-bold text-sky-200">{invoices.length} Invoices</p>
                </div>
                <div className="rounded-2xl bg-slate-950/60 p-4">
                  <p className="text-xs text-slate-400">Average Order Value</p>
                  <p className="mt-1 text-xl font-bold text-amber-200">
                    {formatCurrency(
                      analytics.completedAppointments ? analytics.totalRevenue / analytics.completedAppointments : 0
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* AREA CHART */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl lg:col-span-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white">Revenue Timeline</h2>
                <div className="flex gap-1.5 rounded-xl border border-white/10 bg-slate-950 p-1">
                  {['day', 'week', 'month'].map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setFinanceRange(range)}
                      className={cn(
                        'rounded-lg px-3 py-1 text-xs font-semibold transition',
                        financeRange === range ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      )}
                    >
                      {range === 'day' ? 'Day' : range === 'week' ? 'Week' : 'Month'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64 w-full pt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financeMetrics.trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2.5} fill="#10b981" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* RECENT INVOICES LIST */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Recent Invoices Generated</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {invoices.slice(0, 9).map((inv) => (
                <div key={inv._id} className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 text-xs">
                  <div className="flex justify-between">
                    <span className="font-mono font-bold text-amber-200">{inv.invoiceNumber || 'INV'}</span>
                    <span className="font-bold text-emerald-300">{formatCurrency(inv.amount)}</span>
                  </div>
                  <p className="mt-1 text-slate-400">{formatDate(inv.invoiceDate || inv.createdAt)}</p>
                  <p className="mt-2 text-[11px] text-slate-300 capitalize">Method: {inv.paymentMethod || 'cash'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {activeView === 'settings' && (
        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Settings className="text-amber-300" size={22} /> Admin Platform Rules & Controls
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <ShieldCheck className="text-emerald-300" size={24} />
              <h3 className="mt-3 font-bold text-white">Approval Protocol</h3>
              <p className="mt-1 text-xs text-slate-400">All registered partner shops remain hidden until verified.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <AlertTriangle className="text-rose-300" size={24} />
              <h3 className="mt-3 font-bold text-white">Dispute Moderation</h3>
              <p className="mt-1 text-xs text-slate-400">Suspends problematic salon listings for 3 or 7 days.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <Activity className="text-sky-300" size={24} />
              <h3 className="mt-3 font-bold text-white">Background Sync</h3>
              <p className="mt-1 text-xs text-slate-400">Auto-syncs system metrics every 25 seconds in background.</p>
            </div>
          </div>
        </section>
      )}

      {/* BARBER DETAILS POPUP MODAL */}
      {selectedBarber && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Partner Shop
                  </span>
                  <h2 className="mt-2 text-2xl font-bold text-white">{selectedBarber.shopName || 'Unnamed Shop'}</h2>
                  <p className="text-xs text-slate-400">{selectedBarber.userId?.name || 'Unknown Barber'}</p>
                </div>
                <button
                  onClick={() => setSelectedBarber(null)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/5 p-3 text-center">
                  <p className="text-[10px] uppercase text-slate-400 font-semibold">Revenue</p>
                  <p className="mt-1 text-sm font-bold text-emerald-300">{formatCurrency(selectedBarber.revenue)}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3 text-center">
                  <p className="text-[10px] uppercase text-slate-400 font-semibold">Bookings</p>
                  <p className="mt-1 text-sm font-bold text-sky-200">{selectedBarber.appointmentCount}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3 text-center">
                  <p className="text-[10px] uppercase text-slate-400 font-semibold">Clients</p>
                  <p className="mt-1 text-sm font-bold text-violet-200">{selectedBarber.customerCount}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span className="text-slate-400">Email</span>
                  <span>{selectedBarber.userId?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span className="text-slate-400">Phone</span>
                  <span>{selectedBarber.userId?.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span className="text-slate-400">Location</span>
                  <span>{selectedBarber.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span className="text-slate-400">Working Hours</span>
                  <span>{selectedBarber.openingTime || '09:00'} - {selectedBarber.closingTime || '18:00'}</span>
                </div>
                {selectedBarber.bio && (
                  <div className="pt-2">
                    <p className="text-slate-400">Bio:</p>
                    <p className="mt-1 text-slate-200 bg-white/5 p-3 rounded-xl">{selectedBarber.bio}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedBarber(null)}
                className="theme-secondary-btn mt-6 w-full text-xs font-semibold"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </DashboardWrapper>
  );
};

export default AdminDashboard;
