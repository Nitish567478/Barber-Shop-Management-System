import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import AppLayout from './components/AppLayout';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BarberDashboard from './pages/BarberDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookAppointment from './pages/BookAppointment';
import ProfilePage from './pages/ProfilePage';
import MyAppointments from './pages/MyAppointments';
import MyInvoices from './pages/MyInvoices';
import ServicesPage from './pages/ServicesPage';
import BarbersPage from './pages/BarbersPage';
import SettingsPage from './pages/SettingsPage';
import HelpSupportPage from './pages/HelpSupportPage';

// Styles
import './styles/globals.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Role-Based Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute
                    customer={<Dashboard />}
                    barber={<BarberDashboard />}
                    admin={<AdminDashboard />}
                  />
                </ProtectedRoute>
              }
            />

            {/* Customer Protected Routes */}
            <Route
              path="/book-appointment"
              element={
                <ProtectedRoute>
                  <BookAppointment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-appointments"
              element={
                <ProtectedRoute>
                  <MyAppointments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-invoices"
              element={
                <ProtectedRoute>
                  <MyInvoices />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Semi-Public Routes (accessible but better with login) */}
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/barbers" element={<BarbersPage />} />
            <Route path="/help" element={<HelpSupportPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
