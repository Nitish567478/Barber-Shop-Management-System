import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Scissors,
  Store,
  Calendar,
  CalendarCheck,
  FileText,
  HelpCircle,
  Phone,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/barbers", label: "Barbers" },
  { to: "/help", label: "Help" },
];

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
    isActive
      ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`;

function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Close mobile drawer automatically on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setIsMobileDrawerOpen(false);
    navigate("/");
  };

  const showDashboard = Boolean(user) && pathname !== "/dashboard";

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP WEBSITE NAVBAR (100% ORIGINAL - ZERO CHANGES FOR WEBSITE)      */}
      {/* ========================================================================= */}
      <nav className="hidden md:block sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 text-white backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[1720px] px-4 py-3 sm:px-6 lg:px-8">
          {/* MAIN BAR */}
          <div className="relative flex items-center justify-between gap-4 rounded-[1.7rem] border border-white/10 bg-white/[0.03] px-4 py-3 shadow-xl shadow-black/20">
            {/* LOGO */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 text-left transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Logo */}
              <img
                src="https://i.ibb.co/0yYptF9d/website-logo.png"
                alt="Premium Barber Shop Logo"
                className="h-[50px] w-auto object-contain rounded-xl border border-amber-400/30 shadow-md transition-all duration-300 hover:shadow-amber-500/40 hover:scale-105"
              />

              {/* Text */}
              <span className="min-w-0">
                <p className="truncate text-[10px] uppercase tracking-[0.35em] text-amber-400 sm:text-[11px]">
                  Premium Barber Shop
                </p>
                <h1 className="truncate text-base font-semibold text-white sm:text-lg">
                  Modern Grooming Studio
                </h1>
              </span>
            </button>

            {/* DESKTOP LINKS */}
            <div className="flex items-center gap-2">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* RIGHT SIDE DESKTOP */}
            <div className="flex items-center gap-2">
              {showDashboard && (
                <button
                  onClick={() => navigate("/dashboard")}
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
                    onClick={() => navigate("/login")}
                    className="theme-secondary-btn px-4 py-2.5 text-sm"
                  >
                    Login
                  </button>

                  <button
                    onClick={() => navigate("/register")}
                    className="theme-primary-btn px-5 py-2.5 text-sm"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. MOBILE APP TOP NAVBAR (EXCLUSIVE FOR MOBILE APP / MOBILE SCREENS)     */}
      {/* ========================================================================= */}
      <header className="block md:hidden sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
        <div className="flex items-center justify-between px-3.5 py-2.5">
          {/* Mobile Logo & Title */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 text-left active:scale-95 transition-transform"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-400/30 bg-slate-900 shadow-md shadow-amber-500/10">
              <img
                src="https://i.ibb.co/0yYptF9d/website-logo.png"
                alt="Logo"
                className="h-full w-full object-contain p-0.5"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-extrabold tracking-tight text-white">
                  BarberShop
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[8px] font-bold text-emerald-400">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="truncate text-[10px] text-amber-400 font-medium">
                Modern Grooming Studio
              </p>
            </div>
          </button>

          {/* Right Mobile Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Direct Call Button */}
            <a
              href="tel:+919934630687"
              title="Call Helpline"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-sm active:scale-90"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>

            {/* Quick User Avatar or Login */}
            {user ? (
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/20 text-amber-300 text-xs font-bold active:scale-90"
                title="My Dashboard"
              >
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="h-full w-full rounded-xl object-cover" />
                ) : (
                  user.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex items-center justify-center rounded-xl bg-amber-400 px-2.5 py-1.5 text-[10px] font-bold text-slate-950 shadow-sm active:scale-95"
              >
                Login
              </button>
            )}

            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
              aria-label="Open navigation menu"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition active:scale-90"
            >
              {isMobileDrawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MOBILE SLIDE-OVER DRAWER SHEET (MOBILE ONLY)                           */}
      {/* ========================================================================= */}
      <div
        className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 md:hidden ${
          isMobileDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col border-l border-white/10 bg-slate-950/98 shadow-2xl shadow-black backdrop-blur-2xl transition-transform duration-300 ease-out md:hidden ${
          isMobileDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">BarberShop App</p>
              <p className="text-[10px] text-slate-400">Mobile Navigation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Card in Drawer */}
        <div className="p-4 border-b border-white/10">
          {user ? (
            <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 p-3.5 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/20 text-sm font-bold text-amber-300 overflow-hidden">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{user.name}</p>
                  <p className="truncate text-[11px] text-slate-400">{user.email}</p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
                    {user.role === "admin" ? "System Admin" : user.role === "barber" ? "Barber Partner" : "Valued Customer"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-center">
              <p className="text-xs font-semibold text-white">Welcome to BarberShop</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Sign in to book & manage grooming appointments</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    navigate("/login");
                  }}
                  className="flex-1 rounded-xl bg-amber-400 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-400/20"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    navigate("/register");
                  }}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Explore</p>

          <NavLink
            to="/"
            onClick={() => setIsMobileDrawerOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                isActive ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Home className="h-4 w-4" />
            <span className="flex-1">Home</span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </NavLink>

          <NavLink
            to="/services"
            onClick={() => setIsMobileDrawerOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                isActive ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Scissors className="h-4 w-4" />
            <span className="flex-1">Services & Packages</span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </NavLink>

          <NavLink
            to="/barbers"
            onClick={() => setIsMobileDrawerOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                isActive ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Store className="h-4 w-4" />
            <span className="flex-1">Barbers & Salons</span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </NavLink>

          <NavLink
            to="/book-appointment"
            onClick={() => setIsMobileDrawerOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                isActive ? "bg-amber-400 text-slate-950 font-bold" : "text-amber-300 hover:bg-amber-400/10"
              }`
            }
          >
            <Calendar className="h-4 w-4 text-amber-400" />
            <span className="flex-1 font-semibold">Book Appointment</span>
            <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-300">Quick</span>
          </NavLink>

          {user && (
            <>
              <div className="pt-3">
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">My Account</p>
              </div>

              <NavLink
                to="/dashboard"
                onClick={() => setIsMobileDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="flex-1">Role Dashboard</span>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </NavLink>

              <NavLink
                to="/my-appointments"
                onClick={() => setIsMobileDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <CalendarCheck className="h-4 w-4" />
                <span className="flex-1">My Appointments</span>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </NavLink>

              <NavLink
                to="/my-invoices"
                onClick={() => setIsMobileDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <FileText className="h-4 w-4" />
                <span className="flex-1">Invoices & Receipts</span>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </NavLink>

              <NavLink
                to="/profile"
                onClick={() => setIsMobileDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <User className="h-4 w-4" />
                <span className="flex-1">Profile & Settings</span>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </NavLink>
            </>
          )}

          <div className="pt-3">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Support & Info</p>
          </div>

          <NavLink
            to="/help"
            onClick={() => setIsMobileDrawerOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                isActive ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <HelpCircle className="h-4 w-4" />
            <span className="flex-1">Help & FAQs</span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </NavLink>

          <a
            href="tel:+919934630687"
            className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/10 transition"
          >
            <Phone className="h-4 w-4 text-amber-400" />
            <span className="flex-1">Call Helpline (+91 9934630687)</span>
          </a>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-white/10 p-4 bg-slate-950">
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  navigate("/login");
                }}
                className="flex-1 rounded-xl bg-amber-400 py-2.5 text-xs font-bold text-slate-950"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  navigate("/register");
                }}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-white"
              >
                Register
              </button>
            </div>
          )}

          <p className="mt-3 text-center text-[10px] text-slate-500">
            BarberShop Studio • Native Mobile App Edition
          </p>
        </div>
      </aside>
    </>
  );
}

export default Navbar;