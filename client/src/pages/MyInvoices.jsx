import React, { useEffect, useState } from 'react';
import { invoicesAPI } from '../services/api';
import BarberShopLoader from "../components/BarberShopLoader";
const statusLabelMap = {
  completed: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
};

const statusBadgeMap = {
  completed: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200',
  pending: 'border-amber-300/20 bg-amber-400/10 text-amber-200',
  failed: 'border-red-300/20 bg-red-400/10 text-red-200',
};

const methodLabelMap = {
  cash: 'Cash Payment',
  card: 'Card Payment',
  upi: 'UPI Transfer',
  online: 'Online Payment',
};

const MyInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
      } catch (err) {
        setError('Failed to load invoices');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredInvoices = filter === 'all'
    ? invoices
    : invoices.filter((invoice) => invoice.paymentStatus === filter);

  const recentInvoice = invoices[0];

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
          <p className="theme-subtitle">Billing Center</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">My Invoices</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Review payments, monitor pending balances, and open invoice details for each grooming visit.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {invoices.length} invoice records
            </span>
            <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
              Latest invoice: {recentInvoice?.invoiceNumber || 'Not available'}
            </span>
          </div>
        </div>

        {error && <div className="alert alert-error mb-6 border border-red-400/20 bg-red-500/10 text-red-200">{error}</div>}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.75rem] border border-amber-300/20 bg-gradient-to-br from-amber-400/15 to-transparent p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Total Amount</p>
            <p className="mt-4 text-3xl font-semibold text-amber-200">Rs. {stats.totalAmount}</p>
            <p className="mt-2 text-sm text-slate-300">Combined billing history</p>
          </div>
          <div className="rounded-[1.75rem] border border-emerald-300/20 bg-gradient-to-br from-emerald-400/15 to-transparent p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Paid</p>
            <p className="mt-4 text-3xl font-semibold text-emerald-200">Rs. {stats.paidAmount}</p>
            <p className="mt-2 text-sm text-slate-300">Completed payments</p>
          </div>
          <div className="rounded-[1.75rem] border border-amber-300/20 bg-gradient-to-br from-amber-400/15 to-transparent p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Pending</p>
            <p className="mt-4 text-3xl font-semibold text-amber-200">Rs. {stats.pendingAmount}</p>
            <p className="mt-2 text-sm text-slate-300">Awaiting payment clearance</p>
          </div>
          <div className="rounded-[1.75rem] border border-red-300/20 bg-gradient-to-br from-red-400/15 to-transparent p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Failed</p>
            <p className="mt-4 text-3xl font-semibold text-red-200">Rs. {stats.failedAmount}</p>
            <p className="mt-2 text-sm text-slate-300">Invoices needing attention</p>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'theme-primary-btn' : 'theme-secondary-btn'}
          >
            All ({invoices.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'theme-primary-btn' : 'theme-secondary-btn'}
          >
            Paid ({invoices.filter((invoice) => invoice.paymentStatus === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'theme-primary-btn' : 'theme-secondary-btn'}
          >
            Pending ({invoices.filter((invoice) => invoice.paymentStatus === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={filter === 'failed' ? 'theme-primary-btn' : 'theme-secondary-btn'}
          >
            Failed ({invoices.filter((invoice) => invoice.paymentStatus === 'failed').length})
          </button>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="theme-card py-12 text-center">
            <p className="text-lg text-slate-300">No invoices found for this filter.</p>
            <p className="mt-2 text-sm text-slate-400">
              Once bookings are invoiced, your billing history will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => {
              const isExpanded = expandedInvoiceId === invoice._id;
              const invoiceDate = invoice.invoiceDate || invoice.createdAt;
              const statusClasses = statusBadgeMap[invoice.paymentStatus] || 'border-white/10 bg-white/5 text-slate-200';

              return (
                <div key={invoice._id} className="theme-card overflow-hidden">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                    <div>
                      <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Invoice Number</p>
                      <p className="mt-3 text-xl font-semibold text-slate-100">
                        {invoice.invoiceNumber || invoice._id?.slice(-8)?.toUpperCase() || 'N/A'}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Appointment Ref: {invoice.appointmentId?.slice?.(-8)?.toUpperCase() || 'Not linked'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Amount</p>
                      <p className="mt-3 text-2xl font-semibold text-amber-200">Rs. {invoice.amount || 0}</p>
                      <p className="mt-2 text-sm text-slate-400">
                        Method: {methodLabelMap[invoice.paymentMethod] || 'Cash Payment'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Invoice Date</p>
                      <p className="mt-3 text-lg font-semibold text-slate-100">
                        {invoiceDate ? new Date(invoiceDate).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Created at {invoiceDate ? new Date(invoiceDate).toLocaleTimeString() : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Status</p>
                      <span className={`mt-3 inline-flex rounded-full border px-4 py-2 text-sm font-medium ${statusClasses}`}>
                        {statusLabelMap[invoice.paymentStatus] || 'Unknown'}
                      </span>
                    </div>

                    <div className="flex items-start justify-end">
                      <button
                        onClick={() => setExpandedInvoiceId(isExpanded ? null : invoice._id)}
                        className={isExpanded ? 'theme-primary-btn' : 'theme-secondary-btn'}
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
                      <div className="theme-soft-card">
                        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Payment Method</p>
                        <p className="mt-3 text-base font-semibold text-slate-100">
                          {methodLabelMap[invoice.paymentMethod] || 'Cash Payment'}
                        </p>
                      </div>
                      <div className="theme-soft-card">
                        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Payment State</p>
                        <p className="mt-3 text-base font-semibold text-slate-100">
                          {statusLabelMap[invoice.paymentStatus] || 'Unknown'}
                        </p>
                      </div>
                      <div className="theme-soft-card">
                        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Customer Notes</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {invoice.notes || 'No invoice notes were added for this payment.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyInvoices;
