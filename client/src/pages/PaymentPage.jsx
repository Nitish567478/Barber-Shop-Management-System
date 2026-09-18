import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Clock,
  Calendar,
  User,
  Scissors,
  ArrowLeft,
  Lock,
  Download,
  Printer,
  ChevronRight,
  Sparkles,
  Zap,
  Copy,
  Check,
  Landmark,
  ExternalLink,
} from 'lucide-react';
import { appointmentsAPI, paymentsAPI } from '../services/api';
import BarberShopLoader from '../components/BarberShopLoader';
import { printReceipt } from '../utils/printReceipt';
import { playNotificationSound } from '../utils/notificationSound';
import useAutoDismiss from '../hooks/useAutoDismiss';

const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

// Dynamically load Razorpay standard checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentPage = () => {
  const { appointmentId: paramAppointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentIdFromUrl = paramAppointmentId || searchParams.get('appointmentId');

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Auto-dismiss error messages after 4 seconds
  useAutoDismiss(error, setError, 4000);

  // Active Payment Method Tab: 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet'
  const [activeTab, setActiveTab] = useState('razorpay');

  // Countdown timer for realistic payment window (10 minutes)
  const [timeLeft, setTimeLeft] = useState(600);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // UPI Form State
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('hdfc');

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  // 3D Secure / OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');
  const [otpTimer, setOtpTimer] = useState(45);

  // Pending appointments list (if user landed on /payment without appointmentId)
  const [pendingAppointments, setPendingAppointments] = useState([]);

  // Copy-to-clipboard state
  const [copiedField, setCopiedField] = useState('');

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 4000);
  };

  // Pre-load Razorpay checkout script on mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Play celebratory chime when payment succeeds
  useEffect(() => {
    if (paymentSuccess) {
      playNotificationSound();
    }
  }, [paymentSuccess]);

  // Countdown effect
  useEffect(() => {
    if (timeLeft <= 0 || paymentSuccess) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, paymentSuccess]);

  // Load appointment details
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError('');

        if (appointmentIdFromUrl) {
          const res = await paymentsAPI.getPaymentDetails(appointmentIdFromUrl);
          if (res.data.appointment) {
            setAppointment(res.data.appointment);
            if (res.data.appointment.paymentStatus === 'completed') {
              setPaymentSuccess({
                transactionId: res.data.appointment.transactionId || 'TXN_COMPLETED',
                appointment: res.data.appointment,
                invoice: res.data.invoice,
              });
            }
          }
        } else {
          // If no ID passed, check customer's unpaid appointments
          const apptRes = await appointmentsAPI.getUserAppointments();
          const list = apptRes.data.appointments || [];
          const unpaid = list.filter((a) => a.status === 'scheduled' && a.paymentStatus !== 'completed');
          setPendingAppointments(unpaid);
          if (unpaid.length > 0) {
            setAppointment(unpaid[0]);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load checkout details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentIdFromUrl]);

  // Format countdown mm:ss
  const formattedTimeLeft = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Detect card brand based on card number
  const cardBrand = useMemo(() => {
    const clean = cardNumber.replace(/\s+/g, '');
    if (/^4/.test(clean)) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (/^6(0|5)/.test(clean) || /^35/.test(clean)) return 'RuPay';
    return 'Card';
  }, [cardNumber]);

  // Handle card number formatting
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Handle card expiry formatting
  const handleCardExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length > 2) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  // ----------------------------------------------------
  // RAZORPAY CHECKOUT HANDLER
  // ----------------------------------------------------
  const handleRazorpayCheckout = async () => {
    if (!appointment) return;
    try {
      setProcessing(true);
      setError('');

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setError('Failed to load Razorpay payment gateway SDK. Please check your internet connection.');
        setProcessing(false);
        return;
      }

      // 1. Create order on server
      const orderRes = await paymentsAPI.createRazorpayOrder({
        appointmentId: appointment._id,
      });

      const { order, keyId, appointment: apptData } = orderRes.data;

      // 2. Launch Razorpay Standard Checkout modal
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: apptData.shopName || 'Barber Grooming Studio',
        description: `Booking for ${appointment.appointmentTime} - Barber Shop`,
        image: 'https://i.ibb.co/0yYptF9d/website-logo.png',
        order_id: order.id,
        handler: async function (response) {
          try {
            setProcessing(true);
            const verifyRes = await paymentsAPI.verifyRazorpayPayment({
              appointmentId: appointment._id,
              razorpay_order_id: response.razorpay_order_id || order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || 'simulated_signature',
            });

            if (verifyRes.data.success) {
              setPaymentSuccess(verifyRes.data);
            }
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.message || 'Payment verification failed');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: apptData.customerName || 'Customer',
          email: apptData.customerEmail || 'customer@example.com',
          contact: apptData.customerPhone || '+918102438366',
        },
        notes: {
          appointmentId: String(appointment._id),
          service: 'Barber Services',
          barberUpi: appointment?.barberId?.payoutDetails?.upiId || 'barbershop@upi',
          barberAccount: appointment?.barberId?.payoutDetails?.accountNumber || '',
        },
        theme: {
          color: '#f59e0b',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setError(response.error?.description || 'Razorpay payment was declined or cancelled.');
        setProcessing(false);
      });

      razorpayInstance.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize Razorpay checkout');
      setProcessing(false);
    }
  };

  // Quick Test Simulation for Razorpay
  const handleRazorpayTestPay = async () => {
    if (!appointment) return;
    try {
      setProcessing(true);
      setError('');

      const orderRes = await paymentsAPI.createRazorpayOrder({
        appointmentId: appointment._id,
      });

      const orderId = orderRes.data.order?.id || `order_${Date.now()}`;
      const fakePaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const verifyRes = await paymentsAPI.verifyRazorpayPayment({
        appointmentId: appointment._id,
        razorpay_order_id: orderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: 'test_signature_valid',
      });

      if (verifyRes.data.success) {
        setPaymentSuccess(verifyRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete Razorpay test payment');
    } finally {
      setProcessing(false);
    }
  };

  // General payment execution for UPI, Card, Net Banking, Wallets
  const executePayment = async (mode, details = {}) => {
    if (!appointment) return;
    try {
      setProcessing(true);
      setError('');

      const payload = {
        appointmentId: appointment._id,
        paymentMethod: mode,
        paymentDetails: details,
      };

      const response = await paymentsAPI.processPayment(payload);

      if (response.data.success) {
        setPaymentSuccess({
          transactionId: response.data.transactionId,
          appointment: response.data.appointment,
          invoice: response.data.invoice,
          payment: response.data.payment,
          paymentMethod: mode,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
      setShowOtpModal(false);
    }
  };

  // Card form submit (triggers OTP modal)
  const handleCardSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s+/g, '').length < 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      setError('Please enter expiry in MM/YY format.');
      return;
    }
    if (!cardCvv || cardCvv.length < 3) {
      setError('Please enter a valid 3-digit CVV.');
      return;
    }
    setError('');
    setShowOtpModal(true);
    setOtpTimer(45);
  };

  // UPI submit
  const handleUpiSubmit = (e) => {
    e.preventDefault();
    if (selectedUpiApp === 'custom' && !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank)');
      return;
    }
    const upiTarget = selectedUpiApp === 'custom' ? upiId : `${selectedUpiApp}.app@upi`;
    executePayment('upi', { upiId: upiTarget, app: selectedUpiApp });
  };

  // Net banking submit
  const handleNetBankingSubmit = (e) => {
    e.preventDefault();
    executePayment('netbanking', { bank: selectedBank });
  };

  // Wallets submit
  const handleWalletSubmit = (e) => {
    e.preventDefault();
    executePayment('wallet', { wallet: selectedWallet });
  };

  // ----------------------------------------------------
  // ROBUST PRINT RECEIPT HANDLER (With Logo & Watermark)
  // ----------------------------------------------------
  const handlePrintReceipt = () => {
    const activeAppointment = paymentSuccess?.appointment || appointment;
    const shopName =
      activeAppointment?.barberId?.shopName ||
      activeAppointment?.barberId?.userId?.name ||
      'Modern Barber Studio';

    const barberPayout = activeAppointment?.barberId?.payoutDetails;
    const isBarberPayoutActive =
      barberPayout?.isPaymentActive !== false &&
      Boolean(barberPayout?.upiId && barberPayout.upiId.trim());

    const receivingAccountInfo = isBarberPayoutActive
      ? `UPI: ${barberPayout.upiId.trim()}${
          barberPayout?.bankName
            ? ` | ${barberPayout.bankName} (A/C: ••••${barberPayout.accountNumber?.slice(-4) || 'XXXX'})`
            : ''
        }`
      : 'Platform Merchant (barbershop@upi)';

    const serviceList = (activeAppointment?.serviceIds || [activeAppointment?.serviceId]).filter(Boolean);
    const paidAmount = activeAppointment?.price || 0;
    const originalPrice = activeAppointment?.originalPrice || activeAppointment?.price || 0;
    const discountAmount = activeAppointment?.discountAmount || 0;
    const txnId = paymentSuccess?.transactionId || activeAppointment?.transactionId || 'TXN_OFFICIAL';

    printReceipt({
      shopName,
      shopAddress: activeAppointment?.barberId?.address || 'Ranchi HQ, Main Road, Jharkhand',
      shopPhone: activeAppointment?.barberId?.phone || activeAppointment?.barberId?.userId?.phone || '+91 9934630687',
      barberName: activeAppointment?.barberId?.userId?.name || '',
      customerName: activeAppointment?.customerId?.name || activeAppointment?.userId?.name || 'Valued Customer',
      customerPhone: activeAppointment?.customerId?.phone || '',
      customerEmail: activeAppointment?.customerId?.email || '',
      appointmentDate: activeAppointment?.appointmentDate,
      appointmentTime: activeAppointment?.appointmentTime,
      services: serviceList,
      originalPrice,
      discountAmount,
      totalPaid: paidAmount,
      transactionId: txnId,
      paymentMethod: paymentSuccess?.paymentMethod || 'Razorpay / Online Verified',
      invoiceNumber: paymentSuccess?.invoice?.invoiceNumber || '',
      receivingAccountInfo,
    });
  };

  // Direct Text / Markdown Download Receipt
  const handleDownloadReceipt = () => {
    const activeAppointment = paymentSuccess?.appointment || appointment;
    const shopName = activeAppointment?.barberId?.shopName || 'Barber Grooming Studio';
    const barberPayout = activeAppointment?.barberId?.payoutDetails;
    const isBarberPayoutActive =
      barberPayout?.isPaymentActive !== false &&
      Boolean(barberPayout?.upiId && barberPayout.upiId.trim());

    const payeeAccount = isBarberPayoutActive
      ? `${barberPayout?.accountHolderName || shopName} (UPI: ${barberPayout.upiId.trim()})`
      : `${shopName} (barbershop@upi)`;

    const txnId = paymentSuccess?.transactionId || 'TXN_OFFICIAL';
    const paidAmount = activeAppointment?.price || 0;
    const services = (activeAppointment?.serviceIds || [activeAppointment?.serviceId])
      .filter(Boolean)
      .map((s) => s.name || 'Service')
      .join(', ');

    const receiptText = `================================================
          BARBER SHOP OFFICIAL RECEIPT
================================================
Shop Name:      ${shopName}
Payee Account:  ${payeeAccount}
Transaction ID: ${txnId}
Payment Status: PAID & CONFIRMED (SUCCESS)
Payment Mode:   ${paymentSuccess?.paymentMethod?.toUpperCase() || 'RAZORPAY'}
Date:           ${new Date().toLocaleString('en-IN')}

Appointment Details:
Date:           ${new Date(activeAppointment?.appointmentDate || Date.now()).toLocaleDateString('en-IN')}
Time Slot:      ${activeAppointment?.appointmentTime}
Services:       ${services}

------------------------------------------------
TOTAL PAID:     INR ${paidAmount}
------------------------------------------------
Thank you for booking with ${shopName}!
================================================`;

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${txnId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <BarberShopLoader />
      </div>
    );
  }

  // If no appointment found
  if (!appointment && pendingAppointments.length === 0) {
    return (
      <div className="theme-page flex items-center justify-center py-20">
        <div className="theme-card max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
            <CreditCard size={32} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">No Pending Payment Found</h2>
          <p className="mt-2 text-sm text-slate-400">
            You don't have any appointments currently waiting for online payment.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link to="/book-appointment" className="theme-primary-btn">
              Book a New Appointment
            </Link>
            <Link to="/my-appointments" className="theme-secondary-btn">
              View My Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUCCESS SCREEN
  // ----------------------------------------------------
  if (paymentSuccess) {
    const activeAppointment = paymentSuccess.appointment || appointment;
    const dateStr = new Date(activeAppointment?.appointmentDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const shopName =
      activeAppointment?.barberId?.shopName ||
      activeAppointment?.barberId?.userId?.name ||
      'Barber Grooming Studio';

    const serviceNames =
      (activeAppointment?.serviceIds || [activeAppointment?.serviceId])
        .filter(Boolean)
        .map((s) => s.name || 'Service')
        .join(', ') || 'Barber Grooming Session';

    const paidAmount = activeAppointment?.price ?? 0;

    return (
      <div className="theme-page py-12">
        <div className="mx-auto w-full max-w-3xl px-4">
          <div className="theme-card relative overflow-hidden border border-emerald-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

            {/* Success Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-400/40 bg-emerald-500/10 text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 size={44} />
            </div>

            <div className="mt-5 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                <Sparkles size={13} /> Payment Confirmed
              </span>
              <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                Booking Confirmed &amp; Paid!
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
                Your payment of <strong className="text-emerald-300">{formatCurrency(paidAmount)}</strong> has been successfully processed. An official receipt has been sent to your email and SMS.
              </p>
            </div>

            {/* Official Digital Receipt Box */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-md">
              <div className="flex flex-col justify-between border-b border-white/10 pb-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Transaction ID</p>
                  <p className="font-mono text-sm font-bold text-amber-300">{paymentSuccess.transactionId}</p>
                </div>
                <div className="mt-3 sm:mt-0 sm:text-right">
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Payment Status</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                    ● SUCCESSFUL
                  </span>
                </div>
              </div>

              <div className="grid gap-4 py-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Shop / Barber</p>
                  <p className="font-semibold text-white">{shopName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Service(s)</p>
                  <p className="font-semibold text-white">{serviceNames}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Appointment Schedule</p>
                  <p className="font-semibold text-white">
                    {dateStr} at {activeAppointment?.appointmentTime}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Payment Mode</p>
                  <p className="font-semibold text-white capitalize">
                    {paymentSuccess.paymentMethod || 'Razorpay / Online'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-base font-bold text-white">Total Amount Paid</span>
                <span className="text-2xl font-black text-amber-400">{formatCurrency(paidAmount)}</span>
              </div>
            </div>

            {/* Action Buttons: Print, Download, Navigation */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handlePrintReceipt}
                className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/20"
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Download size={16} /> Download (.txt)
              </button>
              <Link
                to="/my-appointments"
                className="theme-primary-btn flex items-center justify-center gap-2 py-3 text-sm font-semibold"
              >
                My Appointments <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // CHECKOUT PAGE
  // ----------------------------------------------------
  const appointmentServices =
    appointment?.serviceIds || (appointment?.serviceId ? [appointment.serviceId] : []);
  const shopName =
    appointment?.barberId?.shopName ||
    appointment?.barberId?.userId?.name ||
    'Modern Barber Studio';
  const originalPrice = appointment?.originalPrice || appointment?.price || 0;
  const discountAmount = appointment?.discountAmount || 0;
  const payablePrice = appointment?.price || 0;

  // Dynamic Barber Payout details
  const barberPayout = appointment?.barberId?.payoutDetails;
  const isBarberPayoutActive =
    barberPayout?.isPaymentActive !== false &&
    Boolean(barberPayout?.upiId && barberPayout.upiId.trim());

  const targetUpiId = isBarberPayoutActive
    ? barberPayout.upiId.trim()
    : 'barbershop@upi';

  const targetPayeeName =
    barberPayout?.accountHolderName?.trim() ||
    shopName;

  // Dynamic UPI URL for QR code (points directly to barber's configured UPI)
  const upiUri = `upi://pay?pa=${encodeURIComponent(targetUpiId)}&pn=${encodeURIComponent(
    targetPayeeName
  )}&am=${payablePrice}&cu=INR&tn=${encodeURIComponent(
    `Booking-${appointment?._id?.slice(-6)}`
  )}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
    upiUri
  )}`;

  return (
    <div className="theme-page min-h-screen w-full py-10 pb-32">
      <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Back Link & Security Badge */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/my-appointments"
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400"
          >
            <ArrowLeft size={16} /> Back to Appointments
          </Link>

          <div className="flex items-center gap-4">
            {/* Live Expiry Timer */}
            <div className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <Clock size={14} className="animate-pulse" />
              <span>Complete in {formattedTimeLeft}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Razorpay 256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            <AlertCircle size={20} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* LEFT COLUMN: PAYMENT MODES (7 cols) */}
          <div className="lg:col-span-7">
            <div className="theme-card">
              <div className="border-b border-white/10 pb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Choose Payment Method</h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Select Razorpay or your preferred payment option below.
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                    <ShieldCheck size={14} /> Razorpay Verified
                  </div>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  { id: 'razorpay', label: 'Razorpay', icon: Zap, highlight: true },
                  { id: 'upi', label: 'UPI / QR', icon: QrCode },
                  { id: 'card', label: 'Cards', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                  { id: 'wallet', label: 'Wallets', icon: Wallet },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setError('');
                      }}
                      className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? tab.id === 'razorpay'
                            ? 'border-blue-400 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/20'
                            : 'border-amber-400 bg-amber-400/15 text-amber-300 shadow-lg shadow-amber-400/10'
                          : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {tab.highlight && (
                        <span className="absolute -top-2.5 rounded-full bg-blue-500 px-2 py-0.2 text-[9px] font-bold text-white shadow-sm">
                          Fastest
                        </span>
                      )}
                      <Icon
                        size={20}
                        className={
                          isActive
                            ? tab.id === 'razorpay'
                              ? 'text-blue-400'
                              : 'text-amber-400'
                            : 'text-slate-400'
                        }
                      />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: RAZORPAY (RECOMMENDED) */}
              {activeTab === 'razorpay' && (
                <div className="mt-6 space-y-6">
                  <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 p-6 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-blue-400 tracking-tight">
                            Razorpay
                          </span>
                          <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                            OFFICIAL CHECKOUT
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300">
                          Pay seamlessly using Google Pay, PhonePe, Cards, Netbanking, or UPI.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                        <CheckCircle2 size={16} /> 100% Secure
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs text-slate-300">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
                        <p className="font-bold text-white">UPI Apps</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">GPay, PhonePe, Paytm</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
                        <p className="font-bold text-white">All Cards</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Visa, MC, RuPay</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
                        <p className="font-bold text-white">NetBanking</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">50+ Indian Banks</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
                        <p className="font-bold text-white">Wallets</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Amazon, Mobikwik</p>
                      </div>
                    </div>

                    {/* Primary Button */}
                    <div className="mt-6 flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={handleRazorpayCheckout}
                        disabled={processing}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <Zap size={20} className="text-yellow-300" />
                        {processing
                          ? 'Opening Razorpay...'
                          : `Pay with Razorpay (${formatCurrency(payablePrice)})`}
                      </button>

                      {/* Instant Sandbox Testing Button */}
                      <button
                        type="button"
                        onClick={handleRazorpayTestPay}
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        <Sparkles size={14} className="text-amber-400" />
                        Quick Test Pay with Razorpay Simulator ({formatCurrency(payablePrice)})
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: UPI & QR CODE */}
              {activeTab === 'upi' && (
                <div className="mt-6 space-y-6">
                  {/* Verified Payee Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                        <CheckCircle2 size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                            {isBarberPayoutActive ? 'Direct Barber Account Payout' : 'Verified Merchant Payout'}
                          </span>
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                            ACTIVE
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm font-semibold text-white">
                          Payee: <span className="text-amber-300 font-bold">{targetPayeeName}</span>
                        </p>
                        <p className="font-mono text-xs text-slate-300">
                          UPI ID: <span className="text-emerald-300 font-bold">{targetUpiId}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(targetUpiId, 'upi')}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/30 shrink-0"
                    >
                      {copiedField === 'upi' ? (
                        <>
                          <Check size={14} className="text-emerald-300" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy UPI ID
                        </>
                      )}
                    </button>
                  </div>

                  {/* QR Code Section */}
                  <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
                    <p className="text-xs uppercase tracking-widest text-amber-400">Scan &amp; Pay Instant</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Scan with any UPI App to pay {targetPayeeName}
                    </p>

                    <div className="mt-4 rounded-xl border-4 border-white bg-white p-2 shadow-2xl">
                      <img
                        src={qrCodeUrl}
                        alt="UPI QR Code"
                        className="h-48 w-48 rounded-lg object-contain"
                      />
                    </div>

                    <p className="mt-3 font-mono text-xs text-slate-400">
                      Amount: <strong className="text-white">{formatCurrency(payablePrice)}</strong>
                    </p>

                    {/* Mobile App Quick Intent Link */}
                    <a
                      href={upiUri}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-400/20 sm:hidden"
                    >
                      <ExternalLink size={14} /> Open in UPI App (GPay / PhonePe / Paytm)
                    </a>

                    {/* Quick App Badges */}
                    <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'CRED'].map((app) => (
                        <span
                          key={app}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* UPI ID input form */}
                  <form onSubmit={handleUpiSubmit} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-300">
                        Or Request via Customer UPI ID / VPA
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank"
                          className="theme-input text-sm"
                        />
                        <button
                          type="submit"
                          disabled={processing}
                          className="theme-primary-btn shrink-0 px-6 py-3 font-semibold"
                        >
                          {processing ? 'Verifying...' : `Pay ${formatCurrency(payablePrice)}`}
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                        <span>Popular:</span>
                        {['@okhdfcbank', '@okaxis', '@paytm', '@ybl'].map((suffix) => (
                          <button
                            key={suffix}
                            type="button"
                            onClick={() =>
                              setUpiId(
                                (prev) =>
                                  (prev.includes('@') ? prev.split('@')[0] : prev || 'user') + suffix
                              )
                            }
                            className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-amber-300 hover:border-amber-400/40"
                          >
                            {suffix}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 1-Click Simulated UPI Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          executePayment('upi', {
                            upiId: targetUpiId,
                            payeeName: targetPayeeName,
                            mode: 'barber_direct_upi',
                          })
                        }
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                      >
                        <CheckCircle2 size={18} />
                        Confirm UPI Payment to {targetPayeeName} ({formatCurrency(payablePrice)})
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: CREDIT / DEBIT CARD */}
              {activeTab === 'card' && (
                <div className="mt-6 space-y-6">
                  {/* Interactive 3D Card Preview */}
                  <div className="relative mx-auto h-48 w-full max-w-sm rounded-2xl border border-white/20 bg-gradient-to-tr from-slate-900 via-amber-950/40 to-slate-900 p-6 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between text-xs text-amber-300 font-semibold tracking-wider">
                      <span>BARBER PREMIER CARD</span>
                      <span className="font-bold uppercase">{cardBrand}</span>
                    </div>

                    {/* Chip */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-7 w-9 rounded-md bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-inner" />
                      <div className="h-4 w-4 rounded-full border border-amber-400/40" />
                    </div>

                    {/* Card Number */}
                    <p className="mt-4 font-mono text-lg font-bold tracking-widest text-white">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </p>

                    {/* Footer Name & Expiry */}
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-400">Cardholder</p>
                        <p className="font-semibold uppercase tracking-wider text-white">
                          {cardHolder || 'YOUR NAME'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-wider text-slate-400">Expires</p>
                        <p className="font-semibold text-white">{cardExpiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Form */}
                  <form onSubmit={handleCardSubmit} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="theme-input font-mono text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="NAME AS PRINTED ON CARD"
                        className="theme-input text-sm uppercase"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                          Valid Thru
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={handleCardExpiryChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="theme-input font-mono text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) =>
                            setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                          }
                          placeholder="•••"
                          maxLength={4}
                          className="theme-input font-mono text-sm"
                          required
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-amber-400 focus:ring-0"
                      />
                      <span>Save card securely for faster checkout in future</span>
                    </label>

                    <button
                      type="submit"
                      disabled={processing}
                      className="theme-primary-btn mt-2 flex w-full items-center justify-center gap-2 py-3.5 text-base font-bold"
                    >
                      <Lock size={16} />
                      Pay Securely {formatCurrency(payablePrice)}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: NET BANKING */}
              {activeTab === 'netbanking' && (
                <div className="mt-6 space-y-6">
                  {/* Direct Barber Bank Transfer Section (if configured) */}
                  {barberPayout?.accountNumber ? (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
                        <div className="flex items-center gap-2">
                          <Landmark size={22} className="text-emerald-400" />
                          <div>
                            <h4 className="font-bold text-white text-sm">Direct Barber Bank Account Transfer</h4>
                            <p className="text-[11px] text-emerald-300">
                              Transfer via IMPS, NEFT, RTGS, or mobile banking directly to the barber.
                            </p>
                          </div>
                        </div>
                        <span className="self-start sm:self-auto rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 uppercase">
                          Verified Payee
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 text-xs">
                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Account Holder Name</span>
                          <p className="font-semibold text-white mt-0.5">{barberPayout.accountHolderName || targetPayeeName}</p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Bank Name</span>
                          <p className="font-semibold text-white mt-0.5">{barberPayout.bankName || 'Partner Bank'}</p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 p-3 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Account Number</span>
                            <p className="font-mono font-bold text-amber-300 mt-0.5 tracking-wider">{barberPayout.accountNumber}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(barberPayout.accountNumber, 'account')}
                            className="rounded-lg border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                            title="Copy Account Number"
                          >
                            {copiedField === 'account' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 p-3 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">IFSC Code</span>
                            <p className="font-mono font-bold text-amber-300 mt-0.5 uppercase tracking-wider">{barberPayout.ifscCode}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(barberPayout.ifscCode, 'ifsc')}
                            className="rounded-lg border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                            title="Copy IFSC Code"
                          >
                            {copiedField === 'ifsc' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          executePayment('netbanking', {
                            bank: barberPayout.bankName || 'Direct Transfer',
                            accountNumber: barberPayout.accountNumber,
                            mode: 'direct_barber_transfer',
                          })
                        }
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 py-3 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/30"
                      >
                        <CheckCircle2 size={16} />
                        Confirm Direct Transfer to {barberPayout.accountHolderName || targetPayeeName} ({formatCurrency(payablePrice)})
                      </button>
                    </div>
                  ) : null}

                  {/* Standard Net Banking Portal Options */}
                  <form onSubmit={handleNetBankingSubmit} className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Or Pay via Popular NetBanking Portals
                    </p>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[
                        { id: 'hdfc', name: 'HDFC Bank' },
                        { id: 'sbi', name: 'State Bank of India' },
                        { id: 'icici', name: 'ICICI Bank' },
                        { id: 'axis', name: 'Axis Bank' },
                        { id: 'kotak', name: 'Kotak Bank' },
                        { id: 'pnb', name: 'Punjab National' },
                      ].map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                            selectedBank === bank.id
                              ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                              : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20'
                          }`}
                        >
                          <Building2
                            size={16}
                            className={selectedBank === bank.id ? 'text-amber-400' : 'text-slate-500'}
                          />
                          <span className="truncate">{bank.name}</span>
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                        Or Select Another Bank
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="theme-select text-sm"
                      >
                        <option value="hdfc">HDFC Bank</option>
                        <option value="sbi">State Bank of India (SBI)</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="kotak">Kotak Mahindra Bank</option>
                        <option value="pnb">Punjab National Bank</option>
                        <option value="bob">Bank of Baroda</option>
                        <option value="canara">Canara Bank</option>
                        <option value="union">Union Bank of India</option>
                        <option value="indusind">IndusInd Bank</option>
                        <option value="yes">YES Bank</option>
                        <option value="idfc">IDFC First Bank</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="theme-primary-btn w-full py-3.5 font-bold"
                    >
                      {processing ? 'Connecting to Bank...' : `Proceed to ${selectedBank.toUpperCase()} NetBanking`}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: WALLETS */}
              {activeTab === 'wallet' && (
                <form onSubmit={handleWalletSubmit} className="mt-6 space-y-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Select Digital Wallet
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'paytm', name: 'Paytm Wallet' },
                      { id: 'phonepe', name: 'PhonePe Wallet' },
                      { id: 'amazonpay', name: 'Amazon Pay' },
                      { id: 'mobikwik', name: 'MobiKwik' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWallet(w.id)}
                        className={`flex items-center gap-2.5 rounded-xl border p-4 text-xs font-bold transition ${
                          selectedWallet === w.id
                            ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                            : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <Wallet
                          size={18}
                          className={selectedWallet === w.id ? 'text-amber-400' : 'text-slate-500'}
                        />
                        <span>{w.name}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="theme-primary-btn w-full py-3.5 font-bold"
                  >
                    {processing
                      ? 'Redirecting to Wallet...'
                      : `Pay ${formatCurrency(payablePrice)} with Wallet`}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY & SHOP INFO (5 cols) */}
          <div className="lg:col-span-5">
            <div className="space-y-6">
              {/* Order Summary Card */}
              <div className="theme-card">
                <h3 className="text-lg font-bold text-white">Order Summary</h3>

                {/* Barber Details */}
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                    <Scissors size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-white truncate">{shopName}</h4>
                    <p className="text-xs text-slate-400 truncate">
                      {appointment?.barberId?.address || 'Premium Grooming Studio'}
                    </p>
                  </div>
                </div>

                {/* Date & Time Slot */}
                <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar size={14} className="text-amber-400" />
                    <span>
                      {new Date(appointment?.appointmentDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 font-semibold">
                    <Clock size={14} className="text-amber-400" />
                    <span>{appointment?.appointmentTime}</span>
                  </div>
                </div>

                {/* Selected Services Breakdown */}
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Services</p>
                  <div className="mt-2 divide-y divide-white/5 text-sm">
                    {appointmentServices.map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2">
                        <span className="text-slate-300">{service.name || 'Service'}</span>
                        <span className="font-medium text-white">{formatCurrency(service.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Original Price</span>
                    <span>{formatCurrency(originalPrice)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-300">
                      <span>Coupon Discount ({appointment?.couponCode || 'APPLIED'})</span>
                      <span>- {formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Taxes &amp; Service Fee</span>
                    <span className="text-emerald-400">INCLUDED</span>
                  </div>

                  <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white">
                    <span>Payable Amount</span>
                    <span className="text-2xl font-extrabold text-amber-400">
                      {formatCurrency(payablePrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-400 space-y-2.5">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck size={16} className="text-blue-400 shrink-0" />
                  <span>Razorpay Certified 256-Bit SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Instant booking confirmation &amp; SMS/WhatsApp alert</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock size={16} className="text-amber-400 shrink-0" />
                  <span>Free cancellation up to 2 hours before scheduled slot</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D SECURE OTP SIMULATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
          <div className="theme-card w-full max-w-md border-amber-400/40 p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={24} className="text-amber-400" />
                <h3 className="font-bold text-white">Bank 3D Secure Verification</h3>
              </div>
              <span className="rounded bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                SANDBOX SIMULATOR
              </span>
            </div>

            <div className="mt-4 text-sm text-slate-300">
              <p>
                An OTP has been dispatched to your mobile number ending in{' '}
                <strong className="text-white">••••3068</strong>.
              </p>
              <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">
                Demo Auto-fill OTP:{' '}
                <strong className="font-mono text-sm tracking-widest text-amber-300">123456</strong>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                executePayment('card', {
                  cardNumber: cardNumber.slice(-4),
                  brand: cardBrand,
                  otpVerified: true,
                });
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  className="theme-input text-center font-mono text-xl tracking-[0.4em] font-bold"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Resend OTP in 00:{otpTimer > 9 ? otpTimer : `0${otpTimer}`}</span>
                <button
                  type="button"
                  onClick={() => setOtpTimer(45)}
                  disabled={otpTimer > 0}
                  className={`underline ${
                    otpTimer === 0 ? 'text-amber-400 cursor-pointer' : 'text-slate-600'
                  }`}
                >
                  Resend OTP
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="theme-secondary-btn flex-1 py-3 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="theme-primary-btn flex-1 py-3 text-xs font-bold"
                >
                  {processing ? 'Authorizing...' : 'Authorize & Pay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
