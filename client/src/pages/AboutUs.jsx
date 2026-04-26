import React from 'react';
import { Link } from 'react-router-dom';
import BarberShopeLoader from "./components/BarberShopeLoader";

if(!loading){
  return <BarberShopeLoader />
}

const AboutUs = () => {
  const stats = [
    { value: '5000+', label: 'Happy Customers' },
    { value: '15+', label: 'Expert Barbers' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '2026', label: 'Founded' },
  ];

  const values = [
    {
      icon: '✂️',
      title: 'Expert Craftsmanship',
      desc: 'Every haircut is delivered with precision, detail, and modern barbering expertise.',
    },
    {
      icon: '🧴',
      title: 'Premium Products',
      desc: 'We use trusted grooming products for hair, beard, and skin care.',
    },
    {
      icon: '⭐',
      title: 'Luxury Experience',
      desc: 'A premium atmosphere built around comfort, style, and confidence.',
    },
    {
      icon: '🤝',
      title: 'Customer First',
      desc: 'Every service starts with consultation and personalized attention.',
    },
  ];

  const timeline = [
    {
      year: '2026',
      title: 'The Beginning',
      desc: 'Started with a fresh vision to redefine premium men’s grooming.',
    },
    {
      year: '2026',
      title: 'Growing Community',
      desc: 'Built trust quickly through consistent quality and service.',
    },
    {
      year: '2026',
      title: 'Premium Standard',
      desc: 'Expanded grooming services with modern styling excellence.',
    },
    {
      year: '2026',
      title: 'Future Forward',
      desc: 'Focused on becoming the most trusted grooming destination.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(251,146,60,0.14),_transparent_30%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.45em] text-amber-400">
                Founded In 2026
              </p>

              <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">
                About
                <span className="block bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Our Studio
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
                A modern barbershop built in 2026 with one mission: deliver
                premium grooming, sharp style, and unmatched customer care.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/barbers">
                  <button className="rounded-full bg-amber-400 px-7 py-4 font-semibold text-slate-950 hover:bg-amber-300">
                    Book Appointment
                  </button>
                </Link>

                <Link to="/services">
                  <button className="rounded-full border border-white/15 px-7 py-4 text-white hover:border-white/40">
                    Explore Services
                  </button>
                </Link>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 sm:col-span-2">
                <img
                  src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80"
                  alt="Barbershop"
                  className="h-[420px] w-full object-cover"
                />
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <p className="text-5xl">👨‍✂️</p>
                <h3 className="mt-4 text-xl font-semibold">Professional Team</h3>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <p className="text-5xl">✨</p>
                <h3 className="mt-4 text-xl font-semibold">Luxury Standard</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <div
              key={index}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-7 text-center"
            >
              <h3 className="text-4xl font-bold text-amber-400">
                {item.value}
              </h3>
              <p className="mt-3 text-sm uppercase tracking-[0.2em] text-slate-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-amber-400">
              Our Story
            </p>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
              New Brand. Big Vision.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Founded in 2026, we launched with a modern concept focused on
              style, service quality, and premium customer experience.
            </p>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Our goal is to become the most trusted destination for grooming,
              haircuts, fades, beard styling, and confidence.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[2rem] bg-white/5 p-8">
              <p className="text-5xl">💈</p>
              <h3 className="mt-4 text-xl font-semibold">Modern Studio</h3>
            </div>

            <div className="rounded-[2rem] bg-white/5 p-8">
              <p className="text-5xl">🔥</p>
              <h3 className="mt-4 text-xl font-semibold">Trend Focused</h3>
            </div>

            <div className="rounded-[2rem] bg-white/5 p-8 sm:col-span-2">
              <p className="text-5xl">🏆</p>
              <h3 className="mt-4 text-xl font-semibold">Premium Future</h3>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-slate-900/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-amber-400">
              Our Mission
            </p>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
              Why Choose Us
            </h2>
          </div>

          <div className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {values.map((item, index) => (
              <div
                key={index}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-8"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-3xl text-slate-950">
                  {item.icon}
                </div>

                <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-gradient-to-r from-amber-400 to-orange-300 px-8 py-14 text-center text-slate-950">
          <h2 className="text-4xl font-bold sm:text-5xl">
            Ready For Your Best Look?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-900/80">
            Book now and experience premium grooming from a fresh modern brand.
          </p>

          <Link to="/barbers">
            <button className="mt-8 rounded-full bg-slate-950 px-8 py-4 font-semibold text-white">
              Book Now
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;