import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-animate border-t border-white/10 bg-slate-950 text-slate-300">
      <div className="stagger-children mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-amber-400">Barber Shop</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Modern Grooming Studio</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Professional grooming, reliable appointments, and a clean modern experience for every customer.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link to="/" className="transition-all duration-300 hover:translate-x-1 hover:text-white">Home</Link>
            <Link to="/services" className="transition-all duration-300 hover:translate-x-1 hover:text-white">Services</Link>
            <Link to="/barbers" className="transition-all duration-300 hover:translate-x-1 hover:text-white">Barbers</Link>
            <Link to="/help" className="transition-all duration-300 hover:translate-x-1 hover:text-white">Help & Support</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Visit Us</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p>Open daily for premium haircuts, beard styling, and grooming services.</p>
            <p>Phone: +92-300-1234567</p>
            <p>Email: support@barbershop.com</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-sm text-slate-500">
        &copy; 2026 Barber Shop. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
