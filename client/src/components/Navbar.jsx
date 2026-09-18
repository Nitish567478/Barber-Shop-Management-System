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
  `rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
    isActive
      ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 font-bold"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`;

function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer automatically on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setIsDrawerOpen(false);
    navigate("/");
  };

  const showDashboard = Boolean(user) && pathname !== "/dashboard";

  return (
    <>
      {/* TOP NAVBAR CONTAINER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 text-white backdrop-blur-xl transition-all duration-200">
        <div className="mx-auto w-full max-w-[1720px] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            {/* BRAND LOGO & TITLE */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex items-center gap-2.5 text-left transition-all duration-200 active:scale-95"
            >
              <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-400/30 bg-slate-900 shadow-md shadow-amber-500/10 transition-transform group-hover:scale-105">
                <img
                  src="https://i.ibb.co/0yYptF9d/website-logo.png"
                  alt="Premium Barber Shop Logo"
                  className="h-full w-full object-contain p-0.5"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm sm:text-base font-extrabold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    BarberShop
                  </span>
                  <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="truncate text-[10px] text-amber-400/90 font-medium tracking-wide">
                  Modern Grooming Studio
                </p>
              </div>
            </button>

            {/* DESKTOP NAVIGATION LINKS */}
            <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Desktop Navigation">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* RIGHT SIDE ACTIONS */}
            <div className="flex items-center gap-2">
              {/* Direct Call Quick Action on Mobile & Desktop */}
              <a
                href="tel:+919934630687"
                title="Direct Support Call: +91 9934630687"
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-sm transition-all hover:bg-amber-400 hover:text-slate-950 active:scale-95"
              >
                <Phone className="h-4 w-4" />
              </a>

              {/* Desktop User Status & Auth CTAs */}
              <div className="hidden md:flex items-center gap-2">
                {showDashboard && (
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="rounded-full border border-amber-300/30 bg-white/5 px-4 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/15 hover:text-amber-100"
                  >
                    Dashboard
                  </button>
                )}

                {user ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/profile")}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:border-amber-400/40 hover:bg-white/10 transition"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-[11px] font-bold text-amber-300">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <span className="max-w-[100px] truncate font-medium">{user.name}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 transition"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/register")}
                      className="rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-400/20 hover:bg-amber-300 transition active:scale-95"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>

              {/* Mobile Quick User Chip */}
              {user ? (
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/15 text-amber-300 text-xs font-bold active:scale-95"
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
                  className="flex md:hidden items-center justify-center rounded-xl bg-amber-400 px-3 py-2 text-[11px] font-bold text-slate-950 shadow-sm active:scale-95"
                >
                  Login
                </button>
              )}

              {/* Hamburger Button for Mobile Drawer */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen((prev) => !prev)}
                aria-label={isDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isDrawerOpen}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition active:scale-90"
              >
                {isDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER DRAWER BACKDROP */}
      <div
        className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* MOBILE SLIDE-OVER DRAWER SHEET */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col border-l border-white/10 bg-slate-950/95 shadow-2xl shadow-black backdrop-blur-2xl transition-transform duration-300 ease-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* DRAWER TOP HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Navigation</p>
              <p className="text-[10px] text-slate-400">BarberShop App</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* USER PROFILE CARD IN DRAWER */}
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
                    setIsDrawerOpen(false);
                    navigate("/login");
                  }}
                  className="flex-1 rounded-xl bg-amber-400 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-400/20"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
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

        {/* SCROLLABLE MENU ITEMS */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Explore</p>

          <NavLink
            to="/"
            onClick={() => setIsDrawerOpen(false)}
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
            onClick={() => setIsDrawerOpen(false)}
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
            onClick={() => setIsDrawerOpen(false)}
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
            onClick={() => setIsDrawerOpen(false)}
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

          {/* USER SPECIFIC SECTIONS */}
          {user && (
            <>
              <div className="pt-3">
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">My Account</p>
              </div>

              <NavLink
                to="/dashboard"
                onClick={() => setIsDrawerOpen(false)}
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
                onClick={() => setIsDrawerOpen(false)}
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
                onClick={() => setIsDrawerOpen(false)}
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
                onClick={() => setIsDrawerOpen(false)}
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
            onClick={() => setIsDrawerOpen(false)}
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

        {/* DRAWER FOOTER */}
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
                  setIsDrawerOpen(false);
                  navigate("/login");
                }}
                className="flex-1 rounded-xl bg-amber-400 py-2.5 text-xs font-bold text-slate-950"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
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