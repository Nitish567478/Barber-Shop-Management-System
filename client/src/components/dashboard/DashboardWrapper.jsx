import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

const DashboardWrapper = ({
  role = 'customer',
  activeTab = 'overview',
  onTabChange = () => {},
  badges = {},
  notificationsData = null,
  title = '',
  subtitle = '',
  searchValue = '',
  onSearchChange = null,
  searchPlaceholder = 'Search...',
  onRefresh = null,
  isRefreshing = false,
  lastUpdated = null,
  headerActions = null,
  customSidebarHeader = null,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* SIDEBAR */}
      <DashboardSidebar
        role={role}
        activeTab={activeTab}
        onTabChange={onTabChange}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        badges={badges}
        customHeader={customSidebarHeader}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <DashboardHeader
          role={role}
          title={title}
          subtitle={subtitle}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          notificationsData={notificationsData}
          actions={headerActions}
        />

        {/* BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardWrapper;
