import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { barbersAPI } from '../services/api';
import useUserLocation from '../hooks/useUserLocation';
import ShopImageSlider from '../components/ShopImageSlider';
import {
  Scissors,
  MapPin,
  Phone,
  Star,
  ShieldCheck,
  Clock,
  CreditCard,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  Navigation,
  Users,
} from 'lucide-react';

const DEFAULT_BARBER_IMAGES = [
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
];

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
];

const TESTIMONIALS = [
  {
    name: 'Rahul Verma',
    role: 'Regular Client',
    city: 'Ranchi',
    rating: 5,
    comment:
      'Finding Nitish’s shop on this app made my weekend grooming effortless. The razor line-up and hot towel shave were immaculate!',
  },
  {
    name: 'Sameer Jha',
    role: 'Executive Client',
    city: 'Argora, Ranchi',
    rating: 5,
    comment:
      'Booked Aman Style directly through the system. Zero waiting time, pristine hygiene, and the fade cut was top tier.',
  },
  {
    name: 'Vikash Pandey',
    role: 'Verified Customer',
    city: 'Giridih',
    rating: 5,
    comment:
      'Hemu Shope provided great beard care. Love the location detection feature that showed me the nearest shop right away.',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentCity, locationStatus, requestLocation, setManualCity } = useUserLocation();

  const [barbers, setBarbers] = useState([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    requestLocation();
    setRefreshTrigger((prev) => prev + 1);
  };

  // Fetch barbers immediately (with city if detected, or top studios right away)
  useEffect(() => {
    let isMounted = true;

    const fetchBarbers = async () => {
      try {
        setLoadingBarbers(true);
        const params = currentCity ? { city: currentCity, limit: 10 } : { limit: 10 };
        const response = await barbersAPI.getAll(params);
        if (isMounted) {
          setBarbers(response.data?.barbers || []);
        }
      } catch (err) {
        console.error('HomePage barber fetch error:', err);
        if (isMounted) setBarbers([]);
      } finally {
        if (isMounted) setLoadingBarbers(false);
      }
    };

    fetchBarbers();
    return () => {
      isMounted = false;
    };
  }, [currentCity, refreshTrigger]);

  const handleBookAppointment = (barberId = null) => {
    const routeState = barberId ? { selectedBarberId: barberId } : undefined;
    if (user) {
      navigate('/book-appointment', { state: routeState });
      return;
    }
    navigate('/login', { state: { from: '/book-appointment', ...routeState } });
  };

  return (
    <div className="w-full bg-slate-950 text-white selection:bg-amber-400 selection:text-black">
      {/* 1. HERO SECTION (EDGE-TO-EDGE FLUID CONTAINER) */}
      <section className="relative w-full overflow-hidden border-b border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-black py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.18),rgba(255,255,255,0))]" />

        <div className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* LEFT CONTENT (7 cols) */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Premier Barber Network & Grooming Lounge</span>
              </div>

              <h1 className="mt-6 text-4xl font-extralight tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
                Crafted for <span className="font-serif italic text-amber-400 font-normal">Distinction</span>, Styled for Confidence.
              </h1>

              <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
                Book with master barbers and verified studios near you. Experience handcrafted scissor cuts, razor-sharp fades, and luxury grooming in zero-wait sessions.
              </p>

              {/* ACTION BUTTONS */}
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => handleBookAppointment()}
                  className="flex items-center gap-2.5 rounded-2xl bg-amber-400 px-7 py-4 text-sm font-bold text-slate-950 transition duration-200 hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/25 active:scale-95 cursor-pointer"
                >
                  <span>Book an Appointment</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/barbers')}
                  className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-amber-400/50 cursor-pointer"
                >
                  <MapPin className="h-4 w-4 text-amber-400" />
                  <span>Find Barbers Near Me</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/services')}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-transparent px-5 py-4 text-sm font-semibold text-slate-300 transition hover:text-white hover:border-white/30 cursor-pointer"
                >
                  <Scissors className="h-4 w-4 text-amber-400" />
                  <span>Explore Services</span>
                </button>
              </div>

              {/* STATS STRIP */}
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 max-w-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <p className="text-2xl sm:text-3xl font-bold text-white">100%</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Sterilized & Safe Tools</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <p className="text-2xl sm:text-3xl font-bold text-amber-400">4.9</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Average Client Rating</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-400" />
                    <p className="text-2xl sm:text-3xl font-bold text-white">{barbers.length || 0}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{currentCity ? `Studios in ${currentCity}` : 'Studios in Area'}</p>
                </div>
              </div>
            </div>

            {/* RIGHT VISUAL (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-2xl shadow-amber-500/10">
                  <img
                    src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80"
                    alt="Master barber styling client"
                    fetchPriority="high"
                    decoding="async"
                    className="h-[460px] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Status Badge */}
                <div className="absolute -bottom-5 left-4 sm:left-6 z-10 flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Verified Studios</p>
                    <p className="text-sm font-bold text-white">Direct Booking & Open Slots</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL DATABASE BARBERS SHOWCASE - STRICTLY CURRENT LOCATION ONLY */}
      <section className="w-full py-16 sm:py-24 border-b border-white/10">
        <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-400">
                <Navigation className="h-3.5 w-3.5" />
                <span>
                  {locationStatus === 'requesting'
                    ? 'Detecting Location...'
                    : currentCity
                    ? `Current Location: ${currentCity}`
                    : 'Location Required'}
                </span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-white">
                Barber Studios in <span className="font-serif italic text-amber-400">{currentCity || 'Your Area'}</span>
              </h2>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-400">
                {currentCity
                  ? `Showing verified barber studios in your detected location (${currentCity}).`
                  : 'We show verified barber studios with live open slots and ratings.'}
              </p>
            </div>

            {currentCity && (
              <button
                type="button"
                onClick={requestLocation}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:border-amber-400 hover:text-amber-300 transition cursor-pointer shrink-0"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>Refresh Location</span>
              </button>
            )}
          </div>

          {/* BARBERS CONTENT BASED ON CURRENT LOCATION */}
          {loadingBarbers ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={`skeleton-${n}`} className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 animate-pulse">
                  <div className="h-48 w-full rounded-2xl bg-slate-800/80 mb-4" />
                  <div className="h-5 w-3/4 rounded-lg bg-slate-800/80 mb-2" />
                  <div className="h-4 w-1/2 rounded-lg bg-slate-800/60" />
                </div>
              ))}
            </div>
          ) : locationStatus === 'denied' && !currentCity ? (
            /* User denied or browser doesn't have location permission */
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-10 sm:p-14 text-center backdrop-blur-md max-w-2xl mx-auto">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400 mb-4">
                <MapPin className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Location Access Required</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                To show barber shops in your current location, please allow location access or select your city below.
              </p>
              <div className="mt-6 flex flex-wrap justify-center items-center gap-3">
                <button
                  type="button"
                  onClick={requestLocation}
                  className="flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 hover:bg-amber-300 transition cursor-pointer"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Allow Location Access</span>
                </button>
              </div>
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs text-slate-400 mb-3">Or choose your current city:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Ranchi', 'Argora', 'Giridih'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setManualCity(city)}
                      className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:border-amber-400 hover:text-white transition cursor-pointer"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : barbers.length === 0 ? (
            /* Location was detected, but no barber is registered in that city */
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-14 text-center backdrop-blur-md">
              <MapPin className="mx-auto h-12 w-12 text-amber-400/60 mb-3" />
              <h3 className="text-white text-lg font-semibold">
                No barber studios found in {currentCity}
              </h3>
              <p className="mt-2 text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                Currently, registered barber studios are available in Ranchi, Argora, and Giridih. As soon as a studio registers in {currentCity}, it will appear here.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Re-check Location</span>
                </button>
              </div>
            </div>
          ) : (
            /* Barbers found strictly in current location */
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {barbers.map((barber, index) => {
                const barberName = barber.userId?.name || 'Master Barber';
                const shopName = barber.shopName || `${barberName}'s Shop`;
                const phone = barber.userId?.phone || barber.phone || '';
                const location = barber.location || 'Local Studio';
                const experience = barber.experience ?? barber.experienceYears ?? 0;

                const digits = String(phone).replace(/\D/g, '');
                const cleanPhone = digits.length === 10 ? `+91${digits}` : digits.length === 12 && digits.startsWith('91') ? `+${digits}` : phone.startsWith('+') ? phone : digits ? `+${digits}` : '';

                const images =
                  Array.isArray(barber.shopImages) && barber.shopImages.length > 0
                    ? barber.shopImages
                    : barber.shopImage
                    ? [barber.shopImage]
                    : [DEFAULT_BARBER_IMAGES[index % DEFAULT_BARBER_IMAGES.length]];

                const avatar =
                  barber.userId?.avatar ||
                  barber.avatar ||
                  DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];

                return (
                  <div
                    key={barber._id}
                    className="group flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-amber-400/40 hover:shadow-2xl"
                  >
                    <div>
                      {/* STUDIO BANNER */}
                      <div className="relative h-60 overflow-hidden bg-slate-800">
                        <ShopImageSlider images={images} className="h-full w-full" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />

                        <div className="absolute top-3 left-3">
                          <span className="flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-semibold text-emerald-400 backdrop-blur-md border border-white/10">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Open Today</span>
                          </span>
                        </div>

                        {/* AVATAR OVERLAY */}
                        <div className="absolute -bottom-5 left-5 z-10">
                          <img
                            src={avatar}
                            alt={barberName}
                            className="h-14 w-14 rounded-2xl border-2 border-amber-400 object-cover shadow-lg bg-slate-950"
                          />
                        </div>
                      </div>

                      {/* BODY */}
                      <div className="p-6 pt-9">
                        <p className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold truncate">
                          {shopName}
                        </p>
                        <h3 className="mt-1 text-2xl font-bold text-white group-hover:text-amber-300 transition">
                          {barberName}
                        </h3>

                        <div className="mt-4 space-y-2.5 text-xs text-slate-300 border-t border-white/10 pt-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                            <span className="truncate">{location}</span>
                          </div>
                          {cleanPhone && (
                            <a
                              href={`tel:${cleanPhone}`}
                              onClick={() => {
                                if (navigator.clipboard) navigator.clipboard.writeText(cleanPhone).catch(() => {});
                              }}
                              className="flex items-center gap-2 text-slate-200 hover:text-amber-300 transition cursor-pointer"
                              title="Click to call directly"
                            >
                              <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                              <span className="font-mono tracking-wide">{phone}</span>
                            </a>
                          )}
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                            <span>{experience > 0 ? `${experience} Years Experience` : 'Verified Studio'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTION CTA */}
                    <div className="p-6 pt-0 flex gap-2">
                      {cleanPhone && (
                        <a
                          href={`tel:${cleanPhone}`}
                          onClick={() => {
                            if (navigator.clipboard) navigator.clipboard.writeText(cleanPhone).catch(() => {});
                          }}
                          className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-xs font-semibold text-amber-400 hover:bg-amber-400 hover:text-slate-950 transition cursor-pointer"
                          title={`Direct Call: ${phone}`}
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleBookAppointment(barber._id)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-xs sm:text-sm font-bold text-slate-950 transition hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer"
                      >
                        <span>Book with {barberName}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. WHY GROOM WITH US (ICON PILLARS) */}
      <section className="w-full py-16 sm:py-24 border-b border-white/10">
        <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-400 font-semibold">The Barbershop Standard</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extralight text-white">
              Why Discerning Clients <span className="font-serif italic text-amber-400 font-normal">Choose Us</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-7 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 mb-4">
                <Scissors className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Master Stylists Only</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Every barber profile is vetted with verified shop locations, authentic ratings, and specialized techniques.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-7 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">100% Sanitized & Sterile</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Hospital-grade disinfection of clippers, single-use fresh razor blades, and clean individual capes.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-7 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Zero Wait Time</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Reserve your slot in seconds. Walk in at your designated appointment time without standing in long queues.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-7 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 mb-4">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Flexible Payments</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Pay via cash, UPI, Google Pay, PhonePe, Paytm, or secure online checkout with instant digital receipts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CLIENT REVIEWS */}
      <section className="w-full py-16 sm:py-24 border-b border-white/10">
        <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-400 font-semibold">Testimonials</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extralight text-white">
              Trusted by <span className="font-serif italic text-amber-400 font-normal">Clients</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-3xl border border-white/10 bg-slate-900/80 p-7 backdrop-blur-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {Array.from({ length: t.rating }).map((_, rIdx) => (
                      <Star key={`star-${t.name}-${rIdx}`} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-400 font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role} · {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FINAL BOOKING CTA */}
      <section className="w-full py-16 sm:py-24">
        <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-400/30 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 p-8 sm:p-14 text-slate-950 shadow-2xl">
            <div className="relative z-10 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.35em] font-bold text-slate-900/70">
                Upgrade Your Grooming Experience
              </p>
              <h3 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
                Ready for your next signature look?
              </h3>
              <p className="mt-4 text-base sm:text-lg text-slate-900/80 leading-relaxed font-medium">
                Choose your service, find your local stylist, and lock in your appointment in just two minutes.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => handleBookAppointment()}
                  className="rounded-2xl bg-slate-950 px-8 py-4 text-sm font-bold text-white transition hover:bg-slate-900 shadow-xl active:scale-95 cursor-pointer"
                >
                  Book Appointment Now
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/barbers')}
                  className="rounded-2xl border-2 border-slate-950/40 bg-transparent px-6 py-4 text-sm font-bold text-slate-950 hover:bg-slate-950/10 transition cursor-pointer"
                >
                  Find Nearest Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
