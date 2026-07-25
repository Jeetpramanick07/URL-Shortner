import { NavLink } from 'react-router-dom'
import {
  Activity,
  CircleGauge,
  Database,
  Globe2,
  Link2,
  PlusCircle,
  Settings,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: CircleGauge, end: true },
  { to: '/create', label: 'Create Link', icon: PlusCircle },
  { to: '/links', label: 'All Links', icon: Link2 },
  { to: '/analytics', label: 'Analytics', icon: Activity },
  { to: '/domains', label: 'Domains', icon: Globe2 },
  { to: '/activity', label: 'Activity', icon: Database },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <div className={`mobile-backdrop ${mobileOpen ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand-row">
          <span className="brand-mark"><Link2 size={20} /></span>
          <div>
            <div className="brand-title">LinkOrbit</div>
            <div className="brand-subtitle">Smart Link SaaS</div>
          </div>
          <button className="icon-button mobile-close" onClick={onClose} aria-label="Close navigation"><X size={20} /></button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
