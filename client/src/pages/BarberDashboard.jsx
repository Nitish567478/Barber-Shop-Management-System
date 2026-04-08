import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, barbersAPI, servicesAPI } from '../services/api';

const emptyServiceForm = {
  name: '',
  description: '',
  price: '',
  duration: 30,
  category: 'haircut',
};

const defaultShopPreview =
  'https://images.unsplash.com/photo-1512690459411-b0fd1c86b8c8?auto=format&fit=crop&w=1200&q=80';

const formatCurrency = (value) => `Rs. ${Number(value || 0)}`;
const formatDate = (value) => new Date(value).toLocaleDateString();
const formatHours = (openingTime, closingTime) => {
  if (!openingTime || !closingTime) {
    return 'Add shop hours';
  }

  return `${openingTime} - ${closingTime}`;
};

const BarberDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [profileForm, setProfileForm] = useState({
    shopName: '',
    experience: 0,
    specialization: '',
    location: '',
    bio: '',
    shopImage: '',
    openingTime: '09:00',
    closingTime: '18:00',
    isActive: true,
  });
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [editingServiceId, setEditingServiceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const syncProfileForm = (nextProfile) => {
    setProfileForm({
      shopName: nextProfile.shopName || '',
      experience: nextProfile.experience || 0,
      specialization: (nextProfile.specialization || []).join(', '),
      location: nextProfile.location || '',
      bio: nextProfile.bio || '',
      shopImage: nextProfile.shopImage || '',
      openingTime: nextProfile.openingTime || '09:00',
      closingTime: nextProfile.closingTime || '18:00',
      isActive: nextProfile.isActive !== false,
    });
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const [profileRes, servicesRes, bookingsRes] = await Promise.all([
        barbersAPI.getMine(),
        servicesAPI.getMine(),
        appointmentsAPI.getBarberBookings(),
      ]);

      const nextProfile = profileRes.data.barber;
      const nextServices = servicesRes.data.services || [];
      const nextBookings = bookingsRes.data.appointments || [];

      setProfile(nextProfile);
      setServices(nextServices);
      setBookings(nextBookings);
      syncProfileForm(nextProfile);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load barber dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const clearBanner = () => {
    setError('');
    setSuccess('');
  };

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    clearBanner();
  };

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setServiceForm((prev) => ({ ...prev, [name]: value }));
    clearBanner();
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      clearBanner();
      const response = await barbersAPI.updateMine({
        ...profileForm,
        experience: Number(profileForm.experience) || 0,
        shopImage: profileForm.shopImage.trim(),
      });
      const nextProfile = response.data.barber;
      setProfile(nextProfile);
      syncProfileForm(nextProfile);
      setSuccess('Barber profile updated successfully. Your shop profile is ready to publish.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update barber profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const resetServiceForm = () => {
    setServiceForm(emptyServiceForm);
    setEditingServiceId('');
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingService(true);
      clearBanner();
      const payload = {
        ...serviceForm,
        price: Number(serviceForm.price),
        duration: Number(serviceForm.duration),
      };

      if (editingServiceId) {
        await servicesAPI.update(editingServiceId, payload);
        setSuccess('Service updated successfully.');
      } else {
        await servicesAPI.create(payload);
        setSuccess('Service created successfully.');
      }

      resetServiceForm();
      const servicesRes = await servicesAPI.getMine();
      setServices(servicesRes.data.services || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSavingService(false);
    }
  };

  const handleEditService = (service) => {
    setEditingServiceId(service._id);
    setServiceForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      duration: service.duration || 30,
      category: service.category || 'haircut',
    });
    clearBanner();
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Remove this service from your menu?')) {
      return;
    }

    try {
      clearBanner();
      await servicesAPI.delete(serviceId);
      setServices((prev) => prev.filter((service) => service._id !== serviceId));
      if (editingServiceId === serviceId) {
        resetServiceForm();
      }
      setSuccess('Service removed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove service');
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      clearBanner();
      const response = await appointmentsAPI.updateBarberBooking(bookingId, { status });
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId ? response.data.appointment : booking
        )
      );
      setSuccess(`Booking marked as ${status}.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-amber-400"></div>
          <p className="mt-4 text-sm uppercase tracking-[0.35em] text-slate-300">Loading barber dashboard</p>
        </div>
      </div>
    );
  }

  const scheduledBookings = bookings.filter((booking) => booking.status === 'scheduled');
  const completedBookings = bookings.filter((booking) => booking.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.price || 0), 0);
  const previewImage = profileForm.shopImage || profile?.shopImage || defaultShopPreview;

  const statCards = [
    { label: 'Active Services', value: services.length, tone: 'text-amber-200' },
    { label: 'Pending Bookings', value: scheduledBookings.length, tone: 'text-sky-200' },
    { label: 'Completed Jobs', value: completedBookings.length, tone: 'text-emerald-200' },
    { label: 'Revenue', value: formatCurrency(totalRevenue), tone: 'text-rose-200' },
  ];

  return (
    <div className="theme-page">
      <main className="theme-shell">
        <div className="theme-hero mb-8">
          <p className="theme-subtitle">Barber Dashboard</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            {profile?.shopName || `${user?.name}'s Barber Studio`}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Manage your public barber profile, maintain your service pricing, and respond to customer bookings from one workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              {profile?.location || 'Add your location'}
            </span>
            <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-amber-200">
              {profile?.experience || 0} years experience
            </span>
            <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-sky-200">
              {formatHours(profile?.openingTime, profile?.closingTime)}
            </span>
          </div>
        </div>

        {error && <div className="alert alert-error mb-6 border border-red-400/20 bg-red-500/10 text-red-200">{error}</div>}
        {success && <div className="alert alert-success mb-6 border border-emerald-400/20 bg-emerald-500/10 text-emerald-100">{success}</div>}
        {!profile?.isApproved && (
          <div className="alert alert-warning mb-6 border border-yellow-400/20 bg-yellow-500/10 text-yellow-100">
            Your barber shop is pending approval from the admin. It will appear publicly after approval.
          </div>
        )}

        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="theme-card">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{card.label}</p>
              <p className={`mt-4 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="theme-card">
            <div className="mb-6 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-semibold text-white">Publish Barber Shop</h2>
              <p className="mt-2 text-sm text-slate-400">
                Add the details customers need before booking: your name, shop name, timings, location, and photo.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Barber Name</label>
                <input value={user?.name || profile?.userId?.name || ''} className="theme-input" disabled readOnly />
                <p className="mt-2 text-xs text-slate-400">This comes from the barber account profile.</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Shop Name</label>
                <input name="shopName" value={profileForm.shopName} onChange={handleProfileChange} className="theme-input" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Opening Time</label>
                <input type="time" name="openingTime" value={profileForm.openingTime} onChange={handleProfileChange} className="theme-input" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Closing Time</label>
                <input type="time" name="closingTime" value={profileForm.closingTime} onChange={handleProfileChange} className="theme-input" required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">Shop Photo URL</label>
                <input name="shopImage" value={profileForm.shopImage} onChange={handleProfileChange} className="theme-input" placeholder="https://example.com/barber-shop.jpg" />
                <p className="mt-2 text-xs text-slate-400">Paste an image URL to show your shop photo on the public barber page.</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Experience</label>
                <input type="number" min="0" name="experience" value={profileForm.experience} onChange={handleProfileChange} className="theme-input" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Location</label>
                <input name="location" value={profileForm.location} onChange={handleProfileChange} className="theme-input" placeholder="City, area" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">Specialization</label>
                <input name="specialization" value={profileForm.specialization} onChange={handleProfileChange} className="theme-input" placeholder="fade, beard styling, treatment" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">Bio</label>
                <textarea name="bio" value={profileForm.bio} onChange={handleProfileChange} className="theme-input" rows="4" placeholder="Share your style, experience, and signature finish." />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 md:col-span-2">
                <input type="checkbox" name="isActive" checked={profileForm.isActive} onChange={handleProfileChange} />
                Accept new customer bookings
              </label>
              <div className="md:col-span-2">
                <button type="submit" disabled={savingProfile} className="theme-primary-btn w-full md:w-auto">
                  {savingProfile ? 'Saving profile...' : 'Publish Shop Profile'}
                </button>
              </div>
            </form>
          </section>

          <section className="theme-card overflow-hidden">
            <div className="mb-6 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-semibold text-white">Live Preview</h2>
              <p className="mt-2 text-sm text-slate-400">
                This is how your barber shop profile can look to customers.
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/70">
              <img
                src={previewImage}
                alt={profileForm.shopName || 'Barber shop preview'}
                className="h-56 w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = defaultShopPreview;
                }}
              />
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Public Profile Preview</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{profileForm.shopName || 'Your shop name'}</h3>
                <p className="mt-2 text-slate-300">{user?.name || profile?.userId?.name || 'Barber Name'}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    {profileForm.location || 'Location'}
                  </span>
                  <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-2 text-sky-200">
                    {formatHours(profileForm.openingTime, profileForm.closingTime)}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {profileForm.bio || 'Add a short description so customers know your style and services.'}
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="theme-card mt-8">
          <div className="mb-6 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-semibold text-white">Service Pricing</h2>
            <p className="mt-2 text-sm text-slate-400">
              Add your service menu with clear pricing so customers can book confidently.
            </p>
          </div>

          <form onSubmit={handleServiceSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Service Name</label>
              <input name="name" value={serviceForm.name} onChange={handleServiceChange} className="theme-input" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Description</label>
              <textarea name="description" value={serviceForm.description} onChange={handleServiceChange} className="theme-input" rows="3" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Price</label>
                <input type="number" min="0" name="price" value={serviceForm.price} onChange={handleServiceChange} className="theme-input" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Duration</label>
                <input type="number" min="15" step="15" name="duration" value={serviceForm.duration} onChange={handleServiceChange} className="theme-input" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Category</label>
                <select name="category" value={serviceForm.category} onChange={handleServiceChange} className="theme-select">
                  <option value="haircut">Haircut</option>
                  <option value="shaving">Shaving</option>
                  <option value="coloring">Coloring</option>
                  <option value="treatment">Treatment</option>
                  <option value="grooming">Grooming</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={savingService} className="theme-primary-btn">
                {savingService ? 'Saving service...' : editingServiceId ? 'Update Service' : 'Add Service'}
              </button>
              {editingServiceId && (
                <button type="button" onClick={resetServiceForm} className="theme-secondary-btn">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="theme-card mt-8">
          <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Your Services</h2>
              <p className="mt-2 text-sm text-slate-400">These services are what customers see when they book with you.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {services.length} service{services.length === 1 ? '' : 's'} listed
            </span>
          </div>

          {services.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-6 text-center text-slate-400">
              No services added yet. Start by creating your first priced service above.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <div key={service._id} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-amber-300">{service.category}</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{service.name}</h3>
                    </div>
                    <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-sm text-amber-200">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{service.description || 'No description added yet.'}</p>
                  <p className="mt-4 text-sm text-slate-400">{service.duration} mins</p>
                  <div className="mt-5 flex gap-3">
                    <button onClick={() => handleEditService(service)} className="theme-secondary-btn text-sm">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteService(service._id)} className="theme-danger-btn text-sm">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="theme-card mt-8">
          <div className="mb-6 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-semibold text-white">Customer Bookings</h2>
            <p className="mt-2 text-sm text-slate-400">
              Review all incoming bookings and mark them completed, cancelled, or no-show as work progresses.
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-6 text-center text-slate-400">
              No bookings received yet.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold text-white">{booking.customerId?.name || 'Customer'}</h3>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
                          {booking.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{booking.customerId?.phone || 'No phone available'}</p>
                      <p className="mt-4 text-sm text-slate-400">Service</p>
                      <p className="text-base font-medium text-slate-100">{booking.serviceId?.name || 'Service removed'}</p>
                      <p className="mt-2 text-sm text-slate-400">Date and time</p>
                      <p className="text-base font-medium text-slate-100">{formatDate(booking.appointmentDate)} at {booking.appointmentTime}</p>
                      <p className="mt-2 text-sm text-slate-400">Price</p>
                      <p className="text-base font-medium text-amber-200">{formatCurrency(booking.price)}</p>
                      {booking.notes && (
                        <p className="mt-4 text-sm leading-6 text-slate-300">Notes: {booking.notes}</p>
                      )}
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                      <p className="text-slate-400">Duration</p>
                      <p className="mt-1 text-base font-medium text-white">{booking.duration} mins</p>
                      <p className="mt-4 text-slate-400">Customer Email</p>
                      <p className="mt-1 break-all text-base font-medium text-white">{booking.customerId?.email || 'N/A'}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 lg:flex-col">
                      {booking.status !== 'completed' && (
                        <button onClick={() => handleBookingStatus(booking._id, 'completed')} className="theme-primary-btn text-sm">
                          Mark Completed
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button onClick={() => handleBookingStatus(booking._id, 'cancelled')} className="theme-danger-btn text-sm">
                          Cancel Booking
                        </button>
                      )}
                      {booking.status !== 'no-show' && (
                        <button onClick={() => handleBookingStatus(booking._id, 'no-show')} className="theme-secondary-btn text-sm">
                          Mark No-Show
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default BarberDashboard;
