import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, barbersAPI, couponsAPI, servicesAPI } from '../services/api';
import {
  Moon,
  Power,
  Star,
  Sun,
  Sunrise,
  X,
  Plus,
  Scissors,
  CalendarCheck,
  Clock,
  Store,
  Tag,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  User,
  Users,
  Landmark,
  Building2,
  QrCode,
  Wallet,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';

import BarberShopLoader from '../components/BarberShopLoader';
import ShopImageSlider from '../components/ShopImageSlider';
import DashboardWrapper from '../components/dashboard/DashboardWrapper';
import { flash } from '../utils/helpers';
import useAutoDismiss from '../hooks/useAutoDismiss';

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

const defaultShopPreview = 'https://i.ibb.co/tTG7LKWs/barber-shop.avif';
const PAGE_SIZE = 10;
const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'N/A');
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : 'N/A');

const isSameDay = (value, date = new Date()) => {
  if (!value) return false;
  try {
    const next = new Date(value);
    if (Number.isNaN(next.getTime())) return false;

    // 1. Local timezone comparison
    const localNext = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
    const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (localNext === localDate) return true;

    // 2. UTC/ISO string comparison (for dates stored as UTC midnight or raw ISO)
    const utcNext = next.toISOString().slice(0, 10);
    const utcDate = date.toISOString().slice(0, 10);
    if (utcNext === utcDate) return true;

    // 3. String prefix comparison if value is a plain string like "2026-09-09"
    if (typeof value === 'string') {
      const cleanVal = value.slice(0, 10);
      if (cleanVal === localDate || cleanVal === utcDate) return true;
    }

    return false;
  } catch {
    return false;
  }
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

const parseListInput = (value, maxItems = Infinity) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, maxItems);
  }

  return String(value || '')
    .split(/\r?\n|,/)
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, maxItems);
};

const BarberDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [regularCustomers, setRegularCustomers] = useState([]);
  const [detailBooking, setDetailBooking] = useState(null);
  const [bookingPage, setBookingPage] = useState(1);

  const [profileForm, setProfileForm] = useState({
    shopName: '',
    experience: 0,
    specialization: '',
    location: '',
    bio: '',
    shopImage: '',
    staffMembers: '',
    slotCapacity: 3,
    openingTime: '09:00',
    closingTime: '18:00',
    isActive: true,
    isOpen: true,
  });

  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [editingServiceId, setEditingServiceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  // Auto-dismiss error/fail and success banners after 4 seconds
  useAutoDismiss(error, setError, 4000);
  useAutoDismiss(success, setSuccess, 4000);

  const [savingPayout, setSavingPayout] = useState(false);
  const [payoutCopied, setPayoutCopied] = useState('');
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  // Helpers to prevent accidental clearing of Bank & UPI details
  const getCachedPayout = () => {
    try {
      const uId = user?._id || user?.id;
      if (uId) {
        const userStored = localStorage.getItem(`barber_payout_${uId}`);
        if (userStored) {
          const parsed = JSON.parse(userStored);
          if (parsed && (parsed.upiId || parsed.accountNumber || parsed.bankName)) return parsed;
        }
      }
      const savedStored = localStorage.getItem('barber_payout_saved');
      if (savedStored) {
        const parsed = JSON.parse(savedStored);
        if (parsed && (parsed.upiId || parsed.accountNumber || parsed.bankName)) return parsed;
      }
      const currentStored = localStorage.getItem('barber_payout_current');
      if (currentStored) {
        const parsed = JSON.parse(currentStored);
        if (parsed && (parsed.upiId || parsed.accountNumber || parsed.bankName)) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  const saveCachedPayout = (data) => {
    if (!data) return;
    try {
      const uId = user?._id || user?.id;
      const str = JSON.stringify(data);
      if (uId) {
        localStorage.setItem(`barber_payout_${uId}`, str);
      }
      localStorage.setItem('barber_payout_saved', str);
      localStorage.setItem('barber_payout_current', str);
    } catch {}
  };

  // Bank & UPI Receiving Accounts Form State (Hydrated from cache or defaults)
  const [payoutForm, setPayoutForm] = useState(() => {
    const cached = getCachedPayout();
    return {
      upiId: cached?.upiId || '',
      accountHolderName: cached?.accountHolderName || '',
      accountNumber: cached?.accountNumber || '',
      confirmAccountNumber: cached?.confirmAccountNumber || cached?.accountNumber || '',
      ifscCode: cached?.ifscCode || '',
      bankName: cached?.bankName || '',
      accountType: cached?.accountType || 'savings',
      isPaymentActive: cached?.isPaymentActive !== false,
    };
  });

  const profileFormDirtyRef = useRef(false);
  const payoutFormDirtyRef = useRef(false);

  const syncProfileForm = (profileData) => {
    if (!profileData) return;
    setProfileForm({
      shopName: profileData.shopName || '',
      experience: profileData.experience || 0,
      specialization: Array.isArray(profileData.specialization)
        ? profileData.specialization.join(', ')
        : profileData.specialization || '',
      location: profileData.location || '',
      bio: profileData.bio || '',
      shopImage:
        Array.isArray(profileData.shopImages) && profileData.shopImages.length > 0
          ? profileData.shopImages[0]
          : profileData.shopImage || '',
      staffMembers: Array.isArray(profileData.staffMembers)
        ? profileData.staffMembers.join('\n')
        : profileData.staffMembers || '',
      slotCapacity: profileData.slotCapacity || 3,
      openingTime: profileData.openingTime || '09:00',
      closingTime: profileData.closingTime || '18:00',
      isActive: profileData.isActive !== false,
      isOpen: profileData.isOpen !== false,
    });
  };

  const syncPayoutForm = (payoutData) => {
    if (!payoutData) return;
    // CRITICAL: Never wipe out inputs while user has unsaved edits
    if (payoutFormDirtyRef.current) return;

    setPayoutForm((prev) => {
      const cached = getCachedPayout() || {};
      // Non-destructive merge: NEVER overwrite a populated field with an empty string!
      const nextUpi = payoutData.upiId || prev.upiId || cached.upiId || '';
      const nextHolder = payoutData.accountHolderName || prev.accountHolderName || cached.accountHolderName || '';
      const nextAcc = payoutData.accountNumber || prev.accountNumber || cached.accountNumber || '';
      const nextConfirm = payoutData.accountNumber || prev.confirmAccountNumber || cached.confirmAccountNumber || nextAcc;
      const nextIfsc = payoutData.ifscCode || prev.ifscCode || cached.ifscCode || '';
      const nextBank = payoutData.bankName || prev.bankName || cached.bankName || '';
      const nextType = payoutData.accountType || prev.accountType || cached.accountType || 'savings';
      const nextActive = payoutData.isPaymentActive !== undefined
        ? Boolean(payoutData.isPaymentActive)
        : prev.isPaymentActive !== undefined
        ? Boolean(prev.isPaymentActive)
        : true;

      const merged = {
        upiId: nextUpi,
        accountHolderName: nextHolder,
        accountNumber: nextAcc,
        confirmAccountNumber: nextConfirm,
        ifscCode: nextIfsc,
        bankName: nextBank,
        accountType: nextType,
        isPaymentActive: nextActive,
      };

      if (nextUpi || nextAcc || nextBank) {
        saveCachedPayout(merged);
      }
      return merged;
    });
  };

  // Re-hydrate payout form if navigating to payout tab and form fields are empty
  useEffect(() => {
    if (activeTab === 'payout') {
      const cached = getCachedPayout();
      const dbPayout = profile?.payoutDetails;
      if (!payoutForm.accountNumber && !payoutForm.upiId) {
        if (dbPayout && (dbPayout.accountNumber || dbPayout.upiId)) {
          syncPayoutForm(dbPayout);
        } else if (cached && (cached.accountNumber || cached.upiId)) {
          setPayoutForm(cached);
        }
      }
    }
  }, [activeTab, profile]);

  const fetchDashboard = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');

      const [profileRes, servicesRes, bookingsRes, couponsRes, regularsRes] =
        await Promise.allSettled([
          barbersAPI.getMine ? barbersAPI.getMine() : Promise.resolve({ data: {} }),
          servicesAPI.getMine ? servicesAPI.getMine() : Promise.resolve({ data: {} }),
          appointmentsAPI.getBarberBookings ? appointmentsAPI.getBarberBookings() : Promise.resolve({ data: {} }),
          couponsAPI.getBarberCoupons ? couponsAPI.getBarberCoupons() : couponsAPI.getMine ? couponsAPI.getMine() : Promise.resolve({ data: {} }),
          couponsAPI.getRegularCustomers ? couponsAPI.getRegularCustomers() : barbersAPI.getRegularCustomers ? barbersAPI.getRegularCustomers() : Promise.resolve({ data: {} }),
        ]);

      if (profileRes.status === 'fulfilled' && profileRes.value?.data?.barber) {
        const nextProfile = profileRes.value.data.barber;
        setProfile(nextProfile);
        if (!profileFormDirtyRef.current) {
          syncProfileForm(nextProfile);
        }
        syncPayoutForm(nextProfile?.payoutDetails);
      }

      if (servicesRes.status === 'fulfilled' && servicesRes.value?.data) {
        setServices(servicesRes.value.data.services || []);
      }
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.data) {
        setBookings(bookingsRes.value.data.appointments || []);
      }
      if (couponsRes.status === 'fulfilled' && couponsRes.value?.data) {
        setCoupons(couponsRes.value.data.coupons || []);
      }
      if (regularsRes.status === 'fulfilled' && regularsRes.value?.data) {
        setRegularCustomers(regularsRes.value.data.customers || []);
      }

      setLastRefreshedAt(new Date());

      if (profileRes.status === 'rejected' && profileRes.reason?.response?.status !== 404) {
        console.warn('Profile fetch note:', profileRes.reason?.response?.data?.message);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load barber dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const intervalId = window.setInterval(() => fetchDashboard({ silent: true }), 25000);
    return () => window.clearInterval(intervalId);
  }, []);

  const clearBanner = () => {
    setError('');
    setSuccess('');
  };

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    profileFormDirtyRef.current = true;
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
      const payload = {
        shopName: profileForm.shopName,
        experience: Number(profileForm.experience) || 0,
        specialization: parseListInput(profileForm.specialization),
        location: profileForm.location,
        bio: profileForm.bio,
        openingTime: profileForm.openingTime,
        closingTime: profileForm.closingTime,
        isActive: profileForm.isActive,
        isOpen: profileForm.isOpen,
        slotCapacity: Math.max(1, Number(profileForm.slotCapacity) || 1),
        staffMembers: parseListInput(profileForm.staffMembers),
      };

      const shopImageUrl = String(profileForm.shopImage || '').trim();
      payload.shopImages = shopImageUrl ? [shopImageUrl] : [];

      // Preserve payoutDetails if filled in form or cache
      const curPayout = payoutForm.upiId || payoutForm.accountNumber ? payoutForm : getCachedPayout();
      if (curPayout && (curPayout.upiId || curPayout.accountNumber)) {
        payload.payoutDetails = {
          upiId: (curPayout.upiId || '').trim(),
          accountHolderName: (curPayout.accountHolderName || '').trim(),
          accountNumber: (curPayout.accountNumber || '').trim(),
          ifscCode: (curPayout.ifscCode || '').trim().toUpperCase(),
          bankName: (curPayout.bankName || '').trim(),
          accountType: curPayout.accountType || 'savings',
          isPaymentActive: curPayout.isPaymentActive !== false,
        };
      }

      const response = await barbersAPI.updateMine(payload);
      const nextProfile = response.data.barber;
      setProfile(nextProfile);
      profileFormDirtyRef.current = false;
      syncProfileForm(nextProfile);
      if (nextProfile?.payoutDetails) {
        payoutFormDirtyRef.current = false;
        syncPayoutForm(nextProfile.payoutDetails);
      }
      flash(
        setSuccess,
        nextProfile.isApproved
          ? 'Barber shop profile updated successfully.'
          : 'Profile saved. Submit it for admin approval before it can appear publicly.'
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update barber profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePayoutChange = (e) => {
    const { name, value, type, checked } = e.target;
    payoutFormDirtyRef.current = true;
    setPayoutForm((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      saveCachedPayout(next);
      return next;
    });
  };

  const handleSavePayout = async (e) => {
    e.preventDefault();
    clearBanner();

    const upi = (payoutForm.upiId || '').trim();
    const holder = (payoutForm.accountHolderName || '').trim();
    const bank = (payoutForm.bankName || '').trim();
    const accNum = (payoutForm.accountNumber || '').trim();
    const confirmAcc = (payoutForm.confirmAccountNumber || '').trim();
    const ifsc = (payoutForm.ifscCode || '').trim().toUpperCase();

    if (!upi || !upi.includes('@')) {
      setError('UPI ID is required and must contain @ (e.g. yourname@okhdfcbank or 9934630687@upi).');
      return;
    }
    if (!holder || holder.length < 2) {
      setError('Account Holder Name is required (as printed on your bank passbook).');
      return;
    }
    if (!bank || bank.length < 2) {
      setError('Bank Name is required (e.g. State Bank of India / HDFC Bank).');
      return;
    }
    if (!accNum || accNum.length < 9) {
      setError('Bank Account Number is required (minimum 9 digits).');
      return;
    }
    if (accNum !== confirmAcc) {
      setError('Bank account numbers do not match. Please verify both fields.');
      return;
    }
    if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      setError('Valid 11-character Indian IFSC code is required (e.g. SBIN0001234 or HDFC0000128).');
      return;
    }

    try {
      setSavingPayout(true);
      setError('');
      setSuccess('');
      const payoutPayload = {
        upiId: upi,
        accountHolderName: holder,
        accountNumber: accNum,
        ifscCode: ifsc,
        bankName: bank,
        accountType: payoutForm.accountType || 'savings',
        isPaymentActive: payoutForm.isPaymentActive !== false,
      };
      const res = await barbersAPI.updateMine({
        isPayoutFormSubmission: true,
        payoutDetails: payoutPayload,
      });
      if (res.data?.barber) {
        payoutFormDirtyRef.current = false;
        setProfile(res.data.barber);
        syncPayoutForm(res.data.barber.payoutDetails || payoutPayload);
        saveCachedPayout(res.data.barber.payoutDetails || payoutPayload);
        setSuccess('✅ Bank & UPI receiving account saved! Customers will now pay directly to this account.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update receiving accounts');
    } finally {
      setSavingPayout(false);
    }
  };

  const handleShopOpenToggle = async () => {
    try {
      clearBanner();
      const nextIsOpen = !(profile?.isOpen !== false);
      const response = await barbersAPI.updateMine({ isOpen: nextIsOpen });
      const nextProfile = response.data.barber;
      setProfile(nextProfile);
      profileFormDirtyRef.current = false;
      syncProfileForm(nextProfile);
      if (nextProfile?.payoutDetails) {
        syncPayoutForm(nextProfile.payoutDetails);
      }
      setSuccess(
        nextIsOpen && !nextProfile.isApproved
          ? 'Shop status saved. It will appear publicly after admin approval.'
          : nextIsOpen
          ? 'Shop is now OPEN for bookings.'
          : 'Shop is now CLOSED for new bookings.'
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update shop status');
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
        flash(setSuccess, 'Service updated successfully.');
      } else {
        await servicesAPI.create(payload);
        flash(setSuccess, 'Service created successfully.');
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
    setActiveTab('services');
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
      flash(setSuccess, 'Service removed successfully.');
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
      flash(setSuccess, `Booking marked as ${status}.`);
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
      flash(setSuccess, 'Coupon launched and assigned customers were notified.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to launch coupon');
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleSubmitListing = async () => {
    try {
      clearBanner();
      const payout = profile?.payoutDetails || payoutForm;
      if (
        !payout?.upiId?.trim() ||
        !payout?.accountNumber?.trim() ||
        !payout?.ifscCode?.trim() ||
        !payout?.bankName?.trim() ||
        !payout?.accountHolderName?.trim()
      ) {
        setError('Please complete all Bank Account & UPI details in the "Bank & UPI" tab before submitting for admin approval.');
        setActiveTab('payout');
        return;
      }
      setActionLoading('submit-listing');
      const response = await barbersAPI.submitListing();
      const nextProfile = response.data.barber;
      setProfile(nextProfile);
      profileFormDirtyRef.current = false;
      syncProfileForm(nextProfile);
      if (nextProfile?.payoutDetails) {
        syncPayoutForm(nextProfile.payoutDetails);
      }
      flash(setSuccess, 'Your barber shop has been sent to admin for approval.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit shop for admin approval');
    } finally {
      setActionLoading('');
    }
  };

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

  const scheduledBookings = bookings.filter((booking) => booking.status === 'scheduled');
  const completedBookings = bookings.filter((booking) => booking.status === 'completed');
  const sortedBookings = [...bookings].sort((a, b) => {
    const createdDiff = new Date(b.createdAt || b.appointmentDate) - new Date(a.createdAt || a.appointmentDate);
    if (createdDiff !== 0) return createdDiff;
    return String(b._id || '').localeCompare(String(a._id || ''));
  });

  const totalBookingPages = Math.max(1, Math.ceil(sortedBookings.length / PAGE_SIZE));
  const currentBookingPage = Math.min(bookingPage, totalBookingPages);
  const paginatedBookings = sortedBookings.slice(
    (currentBookingPage - 1) * PAGE_SIZE,
    currentBookingPage * PAGE_SIZE
  );

  const todayBookings = sortedBookings.filter((booking) => isSameDay(booking.appointmentDate));
  const reviews = bookings.filter((booking) => booking.feedback?.submittedAt);
  const averageRating = reviews.length
    ? reviews.reduce((sum, booking) => sum + Number(booking.feedback?.rating || 0), 0) / reviews.length
    : 0;
  const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.price || 0), 0);

  const previewImages = profileForm.shopImage?.trim()
    ? [profileForm.shopImage.trim()]
    : Array.isArray(profile?.shopImages) && profile.shopImages.length > 0
    ? profile.shopImages
    : profile?.shopImage
    ? [profile.shopImage]
    : [defaultShopPreview];

  const previewStaffMembers = parseListInput(profileForm.staffMembers);

  const suspensionLabel = getSuspensionLabel(profile);

  const statCards = [
    { label: "Today's Bookings", value: todayBookings.length, tone: 'text-cyan-200', tab: 'today' },
    { label: 'Upcoming Bookings', value: scheduledBookings.length, tone: 'text-sky-200', tab: 'bookings' },
    { label: 'Completed Jobs', value: completedBookings.length, tone: 'text-emerald-200', tab: 'bookings' },
    { label: 'Total Bookings', value: bookings.length, tone: 'text-violet-200', tab: 'bookings' },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), tone: 'text-rose-200', tab: 'overview' },
    { label: 'Active Services', value: services.length, tone: 'text-amber-200', tab: 'services' },
    {
      label: 'Rating',
      value: reviews.length ? `${averageRating.toFixed(1)}/5` : 'No reviews',
      tone: 'text-amber-200',
      tab: 'feedback',
    },
  ];

  const renderBookingCard = (booking, index, labelPrefix = '#') => (
    <div key={booking._id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg">
      <div className="grid gap-4 lg:grid-cols-[auto_1.2fr_1fr_auto] lg:items-start">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400/10 font-bold text-amber-200">
          {labelPrefix}{index + 1}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-white">{booking.customerId?.name || 'Customer'}</h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                booking.status === 'completed'
                  ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
                  : booking.status === 'scheduled'
                  ? 'bg-sky-400/15 text-sky-300 border border-sky-400/30'
                  : 'bg-red-400/15 text-red-300 border border-red-400/30'
              }`}
            >
              {booking.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-300">{booking.customerId?.phone || 'No phone available'}</p>
          <div className="mt-3 text-xs">
            <span className="text-slate-400">Service: </span>
            <span className="font-semibold text-slate-100">
              {booking.serviceIds?.length
                ? booking.serviceIds.map((s) => s.name).join(', ')
                : booking.serviceId?.name || 'Service removed'}
            </span>
          </div>
          <div className="mt-1 text-xs">
            <span className="text-slate-400">Schedule: </span>
            <span className="font-semibold text-slate-100">
              {formatDate(booking.appointmentDate)} at {booking.appointmentTime}
            </span>
          </div>
          <div className="mt-1 text-xs">
            <span className="text-slate-400">Price: </span>
            <span className="font-bold text-amber-200">{formatCurrency(booking.price)}</span>
            {booking.couponCode && (
              <span className="ml-2 text-emerald-300">
                (Coupon {booking.couponCode}: -{formatCurrency(booking.discountAmount)})
              </span>
            )}
          </div>
          {booking.notes && <p className="mt-2 text-xs italic text-slate-400">Notes: "{booking.notes}"</p>}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
          <p className="text-slate-400">Duration</p>
          <p className="mt-0.5 text-sm font-semibold text-white">{booking.duration} mins</p>
          <p className="mt-3 text-slate-400">Customer Email</p>
          <p className="mt-0.5 text-xs font-medium text-white break-all">{booking.customerId?.email || 'N/A'}</p>
          <p className="mt-3 text-slate-400">Booked At</p>
          <p className="mt-0.5 text-xs font-medium text-slate-300">{formatDateTime(booking.createdAt)}</p>
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-col">
          <button onClick={() => setDetailBooking(booking)} className="theme-secondary-btn px-3 py-1.5 text-xs">
            Detail
          </button>
          {booking.status === 'scheduled' ? (
            <>
              <button
                onClick={() => handleBookingStatus(booking._id, 'completed')}
                className="theme-primary-btn px-3 py-1.5 text-xs font-semibold"
              >
                Mark Completed
              </button>
              <button
                onClick={() => handleBookingStatus(booking._id, 'cancelled')}
                className="theme-danger-btn px-3 py-1.5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBookingStatus(booking._id, 'no-show')}
                className="theme-secondary-btn px-3 py-1.5 text-xs"
              >
                No-Show
              </button>
            </>
          ) : (
            <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-center text-xs font-semibold capitalize text-slate-300">
              {booking.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return profile?.shopName || 'Barber Studio Workspace';
      case 'today':
        return "Today's Bookings";
      case 'bookings':
        return 'All Customer Bookings';
      case 'profile':
        return 'Barber Shop Profile & Working Hours';
      case 'services':
        return 'Services Catalog & Pricing';
      case 'coupons':
        return 'Smile Coupons & Promotional Offers';
      case 'feedback':
        return 'Customer Reviews & Feedback';
      default:
        return 'Barber Studio';
    }
  };

  return (
    <DashboardWrapper
      role="barber"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={getTabTitle()}
      subtitle={profile?.location ? `Location: ${profile.location}` : 'Manage shop profile, services, and live bookings'}
      badges={{
        todayCount: todayBookings.length,
        totalBookings: bookings.length,
        servicesCount: services.length,
        couponsCount: coupons.length,
        reviewsCount: reviews.length,
      }}
      notificationsData={{
        todayCount: todayBookings.length,
        isApproved: profile?.isApproved,
      }}
      onRefresh={() => fetchDashboard({ silent: true })}
      isRefreshing={refreshing}
      lastUpdated={lastRefreshedAt}
      customSidebarHeader={
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Shop Status</span>
            <button
              type="button"
              onClick={handleShopOpenToggle}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                profile?.isOpen !== false
                  ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25'
                  : 'border-red-400/30 bg-red-500/15 text-red-300 hover:bg-red-500/25'
              }`}
            >
              <Power size={12} />
              {profile?.isOpen !== false ? 'OPEN' : 'CLOSED'}
            </button>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Listing Status:</span>
            <span
              className={`font-semibold ${
                profile?.isApproved ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {profile?.isApproved ? 'Approved & Public' : 'Pending Approval'}
            </span>
          </div>
        </div>
      }
      headerActions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShopOpenToggle}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              profile?.isOpen !== false
                ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25'
                : 'border-red-400/30 bg-red-500/15 text-red-300 hover:bg-red-500/25'
            }`}
          >
            <Power size={14} />
            <span>{profile?.isOpen !== false ? 'Shop Open' : 'Shop Closed'}</span>
          </button>
        </div>
      }
    >
      {/* ALERTS & STATUS BANNERS */}
      {error && (
        <div className="alert alert-error mb-6 border border-red-400/20 bg-red-500/10 text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success mb-6 border border-emerald-400/20 bg-emerald-500/10 text-emerald-100">
          {success}
        </div>
      )}
      {profile?.isApproved ? (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Verified Partner
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  LIVE
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-200">
                Your shop is approved by Admin and visible in customer booking search results.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-200">
            ✓ Public Listing Active
          </span>
        </div>
      ) : (
        <div className="alert alert-warning mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border border-yellow-400/20 bg-yellow-500/10 text-yellow-100">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0 text-yellow-300" />
            <p className="text-sm">
              Your barber shop profile is pending admin approval before appearing in public listings.
            </p>
          </div>
          <button
            type="button"
            disabled={actionLoading === 'submit-listing' || profile?.listingStatus === 'pending'}
            onClick={handleSubmitListing}
            className="theme-primary-btn shrink-0 text-xs font-semibold"
          >
            {actionLoading === 'submit-listing'
              ? 'Submitting...'
              : profile?.listingStatus === 'pending'
              ? 'Under Review'
              : 'Submit for Admin Approval'}
          </button>
        </div>
      )}
      {suspensionLabel && (
        <div className="alert alert-error mb-6 border border-red-400/20 bg-red-500/10 text-red-100">
          Your barber shop is {suspensionLabel}. It is hidden from public listing until {formatDate(profile.suspendedUntil)}.
          {profile.suspensionReason ? ` Reason: ${profile.suspensionReason}` : ''}
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* HERO BANNER */}
          <div className="theme-hero">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-amber-200">
                  <Scissors size={14} className="text-amber-300" />
                  Barber Partner Studio
                </span>
                <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                  {profile?.shopName || `${user?.name}'s Barber Studio`}
                </h1>
                <p className="mt-2 text-sm text-slate-300 max-w-2xl">
                  Manage your public shop profile, service pricing, customer bookings, and regular client rewards.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
                  {profile?.location || 'Add location'}
                </span>
                <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1.5 text-amber-200">
                  {profile?.experience || 0} yrs experience
                </span>
                <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1.5 text-sky-200">
                  {formatHours(profile?.openingTime, profile?.closingTime)}
                </span>
              </div>
            </div>
          </div>

          {/* STATS TILES */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-7">
            {statCards.map((card) => (
              <button
                key={card.label}
                type="button"
                onClick={() => setActiveTab(card.tab)}
                className="theme-card text-left transition hover:border-amber-300/40 p-4"
              >
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{card.label}</p>
                <p className={`mt-2 text-2xl font-bold ${card.tone}`}>{card.value}</p>
              </button>
            ))}
          </div>

          {/* QUICK SHORTCUT CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <button
              onClick={() => setActiveTab('today')}
              className="flex items-center gap-3.5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-left transition hover:bg-cyan-400/10"
            >
              <div className="rounded-xl bg-cyan-400/20 p-2.5 text-cyan-300">
                <Clock size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">Today's Bookings</p>
                <p className="text-[11px] text-slate-400 truncate">{todayBookings.length} clients</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('payout')}
              className="flex items-center gap-3.5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-left transition hover:bg-emerald-400/10"
            >
              <div className="rounded-xl bg-emerald-400/20 p-2.5 text-emerald-300">
                <Landmark size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">Bank &amp; UPI</p>
                <p className="text-[11px] text-emerald-300 font-mono truncate">{payoutForm.upiId || 'Add receiving account'}</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className="flex items-center gap-3.5 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-left transition hover:bg-amber-400/10"
            >
              <div className="rounded-xl bg-amber-400/20 p-2.5 text-amber-300">
                <Scissors size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">Menu &amp; Prices</p>
                <p className="text-[11px] text-slate-400 truncate">{services.length} items</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className="flex items-center gap-3.5 rounded-2xl border border-purple-400/20 bg-purple-400/5 p-4 text-left transition hover:bg-purple-400/10"
            >
              <div className="rounded-xl bg-purple-400/20 p-2.5 text-purple-300">
                <Tag size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">Coupons</p>
                <p className="text-[11px] text-slate-400 truncate">{coupons.length} vouchers</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className="flex items-center gap-3.5 rounded-2xl border border-violet-400/20 bg-violet-400/5 p-4 text-left transition hover:bg-violet-400/10"
            >
              <div className="rounded-xl bg-violet-400/20 p-2.5 text-violet-300">
                <Star size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">Reviews</p>
                <p className="text-[11px] text-slate-400 truncate">{reviews.length} ratings</p>
              </div>
            </button>
          </div>

          {/* TODAY'S APPOINTMENTS PREVIEW ON OVERVIEW */}
          <div className="theme-card">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Today's Bookings</h2>
                <p className="mt-1 text-xs text-slate-400">Quick view of bookings scheduled for today.</p>
              </div>
              <button onClick={() => setActiveTab('today')} className="text-xs font-semibold text-amber-300 hover:underline">
                View Today's Bookings ({todayBookings.length})
              </button>
            </div>

            {todayBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
                <Clock size={32} className="mx-auto mb-2 text-slate-600" />
                <p className="text-sm">No bookings scheduled for today.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayBookings.slice(0, 3).map((booking, index) => renderBookingCard(booking, index, 'T'))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TODAY'S BOOKINGS */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          <div className="theme-card">
            <div className="mb-6 flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Today's Live Bookings</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Real-time appointments for today. Mark them completed as you finish servicing each customer.
                </p>
              </div>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold text-cyan-200">
                {todayBookings.length} Today's Appointments
              </span>
            </div>

            {todayBookings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-400">
                <Clock size={40} className="mx-auto mb-3 text-cyan-400/40" />
                <h3 className="text-lg font-semibold text-white">No bookings scheduled for today</h3>
                <p className="mt-1 text-xs text-slate-400">New customer bookings for today will appear here live.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayBookings.map((booking, index) => renderBookingCard(booking, index, 'T'))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="theme-card">
            <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">All Customer Bookings</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Complete history of all customer appointments, orders, and payment statuses.
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 font-semibold text-sky-200">
                  {scheduledBookings.length} Pending
                </span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-semibold text-emerald-200">
                  {completedBookings.length} Completed
                </span>
              </div>
            </div>

            {sortedBookings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-400">
                <CalendarCheck size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="text-base font-semibold text-white">No bookings received yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedBookings.map((booking, index) =>
                  renderBookingCard(booking, (currentBookingPage - 1) * PAGE_SIZE + index)
                )}
              </div>
            )}

            {sortedBookings.length > PAGE_SIZE && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {Array.from({ length: totalBookingPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setBookingPage(page)}
                    className={`h-9 min-w-[2.25rem] rounded-xl border px-3 text-xs font-bold transition ${
                      currentBookingPage === page
                        ? 'border-amber-300 bg-amber-400 text-slate-950'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:border-amber-300/40'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: BANK & UPI RECEIVING ACCOUNTS */}
      {activeTab === 'payout' && (
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="theme-card">
            <div className="mb-6 border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Landmark className="text-amber-400" size={24} />
                  <h2 className="text-2xl font-bold text-white">Bank &amp; UPI Receiving Accounts</h2>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Configure the bank account and UPI ID where customer booking payments will be directly received.
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                payoutForm.isPaymentActive && payoutForm.upiId
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-400/30 bg-amber-400/10 text-amber-300'
              }`}>
                <span className={`h-2 w-2 rounded-full ${payoutForm.isPaymentActive && payoutForm.upiId ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {payoutForm.isPaymentActive && payoutForm.upiId ? 'Direct Payouts Active' : 'Setup Required'}
              </span>
            </div>

            <form onSubmit={handleSavePayout} className="space-y-6">
              {/* UPI SECTION */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                  <QrCode size={18} />
                  <span>UPI ID / VPA (Primary For Dynamic QR Payments)</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Customers scanning the QR code with Google Pay, PhonePe, Paytm or BHIM will pay directly to this UPI ID.
                </p>

                <div className="mt-4">
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-300">
                    <span>Your UPI ID / Virtual Payment Address</span>
                    <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="upiId"
                    required
                    value={payoutForm.upiId}
                    onChange={handlePayoutChange}
                    placeholder="e.g. yourname@okhdfcbank or 9934630687@upi"
                    className="theme-input font-mono text-sm"
                  />
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span>Quick Handles:</span>
                    {['@okhdfcbank', '@okaxis', '@paytm', '@ybl', '@ibl'].map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => {
                          const base = payoutForm.upiId.includes('@') ? payoutForm.upiId.split('@')[0] : payoutForm.upiId || 'shopname';
                          payoutFormDirtyRef.current = true;
                          setPayoutForm((prev) => {
                            const next = { ...prev, upiId: `${base}${handle}` };
                            saveCachedPayout(next);
                            return next;
                          });
                        }}
                        className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-amber-300 hover:border-amber-400/40"
                      >
                        {handle}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* BANK ACCOUNT SECTION */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                  <Building2 size={18} />
                  <span>Bank Account Details (For IMPS / Direct Transfers &amp; Settlements)</span>
                  <span className="text-[11px] rounded bg-rose-500/20 px-1.5 py-0.5 text-rose-300 font-medium">All fields required</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Bank account for official invoice settlements and customer direct bank transfers.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-300">
                      <span>Account Holder Name</span>
                      <span className="text-rose-400 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountHolderName"
                      required
                      value={payoutForm.accountHolderName}
                      onChange={handlePayoutChange}
                      placeholder="Name as printed on Bank Passbook"
                      className="theme-input text-xs uppercase"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-300">
                      <span>Bank Name</span>
                      <span className="text-rose-400 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      required
                      value={payoutForm.bankName}
                      onChange={handlePayoutChange}
                      placeholder="e.g. State Bank of India / HDFC Bank"
                      className="theme-input text-xs"
                    />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="flex items-center gap-1 text-xs font-semibold text-slate-300">
                        <span>Bank Account Number</span>
                        <span className="text-rose-400 font-bold">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAccountNumber((prev) => !prev)}
                        className="flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:text-amber-200"
                      >
                        {showAccountNumber ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>{showAccountNumber ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      type={showAccountNumber ? 'text' : 'password'}
                      name="accountNumber"
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      required
                      value={payoutForm.accountNumber}
                      onChange={handlePayoutChange}
                      placeholder="Enter Account Number (min 9 digits)"
                      className="theme-input font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-300">
                      <span>Confirm Account Number</span>
                      <span className="text-rose-400 font-bold">*</span>
                    </label>
                    <input
                      type={showAccountNumber ? 'text' : 'password'}
                      name="confirmAccountNumber"
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      required
                      value={payoutForm.confirmAccountNumber}
                      onChange={handlePayoutChange}
                      placeholder="Re-enter Account Number"
                      className="theme-input font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-300">
                      <span>IFSC Code</span>
                      <span className="text-rose-400 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      required
                      value={payoutForm.ifscCode}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        payoutFormDirtyRef.current = true;
                        setPayoutForm((prev) => {
                          const next = { ...prev, ifscCode: val };
                          saveCachedPayout(next);
                          return next;
                        });
                      }}
                      maxLength={11}
                      placeholder="e.g. SBIN0001234"
                      className="theme-input font-mono text-xs uppercase"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-300">
                      <span>Account Type</span>
                      <span className="text-rose-400 font-bold">*</span>
                    </label>
                    <select
                      name="accountType"
                      required
                      value={payoutForm.accountType}
                      onChange={handlePayoutChange}
                      className="theme-select text-xs"
                    >
                      <option value="savings">Savings Account</option>
                      <option value="current">Current Account</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ACTIVE TOGGLE */}
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200 cursor-pointer hover:border-amber-400/30 transition">
                <input
                  type="checkbox"
                  name="isPaymentActive"
                  checked={payoutForm.isPaymentActive}
                  onChange={handlePayoutChange}
                  className="h-4 w-4 rounded accent-amber-400"
                />
                <div>
                  <p className="font-bold text-white">Enable Direct Customer Payments to this Account</p>
                  <p className="text-[11px] text-slate-400">
                    When active, customers will scan a dynamic QR code directed to your UPI handle when booking services.
                  </p>
                </div>
              </label>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={savingPayout}
                  className="theme-primary-btn px-6 py-3 text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  {savingPayout ? 'Saving Receiving Account...' : 'Save Bank & UPI Account'}
                </button>
              </div>
            </form>
          </section>

          {/* RIGHT COLUMN: LIVE CUSTOMER PAYMENT PREVIEW */}
          <section className="space-y-6">
            <div className="theme-card">
              <div className="border-b border-white/10 pb-4">
                <p className="text-xs uppercase font-bold tracking-wider text-amber-300">Live Customer Preview</p>
                <h3 className="mt-1 text-lg font-bold text-white">Customer Checkout View</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  How customers see your payment option when checking out:
                </p>
              </div>

              {/* SIMULATED CUSTOMER CHECKOUT BOX */}
              <div className="mt-5 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/5 via-slate-900 to-slate-950 p-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white">Direct Barber Payment</span>
                  </div>
                  <span className="rounded bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    VERIFIED
                  </span>
                </div>

                <div className="mt-4 flex flex-col items-center text-center">
                  <div className="rounded-xl border-2 border-white bg-white p-2 shadow-md">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=4&data=${encodeURIComponent(
                        payoutForm.upiId
                          ? `upi://pay?pa=${payoutForm.upiId}&pn=${encodeURIComponent(profileForm.shopName || user?.name || 'Barber')}&am=300&cu=INR`
                          : 'upi://pay?pa=barbershop@upi'
                      )}`}
                      alt="Sample QR"
                      className="h-32 w-32 object-contain"
                    />
                  </div>

                  <p className="mt-3 text-xs font-semibold text-white">
                    Scan with any UPI App
                  </p>
                  <p className="font-mono text-xs text-amber-300">
                    {payoutForm.upiId || 'No UPI ID configured yet'}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Payee: <strong>{profileForm.shopName || user?.name || 'Barber Shop'}</strong>
                  </p>
                </div>

                {/* BANK DETAILS PREVIEW */}
                {payoutForm.accountNumber && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bank:</span>
                      <strong className="text-white">{payoutForm.bankName || 'Verified Bank'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account:</span>
                      <strong className="font-mono text-amber-300">
                        •••• •••• {payoutForm.accountNumber.slice(-4)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IFSC:</span>
                      <strong className="font-mono text-white">{payoutForm.ifscCode || 'IFSC'}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-white/5 bg-slate-900/60 p-3.5 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck size={15} className="text-emerald-400" />
                  <span>Payments transfer directly into your account</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Zap size={15} className="text-amber-400" />
                  <span>Instant 0% gateway deductions on direct UPI</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: SHOP PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="theme-card">
            <div className="mb-6 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white">Barber Shop Profile</h2>
              <p className="mt-1 text-xs text-slate-400">
                Keep your details updated so customers have accurate information when booking.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Barber Name</label>
                <input value={user?.name || profile?.userId?.name || ''} className="theme-input text-xs" disabled readOnly />
                <p className="mt-1 text-[11px] text-slate-500">From account profile.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Shop Name</label>
                <input name="shopName" value={profileForm.shopName} onChange={handleProfileChange} className="theme-input text-xs" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Opening Time</label>
                <input type="time" name="openingTime" value={profileForm.openingTime} onChange={handleProfileChange} className="theme-input text-xs" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Closing Time</label>
                <input type="time" name="closingTime" value={profileForm.closingTime} onChange={handleProfileChange} className="theme-input text-xs" required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Shop Photo URL</label>
                <input
                  name="shopImage"
                  value={profileForm.shopImage}
                  onChange={handleProfileChange}
                  className="theme-input text-xs"
                  placeholder="https://i.ibb.co/..."
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Enter shop photo URL. Convert image if needed:{' '}
                  <a href="https://image-to-url-iota.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                    Image to URL Converter
                  </a>
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Staff Members</label>
                <textarea
                  name="staffMembers"
                  value={profileForm.staffMembers}
                  onChange={handleProfileChange}
                  className="theme-input h-20 text-xs"
                  placeholder="Rahul, Amit, Vikram (comma or newline separated)"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Staff count determines concurrent bookings allowed.
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Slot Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  name="slotCapacity"
                  value={profileForm.slotCapacity}
                  onChange={handleProfileChange}
                  className="theme-input text-xs"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Experience (Years)</label>
                <input type="number" min="0" name="experience" value={profileForm.experience} onChange={handleProfileChange} className="theme-input text-xs" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Location</label>
                <input name="location" value={profileForm.location} onChange={handleProfileChange} className="theme-input text-xs" placeholder="City, Area, Landmark" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Specialization</label>
                <input name="specialization" value={profileForm.specialization} onChange={handleProfileChange} className="theme-input text-xs" placeholder="fade, beard styling, hair spa" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Bio</label>
                <textarea name="bio" value={profileForm.bio} onChange={handleProfileChange} className="theme-input text-xs" rows="3" placeholder="Share your shop's signature craft and experience." />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200 md:col-span-2">
                <input type="checkbox" name="isActive" checked={profileForm.isActive} onChange={handleProfileChange} disabled={Boolean(suspensionLabel)} />
                Accept new customer bookings online
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200 md:col-span-2">
                <input type="checkbox" name="isOpen" checked={profileForm.isOpen} onChange={handleProfileChange} />
                Shop open today
              </label>
              <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                <button type="submit" disabled={savingProfile} className="theme-primary-btn text-xs font-semibold">
                  {savingProfile ? 'Saving...' : 'Save Shop Profile'}
                </button>
                {!profile?.isApproved && (
                  <button
                    type="button"
                    disabled={actionLoading === 'submit-listing' || profile?.listingStatus === 'pending'}
                    onClick={handleSubmitListing}
                    className="theme-secondary-btn text-xs font-semibold"
                  >
                    {actionLoading === 'submit-listing'
                      ? 'Submitting...'
                      : profile?.listingStatus === 'pending'
                      ? 'Waiting for Admin Approval'
                      : 'Submit for Admin Approval'}
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* LIVE PREVIEW */}
          <section className="theme-card">
            <div className="mb-6 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white">Public Preview</h2>
              <p className="mt-1 text-xs text-slate-400">Live preview of how your shop card appears to clients.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-xl">
              <ShopImageSlider images={previewImages} className="h-48" />
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-300">Public Preview</p>
                <h3 className="mt-2 text-xl font-bold text-white">{profileForm.shopName || 'Your Shop Name'}</h3>
                <p className="text-xs text-slate-300">{user?.name || 'Barber Name'}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    {profileForm.location || 'Location'}
                  </span>
                  <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-2.5 py-1 text-sky-200">
                    {formatHours(profileForm.openingTime, profileForm.closingTime)}
                  </span>
                  {Number(profileForm.slotCapacity) > 0 && (
                    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-amber-300">
                      {profileForm.slotCapacity} Chairs
                    </span>
                  )}
                </div>

                {/* STAFF SPECIALISTS DISPLAY IN PUBLIC PREVIEW */}
                {previewStaffMembers.length > 0 ? (
                  <div className="mt-4 pt-3.5 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-amber-400" />
                        Staff Specialists ({previewStaffMembers.length}):
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Live Booking Active
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {previewStaffMembers.map((staff, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 to-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 shadow-sm"
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                            {staff.charAt(0).toUpperCase()}
                          </span>
                          <span>{staff}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-3.5 border-t border-white/10">
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span>Solo Stylist: <strong className="text-slate-200">{user?.name || 'Owner'}</strong></span>
                    </p>
                  </div>
                )}

                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  {profileForm.bio || 'Add a bio so customers discover your salon specialties.'}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 5: SERVICES & PRICING */}
      {activeTab === 'services' && (
        <div className="space-y-8">
          <section className="theme-card">
            <div className="mb-6 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white">
                {editingServiceId ? 'Edit Service' : 'Add New Service'}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Define services, prices, and durations for customers to select during appointment booking.
              </p>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-200">Service Name</label>
                <input name="name" value={serviceForm.name} onChange={handleServiceChange} className="theme-input text-xs" required placeholder="e.g. Classic Haircut & Styling" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-200">Description</label>
                <textarea name="description" value={serviceForm.description} onChange={handleServiceChange} className="theme-input text-xs" rows="2" placeholder="What is included in this service..." />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-200">Price (Rs.)</label>
                  <input type="number" min="0" name="price" value={serviceForm.price} onChange={handleServiceChange} className="theme-input text-xs" required placeholder="250" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-200">Duration (Minutes)</label>
                  <input type="number" min="15" step="15" name="duration" value={serviceForm.duration} onChange={handleServiceChange} className="theme-input text-xs" required />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-200">Category</label>
                  <select name="category" value={serviceForm.category} onChange={handleServiceChange} className="theme-select text-xs">
                    <option value="haircut">Haircut</option>
                    <option value="shaving">Shaving</option>
                    <option value="coloring">Coloring</option>
                    <option value="treatment">Treatment</option>
                    <option value="grooming">Grooming</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="submit" disabled={savingService} className="theme-primary-btn text-xs font-semibold">
                  {savingService ? 'Saving...' : editingServiceId ? 'Update Service' : 'Add Service'}
                </button>
                {editingServiceId && (
                  <button type="button" onClick={resetServiceForm} className="theme-secondary-btn text-xs">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* SERVICES LIST */}
          <section className="theme-card">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Your Listed Services</h2>
                <p className="mt-1 text-xs text-slate-400">Services visible to customers on your public profile.</p>
              </div>
              <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200">
                {services.length} Listed
              </span>
            </div>

            {services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
                <Scissors size={32} className="mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-semibold text-white">No services created yet.</p>
                <p className="mt-1 text-xs text-slate-500">Create your first service item using the form above.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <div key={service._id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-md bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          {service.category}
                        </span>
                        <h3 className="mt-2 text-base font-bold text-white">{service.name}</h3>
                      </div>
                      <span className="rounded-xl border border-amber-300/30 bg-slate-950 px-2.5 py-1 text-xs font-bold text-amber-200">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400 line-clamp-2">{service.description || 'No description provided.'}</p>
                    <p className="mt-3 text-xs text-slate-500">{service.duration} mins</p>
                    <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
                      <button onClick={() => handleEditService(service)} className="theme-secondary-btn flex-1 text-center text-xs py-1.5">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteService(service._id)} className="theme-danger-btn flex-1 text-center text-xs py-1.5">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 6: SMILE COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-8">
          <section className="theme-card">
            <div className="mb-6 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white">Launch Smile Coupon</h2>
              <p className="mt-1 text-xs text-slate-400">
                Reward your regular customers with special voucher discounts.
              </p>
            </div>

            <form onSubmit={handleCouponSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-200">Coupon Title</label>
                <input name="title" value={couponForm.title} onChange={handleCouponChange} className="theme-input text-xs" required placeholder="Regular Customer Reward" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-200">Coupon Code</label>
                <input name="code" value={couponForm.code} onChange={handleCouponChange} className="theme-input uppercase font-mono text-xs" required placeholder="REWARD20" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-200">Discount Type</label>
                <select name="discountType" value={couponForm.discountType} onChange={handleCouponChange} className="theme-select text-xs">
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat Amount (Rs.)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-200">Discount Value</label>
                <input type="number" min="1" name="discountValue" value={couponForm.discountValue} onChange={handleCouponChange} className="theme-input text-xs" required placeholder="20" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-200">Minimum Spend (Rs.)</label>
                <input type="number" min="0" name="minSpend" value={couponForm.minSpend} onChange={handleCouponChange} className="theme-input text-xs" placeholder="0" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-200">Valid For (Days)</label>
                <input type="number" min="1" name="validDays" value={couponForm.validDays} onChange={handleCouponChange} className="theme-input text-xs" required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-200">Assign To Regular Customers</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {regularCustomers.slice(0, 8).map((customer) => (
                    <label key={customer._id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200">
                      <div>
                        <p className="font-bold text-white">{customer.name}</p>
                        <p className="text-[11px] text-slate-400">{customer.completedCount} visits</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={couponForm.assignedCustomerIds.includes(customer._id)}
                        onChange={() => handleCouponCustomerToggle(customer._id)}
                        className="h-4 w-4"
                      />
                    </label>
                  ))}
                </div>
                {regularCustomers.length === 0 && (
                  <p className="text-xs text-slate-400">Regular customers will appear automatically as clients complete bookings.</p>
                )}
              </div>
              <button type="submit" disabled={savingCoupon} className="theme-primary-btn text-xs font-semibold md:col-span-2">
                {savingCoupon ? 'Launching Coupon...' : 'Launch Coupon & Notify Customers'}
              </button>
            </form>
          </section>

          {/* ACTIVE COUPONS */}
          <section className="theme-card">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Active Launched Coupons</h2>
                <p className="mt-1 text-xs text-slate-400">Coupons currently valid for your customers.</p>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">
                {coupons.length} Active
              </span>
            </div>

            {coupons.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
                <Tag size={32} className="mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-semibold text-white">No active coupons launched.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {coupons.map((coupon) => (
                  <div key={coupon._id} className="rounded-2xl border border-amber-300/20 bg-gradient-to-br from-amber-400/10 to-slate-900/90 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-200 bg-slate-950 px-2 py-0.5 rounded border border-amber-300/30">
                          {coupon.code}
                        </span>
                        <h3 className="mt-2 text-sm font-bold text-white">{coupon.title}</h3>
                      </div>
                      <span className="text-sm font-bold text-amber-300">
                        {coupon.discountType === 'flat' ? formatCurrency(coupon.discountValue) : `${coupon.discountValue}%`} OFF
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Valid until {formatDate(coupon.validUntil)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 7: REVIEWS & FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="theme-card">
            <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Customer Reviews & Ratings</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Verified customer feedback collected automatically after completed appointments.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-2.5">
                <StarRating rating={Math.round(averageRating)} />
                <span className="text-sm font-bold text-amber-200">
                  {reviews.length ? `${averageRating.toFixed(1)} / 5 (${reviews.length} reviews)` : 'No ratings yet'}
                </span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-400">
                <Star size={40} className="mx-auto mb-3 text-amber-400/40" />
                <h3 className="text-lg font-semibold text-white">No customer reviews yet</h3>
                <p className="mt-1 text-xs text-slate-400">Reviews and ratings will appear here as customers complete bookings.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((booking) => (
                  <div key={booking._id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white">{booking.customerId?.name || 'Customer'}</h3>
                        <p className="text-[11px] text-slate-400">{formatDate(booking.feedback.submittedAt)}</p>
                      </div>
                      <StarRating rating={booking.feedback.rating} />
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-300">
                      {booking.feedback.comment || 'Customer gave a star rating without text.'}
                    </p>
                    {booking.feedback.improvement && (
                      <div className="mt-3 rounded-xl border border-amber-300/10 bg-amber-400/5 p-2.5 text-xs text-amber-100">
                        <span className="font-semibold text-amber-300">Suggestion: </span>
                        {booking.feedback.improvement}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="theme-card w-full max-w-lg">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Booking Details</h2>
                <p className="mt-0.5 text-xs text-slate-400">Status: {detailBooking.status}</p>
              </div>
              <button onClick={() => setDetailBooking(null)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 grid gap-3 text-xs text-slate-300">
              <div className="flex justify-between border-b border-white/5 py-1.5">
                <span className="text-slate-400">Customer Name</span>
                <span className="font-semibold text-white">{detailBooking.customerId?.name || 'Customer'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1.5">
                <span className="text-slate-400">Email</span>
                <span className="font-semibold text-white">{detailBooking.customerId?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1.5">
                <span className="text-slate-400">Phone</span>
                <span className="font-semibold text-white">{detailBooking.customerId?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1.5">
                <span className="text-slate-400">Date & Time</span>
                <span className="font-semibold text-white">{formatDate(detailBooking.appointmentDate)} at {detailBooking.appointmentTime}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1.5">
                <span className="text-slate-400">Duration</span>
                <span className="font-semibold text-white">{detailBooking.duration} mins</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1.5">
                <span className="text-slate-400">Original Price</span>
                <span className="font-semibold text-white">{formatCurrency(detailBooking.originalPrice || detailBooking.price)}</span>
              </div>
              {detailBooking.discountAmount > 0 && (
                <div className="flex justify-between border-b border-white/5 py-1.5 text-emerald-300">
                  <span>Discount ({detailBooking.couponCode})</span>
                  <span>-{formatCurrency(detailBooking.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-white/5 py-1.5">
                <span className="text-slate-400">Final Amount</span>
                <span className="font-bold text-amber-200">{formatCurrency(detailBooking.price)}</span>
              </div>
              {detailBooking.notes && (
                <div className="pt-2">
                  <p className="text-slate-400">Notes:</p>
                  <p className="mt-1 text-slate-200 bg-white/5 p-2.5 rounded-xl">{detailBooking.notes}</p>
                </div>
              )}
            </div>
            <button onClick={() => setDetailBooking(null)} className="theme-secondary-btn mt-6 w-full text-xs font-semibold">
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
};

export default BarberDashboard;
