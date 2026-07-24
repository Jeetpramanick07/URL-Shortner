import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'

import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Login/LoginPage'
import SignupPage from './pages/Signup/SignupPage'
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import CreateLinkPage from './pages/Links/CreateLinkPage'
import LinksPage from './pages/Links/LinksPage'
import AnalyticsPage from './pages/Analytics/AnalyticsPage'
import DomainsPage from './pages/Domains/DomainsPage'
import ActivityPage from './pages/Activity/ActivityPage'
import SettingsPage from './pages/Settings/SettingsPage'
import NotFoundPage from './pages/NotFound/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="create" element={<CreateLinkPage />} />
          <Route path="links" element={<LinksPage />} />
          <Route path="links/:id/edit" element={<CreateLinkPage />} />
          <Route path="links/:id/analytics" element={<AnalyticsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="domains" element={<DomainsPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="home" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
