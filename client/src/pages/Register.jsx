import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Scissors,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Award,
  Building2,
  Check,
} from 'lucide-react';
import useAutoDismiss from '../hooks/useAutoDismiss';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    shopName: '',
    experience: '',
    specialization: '',
    location: '',
    bio: '',
  });

  const [error, setError] = useState('');
  useAutoDismiss(error, setError, 4000);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const isBarber = formData.role === 'barber';

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    setError('');
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digits }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: cleanPhone,
        role: formData.role,
      };

      if (isBarber) {
        payload.shopName = formData.shopName.trim();
        payload.experience = Number(formData.experience) || 0;
        payload.specialization = formData.specialization.trim();
        payload.location = formData.location.trim();
        payload.bio = formData.bio.trim();
      }

      const result = await register(payload);

      if (isBarber || result?.requireVerification) {
        navigate('/verify-email', {
          state: {
            email: formData.email.trim(),
            shopName: formData.shopName.trim() || `${formData.name.trim()}'s Barber Studio`,
            previewOtp: result?.previewOtp || '',
            message:
              result?.message ||
              'Barber account created! A 6-digit verification code has been dispatched to your email.',
          },
        });
      } else {
        navigate('/login', {
          state: {
            message: 'Registration successful! Please sign in with your credentials.',
          },
        });
      }
    } catch (err) {
      const validationMessage = err.response?.data?.errors
        ?.map((item) => item.msg)
        .filter(Boolean)
        .join(', ');
      const errorMsg =
        validationMessage ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please review your details.';
      setError(errorMsg);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-950 py-12 sm:py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-5xl lg:max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT BRAND & IMAGERY PANEL (5 COLS) */}
        <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-10 overflow-hidden bg-slate-950">
          <img
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1000&q=80"
            alt="Barbershop Atmosphere"
            className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40 pointer-events-none" />

          {/* TOP TAG */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Join The Network</span>
            </div>
            <h2 className="mt-6 text-3xl font-extralight tracking-tight text-white leading-tight">
              Elevate Your Grooming, <br />
              <span className="font-serif italic text-amber-400 font-normal">Every Single Cut</span>.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs">
              Connect with leading barbers, enjoy zero queue times, and manage your grooming routine effortlessly.
            </p>

            {/* BENEFIT HIGHLIGHTS */}
            <div className="mt-8 space-y-3.5 border-t border-white/10 pt-6">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs text-slate-200">Verified master barbers in your location</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs text-slate-200">Instant confirmed appointments without waiting</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs text-slate-200">Transparent rates & instant digital invoices</span>
              </div>
            </div>
          </div>

          {/* BOTTOM TRUST STATS */}
          <div className="relative z-10 rounded-2xl border border-white/10 bg-slate-900/90 p-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-center divide-x divide-white/10">
              <div className="px-2">
                <p className="text-base font-bold text-amber-400">1,200+</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Bookings</p>
              </div>
              <div className="px-2">
                <p className="text-base font-bold text-amber-400">4.9 ★</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Rating</p>
              </div>
              <div className="px-2">
                <p className="text-base font-bold text-amber-400">100%</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT REGISTRATION FORM (7 COLS) */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-slate-900/60">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400 mb-2">
              <Scissors className="h-3.5 w-3.5" />
              <span>Register Account</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white">
              Create Your <span className="font-serif italic text-amber-400 font-normal">Account</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Select your account type and fill in your details to get started.
            </p>
          </div>

          {/* ROLE SELECTOR TABS */}
          <div className="mt-6 grid grid-cols-2 gap-3 p-1 rounded-2xl border border-white/10 bg-slate-950/60">
            <button
              type="button"
              onClick={() => handleRoleSelect('customer')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                !isBarber
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="h-4 w-4 shrink-0" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('barber')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isBarber
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Scissors className="h-4 w-4 shrink-0" />
              <span>Barber Studio Owner</span>
            </button>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-300 backdrop-blur-md">
              <ShieldCheck className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{error}</p>
                {error.includes('already registered') && (
                  <Link to="/login" className="mt-1.5 inline-block font-semibold text-amber-400 hover:underline">
                    Click here to log in instead
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* FULL NAME */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                    <User className="h-4 w-4 text-amber-400" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Nitish Kumar"
                    required
                    className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
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
                    onChange={handleFormChange}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PHONE */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Mobile Number
                </label>
                <div className="flex rounded-2xl border border-white/10 bg-slate-950/60 transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                  <span className="flex items-center border-r border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-amber-300 select-none rounded-l-2xl">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="10-digit number"
                    maxLength={10}
                    required
                    className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none tracking-wider rounded-r-2xl"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4 text-amber-400" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    placeholder="Create secure password"
                    required
                    className="w-full bg-transparent pl-11 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* BARBER STUDIO SPECIFIC FIELDS */}
            {isBarber && (
              <div className="pt-2 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Studio & Professional Details
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Shop / Studio Name
                    </label>
                    <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                        <Building2 className="h-4 w-4 text-amber-400" />
                      </span>
                      <input
                        type="text"
                        name="shopName"
                        value={formData.shopName}
                        onChange={handleFormChange}
                        placeholder="e.g. Royal Fade Studio"
                        required={isBarber}
                        className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Experience (Years)
                    </label>
                    <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                        <Award className="h-4 w-4 text-amber-400" />
                      </span>
                      <input
                        type="number"
                        min="0"
                        name="experience"
                        value={formData.experience}
                        onChange={handleFormChange}
                        placeholder="e.g. 5"
                        className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Specialization
                    </label>
                    <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                      </span>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleFormChange}
                        placeholder="Fade, Beard Sculpt, Facial"
                        className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Studio Location / City
                    </label>
                    <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                        <MapPin className="h-4 w-4 text-amber-400" />
                      </span>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleFormChange}
                        placeholder="Argora, Ranchi"
                        className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Studio Bio / Description
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Tell your clients about your premium style, hygiene standards, and signature grooming rituals..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
                  ></textarea>
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-400 py-3.5 sm:py-4 text-sm font-bold text-slate-950 transition duration-200 hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/25 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span>Processing Registration...</span>
                ) : (
                  <>
                    <span>{isBarber ? 'Register Barber Studio' : 'Create Customer Account'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* FOOTER */}
          <div className="mt-6 border-t border-white/10 pt-5 text-center">
            <p className="text-xs sm:text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-amber-400 hover:text-amber-300 hover:underline transition"
              >
                Sign In to Account
              </Link>
            </p>

            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>256-Bit Encrypted Secure Sign-Up</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
