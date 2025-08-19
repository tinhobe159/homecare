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
import FamilyLogin from "./pages/customer/FamilyLogin";
import FamilyDashboard from "./pages/customer/FamilyDashboard";
import FamilySatisfactionSurvey from "./pages/customer/FamilySatisfactionSurvey";
import CaregiversPage from "./pages/customer/CaregiversPage";
import CaregiverDetailsPage from "./pages/customer/CaregiverDetailsPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminCustomers from "./pages/admin/AdminCustomers";

import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminServices from "./pages/admin/AdminServices";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminUserRequests from "./pages/admin/AdminUserRequests";
import AdminScheduledPackages from "./pages/admin/AdminScheduledPackages";
import CaregiverManagement from "./pages/admin/CaregiverManagement";
import CaregiverAvailability from "./pages/admin/CaregiverAvailability";
import SupervisorVerificationDashboard from "./pages/admin/SupervisorVerificationDashboard";
import PerformanceDashboard from "./pages/admin/PerformanceDashboard";
import PayrollDashboard from "./pages/admin/PayrollDashboard";
import InsuranceBillingDashboard from "./pages/admin/InsuranceBillingDashboard";
import AdvancedAnalyticsDashboard from "./pages/admin/AdvancedAnalyticsDashboard";
import CustomReportBuilder from "./pages/admin/CustomReportBuilder";
import AICarePlanDashboard from "./pages/admin/AICarePlanDashboard";
import AISchedulingDashboard from "./pages/admin/AISchedulingDashboard";
import AIDocumentationAssistant from "./pages/admin/AIDocumentationAssistant";
import QualityAssuranceDashboard from "./pages/admin/QualityAssuranceDashboard";
import EnhancedRecurringScheduleDashboard from "./pages/admin/EnhancedRecurringScheduleDashboard";
import IoTDashboard from "./pages/admin/IoTDashboard";
import SmartHealthMonitoring from "./pages/admin/SmartHealthMonitoring";

// Caregiver Pages
import CaregiverLogin from "./pages/caregiver/CaregiverLogin";
import CaregiverDashboard from "./pages/caregiver/CaregiverDashboard";
import CaregiverSchedule from "./pages/caregiver/CaregiverSchedule";
import CaregiverCarePlans from "./pages/caregiver/CaregiverCarePlans";
import CaregiverTimesheet from "./pages/caregiver/CaregiverTimesheet";
import CaregiverProfile from "./pages/caregiver/CaregiverProfile";
import CaregiverAppointmentDetail from "./pages/caregiver/CaregiverAppointmentDetail";
import CaregiverEVVPage from "./pages/caregiver/CaregiverEVVPage";

// Test Pages
import EVVTestPage from "./pages/EVVTestPage";

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
          
          {/* Family Portal Routes */}
          <Route path="/family-login" element={<FamilyLogin />} />
          <Route path="/family-dashboard" element={<FamilyDashboard />} />
          <Route path="/family-survey" element={<FamilySatisfactionSurvey />} />
          
          {/* Test Routes */}
          <Route path="/test/evv" element={<EVVTestPage />} />

          {/* Caregiver Routes */}
          <Route path="/caregiver/login" element={<CaregiverLogin />} />
          <Route path="/caregiver/dashboard" element={<CaregiverDashboard />} />
          <Route path="/caregiver/schedule" element={<CaregiverSchedule />} />
          <Route path="/caregiver/care-plans" element={<CaregiverCarePlans />} />
          <Route path="/caregiver/timesheet" element={<CaregiverTimesheet />} />
          <Route path="/caregiver/profile" element={<CaregiverProfile />} />
          <Route path="/caregiver/appointment/:id" element={<CaregiverAppointmentDetail />} />
          <Route path="/caregiver/evv/:id" element={<CaregiverEVVPage />} />

          {/* Admin Login Route (outside layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="caregivers" element={<CaregiverManagement />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="caregivers/:id/availability" element={<CaregiverAvailability />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="scheduled-packages" element={<AdminScheduledPackages />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="user-requests" element={<AdminUserRequests />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="supervisor-verification" element={<SupervisorVerificationDashboard />} />
            <Route path="performance-dashboard" element={<PerformanceDashboard />} />
            <Route path="payroll" element={<PayrollDashboard />} />
            <Route path="insurance-billing" element={<InsuranceBillingDashboard />} />
            <Route path="analytics" element={<AdvancedAnalyticsDashboard />} />
            <Route path="reports" element={<CustomReportBuilder />} />
            <Route path="quality-assurance" element={<QualityAssuranceDashboard />} />
            <Route path="recurring-schedules" element={<EnhancedRecurringScheduleDashboard />} />
            <Route path="iot-dashboard" element={<IoTDashboard />} />
            <Route path="smart-health" element={<SmartHealthMonitoring />} />
            <Route path="ai-care-plans" element={<AICarePlanDashboard />} />
            <Route path="ai-scheduling" element={<AISchedulingDashboard />} />
            <Route path="ai-documentation" element={<AIDocumentationAssistant />} />
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