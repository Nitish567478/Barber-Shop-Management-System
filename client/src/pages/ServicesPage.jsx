import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesAPI } from '../services/api';
import { fallbackServices } from '../data/featuredServices';
import { isValidObjectId } from '../utils/objectId';

const serviceVisuals = [
  {
    image:
      'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1200&q=80',
    tag: 'Classic trim',
    note: 'Sharp neckline, balanced proportions, and a clean everyday finish.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Beard sculpt',
    note: 'Defined beard shaping with symmetry-focused detailing and comfort care.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1593702288056-fb0563d3e0db?auto=format&fit=crop&w=1200&q=80',
    tag: 'Modern fade',
    note: 'Blended fades tailored for clean, confident, and professional styling.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
    tag: 'Premium care',
    note: 'Complete grooming experience designed for consistency and polish.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=1200&q=80',
    tag: 'Wash and style',
    note: 'Refresh, texture reset, and a polished finish for work or events.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Event ready',
    note: 'Refined styling for formal occasions and camera-ready presentation.',
  },
];

const ServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await servicesAPI.getAll();
        setServices(response.data.services || []);
      } catch (err) {
        setError('Failed to load services');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const displayedServices = services.length > 0 ? services : fallbackServices;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-amber-400"></div>
          <p className="mt-4 text-sm uppercase tracking-[0.35em] text-slate-300">Loading services</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase tracking-[0.4em] text-amber-300">Our Services</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Professional grooming services built for sharp daily style and premium care.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
              Explore haircut, beard, styling, and grooming options designed for comfort, precision, and polished results. Each service is planned to give clients a clean finish with dependable standards.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-2xl font-semibold text-white">{displayedServices.length}</p>
                <p className="text-sm text-slate-300">Services available</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-2xl font-semibold text-white">Premium</p>
                <p className="text-sm text-slate-300">Consultation-first approach</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900">
              <img
                src={serviceVisuals[0].image}
                alt="Featured grooming service"
                className="h-64 w-full object-cover"
              />
            </div>
            {serviceVisuals.slice(1, 3).map((item) => (
              <div
                key={item.image}
                className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/90"
              >
                <img
                  src={item.image}
                  alt={item.tag}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-300">{item.tag}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {error && <div className="alert alert-error mb-6 border border-red-400/20 bg-red-500/10 text-red-200">{error}</div>}

        {displayedServices.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 py-12 text-center">
            <p className="text-lg text-slate-400">No services available</p>
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              {serviceVisuals.slice(3, 6).map((item) => (
                <div
                  key={item.image}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-300">{item.tag}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.note}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {displayedServices.map((service, index) => {
                const visual = serviceVisuals[index % serviceVisuals.length];

                return (
                  <div
                    key={service._id}
                    className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 shadow-xl shadow-black/15 transition hover:-translate-y-1 hover:border-amber-400/40"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={visual.image}
                        alt={service.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                          {visual.tag}
                        </span>
                        <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-950">
                          {service.duration} mins
                        </span>
                      </div>
                    </div>

                    <div className="p-7">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-lg font-semibold text-amber-300">
                        {service.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>

                      <h2 className="text-2xl font-semibold text-white">{service.name}</h2>
                      <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-300">
                        {service.description}
                      </p>
                      <p className="mt-4 text-sm font-medium text-amber-200">{visual.note}</p>

                      <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-300">
                        <div className="rounded-2xl bg-white/5 p-3">
                          <p className="text-slate-400">Delivery</p>
                          <p className="mt-1 font-medium text-white">Professional finish</p>
                        </div>
                        <div className="rounded-2xl bg-white/5 p-3">
                          <p className="text-slate-400">Support</p>
                          <p className="mt-1 font-medium text-white">Consultation included</p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Price</p>
                          <p className="text-2xl font-semibold text-amber-300">Rs. {service.price}</p>
                        </div>

                        <button
                          onClick={() =>
                            navigate('/book-appointment', {
                              state: isValidObjectId(service._id)
                                ? { selectedServiceId: service._id }
                                : undefined,
                            })
                          }
                          className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                        >
                          Book This Service
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ServicesPage;
