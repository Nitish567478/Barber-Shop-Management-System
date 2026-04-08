import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { barbersAPI, servicesAPI } from '../services/api';
import { fallbackServices } from '../data/featuredServices';
import { fallbackBarbers } from '../data/featuredBarbers';
import { isValidObjectId } from '../utils/objectId';

const heroImage =
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80';
const interiorImage =
  'https://images.unsplash.com/photo-1512690459411-b0fd1c86b8c8?auto=format&fit=crop&w=1000&q=80';
const groomingImage =
  'https://images.unsplash.com/photo-1503951458645-643d53bfd90f?auto=format&fit=crop&w=1000&q=80';
const serviceGallery = [
  {
    image:
      'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1000&q=80',
    detail: 'Classic cut with clean neckline finishing',
    tag: 'Classic trim',
  },
  {
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=80',
    detail: 'Beard shaping with hot towel comfort',
    tag: 'Beard sculpt',
  },
  {
    image:
      'https://images.unsplash.com/photo-1593702288056-fb0563d3e0db?auto=format&fit=crop&w=1000&q=80',
    detail: 'Fade styling for sharp everyday looks',
    tag: 'Fade styling',
  },
  {
    image:
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1000&q=80',
    detail: 'Premium grooming session with detailing',
    tag: 'Full grooming',
  },
  {
    image:
      'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=1000&q=80',
    detail: 'Hair wash and texture reset experience',
    tag: 'Wash & reset',
  },
  {
    image:
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1000&q=80',
    detail: 'Modern styling finish for events and office',
    tag: 'Final styling',
  },
  {
    image:
      'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1000&q=80',
    detail: 'Detailed line work for premium edge control',
    tag: 'Line detailing',
  },
  {
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80',
    detail: 'Occasion-ready styling with polished finishing touches',
    tag: 'Event ready',
  },
];
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
            Loading Homepage
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-amber-400">Services</p>
            <h3 className="mt-3 text-3xl font-semibold text-white">Signature grooming options</h3>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="text-sm font-medium text-amber-300 transition hover:text-amber-200"
          >
            View all services
          </button>
        </div>

        {error && <div className="alert alert-error border border-red-400/20 bg-red-500/10 text-red-200">{error}</div>}

        {displayedServices.length > 0 ? (
          <>
            <div className="mb-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900">
                <img
                  src={serviceGallery[0].image}
                  alt="Premium haircut service"
                  className="h-[360px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/65 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Featured Service Experience</p>
                  <h4 className="mt-3 max-w-xl text-3xl font-semibold text-white">
                    Premium cuts, beard detailing, and refined finishing in one polished visit.
                  </h4>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                    Every appointment is planned with consultation, precision work, and a professional finish so the result looks sharp both in person and on camera.
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                {serviceGallery.slice(1, 4).map((item) => (
                  <div
                    key={item.image}
                    className="flex overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5"
                  >
                    <img
                      src={item.image}
                      alt={item.tag}
                      className="h-32 w-32 object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-center p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-amber-300">{item.tag}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {displayedServices.map((service, index) => (
                <div
                  key={service._id}
                  className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-amber-400/40"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={serviceGallery[index % serviceGallery.length].image}
                      alt={service.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                      <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        {serviceGallery[index % serviceGallery.length].tag}
                      </p>
                      <p className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-950">
                        {service.duration} mins
                      </p>
                    </div>
                  </div>
                  <div className="p-7">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-lg font-semibold text-amber-300">
                      {service.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <h4 className="text-2xl font-semibold text-white">{service.name}</h4>
                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-300">
                      {service.description || 'Premium grooming service delivered with care and precision.'}
                    </p>
                    <p className="mt-4 text-sm font-medium text-amber-200">
                      {serviceGallery[index % serviceGallery.length].detail}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
                      <div className="rounded-2xl bg-white/5 p-3">
                        <p className="text-slate-400">Included</p>
                        <p className="mt-1 font-medium text-white">Consultation</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-3">
                        <p className="text-slate-400">Finish</p>
                        <p className="mt-1 font-medium text-white">Professional styling</p>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                      <span className="text-2xl font-semibold text-amber-300">${service.price}</span>
                      <button
                        onClick={handleBookAppointment}
                        className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-amber-300 hover:text-amber-200"
                      >
                        Book now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </>
        ) : (
          <p className="text-center text-slate-400">No services available</p>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-amber-400">Barbers</p>
            <h3 className="mt-3 text-3xl font-semibold text-white">Meet the team behind the craft</h3>
          </div>
          <button
            onClick={() => navigate('/barbers')}
            className="text-sm font-medium text-amber-300 transition hover:text-amber-200"
          >
            See all barbers
          </button>
        </div>

        {displayedBarbers.length > 0 ? (
          <>
            <div className="mb-8">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8">
                <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Our Barbers</p>
                <h4 className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                  Skilled professionals focused on precision cuts, clean grooming, and client comfort.
                </h4>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Our team is selected for consistency, communication, and modern barbering standards so every appointment feels polished from consultation to final finish.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/5 p-4 text-center">
                    <p className="text-2xl font-semibold text-white">{displayedBarbers.length}+</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Barbers</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 text-center">
                    <p className="text-2xl font-semibold text-white">5-star</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Service flow</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 text-center">
                    <p className="text-2xl font-semibold text-white">Daily</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Availability</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300">Consultation-first service before every cut</div>
                  <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300">Sharp beard shaping with premium finishing control</div>
                  <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300">Professional styling suited for office, events, and daily wear</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {displayedBarbers.map((barber, index) => (
                <div
                  key={barber._id}
                  className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90"
                >
                  <div className="relative h-64 bg-gradient-to-br from-amber-300/30 via-slate-700 to-slate-950 sm:h-56">
                    <img
                      src={barberGallery[index % barberGallery.length].image}
                      alt={barber.userId?.name || 'Barber'}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        {barberGallery[index % barberGallery.length].focus}
                      </span>
                      <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-950">
                        Verified stylist
                      </span>
                    </div>
                  </div>
                  <div className="p-5 sm:p-7">
                    <h4 className="text-xl font-semibold text-white sm:text-2xl">
                      {barber.userId?.name || 'Barber'}
                    </h4>
                    <p className="mt-2 text-sm text-slate-400">
                      {barber.userId?.phone || 'Contact details available after booking'}
                    </p>
                    <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="rounded-full bg-amber-400/15 px-3 py-1 text-sm text-amber-300">
                        {getBarberExperience(barber)} years experience
                      </span>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                        Flexible slots
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                      {barberGallery[index % barberGallery.length].detail}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                      Specialization: {getBarberSpecialization(barber)}
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-slate-300 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/5 p-3">
                        <p className="text-slate-400">Client focus</p>
                        <p className="mt-1 font-medium text-white">Consultation first</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-3">
                        <p className="text-slate-400">Signature</p>
                        <p className="mt-1 font-medium text-white">{barberGallery[index % barberGallery.length].focus}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-slate-400">Available for booking</span>
                      <button
                        onClick={handleBookAppointment}
                        className="theme-secondary-btn w-full sm:w-auto"
                      >
                        Book with barber
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-slate-400">No barbers available</p>
        )}
      </section>

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
