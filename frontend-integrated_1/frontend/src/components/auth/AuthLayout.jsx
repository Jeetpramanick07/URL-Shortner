import { Link } from 'react-router-dom'
import { Link2, ShieldCheck, Sparkles, Zap } from 'lucide-react'

const highlights = [
  { icon: Zap, text: 'Rotating keyword links that route straight to Amazon.' },
  { icon: ShieldCheck, text: 'Privacy-first analytics — no raw IPs ever stored.' },
  { icon: Sparkles, text: 'Real-time click, device and bot-filtering insights.' },
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <Link to="/" className="brand-mark-row">
          <span className="brand-mark"><Link2 size={18} /></span>
          <span className="brand-title">LinkOrbit</span>
        </Link>

        <div className="auth-form-wrap">
          <h1>{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </div>

      <div className="auth-showcase">
        <div className="auth-showcase-content">
          <span className="eyebrow">Built for performance marketers</span>
          <h2>Every click, tracked. Every keyword, rotated automatically.</h2>
          <ul>
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text}><Icon size={18} /><span>{text}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
