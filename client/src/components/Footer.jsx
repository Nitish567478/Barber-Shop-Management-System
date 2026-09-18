import React from "react";
import { Link } from "react-router-dom";

/* --- Sleek SVG Icons --- */
const MapPinIcon = () => (
  <svg
    className="h-5 w-5 shrink-0 text-amber-400 transition-transform duration-300 group-hover:scale-110"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const PhoneIcon = () => (
  <svg
    className="h-5 w-5 shrink-0 text-amber-400 transition-transform duration-300 group-hover:scale-110"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const MailIcon = () => (
  <svg
    className="h-5 w-5 shrink-0 text-amber-400 transition-transform duration-300 group-hover:scale-110"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="h-5 w-5 shrink-0 text-amber-400 transition-transform duration-300 group-hover:scale-110"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const SocialBtn = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-all duration-300 hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-400 hover:-translate-y-0.5"
  >
    {children}
  </a>
);

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-animate relative border-t border-white/10 bg-slate-950 text-slate-300">
      {/* Accent top line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      {/* TOP SECTION: 4-Column Grid */}
      <div className="mx-auto grid w-full max-w-[1720px] gap-10 px-4 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-12 xl:px-16">
        {/* 1. BRAND */}
        <div className="max-w-xl">
          {/* Top Label */}
          <p className="text-xs uppercase tracking-[0.45em] text-amber-400">
            Barber Shop
          </p>

          {/* Logo */}
          <div className="mt-4">
            <img
              src="https://i.ibb.co/0yYptF9d/website-logo.png"
              alt="Premium Barber Shop Logo"
              className="h-[60px] w-auto rounded-xl border border-amber-400/30 object-contain shadow-md transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Heading */}
          <h2 className="mt-5 text-2xl sm:text-3xl font-semibold leading-tight text-white">
            Modern Grooming Studio
          </h2>

          {/* Description */}
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Professional haircuts, beard styling, premium grooming and easy online booking for modern customers.
          </p>

          {/* Social Icons */}
          <div className="mt-5 flex items-center gap-3">
            <SocialBtn href="https://instagram.com" label="Instagram">
              <InstagramIcon />
            </SocialBtn>
            <SocialBtn href="https://facebook.com" label="Facebook">
              <FacebookIcon />
            </SocialBtn>
            <SocialBtn href="https://twitter.com" label="Twitter / X">
              <TwitterIcon />
            </SocialBtn>
            <SocialBtn href="https://wa.me/919934630687" label="WhatsApp">
              <WhatsAppIcon />
            </SocialBtn>
          </div>
        </div>

        {/* 2. QUICK LINKS */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
            Quick Links
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm">
            {[
              { to: "/", label: "Home" },
              { to: "/services", label: "Services" },
              { to: "/barbers", label: "Barbers" },
              { to: "/about", label: "About" },
              { to: "/help", label: "Help & Support" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group flex items-center gap-2 text-slate-400 transition-all duration-300 hover:translate-x-1 hover:text-amber-400"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400/40 transition-all duration-300 group-hover:bg-amber-400 group-hover:scale-125" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* 3. LEGAL LINKS */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
            Legal
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm">
            {[
              { to: "/terms-conditions", label: "Terms & Conditions" },
              { to: "/privacy-policy", label: "Privacy Policy" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group flex items-center gap-2 text-slate-400 transition-all duration-300 hover:translate-x-1 hover:text-amber-400"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400/40 transition-all duration-300 group-hover:bg-amber-400 group-hover:scale-125" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* 4. CONTACT */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
            Contact Us
          </h3>

          <div className="mt-5 space-y-3.5 text-sm text-slate-400">
            <a
              href="https://maps.google.com/?q=Ranchi,Jharkhand,India"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 transition-colors duration-300 hover:text-amber-400"
            >
              <MapPinIcon />
              <span className="leading-relaxed">Ranchi, Jharkhand, India</span>
            </a>

            <a
              href="tel:+919934630687"
              className="group flex items-center gap-3 transition-colors duration-300 hover:text-amber-400"
            >
              <PhoneIcon />
              <span>+91 9934630687</span>
            </a>

            <a
              href="mailto:support@barbershop.com"
              className="group flex items-center gap-3 transition-colors duration-300 hover:text-amber-400"
            >
              <MailIcon />
              <span>support@barbershop.com</span>
            </a>

            <div className="group flex items-center gap-3 text-slate-400">
              <ClockIcon />
              <span>Open Daily: 9 AM – 10 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT BAR */}
      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-slate-500">
        <div className="mx-auto flex max-w-[1720px] flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-8 lg:px-12 xl:px-16">
          <p>© {year} Barber Shop Management System. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open for bookings online 24/7</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;