import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";

// Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
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


              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/caregivers" element={<CaregiverManagement />} />
              <Route path="/admin/caregivers/:id/availability" element={<CaregiverAvailability />} />
              <Route path="/admin/appointments" element={<AdminAppointments />} />
              <Route path="/admin/scheduled-packages" element={<AdminScheduledPackages />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/packages" element={<AdminPackages />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="/admin/user-requests" element={<AdminUserRequests />} />

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
          <Footer />
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
