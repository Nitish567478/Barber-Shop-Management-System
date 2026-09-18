import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Scissors, Store, Calendar, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hide bottom navigation on full-screen checkout/payment flow
  if (pathname.startsWith('/payment')) {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isServicesActive = pathname.startsWith('/services');
  const isBarbersActive = pathname.startsWith('/barbers');
  const isBookActive = pathname === '/book-appointment';
  const isAccountActive =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/my-appointments') ||
    pathname.startsWith('/my-invoices') ||
    pathname === '/login' ||
    pathname === '/register';

  const accountPath = user ? '/dashboard' : '/login';

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 block md:hidden border-t border-white/10 bg-slate-950/90 backdrop-blur-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {/* 1. HOME TAB */}
        <NavLink
          to="/"
          className={`group flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95 ${
            isHomeActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Home className={`h-5 w-5 transition-transform duration-200 ${isHomeActive ? 'scale-110' : 'group-hover:scale-105'}`} />
            {isHomeActive && (
              <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            )}
          </div>
          <span className="mt-1 text-[10px] tracking-tight">Home</span>
        </NavLink>

        {/* 2. SERVICES TAB */}
        <NavLink
          to="/services"
          className={`group flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95 ${
            isServicesActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Scissors className={`h-5 w-5 transition-transform duration-200 ${isServicesActive ? 'scale-110' : 'group-hover:scale-105'}`} />
            {isServicesActive && (
              <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            )}
          </div>
          <span className="mt-1 text-[10px] tracking-tight">Services</span>
        </NavLink>

        {/* 3. CENTER HIGHLIGHTED ACTION: BOOK NOW */}
        <div className="relative -top-3.5 flex flex-1 items-center justify-center">
          <button
            type="button"
            onClick={() => navigate('/book-appointment')}
            className={`group relative flex h-13 w-13 items-center justify-center rounded-full border-4 border-slate-950 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 shadow-xl shadow-amber-500/30 transition-all duration-300 active:scale-90 hover:scale-105 ${
              isBookActive ? 'ring-2 ring-amber-400/80 shadow-amber-400/50' : ''
            }`}
            aria-label="Book Appointment Now"
          >
            <Calendar className="h-6 w-6 stroke-[2.5] text-slate-950 transition-transform group-hover:scale-110" />
            <span className="absolute -bottom-5 text-[9px] font-extrabold uppercase tracking-wider text-amber-300">
              Book
            </span>
          </button>
        </div>

        {/* 4. BARBERS / SALONS TAB */}
        <NavLink
          to="/barbers"
          className={`group flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95 ${
            isBarbersActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Store className={`h-5 w-5 transition-transform duration-200 ${isBarbersActive ? 'scale-110' : 'group-hover:scale-105'}`} />
            {isBarbersActive && (
              <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            )}
          </div>
          <span className="mt-1 text-[10px] tracking-tight">Salons</span>
        </NavLink>

        {/* 5. ACCOUNT / PROFILE TAB */}
        <NavLink
          to={accountPath}
          className={`group flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95 ${
            isAccountActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative flex items-center justify-center">
            {user ? (
              user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name || 'User'}
                  className="h-5 w-5 rounded-full object-cover border border-amber-400/50"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 text-[10px] font-bold text-amber-300 border border-amber-400/40">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )
            ) : (
              <User className={`h-5 w-5 transition-transform duration-200 ${isAccountActive ? 'scale-110' : 'group-hover:scale-105'}`} />
            )}
            {isAccountActive && (
              <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            )}
          </div>
          <span className="mt-1 text-[10px] tracking-tight">
            {user ? (user.role === 'barber' ? 'Barber' : user.role === 'admin' ? 'Admin' : 'Account') : 'Login'}
          </span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
