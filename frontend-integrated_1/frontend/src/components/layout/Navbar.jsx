import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Link2, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../common/Button'

const links = [
  { to: '/#features', label: 'Features' },
  { to: '/#benefits', label: 'Benefits' },
  { to: '/#pricing', label: 'Pricing' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  return (
    <header className="site-navbar">
      <div className="site-navbar-inner">
        <Link to="/" className="brand-mark-row" onClick={() => setOpen(false)}>
          <span className="brand-mark"><Link2 size={18} /></span>
          <span className="brand-title">LinkOrbit</span>
        </Link>

        <nav className={`site-nav-links ${open ? 'open' : ''}`}>
          {links.map((link) => (
            <a key={link.to} href={link.to} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
          <div className="site-nav-actions">
            {isAuthenticated ? (
              <Button as={Link} to="/dashboard" variant="primary" size="sm">Go to Dashboard</Button>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost" size="sm">Log in</Button>
                <Button as={Link} to="/signup" variant="primary" size="sm">Sign up free</Button>
              </>
            )}
          </div>
        </nav>

        <button className="icon-button nav-toggle" onClick={() => setOpen((v) => !v)} aria-label="Toggle navigation">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}
