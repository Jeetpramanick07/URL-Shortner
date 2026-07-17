import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import CreateLinkPage from './pages/CreateLinkPage'
import LinksPage from './pages/LinksPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import DomainsPage from './pages/DomainsPage'
import ActivityPage from './pages/ActivityPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="links/new" element={<CreateLinkPage />} />
        <Route path="links" element={<LinksPage />} />
        <Route path="links/:id/edit" element={<CreateLinkPage />} />
        <Route path="links/:id/analytics" element={<AnalyticsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="domains" element={<DomainsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
