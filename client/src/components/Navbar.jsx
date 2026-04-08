import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/barbers', label: 'Barbers' },
  { to: '/help', label: 'Help' },
];

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
    isActive
      ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
      : 'text-slate-300 hover:bg-white/8 hover:text-white'
  }`;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showDashboard = Boolean(user) && location.pathname !== '/dashboard';

  return (
    <nav className="nav-animate sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 text-white backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.03] px-4 py-3 shadow-xl shadow-black/10">
          <button
            onClick={() => navigate('/')}
            className="flex min-w-0 items-center gap-3 text-left transition-all duration-300 hover:-translate-y-0.5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-300 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20">
              BS
            </span>
            <span className="min-w-0">
              <p className="truncate text-[10px] uppercase tracking-[0.38em] text-amber-400 sm:text-[11px]">
                Premium Barber Shop
              </p>
              <h1 className="truncate text-base font-semibold text-white sm:text-lg">
                Modern Grooming Studio
              </h1>
            </span>
          </button>

          <div className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {showDashboard && (
              <button
                onClick={() => navigate('/dashboard')}
                className="rounded-full border border-amber-300/30 px-4 py-2.5 text-sm font-medium text-amber-200 transition-all duration-300 hover:bg-amber-400/10"
              >
                Dashboard
              </button>
            )}

            {user ? (
              <>
                <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 xl:inline-flex">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="theme-primary-btn px-5 py-2.5 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="theme-secondary-btn px-4 py-2.5 text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="theme-primary-btn px-5 py-2.5 text-sm"
                >
                  Register
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-300 hover:border-amber-300/40 hover:bg-white/10 md:hidden"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  isMenuOpen ? 'top-[7px] rotate-45' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  isMenuOpen ? 'top-[7px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 md:hidden ${
            isMenuOpen ? 'max-h-[640px] pt-4 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-slate-900/95 p-4 shadow-2xl shadow-black/30">
            <div className="grid gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {showDashboard && (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full rounded-2xl border border-amber-300/30 px-4 py-3 text-left text-sm font-medium text-amber-200 transition hover:bg-amber-400/10"
              >
                Dashboard
              </button>
            )}

            {user ? (
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  Signed in as {user.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="theme-primary-btn w-full text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid gap-3 border-t border-white/10 pt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="theme-secondary-btn w-full text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="theme-primary-btn w-full text-sm"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
