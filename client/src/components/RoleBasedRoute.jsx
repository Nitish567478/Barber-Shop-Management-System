import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ customer, barber, admin }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'barber':
      return barber || customer;
    case 'admin':
      return admin || customer;
    case 'customer':
    default:
      return customer;
  }
};

export default RoleBasedRoute;
