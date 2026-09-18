import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 w-full overflow-x-hidden">
      <Navbar />
      <main className="page-animate flex-1 w-full pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default AppLayout;
