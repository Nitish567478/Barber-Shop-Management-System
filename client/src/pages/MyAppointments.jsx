import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../services/api';

const getBarberName = (barber) => barber?.userId?.name || 'Any available barber';
const getServiceName = (service) => service?.name || 'Unknown service';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

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
          <p className="mt-4 text-sm uppercase tracking-[0.35em] text-slate-300">Loading appointments</p>
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
                    <p className="text-lg font-semibold text-slate-100">{getServiceName(appointment.serviceId)}</p>
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
                      {appointment.status === 'scheduled' && (
                        <button onClick={() => handleCancel(appointment._id)} className="theme-danger-btn">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

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
      </main>
    </div>
  );
};

export default MyAppointments;
