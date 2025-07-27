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
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCaregivers from "./pages/admin/AdminCaregivers";
import AdminAppointments from "./pages/admin/AdminAppointments";

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

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/caregivers" element={<AdminCaregivers />} />
              <Route
                path="/admin/appointments"
                element={<AdminAppointments />}
              />

              {/* Add more routes as needed */}
              <Route
                path="/caregivers"
                element={
                  <div className="p-8 text-center">
                    Caregivers page coming soon...
                  </div>
                }
              />
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
