import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Scissors,
} from 'lucide-react';
import useAutoDismiss from '../hooks/useAutoDismiss';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, user } = useAuth();

  // Extract initial email and preview OTP from state or URL query
  const queryParams = new URLSearchParams(location.search);
  const initialEmail =
    location.state?.email || queryParams.get('email') || '';
  const initialShopName =
    location.state?.shopName || queryParams.get('shop') || 'Barber Studio';
  const previewOtp = location.state?.previewOtp || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ''
  );
  const [isVerified, setIsVerified] = useState(false);

  useAutoDismiss(error, setError, 5000);
  useAutoDismiss(successMessage, setSuccessMessage, 5000);

  const inputRefs = useRef([]);

  // Redirect if user is already logged in and verified
  useEffect(() => {
    if (user && user.isEmailVerified) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }

    setCanResend(false);
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle single digit input
  const handleOtpChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    setError('');

    // Auto advance to next input
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace retreat
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle pasting full 6 digits
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);
    setError('');

    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const fullOtpCode = otp.join('');

  // Submit verification code
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please provide the registered email address.');
      return;
    }

    if (fullOtpCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyEmail(email, fullOtpCode, true);
      setIsVerified(true);
      setSuccessMessage('Email verified successfully! Activating your studio...');

      // Transition to barber dashboard
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Verification failed. Please check the code and try again.';
      setError(errorMsg);
      console.error('Verify email error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Resend fresh OTP
  const handleResendOtp = async () => {
    if (!canResend || resending) return;

    if (!email) {
      setError('Email address is missing. Please register again.');
      return;
    }

    setResending(true);
    setError('');
    try {
      const res = await authAPI.resendVerification({ email });
      setSuccessMessage(
        res.data?.message || 'A fresh 6-digit verification code has been dispatched.'
      );
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to resend code. Please try again.';
      setError(errorMsg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-950 py-12 sm:py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT BRANDING PANEL (5 COLS) */}
        <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-10 overflow-hidden bg-slate-950">
          <img
            src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1000&q=80"
            alt="Barber Studio Security"
            className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40 pointer-events-none" />

          {/* TOP TAG */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 backdrop-blur-md">
              <Scissors className="h-3.5 w-3.5" />
              <span>Studio Partner Security</span>
            </div>
            <h2 className="mt-6 text-3xl font-extralight tracking-tight text-white leading-tight">
              Verify Your Studio, <br />
              <span className="font-serif italic text-amber-400 font-normal">Begin Grooming</span>.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs">
              Every barber partner must confirm their primary studio email to ensure secure booking management and instant client payouts.
            </p>

            {/* VERIFICATION TIMELINE */}
            <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                  ✓
                </div>
                <span>Account Created</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white font-medium">
                <div className="h-6 w-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[11px] animate-pulse">
                  2
                </div>
                <span className="text-amber-300">Email OTP Verification (In Progress)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="h-6 w-6 rounded-full bg-white/10 text-slate-400 flex items-center justify-center font-bold text-[11px]">
                  3
                </div>
                <span>Studio Dashboard & Public Listing</span>
              </div>
            </div>
          </div>

          {/* BOTTOM STUDIO PILL */}
          <div className="relative z-10 rounded-2xl border border-white/10 bg-slate-900/90 p-4 backdrop-blur-xl shadow-xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{initialShopName}</p>
              <p className="text-[10px] text-slate-400">Barber Studio Partner Verification</p>
            </div>
          </div>
        </div>

        {/* RIGHT VERIFICATION FORM (7 COLS) */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-slate-900/60">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Email Verification</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white">
              Confirm Your <span className="font-serif italic text-amber-400 font-normal">Barber Email</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              We have dispatched a 6-digit verification code to:
            </p>
            <div className="mt-1.5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-amber-300">
              <Mail className="h-4 w-4 text-amber-400" />
              <span>{email || 'Your Registered Email'}</span>
            </div>
          </div>

          {/* DEVELOPMENT PREVIEW OTP NOTICE */}
          {previewOtp && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs sm:text-sm text-amber-300 backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Development Simulation Mode</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Your 6-digit OTP code is: <strong className="font-mono text-base text-amber-300 tracking-wider font-bold">{previewOtp}</strong>
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {successMessage && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs sm:text-sm text-emerald-300 backdrop-blur-md">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ERROR ALERT */}
          {error && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-300 backdrop-blur-md">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 text-center sm:text-left">
                Enter 6-Digit Code
              </label>

              {/* 6 INDIVIDUAL OTP INPUT BOXES */}
              <div
                className="flex items-center justify-between gap-2 sm:gap-3"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={loading || isVerified}
                    className="h-13 w-11 sm:h-16 sm:w-14 rounded-2xl border border-white/10 bg-slate-950/80 text-center text-xl sm:text-2xl font-bold font-mono text-white transition focus:border-amber-400 focus:bg-slate-900 focus:ring-2 focus:ring-amber-400/20 focus:outline-none disabled:opacity-50 selection:bg-transparent"
                  />
                ))}
              </div>
            </div>

            {/* RESEND OTP SECTION */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-400">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || resending || loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-50 disabled:hover:text-amber-400 transition cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>
                  {resending
                    ? 'Dispatching...'
                    : canResend
                    ? 'Resend Code'
                    : `Resend in ${resendCooldown}s`}
                </span>
              </button>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || fullOtpCode.length !== 6 || isVerified}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-400 py-4 text-sm font-bold text-slate-950 transition duration-200 hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/25 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Verifying Code...</span>
                ) : isVerified ? (
                  <>
                    <span>Verified! Opening Studio...</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Verify & Activate Studio</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* FOOTER */}
          <div className="mt-8 border-t border-white/10 pt-5 flex items-center justify-between text-xs text-slate-400">
            <Link
              to="/register"
              className="text-slate-400 hover:text-white transition"
            >
              Wrong email? Sign up again
            </Link>
            <Link
              to="/login"
              className="font-semibold text-amber-400 hover:text-amber-300 hover:underline transition"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
