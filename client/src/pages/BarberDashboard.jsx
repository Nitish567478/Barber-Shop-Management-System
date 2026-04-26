import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, barbersAPI, couponsAPI, servicesAPI } from '../services/api';
import { Star, X } from 'lucide-react';

import BarberShopLoader from '../components/BarberShopLoader';

const emptyServiceForm = {
  name: '',
  description: '',
  price: '',
  duration: 30,
  category: 'haircut',
};

const emptyCouponForm = {
  title: '',
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: '',
  minSpend: '',
  validDays: 7,
  audience: 'regular',
  assignedCustomerIds: [],
};

const defaultShopPreview =
  'https://images.unsplash.com/photo-1512690459411-b0fd1c86b8c8?auto=format&fit=crop&w=1200&q=80';

const formatCurrency = (value) => `Rs. ${Number(value || 0)}`;
const formatDate = (value) => new Date(value).toLocaleDateString();
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : 'N/A');
const isSameDay = (value, date = new Date()) => {
  const next = new Date(value);
  return (
    next.getFullYear() === date.getFullYear() &&
    next.getMonth() === date.getMonth() &&
    next.getDate() === date.getDate()
  );
};
const getSuspensionLabel = (profile) => {
  if (!profile?.suspendedUntil) {
    return '';
  }

  const until = new Date(profile.suspendedUntil);
  if (Number.isNaN(until.getTime()) || until <= new Date()) {
    return '';
  }

  const days = Math.max(1, Math.ceil((until - new Date()) / (1000 * 60 * 60 * 24)));
  return `${days} day${days === 1 ? '' : 's'} suspended`;
};
const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={16}
        className={star <= Number(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
      />
    ))}
  </div>
);
const formatHours = (openingTime, closingTime) => {
  if (!openingTime || !closingTime) {
    return 'Add shop hours';
  }

  const convertTo12Hour = (time) => {
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';

    hour = hour % 12 || 12;

    return `${hour}:${minutes} ${ampm}`;
  };

  return `${convertTo12Hour(openingTime)} - ${convertTo12Hour(closingTime)}`;
};

const BarberDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [regularCustomers, setRegularCustomers] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [detailBooking, setDetailBooking] = useState(null);
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
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [editingServiceId, setEditingServiceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);
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
      const [profileRes, servicesRes, bookingsRes, couponsRes, customersRes] = await Promise.all([
        barbersAPI.getMine(),
        servicesAPI.getMine(),
        appointmentsAPI.getBarberBookings(),
        couponsAPI.getBarberCoupons(),
        couponsAPI.getRegularCustomers(),
      ]);

      const nextProfile = profileRes.data.barber;
      const nextServices = servicesRes.data.services || [];
      const nextBookings = bookingsRes.data.appointments || [];

      setProfile(nextProfile);
      setServices(nextServices);
      setBookings(nextBookings);
      setCoupons(couponsRes.data.coupons || []);
      setRegularCustomers(customersRes.data.customers || []);
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

  const handleCouponChange = (e) => {
    const { name, value } = e.target;
    setCouponForm((prev) => ({ ...prev, [name]: value }));
    clearBanner();
  };

  const handleCouponCustomerToggle = (customerId) => {
    setCouponForm((prev) => ({
      ...prev,
      assignedCustomerIds: prev.assignedCustomerIds.includes(customerId)
        ? prev.assignedCustomerIds.filter((id) => id !== customerId)
        : [...prev.assignedCustomerIds, customerId],
    }));
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

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingCoupon(true);
      clearBanner();
      const response = await couponsAPI.create({
        ...couponForm,
        discountValue: Number(couponForm.discountValue),
        minSpend: Number(couponForm.minSpend) || 0,
        validDays: Number(couponForm.validDays) || 7,
      });
      setCoupons((prev) => [response.data.coupon, ...prev]);
      setCouponForm(emptyCouponForm);
      setSuccess('Coupon launched and assigned customers were notified by email when configured.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to launch coupon');
    } finally {
      setSavingCoupon(false);
    }
  };

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

  const scheduledBookings = bookings.filter((booking) => booking.status === 'scheduled');
  const completedBookings = bookings.filter((booking) => booking.status === 'completed');
  const todayBookings = bookings.filter((booking) => isSameDay(booking.appointmentDate));
  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(a.createdAt || a.appointmentDate) - new Date(b.createdAt || b.appointmentDate)
  );
  const visibleBookings =
    bookingFilter === 'today'
      ? sortedBookings.filter((booking) => isSameDay(booking.appointmentDate))
      : sortedBookings;
  const reviews = bookings.filter((booking) => booking.feedback?.submittedAt);
  const averageRating = reviews.length
    ? reviews.reduce((sum, booking) => sum + Number(booking.feedback?.rating || 0), 0) / reviews.length
    : 0;
  const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.price || 0), 0);
  const previewImage = profileForm.shopImage || profile?.shopImage || defaultShopPreview;
  const suspensionLabel = getSuspensionLabel(profile);

  const statCards = [
    { label: 'Active Services', value: services.length, tone: 'text-amber-200' },
    { label: "Today's Bookings", value: todayBookings.length, tone: 'text-cyan-200' },
    { label: 'Total Bookings', value: bookings.length, tone: 'text-violet-200' },
    { label: 'Pending Bookings', value: scheduledBookings.length, tone: 'text-sky-200' },
    { label: 'Completed Jobs', value: completedBookings.length, tone: 'text-emerald-200' },
    { label: 'Revenue', value: formatCurrency(totalRevenue), tone: 'text-rose-200' },
    { label: 'Rating', value: reviews.length ? `${averageRating.toFixed(1)}/5` : 'No reviews', tone: 'text-amber-200' },
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
        {suspensionLabel && (
          <div className="alert alert-error mb-6 border border-red-400/20 bg-red-500/10 text-red-100">
            Your barber shop is {suspensionLabel}. It is hidden from public listing until {formatDate(profile.suspendedUntil)}.
            {profile.suspensionReason ? ` Reason: ${profile.suspensionReason}` : ''}
          </div>
        )}

        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {statCards.map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={() => {
                if (card.label === "Today's Bookings") setBookingFilter('today');
                if (card.label === 'Total Bookings') setBookingFilter('all');
              }}
              className="theme-card text-left"
            >
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{card.label}</p>
              <p className={`mt-4 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
            </button>
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
                <p className="mt-2 text-xs text-slate-400"> Use this link for image URLs:{' '}
                  <a
                    href="https://imagelinker.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    imagelinker.netlify.app
                  </a> Paste an image URL to show your shop photo on the public barber page.
                </p>
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
                <input type="checkbox" name="isActive" checked={profileForm.isActive} onChange={handleProfileChange} disabled={Boolean(suspensionLabel)} />
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
          <div className="mb-6 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-semibold text-white">Launch Coupon</h2>
            <p className="mt-2 text-sm text-slate-400">
              Create custom vouchers and send them to regular customers.
            </p>
          </div>
          <form onSubmit={handleCouponSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Coupon Name</label>
              <input name="title" value={couponForm.title} onChange={handleCouponChange} className="theme-input" required placeholder="Smile Sunday Offer" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Coupon Code</label>
              <input name="code" value={couponForm.code} onChange={handleCouponChange} className="theme-input uppercase" required placeholder="SMILE20" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Discount Type</label>
              <select name="discountType" value={couponForm.discountType} onChange={handleCouponChange} className="theme-select">
                <option value="percent">Percent</option>
                <option value="flat">Flat amount</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Discount Value</label>
              <input type="number" min="1" name="discountValue" value={couponForm.discountValue} onChange={handleCouponChange} className="theme-input" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Minimum Spend</label>
              <input type="number" min="0" name="minSpend" value={couponForm.minSpend} onChange={handleCouponChange} className="theme-input" placeholder="Optional" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Valid Days</label>
              <input type="number" min="1" name="validDays" value={couponForm.validDays} onChange={handleCouponChange} className="theme-input" required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-200">Description</label>
              <textarea name="description" value={couponForm.description} onChange={handleCouponChange} className="theme-input" rows="3" placeholder="What this coupon gives customers..." />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-200">Give to regular customers</label>
              <div className="grid gap-3 md:grid-cols-2">
                {regularCustomers.slice(0, 8).map((customer) => (
                  <label key={customer._id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                    <span>
                      <span className="block font-semibold text-white">{customer.name}</span>
                      <span className="text-slate-400">{customer.completedCount} completed bookings</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={couponForm.assignedCustomerIds.includes(customer._id)}
                      onChange={() => handleCouponCustomerToggle(customer._id)}
                    />
                  </label>
                ))}
              </div>
              {regularCustomers.length === 0 && <p className="text-sm text-slate-400">Regular customers will appear after bookings.</p>}
            </div>
            <button type="submit" disabled={savingCoupon} className="theme-primary-btn md:col-span-2">
              {savingCoupon ? 'Launching...' : 'Launch Coupon'}
            </button>
          </form>

          {coupons.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {coupons.slice(0, 4).map((coupon) => (
                <div key={coupon._id} className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-amber-200">{coupon.code}</p>
                  <h3 className="mt-2 font-semibold text-white">{coupon.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{coupon.discountType === 'flat' ? formatCurrency(coupon.discountValue) : `${coupon.discountValue}%`} off</p>
                  <p className="mt-1 text-xs text-slate-400">Valid until {formatDate(coupon.validUntil)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="theme-card mt-8">
          <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Customer Feedback</h2>
              <p className="mt-2 text-sm text-slate-400">
                Customers ke star ratings aur comments yahan live bookings se update hote hain.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3">
              <StarRating rating={Math.round(averageRating)} />
              <p className="mt-1 text-sm font-semibold text-amber-100">
                {reviews.length ? `${averageRating.toFixed(1)} average from ${reviews.length} reviews` : 'No ratings yet'}
              </p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-6 text-center text-slate-400">
              Completed bookings ke baad customer feedback yahan show hoga.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
                {reviews.slice(0, 6).map((booking) => (
                <div key={booking._id} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{booking.customerId?.name || 'Customer'}</h3>
                      <p className="mt-1 text-sm text-slate-400">{formatDate(booking.feedback.submittedAt)}</p>
                    </div>
                    <StarRating rating={booking.feedback.rating} />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    {booking.feedback.comment || 'Customer ne sirf star rating diya.'}
                  </p>
                  {booking.feedback.improvement && (
                    <p className="mt-3 rounded-2xl border border-amber-300/10 bg-amber-400/5 p-3 text-sm leading-6 text-amber-100">
                      Improvement: {booking.feedback.improvement}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
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
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Customer Bookings</h2>
                <p className="mt-2 text-sm text-slate-400">
                  First come, first served queue. Oldest booking request stays at the top.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-cyan-100">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Today</p>
                  <p className="mt-1 text-2xl font-semibold">{todayBookings.length}</p>
                </div>
                <div className="rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 text-violet-100">
                  <p className="text-xs uppercase tracking-[0.2em] text-violet-200/70">Total</p>
                  <p className="mt-1 text-2xl font-semibold">{bookings.length}</p>
                </div>
              </div>
            </div>
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
              {visibleBookings.map((booking, index) => (
                <div key={booking._id} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
                  <div className="grid gap-4 lg:grid-cols-[auto_1.2fr_1fr_auto] lg:items-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400/10 font-semibold text-amber-100">
                      #{index + 1}
                    </div>
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
                      <p className="mt-2 text-sm text-slate-400">Booked on</p>
                      <p className="text-base font-medium text-slate-100">{formatDateTime(booking.createdAt)}</p>
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
                      <button onClick={() => setDetailBooking(booking)} className="theme-secondary-btn text-sm">
                        Detail
                      </button>
                      {booking.status === 'scheduled' ? (
                        <>
                        <button onClick={() => handleBookingStatus(booking._id, 'completed')} className="theme-primary-btn text-sm">
                          Mark Completed
                        </button>
                        <button onClick={() => handleBookingStatus(booking._id, 'cancelled')} className="theme-danger-btn text-sm">
                          Cancel Booking
                        </button>
                        <button onClick={() => handleBookingStatus(booking._id, 'no-show')} className="theme-secondary-btn text-sm">
                          Mark No-Show
                        </button>
                        </>
                      ) : (
                        <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold capitalize text-slate-200">
                          {booking.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {detailBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
            <div className="theme-card w-full max-w-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Booking Details</h2>
                  <p className="mt-1 text-sm text-slate-400">{detailBooking.status}</p>
                </div>
                <button onClick={() => setDetailBooking(null)} className="rounded-full bg-white/10 p-2 text-white"><X size={18} /></button>
              </div>
              <div className="mt-6 grid gap-4 text-sm text-slate-300">
                <p>Customer: {detailBooking.customerId?.name || 'Customer'}</p>
                <p>Email: {detailBooking.customerId?.email || 'N/A'}</p>
                <p>Phone: {detailBooking.customerId?.phone || 'N/A'}</p>
                <p>Date: {formatDate(detailBooking.appointmentDate)} at {detailBooking.appointmentTime}</p>
                <p>Duration: {detailBooking.duration} mins</p>
                <p>Amount: {formatCurrency(detailBooking.price)}</p>
                <p>Staff: {detailBooking.selectedStaffName || 'Any available staff'}</p>
                <p>Notes: {detailBooking.notes || 'No notes'}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BarberDashboard;
