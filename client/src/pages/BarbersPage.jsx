import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { barbersAPI } from '../services/api';
import { fallbackBarbers } from '../data/featuredBarbers';
import { isValidObjectId } from '../utils/objectId';


import BarberShopLoader from "../components/BarberShopLoader";

const barberVisuals = [
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=1200&q=80',
];

const normalizeSpecializations = (specialization) => {
  if (Array.isArray(specialization)) {
    return specialization.filter(Boolean);
  }

  if (typeof specialization === 'string' && specialization.trim()) {
    return [specialization.trim()];
  }

  return [];
};

const getExperience = (barber) => barber.experience ?? barber.experienceYears ?? 0;
const getWorkingHours = (barber) => {
  if (!barber.openingTime || !barber.closingTime) {
    return 'Hours not added yet';
  }

  const convertTo12Hour = (time) => {
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';

    hour = hour % 12 || 12;

    return `${hour}:${minutes} ${ampm}`;
  };

  return `${convertTo12Hour(barber.openingTime)} - ${convertTo12Hour(barber.closingTime)}`;
};

const BarbersPage = () => {
  const navigate = useNavigate();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setLoading(true);
        const response = await barbersAPI.getAll();
        setBarbers(response.data.barbers || []);
      } catch (err) {
        setError('Failed to load barbers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  const displayedBarbers = error ? fallbackBarbers : barbers;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-amber-400"></div>
          <p className="mt-4 text-sm uppercase tracking-[0.35em] text-slate-300">
            <BarberShopLoader />
            Loading barbers
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page">
      <main className="theme-shell">
        <div className="theme-hero mb-8">
          <p className="theme-subtitle">Our Barbers</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Meet our grooming professionals</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Explore barber profiles, signature specialties, and studio details before you book.
          </p>
        </div>

        {error && <div className="alert alert-error mb-6 border border-red-400/20 bg-red-500/10 text-red-200">{error}</div>}

        {displayedBarbers.length === 0 ? (
          <div className="theme-card text-center py-12">
            <p className="text-slate-400 text-lg">No barbers available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedBarbers.map((barber, index) => {
              const specializations = normalizeSpecializations(barber.specialization);
              const experience = getExperience(barber);
              const cardImage = barber.shopImage || barberVisuals[index % barberVisuals.length];

              return (
                <div
                  key={barber._id}
                  className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-amber-400/40"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={cardImage}
                      alt={barber.shopName || barber.userId?.name || 'Barber'}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = barberVisuals[index % barberVisuals.length];
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-950">
                        Verified stylist
                      </span>
                    </div>
                  </div>
                  <div className="p-7">
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-300">
                      {barber.shopName || 'Barber studio'}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      {barber.userId?.name || 'Barber'}
                    </h2>

                    <div className="mt-4 space-y-3 border-y border-white/10 py-4">
                      <div>
                        <p className="text-slate-400 text-sm">Contact</p>
                        <p className="text-slate-100">{barber.userId?.phone || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="text-slate-400 text-sm">Experience</p>
                        <p className="text-slate-100 font-semibold">{experience} years</p>
                      </div>

                      <div>
                        <p className="text-slate-400 text-sm">Shop Hours</p>
                        <p className="text-slate-100">{getWorkingHours(barber)}</p>
                      </div>

                      {specializations.length > 0 && (
                        <div>
                          <p className="text-slate-400 text-sm">Specialization</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {specializations.map((item) => (
                              <span key={item} className="rounded-full bg-white/5 px-3 py-1 text-xs text-amber-300">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {barber.location && (
                        <div>
                          <p className="text-slate-400 text-sm">Location</p>
                          <p className="text-slate-100">{barber.location}</p>
                        </div>
                      )}

                      {barber.isActive !== false && (
                        <div>
                          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                            Available
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() =>
                          navigate('/book-appointment', {
                            state: isValidObjectId(barber._id)
                              ? { selectedBarberId: barber._id }
                              : undefined,
                          })
                        }
                        className="theme-primary-btn w-full"
                      >
                        Book with {barber.userId?.name?.split(' ')[0] || 'Barber'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default BarbersPage;
