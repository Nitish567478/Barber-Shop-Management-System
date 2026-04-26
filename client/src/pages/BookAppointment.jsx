import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, barbersAPI, servicesAPI } from '../services/api';
import { isValidObjectId } from '../utils/objectId';
import BarberShopeLoader from "./components/BarberShopeLoader";
const BookAppointment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    barberId: '',
    serviceIds: [],
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
    paymentMethod: 'cash',
    selectedStaffName: '',
  });
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dataWarning, setDataWarning] = useState('');

  const displayedBarbers = barbers.filter((barber) => isValidObjectId(barber._id));
  const liveServices = services.filter((service) => isValidObjectId(service._id));
  const hasLiveServices = liveServices.length > 0;

  useEffect(() => {
    const fetchData = async () => {
      setDataWarning('');

      const [barbersResult, servicesResult] = await Promise.allSettled([
        barbersAPI.getAll(),
        servicesAPI.getAll(),
      ]);

      const nextBarbers =
        barbersResult.status === 'fulfilled' ? barbersResult.value.data.barbers || [] : [];
      const nextServices =
        servicesResult.status === 'fulfilled' ? servicesResult.value.data.services || [] : [];

      setBarbers(nextBarbers);
      setServices(nextServices);
      setFormData((prev) => ({
        ...prev,
        barberId: isValidObjectId(location.state?.selectedBarberId)
          ? location.state.selectedBarberId
          : prev.barberId,
        serviceIds:
          isValidObjectId(location.state?.selectedServiceId) && prev.serviceIds.length === 0
            ? [location.state.selectedServiceId]
            : prev.serviceIds,
      }));

      if (servicesResult.status === 'rejected') {
        setDataWarning('Bookable services could not be loaded right now. Please check that the backend server and database are running.');
      } else if (nextServices.length === 0) {
        setDataWarning('No live services are available yet. Add a service from the barber dashboard and it will appear here automatically.');
      } else if (barbersResult.status === 'rejected') {
        setDataWarning('Barbers could not be loaded right now. You can still book using the available service list.');
      }

      setError('');
    };

    fetchData();
  }, [location.state]);

  const filteredServices = liveServices.filter((service) => {
    if (!formData.barberId) {
      return true;
    }

    const ownerId = service.barberId?._id || service.barberId || null;
    return !ownerId || String(ownerId) === String(formData.barberId);
  });

  const selectedBarber = displayedBarbers.find((barber) => barber._id === formData.barberId) || null;
  const selectedServices = filteredServices.filter((service) => formData.serviceIds.includes(service._id));
  const totalPrice = selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + (service.duration || 0), 0);
  const staffOptions = selectedBarber?.staffMembers || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'barberId') {
        next.serviceIds = prev.serviceIds.filter((serviceId) =>
          liveServices.some((service) => {
            const ownerId = service.barberId?._id || service.barberId || null;
            return service._id === serviceId && (!value || !ownerId || String(ownerId) === String(value));
          })
        );
        next.selectedStaffName = '';
      }
      return next;
    });
    setError('');
  };

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasLiveServices) {
      setError('A live service is required before booking can be submitted.');
      return;
    }

    if (formData.serviceIds.length === 0) {
      setError('Please choose at least one service.');
      return;
    }

    if (formData.paymentMethod === 'online') {
      navigate('/payment-coming-soon');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        barberId: formData.barberId || undefined,
        selectedStaffName: formData.selectedStaffName || undefined,
      };

      await appointmentsAPI.create(payload);
      setSuccess('Appointment booked successfully!');
      setFormData({
        barberId: '',
        serviceIds: [],
        appointmentDate: '',
        appointmentTime: '',
        notes: '',
        paymentMethod: 'cash',
        selectedStaffName: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if(!loading && barbers.length === 0 && services.length === 0){
    return <BarberShopeLoader />
  }

  return (
    <div className="theme-page">
      <main className="theme-shell max-w-3xl">
        <div className="theme-hero mb-8">
          <p className="theme-subtitle">Book Appointment</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Reserve your grooming session</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Choose your barber, service, preferred date, and any notes so the team can prepare the right experience for you.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {dataWarning && <div className="alert alert-warning">{dataWarning}</div>}

        <div className="theme-card">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Select Barber / Shop (Optional)
              </label>
              <select
                name="barberId"
                value={formData.barberId}
                onChange={handleChange}
                className="theme-select"
              >
                <option value="">Any available barber</option>
                {displayedBarbers.slice(0, 8).map((barber) => (
                  <option key={barber._id} value={barber._id}>
                    {barber.userId?.name || 'Barber'}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-400">
                Leave this empty if you want the shop to assign any available barber.
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-200">Select Multiple Services</label>
              <div className="grid gap-3">
                {filteredServices.map((service) => (
                  <label
                    key={service._id}
                    className={`rounded-2xl border p-4 text-sm ${
                      formData.serviceIds.includes(service._id)
                        ? 'border-amber-300/40 bg-amber-400/10 text-amber-100'
                        : 'border-white/10 bg-white/5 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.serviceIds.includes(service._id)}
                        onChange={() => handleServiceToggle(service._id)}
                      />
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-slate-400">
                          Rs. {service.price} • {service.duration} mins
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {!hasLiveServices && (
                <p className="mt-2 text-xs text-amber-300">
                  No bookable services are available yet. Add at least one live service from the barber dashboard to enable appointments.
                </p>
              )}
            </div>

            {staffOptions.length > 0 && (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-200">Select Staff Member</label>
                <select
                  name="selectedStaffName"
                  value={formData.selectedStaffName}
                  onChange={handleChange}
                  className="theme-select"
                >
                  <option value="">Any available staff</option>
                  {staffOptions.map((staffName) => (
                    <option key={staffName} value={staffName}>
                      {staffName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Date</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  className="theme-input"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Time</label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className="theme-input"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-200">Payment Method</label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'cash' }))}
                  className={`rounded-2xl border px-4 py-4 text-left ${
                    formData.paymentMethod === 'cash'
                      ? 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100'
                      : 'border-white/10 bg-white/5 text-slate-200'
                  }`}
                >
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'online' }))}
                  className={`rounded-2xl border px-4 py-4 text-left ${
                    formData.paymentMethod === 'online'
                      ? 'border-sky-300/40 bg-sky-500/10 text-sky-100'
                      : 'border-white/10 bg-white/5 text-slate-200'
                  }`}
                >
                  Online
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Online payment par click karne par Coming Soon page open hoga.
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-200">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="theme-input"
                rows="4"
                placeholder="Any special requests..."
              ></textarea>
            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p>Total services: {selectedServices.length}</p>
              <p className="mt-1">Total duration: {totalDuration} mins</p>
              <p className="mt-1">Total amount: Rs. {totalPrice}</p>
              {selectedBarber && (
                <p className="mt-1">
                  Slot limit for this shop: {selectedBarber.slotCapacity || 3} booking(s) per time slot
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !hasLiveServices}
              className="theme-primary-btn w-full"
            >
              {loading ? 'Booking...' : hasLiveServices ? 'Book Appointment' : 'No services available yet'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BookAppointment;
