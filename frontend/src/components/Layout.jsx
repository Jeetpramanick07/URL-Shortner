import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Activity,
  Bell,
  CircleGauge,
  CloudCheck,
  Database,
  Globe2,
  Link2,
  Menu,
  Orbit,
  PlusCircle,
  Search,
  Settings,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: CircleGauge, end: true },
  { to: '/links/new', label: 'Create Link', icon: PlusCircle },
  { to: '/links', label: 'All Links', icon: Link2 },
  { to: '/analytics', label: 'Analytics', icon: Activity },
  { to: '/domains', label: 'Domains', icon: Globe2 },
  { to: '/activity', label: 'Activity', icon: Database },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const pageTitles = {
  '/': 'Dashboard Overview',
  '/links/new': 'Create Smart Link',
  '/links': 'All Smart Links',
  '/analytics': 'Analytics',
  '/domains': 'Domains',
  '/activity': 'Activity',
  '/settings': 'Settings',
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = location.pathname.startsWith('/links/') && location.pathname.includes('/analytics')
    ? 'Link Analytics'
    : pageTitles[location.pathname] || 'LinkOrbit'

  return (
    <div className="app-shell">
      <div className={`mobile-backdrop ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><Orbit size={22} /></div>
          <div>
            <div className="brand-title">LinkOrbit</div>
            <div className="brand-subtitle">Smart Link SaaS</div>
          </div>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="backend-card glass-card">
          <div className="backend-status-line">
            <CloudCheck size={19} />
            <div>
              <strong>Backend Online</strong>
              <span>Development</span>
            </div>
          </div>
          <div className="status-progress"><span /></div>
          <small>API connected</small>
        </div>
      </aside>

      <main className="main-canvas">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
            <div>
              <div className="mobile-page-title">{title}</div>
              <div className="global-search">
                <Search size={17} />
                <input placeholder="Search short URLs, ASINs, or keywords..." />
              </div>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications"><Bell size={19} /></button>
            <div className="api-pill"><span /> API</div>
            <div className="profile-copy">
              <strong>Admin User</strong>
              <small>Super Admin</small>
            </div>
            <div className="avatar">AU</div>
          </div>
        </header>
        <div className="page-wrap"><Outlet /></div>
      </main>
    </div>
  )
}
