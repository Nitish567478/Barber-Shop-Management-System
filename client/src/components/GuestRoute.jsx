import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route wrapper that prevents authenticated users from viewing guest-only pages
 * (Login, Register, ForgotPassword, ResetPassword).
 * If an authenticated user clicks the browser Back button or enters /login,
 * they are immediately redirected to their dashboard with replace: true.
 */
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return children;
};

export default GuestRoute;
