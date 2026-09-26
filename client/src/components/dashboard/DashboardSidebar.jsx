import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  Scissors,
  Receipt,
  Gift,
  Sparkles,
  Store,
  User,
  Settings,
  HelpCircle,
  Clock,
  Tag,
  Star,
  ShieldCheck,
  Users,
  AlertTriangle,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Zap,
  Landmark,
} from 'lucide-react';

const ROLE_CONFIG = {
  customer: {
    title: 'Customer Space',
    subtitle: 'Self-Service Hub',
    badge: 'Customer',
    badgeClass: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    activeTabClass: 'bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-400/20',
    hoverClass: 'hover:bg-amber-400/10 hover:text-amber-200',
    sections: [
      {
        title: 'Dashboard',
        items: [
          { key: 'overview', label: 'Overview', icon: LayoutDashboard, type: 'tab' },
          { key: 'my-appointments', label: 'My Appointments', icon: Calendar, path: '/my-appointments', type: 'link' },
          { key: 'book-appointment', label: 'Book Appointment', icon: Scissors, path: '/barbers', type: 'link', highlight: true },
          { key: 'my-invoices', label: 'My Invoices', icon: Receipt, path: '/my-invoices', type: 'link' },
          { key: 'vouchers', label: 'Smile Vouchers', icon: Gift, type: 'tab', badgeKey: 'vouchersCount' },
        ],
      },
      {
        title: 'Explore',
        items: [
          { key: 'services', label: 'Services Menu', icon: Sparkles, path: '/services', type: 'link' },
          { key: 'barbers', label: 'Explore Barbers', icon: Store, path: '/barbers', type: 'link' },
        ],
      },
      {
        title: 'Account',
        items: [
          { key: 'profile', label: 'My Profile', icon: User, path: '/profile', type: 'link' },
          { key: 'settings', label: 'Settings', icon: Settings, path: '/settings', type: 'link' },
          { key: 'help', label: 'Help & Support', icon: HelpCircle, path: '/help', type: 'link' },
        ],
      },
    ],
  },
  barber: {
    title: 'Barber Studio',
    subtitle: 'Partner Portal',
    badge: 'Barber Partner',
    badgeClass: 'bg-sky-400/10 text-sky-300 border-sky-400/20',
    activeTabClass: 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-semibold shadow-lg shadow-amber-400/25',
    hoverClass: 'hover:bg-white/10 hover:text-white',
    sections: [
      {
        title: 'Operations',
        items: [
          { key: 'overview', label: 'Overview & Stats', icon: LayoutDashboard, type: 'tab' },
          { key: 'today', label: "Today's Bookings", icon: Clock, type: 'tab', badgeKey: 'todayCount', badgeColor: 'bg-sky-400 text-slate-950' },
          { key: 'bookings', label: 'All Bookings', icon: CalendarCheck, type: 'tab', badgeKey: 'totalBookings' },
          { key: 'payout', label: 'Bank & UPI Accounts', icon: Landmark, type: 'tab' },
          { key: 'profile', label: 'Shop Profile & Hours', icon: Store, type: 'tab' },
        ],
      },
      {
        title: 'Menu & Growth',
        items: [
          { key: 'services', label: 'Services & Pricing', icon: Scissors, type: 'tab', badgeKey: 'servicesCount' },
          { key: 'coupons', label: 'Smile Coupons', icon: Tag, type: 'tab', badgeKey: 'couponsCount' },
          { key: 'feedback', label: 'Reviews & Feedback', icon: Star, type: 'tab', badgeKey: 'reviewsCount' },
        ],
      },
      {
        title: 'Account',
        items: [
          { key: 'user-profile', label: 'Profile Settings', icon: User, path: '/profile', type: 'link' },
          { key: 'settings', label: 'Shop Settings', icon: Settings, path: '/settings', type: 'link' },
          { key: 'help', label: 'Support & FAQs', icon: HelpCircle, path: '/help', type: 'link' },
        ],
      },
    ],
  },
  admin: {
    title: 'Control Center',
    subtitle: 'System Console',
    badge: 'Master Admin',
    badgeClass: 'bg-violet-400/10 text-violet-300 border-violet-400/20',
    activeTabClass: 'bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-400/25',
    hoverClass: 'hover:bg-white/10 hover:text-white',
    sections: [
      {
        title: 'Management',
        items: [
          { key: 'overview', label: 'Overview Analytics', icon: ShieldCheck, type: 'tab' },
          { key: 'bookings', label: 'Bookings & Orders', icon: CalendarCheck, type: 'tab', badgeKey: 'totalBookings' },
          { key: 'barbers', label: 'Barber Approvals', icon: Scissors, type: 'tab', badgeKey: 'pendingBarbers', badgeColor: 'bg-amber-400 text-slate-950 animate-pulse' },
          { key: 'customers', label: 'Customer Directory', icon: Users, type: 'tab', badgeKey: 'customersCount' },
        ],
      },
      {
        title: 'Platform',
        items: [
          { key: 'services', label: 'Services Catalog', icon: Sparkles, type: 'tab' },
          { key: 'reports', label: 'Reports & Safety', icon: AlertTriangle, type: 'tab', badgeKey: 'openReports', badgeColor: 'bg-rose-500 text-white animate-pulse' },
          { key: 'finance', label: 'Finance & Invoices', icon: IndianRupee, type: 'tab' },
          { key: 'settings', label: 'Platform Settings', icon: Settings, type: 'tab' },
        ],
      },
      {
        title: 'Account',
        items: [
          { key: 'profile', label: 'Admin Profile', icon: User, path: '/profile', type: 'link' },
          { key: 'help', label: 'Help & Docs', icon: HelpCircle, path: '/help', type: 'link' },
        ],
      },
    ],
  },
};

