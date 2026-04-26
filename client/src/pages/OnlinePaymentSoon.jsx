import React from 'react';
import { Link } from 'react-router-dom';
import BarberShopLoader from "../components/BarberShopLoader";


const OnlinePaymentSoon = ({loading}) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BarberShopLoader />
      </div>
    );
  }

  <div className="theme-page">
    <main className="theme-shell max-w-3xl">
      <div className="theme-card py-16 text-center">
        <p className="theme-subtitle">Coming Soon..</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Online payment will be available soon</h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-300">
          Abhi ke liye cash booking available hai. Online payment flow jaldi launch hoga.
        </p>
        <Link to="/book-appointment" className="theme-primary-btn mt-8 inline-flex">
          Back to booking
        </Link>
      </div>
    </main>
  </div>
};

export default OnlinePaymentSoon;
