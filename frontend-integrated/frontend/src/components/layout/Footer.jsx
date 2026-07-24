import { Link } from 'react-router-dom'
import { Link2 } from 'lucide-react'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Benefits', href: '/#benefits' },
      { label: 'Pricing', href: '/#pricing' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Log in', href: '/login' },
      { label: 'Sign up', href: '/signup' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API status', href: '#' },
      { label: 'Support', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <span className="brand-mark-row"><span className="brand-mark"><Link2 size={18} /></span><span className="brand-title">LinkOrbit</span></span>
          <p>Smart, trackable Amazon links with rotating keywords and privacy-first analytics.</p>
        </div>
        <div className="footer-columns">
          {columns.map((column) => (
            <div key={column.title}>
              <strong>{column.title}</strong>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}><Link to={link.href}>{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} LinkOrbit. All rights reserved.</span>
      </div>
    </footer>
  )
}
