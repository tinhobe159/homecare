import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";

// Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import AdminLayout from "./components/admin/AdminLayout";

// Pages
import Homepage from "./pages/customer/Homepage";
import PackagesPage from "./pages/customer/PackagesPage";
import PackageDetails from "./pages/customer/PackageDetails";
import BookingPage from "./pages/customer/BookingPage";
import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CaregiversPage from "./pages/customer/CaregiversPage";
import CaregiverDetailsPage from "./pages/customer/CaregiverDetailsPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCaregivers from "./pages/admin/AdminCaregivers";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminServices from "./pages/admin/AdminServices";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminUserRequests from "./pages/admin/AdminUserRequests";
import AdminScheduledPackages from "./pages/admin/AdminScheduledPackages";
import CaregiverManagement from "./pages/admin/CaregiverManagement";
import CaregiverAvailability from "./pages/admin/CaregiverAvailability";

// Wrapper component to conditionally render Navbar
const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <div className={`${isAdminPage ? 'h-screen' : 'min-h-screen'} flex flex-col bg-gray-50`}>
      {!isAdminPage && <Navbar />}
      <main className={isAdminPage ? "flex-1" : "flex-grow"}>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/packages/:id" element={<PackageDetails />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/caregivers" element={<CaregiversPage />} />
          <Route path="/caregivers/:id" element={<CaregiverDetailsPage />} />

          {/* Admin Login Route (outside layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="caregivers" element={<CaregiverManagement />} />
            <Route path="caregivers/:id/availability" element={<CaregiverAvailability />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="scheduled-packages" element={<AdminScheduledPackages />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="user-requests" element={<AdminUserRequests />} />
          </Route>

          {/* Add more routes as needed */}
          <Route
            path="/payments"
            element={
              <div className="p-8 text-center">
                Payments page coming soon...
              </div>
            }
          />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;