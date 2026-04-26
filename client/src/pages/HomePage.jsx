import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { barbersAPI, servicesAPI } from '../services/api';
import { fallbackServices } from '../data/featuredServices';
import { fallbackBarbers } from '../data/featuredBarbers';
import { isValidObjectId } from '../utils/objectId';

import BarberShopLoader from "../components/BarberShopLoader";

const heroImage =
  'https://i.ibb.co/rfkJrsqc/handsome-man-cutting-beard-barber-shop-salon.jpg';
const interiorImage =
  'https://img.freepik.com/free-photo/hairstylist-washing-client-s-hair-salon_23-2148242852.jpg?ga=GA1.1.1764038526.1777014227&semt=ais_hybrid&w=740&q=80';
const groomingImage =
  'https://i.ibb.co/4ntvPFbc/stylish-man-sitting-barbershop.jpg';

  
const barberGallery = [
  {
    image:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1000&q=80',
    detail: 'Known for fade precision and beard balance',
    focus: 'Fade specialist',
  },
  {
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
    detail: 'Strong in classic cuts and executive grooming',
    focus: 'Classic cuts',
  },
  {
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80',
    detail: 'Focuses on texture styling and modern trends',
    focus: 'Modern trends',
  },
  {
    image:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1000&q=80',
    detail: 'Trusted for client comfort and polished results',
    focus: 'Client comfort',
  },
  {
    image:
      'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=1000&q=80',
    detail: 'Detail-oriented barber for premium finishes',
    focus: 'Detail work',
  },
  {
    image:
      'https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=1000&q=80',
    detail: 'Specializes in grooming routines and shaping',
    focus: 'Grooming care',
  },
  {
    image:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1000&q=80',
    detail: 'Consistent consultation-first approach for tailored styling',
    focus: 'Consultation',
  },
  {
    image:
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=1000&q=80',
    detail: 'Sharp finishing standards suited to premium clientele',
    focus: 'Premium finish',
  },
];

const highlights = [
  { value: '10+', label: 'Premium grooming services' },
  { value: '5-star', label: 'Customer-first experience' },
  { value: '7 days', label: 'Flexible booking availability' },
];

