import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-animate border-t border-white/10 bg-slate-950 text-slate-300">
      {/* TOP SECTION */}

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* BRAND */}

        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-amber-400">
            Barber Shop
          </p>

          <h2 className="mt-3 text-2xl font-semibold text-white">
            Modern Grooming Studio
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-400">
            Professional haircuts, beard styling,
            premium grooming and easy online booking
            for modern customers.
          </p>
        </div>

        {/* QUICK LINKS */}

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
            Quick Links
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm">
            <Link
              to="/"
              className="hover:text-white transition"
            >
              Home
            </Link>

            <Link
              to="/services"
              className="hover:text-white transition"
            >
              Services
            </Link>

            <Link
              to="/barbers"
              className="hover:text-white transition"
            >
              Barbers
            </Link>

            <Link
              to="/about"
              className="hover:text-white transition"
            >
              About
            </Link>

            <Link
              to="/help"
              className="hover:text-white transition"
            >
              Help & Support
            </Link>
          </div>
        </div>

        {/* LEGAL LINKS */}

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
            Legal
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm">
            <Link
              to="/terms-conditions"
              className="hover:text-white transition"
            >
              Terms & Conditions
            </Link>

            <Link
              to="/privacy-policy"
              className="hover:text-white transition"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* CONTACT */}

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
            Contact Us
          </h3>

          <div className="mt-5 space-y-3 text-sm text-slate-400">
            <p>
              <a
                href="https://maps.google.com/?q=Ranchi,Jharkhand,India"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                Ranchi, Jharkhand, India
              </a>
            </p>

            <p>
              <a
                href="tel:+919934630687"
                className="transition hover:text-white"
              >
                Phone: +91 9934630687
              </a>
            </p>

            <p>
              <a
                href="mailto:support@barbershop.com"
                className="transition hover:text-white"
              >
                support@barbershop.com
              </a>
            </p>

            <p>
              <a
                href="/contact"
                className="transition hover:text-white"
              >
                Open Daily: 9 AM - 10 PM
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-slate-500">
        © {year} Barber Shop Management System.
        All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;