const DashboardSidebar = ({
  role = 'customer',
  activeTab = 'overview',
  onTabChange = () => {},
  collapsed = false,
  setCollapsed = () => {},
  isMobileOpen = false,
  setIsMobileOpen = () => {},
  badges = {},
  customHeader = null,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const config = ROLE_CONFIG[role] || ROLE_CONFIG.customer;

  const handleItemClick = (item) => {
    if (item.type === 'tab') {
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard', { state: { activeTab: item.key } });
      } else {
        onTabChange(item.key);
      }
      setIsMobileOpen(false);
    } else if (item.type === 'link' && item.path) {
      setIsMobileOpen(false);
      navigate(item.path);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const renderSidebarContent = () => (
    <div className="flex min-h-full flex-col justify-between">
      {/* TOP: Brand & Role */}
      <div>
        <div className={`border-b border-white/10 p-5 ${collapsed ? 'text-center' : ''}`}>
          <div className="flex items-center justify-between">
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-400/20 to-amber-500/10 text-amber-300 shadow-sm shadow-amber-950/40">
                  {role === 'admin' ? (
                    <ShieldCheck size={22} className="text-amber-300" />
                  ) : role === 'barber' ? (
                    <Scissors size={20} className="text-amber-300" />
                  ) : (
                    <Zap size={20} className="text-amber-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-white tracking-tight">
                    {config.title}
                  </h2>
                  <p className="truncate text-xs uppercase tracking-wider text-slate-400">
                    {config.subtitle}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/15 text-amber-300">
                {role === 'admin' ? (
                  <ShieldCheck size={20} />
                ) : role === 'barber' ? (
                  <Scissors size={18} />
                ) : (
                  <Zap size={18} />
                )}
              </div>
            )}

            {/* Close button on mobile */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-xl border border-white/10 p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {!collapsed && (
            <div className="mt-3 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.badgeClass}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {config.badge}
              </span>
              <span className="text-[11px] text-slate-400">Barabar Shop</span>
            </div>
          )}
        </div>

        {/* Custom Header Injection (e.g. Barber Open/Close toggle) */}
        {customHeader && !collapsed && (
          <div className="border-b border-white/10 p-4">{customHeader}</div>
        )}

        {/* NAVIGATION SECTIONS */}
        <nav className="space-y-6 p-3">
        {config.sections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isTabActive =
                  location.pathname === '/dashboard' && item.type === 'tab' && activeTab === item.key;
                const isLinkActive =
                  item.type === 'link' && location.pathname === item.path;
                const isActive = isTabActive || isLinkActive;

                const rawBadge = item.badgeKey ? badges[item.badgeKey] : null;
                const hasBadge = rawBadge !== null && rawBadge !== undefined && Number(rawBadge) > 0;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? config.activeTabClass
                        : `text-slate-300 ${config.hoverClass} hover:bg-white/5`
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon
                      size={19}
                      className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive
                          ? 'text-slate-950'
                          : 'text-slate-400 group-hover:text-amber-300'
                      }`}
                    />

                    {!collapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}

                    {!collapsed && item.highlight && !isActive && (
                      <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                        Quick
                      </span>
                    )}

                    {!collapsed && hasBadge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          item.badgeColor ||
                          'bg-slate-800 text-amber-300 border border-amber-300/30'
                        }`}
                      >
                        {rawBadge}
                      </span>
                    )}

                    {/* Collapsed Badge indicator dot */}
                    {collapsed && hasBadge && (
                      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-slate-950" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      </div>

      {/* BOTTOM: User profile card & Collapse toggle */}
      <div className="border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div
                onClick={() => navigate('/profile')}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-amber-300/30 bg-amber-400/10 text-sm font-bold text-amber-200 hover:border-amber-300"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user?.name || 'User'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div
                onClick={() => navigate('/profile')}
                className="min-w-0 flex-1 cursor-pointer hover:opacity-80"
              >
                <p className="truncate text-xs font-semibold text-white">
                  {user?.name || 'Account'}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-300 transition hover:border-red-400/40 hover:bg-red-500/20 hover:text-red-200"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        {/* Desktop Collapse Toggle Button */}
        <div className="mt-2 hidden lg:flex lg:justify-center">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 py-1.5 text-xs text-slate-400 transition hover:border-white/10 hover:bg-white/10 hover:text-white"
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} />
                <span>Collapse menu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-white/10 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        {renderSidebarContent()}
      </aside>

      {/* MOBILE DRAWER BACKDROP */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* MOBILE DRAWER */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-white/10 bg-slate-950 shadow-2xl shadow-black/80 transition-transform duration-300 ease-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent()}
      </aside>
    </>
  );
};

export default DashboardSidebar;
