import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, barbersAPI, servicesAPI } from '../services/api';
import { fallbackServices } from '../data/featuredServices';
import { fallbackBarbers } from '../data/featuredBarbers';
import { isValidObjectId } from '../utils/objectId';

const BookAppointment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({
    barberId: '',
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dataWarning, setDataWarning] = useState('');

  const displayedBarbers = barbers.length > 0 ? barbers : fallbackBarbers;
  const hasLiveServices = services.some((service) => isValidObjectId(service._id));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataWarning('');
        const [barbersRes, servicesRes] = await Promise.all([
          barbersAPI.getAll(),
          servicesAPI.getAll(),
        ]);
        setBarbers(barbersRes.data.barbers || []);
        setServices(servicesRes.data.services?.length ? servicesRes.data.services : fallbackServices);
        setFormData((prev) => ({
          ...prev,
          barberId: isValidObjectId(location.state?.selectedBarberId)
            ? location.state.selectedBarberId
            : prev.barberId,
          serviceId: isValidObjectId(location.state?.selectedServiceId)
            ? location.state.selectedServiceId
            : prev.serviceId,
        }));
      } catch (err) {
        setBarbers([]);
        setServices(fallbackServices);
        setDataWarning('Live booking data could not be loaded. Please make sure the backend server and database are running.');
        setError('');
      }
    };

    fetchData();
  }, [location.state]);

  const filteredServices = services.filter((service) => {
    if (!formData.barberId) {
      return true;
    }

    const ownerId = service.barberId?._id || service.barberId || null;
    return !ownerId || ownerId === formData.barberId;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'barberId') {
        const stillValidService = filteredServices.some((service) => service._id === prev.serviceId && (!service.barberId || (service.barberId?._id || service.barberId) === value || !value));
        next.serviceId = stillValidService ? prev.serviceId : '';
      }
      return next;
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasLiveServices) {
      setError('Live services are not available right now, so booking cannot be submitted.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        barberId: formData.barberId || undefined,
      };

      await appointmentsAPI.create(payload);
      setSuccess('Appointment booked successfully!');
      setFormData({
        barberId: '',
        serviceId: '',
        appointmentDate: '',
        appointmentTime: '',
        notes: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

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
                Select Barber (Optional)
              </label>
              <select
                name="barberId"
                value={formData.barberId}
                onChange={handleChange}
                className="theme-select"
              >
                <option value="">Any available barber</option>
                {displayedBarbers.slice(0, 8).map((barber) => (
                  <option
                    key={barber._id}
                    value={isValidObjectId(barber._id) ? barber._id : ''}
                    disabled={!isValidObjectId(barber._id)}
                  >
                    {barber.userId?.name || 'Barber'}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-400">
                Leave this empty if you want the shop to assign any available barber.
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Select Service
              </label>
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                className="theme-select"
                required
              >
                <option value="">Choose a service...</option>
                {filteredServices.map((service) => (
                  <option
                    key={service._id}
                    value={isValidObjectId(service._id) ? service._id : ''}
                    disabled={!isValidObjectId(service._id)}
                  >
                    {service.name} - Rs. {service.price}
                  </option>
                ))}
              </select>
              {!hasLiveServices && (
                <p className="mt-2 text-xs text-amber-300">
                  Live service records are not available right now. Please start the backend server and load real services first.
                </p>
              )}
            </div>

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

            <button
              type="submit"
              disabled={loading || !hasLiveServices}
              className="theme-primary-btn w-full"
            >
              {loading ? 'Booking...' : hasLiveServices ? 'Book Appointment' : 'Booking unavailable'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BookAppointment;
