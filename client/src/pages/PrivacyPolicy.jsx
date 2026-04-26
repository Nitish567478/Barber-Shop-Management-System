import React from "react";
import BarberShopLoader from "../components/BarberShopLoader";

const PrivacyPolicy = ({loading}) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BarberShopLoader />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-100 to-white py-24">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.45em] text-blue-600">
            Data Protection
          </p>

          <h1 className="mt-5 text-4xl font-bold md:text-5xl lg:text-6xl">
            Privacy Policy
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Your privacy is important to us. This Privacy Policy explains how
            Barber Shop collects, uses, stores, and protects your personal
            information when you use our website or services.
          </p>

          <p className="mt-6 text-sm text-slate-500">
            Last Updated: January 2026
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-10">

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">
              1. Information We Collect
            </h2>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600 leading-8">
              <li>Full name, email address, and phone number</li>
              <li>Account login credentials</li>
              <li>Appointment and booking history</li>
              <li>Payment references and invoices</li>
              <li>Device, browser, and IP information</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">
              2. How We Use Your Information
            </h2>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600 leading-8">
              <li>Manage appointments and bookings</li>
              <li>Send confirmations and reminders</li>
              <li>Provide customer support</li>
              <li>Improve website experience</li>
              <li>Prevent fraud or misuse</li>
              <li>Meet legal obligations</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">
              3. Cookies & Tracking
            </h2>

            <p className="mt-4 text-slate-600 leading-8">
              We may use cookies and similar technologies for authentication,
              remembering preferences, analytics, and improving site
              performance.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">
              4. Data Sharing
            </h2>

            <p className="mt-4 text-slate-600 leading-8">
              We do not sell your personal data. Limited information may be
              shared with trusted third parties such as payment gateways,
              hosting providers, messaging services, or authorities when
              legally required.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">
              5. Data Security
            </h2>

            <p className="mt-4 text-slate-600 leading-8">
              We implement reasonable technical and organizational safeguards
              to protect your personal information against unauthorized access,
              misuse, or disclosure.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">
              6. Data Retention
            </h2>

            <p className="mt-4 text-slate-600 leading-8">
              Your information is retained only as long as necessary for
              operational, legal, accounting, or security purposes.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">
              7. Your Rights
            </h2>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600 leading-8">
              <li>Access your personal information</li>
              <li>Request corrections</li>
              <li>Request deletion where permitted</li>
              <li>Opt out of promotional messages</li>
              <li>Request account closure</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">
              8. Third-Party Links
            </h2>

            <p className="mt-4 text-slate-600 leading-8">
              Our website may contain links to third-party websites. We are not
              responsible for their privacy practices or content.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">
              9. Policy Updates
            </h2>

            <p className="mt-4 text-slate-600 leading-8">
              We may revise this Privacy Policy from time to time. Updated
              versions will be posted on this page with a new effective date.
            </p>
          </div>

          {/* Contact */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              10. Contact Us
            </h2>

            <p className="mt-4 text-slate-600 leading-8">
              If you have any questions regarding this Privacy Policy or your
              personal data, please contact us.
            </p>

            <div className="mt-5 space-y-2 text-slate-700">
              <p>Email: privacy@barbershop.com</p>
              <p>Phone: +91 9934630687</p>
              <p>Location: Ranchi, India</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;