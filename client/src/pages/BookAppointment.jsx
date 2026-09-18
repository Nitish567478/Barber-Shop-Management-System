import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, barbersAPI, couponsAPI, servicesAPI } from '../services/api';
import { isValidObjectId } from '../utils/objectId';
import BarberShopLoader from '../components/BarberShopLoader';
import { flash } from '../utils/helpers';
import { playNotificationSound } from '../utils/notificationSound';
import useAutoDismiss from '../hooks/useAutoDismiss';
import { trackEvent, trackBookingConfirmed } from '../utils/googleAnalytics';
import {
  Scissors,
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Tag,
  CreditCard,
  Banknote,
  X,
  UserCheck,
  Search,
  User,
  Store,
  ArrowRightLeft,
  Check,
  ArrowRight,
  Zap,
} from 'lucide-react';

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

// Format date into YYYY-MM-DD based on local client timezone
const getLocalDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format 24h 'HH:MM' into 'hh:mm AM/PM'
const formatTime12h = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
};

// Grouped time slots
const TIME_SLOT_GROUPS = [
  {
    id: 'morning',
    title: 'Morning',
    period: '09:00 AM - 11:30 AM',
    emoji: '🌅',
    slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  },
  {
    id: 'afternoon',
    title: 'Afternoon',
    period: '12:00 PM - 04:30 PM',
    emoji: '☀️',
    slots: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
  },
  {
    id: 'evening',
    title: 'Evening',
    period: '05:00 PM - 08:30 PM',
    emoji: '🌙',
    slots: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'],
  },
];

const ALL_SLOTS = TIME_SLOT_GROUPS.flatMap((g) => g.slots);

const SERVICE_CATEGORIES = ['All', 'Haircut', 'Beard', 'Hair Care', 'Face Care', 'Combo'];

