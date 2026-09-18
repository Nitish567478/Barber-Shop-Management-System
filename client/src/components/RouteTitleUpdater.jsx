import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { trackPageView } from '../utils/googleAnalytics';

const APP_NAME = 'BarberShop';
const HOME_TITLE = 'Premium Barber Shop | Modern Grooming Studio Worldwide';

const ROUTE_CONFIG = [
  { path: '/', title: HOME_TITLE, exact: true },
  { path: '/services', title: `Our Services & Pricing | ${APP_NAME}`, exact: true },
  { path: '/barbers', title: `Stylists & Partner Salons | ${APP_NAME}`, exact: true },
  { path: '/book-appointment', title: `Book an Appointment | ${APP_NAME}`, exact: true },
  { path: '/login', title: `Sign In to Your Account | ${APP_NAME}`, exact: true },
  { path: '/register', title: `Create an Account | ${APP_NAME}`, exact: true },
  { path: '/verify-email', title: `Verify Your Email | ${APP_NAME}`, exact: true },
  { path: '/forgot-password', title: `Forgot Password | ${APP_NAME}`, exact: true },
  { path: '/reset-password', title: `Reset Your Password | ${APP_NAME}`, exact: false },
  { path: '/payment', title: `Secure Payment Checkout | ${APP_NAME}`, exact: false },
  { path: '/profile', title: `My Profile | ${APP_NAME}`, exact: true },
  { path: '/my-appointments', title: `My Appointments | ${APP_NAME}`, exact: true },
  { path: '/my-invoices', title: `My Invoices & Receipts | ${APP_NAME}`, exact: true },
  { path: '/settings', title: `Account Settings | ${APP_NAME}`, exact: true },
  { path: '/about', title: `About Us | ${APP_NAME}`, exact: true },
  { path: '/help', title: `Help & Support | ${APP_NAME}`, exact: true },
  { path: '/privacy-policy', title: `Privacy Policy | ${APP_NAME}`, exact: true },
  { path: '/terms-conditions', title: `Terms & Conditions | ${APP_NAME}`, exact: true },
];

export const getTitleForPath = (pathname, userRole) => {
  // Role-sensitive dashboard title
  if (pathname === '/dashboard') {
    if (userRole === 'admin') return `Master Admin Dashboard | ${APP_NAME}`;
    if (userRole === 'barber') return `Barber Partner Dashboard | ${APP_NAME}`;
    return `Customer Dashboard | ${APP_NAME}`;
  }

  // Exact path match
  const exactMatch = ROUTE_CONFIG.find((item) => item.exact && item.path === pathname);
  if (exactMatch) {
    return exactMatch.title;
  }

  // Prefix match for nested/parameterized paths (e.g. /payment/:appointmentId, /reset-password/:token)
  const prefixMatch = ROUTE_CONFIG.find((item) => !item.exact && pathname.startsWith(item.path));
  if (prefixMatch) {
    return prefixMatch.title;
  }

  // 404 fallback
  return `Page Not Found | ${APP_NAME}`;
};

/**
 * RouteTitleUpdater Component
 * Automatically updates document.title whenever the route or user role changes.
 */
const RouteTitleUpdater = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const newTitle = getTitleForPath(location.pathname, user?.role);
    document.title = newTitle;
    trackPageView(location.pathname, newTitle);
  }, [location.pathname, user?.role]);

  return null;
};

export default RouteTitleUpdater;
