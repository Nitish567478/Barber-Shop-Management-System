import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Scissors,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Star,
  CheckCircle2,
} from 'lucide-react';
import useAutoDismiss from '../hooks/useAutoDismiss';

const Login = () => {
  const [formData, setFormData] = useState(() => {
    const savedEmail = localStorage.getItem('rememberedEmail') || '';
    const savedRemember = localStorage.getItem('rememberMeFlag') !== 'false';
    return {
      email: savedEmail,
      password: '',
      rememberMe: savedRemember,
    };
  });

  const [error, setError] = useState('');
  useAutoDismiss(error, setError, 4000);

  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  useAutoDismiss(successMessage, setSuccessMessage, 5000);

  // If user is already logged in, redirect immediately
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
    setVerificationData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerificationData(null);

    try {
      // Manage Remember Me persistence
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email.trim());
        localStorage.setItem('rememberMeFlag', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.setItem('rememberMeFlag', 'false');
      }

      await login(formData.email, formData.password, formData.rememberMe);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response?.data?.requireVerification) {
        setVerificationData({
          email: err.response?.data?.email || formData.email,
          previewOtp: err.response?.data?.previewOtp || '',
        });
      }
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Invalid email or password. Please try again.';
      setError(errorMsg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-950 py-12 sm:py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT BRAND & IMAGERY PANEL (5 COLS) */}
        <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-10 overflow-hidden bg-slate-950">
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80"
            alt="Master Barber Styling"
            className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30 pointer-events-none" />

          {/* TOP TAG */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Grooming Excellence</span>
            </div>
            <h2 className="mt-6 text-3xl font-extralight tracking-tight text-white leading-tight">
              Precision Cuts, <br />
              <span className="font-serif italic text-amber-400 font-normal">Timeless Style</span>.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs">
              Sign in to manage appointments, access digital invoices, or direct your salon appointments in real time.
            </p>
          </div>

          {/* BOTTOM TESTIMONIAL / TRUST CARD */}
          <div className="relative z-10 rounded-2xl border border-white/10 bg-slate-900/90 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-1 text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-200 italic leading-relaxed">
              &ldquo;Effortless booking, verified master stylists, and zero queue waiting time.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2.5 border-t border-white/10 pt-3">
              <div className="h-7 w-7 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                R
              </div>
              <div>
                <p className="text-xs font-bold text-white">Rahul Verma</p>
                <p className="text-[10px] text-slate-400">Regular Client · Ranchi</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN FORM (7 COLS) */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-slate-900/60">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400 mb-3">
              <Scissors className="h-3.5 w-3.5" />
              <span>Member Access</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white">
              Welcome <span className="font-serif italic text-amber-400 font-normal">Back</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Enter your credentials to access your Customer or Barber account.
            </p>
          </div>

          {/* SUCCESS MESSAGE */}
          {successMessage && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs sm:text-sm text-emerald-300 backdrop-blur-md">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-300 backdrop-blur-md">
              <ShieldCheck className="h-5 w-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* BARBER UNVERIFIED PROMPT */}
          {verificationData && (
            <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs sm:text-sm text-amber-300 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-white">Email Verification Required</p>
                  <p className="mt-1 text-slate-300">
                    Your Barber Studio email has not been verified yet. We sent a 6-digit code to{' '}
                    <strong className="text-amber-300">{verificationData.email}</strong>.
                  </p>
                  {verificationData.previewOtp && (
                    <p className="mt-1.5 text-xs text-amber-300 font-mono">
                      Simulation Code: <span className="font-bold">{verificationData.previewOtp}</span>
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/verify-email', {
                        state: {
                          email: verificationData.email,
                          previewOtp: verificationData.previewOtp,
                        },
                      })
                    }
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-300 cursor-pointer"
                  >
                    <span>Verify Email Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* EMAIL FIELD */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                  <Mail className="h-4 w-4 text-amber-400" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-amber-400 hover:text-amber-300 hover:underline transition"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                  <Lock className="h-4 w-4 text-amber-400" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-transparent pl-11 pr-12 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-white transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME TOGGLE */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="h-5 w-5 rounded-lg border border-white/20 bg-slate-950 peer-checked:border-amber-400 peer-checked:bg-amber-400 transition-all flex items-center justify-center">
                    {formData.rememberMe && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-slate-950 stroke-[3]" />
                    )}
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-slate-300 group-hover:text-white transition">
                  Remember my account on this device
                </span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-400 py-4 text-sm font-bold text-slate-950 transition duration-200 hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/25 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* FOOTER */}
          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-xs sm:text-sm text-slate-400">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-amber-400 hover:text-amber-300 hover:underline transition"
              >
                Create an Account
              </Link>
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>256-Bit Encrypted Secure Sign-In</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
