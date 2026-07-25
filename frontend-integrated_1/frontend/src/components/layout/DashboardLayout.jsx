import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Bell, Menu, Search } from 'lucide-react'
import Sidebar from './Sidebar'
import ProfileDropdown from './ProfileDropdown'

const pageTitles = {
  '/dashboard': 'Dashboard Overview',
  '/create': 'Create Smart Link',
  '/links': 'All Smart Links',
  '/analytics': 'Analytics',
  '/domains': 'Domains',
  '/activity': 'Activity',
  '/settings': 'Settings',
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = location.pathname.includes('/analytics') && location.pathname !== '/analytics'
    ? 'Link Analytics'
    : pageTitles[location.pathname] || 'LinkOrbit'

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="main-canvas">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
            <div>
              <div className="mobile-page-title">{title}</div>
              <div className="global-search">
                <Search size={16} />
                <input placeholder="Search short URLs, ASINs, or keywords…" />
              </div>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications"><Bell size={19} /></button>
            <ProfileDropdown />
          </div>
        </header>
        <div className="page-wrap"><Outlet /></div>
      </main>
    </div>
  )
}
