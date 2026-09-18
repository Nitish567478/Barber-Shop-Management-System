import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { barbersAPI } from '../services/api';
import { isValidObjectId } from '../utils/objectId';
import BarberShopLoader from '../components/BarberShopLoader';
import ShopImageSlider from '../components/ShopImageSlider';
import useAutoDismiss from '../hooks/useAutoDismiss';
import useUserLocation from '../hooks/useUserLocation';
import {
  MapPin,
  CheckCircle2,
  Navigation,
  ArrowRight,
  RotateCw,
  Phone,
  AlertCircle,
  Users,
  User,
} from 'lucide-react';

// Curated default imagery if a shop hasn't uploaded photos yet
const DEFAULT_STUDIO_IMAGES = [
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1200&q=80',
];

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80',
];

const KNOWN_COORDINATES = {
  argora: { lat: 23.3512, lng: 85.3021 },
  ranchi: { lat: 23.3441, lng: 85.3096 },
  giridih: { lat: 24.1856, lng: 86.3056 },
  patna: { lat: 25.5941, lng: 85.1376 },
  dhanbad: { lat: 23.7957, lng: 86.4304 },
  jamshedpur: { lat: 22.8046, lng: 86.2029 },
  bokaro: { lat: 23.6693, lng: 86.1511 },
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
};

function getBarberCoords(barber) {
  if (barber.coordinates && barber.coordinates.lat && barber.coordinates.lng) {
    return barber.coordinates;
  }
  const loc = (barber.location || '').toLowerCase();
  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (loc.includes(key)) {
      return coords;
    }
  }
  return null;
}

// Haversine distance in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const normalizeSpecializations = (specialization) => {
  if (Array.isArray(specialization)) {
    return specialization.filter(Boolean);
  }
  if (typeof specialization === 'string' && specialization.trim()) {
    return specialization.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return ['Haircut', 'Shaving'];
};

const getWorkingHours = (barber) => {
  if (!barber.openingTime || !barber.closingTime) {
    return '09:00 AM - 06:00 PM';
  }

  const convertTo12Hour = (time) => {
    if (!time || !time.includes(':')) return time;
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  };

  return `${convertTo12Hour(barber.openingTime)} - ${convertTo12Hour(barber.closingTime)}`;
};

const formatPhoneDigits = (rawPhone) => {
  if (!rawPhone || rawPhone === 'Contact on appointment') return null;
  const digits = String(rawPhone).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (String(rawPhone).startsWith('+')) return rawPhone;
  return `+${digits}`;
};

