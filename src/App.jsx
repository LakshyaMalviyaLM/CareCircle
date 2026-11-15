import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CareProvider } from './context/CareContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import MedicationsPage from './pages/MedicationsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import CareCirclePage from './pages/CareCirclePage';
import AnalyticsPage from './pages/AnalyticsPage';
import VitalsPage from './pages/VitalsPage';
import DoctorConnectPage from './pages/DoctorConnectPage';
import EmergencyPage from './pages/EmergencyPage';
import SettingsPage from './pages/SettingsPage';

// Auto-route Supabase recovery redirects to HashRouter path
if (typeof window !== 'undefined') {
  if (window.location.pathname === '/reset-password') {
    const existingHash = window.location.hash || '';
    window.history.replaceState(null, '', `/#/reset-password${existingHash}`);
  } else if (
    window.location.hash &&
    window.location.hash.includes('type=recovery') &&
    !window.location.hash.startsWith('#/reset-password')
  ) {
    const tokens = window.location.hash.replace(/^#/, '');
    window.history.replaceState(null, '', `/#/reset-password#${tokens}`);
  }
}

export default function App() {
  return (
    <AuthProvider>
      <CareProvider>
        <HashRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Private Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="overview" element={<Navigate to="/" replace />} />
                <Route path="medications" element={<MedicationsPage />} />
                <Route path="vitals" element={<VitalsPage />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="doctors" element={<DoctorConnectPage />} />
                <Route path="care-circle" element={<CareCirclePage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="emergency" element={<EmergencyPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </CareProvider>
    </AuthProvider>
  );
}