const trustPoints = [
  'Skilled barbers with modern and classic styling expertise',
  'Clean studio environment with a polished customer experience',
  'Simple online booking for haircuts, beard work, and grooming',
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barbersRes, servicesRes] = await Promise.all([
          barbersAPI.getAll(),
          servicesAPI.getAll(),
        ]);

        setBarbers(barbersRes.data.barbers || []);
        setServices(servicesRes.data.services || []);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBookAppointment = () => {
    if (user) {
      navigate('/book-appointment');
      return;
    }

    navigate('/login', { state: { from: '/book-appointment' } });
  };

  const handleDashboard = () => {
    if (user) {
      navigate('/dashboard');
      return;
    }

    navigate('/login');
  };

  const displayedServices = services.length > 0 ? services.slice(0, 6) : fallbackServices;
  const displayedBarbers = barbers.length > 0 ? barbers.slice(0, 6) : fallbackBarbers.slice(0, 6);

  const getBarberExperience = (barber) => barber.experienceYears || barber.experience || 0;
  const getBarberSpecialization = (barber) =>
    Array.isArray(barber.specialization)
      ? barber.specialization.slice(0, 2).join(' • ')
      : barber.specialization || barberGallery[0].focus;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-amber-400"></div>
          <p className="mt-4 text-sm uppercase tracking-[0.35em] text-slate-300">
            <BarberShopLoader /> 
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Landing Page Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-amber-400">
              Precision. Style. Confidence.
            </p>
            <h2 className="max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              A sharper look starts with a better barbershop experience.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              From clean fades to beard detailing, book with skilled professionals in a space
              designed for comfort, consistency, and modern style.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleBookAppointment}
                className="rounded-full bg-amber-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Book an Appointment
              </button>
              <button
                onClick={() => navigate('/services')}
                className="rounded-full border border-white/15 px-6 py-3 text-base font-medium text-white transition hover:border-white/40 hover:bg-white/5"
              >
                Explore Services
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
            <div className="sm:col-span-2 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
              <img
                src={heroImage}
                alt="Professional barber styling a client"
                className="h-[420px] w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900">
              <img
                src={interiorImage}
                alt="Stylish barbershop interior"
                className="h-56 w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900">
              <img
                src={groomingImage}
                alt="Beard grooming close-up"
                className="h-56 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Barber Section */}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {displayedBarbers.length > 0 ? (
          <>
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-amber-400">
                  Our Barbers
                </p>

                <h2 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
                  Meet The Masters
                </h2>

                <p className="mt-4 max-w-2xl text-slate-400 leading-7">
                  Highly trained professionals focused on precision cuts, grooming,
                  style consultation and premium customer experience.
                </p>
              </div>

              <button
                onClick={() => navigate("/barbers")}
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:border-amber-400 hover:text-amber-300"
              >
                View All Barbers
              </button>
            </div>

            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
              {displayedBarbers.map((barber, index) => (
                <div
                  key={barber._id}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 transition duration-300 hover:-translate-y-2 hover:border-amber-400/40 hover:shadow-2xl hover:shadow-black/40"
                >
                  {/* IMAGE */}
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={barberGallery[index % barberGallery.length].image}
                      alt={barber.userId?.name || "Barber"}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />

                    <div className="absolute left-4 top-4">
                      <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-950">
                        Available
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        {barberGallery[index % barberGallery.length].focus}
                      </span>

                      <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-950">
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-semibold text-white">
                          {barber.userId?.name || "Barber"}
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                          {barber.userId?.phone ||
                            "Contact details available after booking"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-amber-400/10 px-3 py-2 text-center">
                        <p className="text-lg font-semibold text-amber-300">
                          {getBarberExperience(barber)}+
                        </p>
                        <p className="text-[10px] uppercase tracking-[2px] text-slate-400">
                          Years
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-7 text-slate-300">
                      {barberGallery[index % barberGallery.length].detail}
                    </p>

                    <div className="mt-5 rounded-2xl bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[3px] text-slate-400">
                        Specialization
                      </p>

                      <p className="mt-2 text-sm font-medium text-white">
                        {getBarberSpecialization(barber)}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white/5 p-4">
                        <p className="text-xs text-slate-400">Client Focus</p>
                        <p className="mt-2 text-sm font-medium text-white">
                          Consultation
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/5 p-4">
                        <p className="text-xs text-slate-400">Slots</p>
                        <p className="mt-2 text-sm font-medium text-white">
                          Flexible
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-5">
                      <button
                        onClick={handleBookAppointment}
                        className="w-full rounded-full bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
                      >
                        Book With Barber
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-lg text-slate-300">No barbers available right now</p>
          </div>
        )}
      </section>

      {/* Why Choose Us Section */}

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-400">Why choose us</p>
          <h3 className="mt-4 text-3xl font-semibold text-white">Professional service with a refined atmosphere</h3>
        </div>
        <div className="grid gap-4">
          {trustPoints.map((point) => (
            <div
              key={point}
              className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 text-slate-300"
            >
              {point}
            </div>
          ))}
        </div>
      </section>


      {/* Booking Slot Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-r from-amber-400 to-orange-300 text-slate-950">
          <div className="grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-900/70">
                Book your slot
              </p>
              <h3 className="mt-4 text-3xl font-semibold sm:text-4xl">
                Upgrade your routine with a barbershop that looks after the details.
              </h3>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-900/80">
                Choose your service, pick your barber, and reserve a time that works for you in
                just a few clicks.
              </p>
            </div>
            <div className="flex items-center lg:justify-end">
              <button
                onClick={handleBookAppointment}
                className="w-full rounded-full bg-slate-950 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-900 sm:w-auto"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;