const BarbersPage = () => {
  const navigate = useNavigate();
  const { currentCity, userCoords, locationStatus, requestLocation, setManualCity } =
    useUserLocation();

  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [callingBarber, setCallingBarber] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedBarberModal, setSelectedBarberModal] = useState(null);
  const [sortByNearest, setSortByNearest] = useState(true);

  useAutoDismiss(error, setError, 5000);
  useAutoDismiss(callingBarber, setCallingBarber, 4000);

  // 1. Fetch REAL Barbers directly from MongoDB - strictly for current location
  const fetchBarbers = useCallback(
    async (targetCity) => {
      const city = targetCity || currentCity;
      if (!city) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        // Strictly pass city to fetch ONLY this location from database
        const response = await barbersAPI.getAll({ city });
        const apiBarbers = response.data?.barbers || [];
        setBarbers(apiBarbers);
      } catch (err) {
        setError('Could not connect to database to fetch barbers. Click Retry to reconnect.');
        setBarbers([]);
        console.error('Fetch barbers error:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentCity]
  );

  useEffect(() => {
    if (currentCity) {
      fetchBarbers(currentCity);
    } else if (locationStatus === 'denied') {
      setBarbers([]);
      setLoading(false);
    }
  }, [currentCity, locationStatus, refreshTrigger, fetchBarbers]);

  // Dedicated manual refresh handler (re-requests location AND directly re-fetches from database)
  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    requestLocation();
    setRefreshTrigger((prev) => prev + 1);
    await fetchBarbers(currentCity);
  };

  // Direct Call Handler
  const handleDirectCall = (e, rawPhone, barberName) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const cleanPhone = formatPhoneDigits(rawPhone);
    if (!cleanPhone) {
      alert('Contact phone number is not available for this studio.');
      return;
    }

    const telUri = `tel:${cleanPhone}`;

    // Auto-copy phone number to clipboard for desktop PC convenience
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleanPhone).catch(() => {});
    }

    // Set feedback toast
    setCallingBarber({ name: barberName, phone: cleanPhone });

    // Direct dialer trigger
    window.location.href = telUri;
  };

  // 2. Extract Unique Specializations from Current Location Barbers
  const availableSpecializations = useMemo(() => {
    const specSet = new Set();
    barbers.forEach((b) => {
      const specs = normalizeSpecializations(b.specialization);
      specs.forEach((s) => specSet.add(s));
    });
    return ['All', ...Array.from(specSet)];
  }, [barbers]);

  // 3. Compute Distance for Current Location Barbers
  const processedBarbers = useMemo(() => {
    return barbers.map((barber, index) => {
      let distanceKm = null;
      if (userCoords) {
        const barberCoords = getBarberCoords(barber);
        if (barberCoords) {
          distanceKm = calculateDistanceKm(
            userCoords.lat,
            userCoords.lng,
            barberCoords.lat,
            barberCoords.lng
          );
        }
      }

      const cardImages =
        Array.isArray(barber.shopImages) && barber.shopImages.length > 0
          ? barber.shopImages
          : barber.shopImage
          ? [barber.shopImage]
          : [DEFAULT_STUDIO_IMAGES[index % DEFAULT_STUDIO_IMAGES.length]];

      const avatar =
        barber.userId?.avatar ||
        barber.avatar ||
        DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];

      return {
        ...barber,
        computedDistance: distanceKm,
        displayImages: cardImages,
        displayAvatar: avatar,
      };
    });
  }, [barbers, userCoords]);

  // 4. Filter & Sort within Current Location
  const filteredBarbers = useMemo(() => {
    let result = processedBarbers.filter((b) => {
      const query = search.toLowerCase().trim();
      const barberName = (b.userId?.name || '').toLowerCase();
      const shopName = (b.shopName || '').toLowerCase();
      const location = (b.location || '').toLowerCase();
      const specs = normalizeSpecializations(b.specialization).map((s) => s.toLowerCase());

      const matchSearch =
        !query ||
        barberName.includes(query) ||
        shopName.includes(query) ||
        location.includes(query) ||
        specs.some((s) => s.includes(query));

      const matchSpec =
        selectedSpecialization === 'All' ||
        specs.some((s) => s.includes(selectedSpecialization.toLowerCase()));

      return matchSearch && matchSpec;
    });

    if (sortByNearest && userCoords) {
      result.sort((a, b) => {
        if (a.computedDistance === null) return 1;
        if (b.computedDistance === null) return -1;
        return a.computedDistance - b.computedDistance;
      });
    }

    return result;
  }, [processedBarbers, search, selectedSpecialization, sortByNearest, userCoords]);

  if (loading && !currentCity) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="flex flex-col items-center text-center">
          <BarberShopLoader />
          <h1 className="mt-4 text-2xl font-semibold tracking-wide text-amber-300">
            Detecting Location & Loading Studios...
          </h1>
          <p className="mt-2 text-sm text-slate-400">Finding verified barber shops in your current area</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-400 selection:text-black">
      {/* HERO SECTION */}
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-black py-14 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.15),rgba(255,255,255,0))]" />

        <div className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 xl:px-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400 backdrop-blur-md">
            <Navigation className="h-3.5 w-3.5 text-amber-400" />
            <span>
              {locationStatus === 'requesting'
                ? 'Detecting Current Location...'
                : currentCity
                ? `Current Location: ${currentCity}`
                : 'Location Required'}
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-extralight tracking-tight sm:text-6xl">
            Barbers in <span className="font-serif italic text-amber-400 font-normal">{currentCity || 'Your Area'}</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            {currentCity
              ? `Discover verified local stylists and grooming studios available in ${currentCity}.`
              : 'We only show barber studios matching your current detected location.'}
          </p>

          {/* CURRENT LOCATION BUTTON & DEDICATED REFRESH BUTTON */}
          <div className="mx-auto mt-7 max-w-xl flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* LOCATION BUTTON */}
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition cursor-pointer"
                title="Click to refresh location and studios"
              >
                <MapPin className="h-4 w-4 text-slate-950" />
                <span>
                  {currentCity ? `Location: ${currentCity}` : 'Detect My Location'}
                </span>
              </button>

              {/* DEDICATED REFRESH BUTTON */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition cursor-pointer"
                title="Refresh studio list from database"
              >
                <RotateCw className={`h-4 w-4 text-amber-400 ${loading || refreshing ? 'animate-spin' : ''}`} />
                <span>{loading || refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              {userCoords && (
                <button
                  type="button"
                  onClick={() => setSortByNearest(!sortByNearest)}
                  className={`rounded-2xl border px-4 py-3.5 text-xs font-semibold transition cursor-pointer ${
                    sortByNearest
                      ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {sortByNearest ? '✓ Sorted by Nearest' : 'Sort by Nearest'}
                </button>
              )}
            </div>
          </div>

          {/* SEARCH BAR WITHIN CURRENT LOCATION */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={currentCity ? `Search studios & barbers in ${currentCity}...` : 'Search by shop or stylist name...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-10 py-3.5 text-sm text-white placeholder-slate-400 backdrop-blur-md focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* QUICK SPECIALIZATION TAGS */}
          {availableSpecializations.length > 1 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {availableSpecializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialization(spec)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                    selectedSpecialization === spec
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                      : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {spec === 'All' ? 'All Services' : spec}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto w-full max-w-[1720px] px-4 py-12 sm:px-8 lg:px-12 xl:px-16">
        {/* ERROR BANNER WITH RETRY BUTTON */}
        {error && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl bg-rose-500/20 px-4 py-2 text-xs font-bold text-rose-200 border border-rose-500/40 hover:bg-rose-500/30 transition cursor-pointer shrink-0"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading || refreshing ? 'animate-spin' : ''}`} />
              <span>{loading || refreshing ? 'Reconnecting...' : 'Retry Connection'}</span>
            </button>
          </div>
        )}

        {/* RESULTS HEADER */}
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {currentCity ? `Verified Studios in ${currentCity}` : 'Verified Barber Studios'}
            </h2>
            <p className="text-xs text-slate-400">
              Showing {filteredBarbers.length} {filteredBarbers.length === 1 ? 'barber studio' : 'barber studios'}
              {currentCity && ` in ${currentCity}`}
              {search && ` matching "${search}"`}
            </p>
          </div>

          {(search || selectedSpecialization !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedSpecialization('All');
              }}
              className="text-xs text-amber-400 hover:underline cursor-pointer"
            >
              Reset search
            </button>
          )}
        </div>

        {/* LOCATION PERMISSION REQUIRED OR EMPTY STATE */}
        {locationStatus === 'denied' && !currentCity ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-10 sm:p-14 text-center backdrop-blur-md max-w-2xl mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400 mb-4">
              <MapPin className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Location Access Required</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              We only show barber shops for your current location. Please allow location access or pick your city below.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleRefresh}
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
        ) : filteredBarbers.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/10 text-amber-400 mb-3">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              No barber shops found in {currentCity || 'your area'}
            </h3>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
              Currently, registered studios are active in Ranchi, Argora, and Giridih. New studios in your area will appear automatically.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition cursor-pointer shadow-lg shadow-amber-400/20"
              >
                <RotateCw className={`h-3.5 w-3.5 ${loading || refreshing ? 'animate-spin' : ''}`} />
                <span>{loading || refreshing ? 'Refreshing...' : 'Refresh Studios'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* REAL BARBERS GRID - STRICTLY CURRENT LOCATION */
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredBarbers.map((barber, index) => {
              const barberName = barber.userId?.name || 'Master Barber';
              const barberPhone = barber.userId?.phone || barber.phone || 'Contact on appointment';
              const shopName = barber.shopName || `${barberName}'s Barber Shop`;
              const specializations = normalizeSpecializations(barber.specialization);
              const experience = barber.experience ?? barber.experienceYears ?? 0;
              const telCleanPhone = formatPhoneDigits(barberPhone);

              return (
                <div
                  key={barber._id || index}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-500/10"
                >
                  <div>
                    {/* SHOP IMAGE SLIDER / BANNER */}
                    <div className="relative h-60 w-full overflow-hidden bg-slate-800">
                      <ShopImageSlider images={barber.displayImages} className="h-full w-full" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30 pointer-events-none" />

                      {/* TOP BADGES */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-semibold text-emerald-400 backdrop-blur-md border border-white/10">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          Open Today
                        </span>

                        {barber.computedDistance !== null ? (
                          <span className="flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold text-slate-950 backdrop-blur-md shadow">
                            <MapPin className="h-3 w-3 text-slate-950" />
                            <span>{barber.computedDistance} km away</span>
                          </span>
                        ) : barber.location ? (
                          <span className="flex items-center gap-1 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-semibold text-amber-300 backdrop-blur-md border border-white/10 truncate max-w-[150px]">
                            <MapPin className="h-3 w-3 text-amber-300 shrink-0" />
                            <span className="truncate">{barber.location}</span>
                          </span>
                        ) : null}
                      </div>

                      {/* OVERLAPPING AVATAR */}
                      <div className="absolute -bottom-6 left-6 z-10">
                        <div className="relative">
                          <img
                            src={barber.displayAvatar}
                            alt={barberName}
                            className="h-16 w-16 rounded-2xl border-2 border-amber-400 object-cover shadow-xl bg-slate-950"
                          />
                          <span
                            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold"
                            title="Verified Stylist"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-slate-950" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CARD BODY */}
                    <div className="p-6 pt-10">
                      {/* SHOP NAME & BADGE */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold truncate">
                          {shopName}
                        </p>
                        <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-slate-300">
                          {experience > 0 ? `${experience} Yrs Exp` : 'Verified Studio'}
                        </span>
                      </div>

                      {/* BARBER NAME */}
                      <h3 className="mt-2 text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                        {barberName}
                      </h3>

                      {/* BIO (IF ANY) */}
                      {barber.bio && (
                        <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-2">
                          &ldquo;{barber.bio}&rdquo;
                        </p>
                      )}

                      {/* LOCATION & HOURS INFO */}
                      <div className="mt-5 space-y-2.5 border-y border-white/10 py-4 text-xs text-slate-300">
                        {/* Location */}
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-400" />
                          <span className="font-medium text-white">{barber.location || 'Location upon booking'}</span>
                        </div>

                        {/* Working Hours */}
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{getWorkingHours(barber)}</span>
                        </div>

                        {/* Phone - CLICKABLE TO DIRECT CALL */}
                        {barberPhone && (
                          <button
                            type="button"
                            onClick={(e) => handleDirectCall(e, barberPhone, barberName)}
                            className="flex items-center gap-2 text-left hover:text-amber-300 transition cursor-pointer group/phone"
                            title="Click to call directly"
                          >
                            <Phone className="h-4 w-4 flex-shrink-0 text-amber-400 group-hover/phone:scale-110 transition-transform" />
                            <span className="text-slate-200 group-hover/phone:text-amber-300 font-mono tracking-wide">{barberPhone}</span>
                          </button>
                        )}
                      </div>

                      {/* SPECIALIZATION TAGS */}
                      {specializations.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                            Services Available:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {specializations.map((item) => (
                              <span
                                key={item}
                                className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-2.5 py-1 text-[11px] font-medium text-amber-300 capitalize"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="p-6 pt-0 flex gap-2">
                    {/* DIRECT CALL BUTTON */}
                    {barberPhone && (
                      <a
                        href={telCleanPhone ? `tel:${telCleanPhone}` : '#'}
                        onClick={(e) => handleDirectCall(e, barberPhone, barberName)}
                        className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-xs font-semibold text-amber-400 hover:bg-amber-400 hover:text-slate-950 transition cursor-pointer shadow-sm hover:shadow-amber-400/20 active:scale-95"
                        title={`Direct Call: ${barberPhone}`}
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedBarberModal(barber)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                    >
                      Studio Info
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate('/book-appointment', {
                          state: isValidObjectId(barber._id)
                            ? { selectedBarberId: barber._id }
                            : undefined,
                        })
                      }
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-xs sm:text-sm font-bold text-slate-950 transition duration-200 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/20 active:scale-[0.98] cursor-pointer"
                    >
                      <span>Book at Studio</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* STUDIO INFO MODAL */}
      {selectedBarberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-slate-900 p-6 text-white shadow-2xl">
            <button
              onClick={() => setSelectedBarberModal(null)}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-slate-300 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 border-b border-white/10 pb-5">
              <img
                src={selectedBarberModal.displayAvatar}
                alt={selectedBarberModal.userId?.name}
                className="h-16 w-16 rounded-2xl border-2 border-amber-400 object-cover shadow"
              />
              <div>
                <h3 className="text-xl font-bold">{selectedBarberModal.shopName}</h3>
                <p className="text-xs text-amber-400 font-semibold">
                  Owner / Stylist: {selectedBarberModal.userId?.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                  <span>{selectedBarberModal.location || 'Location on file'}</span>
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300 leading-relaxed">
              {selectedBarberModal.bio && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                    About the Studio:
                  </p>
                  <p>{selectedBarberModal.bio}</p>
                </div>
              )}

              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                  Full Location & Address:
                </p>
                <p className="text-white font-medium">{selectedBarberModal.location || 'Address verified on appointment'}</p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                  Operating Hours:
                </p>
                <p>{getWorkingHours(selectedBarberModal)}</p>
              </div>

              {selectedBarberModal.staffMembers?.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-amber-400" />
                    Stylists & Staff Members ({selectedBarberModal.staffMembers.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBarberModal.staffMembers.map((staff, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300 shadow-sm"
                      >
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                          {staff.charAt(0).toUpperCase()}
                        </span>
                        <span>{staff}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                  Specialties:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {normalizeSpecializations(selectedBarberModal.specialization).map((s) => (
                    <span key={s} className="rounded-md bg-amber-400/10 px-2.5 py-1 text-amber-300 capitalize">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2 sm:gap-3">
              {selectedBarberModal.userId?.phone && (
                <button
                  type="button"
                  onClick={(e) =>
                    handleDirectCall(
                      e,
                      selectedBarberModal.userId?.phone,
                      selectedBarberModal.shopName || selectedBarberModal.userId?.name
                    )
                  }
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs font-bold text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition cursor-pointer"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedBarberModal(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = selectedBarberModal;
                  setSelectedBarberModal(null);
                  navigate('/book-appointment', {
                    state: isValidObjectId(target._id)
                      ? { selectedBarberId: target._id }
                      : undefined,
                  });
                }}
                className="flex-1 rounded-xl bg-amber-400 py-3 text-xs font-bold text-slate-950 hover:bg-amber-300 transition cursor-pointer"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING DIRECT CALL TOAST FEEDBACK */}
      {callingBarber && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-amber-400/40 bg-slate-900/95 p-4 text-xs sm:text-sm text-white shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="h-9 w-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
            <Phone className="h-4 w-4 animate-bounce" />
          </div>
          <div>
            <p className="font-bold text-white">Calling {callingBarber.name}...</p>
            <p className="text-amber-300 font-mono text-xs">{callingBarber.phone} (Copied to clipboard)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarbersPage;
