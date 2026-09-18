import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import GuestRoute from "./components/GuestRoute";
import AppLayout from "./components/AppLayout";
import CookieBanner from "./components/CookieBanner";
import NotFound from "./components/NotFound";
import OfflineNotice from "./components/OfflineNotice";
import BarberShopLoader from "./components/BarberShopLoader";
import RouteTitleUpdater from "./components/RouteTitleUpdater";

/* ===================================================
   LAZY PAGE IMPORTS
=================================================== */

const HomePage = React.lazy(() => import("./pages/HomePage"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = React.lazy(() =>
  import("./pages/ForgotPassword")
);
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const PaymentPage = React.lazy(() => import("./pages/PaymentPage"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const BarberDashboard = React.lazy(() => import("./pages/BarberDashboard"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const BookAppointment = React.lazy(() =>import("./pages/BookAppointment"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const MyAppointments = React.lazy(() => import("./pages/MyAppointments"));
const MyInvoices = React.lazy(() => import("./pages/MyInvoices"));
const ServicesPage = React.lazy(() => import("./pages/ServicesPage"));
const BarbersPage = React.lazy(() => import("./pages/BarbersPage"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage"));
const HelpSupportPage = React.lazy(() => import("./pages/HelpSupportPage"));
const AboutUs = React.lazy(() => import("./pages/AboutUs"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = React.lazy(() => import("./pages/TermsConditions"));
import "./styles/globals.css";

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg text-amber-400"></div>
        <div className="mt-4 text-sm uppercase tracking-[0.25em] text-slate-300"><BarberShopLoader /></div>
      </div>
    </div>
  );
}


function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <RouteTitleUpdater />
        <CookieBanner />
        <OfflineNotice />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* MAIN LAYOUT */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                }
              />
              <Route
                path="/verify-email"
                element={
                  <GuestRoute>
                    <VerifyEmail />
                  </GuestRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <GuestRoute>
                    <ForgotPassword />
                  </GuestRoute>
                }
              />
              <Route
                path="/reset-password/:token"
                element={
                  <GuestRoute>
                    <ResetPassword />
                  </GuestRoute>
                }
              />
              <Route path="/payment-coming-soon" element={<Navigate to="/payment" replace />} />
              <Route
                path="/payment"
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/:appointmentId"
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/services" element={<ServicesPage />}/>
              <Route path="/barbers" element={<BarbersPage />}/>
              <Route path="/about" element={<AboutUs />}/>
              <Route path="/help" element={<HelpSupportPage />}/>
              <Route path="/privacy-policy" element={<PrivacyPolicy />}/>
              <Route path="/terms-conditions" element={<TermsConditions />}/>
              <Route path="/dashboard"
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

              <Route path="/book-appointment"
                element={
                  <ProtectedRoute>
                    <BookAppointment />
                  </ProtectedRoute>
                }
              />

              <Route path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route path="/my-appointments"
                element={
                  <ProtectedRoute>
                    <MyAppointments />
                  </ProtectedRoute>
                }
              />

              <Route path="/my-invoices"
                element={
                  <ProtectedRoute>
                    <MyInvoices />
                  </ProtectedRoute>
                }
              />

              <Route path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
