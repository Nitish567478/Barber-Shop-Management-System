import React from "react";
import BarberShopLoader from "../components/BarberShopLoader";

const TermsConditions = ({loading}) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BarberShopLoader />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Header */}
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.45em] text-amber-400">
            Barber Shop
          </p>

          <h1 className="mt-4 text-4xl font-bold md:text-5xl">
            Terms & Conditions
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Please read these Terms & Conditions carefully before using our
            website, creating an account, booking appointments, or using any
            services offered by Barber Shop.
          </p>

          <p className="mt-6 text-sm text-slate-400">
            Effective Date: January 2026
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-12 leading-8">

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              1. Acceptance of Terms
            </h2>
            <p className="mt-4 text-slate-600">
              By accessing our platform, you agree to comply with these Terms &
              Conditions, our Privacy Policy, and applicable legal requirements.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              2. Services Provided
            </h2>
            <p className="mt-4 text-slate-600">
              We offer professional barber and grooming services including
              haircuts, beard trimming, shaving, facials, skincare, and online
              booking management.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              3. User Accounts
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600">
              <li>You must provide accurate personal information.</li>
              <li>You are responsible for your login credentials.</li>
              <li>Unauthorized access must be reported immediately.</li>
              <li>Accounts may be suspended for misuse or fraud.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              4. Appointment Bookings
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600">
              <li>Bookings are subject to time-slot availability.</li>
              <li>Confirmation may require payment.</li>
              <li>Late arrivals may shorten appointment duration.</li>
              <li>Repeated no-shows may restrict future bookings.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              5. Pricing & Payments
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600">
              <li>All prices are listed in applicable currency.</li>
              <li>Prices may change without prior notice.</li>
              <li>Taxes or service charges may apply.</li>
              <li>Failed payments can cancel bookings automatically.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              6. Cancellation & Refunds
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600">
              <li>Refund eligibility depends on cancellation timing.</li>
              <li>Late cancellations may be partially refundable.</li>
              <li>No-show bookings may be non-refundable.</li>
              <li>Approved refunds are processed in standard timelines.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              7. Customer Conduct
            </h2>
            <p className="mt-4 text-slate-600">
              We reserve the right to deny service for abusive, threatening,
              unsafe, intoxicated, or disruptive behavior.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              8. Health & Safety
            </h2>
            <p className="mt-4 text-slate-600">
              Customers must disclose allergies, skin conditions, infections,
              or medical concerns before receiving treatment.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              9. Intellectual Property
            </h2>
            <p className="mt-4 text-slate-600">
              All trademarks, logos, website content, designs, and brand assets
              remain the exclusive property of Barber Shop.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              10. Promotions & Offers
            </h2>
            <p className="mt-4 text-slate-600">
              Promotional discounts, loyalty rewards, and special offers may be
              modified or withdrawn without prior notice.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              11. Limitation of Liability
            </h2>
            <p className="mt-4 text-slate-600">
              Barber Shop shall not be liable for indirect damages, delays,
              technical issues, or dissatisfaction based on personal style
              preferences.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              12. Force Majeure
            </h2>
            <p className="mt-4 text-slate-600">
              We are not responsible for delays caused by events beyond our
              control such as natural disasters, outages, strikes, or emergencies.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              13. Governing Law
            </h2>
            <p className="mt-4 text-slate-600">
              These Terms & Conditions are governed by the laws of India.
              Any disputes shall fall under Ranchi jurisdiction.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              14. Changes to Terms
            </h2>
            <p className="mt-4 text-slate-600">
              We may update these Terms & Conditions periodically. Revised
              versions will be published on this page.
            </p>
          </div>

          {/* Contact */}
          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-2xl font-semibold text-slate-950">
              15. Contact Information
            </h2>

            <p className="mt-4 text-slate-600">
              For any questions regarding these Terms & Conditions, please
              contact us:
            </p>

            <div className="mt-5 space-y-2 text-slate-700">
              <p>Email: support@barbershop.com</p>
              <p>Phone: +91 9934630687</p>
              <p>Location: Ranchi, India</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default TermsConditions;