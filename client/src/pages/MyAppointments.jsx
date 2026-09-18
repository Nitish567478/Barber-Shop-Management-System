import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { appointmentsAPI, reportsAPI } from '../services/api';
import { Star, X, Calendar, Scissors, AlertTriangle, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import BarberShopLoader from '../components/BarberShopLoader';
import DashboardWrapper from '../components/dashboard/DashboardWrapper';
import useAutoDismiss from '../hooks/useAutoDismiss';

const getBarberName = (barber) => barber?.userId?.name || 'Any available barber';
const getServiceNames = (appointment) => {
  const services = appointment?.serviceIds?.length ? appointment.serviceIds : appointment?.serviceId ? [appointment.serviceId] : [];
  return services.map((service) => service?.name || 'Unknown service').join(', ');
};

const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    {[1, 2, 3, 4, 5].map((rating) => (
      <button
        key={rating}
        type="button"
        onClick={() => onChange(rating)}
        className="rounded-full p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
        aria-label={`${rating} star`}
      >
        <Star
          size={30}
          className={rating <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
        />
      </button>
    ))}
    <span className="ml-2 text-sm font-bold text-amber-100">{value} / 5</span>
  </div>
);

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-dismiss error and success messages after 4 seconds
  useAutoDismiss(error, setError, 4000);
  useAutoDismiss(success, setSuccess, 4000);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '', improvement: '' });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [dismissedFeedbackIds, setDismissedFeedbackIds] = useState([]);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportForm, setReportForm] = useState({ category: 'service', message: '' });
  const [reportLoading, setReportLoading] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  const fetchData = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');
      const appointmentsRes = await appointmentsAPI.getUserAppointments();
      setAppointments(appointmentsRes.data.appointments || []);
      setLastRefreshedAt(new Date());
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (feedbackTarget) return;

    const pendingFeedback = appointments.find(
      (appointment) =>
        appointment.status === 'completed' &&
        !appointment.feedback?.submittedAt &&
        !dismissedFeedbackIds.includes(appointment._id)
    );

    if (pendingFeedback) {
      setFeedbackTarget(pendingFeedback);
    }
  }, [appointments, dismissedFeedbackIds, feedbackTarget]);

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentsAPI.cancel(appointmentId);
        setAppointments((prev) =>
          prev.map((apt) => (apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt))
        );
        setSuccess('Appointment cancelled successfully.');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cancel appointment');
      }
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackTarget) return;

    try {
      setFeedbackLoading(true);
      const response = await appointmentsAPI.submitFeedback(feedbackTarget._id, feedbackForm);
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === feedbackTarget._id ? response.data.appointment : appointment
        )
      );
      setFeedbackTarget(null);
      setFeedbackForm({ rating: 5, comment: '', improvement: '' });
      setDismissedFeedbackIds((prev) => prev.filter((id) => id !== feedbackTarget._id));
      setSuccess('Thank you! Your review has been recorded.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportTarget) return;

    try {
      setReportLoading(true);
      await reportsAPI.create({
        appointmentId: reportTarget._id,
        barberId: reportTarget.barberId?._id,
        ...reportForm,
      });
      setReportTarget(null);
      setReportForm({ category: 'service', message: '' });
      setSuccess('Report submitted to admin for verification.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setReportLoading(false);
    }
  };

  const filtered = appointments.filter((apt) => {
    const matchesFilter = filter === 'all' || apt.status === filter;
    const barberName = getBarberName(apt.barberId)?.toLowerCase();
    const serviceName = getServiceNames(apt)?.toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = !search || barberName.includes(query) || serviceName.includes(query);
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
      activeTab="my-appointments"
      title="My Appointments"
      subtitle={`Total: ${appointments.length} appointment records`}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by barber or service..."
      onRefresh={() => fetchData({ silent: true })}
      isRefreshing={refreshing}
      lastUpdated={lastRefreshedAt}
      headerActions={
        <button
          type="button"
          onClick={() => navigate('/barbers')}
          className="theme-primary-btn flex items-center gap-2 text-xs font-semibold"
        >
          <Scissors size={14} />
          <span>Book New</span>
        </button>
      }
    >
      {error && (
        <div className="alert alert-error mb-6 border border-red-400/20 bg-red-500/10 text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success mb-6 border border-emerald-400/20 bg-emerald-500/10 text-emerald-200">
          {success}
        </div>
      )}

      {/* FILTER TABS */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: 'all', label: `All (${appointments.length})` },
          {
            key: 'scheduled',
            label: `Scheduled (${appointments.filter((a) => a.status === 'scheduled').length})`,
          },
          {
            key: 'completed',
            label: `Completed (${appointments.filter((a) => a.status === 'completed').length})`,
          },
          {
            key: 'cancelled',
            label: `Cancelled (${appointments.filter((a) => a.status === 'cancelled').length})`,
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

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-400">
          <Calendar size={40} className="mx-auto mb-3 text-slate-600" />
          <p className="text-base font-semibold text-white">No appointments found</p>
          <button
            onClick={() => navigate('/barbers')}
            className="theme-primary-btn mt-4 inline-flex items-center gap-2 text-xs font-semibold"
          >
            <Scissors size={14} />
            Book Your First Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((appointment) => (
            <div
              key={appointment._id}
              className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg transition hover:border-white/20"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Barber Shop</p>
                  <p className="mt-1 text-base font-bold text-white">
                    {appointment.barberId?.shopName || getBarberName(appointment.barberId)}
                  </p>
                  <p className="text-xs text-slate-400">{getBarberName(appointment.barberId)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Service</p>
                  <p className="mt-1 text-base font-semibold text-amber-200">
                    {getServiceNames(appointment)}
                  </p>
                  <p className="text-xs text-slate-400">{appointment.duration} minutes</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Date & Time</p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-300 font-medium">{appointment.appointmentTime}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status & Price</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        appointment.status === 'completed'
                          ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
                          : appointment.status === 'scheduled'
                          ? 'bg-sky-400/15 text-sky-300 border border-sky-400/30'
                          : 'bg-red-400/15 text-red-300 border border-red-400/30'
                      }`}
                    >
                      {appointment.status}
                    </span>
                    <span className="text-sm font-bold text-amber-200">Rs. {appointment.price}</span>
                  </div>
                </div>
              </div>

              {/* ACTIONS BAR */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  {appointment.selectedStaffName && (
                    <span>Staff: <strong className="text-slate-200">{appointment.selectedStaffName}</strong></span>
                  )}
                  <span>Payment: <strong className="capitalize text-slate-200">{appointment.paymentMethod || 'cash'}</strong></span>
                  {appointment.paymentStatus === 'completed' ? (
                    <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      Paid Online ✓
                    </span>
                  ) : appointment.status === 'scheduled' ? (
                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      Unpaid
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {appointment.status === 'scheduled' && appointment.paymentStatus !== 'completed' && (
                    <Link
                      to={`/payment?appointmentId=${appointment._id}`}
                      className="rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md transition hover:scale-105"
                    >
                      Pay Online ₹
                    </Link>
                  )}
                  <button
                    onClick={() => setDetailTarget(appointment)}
                    className="theme-secondary-btn px-3 py-1.5 text-xs font-semibold"
                  >
                    View Details
                  </button>
                  {appointment.status === 'scheduled' && (
                    <button
                      onClick={() => handleCancel(appointment._id)}
                      className="theme-danger-btn px-3 py-1.5 text-xs font-semibold"
                    >
                      Cancel Appointment
                    </button>
                  )}
                  {appointment.status === 'completed' && !appointment.feedback?.submittedAt && (
                    <button
                      onClick={() => {
                        setFeedbackTarget(appointment);
                        setFeedbackForm({ rating: 5, comment: '', improvement: '' });
                      }}
                      className="theme-primary-btn px-3 py-1.5 text-xs font-semibold"
                    >
                      Leave Review
                    </button>
                  )}
                  {appointment.barberId?._id && (
                    <button
                      onClick={() => {
                        setReportTarget(appointment);
                        setReportForm({ category: 'service', message: '' });
                      }}
                      className="theme-secondary-btn px-3 py-1.5 text-xs font-medium"
                    >
                      Report Issue
                    </button>
                  )}
                </div>
              </div>

              {/* REVIEW BADGE */}
              {appointment.feedback?.submittedAt && (
                <div className="mt-3 rounded-xl border border-amber-300/15 bg-amber-400/5 p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-amber-200">Your Review:</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={13}
                          className={
                            star <= Number(appointment.feedback.rating || 0)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  {appointment.feedback.comment && (
                    <p className="mt-1 text-slate-300 italic">"{appointment.feedback.comment}"</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {feedbackTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="theme-card w-full max-w-lg">
            <h2 className="text-xl font-bold text-white">Rate Your Experience</h2>
            <p className="mt-1 text-xs text-slate-400">
              How was your service for {getServiceNames(feedbackTarget)}?
            </p>
            <form onSubmit={handleFeedbackSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-200">Star Rating</label>
                <StarPicker
                  value={feedbackForm.rating}
                  onChange={(rating) => setFeedbackForm((prev) => ({ ...prev, rating }))}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-200">Your Feedback</label>
                <textarea
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                  className="theme-input text-xs"
                  rows="3"
                  placeholder="Tell us what you loved or how your haircut went..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-200">
                  Improvement Suggestion <span className="text-slate-500">(optional)</span>
                </label>
                <textarea
                  value={feedbackForm.improvement}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, improvement: e.target.value }))}
                  className="theme-input text-xs"
                  rows="2"
                  placeholder="Suggestions for the barber shop..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={feedbackLoading} className="theme-primary-btn text-xs font-semibold flex-1">
                  {feedbackLoading ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDismissedFeedbackIds((prev) => [...prev, feedbackTarget._id]);
                    setFeedbackTarget(null);
                  }}
                  className="theme-secondary-btn text-xs font-semibold"
                >
                  Skip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="theme-card w-full max-w-lg">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Appointment Details</h2>
                <p className="mt-0.5 text-xs text-slate-400">{detailTarget.status?.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setDetailTarget(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-slate-400">Barber Name</span>
                <span className="font-semibold text-white">{getBarberName(detailTarget.barberId)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-slate-400">Shop Name</span>
                <span className="font-semibold text-white">{detailTarget.barberId?.shopName || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-slate-400">Services</span>
                <span className="font-semibold text-amber-200">{getServiceNames(detailTarget)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-slate-400">Date & Time</span>
                <span className="font-semibold text-white">
                  {new Date(detailTarget.appointmentDate).toLocaleDateString()} at {detailTarget.appointmentTime}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-slate-400">Duration</span>
                <span className="font-semibold text-white">{detailTarget.duration} minutes</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-slate-400">Total Price</span>
                <span className="font-bold text-amber-200">Rs. {detailTarget.price}</span>
              </div>
              {detailTarget.notes && (
                <div className="pt-2">
                  <p className="text-slate-400">Notes:</p>
                  <p className="mt-1 text-slate-200 bg-white/5 p-2.5 rounded-xl">{detailTarget.notes}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setDetailTarget(null)}
              className="theme-secondary-btn mt-6 w-full text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* REPORT ISSUE MODAL */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="theme-card w-full max-w-lg">
            <h2 className="text-xl font-bold text-white">Report Barber Shop</h2>
            <p className="mt-1 text-xs text-slate-400">
              Submit an issue regarding {getBarberName(reportTarget.barberId)} to admin.
            </p>
            <form onSubmit={handleReportSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-200">Issue Category</label>
                <select
                  value={reportForm.category}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="theme-select text-xs"
                >
                  <option value="service">Service quality</option>
                  <option value="behavior">Unprofessional behavior</option>
                  <option value="hygiene">Hygiene problem</option>
                  <option value="pricing">Incorrect pricing</option>
                  <option value="delay">Excessive delay / no-show</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-200">Report Details</label>
                <textarea
                  value={reportForm.message}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, message: e.target.value }))}
                  className="theme-input text-xs"
                  rows="4"
                  required
                  placeholder="Describe what happened with this appointment..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={reportLoading} className="theme-danger-btn text-xs font-semibold flex-1">
                  {reportLoading ? 'Submitting...' : 'Submit Report'}
                </button>
                <button
                  type="button"
                  onClick={() => setReportTarget(null)}
                  className="theme-secondary-btn text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
};

export default MyAppointments;
