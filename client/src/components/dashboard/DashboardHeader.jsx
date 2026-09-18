import React from 'react';
import { Menu, RefreshCw, Sunrise, Sun, Moon, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { label: 'Good morning', Icon: Sunrise };
  if (hour < 17) return { label: 'Good afternoon', Icon: Sun };
  if (hour < 21) return { label: 'Good evening', Icon: Moon };
  return { label: 'Good night', Icon: Moon };
};

const DashboardHeader = ({
  role = 'customer',
  title = '',
  subtitle = '',
  onOpenMobileMenu = () => {},
  searchValue = '',
  onSearchChange = null,
  searchPlaceholder = 'Search...',
  onRefresh = null,
  isRefreshing = false,
  lastUpdated = null,
  notificationsData = null,
  actions = null,
}) => {
  const { user } = useAuth();
  const greeting = getGreeting();
  const GreetingIcon = greeting.Icon;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* LEFT: Mobile hamburger & Greeting / Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                <GreetingIcon size={14} />
                <span>
                  {greeting.label}, {user?.name?.split(' ')[0] || 'User'}
                </span>
              </div>
              {title ? (
                <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {title}
                </h1>
              ) : null}
              {subtitle ? (
                <p className="hidden text-xs text-slate-400 sm:block">{subtitle}</p>
              ) : null}
            </div>
          </div>

          {/* RIGHT: Search, Notifications, Refresh, Custom Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onSearchChange && (
              <div className="relative hidden md:block">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-10 w-48 rounded-xl border border-white/10 bg-slate-900/90 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none transition focus:w-64 focus:border-amber-300/50 focus:ring-1 focus:ring-amber-300/50"
                />
              </div>
            )}

            {/* NOTIFICATION BELL */}
            <NotificationBell role={role} notificationsData={notificationsData} />

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh dashboard data"
                className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-medium text-slate-200 transition hover:border-amber-300/30 hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={`${isRefreshing ? 'animate-spin text-amber-400' : 'text-slate-400'}`}
                />
                <span className="hidden sm:inline">
                  {isRefreshing ? 'Syncing...' : 'Sync'}
                </span>
              </button>
            )}

            {lastUpdated && (
              <span className="hidden xl:inline text-[11px] text-slate-500">
                Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}

            {actions}
          </div>
        </div>

        {/* Mobile Search Input */}
        {onSearchChange && (
          <div className="relative block md:hidden">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-xl border border-white/10 bg-slate-900/90 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none transition focus:border-amber-300/50"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
