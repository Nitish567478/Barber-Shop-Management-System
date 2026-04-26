import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, reportsAPI } from '../services/api';
import { Star, X } from 'lucide-react';
import BarberShopLoader from "../components/BarberShopLoader";

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
          size={34}
          className={rating <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
        />
      </button>
    ))}
    <span className="ml-2 text-sm font-semibold text-amber-100">{value}/5</span>
  </div>
);

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '', improvement: '' });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [dismissedFeedbackIds, setDismissedFeedbackIds] = useState([]);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportForm, setReportForm] = useState({ category: 'service', message: '' });
  const [reportLoading, setReportLoading] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const appointmentsRes = await appointmentsAPI.getUserAppointments();
        setAppointments(appointmentsRes.data.appointments || []);
      } catch (err) {
        setError('Failed to load appointments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (feedbackTarget) {
      return;
    }

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
          prev.map((apt) =>
            apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt
          )
        );
      } catch (err) {
        alert('Failed to cancel appointment');
      }
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackTarget) {
      return;
    }

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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportTarget) {
      return;
    }

    try {
      setReportLoading(true);
      await reportsAPI.create({
        appointmentId: reportTarget._id,
        barberId: reportTarget.barberId?._id,
        ...reportForm,
      });
      setReportTarget(null);
      setReportForm({ category: 'service', message: '' });
      alert('Report admin ke paas verification ke liye bhej diya gaya hai.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setReportLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    if (filter === 'all') return appointments;
    return appointments.filter((apt) => apt.status === filter);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'badge-info';
      case 'completed':
        return 'badge-success';
      case 'cancelled':
        return 'badge-error';
      case 'no-show':
        return 'badge-warning';
      default:
        return 'badge-neutral';
    }
  };

  const filtered = getFilteredAppointments();

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
          <h1 className="mb-2 text-4xl font-semibold text-white">My Appointments</h1>
          <p className="mb-2 text-slate-300">
            Total: <strong>{appointments.length}</strong> appointments
          </p>
        </div>

        {error && <div className="alert alert-error mb-6 border border-red-400/20 bg-red-500/10 text-red-200">{error}</div>}

        <div className="mb-8 flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}>
            All ({appointments.length})
          </button>
          <button onClick={() => setFilter('scheduled')} className={`btn btn-sm ${filter === 'scheduled' ? 'btn-primary' : 'btn-outline'}`}>
            Scheduled ({appointments.filter((a) => a.status === 'scheduled').length})
          </button>
          <button onClick={() => setFilter('completed')} className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-outline'}`}>
            Completed ({appointments.filter((a) => a.status === 'completed').length})
          </button>
          <button onClick={() => setFilter('cancelled')} className={`btn btn-sm ${filter === 'cancelled' ? 'btn-primary' : 'btn-outline'}`}>
            Cancelled ({appointments.filter((a) => a.status === 'cancelled').length})
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="theme-card py-12 text-center">
            <p className="mb-4 text-lg text-slate-400">No appointments found</p>
            <button onClick={() => navigate('/book-appointment')} className="theme-primary-btn">
              Book Your First Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((appointment) => (
              <div key={appointment._id} className="theme-card">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-slate-400">Barber</p>
                    <p className="text-lg font-semibold text-slate-100">{getBarberName(appointment.barberId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Service</p>
                    <p className="text-lg font-semibold text-slate-100">{getServiceNames(appointment)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Date & Time</p>
                    <p className="text-lg font-semibold text-slate-100">{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-400">{appointment.appointmentTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <span className={`badge ${getStatusBadgeColor(appointment.status)} text-xs`}>
                      {appointment.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-slate-400">Duration</p>
                      <p className="text-slate-100">{appointment.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Price</p>
                      <p className="font-bold text-slate-100">Rs. {appointment.price}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setDetailTarget(appointment)} className="theme-secondary-btn">
                        Detail
                      </button>
                      {appointment.status === 'scheduled' && (
                        <button onClick={() => handleCancel(appointment._id)} className="theme-danger-btn">
                          Cancel
                        </button>
                      )}
                      {appointment.status === 'completed' && !appointment.feedback?.submittedAt && (
                        <button
                          onClick={() => {
                            setFeedbackTarget(appointment);
                            setFeedbackForm({ rating: 5, comment: '', improvement: '' });
                          }}
                          className="theme-primary-btn"
                        >
                          Give Feedback
                        </button>
                      )}
                      {appointment.barberId?._id && (
                        <button
                          onClick={() => {
                            setReportTarget(appointment);
                            setReportForm({ category: 'service', message: '' });
                          }}
                          className="theme-secondary-btn"
                        >
                          Report Issue
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {appointment.selectedStaffName && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-slate-400">Selected Staff</p>
                    <p className="text-slate-100">{appointment.selectedStaffName}</p>
                  </div>
                )}

                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-slate-400">Payment Method</p>
                  <p className="capitalize text-slate-100">{appointment.paymentMethod || 'cash'}</p>
                </div>

                {appointment.feedback?.submittedAt && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-slate-400">Your Feedback</p>
                    <div className="mt-2 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= Number(appointment.feedback.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
                        />
                      ))}
                      <span className="ml-2 text-sm text-slate-300">{appointment.feedback.rating}/5</span>
                    </div>
                    <p className="mt-1 text-slate-300">{appointment.feedback.comment || 'No comment added.'}</p>
                    {appointment.feedback.improvement && (
                      <p className="mt-2 text-slate-300">Improvement: {appointment.feedback.improvement}</p>
                    )}
                  </div>
                )}

                {appointment.notes && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="text-slate-100">{appointment.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {feedbackTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
            <div className="theme-card w-full max-w-lg">
              <h2 className="text-2xl font-semibold text-white">Share your feedback</h2>
              <p className="mt-2 text-sm text-slate-400">
                {getServiceNames(feedbackTarget)} ke baare mein apna feedback dein.
              </p>
              <form onSubmit={handleFeedbackSubmit} className="mt-6">
                <label className="mb-2 block text-sm font-medium text-slate-200">Star Rating</label>
                <StarPicker
                  value={feedbackForm.rating}
                  onChange={(rating) => setFeedbackForm((prev) => ({ ...prev, rating }))}
                />

                <label className="mb-2 mt-4 block text-sm font-medium text-slate-200">Message</label>
                <textarea
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                  className="theme-input"
                  rows="4"
                  placeholder="Service aur shop ke baare mein feedback likhiye..."
                />

                <label className="mb-2 mt-4 block text-sm font-medium text-slate-200">
                  Improvement Suggestion <span className="text-slate-500">(optional)</span>
                </label>
                <textarea
                  value={feedbackForm.improvement}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, improvement: e.target.value }))}
                  className="theme-input"
                  rows="3"
                  placeholder="Barber shop kya improve kar sakta hai..."
                />

                <div className="mt-6 flex gap-3">
                  <button type="submit" disabled={feedbackLoading} className="theme-primary-btn">
                    {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDismissedFeedbackIds((prev) => [...prev, feedbackTarget._id]);
                      setFeedbackTarget(null);
                    }}
                    className="theme-secondary-btn"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {detailTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
            <div className="theme-card w-full max-w-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Appointment Details</h2>
                  <p className="mt-1 text-sm text-slate-400">{detailTarget.status?.toUpperCase()}</p>
                </div>
                <button onClick={() => setDetailTarget(null)} className="rounded-full bg-white/10 p-2 text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-slate-300">
                <p>Barber: {getBarberName(detailTarget.barberId)}</p>
                <p>Shop: {detailTarget.barberId?.shopName || 'N/A'}</p>
                <p>Services: {getServiceNames(detailTarget)}</p>
                <p>Date: {new Date(detailTarget.appointmentDate).toLocaleDateString()} at {detailTarget.appointmentTime}</p>
                <p>Duration: {detailTarget.duration} minutes</p>
                <p>Price: Rs. {detailTarget.price}</p>
                <p>Staff: {detailTarget.selectedStaffName || 'Any available staff'}</p>
                <p>Payment: {detailTarget.paymentMethod || 'cash'}</p>
                <p>Notes: {detailTarget.notes || 'No notes'}</p>
              </div>
            </div>
          </div>
        )}

        {reportTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
            <div className="theme-card w-full max-w-lg">
              <h2 className="text-2xl font-semibold text-white">Report barber shop</h2>
              <p className="mt-2 text-sm text-slate-400">
                {getBarberName(reportTarget.barberId)} ke baare mein admin ko issue batayein.
              </p>
              <form onSubmit={handleReportSubmit} className="mt-6">
                <label className="mb-2 block text-sm font-medium text-slate-200">Issue Type</label>
                <select
                  value={reportForm.category}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="theme-select"
                >
                  <option value="service">Service quality</option>
                  <option value="behavior">Bad behavior</option>
                  <option value="hygiene">Hygiene problem</option>
                  <option value="pricing">Pricing issue</option>
                  <option value="delay">Delay/no-show</option>
                  <option value="other">Other</option>
                </select>

                <label className="mb-2 mt-4 block text-sm font-medium text-slate-200">Report Details</label>
                <textarea
                  value={reportForm.message}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, message: e.target.value }))}
                  className="theme-input"
                  rows="5"
                  required
                  placeholder="Kya problem hui, kab hui, aur admin ko kya verify karna chahiye..."
                />

                <div className="mt-6 flex gap-3">
                  <button type="submit" disabled={reportLoading} className="theme-danger-btn">
                    {reportLoading ? 'Submitting...' : 'Submit Report'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportTarget(null)}
                    className="theme-secondary-btn"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyAppointments;
