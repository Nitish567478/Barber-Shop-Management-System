import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { invoicesAPI } from '../services/api';
import { Receipt, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Download, IndianRupee, Printer } from 'lucide-react';
import BarberShopLoader from '../components/BarberShopLoader';
import DashboardWrapper from '../components/dashboard/DashboardWrapper';
import { printReceipt } from '../utils/printReceipt';
import useAutoDismiss from '../hooks/useAutoDismiss';

const statusLabelMap = {
  completed: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
};

const statusBadgeMap = {
  completed: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300',
  pending: 'border-amber-400/30 bg-amber-400/15 text-amber-300',
  failed: 'border-red-400/30 bg-red-400/15 text-red-300',
};

const paymentMethodLabelMap = {
  cash: 'Cash at Shop',
  card: 'Credit / Debit Card',
  upi: 'UPI / QR Code',
  netbanking: 'Net Banking',
  wallet: 'Digital Wallet',
  online: 'Online Payment',
};

const methodLabelMap = paymentMethodLabelMap;

const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString('en-IN')}`;

const MyInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Auto-dismiss error messages after 4 seconds
  useAutoDismiss(error, setError, 4000);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const [stats, setStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
  });

  const fetchData = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');
      const response = await invoicesAPI.getUserInvoices();
      const invoicesList = response.data.invoices || [];
      setInvoices(invoicesList);

      const totalAmount = invoicesList.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const paidAmount = invoicesList
        .filter((inv) => inv.paymentStatus === 'completed')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const pendingAmount = invoicesList
        .filter((inv) => inv.paymentStatus === 'pending')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const failedAmount = invoicesList
        .filter((inv) => inv.paymentStatus === 'failed')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);

      setStats({
        totalAmount,
        paidAmount,
        pendingAmount,
        failedAmount,
      });
      setLastRefreshedAt(new Date());
    } catch (err) {
      setError('Failed to load invoices');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrintInvoice = (invoice) => {
    const shopName = invoice.barberId?.shopName || invoice.barberId?.userId?.name || 'Modern Barber Studio';
    const appt = invoice.appointmentId || {};
    const serviceList = (appt.serviceIds || (appt.serviceId ? [appt.serviceId] : [])).filter(Boolean);

    printReceipt({
      shopName,
      shopAddress: invoice.barberId?.address || 'Ranchi HQ, Main Road, Jharkhand',
      shopPhone: invoice.barberId?.phone || '+91 9934630687',
      barberName: invoice.barberId?.userId?.name || '',
      customerName: invoice.customerId?.name || 'Valued Customer',
      customerPhone: invoice.customerId?.phone || '',
      customerEmail: invoice.customerId?.email || '',
      appointmentDate: appt.appointmentDate || invoice.invoiceDate || invoice.createdAt,
      appointmentTime: appt.appointmentTime || 'Completed Slot',
      services: serviceList.length > 0 ? serviceList : [{ name: 'Barber Grooming Service', price: invoice.amount }],
      originalPrice: appt.originalPrice || invoice.amount,
      discountAmount: appt.discountAmount || 0,
      totalPaid: invoice.amount,
      transactionId: invoice.transactionId || invoice.invoiceNumber || 'TXN_OFFICIAL',
      paymentMethod: invoice.paymentMethod || 'Online Verified',
      invoiceNumber: invoice.invoiceNumber,
    });
  };

  const filteredInvoices = (Array.isArray(invoices) ? invoices : []).filter((invoice) => {
    if (!invoice) return false;
    const matchesFilter = filter === 'all' || invoice.paymentStatus === filter;
    const invoiceNumber = String(invoice.invoiceNumber || '').toLowerCase();
    const barberName = String(invoice.barberId?.shopName || invoice.barberId?.userId?.name || '').toLowerCase();
    const query = String(search || '').toLowerCase().trim();
    const matchesSearch = !query || invoiceNumber.includes(query) || barberName.includes(query);
    return matchesFilter && matchesSearch;
  });

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

  return (
    <DashboardWrapper
      role="customer"
      activeTab="my-invoices"
      title="My Invoices & Receipts"
      subtitle={`Total: ${invoices.length} billing records`}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search invoice # or barber..."
      onRefresh={() => fetchData({ silent: true })}
      isRefreshing={refreshing}
      lastUpdated={lastRefreshedAt}
    >
      {error && (
        <div className="alert alert-error mb-6 border border-red-400/20 bg-red-500/10 text-red-200">
          {error}
        </div>
      )}

      {/* STATS SUMMARY */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-400/20 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Paid</span>
            <CheckCircle2 size={18} className="text-emerald-300" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{formatCurrency(stats.paidAmount)}</p>
          <p className="mt-1 text-[11px] text-slate-400">Completed transactions</p>
        </div>

        <div className="rounded-2xl border border-amber-400/20 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Pending</span>
            <Clock size={18} className="text-amber-300" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-300">{formatCurrency(stats.pendingAmount)}</p>
          <p className="mt-1 text-[11px] text-slate-400">Awaiting clearance</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">All Invoices</span>
            <Receipt size={18} className="text-slate-300" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(stats.totalAmount)}</p>
          <p className="mt-1 text-[11px] text-slate-400">{invoices.length} total bills</p>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: 'all', label: `All Bills (${invoices.length})` },
          {
            key: 'completed',
            label: `Paid (${invoices.filter((i) => i.paymentStatus === 'completed').length})`,
          },
          {
            key: 'pending',
            label: `Pending (${invoices.filter((i) => i.paymentStatus === 'pending').length})`,
          },
          {
            key: 'failed',
            label: `Failed (${invoices.filter((i) => i.paymentStatus === 'failed').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
              filter === tab.key
                ? 'border-amber-300 bg-amber-400 text-slate-950 shadow-md'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-amber-300/30 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* INVOICE LIST */}
      {filteredInvoices.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-400">
          <Receipt size={40} className="mx-auto mb-3 text-slate-600" />
          <p className="text-base font-semibold text-white">No invoices found</p>
          <p className="mt-1 text-xs text-slate-500">Invoices are created when you finish your grooming visits.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => {
            const isExpanded = expandedInvoiceId === invoice._id;
            return (
              <div
                key={invoice._id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-md transition hover:border-white/20"
              >
                <div
                  onClick={() => setExpandedInvoiceId(isExpanded ? null : invoice._id)}
                  className="cursor-pointer p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10 text-amber-300">
                        <Receipt size={20} />
                      </div>
                      <div>
                        <p className="font-mono text-xs font-bold text-amber-200">
                          {invoice.invoiceNumber || 'INV-0000'}
                        </p>
                        <h3 className="text-base font-bold text-white">
                          {invoice.barberId?.shopName || 'Barber Shop'}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-base font-bold text-white">{formatCurrency(invoice.amount)}</p>
                        <span
                          className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            statusBadgeMap[invoice.paymentStatus] || 'border-white/10 bg-white/5 text-slate-300'
                          }`}
                        >
                          {statusLabelMap[invoice.paymentStatus] || invoice.paymentStatus}
                        </span>
                      </div>
                      <div className="rounded-lg bg-white/5 p-1 text-slate-400">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-slate-950/60 p-5 text-xs text-slate-300">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-slate-400">Payment Method</p>
                        <p className="mt-0.5 font-semibold text-white">
                          {methodLabelMap[invoice.paymentMethod] || invoice.paymentMethod || 'Cash'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Payment Status</p>
                        <p className="mt-0.5 font-semibold text-white capitalize">{invoice.paymentStatus}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Issued On</p>
                        <p className="mt-0.5 font-semibold text-white">
                          {new Date(invoice.invoiceDate || invoice.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Total Payable</p>
                        <div className="mt-0.5 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-bold text-amber-200">{formatCurrency(invoice.amount)}</p>
                          <div className="flex items-center gap-2">
                            {invoice.paymentStatus === 'pending' && (
                              <Link
                                to={`/payment?appointmentId=${invoice.appointmentId?._id || invoice.appointmentId}`}
                                className="rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1 text-xs font-bold text-slate-950 shadow-md transition hover:scale-105"
                              >
                                Pay Now ₹
                              </Link>
                            )}
                            {invoice.paymentStatus === 'completed' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrintInvoice(invoice);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300 transition hover:bg-amber-400/20 shadow-sm"
                              >
                                <Printer size={13} />
                                Print Receipt
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardWrapper>
  );
};

export default MyInvoices;