const BookAppointment = () => {
  const { user } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();

  const todayStr = useMemo(() => getLocalDateString(0), []);

  const [formData, setFormData] = useState({
    barberId: '',
    serviceIds: [],
    appointmentDate: getLocalDateString(0),
    appointmentTime: '',
    notes: '',
    paymentMethod: 'cash',
    selectedStaffName: '',
    couponCode: '',
  });

  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dataWarning, setDataWarning] = useState('');

  // UI state
  const [isChangingBarber, setIsChangingBarber] = useState(false);
  const [barberSearch, setBarberSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategory, setServiceCategory] = useState('All');
  const [showAllServices, setShowAllServices] = useState(false);
  const [showCustomDateInput, setShowCustomDateInput] = useState(false);
  const [timeFilterTab, setTimeFilterTab] = useState('all'); // 'all' | 'morning' | 'afternoon' | 'evening'

  // Auto-dismiss messages
  useAutoDismiss(error, setError, 4000);
  useAutoDismiss(success, setSuccess, 4000);
  useAutoDismiss(dataWarning, setDataWarning, 4000);

  const displayedBarbers = useMemo(() => barbers.filter((barber) => isValidObjectId(barber._id)), [barbers]);
  const liveServices = useMemo(() => services.filter((service) => isValidObjectId(service._id)), [services]);

  // Upcoming 7 days for horizontal calendar strip
  const upcomingDays = useMemo(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = getLocalDateString(i);
      const dayOfWeek = dayNames[d.getDay()];
      const dateNum = d.getDate();
      const month = monthNames[d.getMonth()];

      let badge = '';
      if (i === 0) badge = 'Today';
      else if (i === 1) badge = 'Tomorrow';

      days.push({
        dateStr,
        dayOfWeek,
        dateNum,
        month,
        badge,
      });
    }
    return days;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setDataWarning('');

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const isCustomer = user?.role === 'customer';
      const savedCity = sessionStorage.getItem('userCurrentCity') || localStorage.getItem('userCurrentCity');
      const barberParams = savedCity ? { city: savedCity } : undefined;

      const [barbersResult, servicesResult, vouchersResult] = await Promise.allSettled([
        barbersAPI.getAll(barberParams),
        servicesAPI.getAll(),
        token && isCustomer ? couponsAPI.getMyVouchers() : Promise.resolve({ data: { coupons: [] } }),
      ]);

      const nextBarbers =
        barbersResult.status === 'fulfilled' ? barbersResult.value.data.barbers || [] : [];
      const nextServices =
        servicesResult.status === 'fulfilled' ? servicesResult.value.data.services || [] : [];
      const nextVouchers =
        vouchersResult.status === 'fulfilled' ? vouchersResult.value.data.coupons || [] : [];

      let finalBarbers = nextBarbers;
      if (
        isValidObjectId(state?.selectedBarberId) &&
        !nextBarbers.some((b) => b._id === state.selectedBarberId)
      ) {
        try {
          const singleBarberRes = await barbersAPI.getById(state.selectedBarberId);
          if (singleBarberRes.data?.barber) {
            finalBarbers = [singleBarberRes.data.barber, ...nextBarbers];
          }
        } catch {
          // ignore
        }
      }

      setBarbers(finalBarbers);
      setServices(nextServices);
      setVouchers(nextVouchers);

      // Pre-select barber if passed via state or take the first active barber
      const initialBarberId = isValidObjectId(state?.selectedBarberId)
        ? state.selectedBarberId
        : finalBarbers.length > 0
        ? finalBarbers[0]._id
        : '';

      setFormData((prev) => ({
        ...prev,
        barberId: prev.barberId || initialBarberId,
        serviceIds:
          isValidObjectId(state?.selectedServiceId) && prev.serviceIds.length === 0
            ? [state.selectedServiceId]
            : prev.serviceIds,
      }));

      if (servicesResult.status === 'rejected') {
        setDataWarning('Bookable services could not be loaded right now.');
      } else if (barbersResult.status === 'rejected') {
        setDataWarning('Barbers could not be loaded right now.');
      }

      setError('');
    };

    fetchData();
  }, [state?.selectedBarberId, state?.selectedServiceId]);

  // Selected Barber object
  const selectedBarber = useMemo(
    () => displayedBarbers.find((b) => b._id === formData.barberId) || displayedBarbers[0] || null,
    [displayedBarbers, formData.barberId]
  );

  // Sync barberId if it was defaulted
  useEffect(() => {
    if (!formData.barberId && selectedBarber?._id) {
      setFormData((prev) => ({ ...prev, barberId: selectedBarber._id }));
    }
  }, [selectedBarber, formData.barberId]);

  // Dynamic Document Title reflecting the selected salon
  useEffect(() => {
    if (selectedBarber?.shopName) {
      document.title = `Book at ${selectedBarber.shopName} | BarberShop`;
    } else {
      document.title = 'Book an Appointment | BarberShop';
    }
  }, [selectedBarber]);

  // STRICT BARBER FILTER: Only show services that strictly belong to the chosen barber
  const filteredServices = useMemo(() => {
    const activeBarberId = formData.barberId || selectedBarber?._id;
    if (!activeBarberId) return [];

    return liveServices.filter((service) => {
      const ownerId = service.barberId?._id || service.barberId || null;
      if (!ownerId || String(ownerId) !== String(activeBarberId)) {
        return false;
      }
      if (serviceCategory !== 'All') {
        const cat = (service.category || '').toLowerCase();
        const target = serviceCategory.toLowerCase();
        if (target === 'combo' && !cat.includes('combo')) return false;
        if (target === 'haircut' && !cat.includes('haircut')) return false;
        if (target === 'beard' && !cat.includes('beard')) return false;
        if (target === 'hair care' && !cat.includes('hair care')) return false;
        if (target === 'face care' && !cat.includes('face care')) return false;
      }
      if (serviceSearch.trim()) {
        const q = serviceSearch.toLowerCase().trim();
        const nameMatch = (service.name || '').toLowerCase().includes(q);
        const descMatch = (service.description || '').toLowerCase().includes(q);
        if (!nameMatch && !descMatch) return false;
      }
      return true;
    });
  }, [liveServices, formData.barberId, selectedBarber, serviceCategory, serviceSearch]);

  // Limit to only 6 services by default, allow expanding if barber has more than 6
  const displayedServicesList = useMemo(() => {
    if (showAllServices || serviceSearch.trim()) return filteredServices;
    return filteredServices.slice(0, 6);
  }, [filteredServices, showAllServices, serviceSearch]);

  const hasMoreThanSix = filteredServices.length > 6 && !serviceSearch.trim();

  const selectedServices = useMemo(
    () => liveServices.filter((service) => formData.serviceIds.includes(service._id)),
    [liveServices, formData.serviceIds]
  );

  const totalPrice = selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + (service.duration || 0), 0);

  const staffOptions = useMemo(() => {
    if (!selectedBarber?.staffMembers) return [];
    const raw = selectedBarber.staffMembers;
    if (Array.isArray(raw)) {
      return raw
        .flatMap((s) => (typeof s === 'string' ? s.split(/[\r?\n,]+/) : [String(s)]))
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (typeof raw === 'string') {
      return raw
        .split(/[\r?\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [selectedBarber]);

  const normalizedCouponCode = formData.couponCode.trim().toUpperCase();
  const selectedVoucher = normalizedCouponCode
    ? vouchers.find((voucher) => {
        const voucherBarberId = voucher.barberId?._id || voucher.barberId;
        return (
          voucher.code === normalizedCouponCode &&
          (!formData.barberId || String(voucherBarberId) === String(formData.barberId))
        );
      })
    : null;

  const couponDiscount = selectedVoucher && totalPrice >= Number(selectedVoucher.minSpend || 0)
    ? Math.min(
        totalPrice,
        selectedVoucher.discountType === 'flat'
          ? Number(selectedVoucher.discountValue || 0)
          : Math.round((totalPrice * Number(selectedVoucher.discountValue || 0)) / 100)
      )
    : 0;

  const payableAmount = Math.max(0, totalPrice - couponDiscount);

  // Check if slot is disabled (passed time today or outside hours)
  const isSlotDisabled = (slotTime) => {
    if (formData.appointmentDate === todayStr) {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      if (slotTime <= currentTimeStr) {
        return true;
      }
    }

    if (selectedBarber) {
      const workingStart = selectedBarber.openingTime || '09:00';
      const workingEnd = selectedBarber.closingTime || '21:00';
      if (slotTime < workingStart || slotTime >= workingEnd) {
        return true;
      }
    }

    return false;
  };

  // Filter slots for the segmented tabs
  const activeSlots = useMemo(() => {
    if (timeFilterTab === 'all') return ALL_SLOTS;
    const group = TIME_SLOT_GROUPS.find((g) => g.id === timeFilterTab);
    return group ? group.slots : ALL_SLOTS;
  }, [timeFilterTab]);

  const handleBarberSwitch = (newBarberId) => {
    setFormData((prev) => ({
      ...prev,
      barberId: newBarberId,
      serviceIds: [], // reset services so no foreign services are kept
      selectedStaffName: '',
      appointmentTime: '',
    }));
    setIsChangingBarber(false);
    setShowAllServices(false);
    setServiceSearch('');
    setError('');
  };

  const handleStaffSelect = (staffName) => {
    setFormData((prev) => ({
      ...prev,
      selectedStaffName: staffName,
    }));
    trackEvent('select_barber_staff', {
      barber_id: formData.barberId,
      staff_name: staffName || 'Any Specialist',
    });
    setError('');
  };

  const handleDateSelect = (dateStr) => {
    if (dateStr < todayStr) {
      setError('Appointment date cannot be in the past (yesterday or earlier).');
      return;
    }
    setFormData((prev) => {
      const next = { ...prev, appointmentDate: dateStr };
      if (dateStr === todayStr && prev.appointmentTime) {
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${currentHours}:${currentMinutes}`;
        if (prev.appointmentTime <= currentTimeStr) {
          next.appointmentTime = '';
        }
      }
      return next;
    });
    setError('');
  };

  const handleTimeSelect = (slot) => {
    if (isSlotDisabled(slot)) {
      if (formData.appointmentDate === todayStr) {
        setError('This time slot has already passed for today. Please choose an upcoming time.');
      } else {
        setError('This time slot is outside shop operating hours.');
      }
      return;
    }
    setFormData((prev) => ({ ...prev, appointmentTime: slot }));
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'appointmentDate') {
      handleDateSelect(value);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  // Smooth scroll to a step section
  const scrollToStep = (stepId) => {
    const el = document.getElementById(stepId);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const activeBarberId = formData.barberId || selectedBarber?._id;
    if (!activeBarberId) {
      setError('Please select a barber or shop to proceed.');
      scrollToStep('step-1');
      return;
    }

    if (formData.serviceIds.length === 0) {
      setError('Please select at least one service from this barber.');
      scrollToStep('step-2');
      return;
    }

    if (!formData.appointmentDate) {
      setError('Please choose an appointment date.');
      scrollToStep('step-3');
      return;
    }

    if (formData.appointmentDate < todayStr) {
      setError('Appointment date cannot be in the past (yesterday or earlier).');
      scrollToStep('step-3');
      return;
    }

    if (!formData.appointmentTime) {
      setError('Please select an available time slot.');
      scrollToStep('step-3');
      return;
    }

    if (isSlotDisabled(formData.appointmentTime)) {
      setError('Selected time slot has already passed for today. Please pick an upcoming time.');
      scrollToStep('step-3');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        barberId: activeBarberId,
        selectedStaffName: formData.selectedStaffName || undefined,
      };

      const response = await appointmentsAPI.create(payload);
      const created = response.data?.appointment;

      // Track booking in Google Analytics & Google Activity
      trackBookingConfirmed({
        id: created?._id,
        price: payableAmount,
        serviceName: selectedServices.map((s) => s.name).join(', ') || 'Barber Grooming',
      });

      if (formData.paymentMethod === 'online' && created?._id) {
        navigate(`/payment?appointmentId=${created._id}`);
        return;
      }

      playNotificationSound();
      flash(setSuccess, 'Your appointment has been successfully booked!');
      setFormData({
        barberId: activeBarberId,
        serviceIds: [],
        appointmentDate: todayStr,
        appointmentTime: '',
        notes: '',
        paymentMethod: 'cash',
        selectedStaffName: '',
        couponCode: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // Filter barbers by search query for the Switch Salon drawer
  const filteredBarberList = useMemo(() => {
    if (!barberSearch.trim()) return displayedBarbers;
    const q = barberSearch.toLowerCase();
    return displayedBarbers.filter(
      (b) =>
        (b.shopName && b.shopName.toLowerCase().includes(q)) ||
        (b.userId?.name && b.userId.name.toLowerCase().includes(q)) ||
        (b.city && b.city.toLowerCase().includes(q))
    );
  }, [displayedBarbers, barberSearch]);

  // Progress metrics
  const isStep1Done = true; // Stylist defaults to 'Any Available Specialist' or specific staff
  const isStep2Done = formData.serviceIds.length > 0;
  const isStep3Done = Boolean(formData.appointmentDate && formData.appointmentTime);
  const isStep4Done = Boolean(formData.paymentMethod);

  const completedCount = [isStep1Done, isStep2Done, isStep3Done, isStep4Done].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 4) * 100);

  if (!loading && barbers.length === 0 && services.length === 0) {
    return <BarberShopLoader />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-400 selection:text-slate-950">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-orange-600/10 blur-[150px]" />
        <div className="absolute -bottom-20 left-1/3 h-96 w-96 rounded-full bg-amber-600/10 blur-[140px]" />
      </div>

      {/* Main Full-Width Container */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10 2xl:px-16 py-6 pb-28 lg:pb-12">
        
        {/* Top Breadcrumb & Page Title */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
              <span>Home</span>
              <span>/</span>
              <span>Appointments</span>
              <span>/</span>
              <span className="text-amber-400">Book Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Reserve Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">Grooming Session</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Select your personal specialist, tailor your services, and lock in your priority chair with zero waiting time.
            </p>
          </div>

          {/* Progress Tracker Widget */}
          <div className="shrink-0 bg-slate-900/80 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md flex items-center gap-4 min-w-[240px]">
            <div className="flex-1">
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-slate-300">Booking Progress</span>
                <span className="text-amber-400">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20 font-black text-xs">
              {completedCount}/4
            </div>
          </div>
        </div>

        {/* Selected Salon Banner & Switcher */}
        {selectedBarber && (
          <div className="mb-6 rounded-3xl border border-amber-400/30 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950 p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40">
                <Store className="h-7 w-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                    Selected Salon
                  </span>
                  <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {selectedBarber.rating || '4.9'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {selectedBarber.shopName || selectedBarber.userId?.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    Stylist: <strong className="text-slate-200">{selectedBarber.userId?.name || 'Owner'}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    {selectedBarber.city || 'Local Salon'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    Open: {selectedBarber.openingTime || '09:00'} - {selectedBarber.closingTime || '21:00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Switch Salon Button */}
            <button
              type="button"
              onClick={() => setIsChangingBarber((prev) => !prev)}
              className="shrink-0 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 hover:border-amber-400/40 transition-all shadow-md active:scale-95"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
              {isChangingBarber ? 'Keep Selected Salon' : 'Change Salon'}
            </button>
          </div>
        )}

        {/* Change Salon Drawer */}
        {isChangingBarber && (
          <div className="mb-6 rounded-3xl border border-amber-400/30 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl animate-riseIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Choose Different Partner Salon</h3>
                <p className="text-xs text-slate-400">Select any partner salon from the list below:</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={barberSearch}
                  onChange={(e) => setBarberSearch(e.target.value)}
                  placeholder="Search shop or city..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
              {filteredBarberList.map((barber) => {
                const isCurrent = (formData.barberId || selectedBarber?._id) === barber._id;
                return (
                  <div
                    key={barber._id}
                    onClick={() => handleBarberSwitch(barber._id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-500/20 text-white ring-2 ring-amber-400/40'
                        : 'border-white/10 bg-slate-950/50 text-slate-300 hover:border-white/25 hover:bg-slate-900'
                    }`}
                  >
                    <p className="font-bold text-sm text-white line-clamp-1">{barber.shopName || barber.userId?.name}</p>
                    <p className="text-xs text-slate-400">{barber.userId?.name} • {barber.city || 'Nearby'}</p>
                    {isCurrent && (
                      <span className="mt-2 inline-block text-[10px] font-bold text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-md">
                        Currently Selected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Notifications */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 backdrop-blur-md shadow-lg shadow-red-950/20">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200 backdrop-blur-md shadow-lg shadow-emerald-950/20">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {dataWarning && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200 backdrop-blur-md shadow-lg shadow-amber-950/20">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
            <span className="font-medium">{dataWarning}</span>
          </div>
        )}

        {/* Interactive Step Navigation Bar (Sticky Anchor Pills) */}
        <div className="sticky top-2 z-30 mb-6 bg-slate-900/90 border border-white/10 rounded-2xl p-2 backdrop-blur-xl shadow-xl flex items-center gap-2 overflow-x-auto scrollbar-none">
          {/* Step 1 Pill */}
          <button
            type="button"
            onClick={() => scrollToStep('step-1')}
            className="shrink-0 flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
              1
            </span>
            <span>Stylist</span>
            <span className="text-[11px] text-amber-400 hidden sm:inline">
              ({formData.selectedStaffName || 'Any'})
            </span>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          </button>

          <span className="text-slate-600">→</span>

          {/* Step 2 Pill */}
          <button
            type="button"
            onClick={() => scrollToStep('step-2')}
            className={`shrink-0 flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isStep2Done
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
              isStep2Done ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700 text-white'
            }`}>
              2
            </span>
            <span>Services</span>
            {isStep2Done ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-300">
                ({formData.serviceIds.length}) <Check className="h-3.5 w-3.5" />
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">(0)</span>
            )}
          </button>

          <span className="text-slate-600">→</span>

          {/* Step 3 Pill */}
          <button
            type="button"
            onClick={() => scrollToStep('step-3')}
            className={`shrink-0 flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isStep3Done
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
              isStep3Done ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700 text-white'
            }`}>
              3
            </span>
            <span>Date & Time</span>
            {isStep3Done ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-300">
                ({formatTime12h(formData.appointmentTime)}) <Check className="h-3.5 w-3.5" />
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">(Pending)</span>
            )}
          </button>

          <span className="text-slate-600">→</span>

          {/* Step 4 Pill */}
          <button
            type="button"
            onClick={() => scrollToStep('step-4')}
            className={`shrink-0 flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isStep4Done
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-white text-[10px] font-black">
              4
            </span>
            <span>Payment & Notes</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              ({formData.paymentMethod === 'cash' ? 'Cash' : 'Online'})
            </span>
          </button>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: 8 Columns on Desktop */}
          <div className="lg:col-span-8 space-y-8">

            {/* ======================================================== */}
            {/* STEP 1: SELECT STYLIST / SPECIALIST (SINGLE SELECT)      */}
            {/* ======================================================== */}
            <section
              id="step-1"
              className="scroll-mt-24 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-400/20">
                      1
                    </span>
                    <h3 className="text-xl font-bold text-white">Select Stylist / Specialist</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose your dedicated barber chair or pick Any Specialist for quickest service.
                  </p>
                </div>

                <span className="self-start sm:self-auto text-xs font-bold px-3 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                  {formData.selectedStaffName ? formData.selectedStaffName : 'Any Available Specialist'}
                </span>
              </div>

              {/* Single Select Staff Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* Option 0: Any Available Specialist */}
                <div
                  onClick={() => handleStaffSelect('')}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                    formData.selectedStaffName === ''
                      ? 'border-amber-400 bg-gradient-to-b from-amber-500/20 to-amber-950/30 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/10'
                      : 'border-white/10 bg-slate-950/50 hover:border-amber-400/40 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-transform group-hover:scale-105 ${
                        formData.selectedStaffName === ''
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                          : 'bg-slate-800 text-amber-300 border border-white/10'
                      }`}>
                        ✨
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                          Any Specialist
                        </p>
                        <p className="text-xs text-slate-400">
                          Fastest priority slot
                        </p>
                      </div>
                    </div>

                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      formData.selectedStaffName === ''
                        ? 'border-amber-400 bg-amber-400 text-slate-950'
                        : 'border-white/30 bg-transparent'
                    }`}>
                      {formData.selectedStaffName === '' && <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Fast-Track Entry
                    </span>
                    <span className="text-amber-300 font-semibold">Recommended</span>
                  </div>
                </div>

                {/* Staff Member Cards */}
                {staffOptions.map((staffName) => {
                  const isSelected = formData.selectedStaffName === staffName;
                  const initials = staffName
                    .replace(/\(.*?\)/g, '')
                    .trim()
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || 'ST';

                  return (
                    <div
                      key={staffName}
                      onClick={() => handleStaffSelect(staffName)}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-amber-400 bg-gradient-to-b from-amber-500/20 to-amber-950/30 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/10'
                          : 'border-white/10 bg-slate-950/50 hover:border-amber-400/40 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-105 ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                              : 'bg-slate-800 text-amber-300 border border-white/10'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                              {staffName}
                            </p>
                            <p className="text-xs text-slate-400">
                              Certified Stylist
                            </p>
                          </div>
                        </div>

                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400 text-slate-950'
                            : 'border-white/30 bg-transparent'
                        }`}>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                          Available Today
                        </span>
                        <span className="text-slate-400">Personal Chair</span>
                      </div>
                    </div>
                  );
                })}

                {/* If salon has no extra staff list, render Master Stylist card */}
                {staffOptions.length === 0 && (
                  <div
                    onClick={() => handleStaffSelect(selectedBarber?.userId?.name || 'Master Barber')}
                    className="group relative flex flex-col justify-between rounded-2xl border border-amber-400 bg-gradient-to-b from-amber-500/20 to-amber-950/30 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/10 p-4 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-sm bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30">
                          👑
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">
                            {selectedBarber?.userId?.name || selectedBarber?.shopName}
                          </p>
                          <p className="text-xs text-slate-400">
                            Owner & Master Stylist
                          </p>
                        </div>
                      </div>

                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-400 bg-amber-400 text-slate-950">
                        <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="text-amber-300 font-semibold">Master Specialist</span>
                      <span className="text-emerald-400 font-medium">Selected</span>
                    </div>
                  </div>
                )}
              </div>
            </section>


            {/* ======================================================== */}
            {/* STEP 2: SELECT SERVICES & PACKAGES (CURATED 6 BY DEFAULT)*/}
            {/* ======================================================== */}
            <section
              id="step-2"
              className="scroll-mt-24 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-400/20">
                      2
                    </span>
                    <h3 className="text-xl font-bold text-white">Select Services & Packages</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Authentic salon services offered by {selectedBarber?.shopName || 'this salon'}.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 shadow-sm ${
                    formData.serviceIds.length > 0
                      ? 'bg-amber-400/15 border-amber-400/30 text-amber-300'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    <Scissors className="h-3.5 w-3.5" />
                    {formData.serviceIds.length} service(s) selected
                  </span>
                </div>
              </div>

              {/* Filter Controls: Categories & Search Bar */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between mb-5">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setServiceCategory(cat);
                        setShowAllServices(false);
                      }}
                      className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                        serviceCategory === cat
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Instant Search Bar */}
                <div className="relative w-full md:w-56">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Search services..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  {serviceSearch && (
                    <button
                      type="button"
                      onClick={() => setServiceSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Services Grid */}
              {filteredServices.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-8 text-center text-slate-400">
                  <p className="text-sm font-medium">No services found matching your criteria.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceCategory('All');
                      setServiceSearch('');
                      setShowAllServices(false);
                    }}
                    className="mt-3 text-xs text-amber-300 underline font-bold inline-flex items-center gap-1"
                  >
                    View All Services
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayedServicesList.map((service) => {
                      const isChecked = formData.serviceIds.includes(service._id);

                      return (
                        <div
                          key={service._id}
                          onClick={() => handleServiceToggle(service._id)}
                          className={`group relative flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                            isChecked
                              ? 'border-amber-400/90 bg-gradient-to-br from-amber-500/20 via-amber-950/25 to-slate-950 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/10 text-white'
                              : 'border-white/10 bg-slate-950/60 hover:border-amber-400/40 hover:bg-slate-900/90 text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="inline-block rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 uppercase tracking-wider mb-1">
                                  {service.category || 'Grooming'}
                                </span>
                                <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                                  {service.name}
                                </h4>
                              </div>

                              <button
                                type="button"
                                className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-xl transition-all ${
                                  isChecked
                                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                                    : 'border border-white/20 bg-white/5 text-slate-400 group-hover:border-amber-400 group-hover:text-amber-300'
                                }`}
                              >
                                {isChecked ? <CheckCircle2 className="h-4 w-4 stroke-[3]" /> : <span className="text-lg font-bold leading-none">+</span>}
                              </button>
                            </div>

                            {service.description && (
                              <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                {service.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                              <Clock className="h-3.5 w-3.5 text-amber-400/80" />
                              {service.duration} mins
                            </span>

                            <div className="flex items-center gap-2">
                              <span className="text-base font-black text-amber-300">
                                {formatCurrency(service.price)}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isChecked
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-white/5 text-slate-400'
                              }`}>
                                {isChecked ? 'Added' : 'Select'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show More / Show Less Button if barber has more than 6 services */}
                  {hasMoreThanSix && (
                    <div className="mt-6 text-center">
                      <button
                        type="button"
                        onClick={() => setShowAllServices((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-6 py-3 text-xs font-bold text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/70 transition-all shadow-md active:scale-95"
                      >
                        {showAllServices ? (
                          <>
                            <span>Show Less (Display 6 Services)</span>
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <span>View All ({filteredServices.length}) Services (+{filteredServices.length - 6} more)</span>
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>


            {/* ======================================================== */}
            {/* STEP 3: DATE & TIME SELECTION (COMPACT TABBED UX)        */}
            {/* ======================================================== */}
            <section
              id="step-3"
              className="scroll-mt-24 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-400/20">
                      3
                    </span>
                    <h3 className="text-xl font-bold text-white">Choose Date & Available Time Slot</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Past dates are strictly locked. Real-time availability refreshed dynamically.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  {formData.appointmentTime && (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center gap-1.5 shadow-sm">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      {formatTime12h(formData.appointmentTime)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCustomDateInput((prev) => !prev)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 rounded-xl"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {showCustomDateInput ? 'Quick 7 Days' : 'Pick Date'}
                  </button>
                </div>
              </div>

              {/* Date Selector Row */}
              {!showCustomDateInput ? (
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 mb-6">
                  {upcomingDays.map((item) => {
                    const isSelected = formData.appointmentDate === item.dateStr;
                    return (
                      <button
                        key={item.dateStr}
                        type="button"
                        onClick={() => handleDateSelect(item.dateStr)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                          isSelected
                            ? 'border-amber-400 bg-gradient-to-b from-amber-500/30 to-amber-950/40 text-white ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10'
                            : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-amber-400/40 hover:bg-slate-900'
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                          {item.badge || item.dayOfWeek}
                        </span>
                        <span className="text-xl font-black my-0.5 text-white">
                          {item.dateNum}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {item.month}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mb-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="date"
                      name="appointmentDate"
                      min={todayStr}
                      value={formData.appointmentDate}
                      onChange={handleFormChange}
                      className="theme-input flex-1"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleDateSelect(todayStr)}
                      className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all w-full sm:w-auto"
                    >
                      Reset to Today
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    * Past dates (yesterday or earlier) are completely restricted.
                  </p>
                </div>
              )}

              {/* Segmented Time Slot Period Switcher (Streamlined UX) */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">Available Time Slots</span>
                    <span className="text-xs text-slate-500">
                      ({formData.appointmentDate === todayStr ? 'Today' : formData.appointmentDate})
                    </span>
                  </div>

                  {/* Period Filter Tabs */}
                  <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setTimeFilterTab('all')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        timeFilterTab === 'all'
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Slots
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeFilterTab('morning')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        timeFilterTab === 'morning'
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🌅 Morning
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeFilterTab('afternoon')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        timeFilterTab === 'afternoon'
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ☀️ Afternoon
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeFilterTab('evening')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        timeFilterTab === 'evening'
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🌙 Evening
                    </button>
                  </div>
                </div>

                {/* Compact Grid of Time Slots */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {activeSlots.map((slot) => {
                    const isSelected = formData.appointmentTime === slot;
                    const disabled = isSlotDisabled(slot);

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleTimeSelect(slot)}
                        className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/25 ring-2 ring-amber-300'
                            : disabled
                            ? 'border border-white/5 bg-white/[0.02] text-slate-600 line-through cursor-not-allowed opacity-40'
                            : 'border border-white/10 bg-slate-900/80 text-slate-200 hover:border-amber-400/50 hover:bg-slate-800'
                        }`}
                      >
                        <span>{formatTime12h(slot)}</span>
                        {disabled && formData.appointmentDate === todayStr && (
                          <span className="text-[8px] no-underline font-normal text-slate-500 mt-0.5">Passed</span>
                        )}
                        {isSelected && (
                          <span className="text-[9px] font-black text-slate-900 flex items-center gap-0.5 mt-0.5">
                            <Check className="h-2.5 w-2.5 stroke-[3]" /> Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>


            {/* ======================================================== */}
            {/* STEP 4: PAYMENT METHOD & PREFERENCES                    */}
            {/* ======================================================== */}
            <section
              id="step-4"
              className="scroll-mt-24 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-400/20">
                      4
                    </span>
                    <h3 className="text-xl font-bold text-white">Payment Method & Preferences</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Select how you wish to pay and leave custom styling requests.
                  </p>
                </div>

                <span className="self-start sm:self-auto text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {formData.paymentMethod === 'cash' ? 'Pay at Salon (Cash)' : 'Instant Online Pay'}
                </span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Choose Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'cash' }))}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                      formData.paymentMethod === 'cash'
                        ? 'border-emerald-400 bg-emerald-500/15 text-white ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-950/20'
                        : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-white/20 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Banknote className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-white">Pay at Salon (Cash)</p>
                        {formData.paymentMethod === 'cash' && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Pay after your grooming session</p>
                      <span className="inline-block mt-2 text-[10px] font-bold text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded">
                        Zero Advance Required
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'online' }))}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                      formData.paymentMethod === 'online'
                        ? 'border-sky-400 bg-sky-500/15 text-white ring-2 ring-sky-400/40 shadow-lg shadow-sky-950/20'
                        : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-white/20 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-white">Instant Online Pay</p>
                        {formData.paymentMethod === 'online' && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-400 text-slate-950">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">UPI, QR Code, Cards & Net Banking</p>
                      <span className="inline-block mt-2 text-[10px] font-bold text-sky-300 bg-sky-400/10 px-2 py-0.5 rounded">
                        Contactless & Instant
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Coupon Code Input Group */}
              <div>
                <label htmlFor="couponCode" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-amber-400" />
                  Have a Discount Coupon Code?
                </label>
                <div className="flex gap-2">
                  <input
                    id="couponCode"
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={handleFormChange}
                    className="flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 uppercase tracking-wider font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Enter coupon code (e.g. SAVE20)"
                  />
                  {formData.couponCode && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, couponCode: '' }))}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {normalizedCouponCode && selectedVoucher && (
                  <p className="mt-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Coupon "{selectedVoucher.code}" applied! You saved {formatCurrency(couponDiscount)}.
                  </p>
                )}
                {normalizedCouponCode && !selectedVoucher && (
                  <p className="mt-2 text-xs text-amber-400/90 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Coupon code will be validated upon confirmation.
                  </p>
                )}
              </div>

              {/* Special Notes */}
              <div>
                <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Special Notes / Styling Preferences (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  placeholder="e.g. Skin sensitive to razors, preferred trimmer length, organic wax request, etc."
                ></textarea>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Sticky Luxury Booking Receipt / Pass (4 Columns on Desktop) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950 p-6 shadow-2xl backdrop-blur-2xl">
              
              {/* Receipt Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <h3 className="text-base font-extrabold text-white">Digital Booking Pass</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Priority Salon Reservation</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300 border border-amber-400/20 shadow-md">
                  <Scissors className="h-5 w-5" />
                </div>
              </div>

              {/* Assigned Salon Details */}
              {selectedBarber && (
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3.5 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Salon Location</p>
                      <h4 className="font-extrabold text-sm text-white mt-0.5">{selectedBarber.shopName || selectedBarber.userId?.name}</h4>
                    </div>
                    <span className="text-[11px] text-amber-300 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      ★ {selectedBarber.rating || '4.9'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1.5">
                    <MapPin className="h-3 w-3 text-slate-500" />
                    {selectedBarber.city || 'Local Salon'}
                  </p>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-2 border-t border-white/5 pt-2">
                    <User className="h-3.5 w-3.5 text-amber-400" />
                    Stylist: <span className="font-bold text-white">{formData.selectedStaffName || 'Any Available Specialist'}</span>
                  </p>
                </div>
              )}

              {/* Schedule Info */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-amber-400" /> Date
                  </p>
                  <p className="font-bold text-xs text-white mt-1">{formData.appointmentDate || 'Not set'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-400" /> Time Slot
                  </p>
                  <p className="font-bold text-xs text-amber-300 mt-1">
                    {formData.appointmentTime ? formatTime12h(formData.appointmentTime) : 'Select slot'}
                  </p>
                </div>
              </div>

              {/* Selected Services Itemized List */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-bold">Services ({selectedServices.length})</span>
                  <span className="text-amber-400 font-semibold">{totalDuration} mins</span>
                </div>

                {selectedServices.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-4 text-center">
                    <p className="text-xs text-slate-400 italic">No services selected yet</p>
                    <button
                      type="button"
                      onClick={() => scrollToStep('step-2')}
                      className="mt-2 text-xs font-bold text-amber-400 hover:underline"
                    >
                      + Browse Services
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedServices.map((s) => (
                      <div
                        key={s._id}
                        className="flex items-center justify-between rounded-xl bg-slate-950/70 px-3 py-2 border border-white/5 text-xs"
                      >
                        <div className="flex-1 pr-2">
                          <p className="font-semibold text-white truncate">{s.name}</p>
                          <p className="text-[10px] text-slate-400">{s.duration} mins</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-black text-amber-300">{formatCurrency(s.price)}</span>
                          <button
                            type="button"
                            onClick={() => handleServiceToggle(s._id)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                            title="Remove service"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-white/10 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline border-t border-white/10 pt-3">
                  <div>
                    <span className="text-sm font-extrabold text-white block">Payable Amount</span>
                    <span className="text-[10px] text-slate-400">
                      {formData.paymentMethod === 'cash' ? 'Pay in Cash at salon' : 'Instant Online Pay'}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-amber-300">{formatCurrency(payableAmount)}</span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || formData.serviceIds.length === 0 || !formData.appointmentTime}
                className={`mt-5 w-full rounded-2xl py-4 text-center font-black text-sm tracking-wide transition-all shadow-xl ${
                  loading || formData.serviceIds.length === 0 || !formData.appointmentTime
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    : 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 hover:brightness-110 shadow-amber-500/20 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
                    Reserving Chair...
                  </span>
                ) : formData.serviceIds.length === 0 ? (
                  'Add At Least 1 Service'
                ) : !formData.appointmentTime ? (
                  'Select Date & Time Slot'
                ) : formData.paymentMethod === 'online' ? (
                  `Pay ${formatCurrency(payableAmount)} Online Now`
                ) : (
                  `Confirm Booking (${formatCurrency(payableAmount)})`
                )}
              </button>

              {/* Trust Badges */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-around text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Free Reschedule
                </span>
                <span className="flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5 text-amber-400" />
                  Zero Hidden Charges
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Mobile Summary Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-amber-400/30 p-3.5 backdrop-blur-2xl shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Payable</span>
            <span className="text-lg font-black text-amber-300">{formatCurrency(payableAmount)}</span>
            <span className="text-[11px] text-slate-400 ml-1.5">({formData.serviceIds.length} serv)</span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || formData.serviceIds.length === 0 || !formData.appointmentTime}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-lg ${
              loading || formData.serviceIds.length === 0 || !formData.appointmentTime
                ? 'bg-slate-800 text-slate-400'
                : 'bg-amber-400 text-slate-950 font-black'
            }`}
          >
            {formData.serviceIds.length === 0
              ? 'Select Service'
              : !formData.appointmentTime
              ? 'Pick Time'
              : 'Book Now'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookAppointment;
